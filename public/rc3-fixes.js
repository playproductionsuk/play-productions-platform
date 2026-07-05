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

function addImageHero(className,title,content){
  const main=document.querySelector("main.page-shell");
  const layout=main?.querySelector(".contact-grid");
  if(!main||!layout||main.querySelector(".public-image-hero"))return;
  layout.insertAdjacentHTML("beforebegin",`<section class="public-image-hero ${className}"><div class="public-image-hero-content"><h1>${title}</h1>${content}</div></section>`);
}

function polishSocialEditor(root,addSelector,label){
  if(!root)return;
  const heading=root.querySelector("legend, :scope>span");
  if(heading)heading.textContent=label;
  const list=root.querySelector(".social-link-list");
  const hidden=root.querySelector('input[name="socialLinks"][type="hidden"]');
  const legacyAdd=root.querySelector(addSelector);
  if(!list||!hidden||!legacyAdd)return;
  const add=legacyAdd.cloneNode(true);
  legacyAdd.replaceWith(add);
  add.textContent="Add social link";
  add.className="button primary social-editor-trigger";
  let entries=[];
  try{entries=JSON.parse(hidden.value||"[]").filter(item=>item?.url)}catch{}
  list.replaceChildren();
  const sync=()=>{hidden.value=JSON.stringify(entries)};
  const renderConfirmed=entry=>{
    const item=document.createElement("div");
    item.className="social-link-confirmed";
    const copy=document.createElement("div");
    const platform=document.createElement("strong");
    platform.textContent=entry.type;
    const link=document.createElement("a");
    link.href=entry.url;
    link.target="_blank";
    link.rel="noopener";
    link.textContent=entry.url;
    copy.append(platform,link);
    const remove=document.createElement("button");
    remove.type="button";
    remove.className="social-link-remove";
    remove.setAttribute("aria-label",`Remove ${entry.type} social link`);
    remove.textContent="×";
    remove.addEventListener("click",()=>{
      entries=entries.filter(itemEntry=>itemEntry!==entry);
      item.remove();
      sync();
    });
    item.append(copy,remove);
    list.appendChild(item);
  };
  const closeEditor=editor=>{
    editor.remove();
    add.hidden=false;
  };
  const openEditor=()=>{
    if(root.querySelector(".social-link-editor"))return;
    add.hidden=true;
    const editor=document.createElement("div");
    editor.className="social-link-editor";
    const platformLabel=document.createElement("label");
    platformLabel.textContent="Platform";
    const select=document.createElement("select");
    ["Instagram","TikTok","Facebook","Mixcloud","SoundCloud","Website","Other"].forEach(name=>{
      const option=document.createElement("option");
      option.textContent=name;
      select.appendChild(option);
    });
    platformLabel.appendChild(select);
    const urlLabel=document.createElement("label");
    urlLabel.textContent="URL";
    const url=document.createElement("input");
    url.type="url";
    url.placeholder="https://";
    urlLabel.appendChild(url);
    const confirm=document.createElement("button");
    confirm.type="button";
    confirm.className="button primary social-link-confirm";
    confirm.textContent="Add";
    confirm.addEventListener("click",()=>{
      const value=url.value.trim();
      if(!value||!url.checkValidity()){
        url.setCustomValidity(value?"Enter a complete link including https://":"Enter a social or website link.");
        url.reportValidity();
        url.setCustomValidity("");
        return;
      }
      const entry={type:select.value,url:value};
      entries.push(entry);
      renderConfirmed(entry);
      sync();
      closeEditor(editor);
    });
    const cancel=document.createElement("button");
    cancel.type="button";
    cancel.className="social-link-remove";
    cancel.setAttribute("aria-label","Cancel adding social link");
    cancel.textContent="×";
    cancel.addEventListener("click",()=>closeEditor(editor));
    editor.append(platformLabel,urlLabel,confirm,cancel);
    list.appendChild(editor);
    url.focus();
  };
  entries.forEach(renderConfirmed);
  sync();
  add.addEventListener("click",openEditor);
  root.insertBefore(add,hidden);
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
  const catalogueHeading=catalogue?.querySelector(".compact-heading");
  if(catalogueHeading){
    catalogueHeading.classList.add("catalogue-heading");
    catalogueHeading.innerHTML='<h2>Catalogue</h2><span id="storeCount" class="store-count"></span>';
  }
  const breadcrumb=document.querySelector(".breadcrumb-bar strong");
  if(breadcrumb)breadcrumb.textContent="Browse Music";
  const trackGrid=document.querySelector("#trackGrid");
  const columnHead=trackGrid?.previousElementSibling?.classList.contains("store-column-head")?trackGrid.previousElementSibling:null;
  if(trackGrid&&!trackGrid.closest(".catalogue-scroll")){
    const scroll=document.createElement("div");
    scroll.className="catalogue-scroll";
    (columnHead||trackGrid).before(scroll);
    if(columnHead)scroll.append(columnHead);
    scroll.append(trackGrid);
  }
  catalogue?.insertAdjacentHTML("beforeend",'<aside class="commercial-store-panel"><h2>Commercial Enquiry</h2><p>Standard downloads are for personal/private use. If you want to record vocals, use a track commercially, or discuss exclusive/commercial rights, get in touch.</p><a class="button ghost" href="contact.html?subject=commercial">Commercial Enquiry</a></aside>');
}

