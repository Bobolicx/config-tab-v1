/* V5 = V4 păstrat ca structură, cu catalog + șine DIN interactive. */
const state={step:1,connection:null,power:null,board:null,items:[],ack:false,editing:null,dragged:null};
const boards=[12,24,36,48];
const fixed={general:{name:"Siguranță generală",modules:2},spd:{name:"SPD",modules:2}};

const catalog=[
 {id:"mcb1n-10",type:"MCB 1P+N",group:"MCB 1P+N",name:"MCB 1P+N 10A",pole:"1P+N",modules:1,price:28},
 {id:"mcb1n-16",type:"MCB 1P+N",group:"MCB 1P+N",name:"MCB 1P+N 16A",pole:"1P+N",modules:1,price:29},
 {id:"mcb1n-20",type:"MCB 1P+N",group:"MCB 1P+N",name:"MCB 1P+N 20A",pole:"1P+N",modules:1,price:31},
 {id:"mcb1n-25",type:"MCB 1P+N",group:"MCB 1P+N",name:"MCB 1P+N 25A",pole:"1P+N",modules:1,price:33},
 {id:"mcb1n-32",type:"MCB 1P+N",group:"MCB 1P+N",name:"MCB 1P+N 32A",pole:"1P+N",modules:1,price:36},
 {id:"mcb1n-40",type:"MCB 1P+N",group:"MCB 1P+N",name:"MCB 1P+N 40A",pole:"1P+N",modules:1,price:42},
 {id:"mcb1n-50",type:"MCB 1P+N",group:"MCB 1P+N",name:"MCB 1P+N 50A",pole:"1P+N",modules:1,price:49},
 {id:"mcb1n-63",type:"MCB 1P+N",group:"MCB 1P+N",name:"MCB 1P+N 63A",pole:"1P+N",modules:1,price:57},
 {id:"rccb-25",type:"RCCB / DDR",group:"RCCB / DDR",name:"RCCB 2P 25A / 30mA",pole:"2P",modules:2,price:92},
 {id:"rccb-40",type:"RCCB / DDR",group:"RCCB / DDR",name:"RCCB 2P 40A / 30mA",pole:"2P",modules:2,price:98},
 {id:"rccb-63",type:"RCCB / DDR",group:"RCCB / DDR",name:"RCCB 2P 63A / 30mA",pole:"2P",modules:2,price:110},
 {id:"rcbo-10",type:"RCBO",group:"RCBO",name:"RCBO 1P+N 10A / 30mA",pole:"1P+N",modules:1,price:72},
 {id:"rcbo-16",type:"RCBO",group:"RCBO",name:"RCBO 1P+N 16A / 30mA",pole:"1P+N",modules:1,price:75},
 {id:"rcbo-20",type:"RCBO",group:"RCBO",name:"RCBO 1P+N 20A / 30mA",pole:"1P+N",modules:1,price:78},
 {id:"rcbo-25",type:"RCBO",group:"RCBO",name:"RCBO 1P+N 25A / 30mA",pole:"1P+N",modules:1,price:82},
 {id:"rcbo-32",type:"RCBO",group:"RCBO",name:"RCBO 1P+N 32A / 30mA",pole:"1P+N",modules:1,price:88},
 {id:"afdd-16",type:"AFDD",group:"AFDD",name:"AFDD 1P+N 16A",pole:"1P+N",modules:2,price:245},
 {id:"afdd-20",type:"AFDD",group:"AFDD",name:"AFDD 1P+N 20A",pole:"1P+N",modules:2,price:255},
 {id:"spd-t2-1n",type:"SPD",group:"SPD",name:"SPD Tip 2 1P+N",pole:"1P+N",modules:2,price:220},
 {id:"spd-t2-3n",type:"SPD",group:"SPD",name:"SPD Tip 2 3P+N",pole:"3P+N",modules:4,price:360},
 {id:"contactor-2p",type:"Contactor",group:"Contactor / releu",name:"Contactor 2P 25A",pole:"2P",modules:2,price:85},
 {id:"contactor-4p",type:"Contactor",group:"Contactor / releu",name:"Contactor 4P 25A",pole:"4P",modules:4,price:125}
];
const groups=["Toate","MCB 1P+N","RCCB / DDR","RCBO","AFDD","SPD","Contactor / releu"];
const prices={general:95,spd:220,board:{12:110,24:160,36:220,48:290}};
let selectedGroup="Toate";

