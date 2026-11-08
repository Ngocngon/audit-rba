"""v15: Người đánh giá nhập gợi ý về lỗi, AI lấy gợi ý làm căn cứ phân tích.

- Thẻ lỗi: mục "Lỗi chưa đúng? Nhập gợi ý cho AI": AI phân tích lại vùng khoanh theo đúng mô tả của người đánh giá
  (không được bác bỏ), viết lại lỗi theo văn phong báo cáo, chọn mã, mức độ, cách khắc phục.
- Mỗi ảnh: "Thêm lỗi AI bỏ sót": nhập mô tả, AI tìm vị trí, khoanh và viết lỗi; lỗi này được giữ khi AI soát lại ảnh.
- Sổ kinh nghiệm ghi lại: lỗi AI viết sai (so với bản đầu của AI) và lỗi AI bỏ sót.

Chạy: python3 patch_v15.py app/v14.html app/soat-anh-ehs-rba.html
"""
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


HINT_RULE = ("CĂN CỨ CỦA NGƯỜI ĐÁNH GIÁ (bắt buộc dùng làm căn cứ): ${hint}\\n"
             "Đây là lỗi người đánh giá đã xác định. Không bác bỏ, không trả \"no_violation\". Đối chiếu căn cứ với hiện trạng trong ảnh và danh mục để: "
             "viết lại \"title\" thành một dòng phát hiện rõ ràng theo văn phong báo cáo (giữ đúng ý người đánh giá, bổ sung chi tiết nhìn thấy trong ảnh); "
             "chọn đúng id hoặc mã, ID yêu cầu, loại lỗi, mức độ, cause, mandatory; viết cách khắc phục cụ thể theo căn cứ. "
             "Nếu ảnh không thể hiện rõ, vẫn ghi theo căn cứ và đặt confidence thấp.")

# 1. Lời nhắc: vùng khoanh có gợi ý; thêm lỗi theo mô tả
rep("const promptRegion=(p,two,f)=>`${BASE(p)}", "const promptRegion=(p,two,f,hint)=>`${BASE(p)}")
rep("${ctx(p)}${f.title?`\\nGợi ý từ người đánh giá: ${f.title}`:''}\n\nChỉ trả về một JSON:\n{\"no_violation\":false,${FIND}}`;",
    "${ctx(p)}${hint?`\\n" + HINT_RULE + "`:f.title?`\\nGợi ý từ người đánh giá: ${f.title}`:''}\n\nChỉ trả về một JSON:\n{\"no_violation\":false,${FIND}}`;\n"
    "const promptHint=(p,hint)=>`${BASE(p)}\nNHIỆM VỤ\nNgười đánh giá xác định ảnh đính kèm có lỗi dưới đây nhưng chưa khoanh vùng. Tìm đúng vị trí lỗi trong ảnh và trả về đúng một lỗi.\n"
    + HINT_RULE + "\\n\"box\" là [x1,y1,x2,y2] bao sát vật thể hoặc vị trí của lỗi, thang 0 đến 1000 trên toàn ảnh, gốc ở góc trên bên trái. Không thấy rõ thì để box bao vùng liên quan nhất.\n${ctx(p)}\n\nChỉ trả về một JSON:\n{${FIND},\"box\":[0,0,0,0]}`;")

# 2. Giữ bản đầu của AI khi phân tích lại theo gợi ý (để sổ kinh nghiệm so sánh)
rep("function fillAI(f,a){", "function fillAI(f,a,keep0){")
rep("  f.ai0={rule:f.rule,code:f.code,req:f.req,sev:f.sev,kind:f.kind};f.learned=false;",
    "  if(!keep0||!f.ai0)f.ai0={rule:f.rule,code:f.code,req:f.req,sev:f.sev,kind:f.kind};f.learned=false;")

# 3. Phân tích lại vùng khoanh theo gợi ý
rep("async function analyzeRegion(p,f){", "async function analyzeRegion(p,f,hint){")
rep("busy(p,'AI đang xác định lỗi trong vùng khoanh…',ctl);",
    "busy(p,hint?'AI đang phân tích lại theo gợi ý của bạn…':'AI đang xác định lỗi trong vùng khoanh…',ctl);if(hint)toast('AI đang phân tích lại theo gợi ý của bạn…');")
rep("    const a=await AI.sample.json(promptRegion(p,two,f),{images:imgs,modelTier:tier(),cache:false,signal:ctl.signal});\n    if(!a||typeof a!=='object')throw{code:'invalid_json'};\n    if(a.no_violation){",
    "    const a=await AI.sample.json(promptRegion(p,two,f,hint),{images:imgs,modelTier:tier(),cache:false,signal:ctl.signal});\n    if(!a||typeof a!=='object')throw{code:'invalid_json'};\n"
    "    if(hint){hist(p);const wasAI=f.src==='ai';fillAI(f,a,true);if(!wasAI)f.src='manual';f.hint=hint;toast('AI đã viết lại lỗi theo gợi ý. Kiểm tra rồi bấm Xác nhận.')}\n    else if(a.no_violation){")

