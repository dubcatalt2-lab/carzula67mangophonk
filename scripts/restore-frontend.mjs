import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parse} from 'acorn';
const svg=await readFile('reference/novene.svg','utf8');
const packed=svg.match(/NOVENE_BLOBS\s*=\s*(\[[\s\S]*?\]);/)[1];
const blobs=JSON.parse(packed.replace(/,\s*\]/,']')).map(value=>Buffer.from(value,'base64').toString('utf8'));
await mkdir('public/original',{recursive:true});
const boot=`function bootNve(){if(nve)return Promise.resolve(nve);if(nveBooting)return nveBooting;nveBooting=import('/engine.mjs').then(m=>m.bootstrap()).then(controller=>{nve=controller;tabs.forEach(tab=>{if(tab.kind!=='browser'||tab.page)return;if(!tab.sframe)tab.sframe=nve.createFrame(tab.iframe);if(tab.pendingUrl){const target=tab.pendingUrl;tab.pendingUrl=null;navigate(tab.id,target);}});return nve;}).catch(error=>{nveBooting=null;throw error;});return nveBooting;}`;
let tags='<script src="/vendor/marked.min.js"></script><script src="/vendor/katex/katex.min.js"></script><script src="/vendor/engine/scramjet.js"></script><script src="/vendor/controller/controller.api.js"></script><script>window.$nvectrl=window.$scramjetController;</script>';
for(const i of [1,6,7,8,9,10,11,12,13]){
 let code=blobs[i];
 if(i===12){
  const ast=parse(code,{ecmaVersion:'latest'});const edits=ast.body.filter(node=>node.type==='FunctionDeclaration'&&['bootNve','safeReplaceHome','ensureWorker','engineStatus'].includes(node.id.name)).map(node=>({start:node.start,end:node.end,text:node.id.name==='bootNve'?boot:node.id.name==='safeReplaceHome'?`function safeReplaceHome(){try{if(location.pathname!=='/')history.replaceState(null,'','/');}catch{}}`:node.id.name==='engineStatus'?`async function engineStatus(){try{const r=await fetch('/healthz');return r.ok?null:'The local connection service is unavailable';}catch{return 'Cannot reach the local server';}}`:''}));
  for(const edit of edits.sort((a,b)=>b.start-a.start))code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
 }
 // The original shell's online indicator belongs to this installation.
 code=code.replaceAll('https://frostedbrowser.cfd/api/ai','/api/ai').replaceAll('https://frostedbrowser.cfd/api/session','/api/session').replaceAll('https://frostedbrowser.cfd/api/ping','/api/ping').replaceAll('https://frostedbrowser.cfd/api/ccu','/api/ccu');
 await writeFile(`public/original/${i}.js`,code);tags+=`<script src="/original/${i}.js"></script>`;
}
let html=svg.slice(svg.indexOf('<html '),svg.lastIndexOf('</html>')+7);
html=html.replace(/<script[^>]*>[\s\S]*?<\/script>/g,'');
html=html.replaceAll('https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css','/vendor/katex/katex.min.css');
html=html.replace('</head>','<link rel="stylesheet" href="/wallpapers.css"><link rel="stylesheet" href="/community.css"></head>');
html=html.replace('</body>',tags+'<script src="/wallpapers.js"></script><script src="/community.js"></script></body>');
await writeFile('public/index.html','<!doctype html>\n'+html.replace(/^[ \t]+$/gm,''));
console.log('Restored original SVG markup and styles; original UI scripts connected to local SJv2/libcurl/Wispurr.');
