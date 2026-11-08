"""v13: Thư viện lỗi từ báo cáo cũ + AI soát kỹ hơn.

- Nạp file Findings cũ (.xlsm/.xlsx, mẫu SEV/T hoặc file app xuất): lấy mã, khu vực, lỗi, khắc phục (Việt và Anh), ảnh thu nhỏ.
- AI dùng thư viện làm danh sách kiểm tra và mẫu văn phong; câu tiếng Anh cũ được dùng lại khi xuất file.
- AI liệt kê tối đa 10 lỗi, ngưỡng chắc chắn 60, rà ảnh theo từng nhóm mối nguy; chế độ mặc định Chuẩn.

Chạy: python3 patch_v13.py app/v12.html app/soat-anh-ehs-rba.html
"""
import sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:90])
    s = s.replace(a, b)


# 1. Giao diện thư viện trong màn Báo cáo
rep('        <details class="box">\n          <summary><h3>Sổ kinh nghiệm',
    '''        <details class="box" id="libBox">
          <summary><h3>Thư viện lỗi từ báo cáo cũ <span id="libN"></span></h3></summary>
          <p class="hint">Nạp các file Findings cũ (.xlsm, .xlsx). App lấy mã, khu vực, nội dung lỗi, cách khắc phục, câu tiếng Anh và ảnh. AI dùng thư viện làm danh sách kiểm tra, viết lỗi theo văn phong cũ; file xuất dùng lại câu tiếng Anh cũ.</p>
          <div class="g2"><label class="btn" id="btnLibIn" for="libFile" role="button" tabindex="0">Nạp file Findings cũ</label><button class="btn" id="btnLibOut">Xuất thư viện</button></div>
          <p class="stat" id="libStat"></p>
          <input id="libQ" type="search" placeholder="Tìm: tủ điện, bình chữa cháy, BH201…" aria-label="Tìm trong thư viện">
          <ul class="libl" id="libList"></ul>
          <button class="btn danger" id="btnLibClear">Xóa thư viện</button>
        </details>
        <details class="box">
          <summary><h3>Sổ kinh nghiệm''')
rep('<input type="file" id="gdFile"',
    '<input type="file" id="libFile" class="vh" accept=".xlsm,.xlsx,.json,application/json,application/vnd.ms-excel.sheet.macroEnabled.12,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" multiple tabindex="-1">\n<input type="file" id="gdFile"')
rep(".box h3{margin:0;",
    "#libQ{width:100%;font:inherit;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--paper)}\n"
    ".libl{list-style:none;margin:0;padding:0;display:grid;gap:8px;max-height:420px;overflow:auto}\n"
    ".libl li{display:grid;grid-template-columns:56px 1fr;gap:10px;align-items:start;font-size:13px;line-height:1.4}\n"
    ".libl li.nt{grid-template-columns:1fr}\n"
    ".libl img{width:56px;height:56px;object-fit:cover;border-radius:6px;background:var(--soft)}\n"
    ".libl b{font-weight:700}.libl small{display:block;color:var(--muted);font-size:12px}\n"
    ".box h3{margin:0;")

