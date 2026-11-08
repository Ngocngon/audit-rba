"""Bản app cài lên điện thoại và máy tính (PWA) từ bản Artifact.

- Tài liệu HTML đầy đủ: manifest, icon, meta cho iPhone, service worker để chạy khi mất mạng.
- AI dùng Gemini (Google AI Studio, mức miễn phí) bằng API key lưu trên từng máy; gọi REST có stream,
  systemInstruction cho phần lời nhắc cố định, trả JSON, đổi box_2d sang box; giãn cách lượt gọi 6,5 giây,
  tự chờ khi bị giới hạn (429), báo khi hết lượt trong ngày. Khi mở trong Claude (Artifact) vẫn dùng đường cũ.
- Lưu file trên iPhone qua bảng Chia sẻ (Lưu vào Tệp, Zalo, Mail...).
- Gợi ý cài app (Android: nút Cài app; iPhone: Chia sẻ > Thêm vào MH chính); logo, số phiên bản cạnh tên app.

Chạy: python3 patch_pwa.py <app-nguon.html> <thu-muc-ra>/index.html <PHIEN_BAN>   (ví dụ 1.1)"""
import sys

src, dst, ver = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


# 1. Tài liệu HTML đầy đủ
head_end = s.index("</style>") + len("</style>")
head, body = s[:head_end], s[head_end:]
head = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', "")
s = f"""<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#14191C">
<meta name="description" content="Audit RBA: soát ảnh hiện trường EHS theo RBA Guider, khoanh lỗi và xuất file Findings.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Audit RBA">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
{head}
</head>
<body>{body}
</body>
</html>
"""

rep("<title>Audit RBA</title>", f"<title>Audit RBA v{ver}</title>")
rep('<div class="brand"><b>Audit RBA</b>', f'<img class="applogo" src="icon-192.png" alt="" width="34" height="34"><div class="brand"><b>Audit RBA<small class="ver">v{ver}</small></b>')

# 2. Giao diện: nút Cài đặt AI, gợi ý cài app, hộp thoại key và lưu file
rep('<span class="aimsg" id="aiMsg" hidden></span>',
    '<span class="aimsg" id="aiMsg" hidden></span>\n          <button class="btn sm" id="btnKey" hidden>Cài đặt AI</button>')
rep('<p class="hint inapp" id="inappHint" hidden>',
    '<p class="hint inapp" id="installHint" hidden><span id="installTxt"></span> <button class="btn primary sm" id="btnInstall" hidden>Cài app</button></p>\n'
    '      <p class="hint inapp" id="inappHint" hidden>')
