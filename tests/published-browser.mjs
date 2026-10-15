import {readFile,writeFile,unlink} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {collectSymbols,replaceSymbols} from '../scripts/dom-symbols.mjs';
const symbols=collectSymbols(await readFile('public/index.html','utf8'));
for(const name of ['browser','background-browser','search-browser','worker-revival-browser','home-navigation-browser']){
 const temporary='tests/.compiled-'+name+'.mjs';
 try{
  await writeFile(temporary,replaceSymbols(await readFile('tests/'+name+'.mjs','utf8'),symbols));
  const result=spawnSync(process.execPath,[temporary],{stdio:'inherit'});
  if(result.status!==0)throw new Error(name+' failed');
 }finally{await unlink(temporary).catch(()=>{});}
}
