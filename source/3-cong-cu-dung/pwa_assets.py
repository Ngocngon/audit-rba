"""Tạo manifest, service worker và icon cho bản cài. Chạy: python3 pwa_assets.py pwa VERSION"""
import json, sys
from PIL import Image, ImageDraw, ImageFont
out, ver = sys.argv[1], sys.argv[2]

LOGO = Image.open(sys.argv[3] if len(sys.argv) > 3 else "logo.webp").convert("RGB")
BG = LOGO.getpixel((5, 5))

def icon(size, scale):
    """Logo trên nền cùng màu; scale < 1 chừa lề an toàn cho icon bo tròn (maskable)."""
    im = Image.new("RGB", (size, size), BG)
    n = round(size * scale)
    im.paste(LOGO.resize((n, n), Image.LANCZOS), ((size - n) // 2, (size - n) // 2))
    return im

icon(512, 1.0).save(f"{out}/icon-512.png")
icon(192, 1.0).save(f"{out}/icon-192.png")
icon(512, 0.84).save(f"{out}/icon-maskable-512.png")
icon(180, 1.0).save(f"{out}/apple-touch-icon.png")
BGHEX = "#%02X%02X%02X" % BG

json.dump({
  "name": "Audit RBA", "short_name": "Audit RBA", "lang": "vi",
  "description": "Soát ảnh hiện trường EHS theo RBA Guider, khoanh lỗi và xuất file Findings.",
  "start_url": "./", "scope": "./", "id": "./", "display": "standalone", "orientation": "any",
  "background_color": BGHEX, "theme_color": "#14191C",
  "icons": [
    {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]
}, open(f"{out}/manifest.webmanifest", "w", encoding="utf-8"), ensure_ascii=False, indent=1)

open(f"{out}/sw.js", "w", encoding="utf-8").write("""// Audit RBA: chạy khi mất mạng. Trang chính lấy bản mới khi có mạng, mất mạng thì dùng bản đã lưu.
const V='audit-rba-%s';
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
  const keep=u.origin===location.origin||/(^|\\.)(cdnjs\\.cloudflare\\.com|fonts\\.googleapis\\.com|fonts\\.gstatic\\.com)$/.test(u.hostname);
  if(!keep)return;
  e.respondWith((async()=>{const c=await caches.open(V),hit=await c.match(r);
    const net=fetch(r).then(n=>{if(n&&(n.ok||n.type==='opaque'))c.put(r,n.clone());return n}).catch(()=>null);
    return hit||(await net)||Response.error()})());
});
""" % ver)
print("assets ok")