rep('<dialog id="dlgCat">', """<dialog id="dlgKey">
  <div class="dh"><h2>Cài đặt AI</h2><span class="spacer"></span><button class="btn" id="keyX">Đóng</button></div>
  <div class="db stack">
    <div class="provsel" role="radiogroup" aria-label="Chọn AI" hidden>
      <label><input type="radio" name="prov" value="claude"><span><b>Claude</b><small>Anthropic</small></span></label>
      <label><input type="radio" name="prov" value="gemini"><span><b>Gemini</b><small>Google</small></span></label>
    </div>
    <p class="hint" id="provHelp"></p>
    <a class="btn wide keylink" id="provLink" target="_blank" rel="noopener"></a>
    <label class="kf">API key<input id="keyIn" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="sk-ant-…"></label>
    <label class="kf" id="gmRow" hidden>Mô hình Gemini<select id="gmSel"></select></label>
    <div class="kr"><button class="btn primary" id="keySave">Lưu và kiểm tra</button><button class="btn" id="keyDel">Xóa key</button></div>
    <p class="stat" id="keyStat"></p>
    <p class="hint" id="provNote"></p>
    <p class="hint" id="appVer"></p>
  </div>
</dialog>
<dialog id="dlgSave">
  <div class="dh"><h2>File đã sẵn sàng</h2><span class="spacer"></span><button class="btn" id="saveX">Đóng</button></div>
  <div class="db stack">
    <p class="stat" id="saveName"></p>
    <p class="hint">Bấm Lưu hoặc gửi, rồi chọn <b>Lưu vào Tệp</b> để giữ trên máy, hoặc chọn Zalo, Mail để gửi đi.</p>
    <div class="kr"><button class="btn primary" id="saveShare">Lưu hoặc gửi</button><a class="btn" id="saveOpen" target="_blank" rel="noopener">Mở file</a></div>
  </div>
</dialog>
<dialog id="dlgCat">""")
rep("label.add,label.btn{cursor:pointer;",
    ".kf{display:flex;flex-direction:column;gap:4px;font-weight:600}\n"
    ".kf input{font:400 15px/1.3 var(--fb);padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--paper)}\n"
    ".kr{display:flex;gap:8px;flex-wrap:wrap;align-items:center}\n"
    ".kf select{font:400 15px/1.3 var(--fb);padding:9px 10px;border:1px solid var(--line);border-radius:8px;background:var(--paper)}\n"
    ".provsel{display:grid;grid-template-columns:1fr 1fr;gap:8px}\n"
    ".provsel label{position:relative;cursor:pointer}\n"
    ".provsel input{position:absolute;opacity:0;pointer-events:none}\n"
    ".provsel span{display:flex;flex-direction:column;align-items:center;padding:10px;border:1.5px solid var(--line);border-radius:10px;background:var(--paper);line-height:1.25}\n"
    ".provsel small{color:var(--muted);font-size:12px}\n"
    ".provsel input:checked+span{border-color:var(--accent);background:var(--accent-soft)}\n"
    ".provsel input:focus-visible+span{outline:2px solid var(--accent);outline-offset:2px}\n"
    "a.btn{text-decoration:none;display:inline-flex;align-items:center}\n"
    "a.keylink{justify-content:center;min-height:44px;font-weight:600}\n"
    ".box.airow{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:13px}\n"
    ".ailog li{font-size:12px;line-height:1.4}.ailog li.bad{color:var(--pri)}\n"
    ".applogo{width:34px;height:34px;border-radius:8px;flex:none;display:block}\n"
    ".brand .ver{font:600 12px/1 var(--fb);color:var(--muted);text-transform:none;letter-spacing:0;margin-left:5px;vertical-align:3px}\n"
    "#installHint{display:flex;align-items:center;gap:8px;flex-wrap:wrap}\n"
    "#installHint[hidden]{display:none!important}\n"
    "label.add,label.btn{cursor:pointer;")

# Dòng AI ở đầu màn Báo cáo
rep('<div class="hubb">', '<div class="hubb">\n        <div class="box airow" id="aiRow" hidden><span id="aiRowT"></span><button class="btn sm" id="btnKey2">Cài đặt AI</button></div>')

# Nhật ký AI trong màn Báo cáo
rep('<details class="box">\n          <summary><h3>Sổ kinh nghiệm', '<details class="box">\n          <summary><h3>Nhật ký AI</h3></summary>\n          <p class="hint">40 lần gọi AI gần nhất trên máy này: loại việc, chế độ, mô hình, thời gian, kết quả. Khi AI chạy không tốt, chụp màn hình phần này gửi người hỗ trợ.</p>\n          <ul class="rep ailog" id="aiLog"></ul>\n        </details>\n        <details class="box">\n          <summary><h3>Sổ kinh nghiệm')

# 3. Lời nhắn nói về tài khoản Claude
rep("Sổ lưu theo tài khoản Claude của bạn.",
    "Sổ lưu trên máy này. Muốn dùng ở máy khác, xuất gói nhóm rồi nhập ở máy đó.")
rep("hay gặp khi mở link trong Zalo, Messenger hoặc app Claude), hãy mở link bằng Safari trên iPhone hoặc Chrome trên Android.",
    "hay gặp khi mở link trong Zalo hoặc Messenger), hãy mở link bằng Safari trên iPhone hoặc Chrome trên Android rồi cài app.")
rep("Bạn đang chạm giới hạn lượt dùng Claude. Hãy thử lại sau ít phút.",
    "Đang chạm giới hạn lượt gọi AI. Hãy thử lại sau ít phút.")

