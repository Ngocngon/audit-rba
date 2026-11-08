"""v10: giao diện điện thoại gọn hơn, đổi tên tab, soát nhiều ảnh song song, phần cố định của lời nhắc tách riêng để AI dùng lại.

- Tab "Khoanh vùng" đổi thành "Kiểm tra vi phạm".
- Thẻ lỗi: phần hay dùng (lỗi, loại, mức độ, khắc phục, nút xác nhận) ở trên; mã RBA, pháp lý, hạn gom vào mục thu gọn.
- Màn Báo cáo: mỗi phần là một mục mở/đóng; chỉ Thông tin audit và Xuất báo cáo mở sẵn.
- Soát tất cả: soát 3 ảnh cùng lúc, lỗi tạm thời tự thử lại một lần, ảnh lỗi không chặn ảnh khác.
- Lời nhắc AI: danh mục cố định đứng trước, phần riêng của từng ảnh (kinh nghiệm, khu vực) đứng sau dòng THÔNG TIN RIÊNG CHO LẦN SOÁT NÀY.

Chạy: python3 patch_v10.py app/v9.html app/soat-anh-ehs-rba.html
"""
import re
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


# 1. Đổi tên tab
rep("Điện thoại: thanh tab dưới, mỗi màn hình một việc: Ảnh, Khoanh vùng, Lỗi, Báo cáo.",
    "Điện thoại: thanh tab dưới, mỗi màn hình một việc: Ảnh, Kiểm tra vi phạm, Lỗi, Báo cáo.")
rep('<section class="edit" aria-label="Khoanh vùng vi phạm">', '<section class="edit" aria-label="Kiểm tra vi phạm">')
rep('</svg>Khoanh vùng</button>', '</svg><span class="tl">Kiểm tra vi phạm</span></button>')
rep("  .tabbar svg.i{width:24px;height:24px}",
    "  .tabbar svg.i{width:24px;height:24px}\n  .tabbar .tl{display:block;text-align:center;line-height:1.15;max-width:100%}")

# 2. Thẻ lỗi gọn: phần chính ở trên, chi tiết thu gọn
OLD_FORM_START = "  return h('div',{class:'form',onclick:e=>e.stopPropagation()},\n"
i = s.index(OLD_FORM_START)
j = s.index("\n}\nfunction renderList(){", i)
NEW_FORM = r"""  const due=dueOf(f);
  const more=h('details',{class:'more',open:MORE.has(f.id),ontoggle:e=>{e.currentTarget.open?MORE.add(f.id):MORE.delete(f.id)}},
    h('summary',null,h('b',null,'Mã RBA, pháp lý, hạn khắc phục'),h('small',null,[f.req||f.code||'Chưa chọn mã',due?`hạn ${vnDate(due)}`:null].filter(Boolean).join(' · '))),
    h('div',{class:'more-in'},
      f.ev||f.src==='ai'?field('Nhìn thấy trong ảnh',area(f,'ev',2)):null,
      field('Mã RBA',codeSel),
      h('div',{class:'g2'},field('Cause of occurrence',h('select',{'aria-label':'Nguyên nhân',onchange:e=>{f.cause=e.target.value;Store.touch(cur())}},CAUSE.map(c=>h('option',{value:c,selected:c===(f.cause||'Administrative')},c)))),
        h('label',{class:'chk'},h('input',{type:'checkbox',checked:f.mand,onchange:e=>{f.mand=e.target.checked;Store.touch(cur())}}),'Mandatory violation')),
      field('Yêu cầu trong Guider',reqSel),
      field('Căn cứ pháp lý (tra từ file RBA)',area(f,'law',2)),lawSel,
      field('Improvement Date (hạn khắc phục)',h('input',{type:'date',value:due,onchange:e=>{f.due=e.target.value;Store.touch(cur());renderList()}}))));
  return h('div',{class:'form',onclick:e=>e.stopPropagation()},
    field('Lỗi vi phạm',area(f,'title',2)),
    h('div',{class:'g2'},field('Loại lỗi',h('select',{'aria-label':'Loại lỗi',onchange:e=>{f.kind=e.target.value;Store.touch(cur());renderList()}},Object.entries(KINDS).map(([k,v])=>h('option',{value:k,selected:k===kindOf(f)},v)))),field('Mức độ',sevSel)),
    field('Khắc phục: xử lý ngay',area(f,'fixNow',2)),
    field('Khắc phục: triệt để',area(f,'fixRoot',2)),
    h('div',{class:'acts'},
      h('button',{class:'btn good',onclick:()=>{f.ok=!f.ok;if(f.ok)learn(f,cur());Store.touch(cur());renderAll()}},f.ok?'Đã xác nhận':'Xác nhận lỗi'),
      h('button',{class:'btn',disabled:!AI.ok||!!S.busy,onclick:()=>{f.pending=true;renderList();enqueue(()=>analyzeRegion(cur(),f))}},'AI phân tích lại'),
      h('button',{class:'btn',onclick:()=>openCat()},'Chọn từ danh mục'),
      h('button',{class:'btn danger',onclick:()=>askDelete(f)},'Xóa')),
    more);"""
