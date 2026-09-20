export class GamesPanel {
  #root; #games; #onPlay; #open = false; #keydown;

  constructor({ root, games = [], onPlay }) {
    if (!root) throw new Error("GamesPanel: root não encontrado.");
    this.#root = root;
    this.#games = games;
    this.#onPlay = onPlay;
    this.#keydown = e => { if (e.key === "Escape" && this.#open) this.close(); };
    document.addEventListener("keydown", this.#keydown);
  }

  show() {
    if (this.#open) return;
    this.#open = true;
    document.body.classList.add("games-panel-open");
    this.#root.innerHTML = this.#template();
    this.#bind();
  }

  close() {
    this.#open = false;
    document.body.classList.remove("games-panel-open");
    this.#root.replaceChildren();
  }

  #bind() {
    this.#root.querySelectorAll("[data-panel-close]").forEach(el => el.addEventListener("click", () => this.close()));
    this.#root.querySelectorAll("[data-panel-play]").forEach(el => el.addEventListener("click", () => {
      const id = el.dataset.panelPlay;
      this.close();
      this.#onPlay?.(id);
    }));
  }

  #template() {
    const cards = this.#games.map(game => this.#card(game)).join("");
    return `<section class="games-panel" aria-hidden="false">
      <div class="games-panel__backdrop" data-panel-close></div>
      <div class="games-panel__sheet" role="dialog" aria-modal="true" aria-labelledby="games-title">
        <header class="games-panel__header">
          <div><span>DIAMOND GAME</span><h2 id="games-title">Central de Games</h2></div>
          <button class="games-panel__close" type="button" data-panel-close aria-label="Fechar painel">×</button>
        </header>
        <div class="games-panel__content">
          <section class="games-panel__intro"><span class="games-panel__eyebrow">ARCADE</span><h3>Escolha seu game</h3><p>Selecione um jogo, confira as regras e entre na partida.</p></section>
          <div class="games-panel__grid">${cards}</div>
        </div>
      </div>
    </section>`;
  }

  #card(game) {
    const rules = game.id === "snake" ? [
      "Use setas, WASD ou deslize no celular.",
      "Capture os pontos para crescer e pontuar.",
      "A cada 50 pontos o nível e a velocidade aumentam.",
      "Evite as bordas e o próprio corpo."
    ] : ["Regras disponíveis em breve."];
    return `<article class="game-entry">
      <div class="game-entry__top">
        <span class="game-entry__icon"><i class='bx bx-joystick'></i></span>
        <div><span class="game-entry__status">DISPONÍVEL</span><h3>${game.name}</h3><p>${game.description || "Game Diamond."}</p></div>
      </div>
      <div class="game-rules"><strong>Como jogar</strong><ul>${rules.map(rule => `<li>${rule}</li>`).join("")}</ul></div>
      <button class="game-entry__play" type="button" data-panel-play="${game.id}"><i class='bx bx-play'></i> Jogar ${game.name}</button>
    </article>`;
  }

  destroy() {
    document.removeEventListener("keydown", this.#keydown);
    this.close();
  }
}