# 4. AI qua Claude API khi không chạy trong Claude
API = r"""/* ---------- AI qua Claude API (bản cài trên điện thoại) ---------- */
const LS={get(k){try{return localStorage.getItem(k)||''}catch{return ''}},set(k,v){try{v?localStorage.setItem(k,v):localStorage.removeItem(k)}catch{}}};
const KEYN={claude:'soat-ehs-key',gemini:'soat-ehs-gkey'};
const KEY={prov(){return 'gemini'},setProv(p){LS.set('soat-ehs-ai',p==='gemini'?'gemini':'')},
  get(p){return LS.get(KEYN[p||KEY.prov()])},set(v,p){LS.set(KEYN[p||KEY.prov()],v)}};
const API_URL='https://api.anthropic.com/v1/messages',API_MODEL='claude-opus-5-5',EFFORT={quick:'low',default:'medium',complex:'high'};
let API_FB=true;
const SPLIT_H='\nTHÔNG TIN RIÊNG CHO LẦN SOÁT NÀY\n';
const blobB64=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=()=>rej(r.error);r.readAsDataURL(b)});
function parseAIJSON(t){
  t=String(t||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/```\s*$/,'');
  try{return JSON.parse(t)}catch{}
  const a=[t.indexOf('{'),t.indexOf('[')].filter(i=>i>=0),i=a.length?Math.min(...a):-1,j=Math.max(t.lastIndexOf('}'),t.lastIndexOf(']'));
  if(i>=0&&j>i){try{return JSON.parse(t.slice(i,j+1))}catch{}}
  throw{code:'invalid_json'}
}
function apiErr(st,m){
  if(st===401)return'bad_key';if(st===403)return'no_access';if(st===429)return'rate_limited';if(st===413)return'prompt_too_large';
  if(st===529)return'overloaded';if(st>=500)return'upstream_error';
  if(/credit|billing|balance/i.test(m))return'no_credit';if(/image/i.test(m))return'image_rejected';if(/too long|too large|prompt is/i.test(m))return'prompt_too_large';
  return'api_error'
}
async function claudeCall(input,o={}){
  const key=KEY.get('claude');if(!key)throw{code:'no_key'};
  const content=[];
  for(const b of o.images||[])content.push({type:'image',source:{type:'base64',media_type:b.type||'image/jpeg',data:await blobB64(b)}});
  let sys='';if(typeof input==='string'){const k=input.indexOf(SPLIT_H);if(k>0){sys=input.slice(0,k);input=input.slice(k+1)}}
  const msgs=typeof input==='string'?[{role:'user',content:[...content,{type:'text',text:input}]}]
    :input.map((m,i)=>i===input.length-1&&m.role==='user'?{role:'user',content:[...content,{type:'text',text:m.content}]}:m);
  const body={model:API_MODEL,max_tokens:32000,stream:true,output_config:{effort:EFFORT[o.modelTier]||'medium'},messages:msgs};
  if(sys)body.system=[{type:'text',text:sys,cache_control:{type:'ephemeral'}}];
  const hd={'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'};
  if(API_FB){body.fallbacks='default';hd['anthropic-beta']='server-side-fallback-2026-07-01'}
  let r;
  try{r=await fetch(API_URL,{method:'POST',headers:hd,body:JSON.stringify(body),signal:o.signal})}
  catch(e){throw{code:e&&e.name==='AbortError'?'cancelled':'upstream_error'}}
  if(!r.ok){
    let m='';try{const j=await r.json();m=(j&&j.error&&j.error.message)||''}catch{}
    if(r.status===400&&API_FB&&/fallback|anthropic-beta|beta/i.test(m)){API_FB=false;return claudeCall(input,o)}
    throw{code:apiErr(r.status,m),message:m}
  }
  const rd=r.body.getReader(),dec=new TextDecoder();let buf='',text='',stop='';
  try{
    for(;;){
      const{done,value}=await rd.read();if(done)break;
      buf+=dec.decode(value,{stream:true}).replace(/\r\n/g,'\n');let k;
      while((k=buf.indexOf('\n\n'))>=0){
        const ev=buf.slice(0,k);buf=buf.slice(k+2);
        const line=ev.split('\n').find(l=>l.startsWith('data:'));if(!line)continue;
        let d;try{d=JSON.parse(line.slice(5))}catch{continue}
        if(d.type==='content_block_delta'&&d.delta&&d.delta.type==='text_delta'){text+=d.delta.text;if(o.onText)o.onText({text,delta:d.delta.text})}
        else if(d.type==='message_delta'&&d.delta&&d.delta.stop_reason)stop=d.delta.stop_reason;
        else if(d.type==='error')throw{code:d.error&&d.error.type==='overloaded_error'?'overloaded':'upstream_error'};
      }
    }
  }catch(e){if(e&&e.name==='AbortError')throw{code:'cancelled'};throw e&&e.code?e:{code:'upstream_error'}}
  if(stop==='refusal')throw{code:'refused'};
  if(!text.trim())throw{code:'empty_completion'};
  return{text,truncated:stop==='max_tokens'}
}
/* ---------- Gemini (Google AI Studio) ---------- */
const G_BASE='https://generativelanguage.googleapis.com/v1beta';let G_TC=true;
/* Gói miễn phí giới hạn khoảng 10 lượt/phút: các lượt gọi cách nhau ít nhất G_GAP; bị 429 thì chờ đúng thời gian Google báo */
let G_NEXT=0,G_PAUSE=0;const G_GAP=6500;
async function gGate(signal){
  for(;;){const now=Date.now(),t=Math.max(G_NEXT,G_PAUSE);if(t<=now){G_NEXT=now+G_GAP;return}
    await new Promise((res,rej)=>{const k=setTimeout(res,Math.min(t-now,5000));if(signal)signal.addEventListener('abort',()=>{clearTimeout(k);rej({code:'cancelled'})},{once:true})});
    if(signal&&signal.aborted)throw{code:'cancelled'}}
}
const G_SKIP=/transcribe|customtools|tts|image|embed|live|audio|aqa|learnlm|gemma|robotics|computer|native|nano|veo|imagen/i;
const gVer=n=>{const m=n.match(/gemini-(\d+(?:\.\d+)?)/);return m?parseFloat(m[1]):0};
const gPre=n=>/preview|exp/.test(n)?1:0,gRank=(a,b)=>gPre(a)-gPre(b)||gVer(b)-gVer(a)||a.localeCompare(b);
function gErr(st,m){
  if(/API_KEY_INVALID|API key not valid|API key expired/i.test(m)||st===401)return'bad_key';
  if(st===403)return'no_access';if(st===429)return'rate_limited';if(st===503||st===529)return'overloaded';if(st>=500)return'upstream_error';
  if(/billing|quota/i.test(m))return'no_credit';if(/image|inline_data|mime/i.test(m))return'image_rejected';if(/token|too long|too large/i.test(m))return'prompt_too_large';
  return'api_error'
}
async function geminiModels(key){
  let r;try{r=await fetch(`${G_BASE}/models?pageSize=1000`,{headers:{'x-goog-api-key':key}})}catch{throw{code:'upstream_error'}}
  if(!r.ok){let m='';try{const j=await r.json();m=(j&&j.error&&j.error.message)||''}catch{}throw{code:gErr(r.status,m),message:m}}
  const j=await r.json();
  const all=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>m.name.replace(/^models\//,'')).filter(n=>/^gemini-/.test(n)&&!G_SKIP.test(n)).sort(gRank);
  if(!all.length)throw{code:'no_access',message:'no gemini models'};
  const flash=all.filter(n=>/flash/.test(n)&&!/lite/.test(n)),lite=all.filter(n=>/lite/.test(n)),pro=all.filter(n=>/pro/.test(n));
  return{all,main:(flash[0]||lite[0]||pro[0]||all[0]),deep:(pro[0]||flash[0]||all[0])}
}
function gModels(){try{return JSON.parse(LS.get('soat-ehs-gmodels')||'null')}catch{return null}}
async function geminiCall(input,o={}){
  const key=KEY.get('gemini');if(!key)throw{code:'no_key'};
  let gm=gModels();if(!gm){gm=await geminiModels(key);LS.set('soat-ehs-gmodels',JSON.stringify(gm))}
  const model=o.modelTier==='complex'?gm.deep:(LS.get('soat-ehs-gmain')||gm.main);
  let text=typeof input==='string'?input:input.filter(m=>m.role==='user').map(m=>m.content).join('\n\n'),sys='';
  {const k=text.indexOf(SPLIT_H);if(k>0){sys=text.slice(0,k);text=text.slice(k+1)}}
  if(/"box":\[0,0,0,0\]/.test(text))text+='\n\nĐỊNH DẠNG KHUNG: với mỗi lỗi, ngoài "box" hãy ghi thêm "box_2d" là [ymin, xmin, ymax, xmax] theo thang 0 đến 1000 trên toàn ảnh.';
  const parts=[];for(const b of o.images||[])parts.push({inline_data:{mime_type:b.type||'image/jpeg',data:await blobB64(b)}});parts.push({text});
  const tc=o.modelTier==='quick'&&G_TC?(/gemini-2\.5-flash/.test(model)?{thinkingBudget:512}:/gemini-[3-9]/.test(model)?{thinkingLevel:'low'}:null):null;
  const body={...(sys?{systemInstruction:{parts:[{text:sys}]}}:{}),contents:[{role:'user',parts}],generationConfig:{maxOutputTokens:32768,...(o.json?{responseMimeType:'application/json'}:{}),...(tc?{thinkingConfig:tc}:{})}};
  o._model=model;await gGate(o.signal);
  let r;
  try{r=await fetch(`${G_BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify(body),signal:o.signal})}
  catch(e){throw{code:e&&e.name==='AbortError'?'cancelled':'upstream_error'}}
  if(!r.ok){let m='',j=null;try{j=await r.json();m=(j&&j.error&&j.error.message)||''}catch{}
    if(r.status===400&&tc&&/thinking/i.test(m)){G_TC=false;return geminiCall(input,o)}
    if(r.status===429){let wait=30000,day=/per.?day|PerDay|daily/i.test(m);
      try{for(const d of(j.error.details||[])){if(d.retryDelay)wait=Math.ceil(parseFloat(d.retryDelay)*1000)+800;for(const v of d.violations||[])if(/PerDay/i.test(v.quotaId||''))day=true}}catch{}
      G_PAUSE=Date.now()+wait;throw{code:day?'quota_day':'rate_limited',wait,message:m}}
    if(r.status===404){LS.set('soat-ehs-gmodels','');LS.set('soat-ehs-gmain','')}
    throw{code:gErr(r.status,m),message:m}}
  const rd=r.body.getReader(),dec=new TextDecoder();let buf='',out='',fin='',blocked=false;
  try{
    for(;;){const{done,value}=await rd.read();if(done)break;
      buf+=dec.decode(value,{stream:true}).replace(/\r\n/g,'\n');let k;
      while((k=buf.indexOf('\n\n'))>=0){const ev=buf.slice(0,k);buf=buf.slice(k+2);
        const line=ev.split('\n').find(l=>l.startsWith('data:'));if(!line)continue;let d;try{d=JSON.parse(line.slice(5))}catch{continue}
        if(d.promptFeedback&&d.promptFeedback.blockReason)blocked=true;
        const c=d.candidates&&d.candidates[0];if(!c)continue;if(c.finishReason)fin=c.finishReason;
        for(const p of(c.content&&c.content.parts)||[])if(p.text&&!p.thought){out+=p.text;if(o.onText)o.onText({text:out,delta:p.text})}}}
  }catch(e){if(e&&e.name==='AbortError')throw{code:'cancelled'};throw e&&e.code?e:{code:'upstream_error'}}
  if(blocked||/SAFETY|PROHIBITED|BLOCKLIST|RECITATION/.test(fin))throw{code:'refused'};
  if(!out.trim())throw{code:'empty_completion'};
  return{text:out,truncated:fin==='MAX_TOKENS'}
}
function fixBoxes(d){
  const fix=a=>{if(a&&Array.isArray(a.box_2d)&&a.box_2d.length>=4){const[y1,x1,y2,x2]=a.box_2d.map(Number);if([y1,x1,y2,x2].every(Number.isFinite))a.box=[x1,y1,x2,y2]}};
  if(d&&Array.isArray(d.findings))d.findings.forEach(fix);else if(d&&typeof d==='object')fix(d);return d
}
const AILOG=(()=>{try{return JSON.parse(localStorage.getItem('soat-ehs-ailog')||'[]')}catch{return[]}})();
function aiLog(x){AILOG.unshift({at:Date.now(),...x});AILOG.length=Math.min(AILOG.length,40);try{localStorage.setItem('soat-ehs-ailog',JSON.stringify(AILOG))}catch{}if(typeof renderAiLog==='function')renderAiLog()}
const AIKIND=t=>/Rút ra các yêu cầu có thể kiểm tra bằng ẢNH/.test(t)?'Đọc tài liệu':/NHIỆM VỤ\nSoát/.test(t)?'Soát ảnh':/xác định ảnh đính kèm có lỗi/.test(t)?'Lỗi theo mô tả':/đã khoanh một vùng/.test(t)?(/CĂN CỨ CỦA NGƯỜI ĐÁNH GIÁ/.test(t)?'Vùng khoanh theo gợi ý':'Vùng khoanh'):/^Dịch/.test(t)?'Dịch':/một chữ/.test(t)?'Kiểm tra key':'Khác';
const MODEVN={quick:'Nhanh',default:'Chuẩn',complex:'Kỹ'};
const apiCall=async(i,o={})=>{const t0=Date.now(),kind=AIKIND(typeof i==='string'?i:'');
  try{const r=await geminiCall(i,o);aiLog({kind,mode:MODEVN[o.modelTier]||'',model:o._model||'',ms:Date.now()-t0,ok:true});return r}
  catch(e){if(!(e&&e.code==='cancelled'))aiLog({kind,mode:MODEVN[o.modelTier]||'',model:o._model||'',ms:Date.now()-t0,ok:false,code:e&&e.code||'',msg:String(e&&e.message||'').slice(0,180)});throw e}};
const API_SAMPLE=Object.assign((i,o)=>apiCall(i,o),{json:async(i,o={})=>{const g=KEY.prov()==='gemini',d=parseAIJSON((await apiCall(i,{...o,json:true})).text);return g?fixBoxes(d):d},limits:async()=>({images:{maxCount:2}})});
const NOKEY='Chưa có key Gemini nên AI chưa chạy. Bấm Cài đặt AI để lấy key miễn phí bằng tài khoản Google. Bạn vẫn khoanh vùng, chọn lỗi từ danh mục và xuất file được.';
async function apiReady(){
  await null;AI.sample=API_SAMPLE;AI.max=2;AI.par=2;LS.set('soat-ehs-key','');LS.set('soat-ehs-ai','');
  if(KEY.get()){AI.ok=true;AI.state='ready';AI.why='';uiState()}else aiOff(NOKEY);
  return null
}
const ready=(async()=>{
  if(!window.claude)return apiReady();"""
