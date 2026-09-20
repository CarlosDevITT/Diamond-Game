const directions={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
export const snakeGame={
  id:"snake", name:"Snake", description:"O clássico Snake em uma versão rápida e responsiva.",
  rules:["Use setas ou WASD no desktop e deslize no celular.","Coma os pontos para crescer e aumentar o score.","Não bata nas bordas nem no próprio corpo."],
  create({root,close}){
    root.innerHTML=`<section class="snake-screen"><header class="module-header"><button type="button" data-close>←</button><div><small>DIAMOND ARCADE</small><strong>Snake</strong></div></header><div class="snake-hud"><span>SCORE <b data-score>0</b></span><span>BEST <b data-best>0</b></span></div><canvas></canvas><p>Deslize no tabuleiro ou use WASD / setas.</p></section>`;
    const canvas=root.querySelector("canvas"),ctx=canvas.getContext("2d"),scoreNode=root.querySelector("[data-score]"),bestNode=root.querySelector("[data-best]");
    const cells=18,key="diamond:snake:best"; let body,food,dir,next,score,best=Number(localStorage.getItem(key))||0,timer=null,touch=null,destroyed=false;
    bestNode.textContent=best;
    const size=()=>Math.min(window.innerWidth-32,520);
    const spawn=()=>{do food={x:Math.floor(Math.random()*cells),y:Math.floor(Math.random()*cells)};while(body.some(p=>p.x===food.x&&p.y===food.y));};
    const reset=()=>{body=[{x:9,y:9},{x:8,y:9},{x:7,y:9}];dir=next=directions.right;score=0;scoreNode.textContent=0;spawn();draw();};
    const turn=name=>{const d=directions[name];if(d&&!(d.x===-dir.x&&d.y===-dir.y))next=d;};
    const resize=()=>{const d=size(),ratio=Math.min(devicePixelRatio||1,2);canvas.style.width=d+"px";canvas.style.height=d+"px";canvas.width=d*ratio;canvas.height=d*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);draw();};
    const draw=()=>{if(!body||!food)return;const s=size(),c=s/cells;ctx.clearRect(0,0,s,s);ctx.fillStyle="#090b18";ctx.fillRect(0,0,s,s);ctx.strokeStyle="rgba(255,255,255,.045)";for(let i=1;i<cells;i++){ctx.beginPath();ctx.moveTo(i*c,0);ctx.lineTo(i*c,s);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*c);ctx.lineTo(s,i*c);ctx.stroke()}ctx.fillStyle="#ff49c7";ctx.beginPath();ctx.arc((food.x+.5)*c,(food.y+.5)*c,c*.28,0,Math.PI*2);ctx.fill();body.forEach((p,i)=>{ctx.fillStyle=i?"#52ffd2":"#fff";ctx.beginPath();ctx.roundRect(p.x*c+2,p.y*c+2,c-4,c-4,c*.25);ctx.fill()})};
    const tick=()=>{const h={x:body[0].x+next.x,y:body[0].y+next.y};dir=next;if(h.x<0||h.y<0||h.x>=cells||h.y>=cells||body.some(p=>p.x===h.x&&p.y===h.y)){best=Math.max(best,score);localStorage.setItem(key,best);bestNode.textContent=best;reset();return}body.unshift(h);if(h.x===food.x&&h.y===food.y){score+=10;scoreNode.textContent=score;spawn()}else body.pop();draw()};
    const keydown=e=>{const map={ArrowUp:"up",w:"up",W:"up",ArrowDown:"down",s:"down",S:"down",ArrowLeft:"left",a:"left",A:"left",ArrowRight:"right",d:"right",D:"right"};if(map[e.key]){e.preventDefault();turn(map[e.key])}};
    canvas.addEventListener("touchstart",e=>touch={x:e.touches[0].clientX,y:e.touches[0].clientY},{passive:true});
    canvas.addEventListener("touchend",e=>{if(!touch)return;const p=e.changedTouches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))>18)turn(Math.abs(dx)>Math.abs(dy)?dx>0?"right":"left":dy>0?"down":"up");touch=null},{passive:true});
    root.querySelector("[data-close]").addEventListener("click",close);window.addEventListener("keydown",keydown);window.addEventListener("resize",resize);reset();resize();
    return {start(){if(!timer)timer=setInterval(tick,115)},destroy(){destroyed=true;clearInterval(timer);timer=null;window.removeEventListener("keydown",keydown);window.removeEventListener("resize",resize)}};
  }
};
