import { GameRegistry } from "./core/game-registry.js";
import { GamesPanel } from "./modules/games-panel/index.js";
import { snakeGame } from "./games/snake/index.js";
import { EventBus } from "./core/event-bus.js";
import { MatchClient } from "./core/match-client.js";
import { auth } from "./services/auth.js";
import { AuthScreen } from "./modules/auth-screen/index.js";
import { MatchLobby } from "./modules/match-lobby/index.js";

const events = new EventBus();
const registry = new GameRegistry();
const match = new MatchClient({ events });
events.on("match:update", room => lobby?.refresh(room));
registry.register(snakeGame);

const stage = document.createElement("div");
stage.id = "game-stage";
stage.className = "game-stage";
stage.hidden = true;
document.body.append(stage);

const startGame = async (id, options = {}) => {
  panel.hide(); lobby.hide();
  events.emit("game:open", { id, ...options });
  await registry.open(id, stage, () => {
    events.emit("game:close", { id, ...options });
    options.mode === "1v1" ? lobby.show(registry.list().find(game => game.id === id)) : panel.show();
  });
};
const lobby = new MatchLobby({ match, onStart: startGame });
const panel = new GamesPanel({
  games: registry.list(),
  onPlay: (id, options = {}) => {
    if (options.mode === "1v1") {
      panel.hide();
      lobby.show(registry.list().find(game => game.id === id));
      return;
    }
    startGame(id, options);
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

const authScreen=new AuthScreen({auth,onReady:user=>events.emit("auth:ready",{user})});
authScreen.boot();
