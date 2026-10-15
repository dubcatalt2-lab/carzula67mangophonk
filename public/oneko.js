(()=>{
 const anchor=document.getElementById('setWallpaper')?.closest('.set-row');if(!anchor)return;
 const row=document.createElement('div');row.className='set-row';row.innerHTML='<div class="set-ic"><i data-lucide="cat"></i></div><div class="set-info"><span class="set-label">oneko</span><span class="set-sub">a little cat that follows your pointer</span></div><button class="set-toggle" role="switch" aria-label="oneko" aria-checked="false"><span class="set-knob"></span></button>';anchor.after(row);createIcons();
 const button=row.querySelector('button'),motion=matchMedia('(prefers-reduced-motion: reduce)');let enabled=false,cat=null,timer=null,x=40,y=40,tx=40,ty=40,frame=0,idle=0;
 try{enabled=localStorage.getItem('novene-oneko')==='true';}catch{}
 const sprites={N:[[-1,-2],[-1,-3]],NE:[[0,-2],[0,-3]],E:[[-3,0],[-3,-1]],SE:[[-5,-1],[-5,-2]],S:[[-6,-3],[-7,-2]],SW:[[-5,-3],[-6,-1]],W:[[-4,-2],[-4,-3]],NW:[[-1,0],[-1,-1]]};
 function pointer(e){tx=e.clientX;ty=e.clientY;}
 function stop(){clearInterval(timer);timer=null;document.removeEventListener('pointermove',pointer);cat?.remove();cat=null;}
 function tick(){const dx=tx-x,dy=ty-y,d=Math.hypot(dx,dy);let sprite=[-3,-3];if(d>48){idle=0;const direction=(dy/d<-.5?'N':dy/d>.5?'S':'')+(dx/d<-.5?'W':dx/d>.5?'E':'');sprite=sprites[direction][frame++%2];x+=dx/d*10;y+=dy/d*10;}else if(++idle>40)sprite=[-2,Math.floor(idle/4)%2?0:-1];x=Math.max(16,Math.min(innerWidth-16,x));y=Math.max(16,Math.min(innerHeight-16,y));cat.style.left=(x-16)+'px';cat.style.top=(y-16)+'px';cat.style.backgroundPosition=`${sprite[0]*32}px ${sprite[1]*32}px`;}
 function apply(){stop();button.setAttribute('aria-checked',String(enabled));button.classList.toggle('on',enabled);if(!enabled||document.hidden||motion.matches)return;cat=document.createElement('div');cat.dataset.oneko='';cat.setAttribute('aria-hidden','true');cat.style.cssText='position:fixed;width:32px;height:32px;pointer-events:none;image-rendering:pixelated;z-index:2147483647;background-image:url(/pets/oneko.gif)';document.body.append(cat);document.addEventListener('pointermove',pointer,{passive:true});tick();timer=setInterval(tick,100);}
 button.onclick=()=>{enabled=!enabled;try{localStorage.setItem('novene-oneko',String(enabled));}catch{}apply();};
 document.addEventListener('visibilitychange',apply);motion.addEventListener('change',apply);window.addEventListener('pagehide',stop);window.addEventListener('pageshow',apply);window.addEventListener('storage',e=>{if(e.key==='novene-oneko'){enabled=e.newValue==='true';apply();}});apply();
})();
