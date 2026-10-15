import {test} from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {createPresence} from '../lib/presence.mjs';
test('presence deduplicates reloads and signed-in users and expires inactive visitors',async()=>{
 let clock=1000;const app=express();app.use('/api',createPresence({now:()=>clock,authenticate:req=>req.get('X-Test-User')?{id:req.get('X-Test-User')}:null}));
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const origin='http://127.0.0.1:'+server.address().port;
 async function request(path,{cookie,user,method='GET'}={}){const headers={};if(cookie)headers.Cookie=cookie;if(user)headers['X-Test-User']=user;const r=await fetch(origin+'/api/'+path,{method,headers});return {body:await r.json(),cookie:r.headers.get('set-cookie').split(';')[0]};}
 try{
  const first=await request('session',{method:'POST'});
  for(let i=0;i<5;i++){const again=await request('session',{method:'POST',cookie:first.cookie});assert.equal(again.body.token,first.body.token);}
  assert.equal((await request('ccu',{cookie:first.cookie})).body.ccu,1);
  const second=await request('session',{method:'POST'});assert.equal((await request('ccu',{cookie:first.cookie})).body.ccu,2);
  await request('ping',{cookie:first.cookie,user:'owner'});await request('ping',{cookie:second.cookie,user:'owner'});
  assert.equal((await request('ccu',{cookie:first.cookie,user:'owner'})).body.ccu,1);
  clock+=46000;const fresh=await request('ccu');assert.equal(fresh.body.ccu,1);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});
