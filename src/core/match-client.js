import { client, db, APPWRITE, ID, Query, Permission, Role, ensureSession } from "../services/appwrite.js";

export class MatchClient {
 #events; #room=null; #unsubscribe=null; #user=null; #matchUnsubscribe=null;
 constructor({events}){this.#events=events;}
 async #auth(){if(!this.#user)this.#user=await ensureSession();return this.#user;}
 #map(room,players=[]){return {id:room.$id,code:room.code,gameId:room.game_id,status:room.status,hostUserId:room.host_user_id,players:players.map(p=>({slot:p.slot,ready:p.ready,userId:p.user_id})),createdAt:room.$createdAt};}
 async #players(roomId){const r=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"room_players",queries:[Query.equal("room_id",[roomId])]});return r.rows||[];}
 async create(gameId){
  const user=await this.#auth();
  for(let attempt=0;attempt<5;attempt++){
   const code=Math.random().toString(36).slice(2,8).toUpperCase();
   try{
    const room=await db.createRow({databaseId:APPWRITE.databaseId,tableId:"rooms",rowId:ID.unique(),data:{code,game_id:gameId,host_user_id:user.$id,status:"waiting",mode:"1v1"},permissions:[Permission.read(Role.users()),Permission.update(Role.user(user.$id)),Permission.delete(Role.user(user.$id))]});
    await db.createRow({databaseId:APPWRITE.databaseId,tableId:"room_players",rowId:ID.unique(),data:{room_id:room.$id,user_id:user.$id,slot:"A",ready:true,connected:true},permissions:[Permission.read(Role.users()),Permission.update(Role.user(user.$id)),Permission.delete(Role.user(user.$id))]});
    this.#room=this.#map(room,await this.#players(room.$id));this.#watch(room.$id);this.#events.emit("match:update",this.room);return this.room;
   }catch(e){if(attempt===4||!/unique|duplicate|already/i.test(String(e?.message||"")))throw e;}
  }
 }
 async join(code,gameId){
  const user=await this.#auth(),normalized=String(code||"").trim().toUpperCase();
  const found=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"rooms",queries:[Query.equal("code",[normalized]),Query.limit(1)]});
  const room=found.rows?.[0];if(!room)throw new Error("Sala não encontrada.");
  if(room.game_id!==gameId)throw new Error("Esta sala pertence a outro jogo.");
  if(room.status!=="waiting")throw new Error("Esta sala não está mais disponível.");
  let players=await this.#players(room.$id);
  const existing=players.find(p=>p.user_id===user.$id);
  if(!existing){
   if(players.length>=2)throw new Error("Sala cheia.");
   try{
    await db.createRow({databaseId:APPWRITE.databaseId,tableId:"room_players",rowId:ID.unique(),data:{room_id:room.$id,user_id:user.$id,slot:"B",ready:true,connected:true},permissions:[Permission.read(Role.users()),Permission.update(Role.user(user.$id)),Permission.delete(Role.user(user.$id))]});
   }catch(e){throw new Error("Não foi possível registrar o Jogador B: "+(e?.message||e));}
   players=await this.#players(room.$id);
  }
  this.#room=this.#map(room,players);this.#watch(room.$id);this.#events.emit("match:update",this.room);return this.room;
 }
 async startMatch(){
  const user=await this.#auth();if(!this.#room)throw new Error("Sala indisponível.");if(user.$id!==this.#room.hostUserId)throw new Error("Somente o Jogador A inicia a partida.");
  const players=await this.#players(this.#room.id);if(players.length!==2||!players.every(p=>p.ready))throw new Error("Os dois jogadores precisam estar prontos.");
  const existing=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"matches",queries:[Query.equal("room_id",[this.#room.id]),Query.limit(1)]});
  let row=existing.rows?.[0];if(!row){const a=players.find(p=>p.slot==="A"),b=players.find(p=>p.slot==="B"),seed=crypto.randomUUID();row=await db.createRow({databaseId:APPWRITE.databaseId,tableId:"matches",rowId:ID.unique(),data:{room_id:this.#room.id,game_id:this.#room.gameId,player_a:a.user_id,player_b:b.user_id,status:"countdown",seed,started_at:new Date(Date.now()+4000).toISOString()},permissions:[Permission.read(Role.users()),Permission.update(Role.user(user.$id))]});await db.updateRow({databaseId:APPWRITE.databaseId,tableId:"rooms",rowId:this.#room.id,data:{status:"countdown",seed}});}
  this.#watchMatch(row.$id);this.#events.emit("match:start",row);return row;
 }
 async submitResult({matchId,score,survivalMs}){const user=await this.#auth();const row=await db.getRow({databaseId:APPWRITE.databaseId,tableId:"matches",rowId:matchId});const slot=row.player_a===user.$id?"A":row.player_b===user.$id?"B":null;if(!slot)throw new Error("Jogador não pertence a esta partida.");const data=slot==="A"?{score_a:Math.max(0,Number(score)||0),survival_a_ms:Math.max(0,Number(survivalMs)||0),submitted_a:true}:{score_b:Math.max(0,Number(score)||0),survival_b_ms:Math.max(0,Number(survivalMs)||0),submitted_b:true};await db.updateRow({databaseId:APPWRITE.databaseId,tableId:"matches",rowId:matchId,data});this.#events.emit("match:result-submitted",{slot,...data});setTimeout(()=>this.settleMatch(matchId),250);setTimeout(()=>this.settleMatch(matchId),1200);return slot;}
 async settleMatch(matchId){const user=await this.#auth();const row=await db.getRow({databaseId:APPWRITE.databaseId,tableId:"matches",rowId:matchId});if(row.status==="finished")return row;if(!row.submitted_a||!row.submitted_b)return row;if(user.$id!==row.player_a)return row;const scoreA=Number(row.score_a)||0,scoreB=Number(row.score_b)||0,survivalA=Number(row.survival_a_ms)||0,survivalB=Number(row.survival_b_ms)||0;let winner=null,reason="draw";if(scoreA!==scoreB){winner=scoreA>scoreB?row.player_a:row.player_b;reason="score";}else if(survivalA!==survivalB){winner=survivalA>survivalB?row.player_a:row.player_b;reason="survival";}const finished=await db.updateRow({databaseId:APPWRITE.databaseId,tableId:"matches",rowId:matchId,data:{status:"finished",winner_user_id:winner||null,result_reason:reason,finished_at:new Date().toISOString()}});if(this.#room)await db.updateRow({databaseId:APPWRITE.databaseId,tableId:"rooms",rowId:this.#room.id,data:{status:"finished"}});this.#events.emit("match:state",finished);return finished;}
 async watchCurrentMatch(){if(!this.#room)return null;const r=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"matches",queries:[Query.equal("room_id",[this.#room.id]),Query.limit(1)]});const row=r.rows?.[0];if(row)this.#watchMatch(row.$id);return row||null;}
 #watchMatch(matchId){this.#matchUnsubscribe?.();this.#matchUnsubscribe=client.subscribe([`tablesdb.${APPWRITE.databaseId}.tables.matches.rows.${matchId}`],response=>{const row=response?.payload||response;this.#events.emit("match:state",row);});}
 #watch(roomId){
  this.#unsubscribe?.();
  const refresh=async()=>{if(!this.#room||this.#room.id!==roomId)return;const players=await this.#players(roomId);this.#room={...this.#room,players:players.map(x=>({slot:x.slot,ready:x.ready,userId:x.user_id}))};this.#events.emit("match:update",this.room);};
  this.#unsubscribe=client.subscribe([`tablesdb.${APPWRITE.databaseId}.tables.room_players.rows`],refresh);
  setTimeout(refresh,400);
 }
 async copyInvite(){if(!this.#room)return false;const url=new URL(location.href);url.searchParams.set("room",this.#room.code);url.searchParams.set("game",this.#room.gameId);try{await navigator.clipboard.writeText(url.toString());return true}catch{return false}}
 async setReady(ready=true){const user=await this.#auth();if(!this.#room)return;const rows=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"room_players",queries:[Query.equal("room_id",[this.#room.id]),Query.equal("user_id",[user.$id]),Query.limit(1)]});const row=rows.rows?.[0];if(row)await db.updateRow({databaseId:APPWRITE.databaseId,tableId:"room_players",rowId:row.$id,data:{ready}});}
 leave(){const room=this.room;this.#unsubscribe?.();this.#matchUnsubscribe?.();this.#unsubscribe=null;this.#matchUnsubscribe=null;this.#room=null;this.#events.emit("match:left",room);}
 get room(){return this.#room?{...this.#room,players:this.#room.players.map(p=>({...p}))}:null;}
}