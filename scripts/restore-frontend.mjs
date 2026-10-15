import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parse} from 'acorn';
const svg=await readFile('reference/novene.svg','utf8');
const packed=svg.match(/NOVENE_BLOBS\s*=\s*(\[[\s\S]*?\]);/)[1];
const blobs=JSON.parse(packed.replace(/,\s*\]/,']')).map(value=>Buffer.from(value,'base64').toString('utf8'));
await mkdir('public/original',{recursive:true});
const boot=`function bootNve(){if(nve)return Promise.resolve(nve);if(nveBooting)return nveBooting;nveBooting=import('/engine.mjs').then(m=>m.bootstrap()).then(controller=>{nve=controller;tabs.forEach(tab=>{if(tab.kind!=='browser'||tab.page)return;if(!tab.sframe)tab.sframe=nve.createFrame(tab.iframe);if(tab.pendingUrl){const target=tab.pendingUrl;tab.pendingUrl=null;navigate(tab.id,target);}});return nve;}).catch(error=>{nveBooting=null;window.dispatchEvent(new CustomEvent('novene-engine-state',{detail:{message:error.message,error:true}}));throw error;});return nveBooting;}`;
const navigationSource=(await readFile('public/navigation.mjs','utf8')).replace(/export /g,'');
await writeFile('public/input.js','(()=>{'+navigationSource+';window.noveneResolveInput=resolveInput;})();');
let tags='<script src="/input.js"></script><script src="/vendor/purify.min.js"></script><script src="/vendor/marked.min.js"></script><script src="/vendor/katex/katex.min.js"></script><script src="/vendor/engine/scramjet.js"></script><script src="/vendor/controller/controller.api.js"></script><script>window.$nvectrl=window.$scramjetController;</script>';
for(const i of [1,6,7,8,9,10,11,12,13]){
 let code=blobs[i];
 const normalizer=parse(code,{ecmaVersion:'latest'}).body.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='norm');
 if(normalizer)code=code.slice(0,normalizer.start)+`function norm(value){try{return window.noveneResolveInput(value,settings.search);}catch(error){window.dispatchEvent(new CustomEvent('novene-engine-state',{detail:{message:error.message,error:true}}));return '';}}`+code.slice(normalizer.end);

 if(i===7){
  const start=code.indexOf('let __nveApiToken=null;');
  const end=code.indexOf('function apiAuthReset()',start);
  if(start<0||end<0)throw new Error('Presence bootstrap contract changed');
  code=code.slice(0,start)+`let __nveApiToken=null,__nveApiPending=null;async function apiAuthHeaders(){if(__nveApiToken)return {"X-Novene-Auth":__nveApiToken};if(!__nveApiPending)__nveApiPending=fetch("/api/session",{method:"POST",cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Connection unavailable");return r.json()}).then(d=>{__nveApiToken=d.token;return {"X-Novene-Auth":__nveApiToken}}).finally(()=>{__nveApiPending=null});return __nveApiPending;}`+code.slice(end);
  code=code.replace('setInterval(refreshOnline,3e4)','setInterval(refreshOnline,5e3)');
 }

 if(i===13){
  let updated=false;
  code=code.replace(/atob\("([A-Za-z0-9+/=]+)"\)/g,(expression,packed)=>{
   const page=Buffer.from(packed,'base64').toString('utf8');
   if(!page.includes('emis for ai'))return expression;
   updated=true;
   const revised=page.replace('<span class="p-text">emis for ai</span>','<span class="p-text">Nyx for AI</span><a class="p-link" href="https://discord.gg/lightspeed" target="_blank" rel="noopener noreferrer">discord.gg/lightspeed</a>');
   return 'atob('+JSON.stringify(Buffer.from(revised).toString('base64'))+')';
  });
  if(!updated)throw new Error('Expected AI credits entry was not found');
 }

 if(i===12){
  const ast=parse(code,{ecmaVersion:'latest'});const edits=ast.body.filter(node=>node.type==='FunctionDeclaration'&&['bootNve','safeReplaceHome','ensureWorker','engineStatus'].includes(node.id.name)).map(node=>({start:node.start,end:node.end,text:node.id.name==='bootNve'?boot:node.id.name==='safeReplaceHome'?`function safeReplaceHome(){try{if(location.pathname!=='/')history.replaceState(null,'','/');}catch{}}`:node.id.name==='engineStatus'?`async function engineStatus(){try{const r=await fetch('/healthz');return r.ok?null:'The local connection service is unavailable';}catch{return 'Cannot reach the local server';}}`:''}));
  for(const edit of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
 }
 if(i===8){
  const before='if(!tab.sframe){tab.pendingUrl=target;';
  if(!code.includes(before))throw Error('Navigation frame contract changed');
  code=code.replace(before,`if(tab.page){const fresh=document.createElement("iframe");fresh.className="faizframe";fresh.setAttribute("title","novene browser");fresh.setAttribute("frameborder","0");tab.iframe.replaceWith(fresh);tab.iframe=fresh;tab.page=null;tab.sframe=null;tab.lastHref="";}if(!tab.sframe&&nve)tab.sframe=nve.createFrame(tab.iframe);if(!tab.sframe){tab.pendingUrl=target;`);
  code=code.replace('tab.url=target;recordVisit(tab);','tab.pendingUrl=null;tab.url=target;recordVisit(tab);');
  code=code.replace('if(tab.kind!=="browser"||!tab.iframe||tab.page)return;','if(tab.kind!=="browser"||!tab.iframe||tab.page||tab.pendingUrl||tab.url.startsWith("novene://"))return;');
 }
 if(i===9)code=code.replace('const groups=[{title:"vision",items:AI_MODELS.filter(m=>modelVision(m.id))},{title:"text",items:AI_MODELS.filter(m=>!modelVision(m.id))}];',`const order=['openai','anthropic','google','x-ai'];const names={openai:'OpenAI',anthropic:'Anthropic',google:'Google','x-ai':'xAI'};const companies=[...new Set(AI_MODELS.map(m=>m.id.split('/')[0]))].sort((a,b)=>(order.includes(a)?order.indexOf(a):99)-(order.includes(b)?order.indexOf(b):99)||a.localeCompare(b));const groups=companies.map(c=>({title:names[c]||c,items:AI_MODELS.filter(m=>m.id.split('/')[0]===c)}));`);
 if(i===9)code=code.replace('const AI_VISION_DEFAULT=', 'let AI_VISION_DEFAULT=').replace('let html=window.marked.parse(src);','let html=window.DOMPurify.sanitize(window.marked.parse(src));');
 if(i===10)code=code.replace('const ENGINES={','const ENGINES={bing:"https://www.bing.com/search?format=rss&q=",');
 if(i===11)code=code.replace('search:"brave"','search:"ddg"');
 if(i===8)code=code.replace('const hasTabs=[...tabs.values()].some(t=>t.kind==="browser"&&t.url);','const hasTabs=true;');
 // The original shell's online indicator belongs to this installation.
 code=code.replaceAll('https://frostedbrowser.cfd/api/ai','/api/ai').replaceAll('https://frostedbrowser.cfd/api/session','/api/session').replaceAll('https://frostedbrowser.cfd/api/ping','/api/ping').replaceAll('https://frostedbrowser.cfd/api/ccu','/api/ccu');
 await writeFile(`public/original/${i}.js`,code);tags+=`<script src="/original/${i}.js"></script>`;
}
let html=svg.slice(svg.indexOf('<html '),svg.lastIndexOf('</html>')+7);
html=html.replace(/<script[^>]*>[\s\S]*?<\/script>/g,'');
html=html.replace(/<meta name="monetag"[^>]*>/g,'').replace(/<link rel="icon"[^>]*>/,'<link rel="icon" href="/n-logo.svg"/>');
html=html.replaceAll('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css','/vendor/katex/katex.min.css');
html=html.replace('<button class="set-dropdown-opt" data-value="brave"', '<button class="set-dropdown-opt" data-value="bing" type="button">bing reader</button><button class="set-dropdown-opt" data-value="brave"');
html=html.replace('confirm before close','close protection').replace('ask before closing with tabs open','ask before leaving or closing Novene');
for(const [old,theme] of Object.entries({n:'green',red:'red',blue:'blue',black:'black',white:'white'}))html=html.replaceAll('https://cdn.frostedbrowser.cfd/wallpapers/'+old+'.png','/wallpapers/moon.jpg');
html=html.replace('Search with Brave...','Search the web...');
html=html.replace('</head>' ,'<link rel="stylesheet" href="/connection-panel.css"><link rel="stylesheet" href="/wallpapers.css"><link rel="stylesheet" href="/community.css"></head>');
html=html.replace('</body>',tags+'<script src="/page-security.js"></script><script src="/connection-panel.js"></script><script src="/ai-catalog.js"></script><script src="/search-default.js"></script><script src="/wallpapers.js"></script><script src="/oneko.js"></script><script src="/account-access.js"></script><script src="/community.js"></script></body>');
await writeFile('public/index.html','<!doctype html>\n'+html.replace(/^[ \t]+$/gm,''));
console.log('Restored original SVG markup and styles; original UI scripts connected to local SJv2/libcurl/Wispurr.');
