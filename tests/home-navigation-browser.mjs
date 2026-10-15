import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.launch();try{const p=await b.newPage();await p.goto('http://localhost:8081');await p.waitForFunction(()=>typeof navigate==='function');
for(let i=0;i<8;i++){
 await p.evaluate(()=>{const t=activeTab();navigate(t.id,'novene://credits');navigate(t.id,'novene://home');});
 const query='novene navigation check '+i;
 await p.evaluate(({query,i})=>{const input=i%2?urlInput:document.getElementById('homeSearch');input.value=query;input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));},{query,i});
 await p.waitForFunction(q=>{const t=activeTab();return t?.url.includes(encodeURIComponent(q))&&t.sframe&&!t.page&&t.iframe.classList.contains('active')},query,{timeout:15000});
 assert.equal(await p.evaluate(()=>homeView.classList.contains('hidden')),true);
}
console.log('PASS eight alternating home/address submissions after built-in page transitions');}finally{await b.close()}
