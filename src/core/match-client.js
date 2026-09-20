export class MatchClient {
  #events; #room=null; #channel=null;
  constructor({events}){this.#events=events;}
  #emit(){this.#events.emit("match:update",this.room);}
  create(gameId){
    const code=Math.random().toString(36).slice(2,8).toUpperCase();
    this.#room={id:crypto.randomUUID?.()??code,code,gameId,status:"waiting",players:[{slot:"A",ready:true}],createdAt:Date.now()};
    this.#emit();return this.room;
  }
  join(code,gameId){
    this.#room={id:String(code).toUpperCase(),code:String(code).toUpperCase(),gameId,status:"ready",players:[{slot:"A",ready:true},{slot:"B",ready:true}],createdAt:Date.now()};
    this.#emit();return this.room;
  }
  async copyInvite(){
    if(!this.#room)return false;
    const url=new URL(location.href);url.searchParams.set("room",this.#room.code);url.searchParams.set("game",this.#room.gameId);
    try{await navigator.clipboard.writeText(url.toString());return true}catch{return false}
  }
  leave(){const room=this.room;this.#room=null;this.#channel?.unsubscribe?.();this.#channel=null;this.#events.emit("match:left",room);}
  get room(){return this.#room?{...this.#room,players:this.#room.players.map(p=>({...p}))}:null;}
}
