const qs=new URLSearchParams(location.search),view=qs.get('view')||'overview';
const SB='https://pjzgoqbnbqwqacyyvzxa.supabase.co',KEY='sb_publishable_J8tgwn1RxrQLU2OjF8dXFg_1ngKSdho';
const meta={overview:['ข้อมูลภาพรวม','สรุปข้อมูลสำคัญของ สพป.นราธิวาส เขต 2','ภาพรวม'],schools:['โรงเรียนในสังกัด','รายชื่อและข้อมูลภาพรวมโรงเรียน 117 แห่ง','117 โรงเรียน'],students:['ข้อมูลนักเรียนภาพรวม','แสดงจำนวนนักเรียนแบบภาพรวม ไม่เปิดเผยข้อมูลรายบุคคล','ข้อมูลสาธารณะ'],staff:['ครูและบุคลากรภาพรวม','แสดงกำลังคนภาพรวมของโรงเรียนในสังกัด','ข้อมูลสาธารณะ'],retirements:['ผู้เกษียณอายุราชการ','สรุปจำนวนผู้เกษียณรายปีเพื่อใช้วางแผนอัตรากำลัง','ข้อมูลสาธารณะ'],achievement:['ผลสัมฤทธิ์ทางการเรียน','ข้อมูลผลสัมฤทธิ์สำหรับการวิเคราะห์และบริหารจัดการ','ต้องเข้าสู่ระบบเพื่อดูรายละเอียด'],dropout:['OBEC Zero Dropout','ข้อมูลติดตามผู้เรียนที่มีความเสี่ยงและต้องคุ้มครองข้อมูลส่วนบุคคล','จำกัดสิทธิ์'],documents:['ดาวน์โหลดเอกสาร','คลังเอกสารและแบบฟอร์มของระบบ','คลังเอกสาร']};
const [title,desc,badge]=meta[view]||meta.overview;pageTitle.textContent=title;pageDesc.textContent=desc;pageBadge.textContent=badge;panelTitle.textContent=title;
function fmt(n){return Number(n||0).toLocaleString('th-TH')}
async function pub(table,q=''){const r=await fetch(`${SB}/rest/v1/${table}?${q}`,{headers:{apikey:KEY,Authorization:`Bearer ${KEY}`}});if(!r.ok)throw new Error(table);return r.json()}
function card(label,value,unit=''){return `<div class="mini"><small>${label}</small><b>${fmt(value)}</b><span>${unit}</span></div>`}
function table(headers,rows){return `<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c??'-'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
let schoolData=[];
function setupFilters(){const d=[...new Set(schoolData.map(x=>x.districts?.name).filter(Boolean))];districtFilter.innerHTML='<option value="">ทุกอำเภอ</option>'+d.map(x=>`<option>${x}</option>`).join('');districtFilter.onchange=renderSchools;searchBox.oninput=renderSchools}
function renderSchools(){let a=schoolData;const d=districtFilter.value,s=searchBox.value.trim().toLowerCase();if(d)a=a.filter(x=>x.districts?.name===d);if(s)a=a.filter(x=>(x.name||'').toLowerCase().includes(s)||(x.school_code||'').toLowerCase().includes(s));content.innerHTML=table(['รหัส','โรงเรียน','อำเภอ','นักเรียน','ครู'],a.map(x=>[x.school_code,x.name,x.districts?.name||'-',fmt(x.student_count),fmt(x.teacher_count)]))}
async function init(){const sess=getSession();if(sess){const p=await getMyProfile();sectionUser.innerHTML=p?`<span style="font-size:13px;color:#55708f">${p.display_name||''} • ${roleLabel(p.role)}</span>`:''}else sectionUser.innerHTML='<a class="login-link" style="margin:0" href="login.html">เข้าสู่ระบบจัดการข้อมูล</a>';
try{
 const k=(await pub('kpi_snapshots','select=*&order=academic_year.desc&limit=1'))[0]||{};
 cards.innerHTML=card('โรงเรียน',k.schools,' โรงเรียน')+card('นักเรียน',k.students,' คน')+card('ครู',k.teachers,' คน')+card('บุคลากรเขต',k.area_staff,' คน');
 if(['overview','schools','students','staff'].includes(view)){
  schoolData=await pub('schools','select=school_code,name,student_count,teacher_count,districts(name)&order=name');setupFilters();
  if(view==='overview'){const ds={};schoolData.forEach(x=>{const n=x.districts?.name||'ไม่ระบุ';ds[n]=(ds[n]||0)+1});content.innerHTML=table(['อำเภอ','จำนวนโรงเรียน'],Object.entries(ds).map(([a,b])=>[a,fmt(b)]));districtFilter.style.display='none';searchBox.style.display='none'}
  else if(view==='schools')renderSchools();
  else if(view==='students'){content.innerHTML=table(['โรงเรียน','อำเภอ','นักเรียน'],schoolData.map(x=>[x.name,x.districts?.name||'-',fmt(x.student_count)]));}
  else if(view==='staff'){content.innerHTML=table(['โรงเรียน','อำเภอ','ครู'],schoolData.map(x=>[x.name,x.districts?.name||'-',fmt(x.teacher_count)]));}
 } else if(view==='retirements'){
  districtFilter.style.display='none';searchBox.style.display='none';const r=await pub('retirements','select=buddhist_year,teachers,support_staff,is_demo&order=buddhist_year');content.innerHTML=table(['ปี พ.ศ.','ครู','สายสนับสนุน','รวม','สถานะ'],r.map(x=>[x.buddhist_year,fmt(x.teachers),fmt(x.support_staff),fmt(x.teachers+x.support_staff),x.is_demo?'ข้อมูลสาธิต':'ข้อมูลจริง']));
 } else if(view==='achievement'||view==='dropout'){
  districtFilter.style.display='none';searchBox.style.display='none';content.innerHTML=`<div class="notice-box"><b>${view==='dropout'?'ข้อมูลส่วนบุคคลได้รับการคุ้มครอง':'รายละเอียดสำหรับผู้รับผิดชอบ'}</b><br>หน้านี้เปิดให้ดูเฉพาะผู้มีสิทธิ์เมื่อเข้าสู่ระบบ เพื่อไม่เปิดเผยข้อมูลที่ไม่ควรเผยแพร่ต่อสาธารณะ<br><a class="login-link" href="login.html">เข้าสู่ระบบเพื่อจัดการข้อมูล</a></div>`;
 } else if(view==='documents'){
  districtFilter.style.display='none';searchBox.style.display='none';try{const docs=await pub('documents','select=category,title,file_url,published_date,active&active=eq.true&order=published_date.desc');content.innerHTML=docs.length?table(['หมวด','ชื่อเอกสาร','วันที่','ดาวน์โหลด'],docs.map(x=>[x.category,x.title,x.published_date,`<a href="${x.file_url}" target="_blank">เปิดไฟล์</a>`])):'ยังไม่มีเอกสารสาธารณะ'}catch{content.innerHTML='<div class="notice-box">เอกสารบางส่วนกำหนดให้ผู้มีสิทธิ์เข้าสู่ระบบก่อนใช้งาน</div>'}
 }
}catch(e){content.innerHTML='<div class="notice-box">ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง</div>'}}
init();