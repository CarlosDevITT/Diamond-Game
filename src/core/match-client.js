export class MatchClient {
  #events; #room=null;
  constructor({events}){this.#events=events;}
  create(gameId){
    const code=Math.random().toString(36).slice(2,8).toUpperCase();
    this.#room={id:crypto.randomUUID?.()??code,code,gameId,status:"waiting",players:1,createdAt:Date.now()};
    this.#events.emit("match:created",this.#room); return {...this.#room};
  }
  join(code,gameId){
    this.#room={id:code,code:String(code).toUpperCase(),gameId,status:"ready",players:2,createdAt:Date.now()};
    this.#events.emit("match:joined",this.#room); return {...this.#room};
  }
  leave(){const room=this.#room;this.#room=null;this.#events.emit("match:left",room);}
  get room(){return this.#room?{...this.#room}:null;}
}
