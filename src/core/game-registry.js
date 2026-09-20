export class GameRegistry {
  #games = new Map();
  #active = null;

  register(game) {
    if (!game?.id || !game?.name || typeof game.create !== "function") {
      throw new TypeError("Módulo de jogo inválido.");
    }
    if (this.#games.has(game.id)) throw new Error(`Jogo "${game.id}" já registrado.`);
    this.#games.set(game.id, game);
    return this;
  }

  list() {
    return [...this.#games.values()].map(({ id, name, description, rules, status = "available" }) => ({ id, name, description, rules, status }));
  }

  async open(id, stage, onClose) {
    const game = this.#games.get(id);
    if (!game) throw new Error(`Jogo "${id}" não encontrado.`);
    await this.close(stage);
    stage.hidden = false;
    document.body.classList.add("game-open");
    const close = async () => {
      await this.close(stage);
      onClose?.();
    };
    this.#active = await game.create({ root: stage, close });
    await this.#active?.start?.();
  }

  async close(stage) {
    await this.#active?.destroy?.();
    this.#active = null;
    if (stage) {
      stage.replaceChildren();
      stage.hidden = true;
    }
    document.body.classList.remove("game-open");
  }
}
