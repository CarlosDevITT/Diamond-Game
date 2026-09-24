export const TANK_RULES=Object.freeze({durationMs:120000,durationOptions:[120000,300000,600000],countdownMs:3000,damage:25,respawnMs:2000});
export function buildTankMatchPayload(localPlayer,matchStartTime,durationMs=TANK_RULES.durationMs){
 const survivalTimeMs=Math.min(Math.max(0,Date.now()-matchStartTime),durationMs);
 return{game_id:"tank",score:localPlayer.kills,survival_time_ms:survivalTimeMs,metrics:{damage_dealt:localPlayer.totalDamage,shots_fired:localPlayer.totalShots,accuracy:Math.round((localPlayer.hits/(localPlayer.totalShots||1))*100)}};
}
export function resolveTankWinner(a={},b={}){
 const ka=Number(a.kills??a.score)||0,kb=Number(b.kills??b.score)||0;if(ka!==kb)return{winner:ka>kb?"A":"B",reason:"kills"};
 const da=Number(a.damage_dealt??a.metrics?.damage_dealt)||0,db=Number(b.damage_dealt??b.metrics?.damage_dealt)||0;if(da!==db)return{winner:da>db?"A":"B",reason:"damage"};
 const sa=Number(a.survival_time_ms??a.survivalMs)||0,sb=Number(b.survival_time_ms??b.survivalMs)||0;return sa===sb?{winner:null,reason:"draw"}:{winner:sa>sb?"A":"B",reason:"survival"};
}
