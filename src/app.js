import { GameRegistry } from "./core/game-registry.js";
import { GamesPanel } from "./modules/games-panel/index.js?v=20260920-39";
import { snakeGame } from "./games/snake/index.js?v=20260920-32";
import { tankGame } from "./games/tank/index.js?v=20260920-32";
import { EventBus } from "./core/event-bus.js";

const events=new EventBus(), registry=new GameRegistry();
registry.register(snakeGame);
registry.register(tankGame);

const stage=document.createElement("div");
stage.id="game-stage";stage.className="game-stage";stage.hidden=true;document.body.append(stage);

let match=null,auth=null,authScreen=null,lobby=null,profilePanel=null,pendingGame=null,activeMatchId=null;
const loadOnline=async()=>{
 if(auth&&match&&authScreen&&lobby)return;
 const [{MatchClient},{auth:authService},{AuthScreen},{MatchLobby}]=await Promise.all([
  import("./core/match-client.js?v=20260920-32"),import("./services/auth.js?v=20260920-36"),import("./modules/auth-screen/index.js?v=20260920-32"),import("./modules/match-lobby/index.js?v=20260920-39")
 ]);
 auth=authService;match=new MatchClient({events});
 events.on("match:opponent-disconnected",()=>{if(!activeMatchId||!window.Swal)return;Swal.fire({title:"Conexão do oponente perdida",text:"Aguardando reconexão por até 8 segundos…",icon:"warning",showConfirmButton:false,allowOutsideClick:false,allowEscapeKey:false,timer:8000,timerProgressBar:true,background:"#11162c",color:"#fff"});});
 events.on("match:opponent-reconnected",()=>{if(!activeMatchId||!window.Swal)return;Swal.close();Swal.fire({title:"Oponente reconectado",text:"A partida pode continuar.",icon:"success",timer:1400,showConfirmButton:false,background:"#11162c",color:"#fff"});});
 events.on("match:opponent-left",async({reason}={})=>{if(!activeMatchId)return;activeMatchId=null;try{await match?.awardOpponentForfeit?.(reason==="disconnect"?"abandonment":"forfeit")}catch(e){console.warn("Opponent settlement failed",e?.message||e)}if(window.Swal)Swal.close();await registry.close(stage);if(window.Swal)await Swal.fire({title:"Oponente saiu da partida",text:reason==="disconnect"?"O outro jogador perdeu a conexão. A partida foi interrompida.":"O outro jogador saiu da partida. A partida foi interrompida.",icon:"info",confirmButtonText:"Voltar aos jogos",background:"#11162c",color:"#fff",confirmButtonColor:"#5153e6"});match.leave();panel.show();});
 authScreen=new AuthScreen({auth,onReady:async user=>{events.emit("auth:ready",{user});const profile=await auth.profile(user.$id);panel.setProfile(profile||user);if(pendingGame){const game=pendingGame;pendingGame=null;lobby.show(game);}else panel.show();},onClose:()=>{pendingGame=null;panel.show();}});
 lobby=new MatchLobby({match,onStart:startGame,onExit:()=>panel.show()});
 events.on("match:update",async room=>{lobby?.refresh(room);if(room?.players?.length===2)await match.watchCurrentMatch();});
 events.on("match:state",async row=>{if(row?.status==="countdown"&&activeMatchId!==row.$id){activeMatchId=row.$id;const game=registry.list().find(g=>g.id===row.game_id);if(game)startGame(game.id,{mode:"1v1",roomCode:match.room?.code,matchId:row.$id,seed:row.seed,startedAt:row.started_at});return;}if(row?.status==="finished"&&activeMatchId===row.$id){const user=await auth.current();const mine=user?.$id;const title=!row.winner_user_id?"EMPATE":row.winner_user_id===mine?"VITÓRIA!":"DERROTA";const detail=`${row.score_a} × ${row.score_b} • ${row.result_reason==="survival"?"desempate por sobrevivência":row.result_reason==="score"?"maior pontuação":row.result_reason==="damage"?"desempate por dano":row.result_reason==="forfeit"?"desistência":row.result_reason==="abandonment"?"abandono por desconexão":"empate total"}`;events.emit("game:match-finished",{title,detail,row});showMatchResult(title,detail);}});
};
const showMatchResult=(title,detail)=>{let node=document.getElementById("match-result");if(!node){node=document.createElement("section");node.id="match-result";node.style.cssText="position:fixed;inset:0;z-index:9999;background:rgba(5,7,18,.94);display:grid;place-items:center;padding:24px";document.body.append(node);}const roomGameId=match?.room?.gameId||match?.room?.game_id||null;node.dataset.gameId=roomGameId||"";node.innerHTML=`<div style="width:min(420px,100%);padding:32px;border-radius:24px;background:#11162c;text-align:center;color:white"><small>DIAMOND 1V1</small><h1 style="font-size:42px;margin:12px 0">${title}</h1><p>${detail}</p><button data-result-close style="margin-top:22px;padding:14px 24px;border:0;border-radius:14px;font-weight:800">VOLTAR AO LOBBY</button></div>`;node.hidden=false;node.querySelector("[data-result-close]").onclick=async e=>{const btn=e.currentTarget;btn.disabled=true;const gameId=node.dataset.gameId||match?.room?.gameId||match?.room?.game_id;activeMatchId=null;try{await registry.close(stage);}catch(err){console.warn("Game close failed",err)}try{match?.leave?.();}catch(err){console.warn("Match cleanup failed",err)}node.hidden=true;if(lobby&&gameId){const game=registry.list().find(g=>g.id===gameId);if(game){lobby.show(game);return;}}panel.show();};};
const startGame=async(id,options={})=>{
 panel.hide();lobby?.hide();
 events.emit("game:open",{id,...options});
 await registry.open(id,stage,()=>{
  events.emit("game:close",{id,...options});
  options.mode==="1v1"&&lobby?lobby.show(registry.list().find(g=>g.id===id)):panel.show();
 },{...options,eventBus:events,realtimeClient:match?.realtimeAdapter?.(options.matchId),matchContext:{matchId:options.matchId,seed:options.seed,startedAt:options.startedAt,playerId:match?.userId,slot:match?.room?.players?.find(p=>p.userId===match?.userId)?.slot},slot:match?.room?.players?.find(p=>p.userId===match?.userId)?.slot,onLeave:async()=>{if(options.mode==="1v1"){activeMatchId=null;await match?.leaveRoom?.({forfeit:true});}},onResult:async result=>{if(options.mode!=="1v1"||!options.matchId)return;try{await match.submitResult({matchId:options.matchId,...result});}catch(e){console.error("Falha ao enviar resultado 1v1",e);}}});
};
const panel=new GamesPanel({games:registry.list(),onProfile:async()=>{try{await loadOnline();if(!profilePanel){const {ProfilePanel}=await import("./modules/profile-panel/index.js?v=20260920-39");profilePanel=new ProfilePanel({auth,onClose:async action=>{panel.show();if(action?.login){const user=await auth.current();if(!user){panel.hide();authScreen.show();}}}});}panel.hide();await profilePanel.show();}catch(e){console.error("Profile unavailable",e);}},onPlay:async(id,options={})=>{
 if(options.mode==="1v1"){
  try{
   await loadOnline();
   const user=await auth.current();
   if(!user){pendingGame=registry.list().find(g=>g.id===id);panel.hide();authScreen.show();return;}
   panel.hide();lobby.show(registry.list().find(g=>g.id===id));
  }catch(e){console.error("Diamond online unavailable",e);window.Swal?Swal.fire({title:"Falha ao abrir 1v1",text:e?.message||String(e),icon:"error",background:"#11162c",color:"#fff",confirmButtonColor:"#5153e6"}):alert(`Falha ao abrir 1v1: ${e?.message || e}`);}
  return;
 }
 startGame(id,options);
}});

