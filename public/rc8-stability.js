import { getCart } from "./cart.js";

const page=location.pathname.split("/").pop()||"index.html";

function removeDisabledNavigation(){
  document.querySelectorAll('.primary-nav a[href="services.html"],.primary-nav a[href="vinyl.html"],.site-footer a[href="services.html"],.site-footer a[href="vinyl.html"]').forEach(link=>link.remove());
}
removeDisabledNavigation();
new MutationObserver(removeDisabledNavigation).observe(document.body,{childList:true,subtree:true});

if(page==="music.html"){
  const grid=document.querySelector("#trackGrid");
  const syncCartState=()=>{
    const ids=new Set(getCart().map(item=>String(item.id)));
    grid?.querySelectorAll(".store-track").forEach(row=>{
      const button=row.querySelector("[data-add]");
      if(button&&ids.has(String(row.dataset.id))){button.textContent="In Cart ✓";button.disabled=true}
    });
  };
  if(grid)new MutationObserver(syncCartState).observe(grid,{childList:true,subtree:true});
  syncCartState();
  window.addEventListener("cartchange",syncCartState);
}

if(page==="track.html"){
  const content=document.querySelector("#beatContent");
  const loadingWatch=setTimeout(()=>{
    if(content&&/Loading track/i.test(content.textContent))content.innerHTML='<div class="empty"><h1>Track unavailable</h1><p>The track took too long to load. Please return to the catalogue and try again.</p><a class="button primary" href="music.html">Browse music</a></div>';
  },9000);
  if(content)new MutationObserver(()=>{if(!/Loading track/i.test(content.textContent))clearTimeout(loadingWatch)}).observe(content,{childList:true,subtree:true});
}

if(page==="admin.html"){
  const login=document.querySelector("#loginPanel"),portal=document.querySelector("#adminPortal"),nav=document.querySelector(".simple-header>.admin-nav");
  const reflect=()=>{if(nav)nav.hidden=portal?.hidden!==false;if(login&&!login.hidden&&portal)portal.hidden=true};
  reflect();
  if(login)new MutationObserver(reflect).observe(login,{attributes:true,attributeFilter:["hidden"]});
  if(portal)new MutationObserver(reflect).observe(portal,{attributes:true,attributeFilter:["hidden"]});
}
