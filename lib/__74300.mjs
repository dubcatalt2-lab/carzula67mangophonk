export const roles=['owner','admin','dev','mod','booster','member'];
export const rank=user=>{const n=roles.indexOf(user?.role);return n<0?0:roles.length-n;};
export const canAnnounce=user=>['owner','admin'].includes(user?.role);
export const canModerate=user=>['owner','admin','mod'].includes(user?.role);
export function canManage(actor,target,nextRole){
 if(!actor||!target)return false;
 if(actor.role==='owner')return true;
 if(!['admin','mod'].includes(actor.role)||actor.id===target.id||rank(actor)<=rank(target))return false;
 if(nextRole!==undefined)return actor.role==='admin'&&roles.includes(nextRole)&&rank(actor)>rank({role:nextRole});
 return true;
}
