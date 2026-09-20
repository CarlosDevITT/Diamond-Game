const CACHE="diamond-shell-v52";
const OFFLINE="./offline.html";
const SHELL=["./","./index.html",OFFLINE,"./404.html","./assets/styles.css?v=20260920-52","./State.ico"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const req=event.request;if(req.mode==="navigate"){event.respondWith((async()=>{try{const res=await fetch(req);if(res.ok){const cache=await caches.open(CACHE);cache.put(req,res.clone())}return res}catch{return (await caches.match(OFFLINE))||new Response("Sem conexão",{status:503,headers:{"Content-Type":"text/plain;charset=utf-8"}})}})());return;}event.respondWith((async()=>{try{const res=await fetch(req);if(res.ok){const cache=await caches.open(CACHE);cache.put(req,res.clone())}return res}catch{return (await caches.match(req))||Response.error()}})())});
