export async function activatePageWorker({timeoutMs=15000}={}){
 const expected=new URL('/novene-sw.js',location.href).href;
 const registration=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('The page worker download timed out. Reload to retry.')),timeoutMs);navigator.serviceWorker.register(expected,{scope:'/',updateViaCache:'none'}).then(resolve,reject).finally(()=>clearTimeout(timer));});
 const candidate=registration.installing||registration.waiting||registration.active;
 if(!candidate)throw Error('sw not ever installed try CTRL SHIFT R');
 await new Promise((resolve,reject)=>{const finish=error=>{clearTimeout(timer);candidate.removeEventListener('statechange',check);error?reject(error):resolve();};const check=()=>{if(candidate.state==='activated')finish();else if(candidate.state==='redundant')finish(Error('The page worker update failed.'));};const timer=setTimeout(()=>finish(Error('The page worker did not activate. Reload to retry.')),timeoutMs);candidate.addEventListener('statechange',check);check();});
 await new Promise((resolve,reject)=>{const finish=error=>{clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',check);error?reject(error):resolve();};const check=()=>{if(navigator.serviceWorker.controller===candidate&&candidate.scriptURL===expected)finish();};const timer=setTimeout(()=>finish(Error('The updated page worker did not take control. Reload to retry.')),timeoutMs);navigator.serviceWorker.addEventListener('controllerchange',check);check();});
 return registration;
}
