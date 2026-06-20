const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Stripe = require("stripe");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();
const bucket = admin.storage().bucket();

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const PAYPAL_CLIENT_ID = defineSecret("PAYPAL_CLIENT_ID");
const PAYPAL_CLIENT_SECRET = defineSecret("PAYPAL_CLIENT_SECRET");
const DJ_ACCESS_CODE = defineSecret("DJ_ACCESS_CODE");
const DJ_ACCESS_USERNAME = defineSecret("DJ_ACCESS_USERNAME");
const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || "sandbox";

const allowedOrigins = new Set([
  "https://www.playproductions.co.uk",
  "https://playproductions.co.uk",
  "http://localhost:5000",
  "http://127.0.0.1:5000"
]);

function json(res, status, body) {
  res.status(status).set("Content-Type", "application/json").send(JSON.stringify(body));
}

function siteOrigin(req) {
  const origin = req.get("origin");
  return allowedOrigins.has(origin) ? origin : "https://www.playproductions.co.uk";
}

function routePath(req) {
  return req.path.replace(/^\/api/, "") || "/";
}

function licenceFor(track, key) {
  const licence = track.licences && track.licences[key];
  if (!licence || licence.enabled === false || !Number.isFinite(Number(licence.price))) {
    throw new Error("That licence is not available.");
  }
  return { key, ...licence, price: Number(licence.price) };
}

async function trackAndLicence(trackId, licenceKey) {
  if (!/^[a-z0-9-]{1,80}$/i.test(trackId || "")) throw new Error("Invalid track.");
  const snap = await db.collection("tracks").doc(trackId).get();
  if (!snap.exists || snap.data().published !== true) throw new Error("Track unavailable.");
  return { trackId, track: snap.data(), licence: licenceFor(snap.data(), licenceKey) };
}

async function savePurchase(data) {
  const purchaseId = data.purchaseId || crypto.randomUUID();
  const downloadToken = crypto.randomBytes(32).toString("hex");
  await db.collection("purchases").doc(purchaseId).set({
    ...data,
    purchaseId,
    downloadTokenHash: crypto.createHash("sha256").update(downloadToken).digest("hex"),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return { purchaseId, downloadToken };
}

async function stripeCheckout(req, res) {
  const { trackId, licenceKey } = req.body || {};
  const { track, licence } = await trackAndLicence(trackId, licenceKey);
  const stripe = new Stripe(STRIPE_SECRET_KEY.value());
  const origin = siteOrigin(req);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: Math.round(licence.price * 100),
        product_data: {
          name: `${track.title} — ${licence.name}`,
          description: licence.summary || "Beat licence from Play Productions"
        }
      }
    }],
    metadata: { trackId, licenceKey },
    success_url: `${origin}/success.html?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/track.html?id=${encodeURIComponent(trackId)}`
  });
  json(res, 200, { url: session.url });
}

async function stripeWebhook(req, res) {
  const stripe = new Stripe(STRIPE_SECRET_KEY.value());
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.get("stripe-signature"),
      STRIPE_WEBHOOK_SECRET.value()
    );
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const existing = await db.collection("purchases").where("providerRef", "==", session.id).limit(1).get();
    if (existing.empty) {
      const { track, licence } = await trackAndLicence(session.metadata.trackId, session.metadata.licenceKey);
      await savePurchase({
        provider: "stripe",
        providerRef: session.id,
        email: session.customer_details?.email || "",
        trackId: session.metadata.trackId,
        trackTitle: track.title,
        licenceKey: session.metadata.licenceKey,
        licenceName: licence.name,
        amount: session.amount_total,
        currency: session.currency,
        status: "paid"
      });
    }
  }
  res.status(200).send("ok");
}

function paypalBase() {
  return PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function paypalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID.value()}:${PAYPAL_CLIENT_SECRET.value()}`).toString("base64");
  const response = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials"
  });
  if (!response.ok) throw new Error("Could not connect to PayPal.");
  return (await response.json()).access_token;
}

async function paypalRequest(path, options = {}) {
  const token = await paypalAccessToken();
  const response = await fetch(`${paypalBase()}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "PayPal request failed.");
  return body;
}

async function createPayPalOrder(req, res) {
  const { trackId, licenceKey } = req.body || {};
  const { track, licence } = await trackAndLicence(trackId, licenceKey);
  const order = await paypalRequest("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        custom_id: JSON.stringify({ trackId, licenceKey }),
        description: `${track.title} — ${licence.name}`.slice(0, 127),
        amount: { currency_code: "GBP", value: licence.price.toFixed(2) }
      }]
    })
  });
  json(res, 200, { id: order.id });
}

