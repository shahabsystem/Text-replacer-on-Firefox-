const api=browser;
let data={enabled:true,rules:[]};

async function init(){data=await api.storage.local.get(data); global.checked=data.enabled; render();}
function render(){
  list.innerHTML="";
  data.rules.forEach((r,i)=>{
    const el=document.createElement("div"); el.className="rule";
    el.innerHTML=`
      <div class="ruletop"><b>قانون ${i+1}</b><button class="danger del">حذف</button></div>
      <div class="grid">
        <label>متن اصلی<input class="from" value="${attr(r.from)}" placeholder="مثلاً حامد"></label>
        <label>متن جایگزین<input class="to" value="${attr(r.to)}" placeholder="مثلاً حامد خان"></label>
        <label>فقط در سایت‌های مشخص<input class="sites" value="${attr(r.sites||"")}" placeholder="example.com, example.org"></label>
      </div>
      <div class="checks">
        <label><input class="active" type="checkbox" ${r.enabled!==false?"checked":""}> فعال</label>
        <label><input class="case" type="checkbox" ${r.caseSensitive?"checked":""}> حساس به حروف بزرگ/کوچک</label>
      </div>`;
    el.querySelector(".del").onclick=()=>{data.rules.splice(i,1);save();};
    ["from","to","sites","active","case"].forEach(c=>el.querySelector("."+c).addEventListener("input",()=>update(i,el)));
    ["active","case"].forEach(c=>el.querySelector("."+c).addEventListener("change",()=>update(i,el)));
    list.appendChild(el);
  });
}
function update(i,el){
 const q=s=>el.querySelector("."+s);
 data.rules[i]={...data.rules[i],from:q("from").value,to:q("to").value,sites:q("sites").value,
 enabled:q("active").checked,caseSensitive:q("case").checked};
 save(false);
}
let timer;
async function save(notify=true){clearTimeout(timer);timer=setTimeout(async()=>{await api.storage.local.set(data);if(notify)toast("ذخیره شد ✓");},150);}
function attr(s){return String(s??"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1300);}
add.onclick=()=>{data.rules.push({from:"حامد",to:"حامد خان",enabled:true,caseSensitive:false,sites:""});render();save();};
global.onchange=()=>{data.enabled=global.checked;save();};
toggle.onclick=()=>{data.enabled=!data.enabled;global.checked=data.enabled;save();};
init();