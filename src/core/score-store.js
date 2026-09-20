const PREFIX = "diamond-game";

export class ScoreStore {
  #key(gameId) { return `${PREFIX}:${gameId}:score`; }

  getBest(gameId) {
    try { return Number(localStorage.getItem(this.#key(gameId))) || 0; }
    catch { return 0; }
  }

  save(gameId, score) {
    const value = Math.max(0, Number(score) || 0);
    const best = Math.max(this.getBest(gameId), value);
    try { localStorage.setItem(this.#key(gameId), String(best)); } catch {}
    return best;
  }
}
