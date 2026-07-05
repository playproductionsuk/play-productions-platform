import { getCart } from "./cart.js";

const page=location.pathname.split("/").pop()||"index.html";
const brandLogo="assets/play-productions-logo.png";
document.querySelectorAll(".premium-nav .brand img,.public-header .brand img,.site-footer .footer-brand img").forEach(img=>{
  img.src=brandLogo;
  img.alt="Play Productions";
  img.classList.add("brand-logo");
});
document.querySelectorAll(".cart-menu-link").forEach(link=>link.textContent="Checkout");

if(page==="music.html"){
  const updateHeader=()=>document.querySelectorAll(".store-column-head").forEach(head=>{
    const spans=head.querySelectorAll("span");
    if(spans.length===7&&spans[6].textContent!=="")spans[6].textContent="";
  });
  const trackGrid=document.querySelector("#trackGrid");
  if(trackGrid)new MutationObserver(updateHeader).observe(trackGrid,{childList:true,subtree:true});
  updateHeader();
}

if(page==="track.html"){
  const promo=new URLSearchParams(location.search).get("promo")==="1";
  const update=()=>{
    const button=document.querySelector("#buyButton");
    const id=new URLSearchParams(location.search).get("id")||new URLSearchParams(location.search).get("track");
    if(button&&getCart().some(item=>String(item.id)===String(id))&&button.textContent!=="In Cart ✓"){button.textContent="In Cart ✓";button.disabled=true}
    if(promo){
      const approved=globalThis.playDjApproved===true;
      const back=document.querySelector(".back-link");
      if(back){back.href=approved?"dj-promo.html":"dj-access.html";back.textContent=approved?"← Back to Promo Crate":"← Back to Request DJ Access"}
      const crumbs=document.querySelectorAll(".breadcrumb-bar a");
      crumbs.forEach(link=>{if(["music.html","dj-promo.html","dj-access.html"].includes(link.getAttribute("href"))){link.href=approved?"dj-promo.html":"dj-access.html";link.textContent=approved?"Promo Crate":"Request DJ Access"}});
    }
  };
  const beatContent=document.querySelector("#beatContent");
  if(beatContent)new MutationObserver(update).observe(beatContent,{childList:true,subtree:true});
  window.addEventListener("play-dj-navigation-change",update);
  update();
}

if(page==="dj-promo.html"){
  const updateCrateBreadcrumb=()=>{
    if(globalThis.playDjApproved!==true)return;
    const bar=document.querySelector(".breadcrumb-bar");
    if(bar)bar.innerHTML='<a href="index.html">Home</a><span>›</span><strong>Promo Crate</strong>';
  };
  window.addEventListener("play-dj-navigation-change",updateCrateBreadcrumb);
  updateCrateBreadcrumb();
  const label=()=>document.querySelectorAll(".dj-column-head").forEach(head=>{
    const spans=head.querySelectorAll("span");
    if(spans.length===6&&spans[5].textContent!=="Actions / Downloads")spans[5].textContent="Actions / Downloads";
  });
  const djTrackList=document.querySelector("#djTrackList");
  if(djTrackList)new MutationObserver(label).observe(djTrackList,{childList:true,subtree:true});
  label();
}

if(page==="dj-access.html"){
  const defaults={instagram:"https://www.instagram.com/playproductionsuk",facebook:"https://www.facebook.com/playproductionsuk",tiktok:"https://www.tiktok.com/@playproductionsuk",spotify:"https://open.spotify.com/artist/1GBNSQahIk3AGMX7zOJRMJ?si=hBkcpzdkTxKRFuiTbPRioA",appleMusic:"https://music.apple.com/gb/artist/play-productions/1567918963",soundcloud:"https://on.soundcloud.com/Ut0DXvRutAUJrom3Si"};
  const labels={instagram:"Instagram",facebook:"Facebook",tiktok:"TikTok",spotify:"Spotify",appleMusic:"Apple Music",soundcloud:"SoundCloud"};
  const icons={instagram:"instagram.png",facebook:"facebook.png",tiktok:"tiktok.png",spotify:"spotify.png",appleMusic:"applemusic.png",soundcloud:"soundcloud.png"};
  const intro=document.querySelector(".contact-grid>section");
  intro?.insertAdjacentHTML("beforeend",`<div class="social-brand-links rc4-socials dj-public-links">${Object.entries(labels).map(([key,text])=>`<a data-public-link="${key}" href="${defaults[key]}" target="_blank" rel="noopener"><img src="icons/${icons[key]}" alt="">${text}</a>`).join("")}</div>`);
  window.addEventListener("sitesettings",event=>document.querySelectorAll("[data-public-link]").forEach(link=>{link.href=event.detail.socialLinks?.[link.dataset.publicLink]||defaults[link.dataset.publicLink]}));
}
