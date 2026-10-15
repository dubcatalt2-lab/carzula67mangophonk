import {readFile} from 'node:fs/promises';
const settings=JSON.parse(await readFile('/etc/novene/private.json','utf8'));for(const [key,value] of Object.entries(settings))process.env[key]=String(value);
await import('../server.mjs');
