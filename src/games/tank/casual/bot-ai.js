const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerpAngle=(a,b,t)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
export class BotAI{
 update(dt,ctx){
  if(ctx.dead)return;
  const difficulty=ctx.difficulty,base={basic:{speed:125,turn:4.4,aim:4.8,fire:820,spread:.19,range:620,keep:225,bullet:400,damage:22},hard:{speed:135,turn:5.1,aim:5.8,fire:740,spread:.15,range:660,keep:215,bullet:420,damage:23},pro:{speed:145,turn:5.8,aim:6.8,fire:660,spread:.12,range:700,keep:205,bullet:440,damage:24}}[difficulty]||{speed:125,turn:4.4,aim:4.8,fire:820,spread:.19,range:620,keep:225,bullet:400,damage:22},now=performance.now();
  ctx.navigation.trackTarget(ctx.player.x,ctx.player.y);
  for(const bot of ctx.bots){
   const level=bot.level||ctx.botLevel,adaptive=ctx.pressure||0,dx=ctx.player.x-bot.x,dy=ctx.player.y-bot.y,dist=Math.max(1,Math.hypot(dx,dy)),aim=Math.atan2(dy,dx),cfg={...base,speed:base.speed*(1+level*.055+adaptive*.08),fire:Math.max(360,base.fire-level*42-adaptive*70),damage:base.damage+level*2+Math.round(adaptive*3),bullet:base.bullet+level*14+adaptive*22,spread:Math.max(.035,base.spread*(1-level*.08-adaptive*.22))};
   bot.turretAngle=lerpAngle(bot.turretAngle,aim,Math.min(1,cfg.aim*dt));
   const movedSince=Math.hypot(bot.x-(bot.lastX??bot.x),bot.y-(bot.lastY??bot.y));if(now-(bot.stuckAt||0)>300){if(movedSince<12){bot.path=[];bot.pathAt=0;bot.escapeDir=(bot.escapeDir||1)*-1;}bot.lastX=bot.x;bot.lastY=bot.y;bot.stuckAt=now;}
   const visible=ctx.navigation.lineClear(bot.x,bot.y,ctx.player.x,ctx.player.y);if(visible){bot.path=[];bot.pathAt=now+180;}else if(now>(bot.pathAt||0)||!bot.path?.length){bot.path=ctx.navigation.path(bot.x,bot.y,ctx.player.x,ctx.player.y);bot.pathAt=now+900;}
   let target=bot.path?.[0]||ctx.player;if(bot.path?.length&&Math.hypot(target.x-bot.x,target.y-bot.y)<52){bot.path.shift();target=bot.path[0]||ctx.player;}
   let moveAngle=Math.atan2(target.y-bot.y,target.x-bot.x);if(visible&&dist<cfg.keep)moveAngle=aim+Math.PI;else if(visible&&dist<cfg.keep*1.45)moveAngle=aim+(bot.escapeDir||1)*.72;
   const diff=Math.atan2(Math.sin(moveAngle-bot.bodyAngle),Math.cos(moveAngle-bot.bodyAngle));bot.bodyAngle+=diff*Math.min(1,cfg.turn*dt);const drive=Math.max(.7,1-Math.abs(diff)/Math.PI*.35),step=cfg.speed*drive*dt;let moved=false;
   for(const offset of [0,.32,-.32,.7,-.7,1.15,-1.15,Math.PI]){const a=bot.bodyAngle+offset,nx=clamp(bot.x+Math.cos(a)*step,30,ctx.world.width-30),ny=clamp(bot.y+Math.sin(a)*step,30,ctx.world.height-30);if(!ctx.navigation.blocked(nx,ny,27)&&Math.hypot(nx-ctx.player.x,ny-ctx.player.y)>=46){bot.x=nx;bot.y=ny;if(offset)bot.bodyAngle=lerpAngle(bot.bodyAngle,a,.22);moved=true;break;}}
   if(!moved){bot.path=[];bot.pathAt=0;bot.escapeDir=(bot.escapeDir||1)*-1;bot.bodyAngle+=bot.escapeDir*.9;const reverse=bot.bodyAngle+Math.PI,nx=bot.x+Math.cos(reverse)*cfg.speed*dt,ny=bot.y+Math.sin(reverse)*cfg.speed*dt;if(!ctx.navigation.blocked(nx,ny,27)){bot.x=nx;bot.y=ny;}}
   if(!visible||now<(bot.reloadUntil||0))continue;if((bot.magazine??6)<=0){bot.reloadUntil=now+(difficulty==="pro"?1200:difficulty==="hard"?1450:1750);bot.magazine=6;bot.shotAt=bot.reloadUntil;continue;}
   if(dist<cfg.range&&now-(bot.shotAt||0)>cfg.fire){bot.shotAt=now;bot.magazine--;const lead=(difficulty==="pro"?.1:difficulty==="hard"?.07:.035)+level*.012+adaptive*.035,a=Math.atan2(ctx.player.y+Math.sin(ctx.player.bodyAngle)*220*lead-bot.y,ctx.player.x+Math.cos(ctx.player.bodyAngle)*220*lead-bot.x)+(Math.random()-.5)*cfg.spread,bounces=level>=4?1:0;ctx.projectiles.push({id:crypto.randomUUID(),ownerId:"casual-bot",x:bot.x+Math.cos(a)*30,y:bot.y+Math.sin(a)*30,vx:Math.cos(a)*cfg.bullet,vy:Math.sin(a)*cfg.bullet,ttl:3,enemy:true,damage:cfg.damage,bounces,type:level>=5&&Math.random()<.22?"shock":"normal"});}
  }
 }
}
