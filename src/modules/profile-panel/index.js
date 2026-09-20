export class ProfilePanel {
  #auth; #node=null; #onClose; #profile=null; #user=null;
  constructor({auth,onClose}){this.#auth=auth;this.#onClose=onClose}
  async show(){
    if(!this.#node){
      this.#node=document.createElement("section");this.#node.className="profile-screen";document.body.append(this.#node);
      this.#node.addEventListener("click",async e=>{
        if(e.target.closest("[data-profile-back]")){this.hide();this.#onClose?.();return}
        if(e.target.closest("[data-profile-login]")){this.hide();this.#onClose?.({login:true});return}
        if(e.target.closest("[data-profile-logout]")){await this.#auth.signOut();this.#user=null;this.#profile=null;this.#render();window.dispatchEvent(new CustomEvent("diamond:auth-changed"));return}
      });
    }
    await this.refresh();this.#node.hidden=false;document.body.classList.add("module-open");
  }
  async refresh(){
    this.#user=await this.#auth.current();
    this.#profile=this.#user?await this.#auth.profile(this.#user.$id):null;
    this.#render();return {user:this.#user,profile:this.#profile};
  }
  hide(){if(this.#node)this.#node.hidden=true;document.body.classList.remove("module-open")}
  #render(){
    if(!this.#node)return;
    const p=this.#profile,u=this.#user,name=p?.username||u?.name||"Jogador",initial=name.charAt(0).toUpperCase();
    this.#node.innerHTML=`<div class="profile-screen__inner"><header class="module-header"><button type="button" data-profile-back aria-label="Voltar">←</button><div><small>DIAMOND GAME</small><strong>Perfil</strong></div></header>
    ${u?`<main class="profile-content"><section class="profile-identity"><div class="profile-avatar">${initial}</div><div><small>JOGADOR</small><h1>${name}</h1><p>${u.email||""}</p></div><span class="profile-online">ONLINE</span></section>
    <section class="profile-stats"><article><small>VITÓRIAS</small><strong>${p?.wins??0}</strong></article><article><small>DERROTAS</small><strong>${p?.losses??0}</strong></article><article><small>RECORDE</small><strong>${p?.best_score??0}</strong></article></section>
    <section class="profile-card"><span>DIAMOND ID</span><strong>${u.$id.slice(0,8).toUpperCase()}</strong><p>Seu perfil reúne sua identidade e progresso competitivo.</p></section>
    <button class="profile-logout" type="button" data-profile-logout>Sair da conta</button></main>`:
    `<main class="profile-empty"><div class="profile-avatar">D</div><small>DIAMOND PROFILE</small><h1>Seu perfil de jogador</h1><p>Entre na sua conta para acompanhar vitórias, derrotas e recordes.</p><button type="button" data-profile-login>ENTRAR NA CONTA</button></main>`}
    </div>`;
  }
}
