const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

export class TankViewport{
 #canvas;#ctx;#worldW;#worldH;#maxDpr;#observer=null;#onResize=null;
 view={width:0,height:0};
 camera={x:0,y:0};
 constructor({canvas,worldWidth=1800,worldHeight=1000,maxDpr=2}={}){
  this.#canvas=canvas;this.#ctx=canvas.getContext("2d");this.#worldW=worldWidth;this.#worldH=worldHeight;this.#maxDpr=maxDpr;
 }
 start(onResize){
  this.#onResize=onResize;
  const refresh=()=>this.resize();
  if("ResizeObserver" in globalThis){this.#observer=new ResizeObserver(refresh);this.#observer.observe(this.#canvas);}
  addEventListener("resize",refresh,{passive:true});
  this._windowResize=refresh;
  this.resize();
 }
 resize(){
  const r=this.#canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,this.#maxDpr),width=Math.max(1,r.width),height=Math.max(1,r.height||Math.min(width*.64,560));
  const pixelW=Math.round(width*d),pixelH=Math.round(height*d);
  if(this.#canvas.width!==pixelW||this.#canvas.height!==pixelH){this.#canvas.width=pixelW;this.#canvas.height=pixelH;}
  this.#ctx.setTransform(d,0,0,d,0,0);
  this.view.width=Math.min(this.#worldW,width);
  this.view.height=Math.min(this.#worldH,height);
  this.#onResize?.({width,height,dpr:d});
 }
 follow(target,dt){
  const tx=clamp(target.x-this.view.width/2,0,Math.max(0,this.#worldW-this.view.width));
  const ty=clamp(target.y-this.view.height/2,0,Math.max(0,this.#worldH-this.view.height));
  const smooth=1-Math.exp(-7*dt);
  this.camera.x+=(tx-this.camera.x)*smooth;this.camera.y+=(ty-this.camera.y)*smooth;
 }
 destroy(){
  this.#observer?.disconnect();this.#observer=null;
  if(this._windowResize)removeEventListener("resize",this._windowResize);
  this._windowResize=null;this.#onResize=null;
 }
}
