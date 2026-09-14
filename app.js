const state={step:1,connection:null,power:null,board:null,items:[],ack:false};
const boards=[12,24,36,48];
const fixed={general:{name:"Siguranță generală",modules:2},spd:{name:"SPD",modules:2}};
const breakers=[10,16,20,25,32].flatMap(a=>[
 {id:`1p-${a}`,name:`MCB ${a}A`,pole:"1P",modules:1,price:28},
 {id:`2p-${a}`,name:`MCB ${a}A`,pole:"2P",modules:2,price:55}
]);
const prices={general:95,spd:220,board:{12:110,24:160,36:220,48:290}};
function renderStepper(){document.getElementById("stepper").innerHTML=["Branșament","Tablou","Configurare","Rezumat"].map((x,i)=>`<span class="step ${state.step===i+1?"active":""}">${i+1}. ${x}</span>`).join(" · ")}
function btns(back=true){return `<div class="actions">${back?`<button class="btn secondary" onclick="back()">← Înapoi</button>`:"<span></span>"}<button class="btn primary" onclick="next()">Continuă →</button></div>`}
function render(){
 renderStepper(); const s=document.getElementById("screen");
 if(state.step===1)s.innerHTML=`<div class="card"><h2>Ce tip de branșament ai?</h2><p>Alege varianta care apare în documentele instalației tale.</p><div class="grid">
 <button class="option ${state.connection==="mono"?"selected":""}" onclick="chooseConn('mono')"><div class="icon">◉</div><h3>Branșament monofazat</h3><p>230 V · o fază</p></button>
 <button class="option ${state.connection==="tri"?"selected":""}" onclick="chooseConn('tri')"><div class="icon">◉◉◉</div><h3>Branșament trifazat</h3><p>400 V · trei faze</p></button></div>
 <h3 style="margin-top:32px">Puterea maximă</h3><p class="hint">Selectează puterea maximă aprobată / instalată.</p>
 <div class="power-grid">${[5,7,11,15,18,22,25,30].map(p=>`<button class="power ${state.power===p?"selected":""}" onclick="choosePower(${p})">${p} kW</button>`).join("")}</div>${btns(false)}</div>`;
 if(state.step===2)s.innerHTML=`<div class="card"><h2>Alege dimensiunea tabloului</h2><p>Nu trebuie să știi ce înseamnă modulele. Alege doar cât de mare vrei să fie tabloul.</p><div class="boards">${boards.map(n=>`<button class="board-option ${state.board===n?"selected":""}" onclick="chooseBoard(${n})"><div class="mini-board">${Array.from({length:Math.ceil(n/12)},()=>'<div class="mini-row"></div>').join("")}</div><strong>${n} posturi</strong><div class="hint">${n===12?"compact":n===48?"spațios":"standard"}</div></button>`).join("")}</div>${btns()}</div>`;
 if(state.step===3)renderConfig(s);
 if(state.step===4)renderSummary(s);
}
function chooseConn(x){state.connection=x;render()}
function choosePower(x){state.power=x;render()}
function chooseBoard(x){state.board=x;render()}
function next(){
 if(state.step===1 && (!state.connection||!state.power))return alert("Alege branșamentul și puterea maximă.");
 if(state.step===2&&!state.board)return alert("Alege dimensiunea tabloului.");
 if(state.step<4)state.step++;render()
}
function back(){if(state.step>1)state.step--;render()}
function renderConfig(s){
 const fixedMods=fixed.general.modules+fixed.spd.modules;
 const used=fixedMods+state.items.reduce((a,x)=>a+x.modules,0), pct=Math.round(used/state.board*100);
 const rows=Math.ceil(state.board/12);
 s.innerHTML=`<div class="config-layout"><aside class="card selector"><h3>Adaugă siguranțe</h3><p class="hint">Trage o siguranță în tablou. O siguranță 1P ocupă un post, iar una 2P ocupă două.</p>
 ${breakers.map(b=>`<div class="component" draggable="true" ondragstart="drag(event,'${b.id}')"><span><strong>${b.name}</strong><br><small>${b.pole} · ${b.modules} post${b.modules>1?"uri":""}</small></span><b>${b.price} lei</b></div>`).join("")}</aside>
 <div><div class="board" ondragover="event.preventDefault()" ondrop="drop(event)"><div class="board-title"><span>Tablou ${state.board} posturi</span><span class="tag">${state.connection==="tri"?"Trifazat":"Monofazat"} · ${state.power} kW</span></div>
 <div class="rows">${Array.from({length:rows},(_,r)=>`<div class="rail">${r===0?`<div class="module fixed">GENERAL</div><div class="module fixed spd">SPD</div>`:""}${state.items.filter(x=>x.row===r).map((x,i)=>`<div class="module" title="${x.name}">${x.pole}<br>${x.amp}A</div>`).join("")}</div>`).join("")}</div></div>
 <div class="occupancy"><strong>${used} / ${state.board} posturi ocupate</strong><span style="float:right">${pct}%</span><div class="bar"><div style="width:${Math.min(pct,100)}%"></div></div>
 ${pct>75?`<div class="warning">⚠️ <strong>Ai depășit 75% din spațiul tabloului.</strong><br>Păstrarea unei rezerve de spațiu poate fi utilă pentru extinderi viitoare.<div class="ack"><button class="btn primary" onclick="ackWarning()">Am înțeles</button></div></div>`:""}${state.ack?`<p class="hint">✓ Ai confirmat avertizarea.</p>`:""}</div>${btns()}</div></div>`;
}
let dragged=null;
function drag(e,id){dragged=id}
function drop(e){if(!dragged)return;const b=breakers.find(x=>x.id===dragged);const used=fixed.general.modules+fixed.spd.modules+state.items.reduce((a,x)=>a+x.modules,0);if(used+b.modules>state.board){alert("Nu mai există suficient spațiu în tablou.");return}const idx=state.items.length;state.items.push({...b,amp:parseInt(b.name.match(/\d+/)[0]),row:Math.min(Math.floor(idx/10),Math.ceil(state.board/12)-1)});dragged=null;render()}
function ackWarning(){state.ack=true;render()}
function renderSummary(s){
 const fixedMods=fixed.general.modules+fixed.spd.modules, used=fixedMods+state.items.reduce((a,x)=>a+x.modules,0);
 const rows=[["Tablou",1,prices.board[state.board]],["Siguranță generală",1,prices.general],["SPD",1,prices.spd]];
 state.items.forEach(x=>{const found=rows.find(r=>r[0]===x.name);if(found)found[1]++;else rows.push([x.name,1,x.price])});
 const total=rows.reduce((a,r)=>a+r[1]*r[2],0);
 s.innerHTML=`<div class="card"><h2>Rezumatul configurației</h2><p>Ai configurat un tablou ${state.board} posturi pentru branșament ${state.connection==="tri"?"trifazat":"monofazat"}, ${state.power} kW.</p>
 <table class="bom"><thead><tr><th>Componentă</th><th>Cant.</th><th>Preț unitar</th><th>Total</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]} lei</td><td><strong>${r[1]*r[2]} lei</strong></td></tr>`).join("")}</tbody></table>
 <div class="total">Total materiale: ${total} lei</div><p class="hint">${used} / ${state.board} posturi ocupate · ${Math.round(used/state.board*100)}%</p>
 <div class="actions"><button class="btn secondary" onclick="back()">← Modifică</button><button class="btn primary" onclick="alert('V1: aici vom adăuga ulterior exportul PDF și trimiterea configurației.')">Finalizează configurația</button></div></div>`;
}
render();