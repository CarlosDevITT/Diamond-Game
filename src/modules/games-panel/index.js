export class GamesPanel {
  #games; #onPlay; #onProfile; #node = null; #profile = null;

  constructor({ games, onPlay, onProfile }) {
    this.#games = games;
    this.#onPlay = onPlay;
    this.#onProfile = onProfile;
  }

  show() {
    if (!this.#node) {
      this.#node = document.createElement("section");
      this.#node.className = "games-screen";
      this.#node.innerHTML = this.#render();
      document.body.append(this.#node);
      this.#node.querySelector("[data-back]").addEventListener("click", () => this.hide());
      this.#node.querySelector("[data-profile]").addEventListener("click", () => this.#onProfile?.());
      this.#node.querySelectorAll("[data-play]").forEach(btn => btn.addEventListener("click", () => this.#onPlay(btn.dataset.play, { mode: "casual" })));
      this.#node.querySelectorAll("[data-versus]").forEach(btn => btn.addEventListener("click", () => this.#onPlay(btn.dataset.versus, { mode: "1v1" })));
    }
    this.#node.hidden = false;
    document.body.classList.add("module-open");
  }

  setProfile(profile) {
    this.#profile = profile || null;
    if (!this.#node) return;
    const button=this.#node.querySelector("[data-profile]");
    if (!button) return;
    const name=this.#profile?.username || this.#profile?.name || "Perfil";
    button.querySelector("[data-profile-name]").textContent=name;
    button.querySelector("[data-profile-avatar]").textContent=name.trim().charAt(0).toUpperCase() || "D";
    button.classList.toggle("is-authenticated",!!this.#profile);
  }

  hide() {
    if (this.#node) this.#node.hidden = true;
    document.body.classList.remove("module-open");
  }

  #render() {
    const banners={snake:"./assets/img/file_000000007070820eb1ddd35dbc1b4ab9.png",tank:"./assets/img/file_00000000e83c820e99a0cfbcc1451aa2.png"};
    return `<div class="games-screen__inner">
      <header class="module-header games-panel__header">
        <button class="games-panel__back" type="button" data-back aria-label="Voltar">←</button>
        <div class="games-panel__brand"><span class="games-panel__mark">◆</span><div><small>DIAMOND GAME</small><strong>Arcade</strong></div></div>
        <button class="profile-trigger" type="button" data-profile aria-label="Abrir perfil"><span class="profile-trigger__avatar" data-profile-avatar>D</span><span class="profile-trigger__copy"><small>CONTA</small><strong data-profile-name>Perfil</strong></span><span class="profile-trigger__chevron">›</span></button>
      </header>
      <div class="games-hero"><div><span>DIAMOND ARCADE</span><h1>Escolha seu jogo</h1><p>Jogue casualmente ou desafie outro jogador no 1v1.</p></div><div class="games-hero__stats"><span><b>${this.#games.length}</b> jogos</span><span><b>2</b> modos</span></div></div>
      <div class="games-grid">${this.#games.map(game => `
        <article class="game-card" data-game="${game.id}">
          <div class="game-card__visual ${banners[game.id] ? "game-card__visual--banner" : ""}">${banners[game.id] ? `<img src="${banners[game.id]}" alt="Banner ${game.name}" loading="eager" draggable="false">` : `<b>◈</b>`}<span>${game.status === "available" ? "DISPONÍVEL" : "EM BREVE"}</span></div>
          <div class="game-card__body">
            <div class="game-card__heading"><div><small>${game.id === "tank" ? "MULTIPLAYER" : "ARCADE"}</small><h2>${game.name}</h2></div><span class="game-card__mode">${game.id === "tank" ? "90s" : "CLÁSSICO"}</span></div><p>${game.description}</p>
            <details class="rules"><summary>Como jogar <span>+</span></summary><ul>${game.rules.map(rule => `<li>${rule}</li>`).join("")}</ul></details>
            <div class="game-modes">
              <button class="game-mode game-mode--casual" type="button" data-play="${game.id}">
                <span class="game-mode__icon">▶</span><span class="game-mode__copy"><small>JOGAR</small><strong>Casual</strong><em>Entre direto • sem sala</em></span><span class="game-mode__arrow">→</span>
              </button>
              <button class="game-mode game-mode--versus" type="button" data-versus="${game.id}">
                <span class="game-mode__icon">◆</span><span class="game-mode__copy"><small>DESAFIAR</small><strong>1v1</strong><em>Contra outro jogador</em></span><span class="game-mode__arrow">→</span>
              </button>
            </div>
          </div>
        </article>`).join("")}
      </div>
      <footer class="games-panel__footer"><div class="games-panel__footer-brand"><span>◆</span><div><strong>DIAMOND GAME</strong><small>PLAY • COMPETE • EVOLVE</small></div></div><nav class="games-panel__footer-links" aria-label="Links legais"><a href="./legal.html#termos">Termos de Uso</a><a href="./legal.html#privacidade">Privacidade</a></nav><p>© ${new Date().getFullYear()} Diamond Game • Desenvolvido por States Softwares. Plataforma em desenvolvimento.</p></footer>
    </div>`;
  }
}
