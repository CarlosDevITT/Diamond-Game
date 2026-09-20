const CACHE="diamond-shell-v51";
const SHELL=["./","./index.html","./offline.html","./404.html","./assets/styles.css?v=20260920-50","./State.ico"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const req=event.request;if(req.mode==="navigate"){event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy));return res}).catch(async()=>await caches.match(req)||await caches.match("./offline.html")));return;}event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res}).catch(()=>caches.match(req)))});
