import { fetchUserMatchHistory } from "../../services/appwrite.js";

const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const formatMatchRecord=(m,userId)=>{
 const isA=m.player_a===userId,myScore=Number(isA?m.score_a:m.score_b)||0,opponentScore=Number(isA?m.score_b:m.score_a)||0;
 const opponentId=isA?m.player_b:m.player_a;
 const outcome=!m.winner_user_id?"DRAW":m.winner_user_id===userId?"WIN":"LOSS";
 const gameName=m.game_id==="snake"?"Snake 1v1":m.game_id==="tank"?"Tank Battle":m.game_id||"1v1";
 const date=m.finished_at?new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(m.finished_at)):"—";
 return{matchId:m.$id,gameName,outcome,myScore,opponentScore,opponentId,date};
};

export class ProfilePanel {
 #auth;#node=null;#onClose;#profile=null;#user=null;#history=[];#historyLoading=false;#historyError=false;
 constructor({auth,onClose}){this.#auth=auth;this.#onClose=onClose}
 async show(){
  if(!this.#node){this.#node=document.createElement("section");this.#node.className="profile-screen";document.body.append(this.#node);this.#node.addEventListener("click",async e=>{
   if(e.target.closest("[data-profile-back]")){this.hide();this.#onClose?.();return}
   if(e.target.closest("[data-profile-login]")){this.hide();this.#onClose?.({login:true});return}
   if(e.target.closest("[data-history-retry]")){await this.#loadHistory();return}
   if(e.target.closest("[data-profile-logout]")){const btn=e.target.closest("[data-profile-logout]");btn.disabled=true;try{await this.#auth.signOut();this.#user=null;this.#profile=null;this.#history=[];this.#render();window.dispatchEvent(new CustomEvent("diamond:auth-changed"));}catch(err){btn.disabled=false;window.Swal?.fire({title:"Não foi possível sair",text:err?.message||"Tente novamente.",icon:"error",background:"#11162c",color:"#fff",confirmButtonColor:"#5153e6"});}return}
  });}
  await this.refresh();this.#node.hidden=false;document.body.classList.add("module-open");
 }
 async refresh(){
  this.#user=await this.#auth.current();this.#profile=this.#user?await this.#auth.profile(this.#user.$id):null;this.#history=[];this.#historyError=false;this.#historyLoading=!!this.#user;this.#render();
  if(this.#user)await this.#loadHistory();
  return{user:this.#user,profile:this.#profile};
 }
 async #loadHistory(){if(!this.#user)return;this.#historyLoading=true;this.#historyError=false;this.#render();try{this.#history=await fetchUserMatchHistory(this.#user.$id,10);}catch(e){console.error("Match history unavailable",e);this.#history=[];this.#historyError=true;}finally{this.#historyLoading=false;this.#render();}}
 hide(){if(this.#node)this.#node.hidden=true;document.body.classList.remove("module-open")}
 #historyMarkup(){
  if(this.#historyLoading)return `<div class="history-skeleton" aria-label="Carregando histórico">${Array.from({length:3},()=>'<span></span>').join("")}</div>`;
  if(this.#historyError)return '<div class="history-empty"><strong>Histórico indisponível</strong><p>Não foi possível carregar suas partidas agora.</p><button type="button" data-history-retry>Tentar novamente</button></div>';
  if(!this.#history.length)return '<div class="history-empty"><strong>Nenhuma partida 1v1 registrada.</strong><p>Desafie um amigo no Games Hub!</p></div>';
  return `<div class="history-list">${this.#history.map(raw=>{const m=formatMatchRecord(raw,this.#user.$id),label=m.outcome==="WIN"?"VITÓRIA":m.outcome==="LOSS"?"DERROTA":"EMPATE",cls=m.outcome.toLowerCase(),opp=esc((m.opponentId||"--------").slice(0,8).toUpperCase());return `<article class="history-card ${cls}"><div class="history-card__main"><span class="badge-${cls}">${label}</span><div><strong>${esc(m.gameName)}</strong><small>vs #${opp}</small></div></div><div class="history-card__score"><strong>${m.myScore} - ${m.opponentScore}</strong><small>${esc(m.date)}</small></div></article>`;}).join("")}</div>`;
 }
 #render(){
  if(!this.#node)return;const p=this.#profile,u=this.#user,name=p?.username||u?.name||"Jogador",initial=name.charAt(0).toUpperCase(),wins=Number(p?.wins)||0,losses=Number(p?.losses)||0,total=wins+losses,rate=total?Math.round(wins/total*100):0;
  this.#node.innerHTML=`<div class="profile-screen__inner"><header class="module-header"><button type="button" data-profile-back aria-label="Voltar">←</button><div><small>DIAMOND GAME</small><strong>Perfil</strong></div></header>
  ${u?`<main class="profile-content"><section class="profile-identity"><div class="profile-avatar">${esc(initial)}</div><div><small>JOGADOR</small><h1>${esc(name)}</h1><p>${esc(u.email||"")}</p></div><span class="profile-online">ONLINE</span></section>
  <section class="profile-stats"><article><small>VITÓRIAS</small><strong>${wins}</strong></article><article><small>DERROTAS</small><strong>${losses}</strong></article><article><small>APROVEITAMENTO</small><strong>${rate}%</strong></article></section>
  <section class="profile-progress"><div><span>PARTIDAS 1V1</span><strong>${total}</strong></div><div><span>RECORDE</span><strong>${Number(p?.best_score)||0}</strong></div></section>
  <section class="profile-history"><div class="profile-section-title"><div><small>COMPETITIVO</small><h2>Histórico de partidas</h2></div><span>ÚLTIMAS 10</span></div>${this.#historyMarkup()}</section>
  <section class="profile-card"><span>DIAMOND ID</span><strong>${esc(u.$id.slice(0,8).toUpperCase())}</strong><p>Seu perfil reúne sua identidade e progresso competitivo.</p></section>
  <button class="profile-logout" type="button" data-profile-logout>Sair da conta</button></main>`:
  `<main class="profile-empty"><div class="profile-avatar">D</div><small>DIAMOND PROFILE</small><h1>Seu perfil de jogador</h1><p>Entre na sua conta para acompanhar vitórias, derrotas e histórico 1v1.</p><button type="button" data-profile-login>ENTRAR NA CONTA</button></main>`}
  </div>`;
 }
}
