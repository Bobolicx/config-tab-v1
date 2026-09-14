const state={step:1,connection:null,power:null,board:null,items:[],ack:false,editing:null};
const boards=[12,24,36,48];
const fixed={general:{name:"Siguranță generală",modules:2},spd:{name:"SPD",modules:2}};
const breakers=[10,16,20,25,32].flatMap(a=>[
 {id:`1p-${a}`,name:`MCB ${a}A`,pole:"1P",modules:1,price:28},
 {id:`2p-${a}`,name:`MCB ${a}A`,pole:"2P",modules:2,price:55}
]);
const prices={general:95,spd:220,board:{12:110,24:160,36:220,48:290}};

function renderStepper(){
 document.getElementById("stepper").innerHTML=["Branșament","Tablou","Configurare","Rezumat"]
 .map((x,i)=>`<span class="step ${state.step===i+1?"active":""}">${i+1}. ${x}</span>`).join(" · ");
}
function btns(back=true){
 return `<div class="actions">${back?`<button class="btn secondary" onclick="back()">← Înapoi</button>`:"<span></span>"}
 <button class="btn primary" onclick="next()">Continuă →</button></div>`;
}
function render(){
 renderStepper();
 const s=document.getElementById("screen");
 if(state.step===1)s.innerHTML=`<div class="card"><h2>Ce tip de branșament ai?</h2>
 <p>Alege varianta care apare în documentele instalației tale.</p><div class="grid">
 <button class="option ${state.connection==="mono"?"selected":""}" onclick="chooseConn('mono')"><div class="icon">◉</div><h3>Branșament monofazat</h3><p>230 V · o fază</p></button>
 <button class="option ${state.connection==="tri"?"selected":""}" onclick="chooseConn('tri')"><div class="icon">◉◉◉</div><h3>Branșament trifazat</h3><p>400 V · trei faze</p></button></div>
 <h3 style="margin-top:32px">Puterea maximă</h3><p class="hint">Selectează puterea maximă aprobată / instalată.</p>
 <div class="power-grid">${[5,7,11,15,18,22,25,30].map(p=>`<button class="power ${state.power===p?"selected":""}" onclick="choosePower(${p})">${p} kW</button>`).join("")}</div>${btns(false)}</div>`;
 if(state.step===2)s.innerHTML=`<div class="card"><h2>Alege dimensiunea tabloului</h2>
 <p>Nu trebuie să știi ce înseamnă modulele. Alege doar cât de mare vrei să fie tabloul.</p>
 <div class="boards">${boards.map(n=>`<button class="board-option ${state.board===n?"selected":""}" onclick="chooseBoard(${n})">
 <div class="mini-board">${Array.from({length:Math.ceil(n/12)},()=>'<div class="mini-row"></div>').join("")}</div>
 <strong>${n} posturi</strong><div class="hint">${n===12?"compact":n===48?"spațios":"standard"}</div></button>`).join("")}</div>${btns()}</div>`;
 if(state.step===3)renderConfig(s);
 if(state.step===4)renderSummary(s);
}
function chooseConn(x){state.connection=x;render()}
function choosePower(x){state.power=x;render()}
function chooseBoard(x){state.board=x;render()}
function next(){
 if(state.step===1 && (!state.connection||!state.power))return alert("Alege branșamentul și puterea maximă.");
 if(state.step===2&&!state.board)return alert("Alege dimensiunea tabloului.");
 if(state.step<4)state.step++;
 render();
}
function back(){if(state.step>1)state.step--;render()}

