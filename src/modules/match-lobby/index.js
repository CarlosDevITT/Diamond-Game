export class MatchLobby {
  #node=null; #match; #onStart; #game=null; #room=null;
  constructor({match,onStart}){this.#match=match;this.#onStart=onStart;}
  show(game){this.#game=game;if(!this.#node){this.#node=document.createElement("section");this.#node.className="match-lobby";document.body.append(this.#node);}this.#renderHome();this.#node.hidden=false;document.body.classList.add("module-open");}
  hide(){if(this.#node)this.#node.hidden=true;document.body.classList.remove("module-open");}
  refresh(room){if(this.#node&&!this.#node.hidden&&this.#room?.id===room?.id)this.#showRoom(room);}
  #renderHome(){
    this.#room=null;
    this.#node.innerHTML=`<div class="match-lobby__inner"><header class="module-header"><button data-back>←</button><div><small>DIAMOND 1V1</small><strong>${this.#game.name}</strong></div></header><section class="lobby-hero"><span>MULTIPLAYER</span><h1>Desafie um amigo</h1><p>Crie uma sala ou entre usando o código do convite.</p></section><div class="lobby-actions"><button data-create>Criar sala</button><div class="join-box"><input data-code maxlength="6" autocomplete="off" placeholder="CÓDIGO DA SALA"><button data-join>Entrar</button></div><small class="lobby-note">Modo de testes • sem dinheiro real</small></div></div>`;
    this.#node.querySelector("[data-back]").onclick=()=>this.hide();
    this.#node.querySelector("[data-create]").onclick=async()=>{try{this.#showRoom(await this.#match.create(this.#game.id));}catch(e){alert(e.message||"Não foi possível criar a sala.");}};
    this.#node.querySelector("[data-join]").onclick=async()=>{const code=this.#node.querySelector("[data-code]").value.trim();if(!code)return;try{this.#showRoom(await this.#match.join(code,this.#game.id));}catch(e){alert(e.message||"Não foi possível entrar na sala.");}};
  }
  #showRoom(room){
    this.#room=room;
    const count=room.players.length, allReady=count===2&&room.players.every(p=>p.ready);
    const a=room.players.find(p=>p.slot==="A"), b=room.players.find(p=>p.slot==="B");
    this.#node.innerHTML=`<div class="match-lobby__inner"><header class="module-header"><button data-back>←</button><div><small>SALA 1V1</small><strong>${this.#game.name}</strong></div></header><section class="room-card"><span>CÓDIGO DA SALA</span><h1>${room.code}</h1><p>${count<2?"Aguardando oponente…":allReady?"Sala pronta para iniciar":"Aguardando jogadores ficarem prontos"}</p><button class="room-copy" data-copy>Copiar convite</button><div class="room-players"><div><b>JOGADOR A</b><small>${a?.ready?"PRONTO":"AGUARDANDO"}</small></div><div><b>JOGADOR B</b><small>${b?.ready?"PRONTO":"AGUARDANDO"}</small></div></div><button data-start ${allReady?"":"disabled"}>Iniciar partida</button></section></div>`;
    this.#node.querySelector("[data-back]").onclick=()=>{this.#match.leave();this.#renderHome();};
    this.#node.querySelector("[data-copy]").onclick=async e=>{const ok=await this.#match.copyInvite();e.currentTarget.textContent=ok?"Convite copiado ✓":"Código: "+room.code;};
    this.#node.querySelector("[data-start]").onclick=()=>{if(!allReady)return;this.hide();this.#onStart(this.#game.id,{mode:"1v1",roomCode:room.code});};
  }
}
