import {createServer} from 'node:http';
import {chmod,unlink} from 'node:fs/promises';
import {startCourier} from '../lib/net-bridge.mjs';
const socket=process.env.NOVENE_VPN_SOCKET||'/run/novene-vpn/gateway.sock';
const bridge=await startCourier({port:6301,onFailure:()=>process.exit(1)});
let checked=0,health={connected:false},pending;
async function check(){
 if(Date.now()-checked<10000)return health;
 if(pending)return pending;
 pending=(async()=>{try{const response=await fetch('https://am.i.mullvad.net/json',{signal:AbortSignal.timeout(8000)});const data=await response.json();health={connected:response.ok&&data.mullvad_exit_ip===true,hostname:data.mullvad_exit_ip_hostname||null,city:data.city||null,country:data.country||null};}catch{health={connected:false};}finally{checked=Date.now();pending=null;}return health;})();return pending;
}
const server=createServer(async(req,res)=>{if(!req.url.startsWith('/healthz')){res.writeHead(404).end();return;}if(req.url.includes('fresh=1'))checked=0;const state=await check();res.writeHead(state.connected?200:503,{'Content-Type':'application/json'}).end(JSON.stringify(state));});
server.on('upgrade',(req,socket,head)=>bridge.route(req,socket,head));
await unlink(socket).catch(error=>{if(error.code!=='ENOENT')throw error;});
server.listen(socket,()=>chmod(socket,0o660));
async function stop(){server.close();server.closeAllConnections();await bridge.stop();}
process.once('SIGINT',stop);process.once('SIGTERM',stop);