if(rc3Page==="track.html"){
  document.querySelector('.breadcrumb-bar a[href="music.html"]')?.replaceChildren("Browse Music");
}

if(rc3Page==="dj-access.html"){
  addImageHero(
    "request-dj-hero",
    'Play It. Share It.<span>Turn It Up.</span>',
    `<p>If you're a DJ, radio presenter, content creator or someone who genuinely loves breaking new music, apply for DJ Access to unlock the Promo Crate and download exclusive promotional tracks before they're publicly released.</p>
    <p>All I ask is that you play the music, share it where you can and tag Play Productions whenever you do. Every set, radio show and social post helps get independent music in front of new listeners, and I genuinely appreciate every bit of support.</p>
    <div class="public-hero-footer"><p>Prefer to chat first? You'll also find links to all of my social channels below.</p><a class="button primary" href="dj-login.html">Already approved? DJ Login</a></div>`
  );
  const page=document.querySelector(".contact-grid");
  page?.classList.add("public-enquiry-page","dj-access-page","hero-form-only");
  const intro=page?.querySelector("section:first-child");
  intro?.remove();
  page?.insertAdjacentHTML("afterbegin",'<nav class="social-brand-links enquiry-social-links" aria-label="Play Productions social links"></nav>');
  const form=document.querySelector("#djAccessForm");
  const messageField=form?.querySelector('textarea[name="message"]')?.closest("label");
  const dynamicSocials=form?.querySelector("fieldset:has(#djSocialLinks)");
  form?.querySelectorAll('[name="socialLinks"]:not([type="hidden"])').forEach(input=>input.closest("label")?.remove());
  if(messageField&&dynamicSocials)messageField.insertAdjacentElement("afterend",dynamicSocials);
  polishSocialEditor(dynamicSocials,"#addDjSocial","Social and web links (optional)");
  document.querySelector(".breadcrumb-bar strong")?.replaceChildren("Request DJ Access");
}

if(rc3Page==="contact.html"){
  addImageHero(
    "lets-work-hero",
    'Let’s Build<span>Something Great.</span>',
    `<p>Whether you're looking for a producer, want to collaborate on a project, need professional mixing or mastering, or have a question about licensing or commercial use, I'd love to hear what you're working on.</p>
    <p>Use the form below to get in touch with as much detail as you can, and I'll get back to you as soon as possible.</p>
    <div class="public-hero-footer"><p>Prefer to chat first? You'll also find links to all of my social media channels below.</p></div>`
  );
  const page=document.querySelector(".contact-grid");
  page?.classList.add("public-enquiry-page","lets-work-page","hero-form-only");
  const intro=page?.querySelector("section:first-child");
  intro?.remove();
  page?.insertAdjacentHTML("afterbegin",'<nav class="social-brand-links enquiry-social-links" aria-label="Play Productions social links"></nav>');
  page?.insertAdjacentHTML("beforeend",'<aside class="commercial-store-panel contact-commercial"><h2>Commercial Enquiry</h2><p>Standard downloads are for personal/private use. If you want to record vocals, use a track commercially, or discuss exclusive/commercial rights, get in touch.</p><a class="button ghost" href="contact.html?subject=commercial">Commercial Enquiry</a></aside>');
  polishSocialEditor(document.querySelector("#contactSocials")?.closest("label"),"#addContactSocial","Social and web links (optional)");
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
