(()=>{
 const statuses=new Map();let previous='',connectionFailed=false;
 const canonical=value=>{try{const url=new URL(value);url.hash='';return url.href;}catch{return '';}};
 function render(){
  const icon=document.querySelector('.url-icon');if(!icon)return;
  const tab=typeof activeTab==='function'?activeTab():null;
  const url=tab?.pendingUrl||tab?.url||'';
  const status=statuses.get(canonical(url));let kind='unknown',label='Connection not identified';
  if(/^http:\/\//i.test(url)){kind='bad';label='Not encrypted: this page uses HTTP';}
  else if(connectionFailed||status?.failed||(status?.status>=400)){kind='bad';label='Page connection failed';}
  else if(/^https:\/\//i.test(url)&&status?.status>=200&&status.status<400){kind='good';label='HTTPS response received; this does not verify the site’s trustworthiness';}
  else if(status?.loading)label='Checking page connection';
  const key=kind+':'+label;if(previous===key&&icon.dataset.connection===kind)return;previous=key;
  const unlocked=kind==='bad';icon.innerHTML=`<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="${unlocked?'M8 10V6a4 4 0 0 1 7.5-2':'M8 10V6a4 4 0 0 1 8 0v4'}"/><path d="M12 14v3"/></svg>`;
  icon.style.color=kind==='good'?'#54bd83':kind==='bad'?'#ee7777':'#e1b95c';icon.dataset.connection=kind;icon.title=label;icon.setAttribute('role','img');icon.setAttribute('aria-label',label);
 }
 window.addEventListener('novene-page-response',event=>{const key=canonical(event.detail.url);if(!key)return;statuses.delete(key);statuses.set(key,event.detail);if(statuses.size>256)statuses.delete(statuses.keys().next().value);render();});
 window.addEventListener('novene-engine-state',event=>{connectionFailed=!!event.detail.error;render();});
 if(typeof setUrlIcon==='function'){const original=setUrlIcon;setUrlIcon=function(...args){original(...args);previous='';render();};}
 document.addEventListener('load',render,true);setInterval(()=>{if(!document.hidden)render();},500);render();
})();
