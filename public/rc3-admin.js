import { firebaseReady } from "./platform-data.js";
import { getSiteSettings } from "./site-settings.js";
import "./music-library-export.js";

const keyInput=document.querySelector("#key");
if(keyInput&&keyInput.tagName!=="SELECT"){
  const select=document.createElement("select");
  select.id="key";
  [
    "Unknown / Not Set","C Major / A Minor","C# Major / A# Minor","D Major / B Minor",
    "Eb Major / C Minor","E Major / C# Minor","F Major / D Minor","F# Major / D# Minor",
    "G Major / E Minor","Ab Major / F Minor","A Major / F# Minor","Bb Major / G Minor",
    "B Major / G# Minor"
  ].forEach(value=>select.add(new Option(value,value==="Unknown / Not Set"?"":value)));
  keyInput.replaceWith(select);
}

const {pageVisibility}=await getSiteSettings();
document.querySelectorAll('[data-view="projects"],[data-view="cases"],[data-module-view="vinylProjects"]').forEach(button=>{
  button.hidden=!pageVisibility.services;
});

const dashboard=document.querySelector('[data-page="dashboard"]');
if(dashboard&&!document.querySelector("#systemStatus")){
  dashboard.querySelector(".stat-grid")?.insertAdjacentHTML("afterend",`
    <section id="systemStatus" class="panel system-status-card">
      <div class="admin-section-title"><h2>System / setup status</h2><span>Module 1</span></div>
      <div class="setup-status-grid">
        <span><strong>Firebase / Auth</strong><em class="${firebaseReady?"ready":"pending"}">${firebaseReady?"Connected":"Setup required"}</em></span>
        <span><strong>Storage / downloads</strong><em class="pending">Verify live files</em></span>
        <span><strong>Payments</strong><em class="pending">Live keys required</em></span>
        <span><strong>Email notifications</strong><em class="pending">Provider setup required</em></span>
        <span><strong>Analytics / Search Console</strong><em class="pending">Post-launch</em></span>
      </div>
    </section>`);
}

const orderList=document.querySelector("#orderList");
setTimeout(()=>{
  if(orderList&&!orderList.querySelector("table")&&!orderList.textContent.trim()){
    orderList.innerHTML=`<div class="demo-banner"><strong>Preview order data</strong><span>Live orders populate after payment setup.</span></div>
      <table class="portal-table admin-orders-table"><thead><tr><th>Order</th><th>Customer</th><th>Email</th><th>Item</th><th>Type</th><th>Amount</th><th>Method</th><th>Payment</th><th>Fulfilment</th><th>Date</th><th>Access</th></tr></thead>
      <tbody><tr><td>DEMO-001</td><td>Sample Customer</td><td>customer@example.com</td><td>Lonely Way To Go</td><td>Digital track</td><td>£1.99</td><td>Stripe</td><td>Paid</td><td>Ready</td><td>28 Jun 2026</td><td>Active</td></tr></tbody></table>`;
  }
},800);

const djList=document.querySelector("#moduleDjList");
const enhanceDjExport=()=>{
  const view=document.querySelector('[data-page="djAccess"]');
  if(!view||view.querySelector("[data-export-djs]"))return;
  view.querySelector(".admin-section-title")?.insertAdjacentHTML("beforeend",'<button type="button" data-export-djs>Export DJs + notes</button>');
};
enhanceDjExport();
window.addEventListener("play-admin-module-ready",enhanceDjExport);
[250,750,1500].forEach(delay=>setTimeout(enhanceDjExport,delay));

document.addEventListener("click",event=>{
  if(!event.target.closest("[data-export-djs]"))return;
  const rows=[...djList.querySelectorAll("tr")].map(row=>[...row.children].map(cell=>`"${cell.textContent.trim().replaceAll('"','""')}"`).join(","));
  const blob=new Blob([rows.join("\n")],{type:"text/csv"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="play-productions-dj-database.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

await import("./rc4-admin.js");