rep("const ready=(async()=>{\n  if(!window.claude){aiOff('AI chỉ chạy khi mở app trong Claude. Bạn vẫn khoanh vùng, chọn lỗi từ danh mục và xuất file được.');return null}", API)

rep("prompt_too_large:'Nội dung gửi đi quá dài. Hãy rút ngắn ghi chú.'};",
    "prompt_too_large:'Nội dung gửi đi quá dài. Hãy rút ngắn ghi chú.',"
    "no_key:NOKEY_T,bad_key:'API key không đúng hoặc đã bị xóa. Bấm Cài đặt AI để nhập lại.',"
    "no_access:'API key này chưa có quyền dùng mô hình AI. Hãy kiểm tra key trong trang quản lý (console.anthropic.com hoặc aistudio.google.com).',"
    "no_credit:'Key Gemini đã hết hạn mức. Kiểm tra tại aistudio.google.com.',"
    "quota_day:'Đã hết lượt AI miễn phí trong ngày của Gemini. Lượt được cấp lại khoảng 15:00 giờ Việt Nam. Có thể chọn mô hình Flash-Lite trong Cài đặt AI để có thêm lượt.',"
    "overloaded:'Máy chủ AI đang quá tải. Hãy thử lại sau ít phút.',api_error:'AI báo lỗi yêu cầu. Hãy thử lại.'};")
