(()=>{
 const toggle=document.getElementById('setWallpaper'),wall=document.getElementById('wallpaper');if(!toggle||!wall)return;
 const row=toggle.closest('.set-row');
 const panel=document.createElement('div');panel.className='wallpaper-options';panel.innerHTML=`<div class="set-row"><div class="set-ic"><i data-lucide="images"></i></div><div class="set-info"><span class="set-label">choose wallpaper</span><span class="set-sub">nature in 4K, or your own image</span></div><button class="set-btn" id="wallpaperBrowse" aria-expanded="false">browse</button></div><div id="wallpaperPicker" hidden><div class="wallpaper-actions"><label class="set-btn" for="wallpaperUpload" tabindex="0">add image</label><input id="wallpaperUpload" type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden multiple><button class="set-btn" id="wallpaperDefault">use original</button></div><p class="set-sub" id="wallpaperStatus" role="status"></p><div id="wallpaperGrid"></div></div><p class="wallpaper-credit" id="wallpaperCredit"></p>`;
 row.after(panel);createIcons();
 const grid=document.getElementById('wallpaperGrid'),status=document.getElementById('wallpaperStatus'),credit=document.getElementById('wallpaperCredit');
 let catalog=[],custom=[],currentObjectURL=null,revision=0;
 let selection={};try{selection=JSON.parse(localStorage.getItem('novene_wallpapers_v1'))||{};}catch{}
 const mode=()=>document.body.dataset.mode||'black';
 const db=new Promise((resolve,reject)=>{const request=indexedDB.open('novene-wallpapers',1);request.onupgradeneeded=()=>request.result.createObjectStore('images',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
 async function transact(action,value){const database=await db;return new Promise((resolve,reject)=>{const transaction=database.transaction('images',action==='getAll'?'readonly':'readwrite');const request=transaction.objectStore('images')[action](value);transaction.oncomplete=()=>resolve(request.result);transaction.onerror=()=>reject(transaction.error);});}
 function persist(){try{localStorage.setItem('novene_wallpapers_v1',JSON.stringify(selection));}catch{status.textContent='Could not save the selection on this device.';}}
 function enable(){if(!settings.wallpaper){settings.wallpaper=true;writeSettings();applySettings();}}
 async function apply(){
  const ticket=++revision,chosen=[...catalog,...custom].find(item=>item.id===selection[mode()]);
  if(!chosen){wall.style.removeProperty('background');wall.style.removeProperty('filter');wall.style.removeProperty('transform');document.body.removeAttribute('data-custom-wallpaper');credit.replaceChildren();if(currentObjectURL){URL.revokeObjectURL(currentObjectURL);currentObjectURL=null;}return;}
  status.textContent='Loading wallpaper...';const url=chosen.blob?URL.createObjectURL(chosen.blob):chosen.url;
  try{const image=new Image();image.referrerPolicy='no-referrer';image.src=url;await image.decode();if(ticket!==revision){if(chosen.blob)URL.revokeObjectURL(url);return;}
   if(currentObjectURL)URL.revokeObjectURL(currentObjectURL);currentObjectURL=chosen.blob?url:null;
   wall.style.background=`linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.64)),url(${JSON.stringify(url)}) center / cover no-repeat`;wall.style.filter='none';wall.style.transform='none';document.body.dataset.customWallpaper='true';
   credit.replaceChildren();if(chosen.source){const link=document.createElement('a');link.href=chosen.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent=chosen.title+' - '+chosen.author;credit.append(link,document.createTextNode(' / '+chosen.license));}else credit.textContent=chosen.title+' - stored only on this device';
   status.textContent=chosen.width+' x '+chosen.height;render();
  }catch{if(chosen.blob)URL.revokeObjectURL(url);if(ticket===revision)status.textContent='This image could not load. Choose another image or try again.';}
 }
 function render(){
  grid.replaceChildren();for(const item of [...catalog.filter(item=>item.theme===mode()),...custom]){
   const card=document.createElement('div');card.className='wallpaper-card';const button=document.createElement('button');button.className='wallpaper-choice';button.setAttribute('aria-pressed',String(selection[mode()]===item.id));button.title=item.title+' ('+item.width+' x '+item.height+')';
   const img=document.createElement('img');img.loading='lazy';img.alt='';img.src=item.preview||item.thumbnail;img.referrerPolicy='no-referrer';const name=document.createElement('span');name.textContent=item.title;button.append(img,name);button.onclick=()=>{selection[mode()]=item.id;persist();enable();apply();};card.append(button);
   if(item.blob){const remove=document.createElement('button');remove.className='wallpaper-remove';remove.textContent='remove';remove.setAttribute('aria-label','Remove '+item.title);remove.onclick=async()=>{await transact('delete',item.id);URL.revokeObjectURL(item.preview);custom=custom.filter(x=>x.id!==item.id);for(const key of Object.keys(selection))if(selection[key]===item.id)delete selection[key];persist();render();apply();};card.append(remove);}
   grid.append(card);
  }
 }
 document.getElementById('wallpaperBrowse').onclick=()=>{const picker=document.getElementById('wallpaperPicker');picker.hidden=!picker.hidden;document.getElementById('wallpaperBrowse').setAttribute('aria-expanded',String(!picker.hidden));if(!picker.hidden)render();};
 document.getElementById('wallpaperDefault').onclick=()=>{delete selection[mode()];persist();apply();render();};
 document.querySelector('label[for=wallpaperUpload]').onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();document.getElementById('wallpaperUpload').click();}};
 document.getElementById('wallpaperUpload').onchange=async event=>{
  for(const file of event.target.files){
   if(custom.length>=12){status.textContent='You can keep 12 custom wallpapers. Remove one to add another.';break;}
   if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)||file.size>15*1024*1024){status.textContent='Choose a JPEG, PNG, WebP or AVIF image under 15 MB.';continue;}
   let preview;
   try{preview=URL.createObjectURL(file);const image=new Image();image.src=preview;await image.decode();const item={id:crypto.randomUUID(),title:file.name,blob:file,width:image.naturalWidth,height:image.naturalHeight};await transact('put',item);custom.push({...item,preview});selection[mode()]=item.id;persist();enable();await apply();render();}
   catch{if(preview)URL.revokeObjectURL(preview);status.textContent='Could not save this image. Check the file or available browser storage.';}
  }event.target.value='';
 };
 let lastMode=mode();new MutationObserver(()=>{if(mode()===lastMode)return;lastMode=mode();render();apply();}).observe(document.body,{attributes:true,attributeFilter:['data-mode']});
 document.getElementById('setReset')?.addEventListener('click',()=>{selection={};persist();apply();render();});
 Promise.all([fetch('/wallpapers.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}),transact('getAll')]).then(([items,saved])=>{catalog=items;custom=saved.map(item=>({...item,preview:URL.createObjectURL(item.blob)}));render();apply();}).catch(()=>{status.textContent='Wallpaper storage or the gallery is unavailable. Please reload.';});
})();