function renderStepper(){document.getElementById("stepper").innerHTML=["Branșament","Tablou","Configurare","Rezumat"].map((x,i)=>`<span class="step ${state.step===i+1?"active":""}">${i+1}. ${x}</span>`).join(" · ");}
function btns(back=true){return `<div class="actions">${back?`<button class="btn secondary" onclick="back()">← Înapoi</button>`:"<span></span>"}<button class="btn primary" onclick="next()">Continuă →</button></div>`;}
function render(){
 renderStepper(); const s=document.getElementById("screen");
 if(state.step===1)s.innerHTML=`<div class="card"><h2>Ce tip de branșament ai?</h2><p>Alege varianta care apare în documentele instalației tale.</p><div class="grid">
 <button class="option ${state.connection==="mono"?"selected":""}" onclick="chooseConn('mono')"><div class="icon">◉</div><h3>Branșament monofazat</h3><p>230 V · o fază</p></button>
 <button class="option ${state.connection==="tri"?"selected":""}" onclick="chooseConn('tri')"><div class="icon">◉◉◉</div><h3>Branșament trifazat</h3><p>400 V · trei faze</p></button></div>
 <h3 style="margin-top:32px">Puterea maximă</h3><p class="hint">Selectează puterea maximă aprobată / instalată.</p><div class="power-grid">${[5,7,11,15,18,22,25,30].map(p=>`<button class="power ${state.power===p?"selected":""}" onclick="choosePower(${p})">${p} kW</button>`).join("")}</div>${btns(false)}</div>`;
 if(state.step===2)s.innerHTML=`<div class="card"><h2>Alege dimensiunea tabloului</h2><p>Nu trebuie să știi ce înseamnă modulele. Alege doar cât de mare vrei să fie tabloul.</p><div class="boards">${boards.map(n=>`<button class="board-option ${state.board===n?"selected":""}" onclick="chooseBoard(${n})"><div class="mini-board">${Array.from({length:Math.ceil(n/12)},()=>'<div class="mini-row"></div>').join("")}</div><strong>${n} posturi</strong><div class="hint">${n===12?"compact":n===48?"spațios":"standard"}</div></button>`).join("")}</div>${btns()}</div>`;
 if(state.step===3)renderConfig(s);
 if(state.step===4)renderSummary(s);
}
function chooseConn(x){state.connection=x;state.items=[];render()}
function choosePower(x){state.power=x;render()}
function chooseBoard(x){state.board=x;state.items=[];state.ack=false;render()}
function next(){if(state.step===1&&(!state.connection||!state.power))return alert("Alege branșamentul și puterea maximă.");if(state.step===2&&!state.board)return alert("Alege dimensiunea tabloului.");if(state.step<4)state.step++;render()}
function back(){if(state.step>1)state.step--;render()}

function fixedModules(){return fixed.general.modules+fixed.spd.modules}
function getUsed(){return fixedModules()+state.items.reduce((a,x)=>a+x.modules,0)}
function occupiedMap(excludeUid=null){
 const rows=Math.ceil(state.board/12), occ=Array.from({length:rows},()=>Array(12).fill(false));
 for(let k=0;k<fixedModules();k++)occ[0][k]=true;
 state.items.forEach(x=>{if(x.uid===excludeUid)return;for(let k=0;k<x.modules;k++)if(x.row>=0&&x.row<rows&&x.slot+k<12)occ[x.row][x.slot+k]=true;});
 return occ;
}
function canPlace(modules,row,slot,excludeUid=null){if(row<0||row>=Math.ceil(state.board/12)||slot<0||slot+modules>12)return false;const occ=occupiedMap(excludeUid);for(let k=0;k<modules;k++)if(occ[row][slot+k])return false;return true}
function findPlacement(modules,excludeUid=null){const occ=occupiedMap(excludeUid);for(let r=0;r<occ.length;r++)for(let slot=0;slot<=12-modules;slot++){let ok=true;for(let k=0;k<modules;k++)if(occ[r][slot+k])ok=false;if(ok)return{row:r,slot};}return null}
function nextUid(){return Date.now()+Math.floor(Math.random()*100000)}

