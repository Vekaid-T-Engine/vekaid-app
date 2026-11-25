const CACHE='vekaid-shell-v23-50';
const SHELL=['./','./index.html','./manifest.webmanifest','./v23.css?v=23.42.0','./v23-core.js?v=23.42.0','./locale-lessons.js?v=23.42.0','./locale-lab.js?v=23.42.0','./certifications.js?v=23.42.0','./playbook.js?v=23.42.0','./playbook.md','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./locales/en.json?v=23.42.0','./locales/de.json?v=23.42.0','./locales/zh-Hans.json?v=23.42.0','./locales/es.json?v=23.42.0','./locales/it.json?v=23.42.0','./locales/pt.json?v=23.42.0','./locales/ja.json?v=23.42.0','./locales/ko.json?v=23.42.0','./locales/ar.json?v=23.42.0','./locales/ru.json?v=23.42.0','./locales/hi.json?v=23.42.0','./locales/tr.json?v=23.42.0','./locales/vi.json?v=23.42.0','./locales/nl.json?v=23.42.0','./locales/id.json?v=23.42.0'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('vekaid-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==self.location.origin)return;
  if(u.pathname.endsWith('/daily-briefing.json')||u.pathname.endsWith('/release.json'))return;
  const appAsset=u.pathname.endsWith('/index.html')||u.pathname.endsWith('/v23.css')||u.pathname.endsWith('/v23-core.js')||u.pathname.endsWith('/locale-lessons.js')||u.pathname.endsWith('/playbook.js')||u.pathname.endsWith('/playbook.md')||u.pathname.endsWith('/certifications.js')||u.pathname.endsWith('/manifest.webmanifest')||r.mode==='navigate';
  if(appAsset){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res}).catch(()=>caches.match(r).then(x=>x||(r.mode==='navigate'?caches.match('./index.html'):Response.error()))));
    return;
  }
  e.respondWith(caches.match(r).then(c=>c||fetch(r).then(res=>{if(res&&res.ok)caches.open(CACHE).then(k=>k.put(r,res.clone()));return res})));
});