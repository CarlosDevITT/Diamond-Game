export class GamesPanel {
  #root; #games; #onPlay; #screen = null; #keydown;

  constructor({ root = document.body, games = [], onPlay }) {
    this.#root = root;
    this.#games = games;
    this.#onPlay = onPlay;
    this.#keydown = e => { if (e.key === "Escape" && this.#screen) this.close(); };
    document.addEventListener("keydown", this.#keydown);
  }

  show() {
    if (this.#screen) return;
    this.#screen = document.createElement("main");
    this.#screen.className = "games-module";
    this.#screen.innerHTML = this.#template();
    this.#root.append(this.#screen);
    document.body.classList.add("games-module-open");
    this.#bind();
  }

  close() {
    this.#screen?.remove();
    this.#screen = null;
    document.body.classList.remove("games-module-open");
  }

  #bind() {
    this.#screen.querySelector("[data-games-back]")?.addEventListener("click", () => this.close());
    this.#screen.querySelectorAll("[data-panel-play]").forEach(button => {
      button.addEventListener("click", () => {
        const id = button.dataset.panelPlay;
        this.close();
        this.#onPlay?.(id);
      });
    });
  }

  #template() {
    return `<div class="games-module__page">
      <header class="games-module__header">
        <button type="button" class="games-module__back" data-games-back aria-label="Voltar"><i class='bx bx-left-arrow-alt'></i></button>
        <div><span>DIAMOND GAME</span><strong>Games</strong></div>
      </header>
      <section class="games-module__hero">
        <span>ARCADE</span>
        <h1>Escolha seu jogo</h1>
        <p>Confira as regras, escolha um game e entre na partida.</p>
      </section>
      <section class="games-module__grid">${this.#games.map(game => this.#card(game)).join("")}</section>
    </div>`;
  }

  #card(game) {
    const rules = game.id === "snake" ? [
      "Setas ou WASD no computador; deslize no celular.",
      "Capture os pontos para crescer e aumentar o score.",
      "A cada 50 pontos o nível e a velocidade aumentam.",
      "Não encoste nas bordas nem no próprio corpo."
    ] : ["Regras disponíveis em breve."];
    return `<article class="game-module-card">
      <div class="game-module-card__cover"><i class='bx bx-joystick'></i><span>DISPONÍVEL</span></div>
      <div class="game-module-card__body"><h2>${game.name}</h2><p>${game.description || "Game Diamond."}</p>
        <div class="game-module-card__rules"><strong>Regras</strong><ul>${rules.map(rule => `<li>${rule}</li>`).join("")}</ul></div>
        <button type="button" data-panel-play="${game.id}"><i class='bx bx-play'></i> Jogar ${game.name}</button>
      </div>
    </article>`;
  }

  destroy() { document.removeEventListener("keydown", this.#keydown); this.close(); }
}
