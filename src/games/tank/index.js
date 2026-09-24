import { TankControls } from "./tank-controls.js?v=20260924-1";
import { TankEngine } from "./tank-engine.js?v=20260920-48";
import { AuthoritativeTankEngine } from "./tank-authoritative-engine.js?v=20260924-1";
import { GameServerClient } from "../../services/game-server.js?v=20260924-1";
import { buildTankMatchPayload,resolveTankWinner } from "./tank-rules.js?v=20260920-32";

export const TankGameManifest={id:"tank",name:"Tank Battle 1v1",description:"Confronto direto de tanques em tempo real.",version:"2.0.0",mode:"multiplayer_1v1",rules:{duration_seconds:90,countdown_seconds:3,win_criteria:["kills"],authority:"server"}};

export const tankGame={
 id:"tank",name:"Tank Battle 1v1",description:"Confronto direto de tanques em tempo real. O servidor é a autoridade da partida.",
 rules:["Destrua o tanque adversário para marcar abates.","No 1v1, movimento, tiros, dano e resultado são validados pelo servidor.","WASD + mouse no desktop; controles duplos no celular."],
 multiplayer:{enabled:true,durationMs:90000,countdownMs:3000,scoring:"kills",resolveWinner:resolveTankWinner},
 async create({root,close,options={}}){
  root.innerHTML=`<section class="tank-screen"><header class="module-header tank-header"><button type="button" data-close>←</button><div class="tank-score tank-score--a"><small>JOGADOR 1</small><strong data-score-a>0</strong></div><div class="tank-time"><small>TIME</small><strong data-clock>90</strong></div><div class="tank-score tank-score--b"><small data-opponent-label>JOGADOR 2</small><strong data-score-b>0</strong></div></header><div class="tank-arena"><canvas></canvas><div class="tank-controls-layer"></div><div class="tank-countdown">CONECTANDO…</div></div></section>`;
  const canvas=root.querySelector("canvas"),layer=root.querySelector(".tank-controls-layer"),countdown=root.querySelector(".tank-countdown"),clock=root.querySelector("[data-clock]"),scoreA=root.querySelector("[data-score-a]"),scoreB=root.querySelector("[data-score-b]"),opponentLabel=root.querySelector("[data-opponent-label]");
  const casual=options.mode!=="1v1",difficulty=["basic","hard","pro"].includes(options.difficulty)?options.difficulty:"basic",difficultyLabel={basic:"BÁSICO",hard:"HARD",pro:"PRO"}[difficulty],ctx={...(options.matchContext||options),casual,difficulty};ctx.slot=options.slot||ctx.slot;if(casual)opponentLabel.textContent=`MÁQUINA • ${difficultyLabel}`;
  const controls=new TankControls(canvas,layer);let engine,network=null,timer=null,ended=false,startedAt=null;
  if(casual)engine=new TankEngine({canvas,controls,realtimeClient:null,eventBus:options.eventBus,matchContext:ctx});
  else{network=new GameServerClient({roomId:options.roomId||ctx.roomId,playerId:ctx.playerId});await network.connect();engine=new AuthoritativeTankEngine({canvas,controls,network,playerId:ctx.playerId});}
  const updateHud=()=>{const localIsA=ctx.slot!=="B";scoreA.textContent=localIsA?engine.local.kills:engine.remote.kills;scoreB.textContent=localIsA?engine.remote.kills:engine.local.kills;if(startedAt)clock.textContent=Math.max(0,Math.ceil((90000-(Date.now()-startedAt))/1000));};
  const showResult=async payload=>{if(ended)return;ended=true;clearInterval(timer);engine.stop?.();const mine=ctx.playerId,title=!payload.winnerPlayerId?"EMPATE":payload.winnerPlayerId===mine?"VITÓRIA!":"DERROTA";if(window.Swal)await Swal.fire({title,text:`${engine.local.kills} × ${engine.remote.kills} • resultado validado pelo servidor`,icon:title==="VITÓRIA!"?"success":"info",confirmButtonText:"Voltar aos jogos",background:"#11162c",color:"#fff",confirmButtonColor:"#5153e6"});close();};
  if(casual){const startAt=Date.now()+1200;const begin=()=>{const left=startAt-Date.now();if(left>0){countdown.textContent=Math.max(1,Math.ceil(left/1000));setTimeout(begin,Math.min(250,left));return;}countdown.hidden=true;controls.start();engine.start();startedAt=Date.now();timer=setInterval(async()=>{updateHud();if(Date.now()-startedAt>=90000){ended=true;clearInterval(timer);engine.stop();const payload=buildTankMatchPayload(engine.local,startedAt),won=engine.local.kills>engine.remote.kills;if(window.Swal){const r=await Swal.fire({title:won?"VITÓRIA!":engine.local.kills===engine.remote.kills?"EMPATE":"FIM DE TREINO",text:`${engine.local.kills} × ${engine.remote.kills} • IA ${difficultyLabel} • ${payload.metrics.damage_dealt} de dano`,icon:won?"success":"info",showCancelButton:true,confirmButtonText:"Jogar novamente",cancelButtonText:"Voltar aos jogos",background:"#11162c",color:"#fff"});close();if(r.isConfirmed)setTimeout(()=>options.replay?.(),0);}else close();}},250);};begin();}
  else{
   const onCountdown=p=>{countdown.hidden=false;countdown.textContent=p.seconds;};
   const onStart=p=>{countdown.hidden=true;startedAt=p.startedAt||Date.now();controls.start();engine.start();timer=setInterval(updateHud,100);};
   network.on("match_countdown",onCountdown);network.on("match_start",onStart);engine.onFinished=showResult;
   engine.onOpponentDisconnected=()=>{if(window.Swal)Swal.fire({title:"Oponente desconectado",text:"Aguardando reconexão…",icon:"warning",showConfirmButton:false,timer:15000,timerProgressBar:true,background:"#11162c",color:"#fff"});};
   engine.onOpponentReconnected=()=>window.Swal?.close();
  }
  root.querySelector("[data-close]").onclick=async()=>{if(!casual){const r=window.Swal?await Swal.fire({title:"Sair da partida?",text:"A desconexão inicia o período de reconexão; se você não voltar, o servidor aplica a derrota por abandono.",icon:"warning",showCancelButton:true,confirmButtonText:"Sair",cancelButtonText:"Continuar",background:"#11162c",color:"#fff"}):{isConfirmed:confirm("Deseja sair?")};if(!r.isConfirmed)return;}close();};
  return{start(){},destroy(){ended=true;clearInterval(timer);controls.destroy();engine?.destroy?.();network?.close?.();}};
 }
};
export function init(containerElement,eventBus,realtimeClient,matchContext={}){return tankGame.create({root:containerElement,close:()=>{},options:{eventBus,matchContext,...matchContext}})}
export { buildTankMatchPayload };
