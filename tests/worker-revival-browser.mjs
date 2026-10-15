import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage();const misses=[];
 page.on('response',r=>{if(r.status()===404&&r.url().includes('/4otig/'))misses.push(r.url());});
 await page.goto('http://localhost:8081');
 assert.equal(await page.evaluate(()=>settings.search),'ddg');
 await page.evaluate(()=>activate(newBrowserTab('https://example.com').id));
 await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].some(f=>f.contentDocument?.body?.innerText.includes('documentation')),null,{timeout:30000});
 const cdp=await page.context().newCDPSession(page);await cdp.send('ServiceWorker.enable');await cdp.send('ServiceWorker.stopAllWorkers');
 await page.evaluate(()=>navigate(activeId,'https://example.com/?revival=1'));
 await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].some(f=>{try{return f.contentDocument?.body?.innerText.includes('documentation')&&f.src.includes('revival')}catch{return false}}),null,{timeout:30000});
 assert.equal(misses.length,0);
 await cdp.send('ServiceWorker.stopAllWorkers');await page.evaluate(()=>navigate(activeId,'example.com/a?b=1#test'));
 await page.waitForFunction(()=>[...document.querySelectorAll('iframe')].some(f=>f.contentDocument?.body?.innerText.includes('documentation')),null,{timeout:30000});
 assert.equal(misses.length,0);console.log('PASS default preference, worker revival, direct address with query and fragment');
}finally{await browser.close();}
