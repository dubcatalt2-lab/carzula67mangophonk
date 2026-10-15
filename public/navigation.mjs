export const engines={brave:'https://search.brave.com/search?q=',duckduckgo:'https://duckduckgo.com/?q=',ddg:'https://duckduckgo.com/?q=',google:'https://www.google.com/search?q=',bing:'https://www.bing.com/search?format=rss&q=',startpage:'https://www.startpage.com/sp/search?query='};
export function resolveInput(value,engine='ddg'){
 const text=String(value||'').trim();if(!text)throw Error('Enter a website or something to find.');
 const direct=/^https?:\/\//i.test(text)||/^\/\//.test(text)||(!/\s/.test(text)&&/^(?:localhost|(?:[^/:?#]+\.)+[^/:?#]+|\[[0-9a-f:]+\])(?::\d+)?(?:[/?#]|$)/i.test(text));
 if(direct){const parsed=new URL(/^https?:\/\//i.test(text)?text:text.startsWith('//')?'https:'+text:'https://'+text);if(parsed.username||parsed.password)throw Error('Open a website without credentials in its address.');return parsed.href;}
 if(/^[a-z][a-z0-9+.-]*:/i.test(text))throw Error('Only HTTP and HTTPS pages can be opened.');
 return (engines[engine]||engines.ddg)+encodeURIComponent(text);
}
