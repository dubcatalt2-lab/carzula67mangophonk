import {parse} from 'acorn';

export function repairLibrary(code) {
  const klass=parse(code,{ecmaVersion:'latest'}).body.find(n=>n.type==='ClassDeclaration'&&n.id.name==='LumiSDK');
  if(!klass)throw Error('Library contract changed');
  const edits=[];
  for(const method of klass.body.body){
    let text=code.slice(method.start,method.end);
    if(method.key.name==='loadGames'){
      text=text.replace('let loadedGames=[];', 'let loadedGames=[];this.games=[];const publish=()=>{this.games=loadedGames.filter(g=>g.url&&g.title);this.applyFilters()};');
      text=text.replace('AbortSignal.timeout(25e3)','AbortSignal.timeout(10000)').replace('return await res.json()','const data=await res.json();return Array.isArray(data)?data:[]');
      text=text.replace('const gnmathData=await fetchJSON(GNMATH_API);','await Promise.allSettled([ (async()=>{const gnmathData=await fetchJSON(GNMATH_API);');
      text=text.replace('const ugsData=await fetchJSON(UGS_API);','publish();})(),(async()=>{const ugsData=await fetchJSON(UGS_API);');
      text=text.replace('const daknuxData=await fetchJSON(DAKNUX_API);','publish();})(),(async()=>{const daknuxData=await fetchJSON(DAKNUX_API);');
      text=text.replace('this.games=loadedGames.filter(game=>game.url&&game.title)', 'publish();})()]);this.games=loadedGames.filter(game=>game.url&&game.title)');
      text=text.replaceAll('const gameUrl=cleanUrlParam.includes', 'if(Number(g.id)<0)return;const gameUrl=/^https?:\\/\\//i.test(cleanUrlParam)?cleanUrlParam:cleanUrlParam.includes');
      text=text.replaceAll('cover:g.cover?`${GNMATH_COVER}/${this.cleanPath(g.cover)}`:""', 'cover:g.cover?new URL(this.cleanPath(g.cover),GNMATH_COVER+"/").href:""');
      text=text.replaceAll('cover:g.cover?`${DAKNUX_COVER}/${this.cleanPath(g.cover)}`:""', 'cover:g.cover?new URL(this.cleanPath(g.cover),DAKNUX_COVER+"/").href:""');
    }
    if(method.key.name==='playGame'){
      text=text.replace('this.currentGameUrl=game.url;', 'this.launchController?.abort();const controller=this.launchController=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);this.currentGameUrl=game.url;');
      text=text.replace('try{const response=await fetch(game.url);', 'this.iframe.srcdoc="<body style=\"background:#111;color:#ddd;font:16px system-ui;display:grid;place-items:center;height:90vh\">Loading…</body>";try{const response=await fetch(game.url,{signal:controller.signal});if(!response.ok)throw Error("Download failed");');
                                                                             
      text=text.replace(/htmlText=htmlText\.replace\(\/\(src\|href\|action\|data\)[\s\S]*?;(?=const baseUrl)/,'');
      text=text.replace('this.currentGameHtml=htmlText;', 'if(controller!==this.launchController||controller.signal.aborted)return;this.currentGameHtml=htmlText;');
      text=text.replace('this.iframe.removeAttribute("srcdoc");this.iframe.src=game.url', 'if(controller!==this.launchController)return;this.iframe.srcdoc="<body style=\"background:#111;color:#ddd;font:16px system-ui;padding:40px\">This game could not be downloaded. Go back and try again.</body>";');
      text=text.replace(/}$/, 'finally{clearTimeout(timeout)}}');
                                                                              
      text=text.replaceAll('style="background:', "style='background:").replaceAll('90vh">', "90vh'>").replaceAll('40px">', "40px'>");
    }
    if(method.key.name==='closeGame')text=text.replace('{','{this.launchController?.abort();this.launchController=null;');
    edits.push({start:method.start,end:method.end,text});
  }
  for(const edit of edits.reverse())code=code.slice(0,edit.start)+edit.text+code.slice(edit.end);
  parse(code,{ecmaVersion:'latest'});
  return code;
}
