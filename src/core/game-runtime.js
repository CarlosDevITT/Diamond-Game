export const GAME_STATE = Object.freeze({
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
  GAME_OVER: "game-over",
  DESTROYED: "destroyed"
});

export class GameRuntime {
  #instance = null;
  #state = GAME_STATE.IDLE;
  #events;

  constructor(events) { this.#events = events; }
  get state() { return this.#state; }

  async attach(instance) {
    this.#instance = instance ?? null;
    this.#state = GAME_STATE.IDLE;
    return this;
  }

  async start() {
    await this.#instance?.start?.();
    this.#state = GAME_STATE.RUNNING;
    this.#events?.emit("game:start");
  }

  async pause() {
    if (this.#state !== GAME_STATE.RUNNING) return;
    await this.#instance?.pause?.();
    this.#state = GAME_STATE.PAUSED;
    this.#events?.emit("game:pause");
  }

  async resume() {
    if (this.#state !== GAME_STATE.PAUSED) return;
    await this.#instance?.resume?.();
    this.#state = GAME_STATE.RUNNING;
    this.#events?.emit("game:resume");
  }

  async restart() {
    await this.#instance?.restart?.();
    this.#state = GAME_STATE.RUNNING;
    this.#events?.emit("game:restart");
  }

  async destroy() {
    await this.#instance?.destroy?.();
    this.#instance = null;
    this.#state = GAME_STATE.DESTROYED;
    this.#events?.emit("game:destroy");
  }
}
