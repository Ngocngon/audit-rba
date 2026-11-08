/* ---------- Online: đăng nhập, lưu trữ theo phân vùng, phân quyền, quản trị ---------- */
/* Phân vùng: Đối tác → Lần audit (ngày) → Khu vực → Ảnh / Lỗi. Máy vẫn lưu tạm như cũ (chạy khi mất mạng), có mạng thì tự đồng bộ.
   Quyền: admin (toàn quyền), auditor (sửa audit mình tạo hoặc được giao), viewer (chỉ xem). Máy chủ kiểm tra quyền ở mọi thao tác. */
const API='__AUDIT_API__'.replace(/\/$/,'');
const ROLE_L={admin:'Quản trị viên',auditor:'Auditor',viewer:'Người xem'};
const ROLE_D={admin:'Toàn quyền: quản lý người dùng, phân quyền, cài đặt hệ thống, sửa và xóa mọi audit.',auditor:'Tạo audit mới; chỉ sửa audit do mình tạo hoặc được quản trị viên giao. Xem được mọi audit.',viewer:'Chỉ xem và tải báo cáo, không sửa được dữ liệu online.'};
const CL={auth:null,sys:{},users:[],audit:null,q:{data:new Set(),img:new Set(),del:new Set()},mute:0,busy:false,t:0,lastPull:0,err:'',metaDirty:false,booted:false,lsRemoved:new Set(),kho:{q:'',year:'',mine:false,open:new Set(),exp:null,photos:new Map(),list:null,res:null},adm:{tab:'users',log:null,stats:null}};
const clLS=(k,v)=>{try{if(v===undefined){const s=localStorage.getItem('soat-ehs-cl-'+k);return s?JSON.parse(s):null}if(v===null)localStorage.removeItem('soat-ehs-cl-'+k);else localStorage.setItem('soat-ehs-cl-'+k,JSON.stringify(v))}catch{return null}};
CL.auth=clLS('auth');CL.audit=clLS('audit');CL.lastPull=clLS('pull')||0;
{const q=clLS('q');if(q){CL.q.data=new Set(q.data||[]);CL.q.img=new Set(q.img||[]);CL.q.del=new Set(q.del||[])}}
const clSaveQ=()=>clLS('q',{data:[...CL.q.data],img:[...CL.q.img],del:[...CL.q.del]});
const clQN=()=>new Set([...CL.q.data,...CL.q.img,...CL.q.del]).size;
const clOn=()=>!!(API&&CL.auth&&CL.auth.token);
const clRole=()=>CL.auth&&CL.auth.user?CL.auth.user.role:'';
const clAdmin=()=>clRole()==='admin';
const clCanCreate=()=>['admin','auditor'].includes(clRole());
const RO=()=>clOn()&&!(CL.audit?CL.audit.can_edit:clCanCreate());
const clName=id=>{const u=CL.users.find(x=>x.id===id);return u?(u.name||u.email):''};
const vnDT=t=>t?new Date(t).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'}):'';
const clGenPw=()=>{const c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789',a=crypto.getRandomValues(new Uint8Array(10));return[...a].map(b=>c[b%c.length]).join('')+'@'+(10+a[0]%90)};

async function api(method,path,body,opt={}){
  const hd={};if(CL.auth&&CL.auth.token)hd.Authorization='Bearer '+CL.auth.token;
  let b=body;if(body!==undefined&&!(body instanceof Blob)){hd['Content-Type']='application/json';b=JSON.stringify(body)}else if(body instanceof Blob)hd['Content-Type']=body.type||'image/jpeg';
  let r;try{r=await fetch(API+path,{method,headers:hd,body:b,signal:opt.signal})}catch(e){const er=new Error('Không kết nối được máy chủ. Kiểm tra mạng.');er.net=true;throw er}
  if(r.status===401&&!opt.noLogout&&CL.auth){clLogout(true);const er=new Error('Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.');er.status=401;throw er}
  if(opt.blob){if(!r.ok){const er=new Error('Không tải được ảnh.');er.status=r.status;throw er}return r.blob()}
  let d=null;try{d=await r.json()}catch{}
  if(!r.ok&&!(opt.ok409&&r.status===409)){const er=new Error((d&&d.error)||`Lỗi máy chủ (${r.status}).`);er.status=r.status;throw er}
  return d||{};
}

/* ---------- đăng nhập ---------- */
function clGate(show){const g=$('clGate');if(!g)return;g.hidden=!show;document.documentElement.classList.toggle('clgate',!!show);if(show)setTimeout(()=>{const e=$('clEmail');if(e&&!e.value)e.focus();else if($('clPass'))$('clPass').focus()},50)}
async function clLogin(e){
  if(e)e.preventDefault();const email=$('clEmail').value.trim(),pw=$('clPass').value,m=$('clGateMsg'),b=$('clGo');
  if(!email||!pw){m.textContent='Nhập email và mật khẩu.';return}
  b.disabled=true;m.textContent='Đang đăng nhập…';
  try{const r=await api('POST','/api/login',{email,password:pw},{noLogout:true});
    const prev=clLS('lastuser');CL.auth={token:r.token,user:r.user,exp:r.expires_at};clLS('auth',CL.auth);clLS('lastuser',r.user.id);$('clPass').value='';m.textContent='';clGate(false);
    if(prev&&prev!==r.user.id&&CL.audit){CL.audit.can_edit=false}
    if(!$('mWho').value.trim()){$('mWho').value=r.user.name;metaSave();uiExtra()}
    toast(`Xin chào ${r.user.name}. Vai trò: ${ROLE_L[r.user.role]}.`);
    await clBoot(true);if(r.user.must_change)clPwDialog(true);
  }catch(er){m.textContent=er.message}finally{b.disabled=false}
}
function clLogout(expired){
  const t=CL.auth&&CL.auth.token;if(t&&!expired)fetch(API+'/api/logout',{method:'POST',headers:{Authorization:'Bearer '+t}}).catch(()=>{});
  CL.auth=null;clLS('auth',null);CL.booted=false;clApply();clGate(true);
  if(expired)$('clGateMsg').textContent='Phiên đăng nhập đã hết hạn hoặc tài khoản đã bị khóa. Hãy đăng nhập lại.';
}
async function clLogoutWipe(){
  const n=clQN();const v=await ask('Đăng xuất và xóa dữ liệu trên máy?',`${n?`Còn ${n} ảnh chưa lưu online, sẽ bị mất. `:''}Ảnh, lỗi, sổ kinh nghiệm và cài đặt trên máy này sẽ bị xóa. Dữ liệu đã lưu online vẫn còn trong Kho audit. Dùng khi đăng nhập trên máy dùng chung.`,[{label:'Đăng xuất và xóa',cls:'danger',v:'go'},{label:'Hủy',v:null}]);
  if(v!=='go')return;const t=CL.auth&&CL.auth.token;if(t)try{await fetch(API+'/api/logout',{method:'POST',headers:{Authorization:'Bearer '+t}})}catch{}
  try{bgStop()}catch{}try{Store.db&&Store.db.close()}catch{}try{for(const k of Object.keys(localStorage))if(k.startsWith('soat-ehs')&&k!=='soat-ehs-ui'&&k!=='soat-ehs-theme')localStorage.removeItem(k)}catch{}
  const q=indexedDB.deleteDatabase('soat-ehs');q.onsuccess=q.onerror=q.onblocked=()=>location.reload();
}
function clPwDialog(force){
  const d=$('dlgClPw');$('clPwOld').value='';$('clPwNew').value='';$('clPwNew2').value='';$('clPwMsg').textContent=force?'Đây là lần đăng nhập đầu hoặc mật khẩu vừa được đặt lại. Hãy đổi mật khẩu riêng của bạn.':'';
  $('clPwCancel').hidden=!!force;d.dataset.force=force?'1':'';d.showModal();
}
async function clPwSave(e){
  e.preventDefault();const o=$('clPwOld').value,n=$('clPwNew').value,n2=$('clPwNew2').value,m=$('clPwMsg');
  if(n.length<8)return m.textContent='Mật khẩu mới cần ít nhất 8 ký tự.';if(n!==n2)return m.textContent='Hai lần nhập mật khẩu mới không giống nhau.';
  try{await api('POST','/api/me/password',{old:o,new:n});CL.auth.user.must_change=false;clLS('auth',CL.auth);$('dlgClPw').dataset.force='';$('dlgClPw').close();toast('Đã đổi mật khẩu.')}catch(er){m.textContent=er.message}
}

/* ---------- khởi động phần online ---------- */
async function clBoot(fresh){
  clApply();if(!clOn())return;
  try{const r=await api('GET','/api/me');CL.auth.user=r.user;clLS('auth',CL.auth);CL.sys=r.sys||{};clLS('sys',CL.sys);clApplySys()}
  catch(e){if(e.net){CL.sys=clLS('sys')||{};clApplySys();clApply();return}if(e.status===401)return}
  clUsers();
  if(CL.audit)try{const r=await api('GET','/api/audits/'+CL.audit.id);CL.audit=r.audit;clLS('audit',CL.audit)}catch(e){if(e.status===404||e.status===410){CL.audit=null;clLS('audit',null);CL.lastPull=0;clLS('pull',0)}}
  CL.booted=true;clApply();clLearnSync();clSync();
  if(fresh&&CL.auth.user.must_change)return;
}
async function clUsers(){try{const r=await api('GET','/api/users');CL.users=r.users||[]}catch{}}
function clApplySys(){
  const s=CL.sys||{};
  if(s.lockCrit&&s.cfg&&typeof s.cfg==='object'){for(const k of['sevLock','mandRule','fixes','minConf'])if(s.cfg[k]!==undefined)CFG[k]=s.cfg[k];if(s.cfg.due)CFG.due={...CFG.due,...s.cfg.due};cfgSave();try{syncSettings()}catch{}}
  const lock=!!s.lockCrit&&!clAdmin();
  document.querySelectorAll('#settings [data-st="crit"] input,#settings [data-st="crit"] select,#cfApply').forEach(el=>{el.disabled=lock});
  const n=$('clCritNote');if(n)n.hidden=!lock;
  if(s.defaultSub&&(!$('mSub').value.trim()||$('mSub').value.trim()==='SEV/T')&&!S.photos.some(p=>!p.sample)){$('mSub').value=s.defaultSub;metaSave()}
  if(s.org){const b=$('brandSub');if(b&&!b.dataset.org){b.dataset.org='1';b.textContent=s.org+' · '+b.textContent}}
}

/* ---------- trạng thái, chế độ chỉ xem ---------- */
function clApply(){
  const on=clOn(),u=on?CL.auth.user:null,ro=RO();
  document.documentElement.dataset.role=u?u.role:'';document.documentElement.dataset.ro=ro?'1':'';
  const b=$('clUser');if(b){b.hidden=!API;const ini=u?(u.name||u.email).split(/\s+/).filter(Boolean).slice(-2).map(s=>s[0]).join('').toUpperCase():'?';$('clIni').textContent=ini;b.title=u?`${u.name} · ${ROLE_L[u.role]}`:'Chưa đăng nhập'}
  const bn=$('clRo');if(bn){bn.hidden=!ro;if(ro){const a=CL.audit;$('clRoMsg').textContent=a?`Chỉ xem: audit ${a.vendor||'(chưa nhập đối tác)'}${a.date?' · '+vnDate(a.date):''} của ${a.owner_name||'người khác'}${a.status==='locked'?' (đã khóa)':''}. Bạn không sửa được audit này; thay đổi trên máy không được lưu online.`:'Bạn có quyền Người xem: ảnh và lỗi thêm trên máy này không được lưu online.'}}
  document.querySelectorAll('.cl-admin').forEach(el=>el.hidden=!(u&&u.role==='admin'));
  clStatus();
}
function clStatus(){
  const el=$('clDot');if(!el)return;let st='off',t='Chưa đăng nhập';
  if(clOn()){const n=clQN();
    if(RO()){st='ro';t='Chỉ xem'}
    else if(CL.busy){st='sync';t=`Đang lưu online${n?` (${n})`:''}…`}
    else if(n&&(NET.off||!navigator.onLine)){st='wait';t=`${n} ảnh chờ mạng để lưu online`}
    else if(CL.err&&n){st='err';t=CL.err}
    else if(n){st='wait';t=`${n} ảnh chờ lưu online`}
    else{st='ok';t=CL.audit?'Đã lưu online':'Đã đăng nhập'}}
  el.dataset.st=st;$('clUser').title=(CL.auth&&CL.auth.user?`${CL.auth.user.name} · ${ROLE_L[CL.auth.user.role]}\n`:'')+t;
  const s=$('clSyncStat');if(s)s.textContent=t;
}

/* ---------- theo dõi thay đổi trên máy ---------- */
{const _touch=Store.touch.bind(Store),_del=Store.del.bind(Store);
  Store.touch=function(p,keep){_touch(p,keep);if(CL.mute||!API||!p||p.sample)return;if(!p._bs)CL.q.img.add(p.id);CL.q.data.add(p.id);CL.q.del.delete(p.id);clSaveQ();clSoon()};
  Store.del=function(id){_del(id);if(CL.mute||!API)return;CL.q.data.delete(id);CL.q.img.delete(id);if(CL.audit)CL.q.del.add(id);clSaveQ();clSoon()};}
function clSoon(ms){clearTimeout(CL.t);CL.t=setTimeout(clSync,ms||2500);clStatus()}
['mSub','mUnit','mWho','mDate'].forEach(k=>$(k).addEventListener('input',()=>{if(!API)return;CL.metaDirty=true;clSoon(4000)}));
const clMeta=()=>({vendor:$('mUnit').value.trim(),sub:$('mSub').value.trim(),date:$('mDate').value||today(),auditors:$('mWho').value.trim()});
const clData=p=>({id:p.id,ord:p.ord,name:p.name,area:p.area,note:p.note,findings:p.findings.map(f=>({...f,pending:false})),analysis:p.analysis,by:p.by,at:p.at,upd:p.upd||Date.now(),w:p.w,h:p.h,thumb:p.thumb});
async function pool(items,n,fn){let i=0;await Promise.all(Array.from({length:Math.min(n,items.length)},async()=>{while(i<items.length){const x=items[i++];await fn(x)}}))}

async function clSync(){
  clearTimeout(CL.t);
  if(!clOn()||!CL.booted||CL.busy||NET.off)return;
  if(RO()){if(CL.audit)try{CL.busy=true;await clPull()}catch{}finally{CL.busy=false;clStatus()}return}
  CL.busy=true;CL.err='';clStatus();
  try{
    const real=S.photos.filter(p=>!p.sample);
    if(!CL.audit){
      if(!real.length&&!CL.q.data.size)return;
      const r=await api('POST','/api/audits',{id:uid()+uid(),...clMeta()});CL.audit=r.audit;clLS('audit',CL.audit);CL.metaDirty=false;CL.lastPull=0;clLS('pull',0);clApply();
      for(const p of real){CL.q.data.add(p.id);if(p.blob)CL.q.img.add(p.id)}CL.q.del.clear();clSaveQ();
      toast(`Đã tạo audit online: ${CL.audit.vendor||'(chưa nhập đối tác)'}. Ảnh và lỗi tự lưu lên hệ thống.`);
    }else if(CL.metaDirty){const r=await api('PATCH','/api/audits/'+CL.audit.id,clMeta());CL.audit=r.audit;clLS('audit',CL.audit);CL.metaDirty=false}
    const id=CL.audit.id;
    for(const pid of[...CL.q.del]){await api('DELETE',`/api/audits/${id}/photos/${pid}`).catch(e=>{if(e.status!==404)throw e});CL.q.del.delete(pid);clSaveQ()}
    await pool([...CL.q.img],3,async pid=>{const p=S.photos.find(x=>x.id===pid);if(p&&p.blob)await api('PUT',`/api/audits/${id}/photos/${pid}/img`,p.blob);CL.q.img.delete(pid);clSaveQ();clStatus()});
    await pool([...CL.q.data],4,async pid=>{const p=S.photos.find(x=>x.id===pid);if(p&&!p.sample)await api('PUT',`/api/audits/${id}/photos/${pid}`,clData(p),{ok409:true});CL.q.data.delete(pid);clSaveQ();clStatus()});
    await clPull();
  }catch(e){CL.err=e.message;if(e.status===403||e.status===410||e.status===404){try{const r=await api('GET','/api/audits/'+CL.audit.id);CL.audit=r.audit;clLS('audit',CL.audit)}catch(e2){if(e2.status===404){CL.audit=null;clLS('audit',null)}}clApply();toast(e.message)}else if(!e.net)console.warn(e);setTimeout(clSync,30000)}
  finally{CL.busy=false;clStatus()}
}
/* lấy thay đổi của người khác trong cùng audit (hoặc tải cả audit khi mở) */
async function clPull(progress){
  if(!CL.audit)return 0;const id=CL.audit.id;
  const r=await api('GET',`/api/audits/${id}/photos?since=${CL.lastPull||0}`);if(!CL.audit||CL.audit.id!==id)return 0;
  const rows=r.photos||[];let ch=0,done=0,maxSrv=CL.lastPull||0;const dirty=new Set([...CL.q.data,...CL.q.img]);
  const todo=rows.filter(x=>{maxSrv=Math.max(maxSrv,x.srv||0);return true});
  await pool(todo,4,async row=>{
    const loc=S.photos.find(p=>p.id===row.id);
    if(row.deleted){if(loc&&!dirty.has(row.id)){CL.mute++;Store.del(row.id);CL.mute--;S.photos=S.photos.filter(p=>p!==loc);ch++}return}
    const d=row.data||{};if(!d.upd||dirty.has(row.id))return;if(loc&&(loc.upd||0)>=d.upd)return;
    let blob=loc&&loc.blob;if(!blob){if(!row.has_img)return;try{blob=await api('GET',`/api/audits/${id}/photos/${row.id}/img`,undefined,{blob:true})}catch{return}}
    const findings=(Array.isArray(d.findings)?d.findings:[]).filter(f=>f&&f.s);
    const np=makePhoto({id:row.id,ord:Number(d.ord)||Date.now(),name:d.name||'Ảnh',blob,w:d.w||0,h:d.h||0,thumb:d.thumb||'',area:d.area||'',note:d.note||'',findings,analysis:d.analysis||null,by:d.by||'',at:d.at||0,upd:d.upd});
    if(!np.thumb||!np.w){try{const c=await decodeImg(blob);np.w=c.width;np.h=c.height;np.thumb=thumbOf(c)}catch{}}
    const i=S.photos.indexOf(S.photos.find(p=>p.id===row.id));if(i>=0)S.photos[i]=np;else S.photos.push(np);
    CL.mute++;Store.touch(np,true);CL.mute--;ch++;done++;if(progress)progress(done,todo.length);
  });
  CL.lastPull=maxSrv;clLS('pull',maxSrv);
  if(ch){const real=S.photos.filter(p=>!p.sample);if(real.length)S.photos=real.sort((a,b)=>a.ord-b.ord);if(!S.photos.length)addSample();if(!cur())S.cur=S.photos[0].id;renderAll();try{fit()}catch{}if(CL.kho.list)renderKho()}
  return ch;
}
/* trước khi đổi audit trên máy: lưu nốt thay đổi */
async function clBeforeSwitch(){
  if(!clOn()||RO()){CL.q.data.clear();CL.q.img.clear();CL.q.del.clear();clSaveQ();return true}
  if(clQN()&&!NET.off){toast('Đang lưu nốt lên hệ thống…');for(let i=0;i<3&&clQN();i++){while(CL.busy)await new Promise(r=>setTimeout(r,300));await clSync()}}
  const n=clQN();if(!n)return true;
  const v=await ask('Còn dữ liệu chưa lưu online',`${n} ảnh chưa lưu được lên hệ thống${CL.err?` (${CL.err})`:''}. Tiếp tục sẽ mất các thay đổi này trên máy.`,[{label:'Xuất gói để giữ lại',v:'pack'},{label:'Vẫn tiếp tục',cls:'danger',v:'go'},{label:'Hủy',v:null}]);
  if(v==='pack'){try{await exportPack()}catch{}return false}
  if(v!=='go')return false;CL.q.data.clear();CL.q.img.clear();CL.q.del.clear();clSaveQ();return true;
}
function clNewAudit(){CL.audit=null;clLS('audit',null);CL.lastPull=0;clLS('pull',0);CL.q.data.clear();CL.q.img.clear();CL.q.del.clear();clSaveQ();CL.metaDirty=false;clApply()}
async function clOpenAudit(a,photoId){
  if(CL.audit&&CL.audit.id===a.id){CL.audit=a;clLS('audit',a);clApply();if(photoId&&S.photos.some(p=>p.id===photoId))open(photoId);clGo('review');return}
  if(!(await clBeforeSwitch()))return;
  try{bgStop()}catch{}CL.mute++;for(const p of S.photos)Store.del(p.id);CL.mute--;S.photos=[];S.sel=null;S.cur=null;S.psel=null;S.fsel=null;
  CL.audit=a;clLS('audit',a);CL.lastPull=0;clLS('pull',0);CL.q.data.clear();CL.q.img.clear();CL.q.del.clear();clSaveQ();
  $('mUnit').value=a.vendor||'';if(a.sub)$('mSub').value=a.sub;$('mDate').value=a.date||today();$('mWho').value=a.auditors||'';metaSave();CL.metaDirty=false;
  clApply();addSample();S.cur=S.photos[0].id;renderAll();
  toast(`Đang tải audit ${a.vendor||''}…`);
  try{await clPull((d,n)=>{if(d%3===0||d===n)toast(`Đang tải ảnh ${d}/${n}…`)})}catch(e){toast(e.message)}
  if(!S.photos.length)addSample();if(photoId&&S.photos.some(p=>p.id===photoId))S.cur=photoId;else S.cur=S.photos[0].id;
  renderAll();try{fit()}catch{}uiExtra();
  toast(`Đã mở audit ${a.vendor||''}: ${S.photos.filter(p=>!p.sample).length} ảnh.${a.can_edit?'':' Chế độ chỉ xem.'}`);clGo('review');
}
function clGo(v){if(isMobile())setView(v==='dash'?'review':v);else setDView(v)}

/* ---------- đồng bộ sổ kinh nghiệm và Guider dùng chung cả đội ---------- */
cloudGet=async k=>{if(!clOn())return null;try{return(await api('GET','/api/kv/'+k)).value}catch{return null}};
cloudPut=(k,v)=>{if(!clOn())return Promise.resolve();if(k==='lessons'){if(!clCanCreate())return Promise.resolve();v={...v,removed:[...CL.lsRemoved]}}else if(!clAdmin())return Promise.resolve();
  return api('PUT','/api/kv/'+k,v).then(()=>{if(k==='lessons')CL.lsRemoved.clear()}).catch(()=>{})};
{const _ld=Learn.del.bind(Learn),_lc=Learn.clear.bind(Learn);Learn.del=id=>{CL.lsRemoved.add(id);_ld(id)};Learn.clear=()=>{for(const x of Learn.items)CL.lsRemoved.add(x.id);_lc()}}
async function clLearnSync(){
  if(!clOn())return;
  const[ls,gd]=await Promise.all([cloudGet('lessons'),cloudGet('guider')]);
  const remote=ls&&Array.isArray(ls.items)?ls.items.filter(okLesson):[],ids=new Set(remote.map(x=>x.id));
  Learn.merge(remote);if(Learn.items.some(x=>!ids.has(x.id)))cloudPut('lessons',{items:Learn.items,upd:Date.now()});
  if(gd&&(gd.at||0)>(GUIDER.at||0)){
    if(typeof gd.json==='string'){let codes=null;try{codes=JSON.parse(gd.json)}catch{}
      if(codes){const f=await cloudGet('guiderfile'),g={codes,ver:gd.ver,date:gd.date,name:gd.name,at:gd.at,diffRep:Array.isArray(gd.diffRep)?gd.diffRep:[],file:f&&f.at===gd.at&&typeof f.b64==='string'?b64bytes(f.b64):null};applyGuider(g);await Store.kvSet('guider',g);toast(`Đã đồng bộ dữ liệu Guider ${GUIDER.ver} từ hệ thống.`)}}
    else if(GUIDER.src==='file'){applyGuider(null);await Store.kvSet('guider',null)}
  }else if(clAdmin()&&GUIDER.src==='file'&&(!gd||(gd.at||0)<GUIDER.at))pushGuider();
  hubRefresh();
}
cloudSync=async()=>{if(!API)return;if(!clOn()){clGate(true);return}await clBoot()};
{const _br=bgReady;bgReady=()=>!RO()&&_br()}

/* ---------- Kho audit online: Đối tác → Lần audit → Khu vực → Ảnh ---------- */
async function clKhoLoad(){
  const k=CL.kho;try{const r=await api('GET','/api/audits'+(k.mine?'?mine=1':''));k.list=r.audits||[]}catch(e){k.err=e.message;k.list=k.list||[]}renderKho();
}
async function clKhoPhotos(a){
  try{const r=await api('GET',`/api/audits/${a.id}/photos`);CL.kho.photos.set(a.id,(r.photos||[]).filter(x=>!x.deleted&&x.data&&x.data.upd))}catch(e){toast(e.message)}renderKho();
}
let khoSearchT=0;
function renderKho(){
  const P=$('cloudB');if(!P)return;const k=CL.kho;
  if(!clOn()){P.replaceChildren(h('div',{class:'dcard'},h('h3',null,'Chưa đăng nhập'),h('p',{class:'hint'},'Đăng nhập để xem và lưu audit online.'),h('button',{class:'btn primary',onclick:()=>clGate(true)},'Đăng nhập')));return}
  if(!k.list){P.replaceChildren(h('p',{class:'hint'},'Đang tải danh sách audit…'));clKhoLoad();return}
  const years=[...new Set(k.list.map(a=>(a.date||'').slice(0,4)).filter(Boolean))].sort().reverse();
  const ql=k.q.trim().toLowerCase();
  const list=k.list.filter(a=>(!k.year||(a.date||'').startsWith(k.year))&&(!ql||[a.vendor,a.auditors,a.sub,a.owner_name,...(a.areas||[])].some(x=>String(x||'').toLowerCase().includes(ql))));
  const byV=new Map();for(const a of list){const v=a.vendor||'(Chưa nhập đối tác)';if(!byV.has(v))byV.set(v,[]);byV.get(v).push(a)}
  const tools=h('div',{class:'ttool clkt'},
    h('input',{type:'search',id:'khoQ',placeholder:'Tìm đối tác, khu vực, auditor… (Enter: tìm cả nội dung lỗi)',value:k.q,'aria-label':'Tìm trong kho',oninput:e=>{k.q=e.target.value;k.res=null;clearTimeout(khoSearchT);khoSearchT=setTimeout(()=>{renderKho();const q=$('khoQ');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length)}},250)},onkeydown:e=>{if(e.key==='Enter')clKhoSearch()}}),
    h('select',{'aria-label':'Năm',onchange:e=>{k.year=e.target.value;renderKho()}},h('option',{value:''},'Mọi năm'),...years.map(y=>h('option',{value:y,selected:k.year===y},y))),
    h('label',{class:'chk'},h('input',{type:'checkbox',checked:k.mine,onchange:e=>{k.mine=e.target.checked;k.list=null;renderKho()}}),' Chỉ audit của tôi'),
    h('button',{class:'btn',onclick:()=>clKhoSearch()},'Tìm lỗi'),
    h('button',{class:'btn',onclick:()=>{k.list=null;k.photos.clear();renderKho()}},'Làm mới'),
    clCanCreate()?h('button',{class:'btn primary',onclick:()=>clNewFromKho()},'+ Audit mới'):null);
  const sum=h('p',{class:'hint'},`${byV.size} đối tác · ${list.length} lần audit · ${list.reduce((s,a)=>s+a.n_photos,0)} ảnh · ${list.reduce((s,a)=>s+a.n_f,0)} lỗi${k.err?` · ${k.err}`:''}`);
  const res=k.res?h('div',{class:'dcard clres'},h('h3',null,`Kết quả tìm "${k.res.q}" (${k.res.items.length})`,h('button',{class:'btn sm',style:'float:right',onclick:()=>{k.res=null;renderKho()}},'Đóng')),
    k.res.items.length?h('div',{class:'clgrid'},...k.res.items.map(x=>h('button',{class:'clph',onclick:()=>{const a=k.list.find(z=>z.id===x.audit_id);if(a)clOpenAudit(a,x.photo_id)}},x.thumb?h('img',{src:x.thumb,alt:''}):h('span',{class:'noimg'}),
      h('b',null,x.vendor||'—'),h('small',null,[vnDate(x.date),x.area].filter(Boolean).join(' · ')),...x.findings.slice(0,3).map(f=>h('small',{class:'clf'},h('i',{class:'pill '+(f.sev||'')},f.sev||'—'),' ',f.title||''))))):h('p',{class:'hint'},'Không tìm thấy lỗi nào khớp.')):null;
  const groups=[...byV.entries()].map(([v,as])=>{
    const isOpen=k.open.has(v)||!!ql||byV.size<=3;
    return h('div',{class:'clv'+(isOpen?' on':'')},
      h('button',{class:'clvh',onclick:()=>{k.open.has(v)?k.open.delete(v):k.open.add(v);renderKho()}},h('b',null,v),h('small',null,`${as.length} lần audit · gần nhất ${vnDate(as.map(a=>a.date).sort().reverse()[0])||'—'} · ${as.reduce((s,a)=>s+a.n_f,0)} lỗi`),h('i',{class:'chev'},isOpen?'▾':'▸')),
      isOpen?h('div',{class:'clal'},...as.map(a=>clAuditRow(a))):null)});
  P.replaceChildren(tools,sum,...(res?[res]:[]),...(groups.length?groups:[h('div',{class:'dcard'},h('p',{class:'hint'},k.list.length?'Không có audit khớp bộ lọc.':'Chưa có audit nào trên hệ thống. Thêm ảnh và nhập thông tin audit, app sẽ tự lưu lên.'))]));
}
function clAuditRow(a){
  const k=CL.kho,here=CL.audit&&CL.audit.id===a.id,exp=k.exp===a.id,ph=k.photos.get(a.id);
  const mem=(a.members||[]).map(clName).filter(Boolean);
  const row=h('div',{class:'cla'+(here?' here':'')},
    h('div',{class:'clam'},h('b',null,vnDate(a.date)||'Chưa có ngày'),a.status==='locked'?h('span',{class:'pill Minor'},'Đã khóa'):null,here?h('span',{class:'pill okc'},'Đang mở trên máy này'):null,
      h('small',null,[a.sub,a.auditors&&('Auditor: '+a.auditors),'Người tạo: '+(a.owner_name||'—'),mem.length&&('Được giao: '+mem.join(', '))].filter(Boolean).join(' · ')),
      h('small',null,`${a.n_photos} ảnh · ${a.n_f} lỗi (${a.n_ok} đã xác nhận)${(a.areas||[]).length?' · '+a.areas.length+' khu vực':''} · cập nhật ${vnDT(a.updated_at)}`)),
    h('div',{class:'claa'},h('button',{class:'btn sm',onclick:()=>{k.exp=exp?null:a.id;if(!exp&&!ph)clKhoPhotos(a);renderKho()}},exp?'Thu gọn':'Xem theo khu vực'),
      h('button',{class:'btn sm primary',onclick:()=>clOpenAudit(a)},here?'Đang mở':a.can_edit?'Mở để sửa':'Mở để xem'),
      clAdmin()?h('button',{class:'btn sm',onclick:()=>clMembersDialog(a)},'Giao người'):null,
      clAdmin()?h('button',{class:'btn sm',onclick:()=>clLock(a)},a.status==='locked'?'Mở khóa':'Khóa'):null,
      (clAdmin()||(CL.sys.auditorDelete&&a.owner_id===(CL.auth.user||{}).id))?h('button',{class:'btn sm danger',onclick:()=>clDelAudit(a)},'Xóa'):null));
  if(!exp)return row;
  if(!ph)return h('div',null,row,h('p',{class:'hint clpad'},'Đang tải ảnh…'));
  const byA=new Map();for(const x of ph){const ar=(x.data.area||'').trim()||'(Chưa ghi khu vực)';if(!byA.has(ar))byA.set(ar,[]);byA.get(ar).push(x)}
  return h('div',null,row,h('div',{class:'clareas'},...(byA.size?[...byA.entries()].sort((x,y)=>x[0].localeCompare(y[0],'vi')).map(([ar,xs])=>h('div',{class:'clar'},
    h('h4',null,ar,h('small',null,` · ${xs.length} ảnh · ${xs.reduce((s,x)=>s+(x.data.findings||[]).length,0)} lỗi`)),
    h('div',{class:'clgrid'},...xs.sort((p,q)=>(p.data.ord||0)-(q.data.ord||0)).map(x=>{const fs=x.data.findings||[];return h('button',{class:'clph',title:fs.map(f=>'• '+(f.title||'')).join('\n'),onclick:()=>clOpenAudit(a,x.id)},
      x.data.thumb?h('img',{src:x.data.thumb,alt:''}):h('span',{class:'noimg'}),h('small',null,`${fs.length} lỗi · ${fs.filter(f=>f.ok).length} đã xác nhận`))})))):[h('p',{class:'hint'},'Audit chưa có ảnh.')])));
}
async function clKhoSearch(){
  const q=CL.kho.q.trim();if(q.length<2)return toast('Nhập ít nhất 2 ký tự để tìm.');
  try{const r=await api('GET','/api/search?q='+encodeURIComponent(q));CL.kho.res={q,items:r.results||[]};renderKho()}catch(e){toast(e.message)}
}
async function clNewFromKho(){
  if(!S.photos.some(p=>!p.sample)&&!CL.audit){clGo('report');setTimeout(()=>$('mUnit').focus(),60);return}
  if(!(await clBeforeSwitch()))return;
  try{bgStop()}catch{}CL.mute++;for(const p of S.photos)Store.del(p.id);CL.mute--;S.photos=[];S.sel=null;S.cur=null;clNewAudit();
  $('mUnit').value='';$('mDate').value=today();if(CL.auth)$('mWho').value=CL.auth.user.name;metaSave();addSample();renderAll();uiExtra();
  toast('Đã bắt đầu audit mới. Nhập tên đối tác rồi thêm ảnh; app tự lưu online.');clGo('report');setTimeout(()=>$('mUnit').focus(),60);
}
async function clLock(a){
  try{const r=await api('PATCH','/api/audits/'+a.id,{status:a.status==='locked'?'open':'locked'});clKhoPatch(r.audit);toast(r.audit.status==='locked'?'Đã khóa audit. Chỉ quản trị viên sửa được.':'Đã mở khóa audit.')}catch(e){toast(e.message)}
}
function clKhoPatch(a){const k=CL.kho;if(k.list){const i=k.list.findIndex(x=>x.id===a.id);if(i>=0)k.list[i]=a}if(CL.audit&&CL.audit.id===a.id){CL.audit=a;clLS('audit',a);clApply()}renderKho();if($('app').dataset.dview==='admin'||$('app').dataset.view==='admin')renderAdmin()}
async function clDelAudit(a){
  const v=await ask('Xóa audit này trên hệ thống?',`Audit ${a.vendor||''} ngày ${vnDate(a.date)||'—'}: ${a.n_photos} ảnh, ${a.n_f} lỗi sẽ bị xóa khỏi hệ thống. Không hoàn tác được.`,[{label:'Xóa audit',cls:'danger',v:'go'},{label:'Hủy',v:null}]);if(v!=='go')return;
  try{await api('DELETE','/api/audits/'+a.id);const k=CL.kho;if(k.list)k.list=k.list.filter(x=>x.id!==a.id);if(CL.audit&&CL.audit.id===a.id)clNewAudit();toast('Đã xóa audit.');renderKho();if(CL.adm.audits)CL.adm.audits=CL.adm.audits.filter(x=>x.id!==a.id),renderAdmin()}catch(e){toast(e.message)}
}
function clMembersDialog(a){
  const d=$('dlgClMem'),B=$('clMemB');$('clMemH').textContent=`Giao audit: ${a.vendor||'(chưa nhập đối tác)'} · ${vnDate(a.date)||''}`;
  const cand=CL.users.filter(u=>u.role!=='viewer'&&u.active!==false&&u.id!==a.owner_id),sel=new Set(a.members||[]);
  B.replaceChildren(h('p',{class:'hint'},'Người được giao sửa được audit này như người tạo. Quản trị viên luôn sửa được mọi audit.'),
    h('label',{class:'srow'},'Người tạo (chủ sở hữu) ',h('select',{id:'clMemOwner'},...CL.users.filter(u=>u.role!=='viewer').map(u=>h('option',{value:u.id,selected:u.id===a.owner_id},`${u.name} (${ROLE_L[u.role]})`)))),
    cand.length?h('div',{class:'clmem'},...cand.map(u=>h('label',{class:'chk'},h('input',{type:'checkbox',value:u.id,checked:sel.has(u.id)}),` ${u.name} · ${ROLE_L[u.role]}`))):h('p',{class:'hint'},'Chưa có Auditor nào khác. Thêm người dùng ở trang Quản trị.'));
  $('clMemSave').onclick=async()=>{const ids=[...B.querySelectorAll('.clmem input:checked')].map(x=>x.value),own=$('clMemOwner').value;
    try{if(own&&own!==a.owner_id)await api('PATCH','/api/audits/'+a.id,{owner_id:own});const r=await api('PUT',`/api/audits/${a.id}/members`,{members:ids.filter(x=>x!==own)});d.close();clKhoPatch(r.audit);if(CL.adm.audits){const i=CL.adm.audits.findIndex(x=>x.id===a.id);if(i>=0)CL.adm.audits[i]=r.audit}toast('Đã cập nhật phân quyền audit.');renderAdmin()}catch(e){toast(e.message)}};
  d.showModal();
}

