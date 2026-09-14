const state={
  step:1, connection:null, power:null, board:null, items:[], uid:1,
  lastGood:null, dragUid:null
};

const powers=[5,7,11,15,18,22,25,30];
const boards=[12,24,36,48];
const categories=[
 {name:"MCB 1P+N", items:[
  ["mcb-10","MCB 1P+N · 10 A",2,"10 A · 1P+N"],["mcb-16","MCB 1P+N · 16 A",2,"16 A · 1P+N"],
  ["mcb-20","MCB 1P+N · 20 A",2,"20 A · 1P+N"],["mcb-25","MCB 1P+N · 25 A",2,"25 A · 1P+N"],
  ["mcb-32","MCB 1P+N · 32 A",2,"32 A · 1P+N"]]},
 {name:"RCCB / DDR",items:[
  ["rccb-25","RCCB · 25 A · 30 mA",2,"2P · 30 mA"],["rccb-40","RCCB · 40 A · 30 mA",2,"2P · 30 mA"],["rccb-63","RCCB · 63 A · 30 mA",2,"2P · 30 mA"],
  ["rccb-40-4p","RCCB · 40 A · 4P · 30 mA",4,"4P · 30 mA"],["rccb-63-4p","RCCB · 63 A · 4P · 30 mA",4,"4P · 30 mA"]]},
 {name:"RCBO",items:[
  ["rcbo-10","RCBO · 10 A · 30 mA",2,"1P+N · 30 mA"],["rcbo-16","RCBO · 16 A · 30 mA",2,"1P+N · 30 mA"],
  ["rcbo-20","RCBO · 20 A · 30 mA",2,"1P+N · 30 mA"],["rcbo-25","RCBO · 25 A · 30 mA",2,"1P+N · 30 mA"],["rcbo-32","RCBO · 32 A · 30 mA",2,"1P+N · 30 mA"]]},
 {name:"AFDD",items:[
  ["afdd-16","AFDD · 16 A",2,"1P+N · protecție arc"],["afdd-20","AFDD · 20 A",2,"1P+N · protecție arc"],["afdd-25","AFDD · 25 A",2,"1P+N · protecție arc"],["afdd-32","AFDD · 32 A",2,"1P+N · protecție arc"]]},
 {name:"SPD",items:[
  ["spd-t2","SPD · Tip 2",2,"protecție la supratensiuni"],["spd-t1t2","SPD · Tip 1+2",4,"protecție combinată"],["spd-t3","SPD · Tip 3",2,"protecție fină"]]},
 {name:"Contactori și relee",items:[
  ["cont-2p","Contactor · 2P",2,"comandă 2P"],["cont-4p","Contactor · 4P",4,"comandă 4P"],["relay-phase","Releu monitorizare fază",2,"monitorizare faze"]]}
];

const byId={};
categories.forEach(c=>c.items.forEach(x=>byId[x[0]]={id:x[0],name:x[1],modules:x[2],detail:x[3],category:c.name}));

function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

