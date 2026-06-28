const rc6Page=location.pathname.split("/").pop()||"index.html";

document.querySelectorAll(".cart-menu-link").forEach(link=>link.textContent="Checkout");

function addBpmColumns(){
  document.querySelectorAll(".store-column-head").forEach(head=>{
    if(head.dataset.rc6)return;
    head.dataset.rc6="true";
    head.innerHTML="<span aria-hidden=\"true\"></span><span>Track</span><span>Genre</span><span>BPM</span><span>Mood</span><span>Price</span><span>Actions</span>";
  });
  document.querySelectorAll(".dj-column-head").forEach(head=>{
    if(head.dataset.rc6)return;
    head.dataset.rc6="true";
    head.innerHTML="<span aria-hidden=\"true\"></span><span>Track</span><span>Genre</span><span>BPM</span><span>Mood</span><span>Downloads</span>";
  });
  document.querySelectorAll(".store-track").forEach(row=>{
    if(row.querySelector(".bpm-cell"))return;
    const meta=row.querySelector(".meta")?.textContent||"";
    const bpm=meta.match(/(\d{2,3})\s*BPM/i)?.[1]||"—";
    const cell=document.createElement("span");
    cell.className="bpm-cell";
    cell.textContent=bpm;
    row.querySelector(".tags")?.before(cell);
  });
}
new MutationObserver(addBpmColumns).observe(document.body,{childList:true,subtree:true});
addBpmColumns();

if(rc6Page==="track.html"){
  const fixOrder=()=>{
    const commercial=document.querySelector(".commercial-panel"),related=document.querySelector(".related-section");
    if(commercial&&related&&commercial.nextElementSibling!==related)commercial.after(related);
  };
  new MutationObserver(fixOrder).observe(document.querySelector("#beatContent"),{childList:true,subtree:true});
  fixOrder();
}
