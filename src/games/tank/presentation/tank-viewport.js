export class TankViewport{
 #canvas;#ctx;#worldW;#worldH;#maxDpr;#observer=null;#onResize=null;#windowResize=null;
 view={width:0,height:0};camera={x:0,y:0};
 constructor({canvas,worldWidth=1800,worldHeight=1000,maxDpr=2}={}){this.#canvas=canvas;this.#ctx=canvas.getContext("2d");this.#worldW=worldWidth;this.#worldH=worldHeight;this.#maxDpr=maxDpr;this.view.width=worldWidth;this.view.height=worldHeight;}
 start(onResize){this.#onResize=onResize;const refresh=()=>this.resize();if("ResizeObserver" in globalThis){this.#observer=new ResizeObserver(refresh);this.#observer.observe(this.#canvas.parentElement||this.#canvas);}addEventListener("resize",refresh,{passive:true});this.#windowResize=refresh;this.resize();}
 resize(){const r=this.#canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,this.#maxDpr),width=Math.max(1,r.width),height=Math.max(1,r.height||Math.min(width*.64,560)),pixelW=Math.round(width*d),pixelH=Math.round(height*d);if(this.#canvas.width!==pixelW||this.#canvas.height!==pixelH){this.#canvas.width=pixelW;this.#canvas.height=pixelH;}this.#ctx.setTransform(d,0,0,d,0,0);this.#onResize?.({width,height,dpr:d});}
 follow(){this.camera.x=0;this.camera.y=0;}
 destroy(){this.#observer?.disconnect();this.#observer=null;if(this.#windowResize)removeEventListener("resize",this.#windowResize);this.#windowResize=null;this.#onResize=null;}
}