rep("const AIERR={", "const NOKEY_T='Chưa có API key. Bấm Cài đặt AI để nhập key.';\nconst AIERR={")
rep("toast(AIERR[c]||AIERR.upstream_error)}",
    "toast(AIERR[c]||AIERR.upstream_error);if((c==='bad_key'||c==='no_key')&&!window.claude){KEY.set(c==='bad_key'?'':KEY.get());aiOff(NOKEY);openKey()}}")

# nút Cài đặt AI luôn hiện ở bản cài
rep("const m=$('aiMsg');m.hidden=AI.state!=='off';m.textContent=AI.why;uiExtra();",
    "const m=$('aiMsg');m.hidden=AI.state!=='off';m.textContent=AI.why;$('btnKey').hidden=!!window.claude;if(!window.claude){$('aiRow').hidden=false;const pv=KEY.prov(),k=KEY.get();$('aiRowT').textContent=`AI: Gemini (Google, miễn phí) · ${k?'key …'+k.slice(-4):'chưa có key'}`}uiExtra();")

# chưa có key: nút AI vẫn bấm được và mở Cài đặt AI
rep("$('btnAI').disabled=!AI.ok||b||!p;",
    "const noKey=!window.claude&&!AI.ok;$('btnAI').disabled=(!AI.ok&&!noKey)||b||!p;")
