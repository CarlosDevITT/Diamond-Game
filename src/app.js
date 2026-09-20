import { GameRegistry } from "./core/game-registry.js";

export const DiamondGame = new GameRegistry();

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
  const rotateDiamond = (event) => {
    const rect = diamond.getBoundingClientRect();
    const point = event.touches?.[0] ?? event;
    const x = Math.max(0, Math.min(rect.width, point.clientX - rect.left));
    const progress = rect.width ? x / rect.width : 0.5;
    diamond.style.setProperty("--diamond-rotate", `${progress * 360}deg`);
  };

  diamond.addEventListener("pointermove", rotateDiamond);
  diamond.addEventListener("pointerleave", () => diamond.style.setProperty("--diamond-rotate", "0deg"));
  diamond.addEventListener("touchmove", rotateDiamond, { passive: true });
}

if (window.ScrollReveal) {
  const sr = window.ScrollReveal({ distance: "90px", duration: 1800 });
  sr.reveal(".home__data", { origin: "top", delay: 200 });
  sr.reveal(".home__img", { origin: "bottom", delay: 350 });
  sr.reveal(".home__footer", { origin: "bottom", delay: 500 });
}
