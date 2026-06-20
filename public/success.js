const params = new URLSearchParams(location.search);
const message = document.querySelector("#message");
const button = document.querySelector("#downloadButton");

function ready(purchase, token, title, licence) {
  message.textContent = `${title || "Your beat"} (${licence || "licence"}) is ready. This private link creates a fresh 15-minute download.`;
  button.href = `/api/download?purchase=${encodeURIComponent(purchase)}&token=${encodeURIComponent(token)}`;
  button.hidden = false;
}

async function stripeStatus(sessionId) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await fetch("/api/purchase-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
    const data = await response.json();
    if (response.ok && !data.pending) return ready(data.purchaseId, data.downloadToken, data.trackTitle, data.licenceName);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  message.textContent = "Payment was received, but the download is taking a little longer. Please refresh this page in a moment.";
}

if (params.get("provider") === "paypal" && params.get("purchase") && params.get("token")) {
  ready(params.get("purchase"), params.get("token"), "Your beat", "PayPal purchase");
} else if (params.get("provider") === "stripe" && params.get("session_id")) {
  stripeStatus(params.get("session_id")).catch(() => { message.textContent = "We could not prepare the download. Please contact Play Productions with your payment receipt."; });
} else {
  message.textContent = "No completed payment was found.";
}
