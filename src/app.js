import { GameRegistry } from "./core/game-registry.js";
import { snakeGame } from "./games/snake/index.js";

export const DiamondGame = new GameRegistry();
DiamondGame.register(snakeGame).mount({ stage: () => document.getElementById("game-stage") });
const gamesPanel = document.getElementById("games-panel");
const openGamesButton = document.getElementById("open-games");
const setGamesPanel = (open) => {
  if (!gamesPanel) return;
  gamesPanel.hidden = !open;
  gamesPanel.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("games-panel-open", open);
};
openGamesButton?.addEventListener("click", () => setGamesPanel(true));
gamesPanel?.querySelectorAll("[data-close-games]").forEach(button => button.addEventListener("click", () => setGamesPanel(false)));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && gamesPanel && !gamesPanel.hidden) setGamesPanel(false);
});
document.querySelector("[data-game=\"snake\"]")?.addEventListener("click", () => {
  setGamesPanel(false);
  DiamondGame.open("snake");
});

const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");

function openMenu() {
  navMenu?.classList.add("show-menu");
  navToggle?.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  navMenu?.classList.remove("show-menu");
  navToggle?.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", openMenu);
navClose?.addEventListener("click", closeMenu);
document.querySelectorAll(".nav__link").forEach(link => link.addEventListener("click", closeMenu));

const diamond = document.querySelector(".home__img img");
if (diamond) {
  let rotation = 0;
  let dragging = false;
  let lastX = 0;

  const beginDrag = (clientX) => {
    dragging = true;
    lastX = clientX;
    diamond.classList.add("is-dragging");
  };

  const drag = (clientX) => {
    if (!dragging) return;
    const deltaX = clientX - lastX;
    rotation += deltaX * 1.8;
    lastX = clientX;
    diamond.style.transform = `translateY(0) rotateY(${rotation}deg)`;
  };

  const endDrag = () => {
    dragging = false;
    diamond.classList.remove("is-dragging");
  };

  diamond.addEventListener("pointerdown", (event) => {
    beginDrag(event.clientX);
    diamond.setPointerCapture?.(event.pointerId);
  });

  diamond.addEventListener("pointermove", (event) => drag(event.clientX));
  diamond.addEventListener("pointerup", endDrag);
  diamond.addEventListener("pointercancel", endDrag);

  diamond.addEventListener("touchstart", (event) => {
    beginDrag(event.touches[0].clientX);
  }, { passive: true });

  diamond.addEventListener("touchmove", (event) => {
    drag(event.touches[0].clientX);
  }, { passive: true });

  diamond.addEventListener("touchend", endDrag, { passive: true });
}

if (window.ScrollReveal) {
  const sr = window.ScrollReveal({ distance: "90px", duration: 1800 });
  sr.reveal(".home__data", { origin: "top", delay: 200 });
  sr.reveal(".home__img", { origin: "bottom", delay: 350 });
  sr.reveal(".home__footer", { origin: "bottom", delay: 500 });
}
