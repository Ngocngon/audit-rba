/* ---------- v1.6.4: Key Gemini — báo đúng nguyên nhân Google trả về, tự thử mô hình khác ----------
   Trước đây mọi lỗi 403 đều hiện chung "API key này chưa có quyền dùng mô hình AI".
   Nay đọc thông báo của Google để chỉ đúng cách sửa, và nếu chỉ một mô hình bị chặn thì tự chuyển mô hình khác. */
const GK={why:'',raw:''};
function gkWhy(m){
  m=String(m||'');const host=location.host||'audit-rba.pages.dev';
  if(/leak/i.test(m))return'Google đã khóa key này vì phát hiện key bị lộ công khai. Hãy xóa key cũ, tạo key mới tại aistudio.google.com/apikey rồi dán lại.';
  if(/referer|referrer/i.test(m))return`Key đang giới hạn trang web được phép dùng. Vào console.cloud.google.com → APIs & Services → Credentials → chọn key → Application restrictions: chọn None, hoặc thêm ${host}/* vào Website restrictions. Lưu, đợi 1–2 phút rồi thử lại.`;
  if(/API_KEY_SERVICE_BLOCKED|are blocked|is blocked/i.test(m))return'Key đang giới hạn API, chưa cho phép Gemini. Vào console.cloud.google.com → Credentials → chọn key → API restrictions: chọn Don\'t restrict key, hoặc thêm Generative Language API. Lưu rồi thử lại.';
  if(/SERVICE_DISABLED|has not been used|is disabled|not been enabled|enable it/i.test(m))return'Dự án Google của key chưa bật Gemini API. Mở console.cloud.google.com/apis/library/generativelanguage.googleapis.com, chọn đúng dự án, bấm Enable, đợi 2–3 phút rồi thử lại. Cách nhanh hơn: tạo key mới tại aistudio.google.com/apikey.';
  if(/location|region|country|territor/i.test(m))return'Google chưa cho dùng Gemini API từ vị trí mạng hiện tại. Nếu đang bật VPN hoặc proxy, hãy tắt rồi thử lại.';
  if(/billing|prepay|credit/i.test(m))return'Dự án Google của key cần bật thanh toán hoặc nạp tín dụng cho mô hình này. Thử chọn mô hình Flash hoặc Flash-Lite, hoặc tạo key mới tại aistudio.google.com/apikey.';
  return'';
}
function gkNote(e){
  const m=String(e&&e.message||'');GK.raw=m;GK.why=gkWhy(m);
}
/* Câu báo lỗi no_access: riêng cho Gemini, kèm nguyên nhân Google báo */
{const base=AIERR.no_access;
  Object.defineProperty(AIERR,'no_access',{configurable:true,enumerable:true,get(){
    if(KEY.prov()!=='gemini')return base;
    const raw=GK.raw&&GK.raw!=='no gemini models'?` (Google báo: ${GK.raw.slice(0,160)})`:'';
    return GK.why?`Key Gemini chưa dùng được. ${GK.why}${raw}`:`Key Gemini chưa có quyền dùng mô hình AI. Hãy tạo key mới tại aistudio.google.com/apikey rồi dán lại.${raw}`;
  }});
}
/* Danh sách mô hình: ghi nhận nguyên nhân; nếu bộ lọc loại hết thì nới lỏng */
{const _m=geminiModels;geminiModels=async function(key){
  try{const r=await _m(key);GK.why=GK.raw='';return r}
  catch(e){
    if(e&&e.code==='no_access'&&e.message==='no gemini models'){
      try{const r=await fetch(`${G_BASE}/models?pageSize=1000`,{headers:{'x-goog-api-key':key}}),j=await r.json();
        const all=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).includes('generateContent')).map(m=>m.name.replace(/^models\//,'')).filter(n=>/^gemini-/.test(n)&&!/tts|image|embed|live|audio|veo|imagen/i.test(n)).sort(gRank);
        if(all.length){const flash=all.filter(n=>/flash/.test(n));return{all,main:flash[0]||all[0],deep:all.find(n=>/pro/.test(n))||flash[0]||all[0]}}
      }catch{}
    }
    if(e&&e.code)gkNote(e);throw e}
}}
/* Gọi Gemini: mô hình đang chọn bị chặn (403/404) mà key vẫn hợp lệ thì thử mô hình khác */
{const _c=geminiCall;geminiCall=async function(input,o={}){
  try{return await _c(input,o)}
  catch(e){
    const c=e&&e.code,model=o._model;
    if(c==='no_access')gkNote(e);
    const modelOnly=(c==='no_access'&&!GK.why)||(c==='api_error'&&/not found|not supported|is not available|no longer available|deprecated/i.test(String(e&&e.message||'')));
    if(!modelOnly||o._gkTry)throw e;
    let gm=gModels();if(!gm){try{gm=await geminiModels(KEY.get('gemini'))}catch{throw e}}
    const save=LS.get('soat-ehs-gmodels'),saveMain=LS.get('soat-ehs-gmain');
    const alts=gm.all.filter(n=>n!==model).sort((a,b)=>(/flash/.test(b)?1:0)-(/flash/.test(a)?1:0)).slice(0,3);
    for(const m of alts){
      LS.set('soat-ehs-gmodels',JSON.stringify({...gm,main:m,deep:m}));LS.set('soat-ehs-gmain','');
      try{const r=await _c(input,{...o,_gkTry:1});
        LS.set('soat-ehs-gmodels',JSON.stringify({...gm,main:m,deep:o.modelTier==='complex'?m:(gm.deep===model?m:gm.deep)}));
        GK.why=GK.raw='';if(typeof toast==='function')toast(`Mô hình ${model} bị chặn với key này, đã chuyển sang ${m}.`);return r}
      catch(e2){const c2=e2&&e2.code;if(c2==='no_access')gkNote(e2);if(!(c2==='no_access'||c2==='api_error'))break}
    }
    LS.set('soat-ehs-gmodels',save);LS.set('soat-ehs-gmain',saveMain);throw e;
  }
}}
window.__GK=GK;
