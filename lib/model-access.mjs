export function modelAllowed(id,user={}){
 if(id==='openai/gpt-5.6-sol-pro')return user.role==='owner';
 if(id==='openai/gpt-5.6-luna')return user.role==='owner'||user.premiumUntil>Date.now();
 return true;
}
