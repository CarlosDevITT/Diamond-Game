import { account } from "./appwrite.js";
import { io } from "https://cdn.jsdelivr.net/npm/socket.io-client@4.8.1/+esm";

const configuredUrl=()=>globalThis.DIAMOND_GAME_SERVER_URL||localStorage.getItem("diamond:game-server-url")||(location.hostname==="localhost"?"http://localhost:3000":"");

export class GameServerClient{
 #socket=null;#handlers=new Map();#seq=0;
 constructor({roomId,playerId}){this.roomId=roomId;this.playerId=playerId;}
 async connect(){
  const url=configuredUrl();if(!url)throw new Error("GAME_SERVER_URL_NOT_CONFIGURED");
  const token=await account.createJWT();const jwt=token.jwt;
  this.#socket=io(url,{transports:["websocket"],auth:{roomId:this.roomId,jwt},reconnection:true,reconnectionAttempts:8,reconnectionDelay:500,reconnectionDelayMax:2500,timeout:8000});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error("GAME_SERVER_TIMEOUT")),9000);this.#socket.once("connect",()=>{clearTimeout(timer);resolve();});this.#socket.once("connect_error",e=>{clearTimeout(timer);reject(e);});});
  for(const [event,set] of this.#handlers)for(const fn of set)this.#socket.on(event,fn);
  return this;
 }
 sendInput(input){if(!this.#socket?.connected)return;this.#socket.emit("player_input",{sequence:++this.#seq,...input});}
 on(event,fn){if(!this.#handlers.has(event))this.#handlers.set(event,new Set());this.#handlers.get(event).add(fn);this.#socket?.on(event,fn);return()=>this.off(event,fn);}
 off(event,fn){this.#handlers.get(event)?.delete(fn);this.#socket?.off(event,fn);}
 close(){this.#socket?.disconnect();this.#socket=null;this.#handlers.clear();}
 get connected(){return Boolean(this.#socket?.connected);}
}
