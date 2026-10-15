import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {createServer} from 'node:http';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createCommunity} from '../lib/community.mjs';
test('role hierarchy, dashboard privacy, moderation and last-owner protection',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'novene-roles-')),community=await createCommunity({directory}),app=express();app.use('/api/community',community.router);const server=createServer(app);await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 async function req(path,method='GET',body,cookie=''){const r=await fetch(origin+'/api/community'+path,{method,headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return{status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 try{
 const code=(await readFile(join(directory,'owner-setup.txt'),'utf8')).trim(),users=[];
 for(const username of ['owner','admin','mod','dev','member'])users.push(await req('/register','POST',{username,password:'a-long-test-password',...(username==='owner'?{ownerCode:code}:{})}));
 const [owner,admin,mod,dev,member]=users;const patch=(actor,target,body)=>req('/members/'+target.data.user.id,'PATCH',body,actor.cookie);
 for(const [u,role] of [[admin,'admin'],[mod,'mod'],[dev,'dev']])assert.equal((await patch(owner,u,{role})).status,200);
 assert.equal((await req('/dashboard','GET',null,owner.cookie)).data.users.length,5);
 for(const u of [admin,mod,dev,member])assert.equal((await req('/dashboard','GET',null,u.cookie)).status,403);
 assert.equal((await patch(admin,admin,{role:'owner'})).status,403);assert.equal((await patch(admin,member,{role:'owner'})).status,403);assert.equal((await patch(admin,owner,{banned:true})).status,403);
 assert.equal((await patch(mod,member,{role:'booster'})).status,403);assert.equal((await patch(mod,dev,{banned:true})).status,403);assert.equal((await patch(dev,member,{banned:true})).status,403);
 assert.equal((await patch(admin,member,{role:'booster'})).status,200);
 assert.equal((await req('/entitlements','GET',null,member.cookie)).data.premium,false);
 assert.equal((await req('/messages','POST',{room:'announcements',text:'Admin update'},admin.cookie)).status,201);
 for(const u of [mod,dev,member])assert.equal((await req('/messages','POST',{room:'announcements',text:'Denied'},u.cookie)).status,403);
 const message=await req('/messages','POST',{room:'general',text:'Public'},member.cookie);assert.equal((await req('/messages/'+message.data.message.id,'DELETE',null,mod.cookie)).status,200);
 const room='dm:'+ [dev.data.user.id,member.data.user.id].sort().join(':'),dm=await req('/messages','POST',{room,text:'Private'},member.cookie);
 assert.equal((await req('/messages?room='+room,'GET',null,owner.cookie)).status,403);assert.equal((await req('/messages/'+dm.data.message.id,'DELETE',null,owner.cookie)).status,404);
 assert.equal((await patch(mod,member,{banned:true})).status,200);assert.equal((await req('/session','GET',null,member.cookie)).data.user,null);
 assert.equal((await patch(owner,member,{banned:false})).status,200);
 assert.equal((await patch(owner,owner,{role:'admin'})).status,409);assert.equal((await patch(owner,owner,{banned:true})).status,409);
 assert.equal((await patch(owner,member,{role:'invalid'})).status,400);
 }finally{await community.close();server.closeAllConnections();await new Promise(r=>server.close(r));await rm(directory,{recursive:true,force:true});}
});

