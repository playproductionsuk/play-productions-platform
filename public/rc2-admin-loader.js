if(!globalThis.rc1AdminReady)await new Promise(resolve=>window.addEventListener("rc1adminready",resolve,{once:true}));await import("./rc2-admin.js");
