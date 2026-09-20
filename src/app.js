import { GameRegistry } from "./core/game-registry.js";

const registry = new GameRegistry();

function renderHome() {
  const app = document.querySelector("#app");
  const games = registry.list();

  app.innerHTML = `
    <section class="shell">
      <div class="hero">
        <span class="badge">DIAMOND GAME • MODULAR ENGINE</span>
        <div class="eyebrow">Web Gaming Platform</div>
        <h1>Diamond Game</h1>
        <p>Uma base nova para minijogos independentes em JavaScript Modules. Cada jogo entra como módulo, sem acoplar a plataforma inteira.</p>
        <div class="library">
          ${games.length ? games.map(game => `<button data-game="${game.id}">${game.name}</button>`).join("") : `
            <div class="empty">
              <strong>Biblioteca limpa.</strong>
              <span>Os jogos antigos foram retirados. O próximo game entra pela nova API modular.</span>
            </div>`}
        </div>
      </div>
    </section>
    <section id="game-stage" class="game-stage" hidden></section>
  `;

  app.querySelectorAll("[data-game]").forEach(button => {
    button.addEventListener("click", () => registry.open(button.dataset.game));
  });
}

registry.mount({
  stage: () => document.querySelector("#game-stage"),
  onClose: renderHome
});

renderHome();