function componentIcon(b){
 const amp=(b.name.match(/\d+/)||[""])[0], w=Math.max(64,b.modules*42), cols=b.modules, bodyW=36;
 let body=""; for(let i=0;i<cols;i++){const x=4+i*42;body+=`<rect x="${x}" y="3" width="38" height="58" rx="3" fill="url(#g)" stroke="#68717a"/><rect x="${x+7}" y="10" width="24" height="17" rx="2" fill="#eef1f3" stroke="#8a9299"/><text x="${x+19}" y="22" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="#222">${i===0?amp+"A":""}</text>`} 
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="64" viewBox="0 0 ${w} 64"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fafafa"/><stop offset=".65" stop-color="#d9dde1"/><stop offset="1" stop-color="#aeb5bb"/></linearGradient></defs>${body}<rect x="${Math.max(9,w/2-22)}" y="34" width="44" height="7" rx="2" fill="#666e75"/></svg>`;
 return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg);
}
function iconFor(id){const b=catalog.find(x=>x.id===id);return b?componentIcon(b):""}

function renderConfig(s){
 const used=getUsed(),pct=Math.round(used/state.board*100),rows=Math.ceil(state.board/12);
 const rowHtml=Array.from({length:rows},(_,r)=>{
   const cells=[]; let slot=0;
   while(slot<12){
     const item=state.items.find(x=>x.row===r&&x.slot===slot);
     if(item){cells.push(`<button draggable="true" ondragstart="startItemDrag(event,${item.uid})" ondragend="endDrag()" class="module added item-span" style="grid-column:span ${item.modules}" onclick="openChange(${item.uid})" title="Schimbă sau mută ${item.name}"><img src="${iconFor(item.id)}" alt=""><span>${item.name.replace(/ 30mA| \/ 30mA/g,"")}</span></button>`);slot+=item.modules;}
     else {cells.push(`<div class="module empty drop-cell" data-row="${r}" data-slot="${slot}" ondragover="railDragOver(event)" ondrop="dropAt(event,${r},${slot})"></div>`);slot++;}
   }
   return `<div class="din-row"><div class="din-rail" data-row="${r}" ondragover="railDragOver(event)" ondrop="dropOnRail(event,${r})"><div class="rail-metal"></div><div class="rail-track"></div>${cells.join("")}</div><div class="rail-label">Șină DIN ${r+1}</div></div>`;
 }).join("");
 const filtered=catalog.filter(b=>selectedGroup==="Toate"||b.group===selectedGroup);
 s.innerHTML=`<div class="v5-config">
 <div class="board board-realistic" ondragover="railDragOver(event)" ondrop="dropOnRail(event,0)">
  <div class="board-header"><div><span class="board-kicker">CONFIGURAȚIE TABLOU</span><strong>Tablou ${state.board} posturi</strong><span>${state.connection==="tri"?"Trifazat":"Monofazat"} · ${state.power} kW</span></div><div class="board-status"><i></i> Configurabil</div></div>
  <div class="din-area">${rowHtml}</div><div class="board-hint">💡 Pe PC poți trage aparatele pe șină. Pe telefon folosește „Adaugă” și apoi „Mută”. Apasă pe un aparat pentru modificare.</div>
 </div>
 <div class="occupancy"><strong>${used} / ${state.board} posturi ocupate</strong><span style="float:right">${pct}%</span><div class="bar"><div style="width:${Math.min(pct,100)}%"></div></div>${pct>75?`<div class="warning">⚠️ <strong>Ai depășit 75% din spațiul tabloului.</strong><br>Păstrează, pe cât posibil, o rezervă pentru extinderi viitoare.<div class="ack"><button class="btn primary" onclick="ackWarning()">Am înțeles</button></div></div>`:""}${state.ack?`<p class="hint">✓ Ai confirmat avertizarea.</p>`:""}</div>
 <div class="catalog card"><div class="catalog-head"><div><h2>Catalog aparataj</h2><p class="hint">Alege categoria, apoi adaugă aparatul. 1P+N ocupă <strong>1 modul</strong>.</p></div><select onchange="setGroup(this.value)">${groups.map(g=>`<option ${selectedGroup===g?"selected":""}>${g}</option>`).join("")}</select></div>
 <div class="catalog-grid">${filtered.map(b=>`<div class="component" draggable="true" ondragstart="startCatalogDrag(event,'${b.id}')"><img src="${componentIcon(b)}" alt="${b.name}"><div class="component-info"><strong>${b.name}</strong><small>${b.pole} · ${b.modules} ${b.modules===1?"modul":"module"}</small><b>${b.price} lei</b></div><button class="add-btn" onclick="addBreaker('${b.id}')">＋ Adaugă</button></div>`).join("")}</div></div>
 ${btns()}
 </div>`;
}
function setGroup(v){selectedGroup=v;render()}
function startCatalogDrag(e,id){state.dragged={kind:"new",id};e.dataTransfer?.setData("text/plain",id);e.dataTransfer?.setData("application/x-configurator","new")}
function startItemDrag(e,uid){state.dragged={kind:"move",uid};e.stopPropagation();e.dataTransfer?.setData("text/plain",String(uid));e.dataTransfer?.setData("application/x-configurator","move")}
function endDrag(){state.dragged=null;document.querySelectorAll('.drop-cell,.din-rail').forEach(x=>x.classList.remove('drop-hover'))}
function railDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';e.currentTarget.classList.add('drop-hover')}
function dropAt(e,row,slot){e.preventDefault();e.stopPropagation();handleDrop(row,slot);endDrag()}
function dropOnRail(e,row){e.preventDefault();
 let rect=e.currentTarget.getBoundingClientRect();let x=e.clientX-rect.left;let inner=Math.max(0,x-7);let slot=Math.max(0,Math.min(11,Math.floor(inner/(rect.width/12))));handleDrop(row,slot);endDrag();}
