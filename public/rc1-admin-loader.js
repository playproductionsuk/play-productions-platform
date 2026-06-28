if(!globalThis.polishAdminReady){
  await Promise.race([
    new Promise(resolve=>window.addEventListener("polishadminready",resolve,{once:true})),
    new Promise(resolve=>setTimeout(resolve,5000))
  ]);
}
try{
  await Promise.race([import("./rc1-admin.js"),new Promise((_,reject)=>setTimeout(()=>reject(new Error("RC1 admin enhancement timed out.")),5000))]);
  const dashboard=document.querySelector('[data-page="dashboard"]');
  if(dashboard&&!dashboard.querySelector(".setup-status"))dashboard.insertAdjacentHTML("beforeend",'<section class="setup-status"><strong>Module 1 launch setup</strong><p>Payment sandbox, signed download fulfilment, email delivery and legal pages are tracked in the launch checklist—not as operational notifications.</p></section>');
}catch(error){
  console.error("Optional RC1 admin enhancements did not load.",error);
}
globalThis.rc1AdminReady=true;
window.dispatchEvent(new Event("rc1adminready"));
