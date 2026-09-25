export class FullscreenController{
 #target;#button;#clean=[];
 constructor({target,button}){this.#target=target;this.#button=button;}
 start(){
  if(!this.#target||!this.#button)return;
  const sync=()=>{const active=document.fullscreenElement===this.#target;this.#button.textContent="⛶";this.#button.title=active?"Sair da tela cheia":"Tela cheia";this.#button.setAttribute("aria-label",this.#button.title);};
  const toggle=async()=>{try{if(document.fullscreenElement===this.#target)await document.exitFullscreen();else if(!document.fullscreenElement)await this.#target.requestFullscreen();}catch(error){console.warn("[TankFullscreen] unavailable",error);}};
  this.#button.addEventListener("click",toggle);document.addEventListener("fullscreenchange",sync);
  this.#clean.push(()=>this.#button.removeEventListener("click",toggle),()=>document.removeEventListener("fullscreenchange",sync));sync();
 }
 destroy(){this.#clean.splice(0).forEach(fn=>fn());}
}
