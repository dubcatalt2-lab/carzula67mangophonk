import {mkdir,cp,rm,readFile,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {patchClientSockets} from './patch-client-sockets.mjs';
await mkdir('public/vendor',{recursive:true});
for(const [pkg,directory] of [['scramjet','engine'],['scramjet-controller','controller'],['libcurl-transport','http']]){
 await rm(`public/vendor/${directory}`,{recursive:true,force:true});
 await cp(`node_modules/@mercuryworkshop/${pkg}/dist`,`public/vendor/${directory}`,{recursive:true});
}
const client=await readFile('public/vendor/http/index.mjs','utf8');
await writeFile('public/vendor/http/index.mjs',patchClientSockets(client));

                                                                                   
const renamed=spawnSync(process.platform==='win32'?'python':'python3',['obfs.py','public/vendor'],{stdio:'inherit'});
if(renamed.status!==0)throw Error('obfs.py failed; vendor assets still use the original names');

const enginePath='public/vendor/engine/__90638.js';
const engine=await readFile(enginePath,'utf8');
const optional='s=(0,n.Qf)(t.args[2]);if(n.xP.canParse(s)';
if(!engine.includes(optional))throw Error('History patch contract changed');
await writeFile(enginePath,engine.replace(optional,'s=t.args[2]==null?null:(0,n.Qf)(t.args[2]);if(n.xP.canParse(s)'));
console.log('Built matching SJv2/controller assets and patched libcurl socket cleanup.');

await cp('node_modules/katex/dist','public/vendor/katex',{recursive:true});
await cp('node_modules/marked/marked.min.js','public/vendor/marked.min.js');
await cp('node_modules/dompurify/dist/purify.min.js','public/vendor/purify.min.js');

                                                                         
await rm('.published',{recursive:true,force:true});
await import('./publish.mjs');

await mkdir('.published/licenses',{recursive:true});
await cp('LICENSE','.published/licenses/application.txt');
for(const [pkg,name] of [['@mercuryworkshop/libcurl-transport','student'],['wispurr','courier'],['dompurify','sanitizer']]){
 try{await cp('node_modules/'+pkg+'/LICENSE','.published/licenses/'+name+'.txt');}catch(error){if(error.code!=='ENOENT')throw error;}
}