rep("$('btnAI').querySelector('span').textContent=p&&p.analysis&&!p.sample?'AI soát lại':'AI soát ảnh này';",
    "$('btnAI').querySelector('span').textContent=noKey?'Nhập API key để AI soát':p&&p.analysis&&!p.sample?'AI soát lại':'AI soát ảnh này';")
rep("  if(!AI.ok){toast(AI.why);return false}",
    "  if(!AI.ok){if(!window.claude){openKey();return false}toast(AI.why);return false}")

# 5. Lưu file: iPhone dùng bảng Chia sẻ
rep("  if(window.claude){toast('Khung xem này không cho tải file.');return}\n",
    "  if(window.claude){toast('Khung xem này không cho tải file.');return}\n"
    "  if(IOS){const f=new File([blob],name,{type:blob.type||'application/octet-stream'});\n"
    "    if(navigator.canShare&&navigator.canShare({files:[f]})){try{await navigator.share({files:[f]});return}catch(e){if(e&&e.name==='AbortError')return}}\n"
    "    return offerSave(f)}\n")

# 6. Trình xem trong app: bỏ qua khi đang chạy dạng app đã cài
rep("function inApp(){const u=navigator.userAgent||'';return ",
    "function inApp(){const u=navigator.userAgent||'';if(STANDALONE())return false;return ")

