import {mkdir,cp,readFile,writeFile} from 'node:fs/promises';
import {patchClientSockets} from './patch-client-sockets.mjs';
await mkdir('public/vendor',{recursive:true});
for(const [pkg,directory] of [['scramjet','engine'],['scramjet-controller','controller'],['libcurl-transport','http']]){
 await cp(`node_modules/@mercuryworkshop/${pkg}/dist`,`public/vendor/${directory}`,{recursive:true});
}
const client=await readFile('public/vendor/http/index.mjs','utf8');
await writeFile('public/vendor/http/index.mjs',patchClientSockets(client));
const engine=await readFile('public/vendor/engine/scramjet.js','utf8');
const optional='s=(0,n.Qf)(t.args[2]);if(n.xP.canParse(s)';
if(!engine.includes(optional))throw Error('History patch contract changed');
await writeFile('public/vendor/engine/scramjet.js',engine.replace(optional,'s=t.args[2]==null?null:(0,n.Qf)(t.args[2]);if(n.xP.canParse(s)'));
console.log('Built matching SJv2/controller assets and patched libcurl socket cleanup.');

await cp('node_modules/katex/dist','public/vendor/katex',{recursive:true});
await cp('node_modules/marked/marked.min.js','public/vendor/marked.min.js');
await import('./restore-frontend.mjs');