document.getElementById("open-games")?.addEventListener("click",async()=>{panel.show();try{await loadOnline();const user=await auth.current();const profile=user?await auth.profile(user.$id):null;panel.setProfile(profile||user);}catch{panel.setProfile(null)}});

const menu=document.getElementById("nav-menu"),toggle=document.getElementById("nav-toggle"),close=document.getElementById("nav-close");
const setMenu=open=>{menu?.classList.toggle("is-open",open);toggle?.setAttribute("aria-expanded",String(open));};
toggle?.addEventListener("click",()=>setMenu(true));close?.addEventListener("click",()=>setMenu(false));
menu?.querySelectorAll(".nav__link").forEach(link=>link.addEventListener("click",()=>setMenu(false)));

const mascot=document.querySelector(".home__img img");let dragging=false,lastX=0,rotation=0;
mascot?.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;mascot.setPointerCapture?.(e.pointerId)});
mascot?.addEventListener("pointermove",e=>{if(!dragging)return;rotation+=(e.clientX-lastX)*1.5;lastX=e.clientX;mascot.style.transform=`rotateY(${rotation}deg)`;});
["pointerup","pointercancel"].forEach(type=>mascot?.addEventListener(type,()=>dragging=false));

window.addEventListener("pagehide",()=>{if(activeMatchId)match?.leaveRoom?.({forfeit:true}).catch(()=>{});});

window.addEventListener("diamond:auth-changed",async()=>{try{if(!auth)return panel.setProfile(null);const user=await auth.current();const profile=user?await auth.profile(user.$id):null;panel.setProfile(profile||user);}catch{panel.setProfile(null)}});
