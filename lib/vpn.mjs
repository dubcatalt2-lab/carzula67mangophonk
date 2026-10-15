import express from 'express';
import http from 'node:http';
import net from 'node:net';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {dirname} from 'node:path';

export async function createVpn({authenticate,socketPath=process.env.NOVENE_VPN_SOCKET,statePath=process.env.NOVENE_VPN_STATE||'data/vpn-state.json',disconnect=()=>{},controlPath=process.env.NOVENE_VPN_CONTROL,locationsPath=new URL('../.published/locations.json',import.meta.url)}){
 let enabled=!!socketPath;
 try{enabled=JSON.parse(await readFile(statePath,'utf8')).enabled===true;}catch(error){if(error.code!=='ENOENT')throw error;}
 const router=express.Router();let changing=false;
 let locations=[];try{locations=JSON.parse(await readFile(locationsPath,'utf8'));}catch{}
 function select(hostname){return new Promise((resolve,reject)=>{const body=JSON.stringify({hostname});const request=http.request({socketPath:controlPath,path:'/select',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},timeout:10000},response=>{response.resume();response.on('end',()=>response.statusCode===200?resolve():reject(Error('Location unavailable')));});request.on('timeout',()=>request.destroy());request.on('error',reject);request.end(body);});}
 function probe(fresh=false){return new Promise(resolve=>{
  if(!socketPath)return resolve({connected:false});
  const request=http.get({socketPath,path:fresh?'/healthz?fresh=1':'/healthz',timeout:10000},response=>{let body='';response.on('data',chunk=>{body+=chunk;if(body.length>8192)request.destroy();});response.on('end',()=>{try{const data=JSON.parse(body);resolve({connected:response.statusCode===200&&data.connected===true,hostname:data.hostname||null,city:data.city||null,country:data.country||null});}catch{resolve({connected:false});}});});
  request.on('timeout',()=>request.destroy());request.on('error',()=>resolve({connected:false}));
 });}
 async function status(req){let owner=false;try{owner=authenticate(req)?.role==='owner';}catch{}const health=enabled?await probe():{connected:false};return {configured:!!socketPath,enabled,connected:enabled&&health.connected,location:health.city?[health.city,health.country].filter(Boolean).join(', '):'New York City, USA',hostname:health.hostname,canSelect:owner&&!!controlPath,locations,canManage:owner,scope:'Shared Novene browsing connection'};}
 router.get('/',async(req,res)=>{res.set('Cache-Control','no-store');res.json(await status(req));});
 router.post('/',express.json({limit:'1kb'}),async(req,res)=>{
  try{
   if(!req.get('origin')||new URL(req.get('origin')).host!==req.get('host'))return res.status(403).json({error:'Use the Novene page.'});
   if(authenticate(req)?.role!=='owner')return res.status(403).json({error:'Only the owner can change the shared connection.'});
   if(typeof req.body.enabled!=='boolean')return res.status(400).json({error:'Choose on or off.'});
   if(changing)return res.status(409).json({error:'A connection change is already in progress.'});
   changing=true;
   try{
    if(req.body.hostname){
     if(!controlPath||!locations.some(item=>item.hostname===req.body.hostname&&item.active))return res.status(400).json({error:'Choose an available location.'});
     disconnect();await select(req.body.hostname);
     let verified=false;for(let attempt=0;attempt<4;attempt++){const health=await probe(true);if(health.connected&&health.hostname===req.body.hostname){verified=true;break;}await new Promise(resolve=>setTimeout(resolve,1000));}
     if(!verified)return res.status(503).json({error:'Location changed, but the connection is not verified yet. Check the status before browsing.'});
    }
    if(req.body.enabled&&!(await probe()).connected)return res.status(503).json({error:'The New York connection is not ready. No connection was changed.'});
    await mkdir(dirname(statePath),{recursive:true});await writeFile(statePath+'.tmp',JSON.stringify({enabled:req.body.enabled}),{mode:0o600});await rename(statePath+'.tmp',statePath);
    enabled=req.body.enabled;disconnect();res.json(await status(req));
   }finally{changing=false;}
  }catch{res.status(401).json({error:'Sign in as the owner to change this connection.'});}
 });
 function upgrade(req,socket,head){
  if(!socketPath){socket.end('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n');return;}
  const upstream=net.connect(socketPath);const timer=setTimeout(()=>upstream.destroy(),10000);
  upstream.on('connect',()=>{clearTimeout(timer);let headers=`GET /courier/ HTTP/1.1\r\nHost: localhost\r\n`;for(const name of ['upgrade','connection','sec-websocket-key','sec-websocket-version','sec-websocket-protocol'])if(req.headers[name])headers+=name+': '+req.headers[name]+'\r\n';upstream.write(headers+'\r\n');if(head.length)upstream.write(head);socket.pipe(upstream).pipe(socket);});
  upstream.on('error',()=>socket.destroy());socket.on('error',()=>upstream.destroy());socket.on('close',()=>{clearTimeout(timer);upstream.destroy();});upstream.on('close',()=>{clearTimeout(timer);socket.destroy();});
 }
 return {router,upgrade,get enabled(){return enabled;}};
}
