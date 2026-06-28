const assetVersion = "m1-rc6-20260628";
const uiStyles = document.createElement("link");
uiStyles.rel = "stylesheet";
uiStyles.href = `current-ui.css?v=${assetVersion}`;
uiStyles.addEventListener("load",()=>document.documentElement.classList.add("ui-ready"));
document.head.appendChild(uiStyles);
setTimeout(()=>document.documentElement.classList.add("ui-ready"),1500);

const page = location.pathname.split("/").pop() || "index.html";
const header = document.querySelector(".premium-nav");

if (header) {
  const links = [
    ["index.html", "Home"],
    ["music.html", "Music"],
    ["services.html", "Mixing & Mastering"],
    ["vinyl.html", "Vinyl Cutting"],
    ["dj-access.html", "DJ Promo"],
    ["contact.html", "Let’s Work"],
  ];
  header.innerHTML = `
    <a class="brand" href="index.html" aria-label="Play Productions home">
      <img src="assets/branding/play-headphones-logo.png" alt="Play Productions">
    </a>
    <button class="menu-toggle" data-menu-toggle aria-expanded="false" aria-label="Open navigation"><span></span></button>
    <div class="nav-panel" data-menu-panel>
      <nav class="primary-nav">
        ${links.map(([href, label]) => `<a class="${page === href || (page === "track.html" && href === "music.html") ? "active" : ""}" href="${href}">${label}</a>`).join("")}
      </nav>
      <div class="portal-actions">
        <button class="cart-link" data-cart-open aria-label="Open cart">Cart <span class="cart-count">0</span></button>
        <a href="portal.html">My Account</a>
        <a href="dj-login.html">DJ Login</a>
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

let footer = document.querySelector("footer");
if (!footer) {
  footer = document.createElement("footer");
  document.body.appendChild(footer);
}
footer.outerHTML = `<footer class="site-footer"><div class="footer-grid"><div class="footer-brand"><img src="assets/branding/play-headphones-logo.png" alt=""><h2>Play Productions</h2><p>Independent Producer</p></div><div class="footer-column"><strong>Navigation</strong><a href="music.html">Music</a><a data-page-feature="services" href="services.html">Mixing & Mastering</a><a data-page-feature="vinyl" href="vinyl.html">Vinyl Cutting</a><a href="dj-access.html">DJ Promo</a><a href="contact.html">Let’s Work</a></div><div class="footer-column"><strong>Follow</strong><a href="https://www.tiktok.com/@playproductionsuk" target="_blank" rel="noopener">TikTok</a><a href="https://www.instagram.com/playproductionsuk" target="_blank" rel="noopener">Instagram</a><a href="https://www.facebook.com/playproductionsuk" target="_blank" rel="noopener">Facebook</a></div><div class="footer-column"><strong>Listen</strong><a href="https://open.spotify.com/artist/1GBNSQahIk3AGMX7zOJRMJ?si=hBkcpzdkTxKRFuiTbPRioA" target="_blank" rel="noopener">Spotify</a><a href="https://music.apple.com/gb/artist/play-productions/1567918963" target="_blank" rel="noopener">Apple Music</a><a href="https://on.soundcloud.com/Ut0DXvRutAUJrom3Si" target="_blank" rel="noopener">SoundCloud</a></div></div><div class="footer-bottom">© ${new Date().getFullYear()} Play Productions</div></footer>`;

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
  document.querySelector("[data-cart-open]")?.addEventListener("click", openDrawer);
  window.addEventListener("cartchange", updateCount);
  updateCount();
});

import("./site-settings.js").then((module) => module.applySiteSettings()).catch(console.warn);