function iconSvg(id, label){
  const is4=(byId[id]?.modules||2)>=4;
  let body="";
  if(id.startsWith("spd")) body=`<rect x="10" y="7" width="${is4?80:44}" height="72" rx="3" fill="#eef1f3" stroke="#39434b"/><path d="M${is4?25:20} 18h${is4?50:24}v8h-${is4?50:24}zM${is4?25:20} 34h${is4?50:24}v8h-${is4?50:24}zM${is4?25:20} 50h${is4?50:24}v8h-${is4?50:24}z" fill="#c5cdd2"/><text x="${is4?50:32}" y="72" font-size="9" text-anchor="middle" font-weight="700">SPD</text>`;
  else if(id.startsWith("rccb")) body=`<rect x="10" y="7" width="${is4?80:44}" height="72" rx="3" fill="#fff" stroke="#39434b"/><circle cx="${is4?50:32}" cy="27" r="9" fill="none" stroke="#39434b" stroke-width="2"/><path d="M${is4?42:24} 52h16" stroke="#39434b" stroke-width="3"/><text x="${is4?50:32}" y="70" font-size="8" text-anchor="middle" font-weight="700">RCCB</text>`;
  else if(id.startsWith("afdd")) body=`<rect x="10" y="7" width="44" height="72" rx="3" fill="#fff" stroke="#39434b"/><path d="M20 22h24M20 30h24M20 38h14" stroke="#39434b"/><text x="32" y="65" font-size="8" text-anchor="middle" font-weight="700">AFDD</text>`;
  else if(id.startsWith("cont")) body=`<rect x="10" y="7" width="${is4?80:44}" height="72" rx="3" fill="#f4f5f6" stroke="#39434b"/><path d="M20 23h${is4?60:24}M20 39h${is4?60:24}M20 55h${is4?60:24}" stroke="#39434b" stroke-width="3"/><text x="${is4?50:32}" y="71" font-size="8" text-anchor="middle" font-weight="700">CONT.</text>`;
  else if(id==="relay-phase") body=`<rect x="10" y="7" width="44" height="72" rx="3" fill="#f4f5f6" stroke="#39434b"/><circle cx="32" cy="27" r="7" fill="none" stroke="#39434b"/><path d="M20 48h24M20 56h24" stroke="#39434b"/><text x="32" y="71" font-size="7" text-anchor="middle" font-weight="700">PHASE</text>`;
  else body=`<rect x="10" y="7" width="44" height="72" rx="3" fill="#fff" stroke="#39434b"/><path d="M20 22h24M20 31h24M20 40h15" stroke="#39434b" stroke-width="2"/><circle cx="32" cy="58" r="7" fill="none" stroke="#39434b"/><text x="32" y="72" font-size="8" text-anchor="middle" font-weight="800">${esc((label.match(/\d+/)||[""])[0])}</text>`;
  return `<svg viewBox="0 0 ${is4?100:64} 86" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}

function setStep(n){
  state.step=n;
  document.querySelectorAll(".step-panel").forEach((el,i)=>el.classList.toggle("hidden",i!==n-1));
  document.querySelectorAll(".step").forEach((el,i)=>{el.classList.toggle("active",i===n-1);el.classList.toggle("done",i<n-1)});
  document.getElementById("stepPill").textContent=`Pasul ${n} din 5`;
  if(n===4){renderCabinet();renderCatalog();}
  if(n===5) renderSummary();
  window.scrollTo({top:0,behavior:"smooth"});
}

function selectConnection(v){
  state.connection=v;
  document.querySelectorAll("[data-connection]").forEach(x=>x.classList.toggle("selected",x.dataset.connection===v));
  document.getElementById("to2").disabled=false;
}
function renderPowers(){
  const el=document.getElementById("powerGrid");
  el.innerHTML=powers.map(p=>`<button class="choice ${state.power===p?"selected":""}" data-power="${p}"><strong>${p} kW</strong><small>${state.connection==="tri"?"trifazat":"monofazat"}</small></button>`).join("");
  el.querySelectorAll("[data-power]").forEach(b=>b.onclick=()=>{state.power=+b.dataset.power;renderPowers();document.getElementById("to3").disabled=false});
}
function renderBoards(){
  const el=document.getElementById("boardGrid");
  el.innerHTML=boards.map(n=>{
    const rows=Math.ceil(n/12);
    return `<button class="board-card ${state.board===n?"selected":""}" data-board="${n}">
      <div class="board-visual">${Array.from({length:rows},()=>`<div class="board-row-mini"></div>`).join("")}</div>
      <strong>${n} module DIN</strong><small>${rows} șine × 12 module</small>
    </button>`;
  }).join("");
  el.querySelectorAll("[data-board]").forEach(b=>b.onclick=()=>{state.board=+b.dataset.board;renderBoards();document.getElementById("to4").disabled=false});
}

function fixedDevices(){
  const generalModules=state.connection==="tri"?4:2;
  const spdModules=state.connection==="tri"?4:2;
  return [
    {uid:"fixed-general",id:"fixed-general",name:`Siguranță generală · ${state.power} kW`,modules:generalModules,fixed:true,row:0,slot:0},
    {uid:"fixed-spd",id:"spd-t2",name:"SPD · Tip 2",modules:spdModules,fixed:true,row:0,slot:generalModules}
  ];
}

function rowsCount(){return Math.ceil(state.board/12)}
function occupied(){
  const map=Array.from({length:rowsCount()},()=>Array(12).fill(null));
  fixedDevices().forEach(d=>placeOnMap(map,d));
  state.items.forEach(d=>placeOnMap(map,d));
  return map;
}
function placeOnMap(map,d){
  if(d.row==null||d.slot==null)return;
  for(let i=0;i<d.modules;i++) if(map[d.row]&&d.slot+i<12) map[d.row][d.slot+i]=d.uid;
}
function findSlot(modules, ignoreUid=null){
  const map=occupied();
  for(let r=0;r<map.length;r++){
    for(let s=0;s<=12-modules;s++){
      let ok=true;
      for(let k=0;k<modules;k++){
        const u=map[r][s+k];
        if(u && u!==ignoreUid){ok=false;break}
      }
      if(ok)return {row:r,slot:s};
    }
  }
  return null;
}
function placeDevice(device,pos){device.row=pos.row;device.slot=pos.slot}
function addDevice(id){
  const b=byId[id]; if(!b)return;
  const pos=findSlot(b.modules);
  if(!pos){showOverflow(`Nu există ${b.modules} module libere consecutive pe șine pentru „${b.name}”.`);return}
  state.items.push({...b,uid:"u"+state.uid++ ,row:pos.row,slot:pos.slot});
  renderCabinet();
  showToast(`${b.name} adăugat.`);
}
function replaceDevice(uid,id){
  const idx=state.items.findIndex(x=>x.uid===uid); if(idx<0)return;
  const old=state.items[idx], b=byId[id];
  const pos=findSlot(b.modules,uid);
  if(!pos){
    showOverflow(`„${b.name}” nu încape pe șine. Varianta anterioară a fost păstrată.`);
    return;
  }
  state.items[idx]={...b,uid:uid,row:pos.row,slot:pos.slot};
  renderCabinet();
}
function removeDevice(uid){
  state.items=state.items.filter(x=>x.uid!==uid);renderCabinet();showToast("Aparatul a fost eliminat.");
}

function renderCabinet(){
  if(!state.board)return;
  const cab=document.getElementById("cabinet");
  const map=occupied();
  document.getElementById("cabinetTitle").textContent=`Tablou ${state.board} module`;
  document.getElementById("cabinetMeta").textContent=`${state.connection==="tri"?"Trifazat":"Monofazat"} · ${state.power} kW`;
  cab.innerHTML="";
  for(let r=0;r<rowsCount();r++){
    const row=document.createElement("div");row.className="din-row";row.dataset.row=r;
    for(let s=0;s<12;s++){
      const slot=document.createElement("div");slot.className="module-slot";slot.dataset.row=r;slot.dataset.slot=s;
      slot.ondragover=e=>{e.preventDefault();slot.classList.add("drop-target")};
      slot.ondragleave=()=>slot.classList.remove("drop-target");
      slot.ondrop=e=>{
        e.preventDefault();slot.classList.remove("drop-target");
        const uid=e.dataTransfer.getData("uid");moveDevice(uid,r,s);
      };
      row.appendChild(slot);
    }
    cab.appendChild(row);
  }
  const all=[...fixedDevices(),...state.items];
  all.forEach(d=>{
    const row=cab.querySelectorAll(".din-row")[d.row];
    if(!row)return;
    const slot=row.querySelectorAll(".module-slot")[d.slot];
    if(!slot)return;
    const device=document.createElement("div");
    device.className="device"+(d.fixed?" fixed":"");
    device.style.left=`${d.slot*(100/12)}%`;
    device.style.width=`${d.modules*(100/12)}%`;
    device.innerHTML=iconSvg(d.id,d.name);
    if(!d.fixed){
      device.draggable=true;
      device.dataset.uid=d.uid;
      device.ondragstart=e=>{e.dataTransfer.setData("uid",d.uid);state.dragUid=d.uid};
      device.ondblclick=()=>openReplace(d.uid);
      device.onclick=()=>openReplace(d.uid);
      const label=document.createElement("div");label.className="device-label";label.textContent=d.name;device.appendChild(label);
      device.title="Click pentru schimbare · trage pentru mutare";
    }else{
      device.title=d.name;
    }
    slot.appendChild(device);
  });
  updateOccupancy();
}
function moveDevice(uid,row,slot){
  const d=state.items.find(x=>x.uid===uid);if(!d)return;
  // temporarily remove it from occupancy by testing against all others
  const old={row:d.row,slot:d.slot};
  d.row=row;d.slot=slot;
  const map=occupied();
  let valid=slot+d.modules<=12;
  for(let k=0;k<d.modules;k++){
    const u=map[row]?.[slot+k];
    if(u && u!==uid)valid=false;
  }
  if(!valid){
    d.row=old.row;d.slot=old.slot;
    showOverflow("Poziția aleasă nu este disponibilă. Aparatul a revenit la poziția anterioară.");
  }else{
    showToast("Poziția aparatului a fost modificată.");
  }
  renderCabinet();
}
function openReplace(uid){
  const d=state.items.find(x=>x.uid===uid);if(!d)return;
  const opts=categories.flatMap(c=>c.items.map(x=>byId[x[0]])).filter(x=>!d.fixed);
  const old=state.items.find(x=>x.uid===uid);
  const html=`<div style="position:fixed;inset:0;background:#0006;z-index:40;display:grid;place-items:center;padding:18px" id="replaceModal">
    <div style="background:#fff;max-width:720px;width:100%;max-height:85vh;overflow:auto;border-radius:12px;padding:18px">
      <div style="display:flex;justify-content:space-between;gap:12px"><div><b>Schimbă aparatul</b><p style="margin:5px 0;color:#697680">Poți alege orice aparat din catalog. Dacă nu încape, configurația actuală rămâne neschimbată.</p></div><button class="secondary" id="closeReplace">Închide</button></div>
      <div class="catalog-items" style="margin-top:12px">${opts.map(x=>`<button class="product" data-repl="${x.id}"><span class="iconbox">${iconSvg(x.id,x.name)}</span><span><strong>${esc(x.name)}</strong><small>${esc(x.detail)} · ${x.modules} module</small></span><span class="add">Alege</span></button>`).join("")}</div>
      <button class="secondary" id="deleteDevice" style="margin-top:12px">Șterge aparatul</button>
    </div></div>`;
  document.body.insertAdjacentHTML("beforeend",html);
  document.querySelectorAll("[data-repl]").forEach(b=>b.onclick=()=>{replaceDevice(uid,b.dataset.repl);document.getElementById("replaceModal").remove()});
  document.getElementById("deleteDevice").onclick=()=>{removeDevice(uid);document.getElementById("replaceModal").remove()};
  document.getElementById("closeReplace").onclick=()=>document.getElementById("replaceModal").remove();
}
function renderCatalog(){
  document.getElementById("catalog").innerHTML=categories.map(c=>`<div class="catalog-group"><h4>${esc(c.name)}</h4><div class="catalog-items">${
    c.items.map(x=>{const b=byId[x[0]];return `<button class="product" data-add="${b.id}"><span class="iconbox">${iconSvg(b.id,b.name)}</span><span><strong>${esc(b.name)}</strong><small>${esc(b.detail)} · ${b.modules} module</small></span><span class="add">＋</span></button>`}).join("")
  }</div></div>`).join("");
  document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addDevice(b.dataset.add));
}
function updateOccupancy(){
  const used=fixedDevices().reduce((a,d)=>a+d.modules,0)+state.items.reduce((a,d)=>a+d.modules,0);
  const total=state.board;
  const pct=total?used/total*100:0;
  document.getElementById("occupancy").textContent=`${used} / ${total} module`;
  const t=document.getElementById("occupancyText");
  t.textContent=pct>90?"Configurație nerecomandată":pct>75?"Rezervă redusă":"Rezervă bună";
  t.className=pct>90?"bad":pct>75?"warn":"ok";
}
function showOverflow(msg){
  const el=document.getElementById("overflowMessage");el.textContent=msg;el.classList.remove("hidden");
  clearTimeout(showOverflow.timer);showOverflow.timer=setTimeout(()=>el.classList.add("hidden"),4200);
}
function showToast(msg){
  const el=document.getElementById("toast");el.textContent=msg;el.classList.remove("hidden");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.add("hidden"),1800);
}
function renderSummary(){
  const used=fixedDevices().reduce((a,d)=>a+d.modules,0)+state.items.reduce((a,d)=>a+d.modules,0);
  const pct=Math.round(used/state.board*100);
  const groups={};state.items.forEach(x=>groups[x.category]=(groups[x.category]||0)+1);
  document.getElementById("summary").innerHTML=`<div class="summary-grid">
   <div class="summary-card"><h4>Branșament</h4><p>${state.connection==="tri"?"Trifazat":"Monofazat"}</p><p>${state.power} kW</p></div>
   <div class="summary-card"><h4>Tablou</h4><p>${state.board} module DIN</p><p>Ocupare: ${used}/${state.board} (${pct}%)</p></div>
   <div class="summary-card"><h4>Aparataj</h4>${Object.entries(groups).map(([k,v])=>`<p>${esc(k)}: ${v}</p>`).join("")||"<p>Nu ai adăugat aparataj.</p>"}</div>
  </div>
  <div class="summary-card" style="margin-top:12px"><h4>Observații</h4>
   <p class="ok">✓ Verificarea spațiului pe șine este activă.</p>
   <p class="${pct>75?"warn":"ok"}">${pct>75?"⚠ Ocuparea depășește pragul intern recomandat de 75%; este recomandată o rezervă mai mare.":"✓ Ocuparea este sub pragul intern de 75%."}</p>
   <p>Regulile normative detaliate privind dimensionarea conductorului, alegerea protecției, DDR, SPD, căderea de tensiune și coordonarea protecțiilor trebuie integrate în motorul tehnic înainte de utilizarea configuratorului ca instrument de proiectare.</p>
  </div>`;
}

document.querySelectorAll("[data-connection]").forEach(b=>b.onclick=()=>selectConnection(b.dataset.connection));
document.getElementById("to2").onclick=()=>{renderPowers();setStep(2)};
document.getElementById("back1").onclick=()=>setStep(1);
document.getElementById("to3").onclick=()=>{renderBoards();setStep(3)};
document.getElementById("back2").onclick=()=>setStep(2);
document.getElementById("to4").onclick=()=>setStep(4);
document.getElementById("back3").onclick=()=>setStep(3);
document.getElementById("to5").onclick=()=>setStep(5);
document.getElementById("back4").onclick=()=>setStep(4);
document.querySelectorAll(".step").forEach(b=>b.onclick=()=>{const n=+b.dataset.step;if(n<=state.step)setStep(n)});

setStep(1);
