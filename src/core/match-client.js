import { client, db, APPWRITE, ID, Query, Permission, Role, ensureSession } from "../services/appwrite.js";

export class MatchClient {
  #events; #room=null; #unsubscribe=null; #user=null;
  constructor({events}){this.#events=events;}
  async #auth(){if(!this.#user)this.#user=await ensureSession();return this.#user;}
  #map(room,players=[]){return {id:room.$id,code:room.code,gameId:room.game_id,status:room.status,players:players.map(p=>({slot:p.slot,ready:p.ready,userId:p.user_id})),createdAt:room.$createdAt};}
  async create(gameId){
    const user=await this.#auth(),code=Math.random().toString(36).slice(2,8).toUpperCase();
    const permissions=[Permission.read(Role.users()),Permission.update(Role.user(user.$id)),Permission.delete(Role.user(user.$id))];
    const room=await db.createRow({databaseId:APPWRITE.databaseId,tableId:"rooms",rowId:ID.unique(),data:{code,game_id:gameId,host_user_id:user.$id,status:"waiting",mode:"1v1"},permissions});
    await db.createRow({databaseId:APPWRITE.databaseId,tableId:"room_players",rowId:ID.unique(),data:{room_id:room.$id,user_id:user.$id,slot:"A",ready:true,connected:true},permissions:[Permission.read(Role.users()),Permission.update(Role.user(user.$id)),Permission.delete(Role.user(user.$id))]});
    this.#room=this.#map(room,[{slot:"A",ready:true,user_id:user.$id}]);this.#watch(room.$id);this.#events.emit("match:update",this.room);return this.room;
  }
  async join(code,gameId){
    const user=await this.#auth();
    const found=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"rooms",queries:[Query.equal("code",[String(code).toUpperCase()]),Query.limit(1)]});
    const room=found.rows?.[0];if(!room)throw new Error("Sala não encontrada");
    const players=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"room_players",queries:[Query.equal("room_id",[room.$id])]});
    if(players.rows.length>=2&&!players.rows.some(p=>p.user_id===user.$id))throw new Error("Sala cheia");
    if(!players.rows.some(p=>p.user_id===user.$id))await db.createRow({databaseId:APPWRITE.databaseId,tableId:"room_players",rowId:ID.unique(),data:{room_id:room.$id,user_id:user.$id,slot:"B",ready:true,connected:true},permissions:[Permission.read(Role.users()),Permission.update(Role.user(user.$id)),Permission.delete(Role.user(user.$id))]});
    const fresh=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"room_players",queries:[Query.equal("room_id",[room.$id])]});
    this.#room=this.#map(room,fresh.rows);this.#watch(room.$id);this.#events.emit("match:update",this.room);return this.room;
  }
  #watch(roomId){this.#unsubscribe?.();this.#unsubscribe=client.subscribe([`tablesdb.${APPWRITE.databaseId}.tables.room_players.rows`],async()=>{if(!this.#room||this.#room.id!==roomId)return;const p=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"room_players",queries:[Query.equal("room_id",[roomId])]});this.#room={...this.#room,players:p.rows.map(x=>({slot:x.slot,ready:x.ready,userId:x.user_id}))};this.#events.emit("match:update",this.room);});}
  async copyInvite(){if(!this.#room)return false;const url=new URL(location.href);url.searchParams.set("room",this.#room.code);url.searchParams.set("game",this.#room.gameId);try{await navigator.clipboard.writeText(url.toString());return true}catch{return false}}
  leave(){const room=this.room;this.#unsubscribe?.();this.#unsubscribe=null;this.#room=null;this.#events.emit("match:left",room);}
  get room(){return this.#room?{...this.#room,players:this.#room.players.map(p=>({...p}))}:null;}
}
