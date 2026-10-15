import {parse} from 'parse5';
import {parse as parseScript} from 'acorn';
import {createHash} from 'node:crypto';

export function collectSymbols(html){
 const symbols=new Map();
 function visit(node){
  for(const attr of node.attrs||[])if(attr.name==='id'&&/^[a-z][A-Za-z0-9]{5,}$/.test(attr.value)&&/[A-Z]/.test(attr.value))symbols.set(attr.value,'n'+createHash('sha256').update('novene-dom:'+attr.value).digest('hex').slice(0,12));
  for(const child of node.childNodes||[])visit(child);
 }
 visit(parse(html));return symbols;
}
export function replaceSymbols(text,symbols){
 return text.replace(/[A-Za-z_$][\w$-]*/g,word=>symbols.get(word)||word);
}
export function encodeStrings(source,module=false){
 const edits=[];
 function visit(node){
  if(!node||typeof node!=='object')return;
  if(node.type==='Literal'&&typeof node.value==='string'){
   let encoded='"';
   for(let i=0;i<node.value.length;i++)encoded+='\\u'+node.value.charCodeAt(i).toString(16).padStart(4,'0');
   edits.push({start:node.start,end:node.end,text:encoded+'"'});
  }
  for(const [key,value] of Object.entries(node)){if(key==='value'||key==='raw')continue;if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object')visit(value);}
 }
 visit(parseScript(source,{ecmaVersion:'latest',sourceType:module?'module':'script'}));
 for(const edit of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
 return source;
}
