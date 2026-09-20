export class EventBus {
  #listeners = new Map();

  on(event, handler) {
    if (typeof handler !== "function") throw new TypeError("Handler inválido.");
    const handlers = this.#listeners.get(event) ?? new Set();
    handlers.add(handler);
    this.#listeners.set(event, handlers);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    const handlers = this.#listeners.get(event);
    if (!handlers) return;
    handlers.delete(handler);
    if (!handlers.size) this.#listeners.delete(event);
  }

  emit(event, payload) {
    this.#listeners.get(event)?.forEach(handler => handler(payload));
  }

  clear() {
    this.#listeners.clear();
  }
}
