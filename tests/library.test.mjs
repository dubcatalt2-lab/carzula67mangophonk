import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {repairLibrary} from '../scripts/repair-library.mjs';
const svg=await readFile(new URL('../reference/novene.svg',import.meta.url),'utf8');
const blobs=JSON.parse(svg.match(/NOVENE_BLOBS\s*=\s*(\[[\s\S]*?\]);/)[1].replace(/,\s*\]/,']'));
const code=repairLibrary(Buffer.from(blobs[6],'base64').toString());
function setup(fetch){
 const context={window:{},fetch,AbortController,AbortSignal,setTimeout,clearTimeout,URL,console};
 vm.runInNewContext(code,context);
 const library=context.window.Lumi;
 library.applyFilters=()=>{};
 library.menuView={style:{}};library.gameView={style:{}};
 library.iframe={srcdoc:'',src:'',removeAttribute(){}};
 return library;
}
test('catalogs start concurrently and publish before a slow source; absolute links survive',async()=>{
 const requests=[];let release;
 const pending=new Promise(r=>release=r);
 const library=setup(async url=>{requests.push(url);if(url.includes('ugs-json'))await pending;return {ok:true,json:async()=>url.includes('freebuisness')?[{id:4,name:'Example',url:'https://example.com/game.html',cover:'https://example.com/cover.png'}]:[]}});
 const work=library.loadGames();
 await new Promise(r=>setTimeout(r,0));
 assert.equal(requests.length,3);
 assert.equal(library.games[0].url,'https://example.com/game.html');
 assert.equal(library.games[0].cover,'https://example.com/cover.png');
 release();await work;
});
test('failed downloads show an error and do not embed the error response',async()=>{
 const library=setup(async()=>({ok:false,status:404}));
 await library.playGame({url:'https://example.com/game.html'});
 assert.match(library.iframe.srcdoc,/could not be downloaded/);
 assert.equal(library.currentGameHtml,'');
});
test('closing cancels a pending launch; root-relative assets remain root-relative',async()=>{
 let release;const library=setup(()=>new Promise(r=>release=r));
 const launch=library.playGame({url:'https://example.com/path/game.html'});
 library.closeGame();release({ok:true,text:async()=>'<head></head><script src="/asset.js"></script>'});
 await launch;assert.equal(library.currentGameHtml,'');
 const ready=setup(async()=>({ok:true,text:async()=>'<head></head><script src="/asset.js"></script>'}));
 await ready.playGame({url:'https://example.com/path/game.html'});
 assert.match(ready.currentGameHtml,/src="\/asset.js"/);
 assert.match(ready.currentGameHtml,/<base href="https:\/\/example.com\/path\/">/);
});
