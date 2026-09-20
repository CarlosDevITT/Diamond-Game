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
      <div class="games-hero"><span>ARCADE</span><h1>Escolha seu jogo</h1><p>Leia as regras e entre na partida.</p></div>
      <div class="games-grid">${this.#games.map(game => `
        <article class="game-card">
          <div class="game-card__visual ${banners[game.id] ? "game-card__visual--banner" : ""}">${banners[game.id] ? `<img src="${banners[game.id]}" alt="Banner ${game.name}" loading="eager" draggable="false">` : `<b>◈</b>`}<span>${game.status === "available" ? "DISPONÍVEL" : "EM BREVE"}</span></div>
          <div class="game-card__body">
            <h2>${game.name}</h2><p>${game.description}</p>
            <div class="rules"><strong>Como jogar</strong><ul>${game.rules.map(rule => `<li>${rule}</li>`).join("")}</ul></div>
            <div class="game-modes"><button type="button" data-play="${game.id}">Casual</button><button type="button" data-versus="${game.id}">1v1</button></div>
          </div>
        </article>`).join("")}
      </div>
    </div>`;
  }
}
