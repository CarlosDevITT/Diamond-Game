import { TankControls } from "./tank-controls.js?v=20260920-32";
import { TankEngine } from "./tank-engine.js?v=20260920-32";
import { buildTankMatchPayload,resolveTankWinner } from "./tank-rules.js?v=20260920-32";

export const TankGameManifest={
 id:"tank",name:"Tank Battle 1v1",description:"Confronto direto de tanques em tempo real. Destrua o oponente ou cause mais danos antes do tempo acabar!",version:"1.0.0",mode:"multiplayer_1v1",
 rules:{duration_seconds:90,countdown_seconds:3,win_criteria:["kills","damage_dealt","survival_time_ms"],tiebreaker:"survival_time_ms"}
};

export const tankGame={
 id:TankGameManifest.id,name:TankGameManifest.name,description:TankGameManifest.description,
 rules:["Destrua o tanque adversário para marcar abates.","Em empate de abates, vence quem causou mais dano.","WASD + mouse no desktop; controles duplos no celular."],
 multiplayer:{enabled:true,durationMs:90000,countdownMs:3000,scoring:"kills",tieBreaker:"damage",resolveWinner:resolveTankWinner},
 create({root,close,options={}}){
  root.innerHTML=`<section class="tank-screen"><header class="module-header tank-header"><button type="button" data-close>←</button><div class="tank-score tank-score--a"><small>JOGADOR 1</small><strong data-score-a>0</strong></div><div class="tank-time"><small>TIME</small><strong data-clock>90</strong></div><div class="tank-score tank-score--b"><small>JOGADOR 2</small><strong data-score-b>0</strong></div></header><div class="tank-arena"><canvas></canvas><div class="tank-controls-layer"></div><div class="tank-countdown">SINCRONIZANDO…</div></div></section>`;
  const canvas=root.querySelector("canvas"),layer=root.querySelector(".tank-controls-layer"),countdown=root.querySelector(".tank-countdown"),clock=root.querySelector("[data-clock]"),scoreA=root.querySelector("[data-score-a]"),scoreB=root.querySelector("[data-score-b]");
  const casual=options.mode!=="1v1";const bus=options.eventBus,realtime=options.realtimeClient,matchContext={...(options.matchContext||options),casual};matchContext.slot=options.slot||matchContext.slot;
  const controls=new TankControls(canvas,layer);const engine=new TankEngine({canvas,controls,realtimeClient:realtime,eventBus:bus,matchContext});
  let timer=null,ended=false;const parsedStart=Date.parse(options.startedAt);let startAt=casual?Date.now()+1200:(Number.isFinite(parsedStart)?parsedStart:Date.now()+3000);if(startAt-Date.now()>7000)startAt=Date.now()+3000;let matchStart=startAt;
  const finish=async()=>{if(ended)return;ended=true;clearInterval(timer);engine.stop?.();const payload=buildTankMatchPayload(engine.local,matchStart||Date.now());if(!casual){bus?.emit?.("MATCH_SUBMIT_SCORE",payload);options.onResult?.({score:payload.score,survivalMs:payload.survival_time_ms,metrics:payload.metrics,reason:"time"});return;}const won=engine.local.kills>engine.remote.kills,title=won?"VITÓRIA!":engine.local.kills===engine.remote.kills?"EMPATE":"FIM DE TREINO";if(window.Swal){const result=await Swal.fire({title,text:`${engine.local.kills} × ${engine.remote.kills} • ${payload.metrics.damage_dealt} de dano`,icon:won?"success":"info",showCancelButton:true,confirmButtonText:"Jogar novamente",cancelButtonText:"Voltar aos jogos",background:"#11162c",color:"#fff",confirmButtonColor:"#5153e6"});if(result.isConfirmed){close();setTimeout(()=>options.replay?.(),0);}else close();}else close();};
  const begin=()=>{const left=startAt-Date.now();if(left>0){countdown.textContent=Math.max(1,Math.ceil(left/1000));setTimeout(begin,Math.min(250,left));return;}countdown.hidden=true;countdown.textContent=casual?"TREINO":"SINCRONIZANDO…";controls.start();engine.start();timer=setInterval(()=>{const remain=Math.max(0,90000-(Date.now()-matchStart));clock.textContent=Math.ceil(remain/1000);const localIsA=matchContext.slot!=="B";scoreA.textContent=localIsA?engine.local.kills:engine.remote.kills;scoreB.textContent=localIsA?engine.remote.kills:engine.local.kills;if(!remain)finish();},250);};
  root.querySelector("[data-close]").onclick=async()=>{if(casual){close();return;}const result=window.Swal?await Swal.fire({title:"Sair da partida?",text:"Se você sair, o outro jogador será avisado e a partida será encerrada para você.",icon:"warning",showCancelButton:true,confirmButtonText:"Sair da partida",cancelButtonText:"Continuar jogando",reverseButtons:true,background:"#11162c",color:"#fff",confirmButtonColor:"#e5484d"}):{isConfirmed:confirm("Deseja sair da partida?")};if(!result.isConfirmed)return;await options.onLeave?.();close();};begin();
  return{start(){},destroy(){ended=true;clearInterval(timer);controls.destroy();engine.destroy();}};
 }
};

export function init(containerElement,eventBus,realtimeClient,matchContext={}){return tankGame.create({root:containerElement,close:()=>{},options:{eventBus,realtimeClient,matchContext,...matchContext}})}
export { buildTankMatchPayload };