/* ---------- Quản trị: người dùng, phân quyền, cài đặt hệ thống, nhật ký ---------- */
const ACT_L={login:'Đăng nhập',password:'Đổi mật khẩu',bootstrap:'Khởi tạo hệ thống','user.create':'Tạo người dùng','user.update':'Sửa người dùng','user.delete':'Xóa người dùng',settings:'Cài đặt hệ thống','audit.create':'Tạo audit','audit.delete':'Xóa audit','audit.lock':'Khóa audit','audit.unlock':'Mở khóa audit','audit.owner':'Đổi người tạo audit','audit.members':'Giao audit','sessions.revoke':'Đăng xuất mọi thiết bị'};
async function renderAdmin(){
  const P=$('adminB');if(!P)return;const A=CL.adm;
  if(!clAdmin()){P.replaceChildren(h('div',{class:'dcard'},h('h3',null,'Không có quyền'),h('p',{class:'hint'},'Chỉ quản trị viên mở được trang này.')));return}
  const tabs=h('div',{class:'stabs',role:'tablist'},...[['users','Người dùng'],['perm','Phân quyền audit'],['sys','Cài đặt hệ thống'],['log','Nhật ký']].map(([t,l])=>h('button',{role:'tab','aria-selected':String(A.tab===t),onclick:()=>{A.tab=t;renderAdmin()}},l)));
  const st=A.stats;const cards=h('div',{class:'clstats'},...(st?[['Người dùng',`${st.active}/${st.users}`,'đang hoạt động'],['Đối tác',st.vendors,''],['Lần audit',st.audits,''],['Ảnh',st.photos,(st.bytes/1048576).toFixed(1)+' MB'],['Lỗi',st.findings,'']]:[['…','','']]).map(([a,b,c])=>h('div',{class:'dcard'},h('small',null,a),h('b',null,String(b)),c?h('small',null,c):null)));
  if(!st)api('GET','/api/admin/stats').then(r=>{A.stats=r;renderAdmin()}).catch(()=>{});
  let body;
  if(A.tab==='users')body=clAdmUsers();else if(A.tab==='perm')body=clAdmPerm();else if(A.tab==='sys')body=clAdmSys();else body=clAdmLog();
  P.replaceChildren(cards,tabs,body);
}
function clAdmUsers(){
  const me=CL.auth.user.id;
  const rows=CL.users.map(u=>h('tr',{class:u.active?'':'off'},h('td',null,h('b',null,u.name),u.id===me?h('small',null,' (bạn)'):null),h('td',null,u.email||''),
    h('td',null,h('select',{'aria-label':'Vai trò',disabled:u.id===me,onchange:e=>clUserPatch(u,{role:e.target.value})},...Object.entries(ROLE_L).map(([r,l])=>h('option',{value:r,selected:u.role===r},l)))),
    h('td',null,u.active?h('span',{class:'pill okc'},'Hoạt động'):h('span',{class:'pill Priority'},'Đã khóa')),h('td',null,u.last_login?vnDT(u.last_login):'Chưa đăng nhập'),
    h('td',{class:'clact'},h('button',{class:'btn sm',onclick:()=>clUserDialog(u)},'Sửa'),h('button',{class:'btn sm',onclick:()=>clResetPw(u)},'Đặt lại MK'),
      u.id===me?null:h('button',{class:'btn sm',onclick:()=>clUserPatch(u,{active:!u.active})},u.active?'Khóa':'Mở khóa'),
      u.id===me?null:h('button',{class:'btn sm',onclick:async()=>{try{await api('POST','/api/admin/sessions/revoke',{user_id:u.id});toast(`Đã đăng xuất ${u.name} khỏi mọi thiết bị.`)}catch(e){toast(e.message)}}},'Đăng xuất'),
      u.id===me?null:h('button',{class:'btn sm danger',onclick:()=>clUserDel(u)},'Xóa'))));
  return h('div',null,h('div',{class:'dhead'},h('h2',null,'Người dùng'),h('span',{class:'spacer'}),h('button',{class:'btn primary',onclick:()=>clUserDialog(null)},'+ Thêm người dùng')),
    h('div',{class:'tscroll'},h('table',{class:'ftab cltab'},h('thead',null,h('tr',null,...['Họ tên','Email','Vai trò','Trạng thái','Đăng nhập gần nhất',''].map(t=>h('th',null,t)))),h('tbody',null,...rows))),
    h('div',{class:'sgrid clroles'},...Object.entries(ROLE_L).map(([r,l])=>h('div',{class:'dcard'},h('h3',null,l),h('p',{class:'hint'},ROLE_D[r])))));
}
async function clUserPatch(u,ch){
  if(ch.active===false){const v=await ask(`Khóa tài khoản ${u.name}?`,'Người này bị đăng xuất ngay và không đăng nhập được cho tới khi mở khóa.',[{label:'Khóa',cls:'danger',v:'go'},{label:'Hủy',v:null}]);if(v!=='go')return}
  try{const r=await api('PATCH','/api/users/'+u.id,ch);Object.assign(u,r.user);toast('Đã cập nhật '+u.name+'.')}catch(e){toast(e.message)}await clUsers();renderAdmin();
}
async function clUserDel(u){
  const v=await ask(`Xóa tài khoản ${u.name}?`,'Các audit do người này tạo được chuyển cho bạn. Không hoàn tác được.',[{label:'Xóa tài khoản',cls:'danger',v:'go'},{label:'Hủy',v:null}]);if(v!=='go')return;
  try{await api('DELETE','/api/users/'+u.id);toast('Đã xóa '+u.name+'.');CL.adm.stats=null}catch(e){toast(e.message)}await clUsers();renderAdmin();
}
async function clResetPw(u){
  const pw=clGenPw();const v=await ask(`Đặt lại mật khẩu cho ${u.name}?`,`Mật khẩu tạm mới: ${pw}\nGửi mật khẩu này cho ${u.name} qua kênh riêng. Lần đăng nhập tới họ phải đổi mật khẩu; mọi thiết bị đang đăng nhập bị đăng xuất.`,[{label:'Đặt lại',cls:'primary',v:'go'},{label:'Hủy',v:null}]);if(v!=='go')return;
  try{await api('PATCH','/api/users/'+u.id,{password:pw});try{await navigator.clipboard.writeText(pw);toast('Đã đặt lại và chép mật khẩu tạm vào bộ nhớ: '+pw)}catch{toast('Đã đặt lại. Mật khẩu tạm: '+pw)}}catch(e){toast(e.message)}
}
function clUserDialog(u){
  const d=$('dlgClUser');$('clUH').textContent=u?'Sửa người dùng':'Thêm người dùng';$('clUName').value=u?u.name:'';$('clUEmail').value=u?u.email:'';$('clURole').value=u?u.role:'auditor';
  $('clUPw').value=u?'':clGenPw();$('clUPwRow').hidden=!!u;$('clUMsg').textContent='';
  $('clUSave').onclick=async e=>{e.preventDefault();const b={name:$('clUName').value.trim(),email:$('clUEmail').value.trim(),role:$('clURole').value};
    try{if(u){await api('PATCH','/api/users/'+u.id,b);toast('Đã lưu.')}else{b.password=$('clUPw').value;await api('POST','/api/users',b);
        const msg=`Đã tạo tài khoản ${b.email}. Mật khẩu tạm: ${b.password}`;try{await navigator.clipboard.writeText(`Audit RBA: ${location.origin+location.pathname}\nEmail: ${b.email}\nMật khẩu tạm: ${b.password}`);toast(msg+' (đã chép thông tin đăng nhập)')}catch{toast(msg)}CL.adm.stats=null}
      d.close();await clUsers();renderAdmin()}catch(er){$('clUMsg').textContent=er.message}};
  d.showModal();
}
function clAdmPerm(){
  const A=CL.adm;if(!A.audits){api('GET','/api/audits').then(r=>{A.audits=r.audits||[];renderAdmin()}).catch(e=>toast(e.message));return h('p',{class:'hint'},'Đang tải danh sách audit…')}
  const q=(A.pq||'').toLowerCase(),list=A.audits.filter(a=>!q||[a.vendor,a.owner_name,a.auditors].some(x=>String(x||'').toLowerCase().includes(q)));
  return h('div',null,h('div',{class:'dhead'},h('h2',null,'Phân quyền audit'),h('span',{class:'spacer'}),h('input',{type:'search',placeholder:'Tìm đối tác, người tạo…',value:A.pq||'',oninput:e=>{A.pq=e.target.value;clearTimeout(A.pt);A.pt=setTimeout(()=>{renderAdmin();const i=document.querySelector('#adminB input[type=search]');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}},250)}}),h('button',{class:'btn',onclick:()=>{A.audits=null;renderAdmin()}},'Làm mới')),
    h('p',{class:'hint'},'Người tạo và người được giao sửa được audit; mọi người đăng nhập đều xem được. Audit đã khóa chỉ quản trị viên sửa.'),
    h('div',{class:'tscroll'},h('table',{class:'ftab cltab'},h('thead',null,h('tr',null,...['Đối tác','Ngày','Ảnh / lỗi','Người tạo','Được giao','Trạng thái',''].map(t=>h('th',null,t)))),
      h('tbody',null,...list.map(a=>h('tr',null,h('td',null,h('b',null,a.vendor||'(chưa nhập)')),h('td',null,vnDate(a.date)||'—'),h('td',null,`${a.n_photos} / ${a.n_f}`),h('td',null,a.owner_name||'—'),
        h('td',null,(a.members||[]).map(clName).filter(Boolean).join(', ')||'—'),h('td',null,a.status==='locked'?h('span',{class:'pill Minor'},'Đã khóa'):h('span',{class:'pill okc'},'Đang mở')),
        h('td',{class:'clact'},h('button',{class:'btn sm',onclick:()=>clMembersDialog(a)},'Giao người'),h('button',{class:'btn sm',onclick:async()=>{await clLock(a);A.audits=null;renderAdmin()}},a.status==='locked'?'Mở khóa':'Khóa'),h('button',{class:'btn sm danger',onclick:()=>clDelAudit(a)},'Xóa'))))))));
}
function clAdmSys(){
  const s={sessionDays:30,lockCrit:false,auditorDelete:false,org:'',defaultSub:'',...CL.sys};
  const inp=(id,lab,val,typ,extra)=>h('label',{class:'srow'},lab,h('input',{id,type:typ||'text',value:val==null?'':val,...(extra||{})}));
  const cfg=s.cfg;
  return h('div',{class:'sgrid'},
    h('div',{class:'dcard'},h('h3',null,'Thông tin chung'),inp('csOrg','Tên đơn vị (hiện trên đầu app)',s.org,'text',{style:'width:100%'}),inp('csSub','Subsidiary mặc định cho audit mới',s.defaultSub,'text',{placeholder:'SEV/T'}),
      inp('csDays','Thời hạn đăng nhập (ngày)',s.sessionDays,'number',{min:1,max:365})),
    h('div',{class:'dcard'},h('h3',null,'Quyền'),
      h('label',{class:'chk'},h('input',{type:'checkbox',id:'csLock',checked:!!s.lockCrit}),' Khóa tiêu chí đánh giá: mọi máy dùng chung tiêu chí chuẩn bên dưới, chỉ quản trị viên được sửa.'),
      h('label',{class:'chk'},h('input',{type:'checkbox',id:'csDel',checked:!!s.auditorDelete}),' Auditor được xóa audit do mình tạo (khi chưa khóa).'),
      h('p',{class:'hint'},'Người xem luôn chỉ xem. Auditor chỉ sửa audit mình tạo hoặc được giao. Máy chủ kiểm tra quyền ở mọi thao tác, sửa trên máy không vượt được quyền.')),
    h('div',{class:'dcard'},h('h3',null,'Tiêu chí chuẩn của hệ thống'),
      h('p',{class:'stat'},cfg?`Mức theo danh mục: ${cfg.sevLock?'có':'không'} · Mandatory theo Priority: ${cfg.mandRule!=='ai'?'có':'không'} · Viết khắc phục: ${cfg.fixes?'có':'không'} · Độ chắc chắn tối thiểu ${cfg.minConf}% · Hạn: Priority ${cfg.due.Priority} ngày, Major ${cfg.due.Major}, Minor ${cfg.due.Minor}.`:'Chưa đặt. Các máy dùng tiêu chí riêng.'),
      h('button',{class:'btn',onclick:()=>{CL.sys={...CL.sys,cfg:{sevLock:CFG.sevLock,mandRule:CFG.mandRule,fixes:CFG.fixes,minConf:CFG.minConf,due:{...CFG.due}}};renderAdmin();toast('Đã lấy tiêu chí trên máy này. Bấm Lưu cài đặt để áp dụng cho cả hệ thống.')}},'Dùng tiêu chí đang đặt trên máy này'),
      h('p',{class:'hint'},'Sửa tiêu chí ở Cài đặt → Tiêu chí & thời hạn, rồi quay lại bấm nút trên.')),
    h('div',{class:'dcard'},h('h3',null,'Lưu'),h('button',{class:'btn primary wide',onclick:clSysSave},'Lưu cài đặt hệ thống'),h('p',{class:'hint'},'Các máy nhận cài đặt mới khi mở lại app hoặc đăng nhập lại.')));
}
async function clSysSave(){
  const v={...CL.sys,org:$('csOrg').value.trim(),defaultSub:$('csSub').value.trim(),sessionDays:Math.max(1,Math.min(365,+$('csDays').value||30)),lockCrit:$('csLock').checked,auditorDelete:$('csDel').checked};
  if(v.lockCrit&&!v.cfg)v.cfg={sevLock:CFG.sevLock,mandRule:CFG.mandRule,fixes:CFG.fixes,minConf:CFG.minConf,due:{...CFG.due}};
  try{await api('PUT','/api/kv/sys',v);CL.sys=v;clLS('sys',v);clApplySys();toast('Đã lưu cài đặt hệ thống.');renderAdmin()}catch(e){toast(e.message)}
}
function clAdmLog(){
  const A=CL.adm;if(!A.log){api('GET','/api/admin/log').then(r=>{A.log=r.log||[];renderAdmin()}).catch(e=>toast(e.message));return h('p',{class:'hint'},'Đang tải nhật ký…')}
  return h('div',null,h('div',{class:'dhead'},h('h2',null,'Nhật ký hoạt động'),h('span',{class:'spacer'}),h('button',{class:'btn',onclick:()=>{A.log=null;renderAdmin()}},'Làm mới')),
    h('div',{class:'tscroll'},h('table',{class:'ftab cltab'},h('thead',null,h('tr',null,...['Thời gian','Người thực hiện','Thao tác','Đối tượng','Chi tiết'].map(t=>h('th',null,t)))),
      h('tbody',null,...A.log.map(l=>h('tr',null,h('td',null,vnDT(l.at)),h('td',null,l.user_name||l.user_email||'—'),h('td',null,ACT_L[l.action]||l.action),h('td',null,l.target||''),h('td',null,l.detail||'')))))));
}

