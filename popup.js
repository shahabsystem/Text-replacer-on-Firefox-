const api=browser;
async function refresh(){
  const d=await api.storage.local.get({enabled:true,rules:[]});
  enabled.checked=d.enabled; count.textContent=d.rules.filter(r=>r.enabled!==false).length;
  rules.innerHTML=d.rules.slice(0,5).map(r=>`<div class="mini"><span>${esc(r.from)}</span><b>→</b><span>${esc(r.to)}</span></div>`).join("") || '<div class="muted">هنوز قانونی ثبت نشده است.</div>';
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
enabled.onchange=async()=>{await api.storage.local.set({enabled:enabled.checked});refresh()};
options.onclick=()=>api.runtime.openOptionsPage();
refresh();