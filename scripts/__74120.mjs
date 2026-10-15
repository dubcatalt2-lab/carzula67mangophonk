export const __74121=[
 ['__74101','lavender',265,68,78],['__74102','dark purple',275,65,66],
 ['__74103','hot pink',330,92,68],['__74104','light pink',340,80,83],
 ['__74105','teal',174,62,62],['__74106','amber',38,90,67],
 ['__74107','coral',12,88,72],['__74108','midnight blue',222,72,70]
];
export function __74122(__74123){
 __74123=__74123.replace('colorMenu.classList.toggle("open",open);',`if(open){const __74130=colorBtn.getBoundingClientRect(),__74131=colorRoot.closest('.set-body')?.getBoundingClientRect(),__74132=Math.max(0,__74130.top-Math.max(0,__74131?.top||0)-12),__74133=Math.max(0,Math.min(innerHeight,__74131?.bottom||innerHeight)-__74130.bottom-12),__74134=__74132>__74133; colorMenu.style.top=__74134?'auto':'calc(100% + 6px)';colorMenu.style.bottom=__74134?'calc(100% + 6px)':'auto';colorMenu.style.maxHeight=Math.min(360,__74134?__74132:__74133)+'px';}colorMenu.classList.toggle("open",open);`);
 const __74124=Object.fromEntries(__74121.map(([id,label])=>[id,label]));
 __74123=__74123.replace('const MODE_ACCENT={','const MODE_ACCENT={'+__74121.map(([id])=>JSON.stringify(id)+':'+JSON.stringify(id)).join(',')+',');
 __74123=__74123.replace('colorLabel.textContent=settings.mode','colorLabel.textContent=('+JSON.stringify(__74124)+')[settings.mode]||settings.mode');
 __74123=__74123.replace('const col={green:', 'const col=encodeURIComponent(getComputedStyle(document.body).getPropertyValue("--green-lit").trim())||{green:');
 return __74123;
}
export function __74125(__74126){
 const __74127=__74121.map(([id,label])=>`<button class="set-dropdown-opt" data-mode="${id}" type="button">${label}</button>`).join('');
 __74126=__74126.replace('<div class="set-dropdown-menu" id="setColorModeMenu">','<div class="set-dropdown-menu" id="setColorModeMenu">'+__74127);
 __74126=__74126.replace('green, red, blue, black or white theme','choose your colors');
 let __74128=__74121.map(([id,label,h,s,l])=>`body[data-mode="${id}"]{
 --green:hsl(${h} ${s}% 35%);--green-lit:hsl(${h} ${s}% ${l}%);--green-soft:hsla(${h},${s}%,${l}%,.14);
 --green-rgb:${__74129(h,s,l)};--bg:hsl(${h} 24% 4%);--bg-2:hsl(${h} 22% 6%);
 --panel:hsl(${h} 22% 8%);--panel-2:hsl(${h} 22% 11%);--line:hsl(${h} 18% 21%);
 --text:hsl(${h} 28% 94%);--text-dim:hsl(${h} 20% 72%);--muted:hsl(${h} 14% 57%);
 --chrome:hsla(${h},25%,6%,.88);--overlay:hsla(${h},25%,4%,.86);
 --wall-tint:hsla(${h},25%,6%,.48);--wall-tint-2:hsla(${h},25%,6%,.64);
 }
 body[data-mode="${id}"] .wallpaper{background:linear-gradient(var(--wall-tint),var(--wall-tint-2)),url('/wallpapers/moon.jpg') center/cover no-repeat,var(--bg);}`).join('\n');
 __74128+='body[data-mode="green"] .wallpaper{background:linear-gradient(var(--wall-tint),var(--wall-tint-2)),url("/n.png") center/cover no-repeat,var(--bg);}#setColorModeMenu{max-height:min(360px,55vh);overflow-y:auto;overscroll-behavior:contain;}';
 __74128+='#setColorModeMenu{box-sizing:border-box;scrollbar-width:thin;scrollbar-color:var(--muted) var(--panel-2);color-scheme:dark;}#setColorModeMenu::-webkit-scrollbar{width:6px;}#setColorModeMenu::-webkit-scrollbar-track{background:var(--panel-2);}#setColorModeMenu::-webkit-scrollbar-thumb{background:var(--muted);border-radius:8px;}';
 return __74126.replace('</head>','<style>'+__74128+'</style></head>');
}
function __74129(h,s,l){s/=100;l/=100;const a=s*Math.min(l,1-l);return [0,8,4].map(n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))))}).join(',');}
