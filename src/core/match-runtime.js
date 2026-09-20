import { MATCH_STATE,resolveCompetitiveResult } from "./match-contract.js";

export class MatchRuntime{
 #state=MATCH_STATE.WAITING;#config;#startedAt=0;#timer=null;#onState;#onFinish;
 constructor({config,onState,onFinish}={}){this.#config=config||{};this.#onState=onState;this.#onFinish=onFinish;}
 get state(){return this.#state}
 async countdown(){if(this.#state!==MATCH_STATE.WAITING)return;this.#set(MATCH_STATE.COUNTDOWN);await new Promise(r=>this.#timer=setTimeout(r,this.#config.countdownMs??3000));this.#startedAt=Date.now();this.#set(MATCH_STATE.PLAYING);}
 finish(a,b){if(this.#state===MATCH_STATE.FINISHED)return null;clearTimeout(this.#timer);this.#set(MATCH_STATE.FINISHED);const result=resolveCompetitiveResult(a,b);this.#onFinish?.(result);return result;}
 elapsed(){return this.#startedAt?Date.now()-this.#startedAt:0}
 destroy(){clearTimeout(this.#timer);this.#timer=null;}
 #set(state){this.#state=state;this.#onState?.(state);}
}
