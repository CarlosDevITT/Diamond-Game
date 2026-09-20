import { ScoreStore } from "../../core/score-store.js";
import { createCompetitiveConfig, resolveCompetitiveResult } from "../../core/match-contract.js";

const DIR={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const KEY={ArrowUp:"up",w:"up",W:"up",ArrowDown:"down",s:"down",S:"down",ArrowLeft:"left",a:"left",A:"left",ArrowRight:"right",d:"right",D:"right"};

export const snakeGame={
 id:"snake",name:"Snake",description:"O clássico Snake em uma versão rápida e responsiva.",
 rules:["Setas/WASD no desktop, swipe ou direcional no celular.","Coma os pontos, suba de nível e aumente sua sequência.","Não bata nas bordas nem no próprio corpo."],
 multiplayer:createCompetitiveConfig({durationMs:90000,countdownMs:3000,scoring:"highest-score",tieBreaker:"survival-time",resolveWinner:resolveCompetitiveResult}),
 create({root,close}){
  root.innerHTML=`<section class="snake-screen">
   <header class="module-header"><button type="button" data-close aria-label="Voltar">←</button><div><small>DIAMOND ARCADE</small><strong>Snake</strong></div><button class="snake-pause" type="button" data-pause aria-label="Pausar">Ⅱ</button></header>
   <div class="snake-hud"><span>SCORE <b data-score>0</b></span><span>BEST <b data-best>0</b></span><span>LEVEL <b data-level>1</b></span></div>
   <div class="snake-board"><canvas></canvas><div class="snake-overlay" data-overlay><strong>PRONTO?</strong><span>Toque em jogar</span><button type="button" data-start>JOGAR</button></div></div>
   <div class="snake-dpad"><button data-dir="up" aria-label="Cima">▲</button><div><button data-dir="left" aria-label="Esquerda">◀</button><button data-dir="down" aria-label="Baixo">▼</button><button data-dir="right" aria-label="Direita">▶</button></div></div>
   <p class="snake-help">Deslize no tabuleiro ou use o direcional.</p>
  </section>`;
  const canvas=root.querySelector("canvas"),ctx=canvas.getContext("2d");
  const scoreEl=root.querySelector("[data-score]"),bestEl=root.querySelector("[data-best]"),levelEl=root.querySelector("[data-level]");
  const overlay=root.querySelector("[data-overlay]"),overlayTitle=overlay.querySelector("strong"),overlayText=overlay.querySelector("span"),startBtn=root.querySelector("[data-start]"),pauseBtn=root.querySelector("[data-pause]");
  const cells=18,scores=new ScoreStore(); let body=[],food,dir=DIR.right,queued=[],score=0,level=1,best=scores.getBest("snake"),timer=null,touch=null,state="ready",lastSize=320;
  bestEl.textContent=best;

  const speed=()=>Math.max(58,128-(level-1)*9);
  const spawn=()=>{do food={x:Math.floor(Math.random()*cells),y:Math.floor(Math.random()*cells)};while(body.some(p=>p.x===food.x&&p.y===food.y));};
  const reset=()=>{clearTimeout(timer);body=[{x:9,y:9},{x:8,y:9},{x:7,y:9}];dir=DIR.right;queued=[];score=0;level=1;scoreEl.textContent=0;levelEl.textContent=1;spawn();draw();};
  const schedule=()=>{clearTimeout(timer);if(state==="playing")timer=setTimeout(tick,speed());};
  const turn=name=>{const d=DIR[name],base=queued.length?queued[queued.length-1]:dir;if(!d||queued.length>=2||(d.x===-base.x&&d.y===-base.y))return;queued.push(d);};
  const showOverlay=(title,text,button="JOGAR")=>{overlayTitle.textContent=title;overlayText.textContent=text;startBtn.textContent=button;overlay.hidden=false;};
  const play=()=>{if(state==="gameover")reset();state="playing";overlay.hidden=true;pauseBtn.textContent="Ⅱ";schedule();};
  const pause=()=>{if(state==="playing"){state="paused";clearTimeout(timer);pauseBtn.textContent="▶";showOverlay("PAUSADO","Continue quando estiver pronto.","CONTINUAR")}else if(state==="paused")play();};

  function resize(){lastSize=Math.min(window.innerWidth-32,520);const r=Math.min(devicePixelRatio||1,2);canvas.style.width=lastSize+"px";canvas.style.height=lastSize+"px";canvas.width=Math.round(lastSize*r);canvas.height=Math.round(lastSize*r);ctx.setTransform(r,0,0,r,0,0);draw();}
  function round(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function draw(){
   if(!body.length||!food)return;const s=lastSize,c=s/cells;ctx.clearRect(0,0,s,s);
   const bg=ctx.createLinearGradient(0,0,s,s);bg.addColorStop(0,"#080b17");bg.addColorStop(1,"#121735");ctx.fillStyle=bg;ctx.fillRect(0,0,s,s);
   ctx.strokeStyle="rgba(255,255,255,.035)";for(let i=1;i<cells;i++){ctx.beginPath();ctx.moveTo(i*c,0);ctx.lineTo(i*c,s);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*c);ctx.lineTo(s,i*c);ctx.stroke();}
   ctx.shadowBlur=18;ctx.shadowColor="#ff49c7";ctx.fillStyle="#ff49c7";ctx.beginPath();ctx.arc((food.x+.5)*c,(food.y+.5)*c,c*.27,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
   body.forEach((p,i)=>{ctx.fillStyle=i===0?"#fff":"#52ffd2";ctx.shadowBlur=i===0?15:6;ctx.shadowColor="#52ffd2";round(p.x*c+2,p.y*c+2,c-4,c-4,c*.25)});ctx.shadowBlur=0;
  }
  function tick(){
   if(state!=="playing")return;if(queued.length)dir=queued.shift();
   const h={x:body[0].x+dir.x,y:body[0].y+dir.y};
   if(h.x<0||h.y<0||h.x>=cells||h.y>=cells||body.some(p=>p.x===h.x&&p.y===h.y)){
    state="gameover";clearTimeout(timer);best=scores.saveBest("snake",score);bestEl.textContent=best;showOverlay("GAME OVER",`Score ${score} • Recorde ${best}`,"JOGAR NOVAMENTE");return;
   }
   body.unshift(h);
   if(h.x===food.x&&h.y===food.y){score+=10;const nextLevel=1+Math.floor(score/50);if(nextLevel!==level){level=nextLevel;levelEl.textContent=level;}scoreEl.textContent=score;spawn();if(navigator.vibrate)navigator.vibrate(18);}else body.pop();
   draw();schedule();
  }
  const keydown=e=>{if(KEY[e.key]){e.preventDefault();if(state==="ready")play();turn(KEY[e.key]);}else if(e.key===" "){e.preventDefault();state==="ready"||state==="gameover"?play():pause();}};
  canvas.addEventListener("pointerdown",e=>{touch={x:e.clientX,y:e.clientY};});
  canvas.addEventListener("pointerup",e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))>16){if(state==="ready")play();turn(Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up");}touch=null;});
  root.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("pointerdown",e=>{e.preventDefault();if(state==="ready")play();turn(b.dataset.dir);}));
  startBtn.addEventListener("click",play);pauseBtn.addEventListener("click",pause);root.querySelector("[data-close]").addEventListener("click",close);window.addEventListener("keydown",keydown);window.addEventListener("resize",resize);
  reset();resize();showOverlay("PRONTO?","Swipe, direcional ou teclado.","JOGAR");
  return{start(){},destroy(){state="destroyed";clearTimeout(timer);window.removeEventListener("keydown",keydown);window.removeEventListener("resize",resize);}};
 }
};