# 2. Thư viện: đọc file Findings, lưu, tìm, đưa vào lời nhắc AI
LIB = r"""/* ---------- Thư viện lỗi từ báo cáo cũ ---------- */
const VI_RE=/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
const LIB_SKIP=/^(vấn đề hiện trường cải tiến|nội dung cần cải tiến là gì|ảnh up|công đoạn nào@?)$/i;
const libNorm=t=>String(t||'').toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
/* Tách ô "English / Tiếng Việt" (một hoặc nhiều dòng, có thể đánh số 1., 2.) thành từng mục {code,en,vi} */
function biItems(t){
  t=String(t||'').replace(/\r/g,'').trim();if(!t)return[];
  const lines=t.split('\n').map(x=>x.trim()).filter(Boolean),num=/^(\d+)[.)]\s*/;
  if(lines.filter(l=>num.test(l)).length>=1&&num.test(lines[0])){
    const by=new Map();let k=null,lang='en';
    for(let l of lines){const m=l.match(num);if(m){k=m[1];l=l.slice(m[0].length)}if(k==null)continue;
      if(!by.has(k))by.set(k,{en:[],vi:[],code:''});const it=by.get(k);
      const c=l.match(/^\(([A-Z]{2}\d{3})\)\s*/);if(c){it.code=c[1];l=l.slice(c[0].length)}
      lang=VI_RE.test(l)?'vi':(m?'en':lang);it[lang].push(l.replace(/^[-•]\s*/,''))}
    return[...by.values()].map(x=>({code:x.code,en:x.en.join(' ').trim(),vi:x.vi.join(' ').trim()}));
  }
  let parts=lines;if(parts.length===1&&/\s\/\s/.test(t))parts=t.split(/\s+\/\s+/).map(x=>x.trim()).filter(Boolean);
  const it={code:'',en:'',vi:''};
  for(let l of parts){l=l.replace(/^[-•]\s*/,'');const c=l.match(/^\(([A-Z]{2}\d{3})\)\s*/);if(c){it.code=c[1];l=l.slice(c[0].length)}
    if(VI_RE.test(l))it.vi=(it.vi+' '+l).trim();else it.en=(it.en+' '+l).trim()}
  return[it];
}
const xmlDoc=s=>new DOMParser().parseFromString(s,'application/xml');
const tagAll=(n,t)=>[...n.getElementsByTagNameNS('*',t)];
const relPath=(base,t)=>{if(t.startsWith('/'))return t.slice(1);const p=base.split('/');p.pop();for(const s of t.split('/')){if(s==='..')p.pop();else if(s&&s!=='.')p.push(s)}return p.join('/')};
const colN=ref=>{let n=0;for(const ch of ref.replace(/\d+/g,''))n=n*26+ch.charCodeAt(0)-64;return n-1};
async function zipText(z,p){const f=z.file(p);return f?f.async('string'):null}
async function relsOf(z,part){const i=part.lastIndexOf('/'),rp=part.slice(0,i)+'/_rels/'+part.slice(i+1)+'.rels',t=await zipText(z,rp);const m={};if(t)for(const r of tagAll(xmlDoc(t),'Relationship'))m[r.getAttribute('Id')]={t:relPath(part,r.getAttribute('Target')),type:r.getAttribute('Type')||''};return m}
async function thumbOfBlob(b){try{const bmp=await createImageBitmap(b),k=Math.min(1,220/Math.max(bmp.width,bmp.height)),c=mk(bmp.width*k,bmp.height*k);c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);if(bmp.close)bmp.close();return c.toDataURL('image/jpeg',.72)}catch{return''}}
async function parseFindings(file){
  const z=await JSZip.loadAsync(file),wb=await zipText(z,'xl/workbook.xml');if(!wb)return[];
  const wrels=await relsOf(z,'xl/workbook.xml'),sst=[];
  const ssx=await zipText(z,'xl/sharedStrings.xml');if(ssx)for(const si of tagAll(xmlDoc(ssx),'si'))sst.push(tagAll(si,'t').map(t=>t.textContent).join(''));
  const sheets=tagAll(xmlDoc(wb),'sheet').map(n=>({name:n.getAttribute('name')||'',rid:n.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id')||n.getAttribute('r:id')}));
  sheets.sort((a,b)=>(/findings/i.test(b.name)?1:0)-(/findings/i.test(a.name)?1:0));
  for(const sh of sheets){
    const part=wrels[sh.rid]&&wrels[sh.rid].t;if(!part)continue;const sx=await zipText(z,part);if(!sx)continue;
    const rows=new Map();
    for(const r of tagAll(xmlDoc(sx),'row')){const ri=+r.getAttribute('r'),o={};
      for(const c of tagAll(r,'c')){const t=c.getAttribute('t'),v=tagAll(c,'v')[0];let val='';
        if(t==='s'&&v)val=sst[+v.textContent]||'';else if(t==='inlineStr')val=tagAll(c,'t').map(x=>x.textContent).join('');else if(v)val=v.textContent;
        if(val!=='')o[colN(c.getAttribute('r'))]=val}
      if(Object.keys(o).length)rows.set(ri,o)}
    const keys=[...rows.keys()].sort((a,b)=>a-b);
    const hr=keys.find(k=>Object.values(rows.get(k)).some(v=>/point of issue/i.test(v)));if(hr==null)continue;
    const H=rows.get(hr),col=re=>{for(const[k,v]of Object.entries(H))if(re.test(v))return+k;return-1};
    const C={code:col(/audit\s*id/i),loc:col(/process name|location/i),issue:col(/point of issue/i),cause:col(/cause/i),mand:col(/mandatory/i),plan:col(/improvement plan/i),photo:col(/problem photo\s*1|photo\s*1/i)};
    let vendor='',date='';for(const k of keys){if(k>=hr)break;const o=rows.get(k),e=Object.entries(o);for(let i=0;i<e.length;i++){if(/vendor name/i.test(e[i][1])&&e[i+1])vendor=e[i+1][1];if(/audit date/i.test(e[i][1])&&e[i+1])date=e[i+1][1]}}
    // ảnh trong cột Problem Photo 1 theo dòng
    const pics=new Map();
    try{const srel=await relsOf(z,part);for(const r of Object.values(srel)){if(!/drawing$/.test(r.type))continue;const dx=await zipText(z,r.t);if(!dx)continue;const drel=await relsOf(z,r.t),d=xmlDoc(dx);
      for(const a of[...tagAll(d,'twoCellAnchor'),...tagAll(d,'oneCellAnchor')]){const fr=tagAll(a,'from')[0],bl=tagAll(a,'blip')[0];if(!fr||!bl)continue;
        const cc=+tagAll(fr,'col')[0].textContent,rr=+tagAll(fr,'row')[0].textContent+1,id=bl.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','embed')||bl.getAttribute('r:embed');
        if((C.photo<0||cc===C.photo)&&!pics.has(rr)&&drel[id])pics.set(rr,drel[id].t)}}}catch(e){console.error(e)}
    const out=[];
    for(const k of keys){if(k<=hr)continue;const o=rows.get(k),iss=o[C.issue];if(!iss||LIB_SKIP.test(iss.trim()))continue;
      const its=biItems(iss),fx=biItems(o[C.plan]),lc=biItems(o[C.loc])[0]||{en:'',vi:''};let th='';
      if(pics.has(k)){const pp=pics.get(k),f=z.file(pp),ext=(pp.match(/\.(png|jpe?g|gif|bmp|webp)$/i)||[])[1];if(f&&ext)th=await thumbOfBlob(new Blob([await f.async('arraybuffer')],{type:'image/'+ext.toLowerCase().replace('jpg','jpeg')}))}
      its.forEach((it,i)=>{const fi=fx.length===its.length?fx[i]:fx.length===1?fx[0]:{en:'',vi:''};
        const code=(it.code||String(o[C.code]||'').trim().toUpperCase()).match(/^[A-Z]{2}\d{3}$/)?(it.code||String(o[C.code]).trim().toUpperCase()):'';
        if(!it.vi&&!it.en)return;
        out.push({code,vi:it.vi,en:it.en,fixVi:fi.vi,fixEn:fi.en,loc:lc.vi||lc.en,locEn:lc.en,cause:String(o[C.cause]||'').trim(),mand:/mandatory/i.test(o[C.mand]||''),vendor,date,file:file.name,th:i===0?th:''})});
    }
    if(out.length)return out;
  }
  return[];
}
const Lib={items:[],seq:1,
  async load(){let v=await Store.kvGet('library');if(!v)try{v=JSON.parse(localStorage.getItem('soat-ehs-lib')||'null')}catch{}
    if(v&&Array.isArray(v.items)){this.items=v.items;this.seq=v.seq||this.items.length+1}this.seedTR();libRender()},
  save(){const v={items:this.items,seq:this.seq};if(Store.db)Store.kvSet('library',v);else try{localStorage.setItem('soat-ehs-lib',JSON.stringify({...v,items:v.items.map(x=>({...x,th:''}))}))}catch{toast('Bộ nhớ trình duyệt đầy, thư viện chưa lưu được.')}},
  merge(rows){let add=0,dup=0;const idx=new Map(this.items.map(x=>[x.code+'|'+libNorm(x.vi||x.en),x]));
    for(const r of rows){const k=r.code+'|'+libNorm(r.vi||r.en),o=idx.get(k);
      if(o){dup++;if(o.file!==r.file)o.n=(o.n||1)+(r.n||1);if(!o.th&&r.th)o.th=r.th;for(const f of['en','fixVi','fixEn','loc','locEn'])if(!o[f]&&r[f])o[f]=r[f];continue}
      const x={id:'T'+this.seq++,n:r.n||1,...r};delete x.files;this.items.push(x);idx.set(k,x);add++}
    return{add,dup}},
  seedTR(){let n=0;for(const x of this.items)for(const[a,b]of[[x.vi,x.en],[x.fixVi,x.fixEn],[x.loc,x.locEn]])if(a&&b&&a!==b&&!TR.has(a)){TR.set(a,b);n++}if(n)saveTR()}
};
function libFor(p){
  if(!Lib.items.length)return '';
  const words=t=>new Set(libNorm(t).split(' ').filter(w=>w.length>2));
  const ctx=words([p&&p.area,p&&p.note,p&&p.analysis&&p.analysis.scene].filter(Boolean).join(' '));
  const pick=Lib.items.map(x=>{let s=0;for(const w of words(x.vi+' '+x.loc))if(ctx.has(w))s++;return{x,s:s*3+Math.log2(1+(x.n||1))}}).sort((a,b)=>b.s-a.s).slice(0,45).map(o=>o.x).sort((a,b)=>a.code.localeCompare(b.code));
  const cut=(t,n)=>t.length>n?t.slice(0,n-1)+'…':t;
  return `LỖI ĐÃ GHI NHẬN TRONG CÁC BÁO CÁO CŨ (chuyên gia đã xác nhận; dùng làm danh sách kiểm tra và mẫu văn phong)
- Rà từng lỗi dưới đây: ảnh có tình huống tương tự thì phải báo. Dùng đúng mã như mẫu (nếu danh mục không có id khớp thì "rule":"KHAC" và "rba_code" theo mẫu).
- Viết "title" và cách khắc phục theo văn phong các mẫu: câu ngắn, nêu đúng vật thể và hiện trạng nhìn thấy, không chung chung. Nếu hiện trạng giống hệt mẫu thì dùng lại đúng câu chữ của mẫu.
${pick.map(x=>`- [${x.code||'?'}] ${cut(x.vi||x.en,170)}${x.loc?` (khu: ${cut(x.loc,40)})`:''}${x.fixVi?` → khắc phục: ${cut(x.fixVi,120)}`:''}`).join('\n')}

`;
}
let libDel=0;
function libRender(){
  const L=$('libList');if(!L)return;const q=libNorm($('libQ').value),its=Lib.items.filter(x=>!q||libNorm(`${x.code} ${x.vi} ${x.en} ${x.loc} ${x.fixVi}`).includes(q));
  $('libN').textContent=Lib.items.length?`(${Lib.items.length})`:'';
  const files=new Set(Lib.items.map(x=>x.file).filter(Boolean)),cnt={};for(const x of Lib.items)if(x.code)cnt[x.code]=(cnt[x.code]||0)+(x.n||1);
  const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([c,n])=>`${c} (${n})`).join(', ');
  $('libStat').textContent=Lib.items.length?`${Lib.items.length} lỗi từ ${files.size} file. Gặp nhiều nhất: ${top}.`:'Chưa có lỗi nào. Bấm Nạp file Findings cũ để bắt đầu.';
  $('btnLibOut').disabled=$('btnLibClear').disabled=!Lib.items.length;$('libQ').hidden=!Lib.items.length;
  L.replaceChildren(...its.slice(0,60).map(x=>h('li',{class:x.th?'':'nt'},x.th?h('img',{src:x.th,alt:'',loading:'lazy'}):null,
    h('div',null,h('b',null,`[${x.code||'?'}] `),x.vi||x.en,h('small',null,[x.loc,x.fixVi&&'Khắc phục: '+x.fixVi,(x.n||1)>1&&`gặp ${x.n} lần`,x.vendor].filter(Boolean).join(' · '))))),
    ...(its.length>60?[h('li',{class:'nt'},h('small',null,`Còn ${its.length-60} lỗi khác, gõ từ khóa để lọc.`))]:[]));
}
async function libImport(fs){
  if(fs.some(f=>!/\.json$/i.test(f.name))&&!window.JSZip)return toast('Thư viện đọc file chưa tải xong. Hãy thử lại sau vài giây.');
  let add=0,dup=0;const bad=[];
  for(const[i,f]of fs.entries()){toast(`Đang đọc file ${i+1}/${fs.length}: ${f.name}`);
    try{let rows;
      if(/\.json$/i.test(f.name)){const j=JSON.parse(await f.text());if(j.kind!=='findings-library'||!Array.isArray(j.items))throw new Error('not library');rows=j.items}
      else rows=await parseFindings(f);
      if(!rows.length){bad.push(f.name);continue}const r=Lib.merge(rows);add+=r.add;dup+=r.dup}
    catch(e){console.error(e);bad.push(f.name)}}
  Lib.save();Lib.seedTR();libRender();
  toast(`Đã thêm ${add} lỗi vào thư viện${dup?`, gộp ${dup} lỗi trùng`:''}.${bad.length?` Không đọc được: ${bad.join(', ')}.`:''}`);
}
$('libFile').onchange=e=>{const fs=[...e.target.files];e.target.value='';if(fs.length)libImport(fs)};
$('libQ').oninput=libRender;
$('btnLibOut').onclick=()=>saveFile(`Thu-vien-loi_${today()}.json`,new Blob([JSON.stringify({app:'soat-anh-ehs',kind:'findings-library',v:1,items:Lib.items})],{type:'application/json'}));
$('btnLibClear').onclick=()=>{const b=$('btnLibClear');if(Date.now()-libDel>4000){libDel=Date.now();b.textContent='Bấm lần nữa để xóa';setTimeout(()=>{b.textContent='Xóa thư viện'},4000);return}
  Lib.items=[];Lib.save();libRender();b.textContent='Xóa thư viện';toast('Đã xóa thư viện lỗi trên máy này.')};
"""
rep("function lessonsFor(p){", LIB + "function lessonsFor(p){")
rep("await Store.open();Learn.load();", "await Store.open();Learn.load();Lib.load();")

