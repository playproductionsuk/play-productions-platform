const assetVersion = "m1-rc7-surgical-20260628";
const markUiReady = () => document.documentElement.classList.add("ui-ready");
let uiStyles = [...document.querySelectorAll('link[rel="stylesheet"][href]')].find(link => {
  try {
    return new URL(link.href, location.href).pathname.endsWith("/current-ui.css");
  } catch {
    return false;
  }
});
if (uiStyles?.sheet) {
  markUiReady();
} else {
  if (!uiStyles) {
    uiStyles = document.createElement("link");
    uiStyles.rel = "stylesheet";
    uiStyles.href = `current-ui.css?v=${assetVersion}`;
    document.head.appendChild(uiStyles);
  }
  uiStyles.addEventListener("load", markUiReady, { once: true });
  uiStyles.addEventListener("error", markUiReady, { once: true });
}
setTimeout(markUiReady,1500);

const page = location.pathname.split("/").pop() || "index.html";
const header = document.querySelector(".premium-nav,.public-header");
const cartControl = `<button class="cart-link" data-cart-open aria-label="Open cart">
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H6" stroke-width="1.8"/><path d="M10 8V5.8a2.2 2.2 0 0 1 4.4 0V8" stroke-width="1.8"/><circle cx="10" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></svg>
  <span class="cart-utility-copy"><strong>Cart</strong><small></small></span>
  <span class="cart-count">0</span>
</button>`;

if (header) {
  header.className = "premium-nav";
  const links = [
    ["index.html", "Home"],
    ["music.html", "Browse Music"],
    ["dj-access.html", "Request DJ Access"],
    ["contact.html", "Let’s Work"],
  ];
  header.innerHTML = `
    <a class="brand" href="index.html" aria-label="Play Productions home">
      <img src="assets/play-productions-logo.png" alt="Play Productions">
    </a>
    <button class="menu-toggle" data-menu-toggle aria-expanded="false" aria-label="Open navigation"><span></span></button>
    <div class="nav-panel" data-menu-panel>
      <nav class="primary-nav">
        ${links.map(([href, label]) => {
          const active = page === href || (page === "track.html" && href === "music.html");
          return `<a class="${active ? "active" : ""}" href="${href}">${label}</a>`;
        }).join("")}
      </nav>
      <div class="portal-actions public-account-actions">
        ${cartControl}
        <a class="cart-menu-link" href="checkout.html">Checkout</a>
        <a href="portal.html">Customer Login</a>
      </div>
    </div>`;

  const button = header.querySelector("[data-menu-toggle]");
  const panel = header.querySelector("[data-menu-panel]");
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    panel.classList.toggle("open", !open);
    document.body.classList.toggle("menu-open", !open);
  });
  panel.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      button.setAttribute("aria-expanded", "false");
      panel.classList.remove("open");
      document.body.classList.remove("menu-open");
    }
  });
}

let currentPublicRole = "public";

function renderRoleAwareHomeCtas(role = "public") {
  currentPublicRole = role;

  if (page === "index.html") {
    const actions = document.querySelector(".brand-hero .hero-actions");
    if (actions) {
      const ctas = role === "dj"
        ? [["dj-promo.html", "Promo Crate", "primary"]]
        : role === "customer"
          ? [["music.html", "Browse Music", "primary"]]
          : [
              ["music.html", "Browse Music", "primary"],
              ["dj-access.html", "Request DJ Access", "ghost"]
            ];
      actions.innerHTML = ctas
        .map(([href, label, style]) => `<a class="button ${style}" href="${href}">${label}</a>`)
        .join("");
    }
    const latestCta = document.querySelector(".home-latest .compact-heading > a");
    if (latestCta) {
      latestCta.href = role === "dj" ? "dj-promo.html" : "music.html";
      latestCta.textContent = role === "dj" ? "Promo Crate" : "Browse Music";
    }
  }

  const footerMusicLink = document.querySelector('.site-footer .footer-column a[href="music.html"],.site-footer .footer-column a[href="dj-promo.html"]');
  const footerDjAccessLink = document.querySelector('.site-footer .footer-column a[href="dj-access.html"]');
  const footerAccess = document.querySelector(".site-footer .footer-access");
  if (footerMusicLink) {
    footerMusicLink.href = role === "dj" ? "dj-promo.html" : "music.html";
    footerMusicLink.textContent = role === "dj" ? "Promo Crate" : "Browse Music";
  }
  if (footerDjAccessLink) footerDjAccessLink.hidden = role !== "public";
  if (footerAccess) footerAccess.hidden = role !== "public";

  globalThis.playHomeCtaDebug = {
    role,
    renderer: "site-nav.renderRoleAwareHomeCtas",
    renderedAt: new Date().toISOString()
  };
}

