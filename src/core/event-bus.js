export class EventBus {
  #events = new Map();
  on(name, handler) { const set=this.#events.get(name)??new Set(); set.add(handler); this.#events.set(name,set); return()=>this.off(name,handler); }
  off(name, handler) { const set=this.#events.get(name); if(!set)return; set.delete(handler); if(!set.size)this.#events.delete(name); }
  emit(name, detail={}) { this.#events.get(name)?.forEach(handler=>handler(detail)); }
  clear(){ this.#events.clear(); }
}