function getUsed(){
 return fixed.general.modules+fixed.spd.modules+state.items.reduce((a,x)=>a+x.modules,0);
}
function occupiedMap(excludeIndex=-1){
 const rows=Math.ceil(state.board/12);
 const occupied=Array.from({length:rows},()=>Array(12).fill(false));
 occupied[0][0]=occupied[0][1]=occupied[0][2]=occupied[0][3]=true;
 state.items.forEach((x,i)=>{
   if(i===excludeIndex)return;
   for(let k=0;k<x.modules;k++) occupied[x.row][x.slot+k]=true;
 });
 return occupied;
}
function findPlacement(modules,excludeIndex=-1){
 const occupied=occupiedMap(excludeIndex);
 for(let r=0;r<occupied.length;r++){
   for(let slot=0;slot<=12-modules;slot++){
     let free=true;
     for(let k=0;k<modules;k++)if(occupied[r][slot+k])free=false;
     if(free)return {row:r,slot};
   }
 }
 return null;
}
function componentIcon(b){
 const amp=b.name.match(/\d+/)[0], pole=b.pole;
 const w=pole==="1P"?64:94;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="64" viewBox="0 0 ${w} 64">
 <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fafafa"/><stop offset=".65" stop-color="#d9dde1"/><stop offset="1" stop-color="#aeb5bb"/></linearGradient></defs>
 ${pole==="1P"?`<rect x="5" y="3" width="54" height="58" rx="3" fill="url(#g)" stroke="#68717a"/><rect x="14" y="10" width="36" height="18" rx="2" fill="#eef1f3" stroke="#8a9299"/><text x="32" y="23" text-anchor="middle" font-family="Arial" font-size="12" font-weight="700" fill="#222">${amp}A</text><rect x="22" y="32" width="20" height="7" rx="2" fill="#666e75"/><circle cx="32" cy="49" r="4" fill="#7d858c"/>`
 :`<rect x="5" y="3" width="40" height="58" rx="3" fill="url(#g)" stroke="#68717a"/><rect x="49" y="3" width="40" height="58" rx="3" fill="url(#g)" stroke="#68717a"/><rect x="12" y="10" width="26" height="18" rx="2" fill="#eef1f3" stroke="#8a9299"/><text x="25" y="23" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#222">${amp}A</text><rect x="56" y="10" width="26" height="18" rx="2" fill="#eef1f3" stroke="#8a9299"/><text x="69" y="23" text-anchor="middle" font-family="Arial" font-size="11" font-weight="700" fill="#222">${amp}A</text><rect x="21" y="34" width="52" height="7" rx="2" fill="#666e75"/>`}
 </svg>`;
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}

function renderConfig(s){
 const used=getUsed(), pct=Math.round(used/state.board*100), rows=Math.ceil(state.board/12);
 const rowHtml=Array.from({length:rows},(_,r)=>{
   const cells=Array.from({length:12},()=>`<div class="module empty"></div>`);
   if(r===0){
     cells[0]=`<div class="module fixed fixed-general"><span>GENERAL</span><small>2P</small></div>`;
     cells[1]=`<div class="module fixed fixed-general linked"></div>`;
     cells[2]=`<div class="module fixed fixed-spd"><span>SPD</span><small>2P</small></div>`;
     cells[3]=`<div class="module fixed fixed-spd linked"></div>`;
   }
   state.items.filter(x=>x.row===r).forEach((x)=>{
     for(let k=0;k<x.modules;k++){
       cells[x.slot+k]=`<button class="module added ${k===0?'item-start':''}" onclick="openChange(${x.uid})" title="Schimbă ${x.name}">
       ${k===0?`<span>${x.pole}</span><strong>${x.amp}A</strong>`:""}</button>`;
     }
   });
   return `<div class="din-row"><div class="din-rail"><div class="rail-metal"></div><div class="rail-track"></div>${cells.join("")}</div>
   <div class="rail-label">Șină DIN ${r+1}</div></div>`;
 }).join("");

 s.innerHTML=`<div class="config-layout">
 <aside class="card selector"><div class="selector-head"><div><h3>Adaugă siguranțe</h3>
 <p class="hint">Pe PC: Drag & Drop. Pe telefon: <strong>Adaugă</strong>. Orice siguranță adăugată poate fi schimbată ulterior.</p></div></div>
 <div class="component-list">${breakers.map(b=>`<div class="component" draggable="true" ondragstart="drag(event,'${b.id}')">
 <img src="${componentIcon(b)}" alt="${b.name}"><div class="component-info"><strong>${b.name}</strong><small>${b.pole} · ${b.modules} ${b.modules===1?"modul":"module"}</small><b>${b.price} lei</b></div>
 <button class="add-btn" onclick="addBreaker('${b.id}')">＋ Adaugă</button></div>`).join("")}</div></aside>
 <div><div class="board board-realistic" ondragover="event.preventDefault()" ondrop="drop(event)">
 <div class="board-header"><div><span class="board-kicker">CONFIGURAȚIE TABLOU</span><strong>Tablou ${state.board} posturi</strong><span>${state.connection==="tri"?"Trifazat":"Monofazat"} · ${state.power} kW</span></div><div class="board-status"><i></i> Configurabil</div></div>
 <div class="din-area">${rowHtml}</div><div class="board-hint">💡 Pe telefon apasă „Adaugă”. Apasă pe o siguranță din șină pentru a o schimba.</div></div>
 <div class="occupancy"><strong>${used} / ${state.board} posturi ocupate</strong><span style="float:right">${pct}%</span><div class="bar"><div style="width:${Math.min(pct,100)}%"></div></div>
 ${pct>75?`<div class="warning">⚠️ <strong>Ai depășit 75% din spațiul tabloului.</strong><br>Păstrează, pe cât posibil, o rezervă pentru extinderi viitoare.<div class="ack"><button class="btn primary" onclick="ackWarning()">Am înțeles</button></div></div>`:""}
 ${state.ack?`<p class="hint">✓ Ai confirmat avertizarea.</p>`:""}</div>${btns()}</div></div>`;
}

let dragged=null;
function drag(e,id){dragged=id}
function drop(e){e.preventDefault();if(dragged){addBreaker(dragged);dragged=null}}
function nextUid(){return Date.now()+Math.floor(Math.random()*10000)}
function addBreaker(id){
 const b=breakers.find(x=>x.id===id); if(!b)return;
 const placement=findPlacement(b.modules);
 if(!placement)return alert("Nu mai există suficient spațiu în tablou.");
 state.items.push({...b,amp:parseInt(b.name.match(/\d+/)[0]),row:placement.row,slot:placement.slot,uid:nextUid()});
 render();
}
function openChange(uid){state.editing=uid;renderChangeModal()}
function renderChangeModal(){
 let item=state.items.find(x=>x.uid===state.editing); if(!item)return;
 const modal=document.createElement("div"); modal.className="modal-backdrop";
 modal.innerHTML=`<div class="change-modal"><button class="modal-close" onclick="closeChange()">×</button>
 <h2>Schimbă siguranța</h2><p class="modal-sub">Poziția va rămâne aceeași dacă noua siguranță încape în spațiul disponibil.</p>
 <div class="change-filter"><span>Compatibil cu poziția selectată</span><strong>${item.modules} ${item.modules===1?"modul":"module"}</strong></div>
 <div class="change-list">${breakers.filter(b=>b.modules===item.modules).map(b=>`<button class="change-option ${b.id===item.id?"current":""}" onclick="changeBreaker('${b.id}')">
 <img src="${componentIcon(b)}"><span><strong>${b.name}</strong><small>${b.pole} · ${b.modules} ${b.modules===1?"modul":"module"} · ${b.price} lei</small></span>${b.id===item.id?'<b>✓</b>':''}</button>`).join("")}</div>
 <button class="delete-item" onclick="removeBreaker()">Șterge această siguranță</button></div>`;
 document.body.appendChild(modal);
}
function closeChange(){state.editing=null;document.querySelector(".modal-backdrop")?.remove()}
function changeBreaker(id){
 const idx=state.items.findIndex(x=>x.uid===state.editing); if(idx<0)return;
 const b=breakers.find(x=>x.id===id); if(!b)return;
 const item=state.items[idx];
 if(b.modules>item.modules){
   const test=findPlacement(b.modules,idx);
   if(!test || (test.row!==item.row || test.slot!==item.slot)){
     return alert("Noua siguranță are nevoie de mai multe module și nu încape în aceeași poziție. Alege o variantă care ocupă același număr de module.");
   }
 }
 item.id=b.id;item.name=b.name;item.pole=b.pole;item.modules=b.modules;item.price=b.price;item.amp=parseInt(b.name.match(/\d+/)[0]);
 closeChange();render();
}
function removeBreaker(){
 const idx=state.items.findIndex(x=>x.uid===state.editing);if(idx<0)return;
 state.items.splice(idx,1);closeChange();render();
}
function ackWarning(){state.ack=true;render()}

function renderSummary(s){
 const used=getUsed();
 const rows=[["Tablou",1,prices.board[state.board]],["Siguranță generală",1,prices.general],["SPD",1,prices.spd]];
 state.items.forEach(x=>{const found=rows.find(r=>r[0]===x.name);if(found)found[1]++;else rows.push([x.name,1,x.price])});
 const total=rows.reduce((a,r)=>a+r[1]*r[2],0);
 s.innerHTML=`<div class="card"><h2>Rezumatul configurației</h2><p>Ai configurat un tablou ${state.board} posturi pentru branșament ${state.connection==="tri"?"trifazat":"monofazat"}, ${state.power} kW.</p>
 <table class="bom"><thead><tr><th>Componentă</th><th>Cant.</th><th>Preț unitar</th><th>Total</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]} lei</td><td><strong>${r[1]*r[2]} lei</strong></td></tr>`).join("")}</tbody></table>
 <div class="total">Total materiale: ${total} lei</div><p class="hint">${used} / ${state.board} posturi ocupate · ${Math.round(used/state.board*100)}%</p>
 <div class="actions"><button class="btn secondary" onclick="back()">← Modifică</button><button class="btn primary" onclick="alert('Exportul PDF și trimiterea configurației vor fi adăugate ulterior.')">Finalizează configurația</button></div></div>`;
}
render();