async function enhanceApprovedDjNavigation() {
  if (!header) return;

  try {
    const { firebaseApp, firebaseReady, db } = await import("./platform-data.js");
    if (!firebaseReady || !firebaseApp || !db) return;

    const [{ getAuth, onAuthStateChanged, signOut }, { doc, getDoc }] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js")
    ]);
    const auth = getAuth(firebaseApp);
    let authRevision = 0;

    const renderNavigation = (mode, account) => {
      const primaryNav = header.querySelector(".primary-nav");
      const actions = header.querySelector(".portal-actions");
      if (!primaryNav || !actions) return;
      globalThis.playNavDebug = {
        uid: account?.uid || null,
        mode,
        lastRenderer: "site-nav.renderNavigation",
        renderedAt: new Date().toISOString()
      };
      console.info("[Play Nav] render", globalThis.playNavDebug);

      if (mode === "dj") {
        const promoDetail = page === "track.html" && new URLSearchParams(location.search).get("promo") === "1";
        primaryNav.innerHTML = [
          ["index.html", "Home", page === "index.html"],
          ["dj-promo.html", "Promo Crate", page === "dj-promo.html" || promoDetail],
          ["contact.html", "Let’s Work", page === "contact.html"]
        ].map(([href, label, active]) => `<a class="${active ? "active" : ""}" href="${href}">${label}</a>`).join("");
        actions.className = "portal-actions dj-account-actions";
        actions.innerHTML = '<button id="djSignOut" class="button ghost" type="button">Sign out</button>';
        actions.querySelector("#djSignOut").onclick = async event => {
          event.currentTarget.disabled = true;
          try {
            await signOut(auth);
          } finally {
            location.replace("/index.html");
          }
        };
        renderRoleAwareHomeCtas("dj");
        return;
      }

      primaryNav.innerHTML = [
        ["index.html", "Home"],
        ["music.html", "Browse Music"],
        ...(!account ? [["dj-access.html", "Request DJ Access"]] : []),
        ["contact.html", "Let’s Work"]
      ].map(([href, label]) => {
        const active = page === href || (page === "track.html" && href === "music.html");
        return `<a class="${active ? "active" : ""}" href="${href}">${label}</a>`;
      }).join("");
      actions.className = `portal-actions ${account ? "customer-account-actions" : "public-account-actions"}`;
      actions.innerHTML = `
        ${cartControl}
        <a class="cart-menu-link" href="checkout.html">Checkout</a>
        <a href="portal.html">${account ? "My Account" : "Customer Login"}</a>
        ${account
          ? '<button id="customerNavSignOut" class="button ghost" type="button">Sign out</button>'
          : ""}`;
      actions.querySelector("#customerNavSignOut")?.addEventListener("click", async event => {
        event.currentTarget.disabled = true;
        try {
          await signOut(auth);
        } finally {
          location.replace("/index.html");
        }
      });
      renderRoleAwareHomeCtas(account ? "customer" : "public");
      window.dispatchEvent(new Event("play-public-navigation-rendered"));
    };

    onAuthStateChanged(auth, async account => {
      const revision = ++authRevision;
      let approved = false;
      let resolvedDjAccess = null;
      console.info("[Play Nav] auth state", {
        uid: account?.uid || null,
        email: account?.email || null,
        revision
      });
      if (account) {
        try {
          const profile = await getDoc(doc(db, "users", account.uid));
          resolvedDjAccess = profile.exists() ? profile.data().djAccess : undefined;
          approved = profile.exists() && resolvedDjAccess === true;
          console.info("[Play Nav] DJ access resolved", {
            uid: account.uid,
            documentExists: profile.exists(),
            djAccess: resolvedDjAccess,
            approved,
            revision
          });
        } catch (error) {
          console.warn("DJ navigation approval could not be verified.", error);
        }
      }
      if (revision !== authRevision) {
        console.info("[Play Nav] stale auth result discarded", {
          uid: account?.uid || null,
          revision,
          currentRevision: authRevision
        });
        return;
      }

      renderNavigation(approved ? "dj" : "customer", account);
      globalThis.playNavDebug.djAccess = resolvedDjAccess;
      globalThis.playNavDebug.approved = approved;

      if (page === "track.html" && new URLSearchParams(location.search).get("promo") === "1") {
        const backLink = document.querySelector(".track-product .back-link");
        if (backLink) {
          backLink.href = approved ? "dj-promo.html" : "dj-access.html";
          backLink.textContent = approved ? "← Back to Promo Crate" : "← Back to Request DJ Access";
        }
      }

      if (page === "track.html" && new URLSearchParams(location.search).get("promo") !== "1") {
        const backLink = document.querySelector(".track-product .back-link");
        if (backLink) {
          backLink.href = "music.html";
          backLink.textContent = "← Back to Browse Music";
        }
      }

      globalThis.playDjApproved = approved;
      window.dispatchEvent(new CustomEvent("play-dj-navigation-change", {
        detail: { approved }
      }));
    });
  } catch (error) {
    console.warn("DJ navigation enhancement unavailable.", error);
  }
}

enhanceApprovedDjNavigation();

function applyPublicTerminology() {
  document.querySelectorAll('.primary-nav a[href="music.html"],.breadcrumb-bar a[href="music.html"]').forEach(link => {
    link.textContent = "Browse Music";
  });
  document.querySelectorAll('.primary-nav a[href="dj-access.html"],.breadcrumb-bar a[href="dj-access.html"]').forEach(link => {
    link.textContent = "Request DJ Access";
  });
  const publicTrackBack = page === "track.html"
    && new URLSearchParams(location.search).get("promo") !== "1"
    && document.querySelector(".track-product .back-link");
  if (publicTrackBack) publicTrackBack.textContent = "← Back to Browse Music";
}

