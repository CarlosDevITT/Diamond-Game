export class FullscreenController{
 #target;#button;#clean=[];#mobile=false;#locked=false;
 constructor({target,button}){this.#target=target;this.#button=button;}
 start(){
  if(!this.#target||!this.#button)return;
  this.#mobile=matchMedia("(max-width: 899px), (pointer: coarse)").matches;
  const sync=()=>{const active=document.fullscreenElement===this.#target;this.#target.classList.toggle("is-mobile-fullscreen",active&&this.#mobile);this.#button.textContent="⛶";this.#button.title=active?"Sair da tela cheia":this.#mobile?"Tela cheia horizontal":"Tela cheia";this.#button.setAttribute("aria-label",this.#button.title);if(!active)this.#unlockOrientation();};
  const toggle=async()=>{try{if(document.fullscreenElement===this.#target){await document.exitFullscreen();return;}if(document.fullscreenElement)return;await this.#target.requestFullscreen();if(this.#mobile)await this.#lockLandscape();}catch(error){console.warn("[TankFullscreen] unavailable",error);}finally{sync();}};
  this.#button.addEventListener("click",toggle);document.addEventListener("fullscreenchange",sync);this.#clean.push(()=>this.#button.removeEventListener("click",toggle),()=>document.removeEventListener("fullscreenchange",sync));sync();
 }
 async #lockLandscape(){try{if(screen.orientation?.lock){await screen.orientation.lock("landscape");this.#locked=true;}}catch(error){console.info("[TankFullscreen] landscape lock unavailable",error);}}
 #unlockOrientation(){if(!this.#locked)return;try{screen.orientation?.unlock?.();}catch{}this.#locked=false;}
 async exit(){try{if(document.fullscreenElement===this.#target)await document.exitFullscreen();}catch{}this.#unlockOrientation();}
 destroy(){this.#clean.splice(0).forEach(fn=>fn());this.#target?.classList.remove("is-mobile-fullscreen");this.#unlockOrientation();}
}
