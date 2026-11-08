// Audit RBA: chạy khi mất mạng. Trang chính lấy bản mới khi có mạng, mất mạng thì dùng bản đã lưu.
const V='audit-rba-1.1';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
const CDN=['https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(V);await c.addAll(SHELL);
  for(const u of CDN){try{await c.put(u,await fetch(u,{mode:'no-cors'}))}catch{}}
  self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==V)await caches.delete(k);await self.clients.claim()})())});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.hostname==='api.anthropic.com')return;
  if(r.mode==='navigate'){e.respondWith((async()=>{const c=await caches.open(V);
    try{const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),5000);const n=await fetch(r,{signal:ctl.signal});clearTimeout(t);if(n.ok)c.put('index.html',n.clone());return n}
    catch{return (await c.match('index.html'))||(await c.match('./'))||Response.error()}})());return}
  const keep=u.origin===location.origin||/(^|\.)(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(u.hostname);
  if(!keep)return;
  e.respondWith((async()=>{const c=await caches.open(V),hit=await c.match(r);
    const net=fetch(r).then(n=>{if(n&&(n.ok||n.type==='opaque'))c.put(r,n.clone());return n}).catch(()=>null);
    return hit||(await net)||Response.error()})());
});
