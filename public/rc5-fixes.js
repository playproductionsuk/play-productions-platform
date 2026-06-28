import { addToCart, getCart } from "./cart.js";
import { createEnquiry } from "./platform-data.js";

const page=location.pathname.split("/").pop()||"index.html";

function ensureCommercialModal(){
  const existing=document.querySelector("#enquiryModal");
  if(existing)return existing;
  const modal=document.createElement("div");
  modal.id="enquiryModal";
  modal.className="modal";
  modal.hidden=true;
  modal.innerHTML=`<div class="modal-panel"><button class="modal-close" type="button" aria-label="Close">×</button><p class="eyebrow">Artist commercial enquiry</p><h2>Tell me about your project</h2><p class="subcopy">No rights are sold automatically. I’ll review the project and reply personally.</p><form class="form-stack"><label>Track or release<input name="trackTitle" placeholder="Which track are you interested in?"></label><div class="form-row"><label>Artist name<input name="artistName" required></label><label>Email<input name="email" type="email" required></label></div><label>Instagram or social link<input name="socialLink" type="url"></label><label>Project description<textarea name="projectDescription" required></textarea></label><div class="form-row"><label>Intended use<select name="intendedUse"><option>Single release</option><option>EP or album</option><option>Sync / media</option><option>Other</option></select></label><label>Expected timeframe<input name="releaseTimeframe"></label></div><label>Budget / offer (optional)<input name="budget" placeholder="£"></label><label>Anything else?<textarea name="message"></textarea></label><button class="button primary" type="submit">Send enquiry</button><p class="status-message"></p></form></div>`;
  document.body.appendChild(modal);
  modal.querySelector(".modal-close").onclick=()=>modal.hidden=true;
  modal.addEventListener("click",event=>{if(event.target===modal)modal.hidden=true});
  modal.querySelector("form").addEventListener("submit",async event=>{
    event.preventDefault();
    const status=modal.querySelector(".status-message");
    status.textContent="Sending…";
    try{await createEnquiry({...Object.fromEntries(new FormData(event.currentTarget)),type:"exclusive-rights"});status.textContent="Thanks—your commercial enquiry has been sent.";event.submitter.disabled=true}
    catch{status.textContent="That didn’t send. Please try again shortly."}
  });
  return modal;
}

function wireCommercialTriggers(){
  document.querySelectorAll('.commercial-store-panel a[href*="contact"],.commercial-store-panel .commercial-trigger').forEach(link=>{
    if(link.dataset.modalReady)return;
    link.dataset.modalReady="true";
    link.classList.add("commercial-trigger");
    link.removeAttribute("href");
    link.setAttribute("role","button");
    link.addEventListener("click",()=>{ensureCommercialModal().hidden=false});
  });
}
new MutationObserver(wireCommercialTriggers).observe(document.body,{childList:true,subtree:true});
wireCommercialTriggers();

if(page==="track.html"){
  const content=document.querySelector("#beatContent");
  const enhanceTrack=()=>{
    const buy=document.querySelector("#buyButton");
    if(buy&&!buy.dataset.cartReady){
      buy.dataset.cartReady="true";
      const id=new URLSearchParams(location.search).get("id")||new URLSearchParams(location.search).get("track");
      buy.addEventListener("click",event=>{
        event.preventDefault();
        event.stopImmediatePropagation();
        const title=document.querySelector(".track-product-info h1")?.textContent||"Digital track";
        const priceText=document.querySelector(".download-box strong")?.textContent||"0";
        const price=Number(priceText.replace(/[^0-9.]/g,""))||0;
        const artwork=document.querySelector(".track-product-art")?.src||"icons/fallback.png";
        if(!getCart().some(item=>String(item.id)===String(id)))addToCart({id,title,price,type:"Digital music",artwork});
        buy.textContent="In Cart ✓";
        buy.disabled=true;
        const status=document.querySelector("#trackStatus");
        if(status)status.textContent="Added to your cart. Open the cart in the header when you’re ready.";
      },true);
    }
    const commercial=document.querySelector(".commercial-panel"),related=document.querySelector(".related-section");
    if(commercial&&related&&related.previousElementSibling!==commercial)related.before(commercial);
  };
  new MutationObserver(enhanceTrack).observe(content,{childList:true,subtree:true});
  enhanceTrack();
}

if(page==="portal.html"){
  const music=document.querySelector("#myMusic");
  const verify=()=>{
    const table=music?.querySelector("table");
    if(!table)return;
    const headers=[...table.querySelectorAll("th")].map(th=>th.textContent.trim());
    if(headers[3]!=="BPM"||headers[7]!=="Purchase Type")table.removeAttribute("data-rc3");
  };
  new MutationObserver(verify).observe(music,{childList:true,subtree:true});
}