s = s[:i] + NEW_FORM + s[j:]
rep("function cardForm(f){", "const MORE=new Set();\nfunction cardForm(f){")
rep(".acts{display:flex;flex-wrap:wrap;gap:6px}",
    ".acts{display:flex;flex-wrap:wrap;gap:6px}\n"
    ".form details.more{border:1px solid var(--line);border-radius:8px;background:var(--soft);padding:0 10px}\n"
    ".form details.more>summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:1fr auto;align-items:center;column-gap:8px;padding:9px 0;min-height:44px}\n"
    ".form details.more>summary::-webkit-details-marker{display:none}\n"
    ".form details.more>summary b{font-size:13px;font-weight:600}\n"
    ".form details.more>summary small{grid-column:1;font-size:12px;color:var(--muted)}\n"
    ".form details.more>summary::after{content:\"\";grid-column:2;grid-row:1/span 2;width:8px;height:8px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg);margin-right:4px}\n"
    ".form details.more[open]>summary::after{transform:rotate(-135deg)}\n"
    ".form .more-in{display:grid;gap:8px;padding:2px 0 12px}\n"
    "@media (max-width:760px){.form .acts{display:grid;grid-template-columns:1fr 1fr}.form .acts .good{grid-column:1/-1}}")

# 3. Màn Báo cáo: các phần mở/đóng
hs = s.index('<div class="hubb">')
he = s.index("</section>\n    </div>", hs) if "</section>\n    </div>" in s[hs:] else None
part = s[hs:]
opens = {"Thông tin audit": True, "Xuất báo cáo": True}
out, pos, count = [], 0, 0
pat = re.compile(r'<section class="box">\n(\s*)<h3>(.*?)</h3>')
while True:
    m = pat.search(part, pos)
    if not m:
        break
    title = re.sub(r"<[^>]+>", "", m.group(2)).strip()
    op = " open" if any(title.startswith(k) for k in opens) else ""
    out.append(part[pos:m.start()])
    out.append(f'<details class="box"{op}>\n{m.group(1)}<summary><h3>{m.group(2)}</h3></summary>')
    end = part.index("</section>", m.end())
    out.append(part[m.end():end])
    out.append("</details>")
    pos = end + len("</section>")
    count += 1
out.append(part[pos:])
assert count == 5, count
s = s[:hs] + "".join(out)
rep(".box h3{margin:0;", "details.box{display:block}\n"
    "details.box>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:32px}\n"
    "details.box>summary::-webkit-details-marker{display:none}\n"
    "details.box>summary::after{content:\"\";flex:none;width:8px;height:8px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg);margin:-4px 4px 0 0}\n"
    "details.box[open]>summary::after{transform:rotate(-135deg);margin-top:4px}\n"
    "details.box>:not(summary){margin-top:10px}\n"
    "details.box>.g2+label,details.box>label+label{margin-top:10px}\n"
    ".box h3{margin:0;")

