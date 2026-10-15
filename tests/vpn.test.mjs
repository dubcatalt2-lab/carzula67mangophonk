import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import express from 'express';
import {createVpn} from '../lib/vpn.mjs';
test('shared VPN denies member changes, validates origin, and fails closed without gateway',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'novene-vpn-'));const statePath=join(directory,'state.json');let disconnects=0;
 const vpn=await createVpn({socketPath:'',statePath,authenticate:req=>({role:req.get('X-Test-Role')||'member'}),disconnect:()=>disconnects++});
 const app=express();app.use('/api/connection',vpn.router);const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const origin='http://127.0.0.1:'+server.address().port;
 async function update(role,enabled,site=origin){return fetch(origin+'/api/connection',{method:'POST',headers:{'Content-Type':'application/json','X-Test-Role':role,Origin:site},body:JSON.stringify({enabled})});}
 try{
  assert.equal((await update('member',true)).status,403);assert.equal((await update('owner',true,'https://example.com')).status,403);
  assert.equal((await update('owner',true)).status,503);assert.equal(vpn.enabled,false);
  assert.equal((await update('owner',false)).status,200);assert.equal(disconnects,1);
  const status=await(await fetch(origin+'/api/connection')).json();assert.equal(status.connected,false);assert.equal(status.configured,false);assert.equal(status.canManage,false);
  const restored=await createVpn({socketPath:'unused',statePath,authenticate:()=>null});assert.equal(restored.enabled,false);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));await rm(directory,{recursive:true,force:true});}
});
