const css=document.createElement("link");
css.rel="stylesheet";
css.href="rc5-fixes.css";
document.head.appendChild(css);
await import("./rc6-admin.js");

document.querySelectorAll('[data-view="projects"],[data-view="cases"],[data-module-view="vinylProjects"]').forEach(item=>item.hidden=true);
document.querySelectorAll('[data-inbox-filter="service-quote"],[data-inbox-filter="vinyl"]').forEach(item=>item.hidden=true);

const settings=document.querySelector('[data-page="settings"]');
if(settings&&!settings.dataset.rc5){
  settings.dataset.rc5="true";
  const visibility=settings.querySelector(".settings-pane:not(#socialSettings),.panel");
  const social=settings.querySelector("#socialSettings");
  if(visibility)visibility.dataset.settingsSection="visibility";
  if(social)social.dataset.settingsSection="links";
  const definitions=[
    ["visibility","Public Page Visibility"],
    ["brand","Brand & Homepage"],
    ["links","Public Links / Social & Streaming Links"],
    ["pricing","Pricing"],
    ["seo","SEO Defaults"],
    ["payments","Payments"],
    ["email","Email Notifications"]
  ];
  for(const [key,label] of definitions){
    if(!settings.querySelector(`[data-settings-section="${key}"]`)){
      settings.insertAdjacentHTML("beforeend",`<section class="panel settings-pane" data-settings-section="${key}" hidden><h2>${label}</h2><p class="subcopy">This section is ready for live configuration. No Module 1 launch value is stored here yet.</p></section>`);
    }
  }
  let tabs=settings.querySelector(".settings-tabs");
  if(!tabs){tabs=document.createElement("nav");tabs.className="settings-tabs";settings.querySelector(".admin-section-title")?.after(tabs)}
  tabs.innerHTML=definitions.map(([key,label],index)=>`<button type="button" class="${index===0?"active":""}" data-rc5-settings="${key}">${label}</button>`).join("");
  const open=key=>{
    settings.querySelectorAll("[data-settings-section]").forEach(panel=>panel.hidden=panel.dataset.settingsSection!==key);
    tabs.querySelectorAll("[data-rc5-settings]").forEach(button=>button.classList.toggle("active",button.dataset.rc5Settings===key));
  };
  tabs.onclick=event=>{const button=event.target.closest("[data-rc5-settings]");if(button)open(button.dataset.rc5Settings)};
  open("visibility");
}
