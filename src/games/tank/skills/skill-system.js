const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export class TankSkillSystem{
 #cooldowns={bomb:0,shock:0,dash:0};
 activate(type,ctx){
  try{
   const now=performance.now(),player=ctx.player,upgrades=ctx.upgrades,a=player.turretAngle;
   if(type==="bomb"){
    const level=upgrades.bomb||0;if(!level||now<this.#cooldowns.bomb)return false;
    this.#cooldowns.bomb=now+Math.max(3500,8500-level*900);
    const speed=260+level*18;
    ctx.projectiles.push({id:crypto.randomUUID(),ownerId:ctx.playerId||"local",x:player.x,y:player.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,ttl:2.2,bounces:0,enemy:false,type:"bomb",level,detonateAt:now+900});
    ctx.effects.push({x:player.x,y:player.y,life:.45,type:"charge"});
   }else if(type==="shock"){
    const level=upgrades.shock||0;if(!level||now<this.#cooldowns.shock)return false;
    this.#cooldowns.shock=now+Math.max(3000,7000-level*700);
    const radius=170+level*28;ctx.effects.push({x:player.x,y:player.y,life:.55,type:"shock"});
    for(const bot of [...ctx.bots]){
     if(!bot||Math.hypot(bot.x-player.x,bot.y-player.y)>=radius)continue;
     bot.hp=Math.max(0,(Number(bot.hp)||0)-(12+level*6));
     if(bot.hp<=0){player.kills++;player.coins+=100+(upgrades.overdrive||0)*15;ctx.respawnBot(bot);}
    }
    ctx.setShockUntil(now+800+level*250);
   }else if(type==="dash"){
    const level=upgrades.speed||0;if(!level||now<this.#cooldowns.dash)return false;
    this.#cooldowns.dash=now+Math.max(1800,4200-level*400);
    const distance=70+level*18,ox=player.x,oy=player.y;
    player.x=clamp(player.x+Math.cos(player.bodyAngle)*distance,28,ctx.world.width-28);
    player.y=clamp(player.y+Math.sin(player.bodyAngle)*distance,28,ctx.world.height-28);
    if(ctx.obstacles.some(o=>player.x+22>o.x&&player.x-22<o.x+o.w&&player.y+18>o.y&&player.y-18<o.y+o.h)){player.x=ox;player.y=oy;}
    ctx.effects.push({x:player.x,y:player.y,life:.3,type:"pickup"});
   }else return false;
   if(ctx.effects.length>80)ctx.effects.splice(0,ctx.effects.length-80);
   if(ctx.projectiles.length>140)ctx.projectiles.splice(0,ctx.projectiles.length-140);
   if(!ctx.casual)ctx.send("TANK_SPECIAL",{type,angle:a,level:upgrades[type]||upgrades.speed||0});
   return true;
  }catch(error){console.error("[TankSkillSystem] skill recovered",type,error);return false;}
 }
 detonate(projectile,level,ctx){
  if(ctx.destroyed||!projectile||projectile.detonated)return false;
  projectile.detonated=true;projectile.ttl=0;
  const radius=125+level*18;ctx.effects.push({x:projectile.x,y:projectile.y,life:.8,type:"boom"});
  for(let n=0;n<8;n++){const a=n/8*Math.PI*2;ctx.effects.push({x:projectile.x+Math.cos(a)*radius*.55,y:projectile.y+Math.sin(a)*radius*.55,life:.3,type:"hit"});}
  if(ctx.casual)for(const bot of ctx.bots){
   const dist=Math.hypot(projectile.x-bot.x,projectile.y-bot.y);if(dist>=radius)continue;
   const damage=Math.round((55+level*12)*(1-dist/radius*.45));bot.hp=Math.max(0,bot.hp-damage);ctx.player.totalDamage+=damage;
   if(!bot.hp){ctx.player.kills++;ctx.player.coins+=100+(ctx.upgrades.overdrive||0)*15;ctx.respawnBot(bot);}
  }
  return true;
 }
 reset(){this.#cooldowns={bomb:0,shock:0,dash:0};}
}
