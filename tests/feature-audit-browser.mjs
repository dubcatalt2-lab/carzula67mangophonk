import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try {
 const page=await browser.newPage();await page.goto('http://localhost:8081');
 const result=await page.evaluate(async()=>{
  const fixture=document.createElement('div');fixture.id='audit-games';fixture.style.cssText='position:fixed;inset:0;overflow:auto;z-index:10000;background:#111';document.body.append(fixture);
  const load=Lumi.loadGames;Lumi.loadGames=async function(){this.games=Array.from({length:160},(_,i)=>({title:'Audit '+i,cover:'',url:'https://example.com/'+i,source:'All'}));};await Lumi.init({container:'#audit-games'});const first=Lumi.renderedCount;Lumi.appendBatch();const next=Lumi.renderedCount;const counter=Lumi.countEl.textContent;Lumi.gridObserver?.disconnect();Lumi.loadGames=load;fixture.remove();
  const id=createAiChat();aiChats.find(c=>c.id===id).messages.push({role:'user',text:'Audit saved chat'});saveAiChats();
  const modes={};for(const mode of ['red','blue']){settings.mode=mode;applySettings();modes[mode]={mode:document.body.dataset.mode,accent:document.body.dataset.accent,color:getComputedStyle(document.body).getPropertyValue('--green-lit')};}
  renderAiModelList();return {first,next,counter,math:renderAiMarkdown('$$x^2$$').includes('katex'),saved:localStorage.getItem(AI_CHAT_STORE).includes('Audit saved chat'),providers:[...AI_PROVIDERS],vision:AI_MODELS.filter(m=>modelVision(m.id)).length,icons:document.querySelectorAll('#aiModelList .ai-chat-opt-ic svg').length,modelCount:AI_MODELS.length,sidebar:!!document.querySelector('.set-side'),cache:!!document.getElementById('setClearCache'),discord:!!document.getElementById('homeDiscord'),history:!!document.getElementById('hiBtn'),modes};
 });assert.ok(result.next>result.first);assert.ok(result.math&&result.saved&&result.sidebar&&result.cache&&result.discord&&result.history);assert.equal(result.icons,result.modelCount);assert.notEqual(result.modes.red.color,result.modes.blue.color);console.log(JSON.stringify(result,null,2));await page.reload();assert.ok(await page.evaluate(()=>aiChats.some(c=>c.messages.some(m=>m.text==='Audit saved chat'))));console.log('PASS original feature audit; no upstream AI inference or VPN enforcement claim.');
}finally{await browser.close();}
