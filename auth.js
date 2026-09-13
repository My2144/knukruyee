const NARA2_SUPABASE_URL='https://pjzgoqbnbqwqacyyvzxa.supabase.co';
const NARA2_SUPABASE_KEY='sb_publishable_J8tgwn1RxrQLU2OjF8dXFg_1ngKSdho';
const NARA2_SESSION_KEY='nara2_session';

function saveSession(session){localStorage.setItem(NARA2_SESSION_KEY,JSON.stringify(session));}
function getSession(){try{return JSON.parse(localStorage.getItem(NARA2_SESSION_KEY)||'null')}catch{return null}}
function clearSession(){localStorage.removeItem(NARA2_SESSION_KEY)}

async function signIn(email,password){
  const r=await fetch(`${NARA2_SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:NARA2_SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  const j=await r.json(); if(!r.ok) throw new Error(j.error_description||j.msg||'เข้าสู่ระบบไม่สำเร็จ'); saveSession(j); return j;
}
async function refreshSession(){
  const s=getSession(); if(!s?.refresh_token) return null;
  const r=await fetch(`${NARA2_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:NARA2_SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:s.refresh_token})});
  if(!r.ok){clearSession();return null} const j=await r.json(); saveSession(j); return j;
}
async function authFetch(path,options={}){
  let s=getSession(); if(!s) throw new Error('NO_SESSION');
  if(s.expires_at && Date.now()/1000 > s.expires_at-30) s=await refreshSession();
  if(!s) throw new Error('NO_SESSION');
  const headers={apikey:NARA2_SUPABASE_KEY,Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json',...(options.headers||{})};
  return fetch(`${NARA2_SUPABASE_URL}${path}`,{...options,headers});
}
async function getMyProfile(){
  const s=getSession(); if(!s?.user?.id) return null;
  const r=await authFetch(`/rest/v1/profiles?id=eq.${s.user.id}&select=id,display_name,role,school_id`);
  if(!r.ok) return null; return (await r.json())[0]||null;
}
async function requireAuth(roles=[]){
  const s=getSession(); if(!s){location.href='login.html';return null}
  const p=await getMyProfile(); if(!p){clearSession();location.href='login.html';return null}
  if(roles.length&&!roles.includes(p.role)){location.href='unauthorized.html';return null}
  return p;
}
async function signOut(){
  const s=getSession(); try{if(s?.access_token) await fetch(`${NARA2_SUPABASE_URL}/auth/v1/logout`,{method:'POST',headers:{apikey:NARA2_SUPABASE_KEY,Authorization:`Bearer ${s.access_token}`}})}catch{} clearSession(); location.href='login.html';
}
function roleLabel(role){return {admin:'ผู้ดูแลระบบ',area_staff:'เจ้าหน้าที่เขตพื้นที่',school_admin:'ผู้ดูแลโรงเรียน',viewer:'ผู้ใช้งานทั่วไป'}[role]||role}