/* ---------- Cài đặt → Tài khoản ---------- */
function renderAcct(){
  const C=$('setAcct');if(!C)return;
  if(!API){C.replaceChildren(h('h3',null,'Tài khoản'),h('p',{class:'hint'},'Bản này chưa nối máy chủ online.'));return}
  if(!clOn()){C.replaceChildren(h('h3',null,'Tài khoản'),h('p',{class:'hint'},'Chưa đăng nhập.'),h('button',{class:'btn primary',onclick:()=>clGate(true)},'Đăng nhập'));return}
  const u=CL.auth.user,a=CL.audit;
  C.replaceChildren(h('h3',null,'Tài khoản'),
    h('p',{class:'stat'},h('b',null,u.name),h('br'),u.email,h('br'),'Vai trò: ',h('span',{class:'pill '+(u.role==='admin'?'Priority':u.role==='auditor'?'okc':'Minor')},ROLE_L[u.role])),
    h('p',{class:'hint'},ROLE_D[u.role]),
    h('div',{class:'g2'},h('button',{class:'btn',onclick:()=>clPwDialog(false)},'Đổi mật khẩu'),h('button',{class:'btn',onclick:async()=>{const n=clQN();if(n){const v=await ask('Đăng xuất?',`Còn ${n} ảnh chưa lưu online. Dữ liệu vẫn giữ trên máy và tự lưu khi bạn đăng nhập lại.`,[{label:'Đăng xuất',cls:'danger',v:'go'},{label:'Hủy',v:null}]);if(v!=='go')return}clLogout()}},'Đăng xuất')),
    h('button',{class:'btn danger wide',onclick:clLogoutWipe},'Đăng xuất và xóa dữ liệu trên máy'),
    h('h3',null,'Lưu trữ online'),
    h('p',{class:'stat',id:'clSyncStat'}),
    h('p',{class:'hint'},a?`Audit đang mở: ${a.vendor||'(chưa nhập đối tác)'}${a.date?' · '+vnDate(a.date):''} · người tạo ${a.owner_name||'—'} · ${a.can_edit?'bạn được sửa':'chỉ xem'}.`:'Audit trên máy chưa lưu online. App tự tạo khi có ảnh.'),
    h('div',{class:'g2'},h('button',{class:'btn',onclick:()=>{clSync();toast('Đang đồng bộ…')}},'Đồng bộ ngay'),h('button',{class:'btn',onclick:()=>clGo('cloud')},'Mở Kho audit')),
    u.role==='admin'?h('div',{class:'cladm'},h('h3',null,'Quyền quản trị'),h('p',{class:'hint'},'Quản lý người dùng, phân quyền audit, cài đặt hệ thống và nhật ký hoạt động.'),h('button',{class:'btn primary wide',onclick:()=>clGo('admin')},'Mở trang Quản trị')):null);
  clStatus();
}

