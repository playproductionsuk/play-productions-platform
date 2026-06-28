import { firebaseReady, db } from "./platform-data.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const navNames={dashboard:"Overview",tracks:"Music Library",enquiries:"Inquiries",orders:"Orders",settings:"Settings"};
document.querySelectorAll(".admin-nav [data-view]").forEach(button=>{
  if(navNames[button.dataset.view])button.textContent=navNames[button.dataset.view];
});
document.querySelector('[data-module-view="djAccess"]')?.replaceChildren(document.createTextNode("DJ Database"));

const settingsPage=document.querySelector('[data-page="settings"]');
if(settingsPage&&!document.querySelector("#socialSettings")){
  const defaults={
    instagram:"https://www.instagram.com/playproductionsuk",
    facebook:"https://www.facebook.com/playproductionsuk",
    tiktok:"https://www.tiktok.com/@playproductionsuk",
    spotify:"https://open.spotify.com/artist/1GBNSQahIk3AGMX7zOJRMJ?si=hBkcpzdkTxKRFuiTbPRioA",
    appleMusic:"https://music.apple.com/gb/artist/play-productions/1567918963",
    soundcloud:"https://on.soundcloud.com/Ut0DXvRutAUJrom3Si"
  };
  let values=defaults;
  try{values={...defaults,...JSON.parse(localStorage.getItem("playSocialSettings")||"{}")}}catch{}
  settingsPage.insertAdjacentHTML("beforeend",`<section class="panel settings-pane" id="socialSettings">
    <div class="admin-section-title"><div><p class="eyebrow">Public links</p><h2>Social & listening links</h2></div></div>
    <form id="socialSettingsForm" class="form-grid">
      ${Object.entries({instagram:"Instagram",facebook:"Facebook",tiktok:"TikTok",spotify:"Spotify",appleMusic:"Apple Music",soundcloud:"SoundCloud"}).map(([key,label])=>`<div class="field"><label>${label}<input type="url" name="${key}" value="${values[key]}"></label></div>`).join("")}
      <div class="form-actions full"><button class="button primary save-settings" type="submit">Save links</button><span id="socialSettingsStatus"></span></div>
    </form></section>`);
  const tabs=settingsPage.querySelector(".settings-tabs");
  const social=settingsPage.querySelector("#socialSettings");
  social.hidden=true;
  const button=document.createElement("button");
  button.textContent="Social Links";
  button.type="button";
  tabs?.appendChild(button);
  button.addEventListener("click",()=>{
    settingsPage.querySelectorAll(".settings-pane").forEach(pane=>pane.hidden=pane!==social);
    tabs.querySelectorAll("button").forEach(tab=>tab.classList.toggle("active",tab===button));
  });
  document.querySelector("#socialSettingsForm").addEventListener("submit",async event=>{
    event.preventDefault();
    const data=Object.fromEntries(new FormData(event.currentTarget));
    localStorage.setItem("playSocialSettings",JSON.stringify(data));
    const status=document.querySelector("#socialSettingsStatus");
    status.textContent="Saved ✓";
    event.submitter.textContent="Saved ✓";
    setTimeout(()=>event.submitter.textContent="Save links",1600);
    if(firebaseReady)try{await setDoc(doc(db,"settings","site"),{socialLinks:data,updatedAt:serverTimestamp()},{merge:true})}catch{status.textContent="Saved locally; Firebase permission is required for the live site."}
  });
}

// Correct legacy missing-field labels before the RC2 jump handler runs.
document.querySelector("#adminTracks")?.addEventListener("click",event=>{
  const chip=event.target.closest(".missing-chips button,.missing-chips span");
  if(!chip)return;
  const label=chip.textContent.trim().toLowerCase();
  const targets={"master path":"wavPath","masterpath":"wavPath","wav/master path":"wavPath","title":"title","key":"key","bpm":"bpm","mood":"moodTags","genre":"style","seo":"seoDescription"};
  if(targets[label])chip.dataset.field=targets[label];
},true);

const orderList=document.querySelector("#orderList");
const addOrderNotes=()=>{
  orderList?.querySelectorAll(".data-row").forEach((row,index)=>{
    if(row.querySelector(".order-note"))return;
    const key=`playOrderNote:${row.dataset.id||index}`;
    row.insertAdjacentHTML("beforeend",`<label>Internal notes<textarea class="order-note" data-note-key="${key}" placeholder="Add order notes…">${localStorage.getItem(key)||""}</textarea></label>`);
  });
};
new MutationObserver(addOrderNotes).observe(orderList,{childList:true,subtree:true});
addOrderNotes();
orderList?.addEventListener("input",event=>{
  if(event.target.matches(".order-note"))localStorage.setItem(event.target.dataset.noteKey,event.target.value);
});

await import("./rc5-admin.js");
