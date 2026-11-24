const CACHE='vekaid-shell-v23-13';
const SHELL=['./','./index.html','./manifest.webmanifest','./v23.css?v=23.5.6','./v23-core.js?v=23.5.6','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==self.location.origin)return;
  const appAsset=u.pathname.endsWith('/index.html')||u.pathname.endsWith('/v23.css')||u.pathname.endsWith('/v23-core.js')||u.pathname.endsWith('/manifest.webmanifest')||r.mode==='navigate';
  if(appAsset){
    e.respondWith(fetch(r).then(res=>{if(res&&res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res}).catch(()=>caches.match(r).then(x=>x||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{if(res&&res.ok)caches.open(CACHE).then(k=>k.put(r,res.clone()));return res})));
});