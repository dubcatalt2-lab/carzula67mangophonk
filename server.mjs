import {createVpn} from './lib/vpn.mjs';
import express from 'express';
import {readFile} from 'node:fs/promises';
import {createBackendConnection} from './lib/backend-connection.mjs';
import {createAiRouter} from './lib/ai.mjs';
import {configuredFirestoreStore} from './lib/firestore-store.mjs';
import {createCommunity} from './lib/community.mjs';
import {createPresence} from './lib/presence.mjs';
import {createServer} from 'node:http';
import {fileURLToPath} from 'node:url';
import {startCourier} from './lib/net-bridge.mjs';
const root=fileURLToPath(new URL('./.published/',import.meta.url));
const app=express();
app.set('trust proxy','loopback');
app.disable('x-powered-by');
let localBackend={};try{localBackend=JSON.parse(await readFile(new URL('./data/local-backend.json',import.meta.url),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
const remoteOrigin=process.env.NOVENE_BACKEND_ORIGIN||localBackend.origin;
const remote=remoteOrigin?createBackendConnection(remoteOrigin):null;
if(remote)app.use(remote.handle);
app.use((_req,res,next)=>{res.setHeader('Cross-Origin-Opener-Policy','same-origin');res.setHeader('Cross-Origin-Embedder-Policy','credentialless');res.setHeader('X-Content-Type-Options','nosniff');next();});

const community=await createCommunity({directory:process.env.COMMUNITY_DATA||'data/community',store:configuredFirestoreStore()});
app.use('/api/community',community.router);
app.use('/api',createPresence({authenticate:community.authenticate}));
app.use('/api/ai',await createAiRouter({authenticate:community.authenticate}));
const browsingSockets=new Set();
const vpn=await createVpn({authenticate:community.authenticate,disconnect:()=>{for(const socket of browsingSockets)socket.destroy();}});
app.use('/api/connection',vpn.router);
let bridge;
app.get('/healthz',(_req,res)=>res.status(bridge?.isRunning?200:503).json({ready:!!bridge?.isRunning}));
app.use(express.static(root,{setHeaders(res,path){if(path.endsWith('.js')||path.endsWith('.mjs')||path.endsWith('.html'))res.setHeader('Cache-Control','no-cache');}}));
app.use((_req,res)=>res.status(404).type('text').send('Page not found. Return to the Novene home page.'));
const server=createServer(app);
bridge=await startCourier({port:Number(process.env.WORKER_PORT||6101),onFailure:error=>{console.error(error.message);server.close();}});
server.on('upgrade',(req,socket,head)=>{
 if(req.url==='/api/community/socket')(remote||community).upgrade(req,socket,head);
 else if(['/courier/','/courier'].includes(req.url)){browsingSockets.add(socket);socket.once('close',()=>browsingSockets.delete(socket));if(remote)remote.upgrade(req,socket,head);else if(vpn.enabled)vpn.upgrade(req,socket,head);else bridge.route(req,socket,head);}
 else socket.end('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
});
server.once('error',async error=>{console.error(error.message);await bridge.stop();process.exitCode=1;});
server.listen(Number(process.env.PORT||8081),process.env.HOST||'127.0.0.1',()=>console.log(`Novene ready at http://localhost:${server.address().port}`));
let closing=false;
async function stop(){if(closing)return;closing=true;server.close();server.closeAllConnections();await bridge.stop();await community.close();}
process.once('SIGINT',stop);process.once('SIGTERM',stop);
