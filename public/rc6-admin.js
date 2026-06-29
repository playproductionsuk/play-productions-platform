import { firebaseReady, db } from "./platform-data.js";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const css=document.createElement("link");
css.rel="stylesheet";
css.href="rc6-fixes.css";
document.head.appendChild(css);
document.documentElement.classList.add("ui-ready");

let records=[];
async function loadDjRecords(){
  if(firebaseReady&&!globalThis.playAdminPreviewOnly){
    try{
      const snapshot=await Promise.race([getDocs(collection(db,"enquiries")),new Promise((_,reject)=>setTimeout(()=>reject(new Error("DJ records timed out.")),5000))]);
      records=snapshot.docs.map(item=>({id:item.id,...item.data()})).filter(item=>item.type==="dj-access");
    }catch(error){console.warn(error);records=[]}
  }else{
    try{records=JSON.parse(localStorage.getItem("playDemoEnquiries")||"[]").filter(item=>item.type==="dj-access")}catch{records=[]}
  }
}
await loadDjRecords();

const list=document.querySelector("#moduleDjList");
function enhanceStatuses(){
  list?.querySelectorAll("tbody tr").forEach(row=>{
    const email=row.children[2]?.textContent.trim();
    const record=records.find(item=>item.email===email);
    const badge=row.querySelector(".dj-status-pill");
    const raw=(record?.status||badge?.textContent||"new").toLowerCase();
    const current=raw==="new"?"pending":raw;
    const label=current[0].toUpperCase()+current.slice(1);
    if(badge&&badge.textContent!==label)badge.textContent=label;
    const action=row.lastElementChild;
    if(!action||action.querySelector("[data-rc6-status]"))return;
    action.innerHTML=`<label class="status-editor"><span class="sr-only">Change status</span><select data-rc6-status="${record?.id||""}" data-email="${email}"><option value="new" ${current==="pending"?"selected":""}>Pending</option><option value="approved" ${current==="approved"?"selected":""}>Approved</option><option value="rejected" ${current==="rejected"?"selected":""}>Rejected</option></select></label>`;
  });
}
if(list){
  enhanceStatuses();
  window.addEventListener("play-admin-dj-rendered",enhanceStatuses);
  [250,750,1500].forEach(delay=>setTimeout(enhanceStatuses,delay));
}

list?.addEventListener("change",async event=>{
  const select=event.target.closest("[data-rc6-status]");
  if(!select)return;
  const record=records.find(item=>item.id===select.dataset.rc6Status)||records.find(item=>item.email===select.dataset.email);
  if(record)record.status=select.value;
  if(firebaseReady&&record)await updateDoc(doc(db,"enquiries",record.id),{status:select.value,updatedAt:serverTimestamp()});
  else{
    let all=[];
    try{all=JSON.parse(localStorage.getItem("playDemoEnquiries")||"[]")}catch{}
    const found=all.find(item=>item.id===record?.id||item.email===select.dataset.email);
    if(found)found.status=select.value;
    localStorage.setItem("playDemoEnquiries",JSON.stringify(all));
  }
  const badge=select.closest("tr")?.querySelector(".dj-status-pill");
  if(badge)badge.textContent=select.options[select.selectedIndex].text;
});

await import("./rc7-admin.js");
