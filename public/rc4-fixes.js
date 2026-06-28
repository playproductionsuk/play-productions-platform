const rc4Page=location.pathname.split("/").pop()||"index.html";

// Remove the optional latest block in Module 1 before it can remain in a loading state.
if(rc4Page==="music.html"){
  document.querySelector("#latestGrid")?.closest(".compact-section")?.remove();
  const hero=document.querySelector(".store-hero");
  if(hero){hero.querySelector("h1").textContent="Browse All Music";hero.querySelector("p:last-child").textContent="Original releases for personal listening and private use. Preview tracks, add them to your cart and download securely."}
}

const socialDefaults={
  instagram:"https://www.instagram.com/playproductionsuk",
  facebook:"https://www.facebook.com/playproductionsuk",
  tiktok:"https://www.tiktok.com/@playproductionsuk",
  spotify:"https://open.spotify.com/artist/1GBNSQahIk3AGMX7zOJRMJ?si=hBkcpzdkTxKRFuiTbPRioA",
  appleMusic:"https://music.apple.com/gb/artist/play-productions/1567918963",
  soundcloud:"https://on.soundcloud.com/Ut0DXvRutAUJrom3Si"
};
let socialSettings=socialDefaults;
try{socialSettings={...socialDefaults,...JSON.parse(localStorage.getItem("playSocialSettings")||"{}")}}catch{}
const socialLabels={instagram:"Instagram",facebook:"Facebook",tiktok:"TikTok",spotify:"Spotify",appleMusic:"Apple Music",soundcloud:"SoundCloud"};
const iconNames={instagram:"instagram.png",facebook:"facebook.png",tiktok:"tiktok.png",spotify:"spotify.png",appleMusic:"applemusic.png",soundcloud:"soundcloud.png"};

document.querySelectorAll(".footer-column a").forEach(link=>{
  const key=Object.keys(socialLabels).find(name=>socialLabels[name]===link.textContent.trim());
  if(key)link.href=socialSettings[key];
});

window.addEventListener("sitesettings",event=>{
  const live={...socialSettings,...(event.detail.socialLinks||{})};
  document.querySelectorAll(".footer-column a").forEach(link=>{const key=Object.keys(socialLabels).find(name=>socialLabels[name]===link.textContent.trim());if(key)link.href=live[key]});
  if(rc4Page==="contact.html")document.querySelectorAll(".rc4-socials a").forEach((link,index)=>link.href=live[Object.keys(socialLabels)[index]]);
});

if(rc4Page==="contact.html"){
  const links=document.querySelector(".social-brand-links");
  if(links){links.classList.add("rc4-socials");links.innerHTML=Object.entries(socialLabels).map(([key,label])=>`<a href="${socialSettings[key]}" target="_blank" rel="noopener"><img src="icons/${iconNames[key]}" alt="">${label}</a>`).join("")}
}

if(rc4Page==="checkout.html"){
  const steps=[...document.querySelectorAll(".checkout-step")];
  if(steps.length&&!steps[0].parentElement.classList.contains("checkout-step-wrap")){const wrap=document.createElement("div");wrap.className="checkout-step-wrap";steps[0].before(wrap);steps.forEach(step=>wrap.appendChild(step))}
}

if(rc4Page==="portal.html"){
  document.querySelector(".account-summary")?.remove();
  document.querySelectorAll("#myOrders tbody tr").forEach(row=>{
    const cells=[...row.children],type=cells[3]?.textContent||"";
    if(/DJ/i.test(type)){if(cells[4])cells[4].textContent="£0.00";if(cells[5])cells[5].textContent="DJ Promo"}
  });
}

if(rc4Page==="dj-promo.html"){
  const pool=document.querySelector(".dj-pool"),list=document.querySelector("#djTrackList");
  if(pool&&!pool.querySelector(".dj-column-head"))pool.querySelector(".store-tools")?.insertAdjacentHTML("afterend",'<div class="dj-column-head"><span>Track</span><span>Genre</span><span>Mood</span><span>Actions / Downloads</span></div>');
  if(pool&&!pool.querySelector(".commercial-store-panel"))pool.insertAdjacentHTML("beforeend",'<aside class="commercial-store-panel"><p class="eyebrow">Commercial use</p><h2>Want to release or use a promo track commercially?</h2><p>DJ promo access covers DJ, radio and promotional play. Recording, release, sync or other commercial use needs a separate agreement.</p><a class="button ghost" href="contact.html?subject=commercial">Commercial Enquiry</a></aside>');
}

if(rc4Page==="track.html"){
  const cleanRelated=()=>{
    const section=document.querySelector(".related-section"),genre=document.querySelector(".track-product-info>.eyebrow")?.textContent.trim();
    if(!section||section.dataset.rc4||!genre)return;
    section.dataset.rc4="true";
    section.querySelectorAll(".release-row").forEach(row=>{if(row.querySelector("p")?.textContent.trim()!==genre)row.remove()});
    if(!section.querySelector(".release-row"))section.remove();
  };
  new MutationObserver(cleanRelated).observe(document.querySelector("#beatContent"),{childList:true,subtree:true});
  cleanRelated();
}
