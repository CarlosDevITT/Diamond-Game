import { TankControls } from "./tank-controls.js";
import { TankEngine } from "./tank-engine.js";
import { buildTankMatchPayload,resolveTankWinner } from "./tank-rules.js";

export const TankGameManifest={
 id:"tank",name:"Tank Battle 1v1",description:"Confronto direto de tanques em tempo real. Destrua o oponente ou cause mais danos antes do tempo acabar!",version:"1.0.0",mode:"multiplayer_1v1",
 rules:{duration_seconds:90,countdown_seconds:3,win_criteria:["kills","damage_dealt","survival_time_ms"],tiebreaker:"survival_time_ms"}
};

export const tankGame={
 id:TankGameManifest.id,name:TankGameManifest.name,description:TankGameManifest.description,
 rules:["Destrua o tanque adversário para marcar abates.","Em empate de abates, vence quem causou mais dano.","WASD + mouse no desktop; controles duplos no celular."],
 multiplayer:{enabled:true,durationMs:90000,countdownMs:3000,scoring:"kills",tieBreaker:"damage",resolveWinner:resolveTankWinner},
 create({root,close,options={}}){
  root.innerHTML=`<section class="tank-screen"><header class="module-header"><button type="button" data-close>←</button><div><small>DIAMOND 1V1</small><strong>Tank Battle</strong></div><span data-clock>90</span></header><div class="tank-arena"><canvas></canvas><div class="tank-controls-layer"></div><div class="tank-countdown">SINCRONIZANDO…</div></div></section>`;
  const canvas=root.querySelector("canvas"),layer=root.querySelector(".tank-controls-layer"),countdown=root.querySelector(".tank-countdown"),clock=root.querySelector("[data-clock]");
  const bus=options.eventBus,realtime=options.realtimeClient,matchContext=options.matchContext||options;
  const controls=new TankControls(canvas,layer);const engine=new TankEngine({canvas,controls,realtimeClient:realtime,eventBus:bus,matchContext});
  let timer=null,ended=false,startAt=Date.parse(options.startedAt)||Date.now()+3000,matchStart=0;
  const finish=()=>{if(ended)return;ended=true;clearInterval(timer);const payload=buildTankMatchPayload(engine.local,matchStart||Date.now());bus?.emit?.("MATCH_SUBMIT_SCORE",payload);options.onResult?.({score:payload.score,survivalMs:payload.survival_time_ms,metrics:payload.metrics,reason:"time"});};
  const begin=()=>{const left=startAt-Date.now();if(left>0){countdown.textContent=Math.max(1,Math.ceil(left/1000));setTimeout(begin,Math.min(250,left));return;}countdown.hidden=true;matchStart=Date.now();controls.start();engine.start();timer=setInterval(()=>{const remain=Math.max(0,90000-(Date.now()-matchStart));clock.textContent=Math.ceil(remain/1000);if(!remain)finish();},250);};
  root.querySelector("[data-close]").onclick=close;begin();
  return{start(){},destroy(){ended=true;clearInterval(timer);controls.destroy();engine.destroy();}};
 }
};

export function init(containerElement,eventBus,realtimeClient,matchContext={}){return tankGame.create({root:containerElement,close:()=>{},options:{eventBus,realtimeClient,matchContext,...matchContext}})}
export { buildTankMatchPayload };
