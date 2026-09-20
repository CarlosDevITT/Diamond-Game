const DIRS={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
export const snakeGame={id:"snake",name:"Snake",description:"Snake arcade modular",async create({root,close}){
 root.innerHTML=`<div class="snake-shell"><header><div><span>DIAMOND ARCADE</span><strong>SNAKE</strong></div><button class="snake-close" aria-label="Fechar">×</button></header><div class="snake-score"><span>SCORE <b data-score>0</b></span><span>BEST <b data-best>0</b></span></div><canvas></canvas><div class="snake-controls"><button data-dir="up">▲</button><div><button data-dir="left">◀</button><button data-dir="down">▼</button><button data-dir="right">▶</button></div></div><p class="snake-hint">Deslize na tela ou use os controles</p></div>`;
 const canvas=root.querySelector("canvas"),ctx=canvas.getContext("2d"),scoreEl=root.querySelector("[data-score]"),bestEl=root.querySelector("[data-best]");
 const N=18;let snake,food,dir,nextDir,score,timer,alive=true,touch=null;
 const key="diamond-game:snake:best";let best=Number(localStorage.getItem(key))||0;bestEl.textContent=best;
 function resize(){const d=Math.min(innerWidth-32,520),dpr=Math.min(devicePixelRatio||1,2);canvas.style.width=d+"px";canvas.style.height=d+"px";canvas.width=d*dpr;canvas.height=d*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();}
 function spawn(){do{food={x:Math.floor(Math.random()*N),y:Math.floor(Math.random()*N)}}while(snake.some(p=>p.x===food.x&&p.y===food.y));}
 function reset(){snake=[{x:9,y:10},{x:8,y:10},{x:7,y:10}];dir=nextDir=DIRS.right;score=0;alive=true;scoreEl.textContent=0;spawn();draw();}
 function setDir(n){const d=DIRS[n];if(!d||d.x===-dir.x&&d.y===-dir.y)return;nextDir=d;}
 function step(){if(!alive)return;dir=nextDir;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(p=>p.x===h.x&&p.y===h.y)){alive=false;best=Math.max(best,score);localStorage.setItem(key,best);bestEl.textContent=best;draw(true);setTimeout(reset,1000);return;}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score+=10;scoreEl.textContent=score;spawn();}else snake.pop();draw();}
 function round(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
 function draw(over=false){const s=parseFloat(canvas.style.width)||320,c=s/N;ctx.clearRect(0,0,s,s);const g=ctx.createLinearGradient(0,0,s,s);g.addColorStop(0,"#090b18");g.addColorStop(1,"#151037");ctx.fillStyle=g;ctx.fillRect(0,0,s,s);ctx.strokeStyle="rgba(255,255,255,.035)";ctx.lineWidth=1;for(let i=1;i<N;i++){ctx.beginPath();ctx.moveTo(i*c,0);ctx.lineTo(i*c,s);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*c);ctx.lineTo(s,i*c);ctx.stroke();}
 ctx.shadowBlur=20;ctx.shadowColor="#ff3fd1";ctx.fillStyle="#ff3fd1";ctx.beginPath();ctx.arc((food.x+.5)*c,(food.y+.5)*c,c*.28,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 snake.forEach((p,i)=>{const t=i/Math.max(1,snake.length-1);ctx.fillStyle=i===0?"#fff":"hsl("+(165+t*70)+" 90% "+(62-t*18)+"%)";ctx.shadowBlur=i===0?18:8;ctx.shadowColor="#52ffd2";round(p.x*c+2,p.y*c+2,c-4,c-4,c*.28);});ctx.shadowBlur=0;
 if(over){ctx.fillStyle="rgba(0,0,0,.55)";ctx.fillRect(0,0,s,s);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font="700 28px Space Grotesk";ctx.fillText("GAME OVER",s/2,s/2);}}
 const kd=e=>{const m={ArrowUp:"up",w:"up",ArrowDown:"down",s:"down",ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right"};if(m[e.key]){e.preventDefault();setDir(m[e.key]);}};addEventListener("keydown",kd);
 root.querySelectorAll("[data-dir]").forEach(b=>b.onclick=()=>setDir(b.dataset.dir));root.querySelector(".snake-close").onclick=close;
 canvas.addEventListener("touchstart",e=>touch={x:e.touches[0].clientX,y:e.touches[0].clientY},{passive:true});canvas.addEventListener("touchend",e=>{if(!touch)return;const p=e.changedTouches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))>20)setDir(Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up");touch=null},{passive:true});
 resize();addEventListener("resize",resize);reset();
 return{start(){timer=setInterval(step,115)},destroy(){clearInterval(timer);removeEventListener("keydown",kd);removeEventListener("resize",resize);}};
}};
