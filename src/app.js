import { GameRegistry } from "./core/game-registry.js";
import { GamesPanel } from "./modules/games-panel/index.js";
import { snakeGame } from "./games/snake/index.js";
import { EventBus } from "./core/event-bus.js";

const events=new EventBus(), registry=new GameRegistry();
registry.register(snakeGame);

const stage=document.createElement("div");
stage.id="game-stage";stage.className="game-stage";stage.hidden=true;document.body.append(stage);

let match=null,auth=null,authScreen=null,lobby=null,pendingGame=null;
const loadOnline=async()=>{
 if(auth&&match&&authScreen&&lobby)return;
 const [{MatchClient},{auth:authService},{AuthScreen},{MatchLobby}]=await Promise.all([
  import("./core/match-client.js?v=20260920-8"),import("./services/auth.js?v=20260920-8"),import("./modules/auth-screen/index.js?v=20260920-8"),import("./modules/match-lobby/index.js?v=20260920-8")
 ]);
 auth=authService;match=new MatchClient({events});
 authScreen=new AuthScreen({auth,onReady:user=>{events.emit("auth:ready",{user});if(pendingGame){const game=pendingGame;pendingGame=null;lobby.show(game);}},onClose:()=>{pendingGame=null;panel.show();}});
 lobby=new MatchLobby({match,onStart:startGame});
 events.on("match:update",room=>lobby?.refresh(room));
};
const startGame=async(id,options={})=>{
 panel.hide();lobby?.hide();
 events.emit("game:open",{id,...options});
 await registry.open(id,stage,()=>{
  events.emit("game:close",{id,...options});
  options.mode==="1v1"&&lobby?lobby.show(registry.list().find(g=>g.id===id)):panel.show();
 });
};
const panel=new GamesPanel({games:registry.list(),onPlay:async(id,options={})=>{
 if(options.mode==="1v1"){
  try{
   await loadOnline();
   const user=await auth.current();
   if(!user){pendingGame=registry.list().find(g=>g.id===id);panel.hide();authScreen.show();return;}
   panel.hide();lobby.show(registry.list().find(g=>g.id===id));
  }catch(e){console.error("Diamond online unavailable",e);alert(`Falha ao abrir 1v1: ${e?.message || e}`);}
  return;
 }
 startGame(id,options);
}});

document.getElementById("open-games")?.addEventListener("click",()=>panel.show());

const menu=document.getElementById("nav-menu"),toggle=document.getElementById("nav-toggle"),close=document.getElementById("nav-close");
const setMenu=open=>{menu?.classList.toggle("is-open",open);toggle?.setAttribute("aria-expanded",String(open));};
toggle?.addEventListener("click",()=>setMenu(true));close?.addEventListener("click",()=>setMenu(false));
menu?.querySelectorAll(".nav__link").forEach(link=>link.addEventListener("click",()=>setMenu(false)));

const mascot=document.querySelector(".home__img img");let dragging=false,lastX=0,rotation=0;
mascot?.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;mascot.setPointerCapture?.(e.pointerId)});
mascot?.addEventListener("pointermove",e=>{if(!dragging)return;rotation+=(e.clientX-lastX)*1.5;lastX=e.clientX;mascot.style.transform=`rotateY(${rotation}deg)`;});
["pointerup","pointercancel"].forEach(type=>mascot?.addEventListener(type,()=>dragging=false));
