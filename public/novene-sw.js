importScripts('/vendor/controller/controller.sw.js');
async function reconnect(event){
 if(self.$scramjetController.shouldRoute(event))return;
 await new Promise(async(resolve,reject)=>{
  const finish=error=>{clearTimeout(timer);self.removeEventListener('message',check);error?reject(error):resolve();};
  const check=()=>{if(self.$scramjetController.shouldRoute(event))finish();};
  const timer=setTimeout(()=>finish(Error('The page connection could not resume. Reload this tab to retry.')),5000);
  self.addEventListener('message',check);
  try{for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true}))client.postMessage({$controller$swrevive:{}});check();}catch(error){finish(error);}
 });
}
self.addEventListener('fetch',event=>{
 if(!new URL(event.request.url).pathname.startsWith('/browse/'))return;
 event.respondWith((async()=>{try{await reconnect(event);return await self.$scramjetController.route(event);}catch{return new Response('The page connection could not resume. Reload this tab to retry.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
});
