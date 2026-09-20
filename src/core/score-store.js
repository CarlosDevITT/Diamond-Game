export class ScoreStore {
  #prefix;
  constructor(prefix="diamond"){this.#prefix=prefix;}
  #key(gameId){return `${this.#prefix}:${gameId}:best`;}
  getBest(gameId){try{return Math.max(0,Number(localStorage.getItem(this.#key(gameId)))||0)}catch{return 0}}
  saveBest(gameId,score){const best=Math.max(this.getBest(gameId),Math.max(0,Number(score)||0));try{localStorage.setItem(this.#key(gameId),String(best))}catch{}return best}
}
