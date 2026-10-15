import {test} from 'node:test';
import assert from 'node:assert/strict';
import {present,presentHtml,presentScript} from '../scripts/presentation.mjs';
test('presentation changes labels without changing native APIs or input types',()=>{
 assert.equal(present('Search or enter an URL...'),'Find a page...');
 assert.equal(present('Service worker network tunnel libcurl scramjet'),'page helper connection passage Carlstudent Carlmath');
 const html=presentHtml('<input type="url" placeholder="Search or enter address..."><p>service worker</p>');
 assert.ok(html.includes('type="url"'));assert.ok(html.includes('Find a page...'));assert.ok(html.includes('page helper'));
 const script=presentScript('navigator.serviceWorker.register("/offline-cache.js"); status.textContent="Network tunnel";');
 assert.ok(script.includes('navigator.serviceWorker.register'));assert.ok(script.includes('connection passage'));
});
