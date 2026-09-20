export class TankControls{
 #canvas;#layer;#keys=new Set();#shoot=false;#turret=0;#clean=[];
 constructor(canvas,layer){this.#canvas=canvas;this.#layer=layer;}
 start(){
  const on=(t,e,f,o)=>{t.addEventListener(e,f,o);this.#clean.push(()=>t.removeEventListener(e,f,o))};
  on(window,"keydown",e=>{this.#keys.add(e.key);if(e.code==="Space"){e.preventDefault();this.#shoot=true}});
  on(window,"keyup",e=>this.#keys.delete(e.key));
  on(this.#canvas,"pointermove",e=>{if(e.pointerType==="touch")return;const r=this.#canvas.getBoundingClientRect();this.#turret=Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)});
  on(this.#canvas,"pointerdown",e=>{if(e.pointerType!=="touch"&&e.button===0)this.#shoot=true});
  this.#layer.innerHTML='<div class="tank-stick tank-stick--left" data-stick="move"><i></i></div><div class="tank-stick tank-stick--right" data-stick="aim"><i></i></div><button class="tank-fire" type="button">FIRE</button>';
  const bind=(el,type)=>{let id=null,cx=0,cy=0;const move=e=>{if(e.pointerId!==id)return;const dx=e.clientX-cx,dy=e.clientY-cy;if(type==="move"){this.touchMove=Math.max(-1,Math.min(1,-dy/45));this.touchTurn=Math.max(-1,Math.min(1,dx/45))}else this.#turret=Math.atan2(dy,dx);el.querySelector("i").style.transform=`translate(${Math.max(-30,Math.min(30,dx))}px,${Math.max(-30,Math.min(30,dy))}px)`};on(el,"pointerdown",e=>{id=e.pointerId;const r=el.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;el.setPointerCapture(id);move(e)});on(el,"pointermove",move);on(el,"pointerup",()=>{id=null;if(type==="move"){this.touchMove=0;this.touchTurn=0}el.querySelector("i").style.transform=""})};
  bind(this.#layer.querySelector('[data-stick="move"]'),"move");bind(this.#layer.querySelector('[data-stick="aim"]'),"aim");on(this.#layer.querySelector(".tank-fire"),"pointerdown",e=>{e.preventDefault();this.#shoot=true});
 }
 getInputs(){const k=this.#keys;const move=(k.has("w")||k.has("W")||k.has("ArrowUp")?1:0)-(k.has("s")||k.has("S")||k.has("ArrowDown")?1:0);const turn=(k.has("d")||k.has("D")||k.has("ArrowRight")?1:0)-(k.has("a")||k.has("A")||k.has("ArrowLeft")?1:0);const out={moveSpeed:this.touchMove??move,turnSpeed:this.touchTurn??turn,turretAngle:this.#turret,isShooting:this.#shoot};this.#shoot=false;return out}
 destroy(){this.#clean.splice(0).forEach(f=>f());this.#layer.replaceChildren();}
}