# 7. Cài app, service worker, cài đặt key
BOOT = r"""/* ---------- Bản cài trên điện thoại: cài app, chạy khi mất mạng, cài đặt AI ---------- */
const APP_VER='__VER__';
const IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const STANDALONE=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
function offerSave(f){
  const d=$('dlgSave'),u=URL.createObjectURL(f);$('saveName').textContent=f.name;$('saveOpen').href=u;$('saveOpen').download=f.name;
  $('saveShare').hidden=!(navigator.canShare&&navigator.canShare({files:[f]}));
  $('saveShare').onclick=async()=>{try{await navigator.share({files:[f]});d.close()}catch(e){if(!(e&&e.name==='AbortError'))toast('Không mở được bảng chia sẻ. Hãy bấm Mở file.')}};
  d.onclose=()=>setTimeout(()=>URL.revokeObjectURL(u),6e4);if(!d.open)d.showModal()
}
const PROV={
  claude:{ph:'sk-ant-…',help:'<b>Người dùng mới:</b> 1. Bấm nút bên dưới, đăng ký hoặc đăng nhập Anthropic. 2. Nạp tiền ở mục Billing. 3. Bấm <b>Create Key</b>, sao chép key và dán vào ô bên dưới. AI dùng mô hình Claude Opus 5.5.',link:'https://console.anthropic.com/settings/keys',linkT:'Mở trang lấy key Claude',
    note:'Mỗi lần soát tính tiền vào tài khoản Anthropic. Nên đặt hạn mức chi tiêu trong console. Ảnh hiện trường được gửi tới Anthropic để phân tích.'},
  gemini:{ph:'AIza…',help:'<b>Người dùng mới:</b> 1. Bấm nút bên dưới, đăng nhập tài khoản Google. 2. Bấm <b>Create API key</b> (lần đầu chọn hoặc tạo một dự án). 3. Sao chép key và dán vào ô bên dưới. Có mức dùng miễn phí.',link:'https://aistudio.google.com/apikey',linkT:'Mở trang lấy key Gemini',
    note:'Gemini có mức dùng miễn phí. Ở mức miễn phí, Google có thể dùng dữ liệu gửi lên để cải thiện dịch vụ; hãy bật thanh toán cho dự án nếu ảnh thuộc diện bảo mật của khách hàng. Ảnh hiện trường được gửi tới Google để phân tích.'}};
function gmFill(){const gm=gModels(),sel=$('gmSel');sel.replaceChildren();$('gmRow').hidden=KEY.prov()!=='gemini'||!gm;if(!gm)return;
  const cur=LS.get('soat-ehs-gmain')||gm.main;for(const n of gm.all)sel.append(h('option',{value:n,selected:n===cur},n+(n===gm.main?' (đề xuất)':/lite/.test(n)?' (nhiều lượt hơn nhưng dễ bỏ sót lỗi)':'')))}
function renderAiLog(){const L=$('aiLog');if(!L)return;L.replaceChildren(...(AILOG.length?AILOG.map(x=>h('li',{class:x.ok?'':'bad'},`${new Date(x.at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} · ${x.kind}${x.mode?' · '+x.mode:''}${x.model?' · '+x.model:''} · ${(x.ms/1000).toFixed(1)} giây · ${x.ok?'xong':'lỗi '+x.code+(x.msg?': '+x.msg:'')}`)):[h('li',null,'Chưa có lần gọi AI nào.')]))}
function keyStat(){const k=KEY.get();$('keyStat').textContent=k?`Đã lưu key …${k.slice(-4)}.`:'Chưa có key.'}
function provUI(){const p=KEY.prov(),c=PROV[p];for(const r of document.querySelectorAll('input[name=prov]'))r.checked=r.value===p;
  $('provHelp').innerHTML=c.help;$('provLink').href=c.link;$('provLink').textContent=c.linkT+' ↗';$('provNote').textContent=c.note;$('keyIn').placeholder=c.ph;$('keyIn').value='';keyStat();gmFill()}
function aiReadyNow(){if(KEY.get()){AI.sample=API_SAMPLE;AI.ok=true;AI.state='ready';AI.why='';uiState()}else aiOff(NOKEY)}
function openKey(){if(window.claude)return;const d=$('dlgKey');provUI();$('appVer').textContent=`Phiên bản ${APP_VER}`;if(!d.open)d.showModal()}
async function saveKey(){
  const p=KEY.prov(),v=$('keyIn').value.trim();if(!v&&!KEY.get())return toast('Hãy dán API key.');
  const old=KEY.get();if(v)KEY.set(v);
  $('keySave').disabled=true;$('keyStat').textContent='Đang kiểm tra key…';
  try{
    if(p==='gemini'){const gm=await geminiModels(KEY.get());LS.set('soat-ehs-gmodels',JSON.stringify(gm));if(!gm.all.includes(LS.get('soat-ehs-gmain')))LS.set('soat-ehs-gmain','')}
    await apiCall('Trả lời đúng một chữ: OK',{modelTier:'quick'});aiReadyNow();
    $('keyIn').value='';keyStat();gmFill();$('keyStat').textContent+=' Kiểm tra thành công, AI đã sẵn sàng.';toast('AI đã sẵn sàng.')}
  catch(e){const c=e&&e.code;if(c==='bad_key'){KEY.set(old)}
    $('keyStat').textContent=(c==='bad_key'?'Key không đúng, chưa lưu. ':c==='upstream_error'&&!navigator.onLine?'Đang mất mạng, key đã lưu, sẽ dùng khi có mạng. ':(AIERR[c]||'Chưa kiểm tra được key, key đã lưu.')+' ')+(KEY.get()?`Key đang dùng: …${KEY.get().slice(-4)}.`:'');
    gmFill();if(KEY.get()&&c!=='bad_key')aiReadyNow()}
  finally{$('keySave').disabled=false}
}
if(!window.claude){
  $('btnKey').onclick=openKey;$('btnKey2').onclick=openKey;setTimeout(renderAiLog,0);$('keyX').onclick=()=>$('dlgKey').close();$('keySave').onclick=saveKey;
  $('keyIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();saveKey()}});
  for(const r of document.querySelectorAll('input[name=prov]'))r.addEventListener('change',()=>{if(!r.checked)return;KEY.setProv(r.value);provUI();aiReadyNow();toast(`Đã chuyển sang ${r.value==='gemini'?'Gemini':'Claude'}.`)});
  $('gmSel').onchange=e=>{const gm=gModels();LS.set('soat-ehs-gmain',gm&&e.target.value===gm.main?'':e.target.value);toast('Đã đổi mô hình Gemini.')};
  $('keyDel').onclick=()=>{KEY.set('');if(KEY.prov()==='gemini'){LS.set('soat-ehs-gmodels','');LS.set('soat-ehs-gmain','')}provUI();aiOff(NOKEY);toast('Đã xóa API key khỏi máy này.')};
  $('saveX').onclick=()=>$('dlgSave').close();
  let bip=null;const hint=$('installHint');
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();bip=e;$('installTxt').textContent='Cài Audit RBA lên màn hình chính để mở nhanh như app.';$('btnInstall').hidden=false;hint.hidden=false});
  $('btnInstall').onclick=async()=>{if(!bip)return;bip.prompt();try{await bip.userChoice}catch{}bip=null;hint.hidden=true};
  addEventListener('appinstalled',()=>{hint.hidden=true;toast('Đã cài app. Mở từ biểu tượng Audit RBA trên màn hình chính.')});
  if(IOS&&!STANDALONE()&&!inApp()){$('installTxt').innerHTML='Cài app: bấm nút <b>Chia sẻ</b> của Safari, chọn <b>Thêm vào MH chính</b>. Sau đó mở app từ biểu tượng Audit RBA.';hint.hidden=false}
  if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
  if('serviceWorker' in navigator&&location.protocol!=='file:'){
    navigator.serviceWorker.register('sw.js').then(reg=>{
      reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)toast('Đã có bản mới. Đóng app rồi mở lại để dùng.')})})
    }).catch(()=>{})
  }
}
"""
rep("async function importFiles(list){", BOOT.replace("__VER__", ver) + "async function importFiles(list){")

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
