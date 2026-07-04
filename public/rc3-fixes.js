const rc3Page=location.pathname.split("/").pop()||"index.html";
const iconPaths=[
  '<path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M5 19h14"/>',
  '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  '<path d="M4 13v-2a8 8 0 0 1 16 0v2"/><path d="M4 13h3v7H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 1-2Zm16 0h-3v7h2a2 2 0 0 0 2-2v-3a2 2 0 0 0-1-2Z"/>',
  '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
];

document.querySelectorAll(".trust-strip>div,.feature-strip>div").forEach((item,index)=>{
  if(item.querySelector(".trust-icon"))return;
  item.insertAdjacentHTML("afterbegin",`<span class="trust-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${iconPaths[index%4]}</svg></span>`);
});

const actions=document.querySelector(".portal-actions");
if(actions&&!actions.querySelector(".cart-menu-link")&&globalThis.playDjApproved!==true){
  actions.insertAdjacentHTML("beforeend",'<a class="cart-menu-link" href="checkout.html">Cart</a>');
}

if(rc3Page==="music.html"){
  const hero=document.querySelector(".store-hero");
  if(hero){
    hero.classList.add("music-hero");
    hero.querySelector(".eyebrow")?.remove();
    hero.querySelector("h1").textContent="Browse Music";
    hero.querySelector("p:last-child").textContent="Original releases for personal listening and private use. Preview tracks, add them to your cart and download securely.";
  }
  const catalogue=document.querySelector("#catalogue");
  catalogue?.insertAdjacentHTML("beforeend",'<aside class="commercial-store-panel"><h2>Commercial Inquiry</h2><p>Standard downloads are for personal/private use. If you want to record vocals, use a track commercially, or discuss exclusive/commercial rights, get in touch.</p><a class="button ghost" href="contact.html?subject=commercial">Commercial Enquiry</a></aside>');
}

if(rc3Page==="portal.html"){
  const music=document.querySelector("#myMusic");
  const welcome=document.querySelector("#welcome");
  const setAccountCopy=()=>{
    if(welcome&&!welcome.dataset.rc3&&/Preview|Signed in/i.test(welcome.textContent)){welcome.dataset.rc3="true";welcome.innerHTML='<strong>Your account</strong><br><span>Download your music, review your orders and manage release update preferences.</span>'}
  };
  new MutationObserver(setAccountCopy).observe(welcome,{childList:true,subtree:true});
  setAccountCopy();
  const repairPortal=()=>{
    const table=music?.querySelector("table");
    if(!table||table.dataset.rc3)return;
    table.dataset.rc3="true";
    table.querySelector("thead tr").innerHTML="<th>Artwork</th><th>Track</th><th>Genre</th><th>BPM</th><th>Key</th><th>Mood</th><th>Purchase Date</th><th>Purchase Type</th><th>MP3</th><th>WAV</th>";
    table.querySelectorAll("tbody tr").forEach(row=>{
      const cells=[...row.children];
      const downloadCell=cells.at(-1);
      const source=cells.length>8?cells[6]:null;
      const purchaseDate=cells.length>8?cells[7]:cells[6];
      const mp3=downloadCell?.querySelector('a[href],button:first-child')?.outerHTML||"—";
      const wav=downloadCell?.querySelector('a.button.primary,button.button.primary')?.outerHTML||"—";
      row.innerHTML=`${cells.slice(0,6).map(cell=>cell.outerHTML).join("")}<td>${purchaseDate?.innerHTML||"—"}</td><td><span class="status-pill">${/DJ/i.test(source?.textContent||"")?"DJ Promo":"Purchased"}</span></td><td>${mp3}</td><td>${wav}</td>`;
    });
  };
  new MutationObserver(repairPortal).observe(music,{childList:true,subtree:true});
  repairPortal();
}

if(rc3Page==="contact.html"){
  document.querySelectorAll('a[href*="facebook.com"]').forEach(link=>link.href="https://www.facebook.com/playproductionsuk");
}

window.addEventListener("sitesettings",({detail:v})=>{
  document.querySelectorAll('[data-view="projects"],[data-view="cases"],[data-module-view="vinylProjects"]').forEach(el=>el.hidden=!v.services);
  document.querySelectorAll('[data-inbox-filter="service-quote"]').forEach(el=>el.hidden=!v.services);
  document.querySelectorAll('[data-inbox-filter="vinyl"]').forEach(el=>el.hidden=!v.vinyl);
});
