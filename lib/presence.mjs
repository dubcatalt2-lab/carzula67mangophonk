import express from 'express';
import {randomUUID} from 'node:crypto';
export function createPresence({authenticate=()=>null,now=Date.now,ttl=45000}={}){
 const router=express.Router(),visitors=new Map();
 function prune(){for(const [id,value]of visitors)if(now()-value.seen>=ttl)visitors.delete(id);}
 function touch(req,res){
  prune();
  const cookie=/(?:^|;\s*)novene_presence=([0-9a-f-]{36})(?:;|$)/i.exec(req.headers.cookie||'')?.[1];
  const header=req.get('X-Novene-Auth');
  const id=cookie||(visitors.has(header)?header:randomUUID());
  let user=null;try{user=authenticate(req)?.id||null;}catch{}
  visitors.set(id,{seen:now(),identity:user?'user:'+user:'browser:'+id});
  res.cookie('novene_presence',id,{httpOnly:true,sameSite:'lax',secure:req.secure,path:'/api',maxAge:31536000000});
  res.set('Cache-Control','no-store');return id;
 }
 router.post('/session',(req,res)=>res.json({token:touch(req,res)}));
 router.get('/ping',(req,res)=>{touch(req,res);res.json({ok:true});});
 router.get('/ccu',(req,res)=>{touch(req,res);res.json({ccu:new Set([...visitors.values()].map(v=>v.identity)).size});});
 return router;
}
