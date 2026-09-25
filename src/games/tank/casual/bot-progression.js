const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export class BotProgression{
 sync(ctx){
  const now=performance.now(),playerLevel=Object.values(ctx.upgrades).reduce((a,b)=>a+(Number(b)||0),0),elapsed=Math.max(0,now-ctx.matchStartedAt);
  const timeTier=Math.floor(elapsed/45000),killTier=Math.floor((ctx.player.kills||0)/3),earnedTier=Math.floor(playerLevel/5),targetLevel=clamp(Math.max(timeTier,killTier,earnedTier),0,5);
  if(now-ctx.trace.lastSampleAt>1200){
   ctx.trace.lastSampleAt=now;
   ctx.trace.accuracy=ctx.trace.shots?ctx.trace.hits/ctx.trace.shots:0;
   ctx.trace.mobility=clamp(ctx.trace.distance/22000,0,1);
   ctx.trace.aggression=clamp(((ctx.player.kills||0)+ctx.trace.shots/24)/10,0,1);
   ctx.adapt.skill=clamp(playerLevel/55,0,1);
   ctx.adapt.pressure=clamp(ctx.adapt.skill*.45+ctx.trace.accuracy*.2+ctx.trace.mobility*.1+ctx.trace.aggression*.1+targetLevel*.03,0,.72);
  }
  const wanted=clamp(1+Math.floor(elapsed/60000)+Math.floor((ctx.player.kills||0)/5)+Math.floor(playerLevel/12),1,4);
  ctx.adapt.bots=wanted;
  while(ctx.bots.length<wanted){
   const [x,y]=ctx.findRespawn(ctx.player.x,ctx.player.y),level=Math.max(0,targetLevel-1);
   const bot={x,y,bodyAngle:Math.atan2(ctx.player.y-y,ctx.player.x-x),turretAngle:0,hp:100+level*12,maxHp:100+level*12,kills:0,alive:true,level,shotAt:now+900,magazine:6,reloadUntil:now+700,path:[],pathAt:0,stuckAt:now,lastX:x,lastY:y,escapeDir:Math.random()<.5?-1:1,invulnerableUntil:now+1800};
   bot.turretAngle=bot.bodyAngle;ctx.bots.push(bot);
  }
  for(const bot of ctx.bots){
   bot.level=Math.min(targetLevel,Math.max(0,Number(bot.level)||0)+(targetLevel>(Number(bot.level)||0)?1:0));
   const nextMax=100+bot.level*12;
   if(bot.maxHp!==nextMax){const ratio=clamp((bot.hp||bot.maxHp||100)/(bot.maxHp||100),0,1);bot.maxHp=nextMax;bot.hp=Math.max(1,Math.round(nextMax*ratio));}
  }
  return{level:targetLevel,wanted,pressure:ctx.adapt.pressure};
 }
}