/* ---------- gắn vào giao diện ---------- */
DVS.push('cloud','admin');
{const _sd=setDView;setDView=function(v){if(v==='admin'&&!clAdmin())v='dash';_sd(v);if(v==='cloud')renderKho();if(v==='admin')renderAdmin()}}
{const _sv=setView;setView=function(v){if(!isMobile()&&(v==='cloud'||v==='admin'))return setDView(v);if(v==='admin'&&!clAdmin())v='review';_sv(v);if(v==='cloud')renderKho();if(v==='admin')renderAdmin();if(v==='set')renderAcct()}}
{const _rs=renderSettings;renderSettings=function(){_rs();renderAcct();clApplySys();const t=$('setAbout');if(t&&API)t.textContent=t.textContent.replace('Ảnh và dữ liệu chỉ lưu trên máy này','Ảnh và dữ liệu lưu trên máy và tự đồng bộ lên hệ thống online')}}
if(API){
  $('clUser').onclick=()=>{openSettings();setTab('acct');renderAcct()};
  $('clRoGo').onclick=()=>clGo('cloud');
  $('clForm').addEventListener('submit',clLogin);$('clPwForm').addEventListener('submit',clPwSave);$('clPwCancel').onclick=()=>$('dlgClPw').close();
  $('dlgClPw').addEventListener('cancel',e=>{if($('dlgClPw').dataset.force)e.preventDefault()});
  $('clUCancel').onclick=()=>$('dlgClUser').close();$('clMemCancel').onclick=()=>$('dlgClMem').close();$('clUGen').onclick=()=>{$('clUPw').value=clGenPw()};
  $('btnKho').onclick=()=>clGo('cloud');
  document.querySelectorAll('#setTabs>button[data-st="acct"]').forEach(b=>b.onclick=()=>{setTab('acct');renderAcct()});
  addEventListener('online',()=>clSoon(1500));
  setInterval(()=>{if(!document.hidden&&clOn())clSync()},45000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&clOn())clSoon(1000)});
  if(!clOn())clGate(true);else{const l=clLS('lastuser');if(CL.auth.user&&$('clEmail'))$('clEmail').value=CL.auth.user.email}
  clApply();
}else{document.querySelectorAll('.clonly').forEach(el=>el.hidden=true)}
