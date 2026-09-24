const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export function drawTankSprite(c,t,color,{scale=1}={}){
 const bw=50*scale,bh=36*scale,innerW=40*scale,innerH=28*scale,coreW=32*scale,coreH=20*scale,barrel=34*scale,line=7*scale,turret=13*scale;
 c.save();c.translate(t.x,t.y);c.rotate(t.bodyAngle);c.shadowBlur=16*scale;c.shadowColor=color;c.fillStyle="#080b17";c.fillRect(-bw/2,-bh/2,bw,bh);c.fillStyle=color;c.fillRect(-innerW/2,-innerH/2,innerW,innerH);c.fillStyle="#080b17";c.fillRect(-coreW/2,-coreH/2,coreW,coreH);c.shadowBlur=10*scale;c.shadowColor="#fff";c.fillStyle="#fff";c.beginPath();c.moveTo(27*scale,0);c.lineTo(16*scale,-9*scale);c.lineTo(16*scale,9*scale);c.closePath();c.fill();c.shadowBlur=0;c.fillStyle=color;c.beginPath();c.arc(17*scale,0,3.5*scale,0,Math.PI*2);c.fill();c.restore();
 c.save();c.translate(t.x,t.y);c.rotate(t.turretAngle);c.strokeStyle="#fff";c.lineCap="round";c.lineWidth=line;c.beginPath();c.moveTo(0,0);c.lineTo(barrel,0);c.stroke();c.fillStyle=color;c.beginPath();c.arc(0,0,turret,0,Math.PI*2);c.fill();c.restore();
 const maxHp=t.maxHp||100,barW=50*scale,barH=6*scale,barY=t.y-31*scale;c.fillStyle="#050712";c.fillRect(t.x-barW/2,barY,barW,barH);c.fillStyle=t.hp/maxHp>.5?"#52ffd2":t.hp/maxHp>.25?"#ffcb52":"#ff5c75";c.fillRect(t.x-barW/2,barY,barW*clamp(t.hp/maxHp,0,1),barH);
}

export function drawTankArena({ctx,canvas,world,view,camera,local,remote,remotes=null,projectiles=[],pickups=[],effects=[],showLocal=true,showRemote=true}){
 const w=world.width||1800,h=world.height||1000,vw=view.width||1800,vh=view.height||1000,sx=canvas.clientWidth/vw,sy=canvas.clientHeight/vh;
 ctx.save();ctx.scale(sx,sy);ctx.clearRect(0,0,vw,vh);ctx.translate(-camera.x,-camera.y);
 const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,"#091126");g.addColorStop(.5,"#111936");g.addColorStop(1,"#090d1d");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle="#27315f";ctx.lineWidth=1;for(let x=0;x<w;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 ctx.strokeStyle="#6574c8";ctx.lineWidth=5;ctx.strokeRect(3,3,w-6,h-6);
 for(const o of world.obstacles||[]){ctx.shadowBlur=18;ctx.shadowColor="#000";ctx.fillStyle="#20294a";ctx.fillRect(o.x,o.y,o.w,o.h);ctx.shadowBlur=0;ctx.strokeStyle="#7181d5";ctx.lineWidth=3;ctx.strokeRect(o.x,o.y,o.w,o.h);ctx.fillStyle="#ffffff0d";for(let y=o.y+12;y<o.y+o.h;y+=20)ctx.fillRect(o.x+8,y,o.w-16,4);}
 for(const item of pickups){const pulse=1+Math.sin(performance.now()/220+(item.phase||0))*.13;ctx.shadowBlur=18;ctx.shadowColor=item.type==="credit"?"#ffda6b":"#52ffd2";ctx.fillStyle=ctx.shadowColor;ctx.beginPath();ctx.arc(item.x,item.y,9*pulse,0,Math.PI*2);ctx.fill();ctx.fillStyle="#091126";ctx.font="700 10px sans-serif";ctx.textAlign="center";ctx.fillText(item.type==="credit"?"◆":"+",item.x,item.y+3);ctx.textAlign="left";ctx.shadowBlur=0;}
 ctx.fillStyle="#52ffd21a";ctx.fillRect(25,455,150,90);ctx.fillStyle="#ff49c71a";ctx.fillRect(w-175,455,150,90);
 const enemies=Array.isArray(remotes)&&remotes.length?remotes:[remote];if(showRemote)for(const enemy of enemies){if(enemy?.alive!==false)drawTankSprite(ctx,enemy,"#ff49c7");}if(showLocal&&local?.alive!==false)drawTankSprite(ctx,local,"#52ffd2");
 for(const fx of effects){const max=fx.type==="boom"?34:22,base=fx.type==="boom"?.8:fx.type==="pickup"?.45:.28,alpha=Math.max(0,fx.life/base);ctx.globalAlpha=alpha;ctx.strokeStyle=fx.type==="boom"?"#ffb347":fx.type==="pickup"?"#ffda6b":"#fff";ctx.lineWidth=5;ctx.beginPath();ctx.arc(fx.x,fx.y,max*(1-alpha)+8,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
 for(const p of projectiles){ctx.fillStyle=p.type==="bomb"?"#ff9e52":p.type==="shock"?"#7cb8ff":"#fff";ctx.shadowBlur=p.type==="bomb"?22:12;ctx.shadowColor=p.enemy?"#ff49c7":p.type==="bomb"?"#ff9e52":"#52ffd2";ctx.beginPath();ctx.arc(p.x,p.y,p.type==="bomb"?11:5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
 ctx.restore();
 ctx.save();ctx.fillStyle="rgba(5,7,18,.78)";ctx.fillRect(12,12,172,40);ctx.fillStyle="#fff";ctx.font="700 15px sans-serif";ctx.fillText(`HP ${Math.ceil(local.hp)}/${local.maxHp||100}`,23,37);
 const mw=150,mh=78,mx=canvas.clientWidth-mw-14,my=14;ctx.fillStyle="rgba(5,7,18,.82)";ctx.fillRect(mx,my,mw,mh);ctx.strokeStyle="#ffffff22";ctx.strokeRect(mx,my,mw,mh);const mapX=x=>mx+x/w*mw,mapY=y=>my+y/h*mh;ctx.fillStyle="#52ffd2";ctx.beginPath();ctx.arc(mapX(local.x),mapY(local.y),4,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ff49c7";for(const enemy of enemies){if(!enemy)continue;ctx.beginPath();ctx.arc(mapX(enemy.x),mapY(enemy.y),4,0,Math.PI*2);ctx.fill();}ctx.strokeStyle="#ffffff44";ctx.strokeRect(mapX(camera.x),mapY(camera.y),vw/w*mw,vh/h*mh);ctx.restore();
}
