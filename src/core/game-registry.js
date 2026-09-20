export class GameRegistry {
  #games = new Map();
  #stage = null;
  #onClose = null;
  #active = null;

  mount({ stage, onClose } = {}) {
    this.#stage = stage;
    this.#onClose = onClose;
    return this;
  }

  register(game) {
    if (!game?.id || !game?.name || typeof game.create !== "function") {
      throw new TypeError("Game module inválido: use { id, name, create() }.");
    }
    if (this.#games.has(game.id)) throw new Error(`Game "${game.id}" já registrado.`);
    this.#games.set(game.id, game);
    return this;
  }

  list() {
    return [...this.#games.values()].map(({ id, name, description }) => ({ id, name, description }));
  }

  async open(id, options = {}) {
    const definition = this.#games.get(id);
    if (!definition) throw new Error(`Game "${id}" não encontrado.`);

    await this.close();

    const stage = typeof this.#stage === "function" ? this.#stage() : this.#stage;
    if (!stage) throw new Error("Game stage não montado.");

    stage.hidden = false;
    const instance = await definition.create({
      root: stage,
      options,
      close: () => this.close()
    });

    this.#active = instance ?? null;
    if (typeof this.#active?.start === "function") await this.#active.start();
  }

  async close() {
    if (typeof this.#active?.destroy === "function") await this.#active.destroy();
    this.#active = null;

    const stage = typeof this.#stage === "function" ? this.#stage() : this.#stage;
    if (stage) {
      stage.replaceChildren();
      stage.hidden = true;
    }
    this.#onClose?.();
  }
}
