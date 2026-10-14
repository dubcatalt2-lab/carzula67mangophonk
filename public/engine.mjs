import LibcurlClient from '/vendor/http/index.mjs';
import {headerEntries} from './headers.mjs';
class HttpClient extends LibcurlClient{
 async request(url,method,body,headers,signal){const response=await super.request(url,method,body,headerEntries(headers),signal);return {...response,headers:headerEntries(response.headers)};}
 connect(url,protocols,headers,...callbacks){return super.connect(url,protocols,headerEntries(headers),...callbacks);}
}
let pending;
const timeout=(promise,ms,label)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(label)),ms);promise.then(resolve,reject).finally(()=>clearTimeout(timer));});
export function bootstrap(){
 if(pending)return pending;
 pending=(async()=>{
  if(!navigator.serviceWorker)throw Error('Use localhost or HTTPS to open Novene.');
  await navigator.serviceWorker.register('/novene-sw.js',{scope:'/'});
  const registration=await timeout(navigator.serviceWorker.ready,15000,'The page worker did not become ready.');
  if(!navigator.serviceWorker.controller)await timeout(new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})),10000,'Reload to activate the page worker.');
  const endpoint=new URL('/wisp/',location.href);endpoint.protocol=location.protocol==='https:'?'wss:':'ws:';
  const transport=new HttpClient({wisp:endpoint.href,websocket:endpoint.href});
  await timeout(transport.init(),20000,'The HTTP client could not start.');
  const controller=new window.$scramjetController.Controller({serviceworker:registration.active,transport,config:{prefix:'/browse/',scramjetPath:'/vendor/engine/scramjet.js',injectPath:'/vendor/controller/controller.inject.js',wasmPath:'/vendor/engine/scramjet.wasm',virtualWasmPath:'scramjet.wasm.js'},scramjetConfig:{flags:{captureErrors:false,cleanErrors:false,sourcemaps:false,rewriterLogs:false,allowFailedIntercepts:true}}});
  await timeout(controller.wait(),15000,'The browser controller did not become ready.');
  return controller;
 })().catch(error=>{pending=null;throw error;});return pending;
}
