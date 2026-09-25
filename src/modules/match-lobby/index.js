export class MatchLobby {
  #node=null; #match; #onStart; #onExit; #game=null; #room=null; #durationMs=120000;
  constructor({match,onStart,onExit}){this.#match=match;this.#onStart=onStart;this.#onExit=onExit;}
  show(game){this.#game=game;if(!this.#node){this.#node=document.createElement("section");this.#node.className="match-lobby";document.body.append(this.#node);}this.#renderHome();this.#node.hidden=false;document.body.classList.add("module-open");}
  hide(){if(this.#node)this.#node.hidden=true;document.body.classList.remove("module-open");}
  refresh(room){if(this.#node&&!this.#node.hidden&&this.#room?.id===room?.id)this.#showRoom(room);}
  #renderHome(){
    this.#room=null;
    this.#node.innerHTML=`<div class="match-lobby__inner"><header class="module-header"><button data-back>←</button><div><small>DIAMOND 1V1</small><strong>${this.#game.name}</strong></div></header><section class="lobby-hero"><span>MULTIPLAYER</span><h1>Desafie um amigo</h1><p>Crie uma sala ou entre usando o código do convite.</p></section><div class="lobby-actions">${this.#game.id==="tank"?`<div class="lobby-duration"><small>DURAÇÃO DA BATALHA</small><div><button class="is-selected" data-lobby-duration="120000">2 MIN</button><button data-lobby-duration="300000">5 MIN</button><button data-lobby-duration="600000">10 MIN</button></div></div>`:""}<button data-create>Criar sala</button><div class="join-box"><input data-code maxlength="6" autocomplete="off" placeholder="CÓDIGO DA SALA"><button data-join>Entrar</button></div><small class="lobby-note">Créditos e habilidades são conquistados durante a partida.</small></div></div>`;
    this.#node.querySelectorAll("[data-lobby-duration]").forEach(button=>button.onclick=()=>{this.#node.querySelectorAll("[data-lobby-duration]").forEach(item=>item.classList.remove("is-selected"));button.classList.add("is-selected");this.#durationMs=Number(button.dataset.lobbyDuration)||120000;});
    this.#node.querySelector("[data-back]").onclick=()=>{this.hide();this.#onExit?.();};
    this.#node.querySelector("[data-create]").onclick=async()=>{try{const room=await this.#match.create(this.#game.id);room.durationMs=this.#durationMs;this.#showRoom(room);}catch(e){alert(e.message||"Não foi possível criar a sala.");}};
    this.#node.querySelector("[data-join]").onclick=async()=>{const code=this.#node.querySelector("[data-code]").value.trim();if(!code)return;try{this.#showRoom(await this.#match.join(code,this.#game.id));}catch(e){alert(e.message||"Não foi possível entrar na sala.");}};
  }
  #showRoom(room){
    this.#room=room;if(Number(room?.durationMs))this.#durationMs=Number(room.durationMs);
    const count=room.players.length, allReady=count===2&&room.players.every(p=>p.ready), isHost=this.#match.userId===room.hostUserId;
    const a=room.players.find(p=>p.slot==="A"), b=room.players.find(p=>p.slot==="B");
    this.#node.innerHTML=`<div class="match-lobby__inner"><header class="module-header"><button data-back>←</button><div><small>SALA 1V1</small><strong>${this.#game.name}</strong></div></header><section class="room-card"><span>CÓDIGO DA SALA</span><h1>${room.code}</h1><p>${count<2?"Aguardando oponente…":allReady?"Sala pronta para iniciar":"Aguardando jogadores ficarem prontos"}</p><button class="room-copy" data-copy>Copiar convite</button><div class="room-players"><div><b>JOGADOR A</b><small>${a?.ready?"PRONTO":"AGUARDANDO"}</small></div><div><b>JOGADOR B</b><small>${b?.ready?"PRONTO":"AGUARDANDO"}</small></div></div><button data-start ${allReady&&isHost?"":"disabled"}>${isHost?"Iniciar partida":"Aguardando Jogador A"}</button></section></div>`;
    this.#node.querySelector("[data-back]").onclick=async()=>{const result=window.Swal?await Swal.fire({title:"Sair da sala?",text:"Você deixará esta sala 1v1.",icon:"question",showCancelButton:true,confirmButtonText:"Sair",cancelButtonText:"Ficar",background:"#11162c",color:"#fff",confirmButtonColor:"#e5484d"}):{isConfirmed:confirm("Sair da sala?")};if(!result.isConfirmed)return;await this.#match.leaveRoom();this.#renderHome();};
    this.#node.querySelector("[data-copy]").onclick=async e=>{const ok=await this.#match.copyInvite();e.currentTarget.textContent=ok?"Convite copiado ✓":"Código: "+room.code;};
    this.#node.querySelector("[data-start]").onclick=async()=>{if(!allReady||!isHost)return;const btn=this.#node.querySelector("[data-start]");btn.disabled=true;btn.textContent="SINCRONIZANDO…";try{const match=await this.#match.startMatch();this.hide();this.#onStart(this.#game.id,{mode:"1v1",roomCode:room.code,matchId:match.$id,seed:match.seed,startedAt:match.started_at,durationMs:this.#durationMs});}catch(e){btn.disabled=false;btn.textContent="Iniciar partida";alert(e.message||"Não foi possível iniciar a partida.");}};
  }
}
