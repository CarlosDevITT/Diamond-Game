export class GamesPanel {
  #games; #onPlay; #node = null;

  constructor({ games, onPlay }) {
    this.#games = games;
    this.#onPlay = onPlay;
  }

  show() {
    if (!this.#node) {
      this.#node = document.createElement("section");
      this.#node.className = "games-screen";
      this.#node.innerHTML = this.#render();
      document.body.append(this.#node);
      this.#node.querySelector("[data-back]").addEventListener("click", () => this.hide());
      this.#node.querySelectorAll("[data-play]").forEach(btn => btn.addEventListener("click", () => this.#onPlay(btn.dataset.play, { mode: "casual" })));
      this.#node.querySelectorAll("[data-versus]").forEach(btn => btn.addEventListener("click", () => this.#onPlay(btn.dataset.versus, { mode: "1v1" })));
    }
    this.#node.hidden = false;
    document.body.classList.add("module-open");
  }

  hide() {
    if (this.#node) this.#node.hidden = true;
    document.body.classList.remove("module-open");
  }

  #render() {
    const banners={snake:"./assets/img/file_000000007070820eb1ddd35dbc1b4ab9.png",tank:"./assets/img/file_00000000e83c820e99a0cfbcc1451aa2.png"};
    return `<div class="games-screen__inner">
      <header class="module-header">
        <button type="button" data-back aria-label="Voltar">←</button>
        <div><small>DIAMOND GAME</small><strong>Games</strong></div>
      </header>
      <div class="games-hero"><div><span>DIAMOND ARCADE</span><h1>Escolha seu jogo</h1><p>Jogue casualmente ou desafie outro jogador no 1v1.</p></div><div class="games-hero__stats"><span><b>${this.#games.length}</b> jogos</span><span><b>2</b> modos</span></div></div>
      <div class="games-grid">${this.#games.map(game => `
        <article class="game-card" data-game="${game.id}">
          <div class="game-card__visual ${banners[game.id] ? "game-card__visual--banner" : ""}">${banners[game.id] ? `<img src="${banners[game.id]}" alt="Banner ${game.name}" loading="eager" draggable="false">` : `<b>◈</b>`}<span>${game.status === "available" ? "DISPONÍVEL" : "EM BREVE"}</span></div>
          <div class="game-card__body">
            <div class="game-card__heading"><div><small>${game.id === "tank" ? "MULTIPLAYER" : "ARCADE"}</small><h2>${game.name}</h2></div><span class="game-card__mode">${game.id === "tank" ? "90s" : "CLÁSSICO"}</span></div><p>${game.description}</p>
            <details class="rules"><summary>Como jogar <span>+</span></summary><ul>${game.rules.map(rule => `<li>${rule}</li>`).join("")}</ul></details>
            <div class="game-modes"><button type="button" data-play="${game.id}"><small>JOGAR</small><strong>Casual</strong></button><button type="button" data-versus="${game.id}"><small>DESAFIAR</small><strong>1v1</strong></button></div>
          </div>
        </article>`).join("")}
      </div>
    </div>`;
  }
}
