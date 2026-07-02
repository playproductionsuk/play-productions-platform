import{firebaseApp,firebaseReady,db,escapeHtml,loadTracks,normaliseTrack,slugify,trackHealth,trackReadiness}from"./platform-data.js";import{getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut}from"https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";import{collection,deleteDoc,doc,getDoc,getDocs,serverTimestamp,setDoc,updateDoc}from"https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";import{deleteObject,getDownloadURL,getStorage,ref,uploadBytesResumable}from"https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";
document.documentElement.classList.add("ui-ready");document.querySelectorAll("form input,form select,form textarea").forEach((field,index)=>{if(!field.id)field.id=`admin-field-${index}`;if(!field.name)field.name=field.id});const loginEmail=document.querySelector("#email"),loginPassword=document.querySelector("#password");if(loginEmail){loginEmail.name="email";loginEmail.autocomplete="email"}if(loginPassword){loginPassword.name="password";loginPassword.autocomplete="current-password"}document.querySelector("#loginForm button")?.setAttribute("type","submit");
const auth=firebaseApp?getAuth(firebaseApp):null,storage=firebaseApp?getStorage(firebaseApp):null,login=document.querySelector("#loginPanel"),portal=document.querySelector("#adminPortal"),form=document.querySelector("#trackForm"),progress=document.querySelector("#uploadProgress");let state={tracks:[],enquiries:[],projects:[],orders:[],cases:[]},libraryFilter="all";
const fields=["title","artist","releaseTitle","slug","status","style","subgenre","bpm","key","moodTags","teaser","description","price","releaseDate","sortPriority","adminNotes","seoTitle","seoDescription","ogImageUrl","shareImageUrl","featuredImageUrl","isrc","upc","tunecoreUrl","distributionReleaseId","hyperfollowUrl","prsId","pplId","spotifyUrl","appleMusicUrl","soundcloudUrl","youtubeMusicUrl","mp3Url","wavPath","composerDetails","producerDetails","publisherDetails","distributionDate","copyrightNotes","releaseChecklistNotes","newTrackNotificationSentAt","notificationNotes","socialPromoStatus","socialPromoNotes"],checks=["dateTbc","showInStore","showInDjPool","showInLatest","featured","allowExclusiveEnquiry","purchaseEnabled","placeholderArtwork","prsRegistered","pplRegistered","tunecoreUploaded","distributedToStores","samplesChecked","tracklibChecked","distributionUploaded","releaseDateConfirmed","publicWebsiteUpdated","newTrackNotificationSent"];
async function admin(user){return(await getDoc(doc(db,"admins",user.uid))).exists()}
document.querySelector("#loginForm").addEventListener("submit",async e=>{e.preventDefault();document.querySelector("#loginStatus").textContent="Signing in…";try{await signInWithEmailAndPassword(auth,document.querySelector("#email").value,document.querySelector("#password").value)}catch(err){document.querySelector("#loginStatus").textContent="Sign-in failed."}});document.querySelector("#signOutButton").addEventListener("click",()=>signOut(auth));
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-view]").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".admin-view").forEach(v=>v.hidden=v.dataset.page!==b.dataset.view)}));
async function loadAll(){const names=["enquiries","projects","orders","caseStudies"];state.tracks=await loadTracks({includeAdmin:true});const snaps=await Promise.all(names.map(n=>getDocs(collection(db,n))));state.enquiries=snaps[0].docs.map(d=>({id:d.id,...d.data()}));state.projects=snaps[1].docs.map(d=>({id:d.id,...d.data()}));state.orders=snaps[2].docs.map(d=>({id:d.id,...d.data()}));state.cases=snaps[3].docs.map(d=>({id:d.id,...d.data()}));renderAll()}
function row(title,meta,body,actions=""){return`<article class="data-row"><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(meta)}</p>${body?`<small>${escapeHtml(body)}</small>`:""}</div><div class="row-actions">${actions}</div></article>`}
function renderAll(){const attention=state.tracks.filter(t=>trackHealth(t).score<100),newEnquiries=state.enquiries.filter(e=>e.status==="new"),activeProjects=state.projects.filter(p=>!["Complete","Archived"].includes(p.status));document.querySelector("#statGrid").innerHTML=[["New enquiries",newEnquiries.length],["Active projects",activeProjects.length],["Orders",state.orders.length],["Tracks needing work",attention.length]].map(([a,b])=>`<article><strong>${b}</strong><span>${a}</span></article>`).join("");document.querySelector("#actionList").innerHTML=[...newEnquiries.slice(0,4).map(e=>row(e.artistName||e.customerName||"New enquiry",e.type||"Enquiry",e.trackTitle||e.projectTitle||"Review and reply")),...activeProjects.slice(0,4).map(p=>row(p.projectTitle||"Project",p.status||"Quote requested",p.serviceType||""))].join("")||`<p class="empty">Nothing urgent. A rare and beautiful thing.</p>`;document.querySelector("#healthList").innerHTML=attention.slice(0,8).map(t=>{const h=trackHealth(t);return`<article class="health-row"><div class="health-score">${h.score}%</div><div><strong>${escapeHtml(t.title)}</strong><p>${escapeHtml([...h.missingRequired,...h.missingRecommended].join(", ")||"Complete")}</p></div><button data-edit="${escapeHtml(t.id)}">Quick edit</button></article>`}).join("")||`<p class="empty">All tracks are complete.</p>`;renderMusicLibrary();renderCollections()}
function renderTracks(){const target=document.querySelector("#adminTracks"),labels={coverUrl:"Artwork",previewUrl:"Preview MP3",masterPath:"Master WAV",releaseTiming:"Release date",moodTags:"Mood",seoDescription:"SEO",ogImageUrl:"Share image"};target.innerHTML=state.tracks.length?`<table class="library-table music-library-table"><thead><tr><th>Artwork</th><th>Track</th><th>Genre / subgenre</th><th>BPM</th><th>Key</th><th>Mood</th><th>Price</th><th>Status</th><th>Store</th><th>DJ promo</th><th>Latest / featured</th><th>Purchase</th><th>Health</th><th>Missing fields</th><th>Actions</th></tr></thead><tbody>${state.tracks.map(t=>{const h=trackHealth(t),level=h.missingRequired.length?"red":h.missingRecommended.length?"amber":"green",status=level==="red"?"Blocked":level==="amber"?"Needs polish":"Ready",required=h.missingRequired.map(field=>`<button type="button" data-kind="required" data-field="${escapeHtml(field)}">${escapeHtml(labels[field]||field)}</button>`).join(""),polish=h.missingRecommended.length?`<span class="polish-summary" title="${escapeHtml(h.missingRecommended.map(field=>labels[field]||field).join(", "))}">${h.missingRecommended.length} polish item${h.missingRecommended.length===1?"":"s"}</span>`:"";return`<tr><td><img src="${escapeHtml(t.coverUrl||"icons/fallback.png")}" alt=""></td><td><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.artist||"Play Productions")}</small></td><td>${escapeHtml(t.style||"—")}<small>${escapeHtml(t.subgenre||"")}</small></td><td>${t.bpm||"—"}</td><td>${escapeHtml(t.key||"—")}</td><td>${escapeHtml((t.moodTags||[]).join(", ")||"—")}</td><td>£${Number(t.price).toFixed(2)}</td><td>${escapeHtml(t.status)}</td><td>${t.showInStore?"✓":"×"}</td><td>${t.showInDjPool?"✓":"×"}</td><td>${t.showInLatest?"Latest ":""}${t.featured?"★":"—"}</td><td>${t.purchaseEnabled?"✓":"×"}</td><td><span class="traffic ${level}">${status}</span><small>${h.score}%</small></td><td><div class="missing-chips">${required||polish?required+polish:"✓ Complete"}</div></td><td><button class="button ghost library-edit-button" data-edit="${escapeHtml(t.id)}">Update / edit</button><button class="danger" data-delete="${escapeHtml(t.id)}">Delete</button></td></tr>`}).join("")}</tbody></table>`:`<p class="empty">No tracks yet.</p>`}
const missingFieldLabels={title:"Title",slug:"Slug",style:"Genre / style",bpm:"BPM",artwork:"Artwork",mp3:"MP3",master:"WAV / master",teaser:"Short description",status:"Status",showInStore:"Show on website",showInDjPoolDecision:"DJ promo decision",releaseTiming:"Release date or TBC",purchaseEnabled:"Purchase enabled",price:"Price",showInDjPool:"Show in DJ promo",compatibleStatus:"DJ-compatible status",prsRegistered:"PRS registered",samplesChecked:"Samples checked",tracklibChecked:"Tracklib checked",distributionUploaded:"Distribution uploaded",isrc:"ISRC",upc:"UPC",distributionId:"Distribution / release ID",releaseDateConfirmed:"Release date confirmed",publicWebsiteUpdated:"Public website updated",notificationTracked:"Notification sent",socialPromo:"Social promo status",notificationNotes:"Notification notes",socialPromoNotes:"Social promo notes",adminNotes:"Internal notes"};
const missingFieldTargets={artwork:"cover",mp3:"preview",master:"master",releaseTiming:"releaseDate",showInDjPoolDecision:"showInDjPool",compatibleStatus:"status",distributionId:"distributionReleaseId",notificationTracked:"newTrackNotificationSent",socialPromo:"socialPromoStatus"};
function buildMissingDataRows(){
  const priorityOrder={High:0,Medium:1,Low:2},rows=[];
  state.tracks.filter(track=>track.status!=="archived").forEach(track=>{
    const readiness=trackReadiness(track);
    [["web","Web",readiness.website,"High"],["sale","Sale",readiness.sale,"High"],["dj","DJ",readiness.dj,"High"],["release","Release",readiness.release,"Medium"]].forEach(([areaKey,area,group,priority])=>{
      Object.entries(group.checks).filter(([,complete])=>!complete).forEach(([field])=>rows.push({priority:areaKey==="release"&&["notificationTracked","socialPromo"].includes(field)?"Low":priority,track,areaKey,area,field}));
    });
    [["notificationNotes","Notification notes"],["socialPromoNotes","Social promo notes"],["adminNotes","Internal notes"]].forEach(([field])=>{if(!track[field])rows.push({priority:"Low",track,areaKey:"release",area:"Release",field})});
  });
  return rows.sort((a,b)=>priorityOrder[a.priority]-priorityOrder[b.priority]||String(a.track.title).localeCompare(String(b.track.title))||a.area.localeCompare(b.area));
}
function applyMusicLibraryView(){
  const query=(document.querySelector("#adminSearch")?.value||"").trim().toLowerCase();
  const catalogue=document.querySelector("#musicCatalogueTable"),missing=document.querySelector("#musicMissingDataTable"),showMissing=libraryFilter==="missing-data";
  if(catalogue)catalogue.hidden=showMissing;
  if(missing)missing.hidden=!showMissing;
  document.querySelectorAll("#musicCatalogueTable tbody tr").forEach(row=>{
    const keys=(row.dataset.libraryFilters||"").split(" ");
    const archived=keys.includes("archived");
    const matchesFilter=libraryFilter==="archived"?archived:!archived&&keys.includes(libraryFilter);
    row.hidden=!matchesFilter||Boolean(query&&!row.textContent.toLowerCase().includes(query));
  });
  document.querySelectorAll("#musicMissingDataTable tbody tr").forEach(row=>row.hidden=!showMissing||Boolean(query&&!row.textContent.toLowerCase().includes(query)));
}
function renderMusicLibrary(){
  const target=document.querySelector("#adminTracks"),title=document.querySelector('[data-page="tracks"] .admin-section-title');
  if(!target)return;
  let filters=document.querySelector("#musicLibraryFilters");
  if(title&&!filters){filters=document.createElement("div");filters.id="musicLibraryFilters";filters.className="music-library-filters";title.insertAdjacentElement("afterend",filters)}
  const missingRows=buildMissingDataRows();
  const counts=state.tracks.reduce((result,track)=>{
    const readiness=trackReadiness(track),archived=track.status==="archived";
    if(!archived)result.all++;
    if(!archived&&!readiness.website.ready)result.web++;
    if(!archived&&!readiness.sale.ready)result.sale++;
    if(!archived&&!readiness.dj.ready)result.dj++;
    if(!archived&&!readiness.release.ready)result.release++;
    if(archived)result.archived++;
    return result;
  },{all:0,web:0,sale:0,dj:0,release:0,archived:0});
  counts["missing-data"]=missingRows.length;
  const filterLabels={all:"All",web:"Web",sale:"Sale",dj:"DJ",release:"Release",archived:"Archived","missing-data":"Missing Data"};
  if(filters)filters.innerHTML=["all","web","sale","dj","release","archived","missing-data"].map(key=>`<button type="button" class="${libraryFilter===key?"active":""}" data-music-filter="${key}">${filterLabels[key]} <span>${counts[key]}</span></button>`).join("");
  const catalogue=state.tracks.length?`<table id="musicCatalogueTable" class="library-table music-library-table"><thead><tr><th>Artwork</th><th>Track</th><th>Genre / subgenre</th><th>BPM</th><th>Key</th><th>Mood</th><th>Price</th><th>Status</th><th>Store</th><th>DJ promo</th><th>Latest / featured</th><th>Purchase</th><th>Health</th><th>Actions</th></tr></thead><tbody>${state.tracks.map(track=>{
    const health=trackHealth(track),readiness=trackReadiness(track),archived=track.status==="archived";
    const readinessPill=(key,label,group)=>{const missing=Object.entries(group.checks).filter(([,value])=>!value).map(([field])=>field).join(", ");return`<button type="button" class="readiness-pill ${!group.enabled?"off":group.ready?"ready":"work"}" data-track-readiness="${key}" title="Open ${label} fields. ${escapeHtml(missing||"Complete")}"><b>${label}</b><em>${group.enabled?`${group.complete}/${group.total}`:"off"}</em></button>`};
    const keys=["all",...(!readiness.website.ready?["web"]:[]),...(!readiness.sale.ready?["sale"]:[]),...(!readiness.dj.ready?["dj"]:[]),...(!readiness.release.ready?["release"]:[]),...(archived?["archived"]:[])];
    const archiveAction=archived?`<button type="button" class="track-restore-button" data-track-restore="${escapeHtml(track.id)}">Restore</button>`:`<button type="button" class="track-archive-button" data-track-archive="${escapeHtml(track.id)}">Archive</button>`;
    return`<tr data-track-row="${escapeHtml(track.id)}" data-library-filters="${keys.join(" ")}"><td><img src="${escapeHtml(track.coverUrl||"icons/fallback.png")}" alt=""></td><td><strong>${escapeHtml(track.title)}</strong><small>${escapeHtml(track.artist||"Play Productions")}</small></td><td>${escapeHtml(track.style||"—")}<small>${escapeHtml(track.subgenre||"")}</small></td><td>${track.bpm||"—"}</td><td>${escapeHtml(track.key||"—")}</td><td>${escapeHtml((track.moodTags||[]).join(", ")||"—")}</td><td>£${Number(track.price||0).toFixed(2)}</td><td><span class="track-status-value">${escapeHtml(track.status||"draft")}</span></td><td>${track.showInStore?"✓":"×"}</td><td>${track.showInDjPool?"✓":"×"}</td><td>${track.showInLatest?"Latest ":""}${track.featured?"★":"—"}</td><td>${track.purchaseEnabled?"✓":"×"}</td><td><div class="readiness-groups">${readinessPill("web","Web",readiness.website)}${readinessPill("sale","Sale",readiness.sale)}${readinessPill("dj","DJ",readiness.dj)}${readinessPill("release","Release",readiness.release)}</div><small>${health.score}% overall</small></td><td><div class="track-library-actions"><button type="button" class="button ghost library-edit-button" data-edit="${escapeHtml(track.id)}">Update / edit</button>${archiveAction}<button type="button" class="track-delete-button" data-track-delete-permanent="${escapeHtml(track.id)}">Delete</button></div></td></tr>`;
  }).join("")}</tbody></table>`:`<p class="empty">No tracks yet.</p>`;
  const missingTable=`<table id="musicMissingDataTable" class="library-table missing-data-table" hidden><thead><tr><th>Priority</th><th>Track</th><th>Area</th><th>Missing field</th><th>Current value</th><th>Action</th></tr></thead><tbody>${missingRows.map(item=>`<tr><td><span class="missing-priority ${item.priority.toLowerCase()}">${item.priority}</span></td><td><strong>${escapeHtml(item.track.title||"Untitled track")}</strong></td><td>${item.area}</td><td>${escapeHtml(missingFieldLabels[item.field]||item.field)}</td><td><span class="missing-current">Missing</span></td><td><button type="button" class="button ghost missing-data-edit" data-missing-track="${escapeHtml(item.track.id)}" data-missing-area="${item.areaKey}" data-missing-field="${escapeHtml(missingFieldTargets[item.field]||item.field)}">Edit</button></td></tr>`).join("")||'<tr><td colspan="6" class="empty">No missing track data.</td></tr>'}</tbody></table>`;
  target.innerHTML=catalogue+missingTable;
  applyMusicLibraryView();
}
function renderCollections(){document.querySelector("#enquiryList").innerHTML=state.enquiries.map(e=>row(e.artistName||e.customerName||"Enquiry",`${e.type||"enquiry"} · ${e.status||"new"}`,e.trackTitle||e.projectTitle||e.email,`<select data-enquiry-status="${e.id}">${["new","replied","negotiating","closed","converted"].map(s=>`<option ${e.status===s?"selected":""}>${s}</option>`).join("")}</select>`)).join("")||`<p class="empty">No enquiries.</p>`;document.querySelector("#projectList").innerHTML=state.projects.map(p=>row(p.projectTitle||"Project",`${p.serviceType||"service"} · ${p.status||"Quote requested"}`,p.customerName||p.customerUid||"",`<select data-project-status="${p.id}">${["Quote requested","Waiting for files","Files received","In progress","Ready for review","Revision requested","Approved","Final files uploaded","Complete","Archived"].map(s=>`<option ${p.status===s?"selected":""}>${s}</option>`).join("")}</select>`)).join("")||`<p class="empty">No projects.</p>`;document.querySelector("#orderList").innerHTML=state.orders.map(o=>row(o.productTitle||o.orderType||"Order",`${o.paymentStatus||o.status||"pending"} · ${o.provider||"unassigned"}`,o.email||o.customerUid||"","")).join("")||`<p class="empty">No orders.</p>`;document.querySelector("#caseList").innerHTML=state.cases.map(c=>row(c.trackTitle||"Case study",`${c.serviceType||"service"} · ${c.published?"published":"draft"}`,c.artistName||"","")).join("")||`<p class="empty">No case studies yet.</p>`}
function formTrack(){const raw={};fields.forEach(f=>raw[f]=document.querySelector(`#${f}`).value.trim());checks.forEach(f=>raw[f]=document.querySelector(`#${f}`).checked);raw.bpm=Number(raw.bpm)||null;raw.price=Number(raw.price)||0;raw.sortPriority=Number(raw.sortPriority)||0;raw.moodTags=raw.moodTags.split(",").map(x=>x.trim()).filter(Boolean);raw.slug=raw.slug||slugify(raw.title);raw.productType="digital-track";return normaliseTrack(raw)}
function checklist(){const formValues=formTrack(),editingId=document.querySelector("#editingId")?.value,existing=state.tracks.find(item=>String(item.id)===String(editingId)),assets=preservedAssetPayload(existing||{});if(document.querySelector("#cover")?.files[0])assets.coverUrl="pending";if(document.querySelector("#preview")?.files[0]){assets.previewUrl="pending";assets.previewPath="pending";assets.mp3Path="pending"}if(document.querySelector("#master")?.files[0]){assets.masterPath="pending";assets.wavPath="pending"}const t=normaliseTrack({...formValues,...assets}),h=trackHealth(t),readiness=trackReadiness(t),webMissing=Object.entries(readiness.website.checks).filter(([,complete])=>!complete).map(([field])=>missingFieldLabels[field]||field),useWeb=t.showInStore===true,score=useWeb?Math.round(readiness.website.complete/readiness.website.total*100):h.score,required=useWeb?webMissing:h.missingRequired.map(field=>missingFieldLabels[field]||field);document.querySelector("#releaseChecklist").innerHTML=`<strong>${score}% complete for ${escapeHtml(useWeb?"Website":t.status)}</strong><p>${required.length?`Required: ${escapeHtml(required.join(", "))}`:"Mandatory fields complete."}</p>${!useWeb&&h.missingRecommended.length?`<small>Recommended: ${escapeHtml(h.missingRecommended.join(", "))}</small>`:""}`;const summary=document.querySelector("#trackEditorReadinessSummary");if(summary){const card=(label,group)=>{const missing=Object.entries(group.checks).filter(([,complete])=>!complete).map(([field])=>missingFieldLabels[field]||field);const state=!group.enabled?"off":group.ready?"ready":"work";return`<article class="${state}" title="${escapeHtml(missing.join(", ")||"Complete")}"><strong>${label}</strong><span>${group.enabled?`${group.complete}/${group.total}`:"Off"}</span><small>${escapeHtml(missing.slice(0,2).join(", ")||"Complete")}${missing.length>2?` +${missing.length-2}`:""}</small></article>`};summary.innerHTML=card("Web",readiness.website)+card("Sale",readiness.sale)+card("DJ",readiness.dj)+card("Release",readiness.release)}return h}form.addEventListener("input",checklist);
function clearForm(){form.reset();document.querySelector("#editingId").value="";document.querySelector("#price").value="1.29";document.querySelector("#sortPriority").value="0";document.querySelector("#editorTitle").textContent="Add track";checklist()}
function editTrack(id){const t=state.tracks.find(x=>String(x.id)===String(id));if(!t)return;document.querySelector("#trackEditor").hidden=false;document.querySelector("#editingId").value=t.id;fields.forEach(f=>document.querySelector(`#${f}`).value=f==="moodTags"?t.moodTags.join(", "):t[f]??"");checks.forEach(f=>document.querySelector(`#${f}`).checked=Boolean(t[f]));document.querySelector("#editorTitle").textContent=`Edit ${t.title}`;checklist();document.querySelector("#trackEditor").scrollIntoView({behavior:"smooth"})}
document.querySelector("#newTrack").addEventListener("click",()=>{clearForm();document.querySelector("#trackEditor").hidden=false});document.querySelector("#closeEditor").addEventListener("click",()=>document.querySelector("#trackEditor").hidden=true);
function upload(path,file,label,{returnDownloadUrl=true}={}){return new Promise((resolve,reject)=>{const task=uploadBytesResumable(ref(storage,path),file,{contentType:file.type});task.on("state_changed",s=>progress.textContent=`${label}: ${Math.round(s.bytesTransferred/s.totalBytes*100)}%`,reject,async()=>{try{resolve(returnDownloadUrl?await getDownloadURL(task.snapshot.ref):path)}catch(error){reject(new Error(`${label} uploaded, but its saved reference could not be resolved: ${error.message}`))}})})}
function pcm(samples,start,length){const out=new Int16Array(length);for(let i=0;i<length;i++){const v=Math.max(-1,Math.min(1,samples[start+i]||0));out[i]=v<0?v*32768:v*32767}return out}
async function previewFrom(wav){progress.textContent="Making preview…";const ctx=new AudioContext(),audio=await ctx.decodeAudioData(await wav.arrayBuffer()),channels=Math.min(2,audio.numberOfChannels),total=Math.min(audio.length,audio.sampleRate*75),enc=new lamejs.Mp3Encoder(channels,audio.sampleRate,128),parts=[];for(let i=0;i<total;i+=1152){const len=Math.min(1152,total-i),a=pcm(audio.getChannelData(0),i,len),b=pcm(audio.getChannelData(channels>1?1:0),i,len),chunk=channels>1?enc.encodeBuffer(a,b):enc.encodeBuffer(a);if(chunk.length)parts.push(new Int8Array(chunk))}const end=enc.flush();if(end.length)parts.push(new Int8Array(end));await ctx.close();return new File(parts,"preview.mp3",{type:"audio/mpeg"})}
const protectedAssetFields=["coverUrl","coverPath","thumbnail","previewUrl","previewPath","mp3Path","mp3Url","url","masterPath","wavPath"];
function preservedAssetPayload(record={}){
  const payload={};
  protectedAssetFields.forEach(field=>{if(Object.prototype.hasOwnProperty.call(record,field)&&record[field]!==undefined&&record[field]!==null)payload[field]=record[field]});
  if(!payload.coverUrl&&record.thumbnail)payload.coverUrl=record.thumbnail;
  if(!payload.previewUrl&&record.url)payload.previewUrl=record.url;
  if(!payload.mp3Path&&record.previewPath)payload.mp3Path=record.previewPath;
  if(!payload.masterPath&&record.wavPath)payload.masterPath=record.wavPath;
  if(!payload.wavPath&&record.masterPath)payload.wavPath=record.masterPath;
  return payload;
}
function preservedLicences(record,track){
  const licences=record?.licences&&typeof record.licences==="object"?record.licences:{};
  const personal=licences.personal&&typeof licences.personal==="object"?licences.personal:{};
  return {...licences,personal:{...personal,name:personal.name||"Personal digital download",price:track.price,enabled:personal.enabled??true,summary:personal.summary||"For personal listening. No commercial vocal or exclusive rights."}};
}
function showTrackSaveNotice(message,kind="success"){
  let notice=document.querySelector("#trackSaveNotice");
  if(!notice){
    notice=document.createElement("div");
    notice.id="trackSaveNotice";
    notice.className="track-save-notice";
    notice.setAttribute("role","status");
    document.body.appendChild(notice);
  }
  notice.className=`track-save-notice ${kind}`;
  notice.textContent=message;
  notice.hidden=false;
  clearTimeout(showTrackSaveNotice.timer);
  showTrackSaveNotice.timer=setTimeout(()=>notice.hidden=true,6000);
}
form.addEventListener("submit",async e=>{
  e.preventDefault();
  const buttons=[document.querySelector("#saveTrack"),document.querySelector("[data-save-track-top]")].filter(Boolean);
  buttons.forEach(button=>button.disabled=true);
  try{
    const track=formTrack(),editingId=document.querySelector("#editingId").value;
    const existing=state.tracks.find(item=>String(item.id)===String(editingId));
    let existingRecord=existing?{...existing}:null;
    if(existing){
      const snapshot=await getDoc(doc(db,"tracks",existing.id));
      if(snapshot.exists())existingRecord={id:snapshot.id,...snapshot.data()};
    }
    const documentId=existing?.id||track.slug;
    const cover=document.querySelector("#cover").files[0],master=document.querySelector("#master").files[0];
    let preview=document.querySelector("#preview").files[0];
    const assets=preservedAssetPayload(existingRecord||{});
    const manualWavPath=document.querySelector("#wavPath")?.value.trim()||"";
    const manualMp3Url=document.querySelector("#mp3Url")?.value.trim()||"";
    if(manualWavPath&&manualWavPath!==String(existingRecord?.wavPath||"")){assets.wavPath=manualWavPath;assets.masterPath=manualWavPath}
    if(manualMp3Url&&manualMp3Url!==String(existingRecord?.mp3Url||""))assets.mp3Url=manualMp3Url;
    const placeholderArtwork=document.querySelector("#placeholderArtwork")?.checked===true;
    if(placeholderArtwork&&!assets.coverUrl)assets.coverUrl="icons/fallback.png";
    const planned=normaliseTrack({...existingRecord,...track,...assets,coverUrl:cover?"pending":assets.coverUrl||"",previewUrl:(preview||master)?"pending":assets.previewUrl||"",masterPath:master?"pending":assets.masterPath||""});
    const health=trackHealth(planned);
    if(["coming-soon","published"].includes(track.status)&&track.showInStore&&health.missingRequired.length){const label=track.status==="coming-soon"?"Coming Soon":"Published";throw new Error(`Cannot save ${label} with Website On. Missing required fields: ${health.missingRequired.join(", ")}`)}
    const stamp=Date.now();
    if(cover){assets.coverPath=`covers/${track.slug}-${stamp}.${cover.name.split(".").pop()}`;assets.coverUrl=await upload(assets.coverPath,cover,"Artwork");assets.thumbnail=assets.coverUrl}
    if(master){assets.masterPath=`masters/${track.slug}-${stamp}.wav`;assets.wavPath=assets.masterPath;if(!preview)preview=await previewFrom(master);await upload(assets.masterPath,master,"Master WAV",{returnDownloadUrl:false})}
    if(preview){assets.previewPath=`previews/${track.slug}-${stamp}.mp3`;assets.previewUrl=await upload(assets.previewPath,preview,"Preview");assets.mp3Path=assets.previewPath;assets.mp3Url=assets.previewUrl;assets.url=assets.previewUrl}
    const payload={...track};
    [...protectedAssetFields,"id","createdAt","updatedAt"].forEach(field=>delete payload[field]);
    payload.placeholderArtwork=placeholderArtwork;
    Object.assign(payload,assets,{
      licences:preservedLicences(existingRecord,track),
      updatedAt:serverTimestamp()
    });
    if(!existingRecord?.createdAt)payload.createdAt=serverTimestamp();
    await setDoc(doc(db,"tracks",documentId),payload,{merge:true});
    progress.textContent=`Saved as ${documentId}.`;
    document.querySelector("#trackEditor").hidden=true;
    showTrackSaveNotice(`Track saved successfully. Firestore document: ${documentId}`);
    try{
      await loadAll();
    }catch(refreshError){
      console.warn("Track saved, but the Music Library could not refresh.",refreshError);
      showTrackSaveNotice(`Track saved as ${documentId}, but the list could not refresh. Reload the admin to confirm.`,"error");
    }
  }catch(err){
    console.error(err);
    progress.textContent=err.message;
    showTrackSaveNotice(`Track save failed: ${err.message}`,"error");
  }finally{
    buttons.forEach(button=>button.disabled=globalThis.playAdminPreviewOnly===true);
  }
});
document.addEventListener("click",async e=>{const chip=e.target.closest(".missing-chips button"),edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]"),filter=e.target.closest("[data-music-filter]");if(filter){libraryFilter=filter.dataset.musicFilter;document.querySelectorAll("[data-music-filter]").forEach(button=>button.classList.toggle("active",button===filter));applyMusicLibraryView();return}if(chip){const trackButton=chip.closest("tr")?.querySelector("[data-edit]"),map={coverUrl:"cover",previewUrl:"preview",masterPath:"master",releaseTiming:"releaseDate"};if(trackButton){editTrack(trackButton.dataset.edit);setTimeout(()=>{const field=document.querySelector(`#${map[chip.dataset.field]||chip.dataset.field}`);field?.closest(".field,.file-field")?.classList.add("field-required");field?.focus();field?.scrollIntoView({behavior:"smooth",block:"center"})},80)}}else if(edit){document.querySelector('[data-view="tracks"]').click();editTrack(edit.dataset.edit)}if(del&&confirm("Delete this track record? Uploaded files are retained for safety.")){await deleteDoc(doc(db,"tracks",del.dataset.delete));await loadAll()}});document.addEventListener("change",async e=>{if(e.target.dataset.enquiryStatus){await updateDoc(doc(db,"enquiries",e.target.dataset.enquiryStatus),{status:e.target.value,updatedAt:serverTimestamp()});await loadAll()}if(e.target.dataset.projectStatus){await updateDoc(doc(db,"projects",e.target.dataset.projectStatus),{status:e.target.value,updatedAt:serverTimestamp()});await loadAll()}});document.querySelector("#adminSearch").addEventListener("input",e=>{const q=e.target.value.toLowerCase();document.querySelectorAll(".data-row,.health-row").forEach(x=>x.hidden=!x.textContent.toLowerCase().includes(q));applyMusicLibraryView()});window.addEventListener("play-admin-track-state-change",()=>loadAll().catch(error=>console.error("Track library refresh failed.",error)));
if(globalThis.playAdminPreviewOnly||!firebaseReady){document.querySelector("#loginStatus").textContent=firebaseReady?"Preview mode is active. Add ?live=1 to this URL for an authorised live admin test.":"Add the Firebase web-app settings before running a live admin test.";document.querySelector("#loginForm button").disabled=true;login.hidden=false;portal.hidden=true}else{document.querySelector("#loginStatus").textContent="Live test mode. Sign in with an authorised admin account.";onAuthStateChanged(auth,async user=>{try{if(user&&await admin(user)){login.hidden=true;portal.hidden=false;document.querySelector("#adminUser").textContent=user.email;window.dispatchEvent(new Event("play-admin-visibility-change"));await loadAll();window.dispatchEvent(new Event("play-admin-live-authenticated"))}else{if(user)await signOut(auth);login.hidden=false;portal.hidden=true}}catch(error){login.hidden=false;portal.hidden=true;document.querySelector("#loginStatus").textContent=`Admin access could not be verified: ${error.message}`}})}
