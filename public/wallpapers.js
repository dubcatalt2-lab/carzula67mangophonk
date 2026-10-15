(()=>{
 const toggle=document.getElementById('setWallpaper'),wall=document.getElementById('wallpaper');if(!toggle||!wall)return;
 const row=toggle.closest('.set-row');
 const panel=document.createElement('div');panel.className='wallpaper-options';panel.innerHTML=`<div class="wallpaper-actions"><button class="set-btn" id="wallpaperAdd"><i data-lucide="upload" aria-hidden="true"></i><span>upload background</span></button><input id="wallpaperUpload" type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden><button class="set-btn" id="wallpaperDefault"><i data-lucide="rotate-ccw" aria-hidden="true"></i><span>reset background</span></button></div><p class="set-sub" id="wallpaperStatus" role="status"></p><p class="wallpaper-credit" id="wallpaperCredit"></p>`;
 row.after(panel);row.querySelector('.set-sub').textContent='show your background image';createIcons();
 const status=document.getElementById('wallpaperStatus'),credit=document.getElementById('wallpaperCredit');
 let custom=[],currentObjectURL=null,revision=0;
 let selection={};try{selection=JSON.parse(localStorage.getItem('novene_wallpapers_v1'))||{};}catch{}
 const mode=()=> 'all';
 const db=new Promise((resolve,reject)=>{const request=indexedDB.open('novene-wallpapers',1);request.onupgradeneeded=()=>request.result.createObjectStore('images',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
 async function transact(action,value){const database=await db;return new Promise((resolve,reject)=>{const transaction=database.transaction('images',action==='getAll'?'readonly':'readwrite');const request=transaction.objectStore('images')[action](value);transaction.oncomplete=()=>resolve(request.result);transaction.onerror=()=>reject(transaction.error);});}
 function persist(){try{localStorage.setItem('novene_wallpapers_v1',JSON.stringify(selection));}catch{status.textContent='Could not save the selection on this device.';}}
 function enable(){if(!settings.wallpaper){settings.wallpaper=true;writeSettings();applySettings();}}
 async function apply(){
  const ticket=++revision,chosen=custom.find(item=>item.id===selection[mode()]);
  if(!chosen){wall.style.removeProperty('background');wall.style.removeProperty('filter');wall.style.removeProperty('transform');document.body.removeAttribute('data-custom-wallpaper');credit.replaceChildren();if(currentObjectURL){URL.revokeObjectURL(currentObjectURL);currentObjectURL=null;}return;}
  status.textContent='Loading wallpaper...';const url=chosen.blob?URL.createObjectURL(chosen.blob):chosen.url;
  try{const image=new Image();image.referrerPolicy='no-referrer';image.src=url;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Image load timed out')),12000);image.decode().then(resolve,reject).finally(()=>clearTimeout(timer));});if(ticket!==revision){if(chosen.blob)URL.revokeObjectURL(url);return;}
   if(currentObjectURL)URL.revokeObjectURL(currentObjectURL);currentObjectURL=chosen.blob?url:null;
   wall.style.background=`linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.64)),url(${JSON.stringify(url)}) center / cover no-repeat`;wall.style.filter='none';wall.style.transform='none';document.body.dataset.customWallpaper='true';
   credit.replaceChildren();if(chosen.source){const link=document.createElement('a');link.href=chosen.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent=chosen.title+' - '+chosen.author;credit.append(link,document.createTextNode(' / '+chosen.license));}else credit.textContent=chosen.title+' - stored only on this device';
   status.textContent=chosen.width+' x '+chosen.height;
  }catch{if(chosen.blob)URL.revokeObjectURL(url);if(ticket===revision)status.textContent='This image could not load. Choose another image or try again.';}
 }
 document.getElementById('wallpaperAdd').onclick=()=>document.getElementById('wallpaperUpload').click();
 document.getElementById('wallpaperDefault').onclick=()=>{selection={};persist();apply();status.textContent='Default background restored.';};
 document.getElementById('wallpaperUpload').onchange=async event=>{
  for(const file of event.target.files){
   if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)||file.size>15*1024*1024){status.textContent='Choose a JPEG, PNG, WebP or AVIF image under 15 MB.';continue;}
   let preview;
   try{preview=URL.createObjectURL(file);const image=new Image();image.src=preview;await image.decode();const item={id:'personal-background',title:file.name,blob:file,width:image.naturalWidth,height:image.naturalHeight};await transact('put',item);for(const old of custom)URL.revokeObjectURL(old.preview);custom=[{...item,preview}];selection[mode()]=item.id;persist();enable();await apply();}
   catch{if(preview)URL.revokeObjectURL(preview);status.textContent='Could not save this image. Check the file or available browser storage.';}
  }event.target.value='';
 };
 document.getElementById('setReset')?.addEventListener('click',()=>{selection={};persist();apply();});
 transact('getAll').then(saved=>{custom=saved.map(item=>({...item,preview:URL.createObjectURL(item.blob)}));if(!selection.all){const old=selection[document.body.dataset.mode||'black'];if(custom.some(item=>item.id===old))selection.all=old;}selection=selection.all?{all:selection.all}:{};persist();apply();}).catch(()=>{status.textContent='Custom background storage is unavailable. The default background is still available.';});
})();
