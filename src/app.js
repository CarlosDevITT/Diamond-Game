import { GameRegistry } from "./core/game-registry.js";
import { GamesPanel } from "./modules/games-panel/index.js";
import { snakeGame } from "./games/snake/index.js";

const registry = new GameRegistry();
registry.register(snakeGame);

const stage = document.createElement("div");
stage.id = "game-stage";
stage.className = "game-stage";
stage.hidden = true;
document.body.append(stage);

const panel = new GamesPanel({
  games: registry.list(),
  onPlay: async id => {
    panel.hide();
    await registry.open(id, stage, () => {
      panel.show();
    });
  }
});

document.getElementById("open-games").addEventListener("click", () => panel.show());

const menu = document.getElementById("nav-menu");
const toggle = document.getElementById("nav-toggle");
const close = document.getElementById("nav-close");
const setMenu = open => {
  menu.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
};
toggle.addEventListener("click", () => setMenu(true));
close.addEventListener("click", () => setMenu(false));
menu.querySelectorAll(".nav__link").forEach(link => link.addEventListener("click", () => setMenu(false)));

const mascot = document.querySelector(".home__img img");
let dragging = false, lastX = 0, rotation = 0;
mascot.addEventListener("pointerdown", e => {
  dragging = true; lastX = e.clientX; mascot.setPointerCapture?.(e.pointerId);
});
mascot.addEventListener("pointermove", e => {
  if (!dragging) return;
  rotation += (e.clientX - lastX) * 1.5; lastX = e.clientX;
  mascot.style.transform = `rotateY(${rotation}deg)`;
});
["pointerup","pointercancel"].forEach(type => mascot.addEventListener(type, () => dragging = false));
