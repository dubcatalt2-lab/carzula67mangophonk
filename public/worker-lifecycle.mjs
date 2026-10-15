export async function activatePageWorker({timeoutMs=15000}={}){
 const expected=new URL('/novene-sw.js',location.href).href;
 const registration=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('The page worker download timed out. Reload to retry.')),timeoutMs);navigator.serviceWorker.register(expected,{scope:'/',updateViaCache:'none'}).then(resolve,reject).finally(()=>clearTimeout(timer));});
 await new Promise((resolve,reject)=>{
  const watched=new Set();let finished=false;
  const finish=error=>{if(finished)return;finished=true;clearTimeout(timer);registration.removeEventListener('updatefound',check);navigator.serviceWorker.removeEventListener('controllerchange',check);for(const worker of watched)worker.removeEventListener('statechange',check);error?reject(error):resolve();};
  const check=()=>{
   for(const worker of [registration.installing,registration.waiting,registration.active])if(worker&&!watched.has(worker)){watched.add(worker);worker.addEventListener('statechange',check);}
   const active=registration.active;
   if(active?.state==='activated'&&active.scriptURL===expected&&navigator.serviceWorker.controller===active&&!registration.installing&&!registration.waiting)return finish();
   if(!active&&!registration.installing&&!registration.waiting)return finish(Error('The page worker was not installed. Reload to retry.'));
  };
  const timer=setTimeout(()=>finish(Error('The page connection could not start. Reload to retry.')),timeoutMs);
  registration.addEventListener('updatefound',check);navigator.serviceWorker.addEventListener('controllerchange',check);check();
 });
 return registration;
}