applyPublicTerminology();

let footer = document.querySelector("footer");
if (!footer) {
  footer = document.createElement("footer");
  document.body.appendChild(footer);
}
footer.outerHTML = `<footer class="site-footer"><div class="footer-grid"><div class="footer-brand"><img src="assets/play-productions-logo.png" alt="Play Productions"></div><div class="footer-column"><strong>Navigation</strong><a href="music.html">Music</a><a data-page-feature="services" href="services.html">Mixing & Mastering</a><a data-page-feature="vinyl" href="vinyl.html">Vinyl Cutting</a><a href="dj-access.html">DJ Promo</a><a href="contact.html">Let’s Work</a></div><div class="footer-column"><strong>Follow</strong><a href="https://www.tiktok.com/@playproductionsuk" target="_blank" rel="noopener">TikTok</a><a href="https://www.instagram.com/playproductionsuk" target="_blank" rel="noopener">Instagram</a><a href="https://www.facebook.com/playproductionsuk" target="_blank" rel="noopener">Facebook</a></div><div class="footer-column"><strong>Listen</strong><a href="https://open.spotify.com/artist/1GBNSQahIk3AGMX7zOJRMJ?si=hBkcpzdkTxKRFuiTbPRioA" target="_blank" rel="noopener">Spotify</a><a href="https://music.apple.com/gb/artist/play-productions/1567918963" target="_blank" rel="noopener">Apple Music</a><a href="https://on.soundcloud.com/Ut0DXvRutAUJrom3Si" target="_blank" rel="noopener">SoundCloud</a></div></div><div class="footer-bottom">© ${new Date().getFullYear()} Play Productions</div></footer>`;

const renderedFooter = document.querySelector(".site-footer");
renderedFooter?.querySelector(".footer-brand")?.insertAdjacentHTML(
  "beforeend",
  '<div class="footer-access"><a class="button ghost" href="dj-login.html">DJ Login</a><a class="button ghost" href="/admin.html">Admin Login</a></div>'
);
const footerMusic = renderedFooter?.querySelector('.footer-column a[href="music.html"]');
const footerDjAccess = renderedFooter?.querySelector('.footer-column a[href="dj-access.html"]');
if (footerMusic) footerMusic.textContent = "Browse Music";
if (footerDjAccess) footerDjAccess.textContent = "Request DJ Access";
renderRoleAwareHomeCtas(currentPublicRole);

import("./cart.js").then(({ getCart, removeFromCart, cartTotal }) => {
  const updateCount = () => document.querySelectorAll(".cart-count").forEach((item) => {
    item.textContent = getCart().length;
  });
  function openDrawer() {
    document.querySelector(".cart-drawer")?.remove();
    const items = getCart();
    const drawer = document.createElement("aside");
    drawer.className = "cart-drawer";
    drawer.setAttribute("aria-label", "Shopping cart");
    drawer.innerHTML = `<div class="cart-drawer-head"><h2>Your cart</h2><button class="icon-button" data-cart-close aria-label="Close cart">×</button></div>${items.length ? items.map((item) => `<div class="cart-item"><img src="${item.artwork || "icons/fallback.png"}" alt=""><div><strong>${item.title}</strong><br><small>Personal digital download</small></div><div>£${Number(item.price).toFixed(2)}<br><button data-remove="${item.id}">Remove</button></div></div>`).join("") : '<p class="empty">Your cart is empty.</p>'}<div class="cart-total"><span>Total</span><strong>£${cartTotal().toFixed(2)}</strong></div>${items.length ? '<a class="button primary" href="checkout.html">Continue to checkout</a>' : ""}`;
    document.body.appendChild(drawer);
    drawer.querySelector("[data-cart-close]").onclick = () => drawer.remove();
    drawer.addEventListener("click", (event) => {
      if (event.target.dataset.remove) {
        removeFromCart(event.target.dataset.remove);
        openDrawer();
      }
    });
  }
  const bindCartButton = () => {
    const button = document.querySelector("[data-cart-open]");
    if (!button || button.dataset.cartBound === "true") return;
    button.dataset.cartBound = "true";
    button.addEventListener("click", openDrawer);
  };
  const refreshPublicNavigation = () => {
    bindCartButton();
    updateCount();
  };
  refreshPublicNavigation();
  window.addEventListener("play-public-navigation-rendered", refreshPublicNavigation);
  window.addEventListener("cartchange", updateCount);
});

import("./site-settings.js").then((module) => {
  module.applySiteSettings();
  applyPublicTerminology();
  if (page === "index.html") {
    const heroCopy = document.querySelector(".brand-hero-copy");
    if (heroCopy) heroCopy.textContent = "Original music and professional audio services from Play Productions.";
  }
  document.querySelector('a[href="dj-promo.html?demo=1"]')?.remove();
}).catch(console.warn);
