window.noveneCatalogReady=(async()=>{
 try{const response=await fetch('/api/ai/models',{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Model catalog unavailable');const data=await response.json();if(!data.configured||!data.models?.length)return;
 const old=[...AI_MODELS];AI_MODELS.splice(0,AI_MODELS.length,...data.models.map(model=>{const fam=String(model.company||model.id.split('/')[0]).toLowerCase().replace('anthropic','claude').replace('openai','openai');const logo=old.find(m=>m.fam===fam)?.logo||'';return {...model,fam,logo,label:model.label||model.id};}));AI_VISION.clear();for(const model of AI_MODELS)if(model.vision)AI_VISION.add(model.id);AI_VISION_DEFAULT=AI_MODELS.find(m=>m.vision&&!m.premium)?.id||AI_MODELS.find(m=>m.vision)?.id||AI_MODELS[0].id;
 if(!AI_MODELS.some(m=>m.id===aiModel))aiModel=AI_MODELS.find(m=>!m.premium)?.id||AI_MODELS[0].id;saveAiModel();AI_PROVIDERS.splice(0,AI_PROVIDERS.length,...data.providers);if(!AI_PROVIDERS.includes(aiProvider))aiProvider='auto';paintAiProvider();renderAiModelList();
 }catch{aiSystemMsg('The model list could not load. Reload to try again.');}
})();
