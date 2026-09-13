(()=>{
  const RETRIES=[250,700,1400,2600,4500];
  let fallbackTried=false;
  const hint=()=>document.getElementById('chartHint');
  function setHint(msg,bad=false){const h=hint();if(!h)return;h.textContent=msg||'';h.style.fontSize='11px';h.style.color=bad?'#b42318':'#718196';}
  function hasChart(){return typeof window.Chart==='function';}
  function loadFallbackChart(){return new Promise((resolve,reject)=>{if(hasChart())return resolve();if(fallbackTried)return reject(new Error('Chart.js unavailable'));fallbackTried=true;const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.7/chart.umd.min.js';s.onload=()=>hasChart()?resolve():reject(new Error('Chart.js unavailable'));s.onerror=reject;document.head.appendChild(s);});}
  async function safeRender(){
    try{
      if(!hasChart()){setHint('กำลังโหลดระบบกราฟ...');await loadFallbackChart();}
      if(typeof renderInteractiveDashboard!=='function')return;
      if(typeof naraDashBusy!=='undefined'&&naraDashBusy)return;
      await renderInteractiveDashboard();
      const a=document.getElementById('mainChart'),b=document.getElementById('donutChart');
      const rendered=(a&&a.width>0&&a.height>0&&naraMainChart)||(b&&b.width>0&&b.height>0&&naraDonutChart);
      if(rendered)setHint('Interactive • ปรับตามตัวกรองอัตโนมัติ');
    }catch(err){console.warn('chart runtime',err);setHint('ไม่สามารถแสดงกราฟได้ กำลังลองใหม่...',true);}
  }
  RETRIES.forEach(ms=>setTimeout(safeRender,ms));
  ['searchBox','districtFilter','yearFilter'].forEach(id=>{const el=document.getElementById(id);if(el){el.addEventListener('input',()=>setTimeout(safeRender,60));el.addEventListener('change',()=>setTimeout(safeRender,60));}});
  const targets=['content','recordCount','cards'].map(id=>document.getElementById(id)).filter(Boolean);
  const obs=new MutationObserver(()=>{clearTimeout(window.__naraRuntimeTimer);window.__naraRuntimeTimer=setTimeout(safeRender,120)});
  targets.forEach(t=>obs.observe(t,{childList:true,subtree:true,characterData:true}));
  window.addEventListener('resize',()=>{clearTimeout(window.__naraResizeTimer);window.__naraResizeTimer=setTimeout(()=>{try{naraMainChart?.resize();naraDonutChart?.resize();}catch{}},120)});
})();