function handleDrop(row,slot){const d=state.dragged;if(!d)return;if(d.kind==='new'){const b=catalog.find(x=>x.id===d.id);if(!b)return;if(!canPlace(b.modules,row,slot))return showToast("Nu încape aici. Aparatul a rămas în catalog.");state.items.push({...b,amp:parseInt((b.name.match(/\d+/)||[0])[0]),row,slot,uid:nextUid()});render();return;}const idx=state.items.findIndex(x=>x.uid===d.uid);if(idx<0)return;const item=state.items[idx];if(!canPlace(item.modules,row,slot,item.uid))return showToast("Poziția nu este disponibilă. Aparatul a rămas pe loc.");item.row=row;item.slot=slot;render();}
function addBreaker(id){const b=catalog.find(x=>x.id===id);if(!b)return;const p=findPlacement(b.modules);if(!p)return showToast("Nu mai există suficient spațiu în tablou.");state.items.push({...b,amp:parseInt((b.name.match(/\d+/)||[0])[0]),row:p.row,slot:p.slot,uid:nextUid()});render();}

function openChange(uid){state.editing=uid;renderChangeModal()}
function renderChangeModal(){const item=state.items.find(x=>x.uid===state.editing);if(!item)return;const modal=document.createElement('div');modal.className='modal-backdrop';modal.innerHTML=`<div class="change-modal"><button class="modal-close" onclick="closeChange()">×</button><h2>Schimbă aparatul</h2><p class="modal-sub">Poți alege orice aparat din catalog, chiar dacă are alt număr de module.</p><div class="change-current"><img src="${iconFor(item.id)}"><div><strong>${item.name}</strong><small>Șină DIN ${item.row+1} · poziția ${item.slot+1} · ${item.modules} ${item.modules===1?'modul':'module'}</small></div></div><label class="modal-label">Alege noul aparat</label><select id="changeSelect" class="change-select">${catalog.map(b=>`<option value="${b.id}" ${b.id===item.id?'selected':''}>${b.name} · ${b.modules} ${b.modules===1?'modul':'module'} · ${b.price} lei</option>`).join('')}</select><button class="btn primary wide" onclick="changeBreaker()">Aplică schimbarea</button><div class="move-box"><strong>Mută aparatul</strong><p class="hint">Alege șina și poziția de început.</p><div class="move-fields"><select id="moveRow">${Array.from({length:Math.ceil(state.board/12)},(_,r)=>`<option value="${r}" ${r===item.row?'selected':''}>Șina DIN ${r+1}</option>`).join('')}</select><select id="moveSlot">${Array.from({length:12},(_,x)=>`<option value="${x}" ${x===item.slot?'selected':''}>Poziția ${x+1}</option>`).join('')}</select></div><button class="btn secondary wide" onclick="moveFromModal()">Mută</button></div><button class="delete-item" onclick="removeBreaker()">Șterge această siguranță</button></div>`;document.body.appendChild(modal)}
function closeChange(){state.editing=null;document.querySelector('.modal-backdrop')?.remove()}
function changeBreaker(){const idx=state.items.findIndex(x=>x.uid===state.editing);if(idx<0)return;const b=catalog.find(x=>x.id===document.getElementById('changeSelect').value);if(!b)return;const item=state.items[idx];if(!canPlace(b.modules,item.row,item.slot,item.uid))return showToast("Noua aparatură nu încape în poziția actuală. Alege altă poziție sau păstrează aparatul actual.");Object.assign(item,{id:b.id,name:b.name,type:b.type,group:b.group,pole:b.pole,modules:b.modules,price:b.price,amp:parseInt((b.name.match(/\d+/)||[0])[0])});closeChange();render()}
function moveFromModal(){const idx=state.items.findIndex(x=>x.uid===state.editing);if(idx<0)return;const item=state.items[idx],row=+document.getElementById('moveRow').value,slot=+document.getElementById('moveSlot').value;if(!canPlace(item.modules,row,slot,item.uid))return showToast("Poziția aleasă nu este disponibilă.");item.row=row;item.slot=slot;closeChange();render()}
function removeBreaker(){const idx=state.items.findIndex(x=>x.uid===state.editing);if(idx<0)return;state.items.splice(idx,1);closeChange();render()}
function ackWarning(){state.ack=true;render()}
function showToast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}

