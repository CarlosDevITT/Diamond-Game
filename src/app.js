import { GameRegistry } from "./core/game-registry.js";

export const DiamondGame = new GameRegistry();

const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");

navToggle?.addEventListener("click", () => navMenu?.classList.add("show-menu"));
navClose?.addEventListener("click", () => navMenu?.classList.remove("show-menu"));
document.querySelectorAll(".nav__link").forEach(link => {
  link.addEventListener("click", () => navMenu?.classList.remove("show-menu"));
});

if (window.ScrollReveal) {
  const sr = window.ScrollReveal({ distance: "90px", duration: 1800 });
  sr.reveal(".home__data", { origin: "top", delay: 200 });
  sr.reveal(".home__img", { origin: "bottom", delay: 350 });
  sr.reveal(".home__footer", { origin: "bottom", delay: 500 });
}