async function capturePayPalOrder(req, res) {
  const orderId = String(req.body?.orderId || "");
  if (!/^[A-Z0-9]{8,30}$/i.test(orderId)) throw new Error("Invalid PayPal order.");
  const existing = await db.collection("purchases").where("providerRef", "==", orderId).limit(1).get();
  if (!existing.empty) return json(res, 409, { error: "This order has already been collected." });
  const order = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, { method: "POST" });
  if (order.status !== "COMPLETED") throw new Error("PayPal payment is not complete.");
  const unit = order.purchase_units[0];
  const { trackId, licenceKey } = JSON.parse(unit.custom_id);
  const { track, licence } = await trackAndLicence(trackId, licenceKey);
  const paid = unit.payments.captures[0].amount;
  if (paid.currency_code !== "GBP" || paid.value !== licence.price.toFixed(2)) throw new Error("Payment amount mismatch.");
  const purchase = await savePurchase({
    provider: "paypal",
    providerRef: orderId,
    email: order.payer?.email_address || "",
    trackId,
    trackTitle: track.title,
    licenceKey,
    licenceName: licence.name,
    amount: Math.round(Number(paid.value) * 100),
    currency: paid.currency_code.toLowerCase(),
    status: "paid"
  });
  json(res, 200, purchase);
}

async function purchaseStatus(req, res) {
  const sessionId = String(req.body?.sessionId || "");
  if (!sessionId.startsWith("cs_")) throw new Error("Invalid session.");
  const result = await db.collection("purchases").where("providerRef", "==", sessionId).limit(1).get();
  if (result.empty) return json(res, 202, { pending: true });
  const doc = result.docs[0];
  const replacement = await savePurchase({ ...doc.data(), purchaseId: doc.id });
  json(res, 200, { pending: false, ...replacement, trackTitle: doc.data().trackTitle, licenceName: doc.data().licenceName });
}

async function download(req, res) {
  const purchaseId = String(req.query.purchase || "");
  const token = String(req.query.token || "");
  const doc = await db.collection("purchases").doc(purchaseId).get();
  if (!doc.exists || doc.data().status !== "paid") return res.status(404).send("Download not found.");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  if (!token || hash !== doc.data().downloadTokenHash) return res.status(403).send("Download link is invalid.");
  const track = await db.collection("tracks").doc(doc.data().trackId).get();
  if (!track.exists || !track.data().masterPath) return res.status(404).send("Master file not found.");
  const [url] = await bucket.file(track.data().masterPath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
    responseDisposition: `attachment; filename="${track.data().slug || "play-productions-beat"}.wav"`
  });
  res.redirect(302, url);
}

async function djDownload(req, res) {
  const trackId = String(req.query.track || "");
  if (!verifyDjToken(String(req.query.token || ""))) {
    return res.status(403).send("This DJ download link is not valid.");
  }
  const track = await db.collection("tracks").doc(trackId).get();
  if (!track.exists || !["published", "coming-soon"].includes(track.data().status) || (track.data().showInDjPool !== true && track.data().djPromoEnabled !== true) || !track.data().masterPath) {
    return res.status(404).send("This promo download is not available.");
  }
  const [url] = await bucket.file(track.data().masterPath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
    responseDisposition: `attachment; filename="${track.data().slug || "play-productions-promo"}.wav"`
  });
  res.redirect(302, url);
}

function makeDjToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 12 * 60 * 60 * 1000 })).toString("base64url");
  const signature = crypto.createHmac("sha256", DJ_ACCESS_CODE.value()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function verifyDjToken(token) {
  try {
    const [payload, signature] = token.split(".");
    const expected = crypto.createHmac("sha256", DJ_ACCESS_CODE.value()).update(payload).digest("base64url");
    if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now();
  } catch { return false; }
}

async function djLogin(req, res) {
  const username = Buffer.from(String(req.body?.username || ""));
  const password = Buffer.from(String(req.body?.password || ""));
  const expectedUser = Buffer.from(DJ_ACCESS_USERNAME.value());
  const expectedPass = Buffer.from(DJ_ACCESS_CODE.value());
  const userOk = username.length === expectedUser.length && crypto.timingSafeEqual(username, expectedUser);
  const passOk = password.length === expectedPass.length && crypto.timingSafeEqual(password, expectedPass);
  if (!userOk || !passOk) return json(res, 401, { error: "Incorrect DJ username or password." });
  json(res, 200, { token: makeDjToken() });
}

exports.api = onRequest({
  region: "europe-west2",
  secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, DJ_ACCESS_CODE, DJ_ACCESS_USERNAME],
  cors: false,
  maxInstances: 10
}, async (req, res) => {
  try {
    const path = routePath(req);
    if (path === "/stripe-webhook" && req.method === "POST") return await stripeWebhook(req, res);
    if (path === "/stripe-checkout" && req.method === "POST") return await stripeCheckout(req, res);
    if (path === "/paypal-order" && req.method === "POST") return await createPayPalOrder(req, res);
    if (path === "/paypal-capture" && req.method === "POST") return await capturePayPalOrder(req, res);
    if (path === "/purchase-status" && req.method === "POST") return await purchaseStatus(req, res);
    if (path === "/download" && req.method === "GET") return await download(req, res);
    if (path === "/dj-download" && req.method === "GET") return await djDownload(req, res);
    if (path === "/dj-login" && req.method === "POST") return await djLogin(req, res);
    return json(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    return json(res, 400, { error: error.message || "Something went wrong." });
  }
});
