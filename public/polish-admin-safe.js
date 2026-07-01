import { firebaseReady, db, loadTracks, trackHealth, trackReadiness, escapeHtml } from "./platform-data.js";
import { getSiteSettings } from "./site-settings.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const stats=document.querySelector("#statGrid");
const library=document.querySelector("#adminTracks");
const nav=document.querySelector(".admin-nav");
let tracks=[],enquiries=[],orders=[],visibility={};

async function boundedDocs(name){
  if(!firebaseReady||globalThis.playAdminPreviewOnly)return[];
  try{
    const snapshot=await Promise.race([getDocs(collection(db,name)),new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${name} timed out`)),5000))]);
    return snapshot.docs.map(item=>({id:item.id,...item.data()}));
  }catch(error){console.warn(`Admin ${name} preview unavailable.`,error);return[]}
}

function metric(name,value){
  const card=[...(stats?.querySelectorAll("article")||[])].find(item=>item.querySelector("span")?.textContent.toLowerCase().includes(name));
  if(card)card.querySelector("strong").textContent=value;
}

function renderOverview(){
  if(!stats?.children.length)return;
  const missing=tracks.filter(track=>{const health=trackHealth(track);return health.missingRequired.length||health.missingRecommended.length});
  const ready=tracks.filter(track=>track.status!=="published"&&!trackHealth(track).missingRequired.length);
  metric("new enquiries",enquiries.filter(item=>item.status==="new").length);
  metric("dj applications",enquiries.filter(item=>item.type==="dj-access"&&item.status==="new").length);
  metric("orders",orders.length);metric("missing metadata",missing.length);metric("ready to publish",ready.length);
}

function applyModuleVisibility(){
  const buttons=[...(nav?.querySelectorAll("button")||[])];
  if(!visibility.services)buttons.find(button=>/Mixing Projects/i.test(button.textContent))?.classList.add("module-hidden");
  if(!visibility.vinyl)buttons.find(button=>/Vinyl Projects/i.test(button.textContent))?.classList.add("module-hidden");
}

const labels={coverUrl:"Artwork",previewUrl:"Preview MP3",masterPath:"Master WAV",releaseTiming:"Release date",moodTags:"Mood",seoTitle:"SEO title",seoDescription:"SEO",ogImageUrl:"Share image",distributionReleaseId:"Distribution ID",releaseChecklistNotes:"Checklist notes"};
const fieldTargets={coverUrl:"cover",previewUrl:"preview",masterPath:"master",releaseTiming:"releaseDate"};
const recommended=["bpm","key","moodTags","seoTitle","seoDescription","ogImageUrl","isrc","upc","prsId","pplId","distributionReleaseId","spotifyUrl","appleMusicUrl","soundcloudUrl","youtubeMusicUrl","releaseChecklistNotes"];

function missingValue(track,field){
  const value=track[field];
  if(field==="moodTags")return!(Array.isArray(value)?value.length:value);
  return!value;
}

function renderLibrary(){
  if(!library)return;
  library.classList.remove("music-library-demo");
  library.innerHTML=`<table class="library-table music-library-table"><thead><tr><th>Artwork</th><th>Track</th><th>Genre / subgenre</th><th>BPM</th><th>Key</th><th>Mood</th><th>Price</th><th>Status</th><th>Store</th><th>DJ promo</th><th>Latest / featured</th><th>Purchase</th><th>Health</th><th>Missing fields</th><th>Actions</th></tr></thead><tbody>${tracks.map(track=>{
    const health=trackHealth(track),readiness=trackReadiness(track);
    const required=[...health.missingRequired];
    const suggested=[...new Set([...health.missingRecommended,...recommended.filter(field=>missingValue(track,field))])].filter(field=>!required.includes(field));
    const level=required.length?"red":suggested.length?"amber":"green";
    const status=level==="red"?"Blocked":level==="amber"?"Needs polish":"Ready";
    const requiredChips=required.map(field=>`<button type="button" data-library-chip="${escapeHtml(track.id)}" data-field="${escapeHtml(fieldTargets[field]||field)}" data-kind="required">${escapeHtml(labels[field]||field)}</button>`).join("");
    const polishSummary=suggested.length?`<span class="polish-summary" title="${escapeHtml(suggested.map(field=>labels[field]||field).join(", "))}">${suggested.length} polish item${suggested.length===1?"":"s"}</span>`:"";
    const missingSummary=requiredChips||polishSummary?`${requiredChips}${polishSummary}`:"✓ Complete";
    const readinessPill=(key,label,group)=>{const missing=Object.entries(group.checks).filter(([,value])=>!value).map(([field])=>field).join(", ");return`<button type="button" class="readiness-pill ${!group.enabled?"off":group.ready?"ready":"work"}" data-track-readiness="${key}" title="Open ${label} fields. ${escapeHtml(missing||"Complete")}"><b>${label}</b><em>${group.enabled?`${group.complete}/${group.total}`:"off"}</em></button>`};
    return `<tr data-track-row="${escapeHtml(track.id)}"><td><img src="${escapeHtml(track.coverUrl||"icons/fallback.png")}" alt=""></td><td><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist||"Play Productions")}</small></td><td>${escapeHtml(track.style||"—")}<small>${escapeHtml(track.subgenre||"")}</small></td><td>${track.bpm||"—"}</td><td>${escapeHtml(track.key||"—")}</td><td>${escapeHtml((track.moodTags||[]).join(", ")||"—")}</td><td>£${Number(track.price).toFixed(2)}</td><td><span class="track-status-value">${escapeHtml(track.status)}</span></td><td>${track.showInStore?"✓":"×"}</td><td>${track.showInDjPool?"✓":"×"}</td><td>${track.showInLatest?"Latest ":""}${track.featured?"★":"—"}</td><td>${track.purchaseEnabled?"✓":"×"}</td><td><div class="readiness-groups">${readinessPill("web","Web",readiness.website)}${readinessPill("sale","Sale",readiness.sale)}${readinessPill("dj","DJ",readiness.dj)}${readinessPill("release","Release",readiness.release)}</div></td><td><div class="missing-chips">${missingSummary}</div></td><td><div class="track-library-actions"><button type="button" class="button ghost library-edit-button" data-library-edit="${escapeHtml(track.id)}">Update / edit</button><button type="button" class="track-archive-button" data-track-archive="${escapeHtml(track.id)}">Archive</button><button type="button" class="track-delete-button" data-track-delete-permanent="${escapeHtml(track.id)}">Delete document</button></div></td></tr>`;
  }).join("")}</tbody></table>`;
}

const editorFields=["title","artist","releaseTitle","slug","status","style","subgenre","bpm","key","moodTags","teaser","description","price","releaseDate","sortPriority","adminNotes","seoTitle","seoDescription","ogImageUrl","shareImageUrl","featuredImageUrl","isrc","upc","tunecoreUrl","distributionReleaseId","hyperfollowUrl","prsId","pplId","spotifyUrl","appleMusicUrl","soundcloudUrl","youtubeMusicUrl","mp3Url","wavPath","composerDetails","producerDetails","publisherDetails","distributionDate","copyrightNotes","releaseChecklistNotes","newTrackNotificationSentAt","notificationNotes","socialPromoStatus","socialPromoNotes"];
const editorChecks=["dateTbc","showInStore","showInDjPool","showInLatest","featured","allowExclusiveEnquiry","purchaseEnabled","placeholderArtwork","prsRegistered","pplRegistered","tunecoreUploaded","distributedToStores","samplesChecked","tracklibChecked","distributionUploaded","releaseDateConfirmed","publicWebsiteUpdated","newTrackNotificationSent"];

function openFullEditor(id,focusField=""){
  const track=tracks.find(item=>String(item.id)===String(id));
  if(!track)return;
  document.querySelector("#trackEditor").hidden=false;
  document.querySelector("#editingId").value=track.id;
  for(const field of editorFields){
    const input=document.querySelector(`#${field}`);
    if(input)input.value=field==="moodTags"?(track.moodTags||[]).join(", "):track[field]??"";
  }
  for(const field of editorChecks){
    const input=document.querySelector(`#${field}`);
    if(input)input.checked=Boolean(track[field]);
  }
  document.querySelector("#editorTitle").textContent=`Edit ${track.title}`;
  document.querySelector("#trackForm")?.dispatchEvent(new Event("input",{bubbles:true}));
  document.querySelector("#trackEditor").scrollIntoView({behavior:"smooth",block:"start"});
  if(focusField)setTimeout(()=>{
    const input=document.querySelector(`#${focusField}`);
    input?.closest(".field,.file-field")?.classList.add("field-required");
    input?.focus();input?.scrollIntoView({behavior:"smooth",block:"center"});
  },80);
}

library?.addEventListener("click",event=>{
  const chip=event.target.closest("[data-library-chip]");
  const edit=event.target.closest("[data-library-edit]");
  if(chip){event.preventDefault();event.stopImmediatePropagation();openFullEditor(chip.dataset.libraryChip,chip.dataset.field)}
  else if(edit){event.preventDefault();openFullEditor(edit.dataset.libraryEdit)}
},true);

tracks=await loadTracks({includeAdmin:true});
if(firebaseReady&&!globalThis.playAdminPreviewOnly)[enquiries,orders]=await Promise.all([boundedDocs("enquiries"),boundedDocs("orders")]);
else{try{enquiries=JSON.parse(localStorage.getItem("playDemoEnquiries")||"[]")}catch{enquiries=[]}enquiries.push({type:"dj-access",status:"new"},{type:"exclusive-rights",status:"new"})}
visibility=(await getSiteSettings()).pageVisibility;
renderOverview();renderLibrary();applyModuleVisibility();
window.addEventListener("play-admin-dashboard-rendered",renderOverview);
globalThis.polishAdminReady=true;
window.dispatchEvent(new Event("polishadminready"));
