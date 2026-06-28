const css=document.createElement("link");
css.rel="stylesheet";
css.href="rc7-fixes.css";
document.head.appendChild(css);

const header=document.querySelector(".simple-header");
const portal=document.querySelector("#adminPortal");
const nav=document.querySelector(".admin-nav");

function positionAdminNav(){
  if(!header||!nav||!portal)return;
  if(nav.parentElement!==header)header.querySelector(".back-link")?.before(nav);
  nav.hidden=portal.hidden;
}
positionAdminNav();
if(portal)new MutationObserver(positionAdminNav).observe(portal,{attributes:true,attributeFilter:["hidden"]});

const statusCard=document.querySelector("#systemStatus");
statusCard?.classList.add("dashboard-status-restored");

// If the DJ database is created after rc6-admin runs, attach a safe status editor.
const adminMain=document.querySelector(".admin-main");
let djRecords=[];
async function refreshDjRecords(){
  if(firebaseReady){
    try{
      const snapshot=await Promise.race([getDocs(collection(db,"enquiries")),new Promise((_,reject)=>setTimeout(()=>reject(new Error("DJ records timed out.")),5000))]);
      djRecords=snapshot.docs.map(item=>({id:item.id,...item.data()})).filter(item=>item.type==="dj-access");
    }catch(error){console.warn(error);djRecords=[]}
  }else try{djRecords=JSON.parse(localStorage.getItem("playDemoEnquiries")||"[]").filter(item=>item.type==="dj-access")}catch{djRecords=[]}
}
await refreshDjRecords();
function ensureLateDjStatusEditor(){
  const list=document.querySelector("#moduleDjList");
  if(!list||list.dataset.rc7Status)return;
  list.dataset.rc7Status="true";
  const improve=()=>list.querySelectorAll("tbody tr").forEach(row=>{
    const email=row.children[2]?.textContent.trim(),record=djRecords.find(item=>item.email===email);
    const badge=row.querySelector(".dj-status-pill"),raw=(record?.status||badge?.textContent||"new").toLowerCase(),current=raw==="new"?"pending":raw;
    if(badge)badge.textContent=current[0].toUpperCase()+current.slice(1);
    const action=row.lastElementChild;
    if(action&&!action.querySelector("[data-rc7-dj-status]"))action.innerHTML=`<select class="change-status-small" data-rc7-dj-status="${record?.id||""}" data-email="${email}"><option value="new" ${current==="pending"?"selected":""}>Pending</option><option value="approved" ${current==="approved"?"selected":""}>Approved</option><option value="rejected" ${current==="rejected"?"selected":""}>Rejected</option></select>`;
  });
  new MutationObserver(improve).observe(list,{childList:true,subtree:true});
  improve();
  list.addEventListener("change",async event=>{
    const select=event.target.closest("[data-rc7-dj-status]");
    if(!select)return;
    const record=djRecords.find(item=>item.id===select.dataset.rc7DjStatus)||djRecords.find(item=>item.email===select.dataset.email);
    if(record)record.status=select.value;
    if(firebaseReady&&record)await updateDoc(doc(db,"enquiries",record.id),{status:select.value,updatedAt:serverTimestamp()});
    else{
      let all=[];try{all=JSON.parse(localStorage.getItem("playDemoEnquiries")||"[]")}catch{}
      const saved=all.find(item=>item.id===record?.id||item.email===select.dataset.email);
      if(saved)saved.status=select.value;
      localStorage.setItem("playDemoEnquiries",JSON.stringify(all));
    }
    const badge=select.closest("tr")?.querySelector(".dj-status-pill");
    if(badge)badge.textContent=select.options[select.selectedIndex].text;
  });
}
if(adminMain){
  new MutationObserver(ensureLateDjStatusEditor).observe(adminMain,{childList:true,subtree:true});
  ensureLateDjStatusEditor();
}
import { firebaseReady, db } from "./platform-data.js";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
