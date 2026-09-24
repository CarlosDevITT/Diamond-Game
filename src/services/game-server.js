import { account } from "./appwrite.js";
import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.8.1/+esm";

const configuredUrl=()=>globalThis.DIAMOND_GAME_SERVER_URL||localStorage.getItem("diamond:game-server-url")||(location.hostname==="localhost"?"http://localhost:3000":"https://diamond-game-server-v2-production.up.railway.app");
const replayEvents=new Set(["game_config","match_state","match_countdown","match_start","match_finished"]);

export class GameServerClient{
 #socket=null;#handlers=new Map();#dispatchers=new Map();#cache=new Map();#seq=0;
 constructor({roomId,playerId,desiredDurationMs}){this.roomId=roomId;this.playerId=playerId;this.desiredDurationMs=desiredDurationMs;}
 #bind(event){
  if(!this.#socket||this.#dispatchers.has(event))return;
  const dispatch=(payload)=>{
   if(replayEvents.has(event))this.#cache.set(event,payload);
   for(const fn of this.#handlers.get(event)||[])fn(payload);
  };
  this.#dispatchers.set(event,dispatch);this.#socket.on(event,dispatch);
 }
 async connect(){
  const url=configuredUrl();if(!url)throw new Error("GAME_SERVER_URL_NOT_CONFIGURED");
  const token=await account.createJWT();const jwt=token.jwt;
  this.#socket=io(url,{transports:["websocket","polling"],tryAllTransports:true,auth:{roomId:this.roomId,jwt,desiredDurationSeconds:this.desiredDurationMs?this.desiredDurationMs/1000:undefined},reconnection:true,reconnectionAttempts:8,reconnectionDelay:500,reconnectionDelayMax:2500,timeout:8000,autoConnect:false});
  for(const event of replayEvents)this.#bind(event);
  for(const event of this.#handlers.keys())this.#bind(event);
  const ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error("GAME_SERVER_TIMEOUT")),9000);this.#socket.once("connect",()=>{clearTimeout(timer);resolve();});this.#socket.once("connect_error",e=>{clearTimeout(timer);reject(e);});});
  this.#socket.connect();await ready;return this;
 }
 sendInput(input){if(!this.#socket?.connected)return;this.#socket.emit("player_input",{sequence:++this.#seq,...input});}
 sendAction(action,payload={}){if(!this.#socket?.connected)return false;this.#socket.emit("player_action",{sequence:++this.#seq,action,...payload});return true;}
 on(event,fn){
  if(!this.#handlers.has(event))this.#handlers.set(event,new Set());
  this.#handlers.get(event).add(fn);this.#bind(event);
  if(this.#cache.has(event)){const payload=this.#cache.get(event);queueMicrotask(()=>{if(this.#handlers.get(event)?.has(fn))fn(payload);});}
  return()=>this.off(event,fn);
 }
 off(event,fn){this.#handlers.get(event)?.delete(fn);}
 close(){for(const [event,fn] of this.#dispatchers)this.#socket?.off(event,fn);this.#socket?.disconnect();this.#socket=null;this.#handlers.clear();this.#dispatchers.clear();this.#cache.clear();}
 get connected(){return Boolean(this.#socket?.connected);}
}