# 3. Lời nhắc: thêm thư viện vào phần riêng; rà theo nhóm; tối đa 10 lỗi; ngưỡng 60
rep("THÔNG TIN RIÊNG CHO LẦN SOÁT NÀY\n${lessonsFor(p)}`;", "THÔNG TIN RIÊNG CHO LẦN SOÁT NÀY\n${lessonsFor(p)}${libFor(p)}`;")
rep("1. Quan sát: chỉ dùng điều nhìn thấy trong ảnh.",
    "1. Quan sát: chỉ dùng điều nhìn thấy trong ảnh. Rà kỹ toàn bộ ảnh, cả góc ảnh, nền và vật nhỏ, lần lượt theo từng nhóm: PCCC và lối thoát nạn; điện (tủ điện, áp tô mát, dây, ổ cắm, tiếp địa); hóa chất, bình khí và chất thải; máy móc, che chắn, khóa an toàn; lối đi, sắp xếp, vật có thể rơi đổ; PPE và thao tác của người lao động; biển báo, nhãn, sơ đồ, bảng quản lý; môi trường (nước thải, khí thải, tràn đổ); vệ sinh, nhà ăn, tiện nghi. Nhóm nào thấy vấn đề thì ghi thành lỗi.")
rep("điều chưa chắc (confidence dưới 70).", "điều chưa chắc (confidence dưới 60).")
rep("liệt kê tối đa 6 lỗi gồm cả vi phạm và mối nguy tiềm ẩn", "liệt kê tối đa 10 lỗi gồm cả vi phạm và mối nguy tiềm ẩn")
rep("for(const a of data.findings.slice(0,8)){", "for(const a of data.findings.slice(0,12)){")
rep("MIN_CONF=70;", "MIN_CONF=60;")
# bộ nhớ dịch lớn hơn để chứa câu tiếng Anh từ thư viện
rep("JSON.stringify([...TR].slice(-400))", "JSON.stringify([...TR].slice(-3000))")
# chế độ mặc định Chuẩn
rep("const tier=()=>$('optMode').value||'quick';", "const tier=()=>$('optMode').value||'default';")
rep("$('optMode').value=localStorage.getItem('soat-ehs-mode')||'quick';", "$('optMode').value=localStorage.getItem('soat-ehs-mode')||'default';")

open(dst, "w", encoding="utf-8").write(s)
print("ok", len(s))
