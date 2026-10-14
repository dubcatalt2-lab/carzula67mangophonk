export const engines={brave:'https://search.brave.com/search?q=',duckduckgo:'https://duckduckgo.com/?q=',google:'https://www.google.com/search?q='};
export function resolveInput(value,engine='brave'){
 const text=value.trim();if(!text)throw Error('Enter a website or something to search.');
 if(/^[a-z][a-z0-9+.-]*:/i.test(text)){
  const parsed=new URL(text);if(!['http:','https:'].includes(parsed.protocol))throw Error('Only HTTP and HTTPS pages can be opened.');return parsed.href;
 }
 if(!/\s/.test(text)&&(/^[^/]+\.[^/]+/.test(text)||/^localhost(?::\d+)?(?:\/|$)/.test(text)))return new URL('https://'+text).href;
 return (engines[engine]||engines.brave)+encodeURIComponent(text);
}