function renderSummary(s){const used=getUsed();const rows=[["Tablou",1,prices.board[state.board]],["Siguranță generală",1,prices.general],["SPD",1,prices.spd]];state.items.forEach(x=>{const found=rows.find(r=>r[0]===x.name);if(found)found[1]++;else rows.push([x.name,1,x.price])});const total=rows.reduce((a,r)=>a+r[1]*r[2],0);s.innerHTML=`<div class="card"><h2>Rezumatul configurației</h2><p>Ai configurat un tablou ${state.board} posturi pentru branșament ${state.connection==='tri'?'trifazat':'monofazat'}, ${state.power} kW.</p><table class="bom"><thead><tr><th>Componentă</th><th>Cant.</th><th>Preț unitar</th><th>Total</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]} lei</td><td><strong>${r[1]*r[2]} lei</strong></td></tr>`).join('')}</tbody></table><div class="total">Total materiale: ${total} lei</div><p class="hint">${used} / ${state.board} posturi ocupate · ${Math.round(used/state.board*100)}%</p><div class="actions"><button class="btn secondary" onclick="back()">← Modifică</button><button class="btn primary" onclick="alert('Exportul PDF și trimiterea configurației vor fi adăugate ulterior.')">Finalizează configurația</button></div></div>`}
render();
