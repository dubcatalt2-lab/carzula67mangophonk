import {activatePageWorker} from './worker-lifecycle.mjs';
import {adaptSearchFeed} from './search-feed.mjs';
import LibcurlClient from '/vendor/http/index.mjs';
import {headerEntries} from './headers.mjs';
class HttpClient extends LibcurlClient{
 async request(url,method,body,headers,signal){const report=detail=>window.dispatchEvent(new CustomEvent('novene-page-response',{detail:{url:String(url),...detail}}));report({loading:true});try{const response=await super.request(url,method,body,headerEntries(headers),signal);report({status:response.status});return adaptSearchFeed({...response,headers:headerEntries(response.headers)},url);}catch(error){report({failed:true});throw error;}}
 connect(url,protocols,headers,...callbacks){return super.connect(url,protocols,headerEntries(headers),...callbacks);}
}
const state=(message,error=false)=>window.dispatchEvent(new CustomEvent('novene-engine-state',{detail:{message,error}}));
let pending;
const timeout=(promise,ms,label)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(label)),ms);promise.then(resolve,reject).finally(()=>clearTimeout(timer));});
export function bootstrap(){
 if(pending)return pending;
 pending=(async()=>{
  if(!navigator.serviceWorker)throw Error('Use localhost or HTTPS to open Novene.');
  state('Preparing the page worker...');
  const registration=await activatePageWorker();
  state('Connecting to the local service...');
  const health=await fetch('/healthz',{signal:AbortSignal.timeout(5000),cache:'no-store'});if(!health.ok)throw Error('The local browsing service is unavailable.');
  const endpoint=new URL('/wisp/',location.href);endpoint.protocol=location.protocol==='https:'?'wss:':'ws:';
  const transport=new HttpClient({wisp:endpoint.href,websocket:endpoint.href});
  await timeout(transport.init(),20000,'The HTTP client could not start.');
  const controller=new window.$__90638Controller.Controller({serviceworker:registration.active,transport,config:{prefix:'/browse/',__90638Path:'/vendor/engine/__90638.js',injectPath:'/vendor/controller/controller.inject.js',wasmPath:'/vendor/engine/__90638.wasm',virtualWasmPath:'__90638.wasm.js'},__90638Config:{flags:{captureErrors:false,cleanErrors:false,sourcemaps:false,rewriterLogs:false,allowFailedIntercepts:true}}});
  state('Preparing the browser...');
  await timeout(controller.wait(),15000,'The browser controller did not become ready.');
  state('Ready');
  return controller;
 })().catch(error=>{pending=null;state(error.message,true);throw error;});return pending;
}
