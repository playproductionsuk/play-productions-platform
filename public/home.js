import { loadTracks, escapeHtml } from "./platform-data.js";

const grid=document.querySelector("#latestGrid");
const year=document.querySelector("#year");
if(year)year.textContent=new Date().getFullYear();

function row(track){
  const meta=[track.style,track.releaseDate&&new Date(`${track.releaseDate}T12:00:00`).toLocaleDateString("en-GB",{month:"short",year:"numeric"})].filter(Boolean).join(" · ");
  return `<article class="release-row"><img src="${escapeHtml(track.coverUrl||"icons/fallback.png")}" alt="Cover art for ${escapeHtml(track.title)}"><div><h3>${escapeHtml(track.title)}</h3>${meta?`<p>${escapeHtml(meta)}</p>`:""}</div><a href="track.html?id=${encodeURIComponent(track.id)}" aria-label="View ${escapeHtml(track.title)}">→</a></article>`;
}

if(grid){
  try{
    const tracks=(await loadTracks()).filter(track=>track.showInLatest&&track.status!=="archived").slice(0,3);
    grid.innerHTML=tracks.length?tracks.map(row).join(""):`<p class="empty">New music is on the way.</p>`;
  }catch(error){
    grid.innerHTML=`<p class="empty">Latest releases could not be loaded.</p>`;
    console.error(error);
  }
}