# 4. Thêm lỗi AI bỏ sót theo mô tả
rep("async function analyzeRegion(p,f,hint){",
    r"""async function analyzeHint(p,hint){
  if(!AI.ok){if(!window.claude&&typeof openKey==='function')openKey();else toast(AI.why);return}
  if(p.bgRun)return toast('Ảnh này đang được AI soát ngầm. Chờ xong rồi thêm lỗi.');
  if(S.busy)return toast('AI đang bận, chờ vài giây rồi thử lại.');
  const ctl=new AbortController();busy(p,'AI đang tìm lỗi theo mô tả của bạn…',ctl);toast('AI đang tìm lỗi theo mô tả của bạn…');
  try{
    const a=await AI.sample.json(promptHint(p,hint),{images:[await aiBlob(p)],modelTier:tier(),cache:false,signal:ctl.signal});
    if(!a||typeof a!=='object')throw{code:'invalid_json'};
    hist(p);let s=boxShape(a.box);const lost=!s;if(lost)s={t:'rect',x:.3,y:.3,w:.4,h:.4};
    const f=newFinding(s);fillAI(f,a);f.src='manual';f.user=true;f.hint=hint;p.findings.push(f);Store.touch(p);renderAll();
    toast(lost?'Đã thêm lỗi theo mô tả. AI chưa định vị được, hãy mở ảnh và kéo khung đúng chỗ.':'Đã thêm lỗi theo mô tả. Kiểm tra khung, nội dung rồi bấm Xác nhận.');
  }catch(e){aiFail(e)}finally{busy(null);renderAll()}
}
function hintAdd(p){
  const ta=h('textarea',{rows:2,placeholder:'Mô tả lỗi AI bỏ sót. Ví dụ: Bình chữa cháy bị che chắn, không có biển chỉ dẫn'});
  return h('details',{class:'hintd',onclick:e=>e.stopPropagation()},h('summary',null,'+ Thêm lỗi AI bỏ sót'),
    h('div',{class:'hintb'},ta,h('button',{class:'btn sm primary',onclick:()=>{const t=ta.value.trim();if(!t)return toast('Hãy mô tả lỗi trước.');analyzeHint(p,t)}},'AI tìm, khoanh và viết lỗi')));
}
async function analyzeRegion(p,f,hint){""")

# 5. Thẻ lỗi: mục gợi ý cho AI
rep("    field('Lỗi vi phạm',area(f,'title',2)),\n    h('div',{class:'g2'},field('Loại lỗi'",
    "    field('Lỗi vi phạm',area(f,'title',2)),\n"
    "    (()=>{const ta=h('textarea',{rows:2,value:f.hint||'',placeholder:'Ví dụ: Tủ điện không có biển cảnh báo điện giật, cánh tủ không có dây tiếp địa',oninput:e=>{f.hint=e.target.value;Store.touch(cur())}});\n"
    "      return h('details',{class:'hintd',open:!!(f.hint&&f.hint.trim())},h('summary',null,'Lỗi chưa đúng? Nhập gợi ý cho AI'),\n"
    "        h('div',{class:'hintb'},ta,h('button',{class:'btn sm primary',disabled:!AI.ok||!!S.busy,onclick:()=>{const t=ta.value.trim();if(!t)return toast('Hãy nhập gợi ý trước.');f.hint=t;f.pending=true;renderList();enqueue(()=>analyzeRegion(cur(),f,t))}},'AI phân tích lại theo gợi ý')))})(),\n"
    "    h('div',{class:'g2'},field('Loại lỗi'")

# 6. Danh sách: thêm lỗi AI bỏ sót ở mỗi ảnh và ở chế độ ảnh đang mở
rep("        h('p',{class:'anone'},p.bgRun?'AI đang soát ảnh này…':p.analysis?'AI không thấy lỗi trong ảnh này. Mở ảnh để khoanh vùng nếu cần.':'Ảnh chưa được soát.')));",
    "        h('p',{class:'anone'},p.bgRun?'AI đang soát ảnh này…':p.analysis?'AI không thấy lỗi trong ảnh này. Mở ảnh để khoanh vùng nếu cần.':'Ảnh chưa được soát.'),\n"
    "      p.sample||p.bgRun?null:h('div',{class:'agadd'},hintAdd(p))));")
rep("  if(!p.findings.length)L.append(h('p',{class:'empty',text:'Chưa có vùng vi phạm. Bấm \"AI soát ảnh này\" hoặc dùng công cụ Khung để khoanh vùng.'}));",
    "  if(!p.findings.length)L.append(h('p',{class:'empty',text:'Chưa có vùng vi phạm. Bấm \"AI soát ảnh này\" hoặc dùng công cụ Khung để khoanh vùng.'}));\n"
    "  if(!p.sample&&!p.bgRun)L.append(hintAdd(p));")

# 7. Kiểu
rep(".afoot{display:grid;gap:8px;padding-top:4px}",
    ".afoot{display:grid;gap:8px;padding-top:4px}\n"
    "details.hintd{border:1px dashed var(--line);border-radius:8px;padding:0 10px;background:var(--panel)}\n"
    "details.hintd>summary{cursor:pointer;padding:9px 0;font-size:13px;font-weight:600;color:var(--accent);list-style:none;min-height:40px;display:flex;align-items:center}\n"
    "details.hintd>summary::-webkit-details-marker{display:none}\n"
    ".hintb{display:grid;gap:8px;padding:0 0 10px}\n"
    ".hintb textarea{width:100%;font:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--paper)}\n"
    ".agadd{padding:8px 10px;border-top:1px solid var(--line)}")

rep("Xác định lỗi chính trong vùng khoanh. Nếu vùng không có lỗi thì trả \"no_violation\": true và nêu lý do ở \"evidence\".",
    "${hint?'Phân tích lỗi trong vùng khoanh theo căn cứ của người đánh giá ở dưới.':'Xác định lỗi chính trong vùng khoanh. Nếu vùng không có lỗi thì trả \"no_violation\": true và nêu lý do ở \"evidence\".'}")

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