# 4. Lời nhắc: phần cố định trước, phần riêng của từng ảnh sau
rep("${lessonsFor(p)}DANH MỤC LỖI (id", "DANH MỤC LỖI (id")
rep("${CODEDIR()}\n`;", "${CODEDIR()}\n\nTHÔNG TIN RIÊNG CHO LẦN SOÁT NÀY\n${lessonsFor(p)}`;")

# 5. Tách phần ghi kết quả AI để dùng chung cho soát một ảnh và soát nhiều ảnh
a = s.index("    if(!data||!Array.isArray(data.findings))throw{code:'invalid_json'};\n    hist(p);")
b_tok = "    Store.touch(p);if(cur()===p)S.sel=null;renderAll();\n"
b = s.index(b_tok, a) + len(b_tok)
block = s[a:b]
s = s[:a] + "    const{keep,drop,lost}=applyWhole(p,data);\n" + s[b:]
rep("async function analyzePhoto(p,label){",
    "function applyWhole(p,data){\n" + block + "  return{keep,drop,lost}\n}\nasync function analyzePhoto(p,label){")

# 6. Soát tất cả: 3 ảnh cùng lúc
rep("function runAll(ps){if(!ps.length)return toast('Mọi ảnh đều đã được soát.');enqueue(async()=>{for(const[i,p]of ps.entries()){if(!await analyzePhoto(p,`Ảnh ${i+1}/${ps.length}`))break}})}",
    r"""const PAR=3,HARD=['bad_key','no_key','no_credit','no_access',...AIOFF];
function runAll(ps){
  if(!ps.length)return toast('Mọi ảnh đều đã được soát.');
  if(!AI.ok)return toast(AI.why);
  enqueue(async()=>{
    const ctl=new AbortController(),n=ps.length;let i=0,done=0,okN=0,found=0,last=null,stop=false;const failed=[];
    const msg=()=>`AI đang soát ${n} ảnh, ${Math.min(PAR,n)} ảnh cùng lúc: xong ${done}/${n}…`;
    busy(cur(),msg(),ctl);
    const one=async p=>{
      for(let t=0;t<2;t++){
        if(ctl.signal.aborted)return;
        try{const data=await AI.sample.json(promptWhole(p),{images:[await aiBlob(p)],modelTier:tier(),cache:false,signal:ctl.signal});found+=applyWhole(p,data).keep.length;okN++;return}
        catch(e){const c=e&&e.code;if(c==='cancelled'||ctl.signal.aborted)return;
          if(t===0&&navigator.onLine&&['rate_limited','overloaded','upstream_error','invalid_json','empty_completion'].includes(c)){await new Promise(r=>setTimeout(r,c==='rate_limited'?20000:3000));continue}
          last=e;failed.push(p);if(HARD.includes(c)){stop=true;ctl.abort()}return}
      }
    };
    const worker=async()=>{while(i<n&&!stop&&!ctl.signal.aborted){const p=ps[i++];await one(p);done++;if(S.busy)$('ovMsg').textContent=msg()}};
    try{await Promise.all(Array.from({length:Math.min(PAR,n)},worker))}finally{busy(null)}
    renderAll();
    if(stop&&last)return aiFail(last);
    if(ctl.signal.aborted)return toast(`Đã dừng. Đã soát ${okN}/${n} ảnh.`);
    if(failed.length&&!okN)return aiFail(last);
    toast(`Đã soát ${okN}/${n} ảnh, AI đề xuất ${found} lỗi.${failed.length?` ${failed.length} ảnh chưa soát được, bấm Soát tất cả để thử lại.`:''} Hãy kiểm tra từng ảnh rồi xác nhận.`);
  });
}""")

# 7. Thông tin audit đã điền thì thu gọn khi mở app
rep("metaLoad();setTool('select');await Store.open();Learn.load();",
    "metaLoad();setTool('select');await Store.open();Learn.load();\n  if($('mUnit').value.trim()){const d=$('mUnit').closest('details');if(d)d.open=false}")

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
