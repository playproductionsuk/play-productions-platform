if(!globalThis.rc1AdminReady){
  await Promise.race([
    new Promise(resolve=>window.addEventListener("rc1adminready",resolve,{once:true})),
    new Promise(resolve=>setTimeout(resolve,5000))
  ]);
}
try{await Promise.race([import("./rc2-admin.js"),new Promise((_,reject)=>setTimeout(()=>reject(new Error("RC2 admin enhancement timed out.")),5000))])}
catch(error){console.error("Optional RC2 admin enhancements did not load.",error)}
