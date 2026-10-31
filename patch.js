'use strict';
// ===== Ashfall Depths: Patch (load AFTER extras.js) =====
// dash cooldown · selling · guard-break stun · boss themes · boss weapon passives · legendary warnings
// chest respawn · no surface enemies · Hollow Knight buff · per-boss SFX · Heaven portal + Nameless Deity · Nameless Blessing
(()=>{
const $=id=>document.getElementById(id);
let inHeaven=false,HOME=null;

// ---------- styles ----------
{const s=document.createElement('style');s.textContent=`
#dlg{position:fixed;left:50%;bottom:9vh;transform:translateX(-50%);width:min(720px,92vw);z-index:60;background:linear-gradient(#2a2140f5,#120d1ef5);border:2px solid #d9a441;
 box-shadow:0 0 0 2px #000,0 0 50px #ffe08a55,inset 0 0 30px #000;padding:18px 26px;text-align:left;cursor:pointer}
#dlg .dn{color:#ffe08a;letter-spacing:6px;font-size:13px;margin-bottom:8px;text-shadow:0 0 10px #ffb84a}
#dlg .dt{font-size:19px;line-height:1.55;color:#f4ecd8;min-height:60px;font-style:italic}
#dlg .dh{font-size:11px;color:#8a7c68;text-align:right;letter-spacing:2px;margin-top:6px}
#warnbox{position:fixed;inset:0;z-index:80;background:#000a;display:grid;place-items:center}
#warnbox .panel{position:static;transform:none;max-width:460px}
#warnbox h1{font-size:22px;color:#ffb347}
#win{border-color:#d9a441;max-width:560px;box-shadow:0 0 0 2px #000,0 0 0 4px #7a5a2e,0 0 120px #ffe08a88,inset 0 0 60px #3a2a0a;background:linear-gradient(#2a2140f5,#120d1ef5)}
#win h1{color:#ffe08a;font-size:44px;letter-spacing:12px;text-shadow:0 0 30px #ffb84a,0 3px 0 #000;margin:0}
#win h2{color:#e8d8a8}#winTxt{font-style:italic;font-size:17px;color:#fff2c8;margin:14px 6px;line-height:1.5}
#winStats{font-size:13px;color:#cdbb98;line-height:1.7;margin-bottom:12px;border-top:1px solid #7a5a2e;padding-top:10px}#winStats b{color:#9fe}
`;document.head.appendChild(s)}

// ---------- 1. dash cooldown (0.2s after the dash ends) ----------
const _td=tryDodge;tryDodge=function(){if(!P||(P.dcd||0)>0)return;const was=P.dodge;_td();if(P.dodge>0&&was<=0)P.dcd=.6};
const _up=updPlayer;updPlayer=function(dt){if(P){P.dcd=Math.max(0,(P.dcd||0)-dt);if(P.dodge>0&&P.weapon&&P.weapon.kind==='voidfang')P.vfb=2;else P.vfb=Math.max(0,(P.vfb||0)-dt)}_up(dt)};

// ---------- 2. guard break = 1.5s stun ----------
const _hp3=hurtPlayer;hurtPlayer=function(dmg,pd,from,br){const gb=P.guardBroken>0,st0=P.stun;const r=_hp3(dmg,pd,from,br);
 if(!gb&&P.guardBroken>0){P.guardBroken=1.5;P.stun=1.5;P.vx=0;float(P.x,P.y-16,'STUNNED','#ff9');shake=Math.max(shake,7)}
 else if(r==='hit'&&st0>.25&&P.stun<st0)P.stun=st0;
 return r};

// ---------- 3. selling + legendary warnings ----------
const SELL=.15,PT=[60,150,400,900,2200];
const wPrice=w=>Math.max(5,Math.round(w.dmg*9*[1,1.6,2.6,4.2,7][w.rar|0]+(w.ench?w.ench.length*150:0)));
const aPrice=a=>a.price>0?a.price:PT[a.rar|0];
const sellOf=p=>Math.max(1,Math.floor(p*SELL*(window.SELLM||1)));
function warn(title,html,yes,label){const b=document.createElement('div');b.id='warnbox';
 b.innerHTML=`<div class="panel"><div class="rune" style="color:#ffb347">\u26A0</div><h1>${title}</h1><div style="margin:10px 0 16px;line-height:1.6">${html}</div><button id="wY">${label||'Confirm'}</button><button id="wN">Cancel</button></div>`;
 document.body.appendChild(b);const close=()=>b.remove();$('wN').onclick=close;$('wY').onclick=()=>{close();yes()}}
function sellHTML(){const row=(n,rar,sub,pr,att)=>`<div class="row"><span style="color:${RAR[rar][1]}"><b>${n}</b> <small>${sub}</small></span><span><small style="color:#ffd36b">${sellOf(pr)}g</small> <button ${att}>Sell</button></span></div>`;
 let h=`<hr><b>SELL</b> <small>(15% of original price)</small>`,n=0;
 inv.forEach((w,i)=>{n++;h+=row(w.name,w.rar,w.dmg+' dmg',wPrice(w),`data-sw="${i}"`)});
 accOwned.map(id=>ACCB[id]).filter(a=>a&&eq[a.slot]!==a.id).forEach(a=>{n++;h+=row(a.name,a.rar,RAR[a.rar][0]+' '+a.slot,aPrice(a),`data-sa="${a.id}"`)});
 armOwned.map(id=>ARMB[id]).filter(a=>a&&armEq[a.slot]!==a.id).forEach(a=>{n++;h+=row(a.name,a.rar,RAR[a.rar][0]+' armor',aPrice(a),`data-sr="${a.id}"`)});
 return h+(n?'':'<div><small>Nothing to sell \u2014 equipped gear can\u2019t be sold.</small></div>')}
function doSell(name,rar,pr,fn){const go=()=>{fn();gold+=sellOf(pr);sfx.loot();recalc();save();drawShop()};
 if(rar>=4)warn('Sell Legendary item?',`<b style="color:${RAR[4][1]}">${name}</b> is <b>LEGENDARY</b>.<br>You will receive only ${sellOf(pr)} gold and cannot buy it back.`,go,'Sell it');else go()}
const _ds2=drawShop;drawShop=function(){_ds2();sheet.insertAdjacentHTML('beforeend',spellHTML()+sellHTML());bindShop2();
 sheet.querySelectorAll('[data-sw]').forEach(b=>b.onclick=()=>{const w=inv[+b.dataset.sw];if(w)doSell(w.name,w.rar,wPrice(w),()=>{inv.splice(inv.indexOf(w),1)})});
 sheet.querySelectorAll('[data-sa]').forEach(b=>b.onclick=()=>{const a=ACCB[b.dataset.sa];doSell(a.name,a.rar,aPrice(a),()=>{accOwned.splice(accOwned.indexOf(a.id),1)})});
 sheet.querySelectorAll('[data-sr]').forEach(b=>b.onclick=()=>{const a=ARMB[b.dataset.sr];doSell(a.name,a.rar,aPrice(a),()=>{armOwned.splice(armOwned.indexOf(a.id),1)})})};
const _dh2=drawSheet;drawSheet=function(){_dh2();
 sheet.querySelectorAll('[data-d]').forEach(b=>{const it=inv[+b.dataset.d];b.onclick=()=>{const go=()=>{const i=inv.indexOf(it);if(i>=0)inv.splice(i,1);save();drawSheet()};
  if(it&&it.rar>=4)warn('Discard Legendary item?',`<b style="color:${RAR[4][1]}">${it.name}</b> is <b>LEGENDARY</b>.<br>Discarding destroys it forever (selling it to the Merchant is worth more).`,go,'Discard');else go()}});
 sheet.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>recalc()))};

// ---------- 4. chests respawn (~5 min) ----------
const CRK='ashfall_chestresp_v1';let CR={seed:0,at:{},n:{}};
const crLoad=()=>{try{const d=JSON.parse(localStorage.getItem(CRK));CR=d&&d.seed===seed?d:{seed,at:{},n:{}}}catch(e){CR={seed,at:{},n:{}}}};
const crSave=()=>{try{localStorage.setItem(CRK,JSON.stringify(CR))}catch(e){}};
const _pc=placeChests;placeChests=function(){crLoad();const now=Date.now();for(const k in CR.at)if(CR.at[k].t<=now){delete opened[k];delete CR.at[k]}
 _pc();for(const c of chests)if(CR.n[c.k])c.rs=CR.n[c.k];crSave()};
const _oc2=openChest;openChest=function(c){const had=opened[c.k];const _r=rng;if(c.rs)rng=s=>_r(s+c.rs*7919);try{_oc2(c)}finally{rng=_r}
 if(!had&&opened[c.k]&&!String(c.k).startsWith('cache')){CR.at[c.k]={t:Date.now()+240000+Math.random()*120000,tx:c.tx,ty:c.ty,type:c.type};CR.n[c.k]=(CR.n[c.k]||0)+1;crSave()}
 enemies=enemies.filter(e=>e.boss||!noSurf(e))};

// ---------- 5. no enemies on the surface ----------
let SC={t:null,a:null};
function surfY(tx){tx=Math.max(1,Math.min(W-2,tx));if(SC.t!==tiles)SC={t:tiles,a:new Int16Array(W).fill(-1)};if(SC.a[tx]>=0)return SC.a[tx];
 let m=H;for(let x=Math.max(1,tx-6);x<=Math.min(W-2,tx+6);x++){let y=0;while(y<H-1){const v=tiles[y*W+x];if(v>0&&v<5)break;y++}if(y<m)m=y}SC.a[tx]=m;return m}
const noSurf=e=>!inHeaven&&(e.y+e.h)/T<surfY(((e.x+e.w/2)/T)|0)+7;
const _se=spawnEnemies;spawnEnemies=function(){_se();const before=enemies.filter(e=>!e.boss).length;enemies=enemies.filter(e=>e.boss||!noSurf(e));
 let need=before-enemies.filter(e=>!e.boss).length;const r=rng(seed+17);let tr=0;
 while(need>0&&tr++<9000){const tx=10+r()*(W-20)|0,ty=40+r()*5|0;
  if(!solid(tx,ty)&&!solid(tx,ty-1)&&solid(tx,ty+1)&&Math.abs(tx*T-spawn.x)>200&&bio(tx,ty)===0&&!inAB(tx,ty,2)){const e=mkE(tx*T,ty*T-22,ty>45);e.st='idle';if(!noSurf(e)){enemies.push(e);need--}}}};
const holdOff=f=>function(e,dt){if(e.boss||e.dead||inHeaven)return f(e,dt);const ox=e.x,oy=e.y,was=noSurf(e);f(e,dt);
 if(!was&&!e.dead&&noSurf(e)){e.x=ox;e.y=oy;e.vx=0;if(e.vy<0)e.vy=0}};
updEnemy=holdOff(updEnemy);updE2=holdOff(updE2);

// ---------- 6. Hollow Knight: faster, harder ----------
Object.assign(ED.hknight,{spd:108,dmg:35,pd:50,rng:48,wu:.42});
{const f=updE2;updE2=function(e,dt){if(e.id!=='hknight'||e.dead||e.boss)return f(e,dt);const prev=e.st,dist=Math.abs(P.x-e.x),max=e.hp<e.max*.5?3:2;
  if(prev==='chase'&&e.cool<=0&&e.onGround&&dist>70&&dist<200&&Math.abs(P.y-e.y)<60&&Math.random()<dt*1.6){e.st='windup';e.t=.36;e.vx=0;e.lunge=1;e.face=P.x>e.x?1:-1}
  f(e,dt);
  if(prev==='attack'&&e.st==='recover'){e.t=(e.cmb||0)<max?.1:.5}
  if(prev==='recover'&&e.st==='chase'){if((e.cmb||0)<max&&dist<110){e.cmb=(e.cmb||0)+1;e.st='windup';e.t=.22;e.vx=0;e.face=P.x>e.x?1:-1}else e.cmb=0}
  if(prev==='windup'&&e.st==='attack'&&e.lunge){e.lunge=0;e.vx=e.face*360;e.vy=-110;e.t=.3;e.hit=false;burst(e.x+9,e.y+24,8,'#a8f')}}}

// ---------- 7. boss weapon passives ----------
const PASS={infernal:['Cinder Brand','Strikes brand foes; every 4th brand detonates (150% dmg, 70% to nearby foes).'],
 frostbite:['Permafrost','Strikes chill and slow. The 3rd chill flash-freezes: foes stunned 1.2s, bosses take heavy posture damage.'],
 stormpiercer:['Thunder Chain','35% chance to call lightning arcing through 3 foes (60% dmg, bosses take extra). Each strike restores 4 stamina.'],
 voidfang:['Soul Siphon','Heal 2% of damage dealt. After a dodge, your next strike within 2s deals +100% and heals triple.']};
wfx=function(e,d){enchFx(e,d);const k=P.weapon.kind;if(!PASS[k])return;const cxm=e.x+e.w/2,cym=e.y+e.h/2;
 const foes=r=>enemies.filter(o=>o!==e&&!o.dead&&!o.boss&&Math.hypot(o.x+o.w/2-cxm,o.y+o.h/2-cym)<r).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y));
 const zap=(o,v,c,t)=>{o.hp=Math.max(1,o.hp-v);burst(o.x+o.w/2,o.y+o.h/2,8,c);float(o.x,o.y-10,t,c)};
 if(k==='infernal'){e.brand=(e.brand||0)+1;burst(cxm,cym,8,'#f60');
  if(e.brand>=4){e.brand=0;e.hp-=d*1.5;burst(cxm,cym,36,'#ff8a1a');burst(cxm,cym,14,'#ffe08a');shake=Math.max(shake,5);float(e.x,e.y-26,'EMBER BURST','#f93');for(const o of foes(80))zap(o,d*.7,'#f93','BURST');tone(140,40,.4,'sawtooth',.2);noise(.4,.2,2500,200,'lowpass')}}
 else if(k==='frostbite'){e.slow=2;e.post+=6;e.chill=(e.chill||0)+1;burst(cxm,cym,8,'#8ef');
  if(e.chill>=3){e.chill=0;burst(cxm,cym,26,'#dff');float(e.x,e.y-26,'FROZEN','#9ef');tone(3000,1200,.3,'triangle',.08);
   if(e.boss)e.post+=55;else{e.st='stagger';e.t=1.2;e.vx=0}}}
 else if(k==='stormpiercer'){P.stam=Math.min(maxStam(),P.stam+4);
  if(Math.random()<.35){float(e.x,e.y-26,'LIGHTNING','#ff8');burst(cxm,cym,14,'#ff8');if(e.boss)e.hp-=d*.3;let n=0;for(const o of foes(130)){if(n++>=3)break;zap(o,d*.6,'#ff8','ZAP');for(let i=1;i<6;i++)parts.push({x:cxm+(o.x+o.w/2-cxm)*i/6,y:cym+(o.y+o.h/2-cym)*i/6+(Math.random()-.5)*8,vx:0,vy:0,l:.25,c:'#ffe'})}noise(.2,.2,5000,800,'highpass')}}
 else if(k==='voidfang'){let h=Math.ceil(d*.02);if(P.vfb>0){e.hp-=d*1;P.vfb=0;h*=3;float(e.x,e.y-26,'SHADOWSTRIKE','#c8f');burst(cxm,cym,18,'#c8f')}P.hp=Math.min(maxHp(),P.hp+h)}};
const _es=enchSheet;enchSheet=function(w){const s=_es(w);return w&&w.unique&&PASS[w.kind]?'<br><small style="color:#ffb347">\u2726 '+PASS[w.kind][0]+': '+PASS[w.kind][1]+'</small>'+s:s};

// ---------- 12. Elixir upgrades · spells · echo upgrades · crit & passives · unique boss armor ----------
const ELXT=[[45,6],[67,6],[120,7],[160,15]];let ELXL=0;const elxCost=()=>Math.round(1000*(ELXL+1)*(window.PRICEM||1));
function applyElx(){ELX_HEAL=ELXT[ELXL][0];ELX_MAX=ELXT[ELXL][1]}
const _er0=elixRow;elixRow=function(){let h=_er0();const nx=ELXT[ELXL+1],cu=ELXT[ELXL];
 return h+(nx?`<div class="row"><span><b style="color:#7fff9a">Elixir Upgrade</b> <small>Lv ${ELXL}/3</small><br><small>${cu[0]} heal \u00b7 ${cu[1]} carry \u2192 ${nx[0]} heal \u00b7 ${nx[1]} carry</small></span><span><small style="color:#ffd36b">${elxCost()}g</small> <button data-eu="1" ${gold<elxCost()?'disabled':''}>Upgrade</button></span></div>`
  :`<div class="row"><span><b style="color:#7fff9a">Elixir Upgrade</b> <small>MAX \u00b7 ${cu[0]} heal \u00b7 ${cu[1]} carry</small></span></div>`)};

// --- echo upgrades (more stats + expensive passives) ---
Object.assign(U0,{crit:0,critd:0,fleet:0,resolve:0,breath:0,spellc:0,swind:0,vamp:0,riposte:0,exec:0,adren:0,harvest:0});
// Vampirism was replaced by Soul Harvest: refund anything already spent on it
{const v=meta.up.vamp|0;if(v>0){let r=0;for(let i=0;i<v;i++)r+=Math.round(260*(1+i*.8));meta.echoes+=r;saveMeta()}delete meta.up.vamp;delete U0.vamp}
for(const k in U0)if(meta.up[k]==null)meta.up[k]=0;
UPG.push(['crit','Keen Eye','+2% critical chance (adds to Precision)',10,40],['critd','Ruthlessness','+12% critical damage (also boosts Precision)',8,45],['fleet','Fleetfoot','+4% move speed',6,35],['resolve','Resolve','+2.5% damage reduction',6,55],
 ['breath','Second Breath','+6% stamina regeneration',6,40],['spellc','Spellcraft','-6% spell stamina cost',5,60],
 ['swind','\u2726 Second Wind','Passive: on your LAST life only, survive one killing blow per run (revive with 40% / 55% / 70% HP)',3,300,1],['harvest','\u2726 Soul Harvest','Passive: each enemy you slay restores 4% / 6% / 8% max HP and 15 / 25 / 35 stamina',3,260,1],
 ['riposte','\u2726 Riposte','Passive: after a parry your next strike deals +50% / +75% / +100% damage',3,280,1],['exec','\u2726 Executioner','Passive: +25% damage per level to enemies below 25% HP',3,320,1],
 ['adren','\u2726 Adrenaline','Passive: after being hit, gain speed and +20% / +30% / +40% damage for 4s',3,240,1]);
const _rc3=recalc;recalc=function(){_rc3();if(typeof P==='undefined'||!P)return;const U=meta.up;S.spd+=(U.fleet||0)*6;S.def=1-(1-(S.def||0))*(1-.025*(U.resolve||0));S.regen=(S.regen||0)+(U.breath||0)*.06};

// --- spells (Z / X) ---
const SPL={own:[],z:null,x:null,cd:{}};
function aoe(r,fn,col){const px=P.x+6,py=P.y+11;let n=0;for(const e of enemies){if(e.dead||(e.boss&&(e.st==='dormant'||e.st==='intro')))continue;if(Math.hypot(e.x+e.w/2-px,e.y+e.h/2-py)<r){fn(e);n++;burst(e.x+e.w/2,e.y+e.h/2,6,col)}}
 for(let i=0;i<28;i++){const a=i/28*6.283;parts.push({x:px,y:py,vx:Math.cos(a)*r*1.3,vy:Math.sin(a)*r*1.3,l:.4,c:col})}return n}
const SPD=[
 {id:'bulwark',n:'Bulwark',g:1000,st:25,cd:48,t:'self',d:'Take 35% less damage for 8s.',fn(){P.sb.bul=8}},
 {id:'windrun',n:'Windrunner',g:1000,st:20,cd:14,t:'self',d:'+45% move speed for 8s.',fn(){P.sb.wind=8}},
 {id:'frost',n:'Frostbind',g:700,st:30,cd:12,t:'debuff',d:'Slows nearby enemies for 4s; bosses suffer posture damage.',fn(){aoe(170,e=>{if(e.boss)e.post+=70;else e.slow=4},'#8ef')}},
 {id:'mend',n:'Mending Light',g:1800,st:30,cd:25,t:'self',d:'Heal 7 HP per second for 6s.',fn(){P.sb.mend=6}},
 {id:'zerk',n:"Berserker's Rite",g:1900,st:35,cd:48,t:'self',d:'+40% damage for 8s.',fn(){P.sb.zerk=8}},
 {id:'hex',n:'Hex of Frailty',g:2000,st:35,cd:16,t:'debuff',d:'Nearby enemies and bosses take +30% damage for 8s.',fn(){aoe(230,e=>{e.frail=8},'#c8f')}},
 {id:'trance',n:'Battle Trance',g:2200,st:20,cd:20,t:'self',d:'Stamina surges (+22 per second) for 8s.',fn(){P.sb.tr=8}},
 {id:'terror',n:'Terror',g:2300,st:45,cd:60,t:'debuff',d:'Staggers nearby enemies for 2s; bosses suffer heavy posture damage.',fn(){aoe(190,e=>{if(e.boss)e.post+=90;else{e.st='stagger';e.t=2.2;e.vx=0}},'#f6a')}},
 {id:'phase',n:'Phase Shroud',g:2600,st:50,cd:45,t:'self',d:'Become invulnerable for 2.5s.',fn(){P.inv=Math.max(P.inv,2.5);P.sb.phase=2.5}},
 {id:'curse',n:'Withering Curse',g:2800,st:40,cd:60,t:'debuff',d:'Nearby enemies and bosses deal 35% less damage for 8s.',fn(){aoe(230,e=>{e.weak=8},'#9c9')}}];
window.SPD_=SPD;function spCost(s){return Math.max(5,Math.round(s.st*(1-.06*(meta.up.spellc||0))))}
function castSpell(sl){if(!P||P.dead||paused||P.stun>0)return;if(window.NOSPELL){if(SPL[sl])toast('Normaldude \u2014 you cannot use spells');return}const id=SPL[sl];if(!id)return;const s=SPD.find(x=>x.id===id);if(!s)return;
 if((SPL.cd[id]||0)>0){toast(s.n+' \u00b7 '+Math.ceil(SPL.cd[id])+'s');return}const c=spCost(s);if(P.stam<c){toast('Not enough stamina');return}
 P.sb=P.sb||{};P.stam-=c;SPL.cd[id]=s.cd;s.fn();float(P.x,P.y-18,s.n.toUpperCase(),s.t==='self'?'#7fd0ff':'#d98cff');
 tone(440,880,.35,'sine',.08);tone(660,1320,.3,'triangle',.05,.06);if(s.t==='self')for(let i=0;i<16;i++)parts.push({x:P.x+6,y:P.y+22,vx:(Math.random()-.5)*60,vy:-40-Math.random()*90,l:.7,c:'#9fe0ff'})}
addEventListener('keydown',e=>{if(e.repeat||!P||paused||P.dead)return;if(e.code==='KeyZ')castSpell('z');else if(e.code==='KeyX')castSpell('x')});
function spellHTML(){let h='<hr><b>SPELLS</b> <small>(keys Z / X \u00b7 cost stamina \u00b7 cannot be sold)</small>';
 for(const s of SPD){const own=SPL.own.includes(s.id);h+=`<div class="row"><span><b style="color:${s.t==='self'?'#7fd0ff':'#d98cff'}">${s.n}</b> <small>${s.t==='self'?'Self buff':'Enemy debuff'} \u00b7 ${spCost(s)} stamina \u00b7 ${s.cd}s cooldown</small><br><small>${s.d}</small></span><span>`
  +(own?`<button data-se="${s.id}:z" ${SPL.z===s.id?'disabled':''}>${SPL.z===s.id?'Z \u2713':'Equip Z'}</button><button data-se="${s.id}:x" ${SPL.x===s.id?'disabled':''}>${SPL.x===s.id?'X \u2713':'Equip X'}</button>`:`<small style="color:#ffd36b">${s.g}g</small> <button data-sb="${s.id}" ${gold<s.g?'disabled':''}>Buy</button>`)+'</span></div>'}
 return h}
function bindShop2(){sheet.querySelectorAll('[data-eu]').forEach(b=>b.onclick=()=>{const c=elxCost();if(ELXL>=3||gold<c)return;gold-=c;ELXL++;applyElx();sfx.loot();save();drawShop()});
 sheet.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>{const s=SPD.find(x=>x.id===b.dataset.sb);if(!s||gold<s.g||SPL.own.includes(s.id))return;gold-=s.g;SPL.own.push(s.id);if(!SPL.z)SPL.z=s.id;else if(!SPL.x)SPL.x=s.id;sfx.loot();save();drawShop()});
 sheet.querySelectorAll('[data-se]').forEach(b=>b.onclick=()=>{const[id,sl]=b.dataset.se.split(':'),o=sl==='z'?'x':'z';if(SPL[o]===id)SPL[o]=null;SPL[sl]=id;sfx.loot();save();drawShop()})}
{const hs=document.createElement('div');hs.id='hSpl';hs.style.cssText='font-size:12px;letter-spacing:1px;text-shadow:0 1px 3px #000';const inf=document.querySelector('#hud .info');if(inf)inf.appendChild(hs)}
let splT=0;function splHud(dt){splT-=dt;if(splT>0)return;splT=.12;const hs=$('hSpl');if(!hs)return;let h='';for(const sl of['z','x']){const id=SPL[sl],s=id&&SPD.find(q=>q.id===id);
  h+=s?`<div style="color:${(SPL.cd[id]||0)>0?'#8a8a9a':s.t==='self'?'#7fd0ff':'#d98cff'}">[${sl.toUpperCase()}] ${s.n}${(SPL.cd[id]||0)>0?' '+Math.ceil(SPL.cd[id])+'s':''}</div>`:`<div style="color:#5a5a6a">[${sl.toUpperCase()}] \u2014</div>`}
 const sb=P.sb||{},act=Object.keys(sb).filter(k=>sb[k]>0).map(k=>({bul:'Bulwark',wind:'Windrunner',mend:'Mending',zerk:'Berserk',tr:'Trance',phase:'Shroud'}[k]+' '+Math.ceil(sb[k])+'s'));if(act.length)h+='<div style="color:#ffd36b;font-size:11px">'+act.join(' \u00b7 ')+'</div>';if(hs._s!==h){hs._s=h;hs.innerHTML=h}}

// --- damage dealing helpers ---
function harvest(){const l=meta.up.harvest|0;if(!l||!P)return;P.hp=Math.min(maxHp(),P.hp+maxHp()*(.02+.02*l));P.stam=Math.min(maxStam(),P.stam+5+10*l);float(P.x,P.y-20,'SOUL','#9fe');for(let i=0;i<8;i++)parts.push({x:P.x+6,y:P.y+10,vx:(Math.random()-.5)*60,vy:-30-Math.random()*60,l:.5,c:'#9fe'})}
function dotE(e,v,col){if(e.dead||(e.boss&&['dormant','intro','dying'].includes(e.st)))return;e.hp-=v;if(Math.random()<.3)float(e.x,e.y-6,Math.round(v),col||'#f93');
 if(e.boss){e.hp=Math.max(1,e.hp);return}
 if(e.hp<=0){e.dead=true;P.kills=(P.kills||0)+1;qEv('kill',e);gainXp(12+e.lvl*14);dropLoot(e);burst(e.x+7,e.y+10,18,'#f84');harvest();setTimeout(()=>{e.x=e.home;e.y=-100},0);
  setTimeout(()=>{if(!P)return;e.dead=false;e.hp=e.max;e.st='idle';e.vx=0;e.y=(e.hy!=null?e.hy:findY(e.home))},60000)}}
function stormArc(){const px=P.x+6,py=P.y+11;for(const e of enemies){if(e.dead||(e.boss&&['dormant','intro'].includes(e.st)))continue;if(Math.hypot(e.x+e.w/2-px,e.y+e.h/2-py)<100){dotE(e,dmgOut()*.6,'#ff6');burst(e.x+e.w/2,e.y+e.h/2,8,'#ff6')}}
 for(let i=0;i<20;i++){const a=i/20*6.283;parts.push({x:px,y:py,vx:Math.cos(a)*220,vy:Math.sin(a)*220,l:.25,c:i%2?'#ff6':'#fff'})}noise(.2,.18,6000,800,'highpass')}
let inH=0;
const hitW=f=>function(e){if(inH||!P||!P.weapon)return f(e);inH=1;const w=P.weapon,d0=w.dmg,U=meta.up,sb=P.sb||{};let m=1;
 const ck=(w.ench||[]).filter(b=>b.k==='crit');const cc=Math.min(1,(U.crit|0)*.02+ck.reduce((a,b)=>a+b.v,0)+enc('critr')),cdm=2+(U.critd|0)*.12+enc('critd');   // Keen Eye (echo) + Precision (enchant) are ONE crit chance; Ruthlessness boosts every crit
 if(e.st!=='broken'&&cc>0&&Math.random()<cc){m*=cdm;float(e.x,e.y-26,'CRIT \u00d7'+cdm.toFixed(2).replace(/0$/,''),'#ffb347');burst(e.x+(e.w||14)/2,e.y+(e.h||22)/2,10,'#ffd36b')}
 if(P.rip>0){m*=1+.25*(1+(U.riposte|0));P.rip=0;float(e.x,e.y-34,'RIPOSTE','#fc6')}
 if(!e.boss&&(U.exec|0)&&e.hp<e.max*.25)m*=1+.25*U.exec;
 if(P.adr>0&&(U.adren|0))m*=1+.1*(1+U.adren);
 if(sb.zerk>0)m*=1.4;if(e.frail>0)m*=1.3;
 const wd0=e.dead;w.dmg=d0*m;ck.forEach(b=>b.k='crit_');try{f(e)}finally{ck.forEach(b=>b.k='crit');w.dmg=d0;inH=0}if(e.dead&&!wd0&&!e.boss)harvest()};
hitEnemy=hitW(hitEnemy);hitBoss=hitW(hitBoss);
const _wf3=wfx;wfx=function(e,d){_wf3(e,d);if(!P)return;const U=meta.up;
 if(armEq.hands==='uq_glacial_hands'){e.slow=Math.max(e.slow||0,1.5);if(e.boss)e.post+=12;else if(Math.random()<.12){e.st='stagger';e.t=1;burst(e.x+e.w/2,e.y+e.h/2,12,'#bff');float(e.x,e.y-26,'FROZEN','#9ef')}}};
const _hp5=hurtPlayer;hurtPlayer=function(dmg,pd,from,br){if(!P)return _hp5(dmg,pd,from,br);const sb=P.sb||{};
 if(from&&from.weak>0){dmg*=.65;pd*=.65}if(sb.bul>0)dmg*=.65;
 if(armEq.chest==='uq_hollow_chest'&&(P.vw||0)<=0&&P.inv<=0&&!inSafe()){P.vw=12;P.hp=Math.min(maxHp(),P.hp+maxHp()*.1);P.inv=.4;float(P.x,P.y-14,'VOID WARD','#c8f');burst(P.x+6,P.y+10,20,'#b8f');tone(200,500,.4,'sine',.1);return'dodge'}
 const r=_hp5(dmg,pd,from,br);if(r==='parry'&&meta.up.riposte)P.rip=3;if(r==='hit'&&meta.up.adren)P.adr=4;return r};
const _die2=die;die=function(){if(P&&!P.dead&&(meta.up.swind|0)>0&&!P.swUsed&&P.lives<=1&&P.y<H*T-60){P.swUsed=1;P.hp=Math.max(1,maxHp()*(.25+.15*meta.up.swind));P.inv=3;P.stun=0;P.guardBroken=0;toast('\u2726 SECOND WIND \u2726');burst(P.x+6,P.y+10,30,'#ffd36b');tone(330,990,.8,'sine',.12);return}_die2()};
const _up2=updPlayer;updPlayer=function(dt){if(!P||P.dead)return _up2(dt);P.sb=P.sb||{};const sb=P.sb;P.ifcd=Math.max(0,(P.ifcd||0)-dt);P.rip=Math.max(0,(P.rip||0)-dt);P.adr=Math.max(0,(P.adr||0)-dt);P.vw=Math.max(0,(P.vw||0)-dt);
 for(const k in sb)sb[k]=Math.max(0,sb[k]-dt);for(const id in SPL.cd)SPL.cd[id]=Math.max(0,SPL.cd[id]-dt);
 if(sb.mend>0)P.hp=Math.min(maxHp(),P.hp+7*dt);if(sb.tr>0)P.stam=Math.min(maxStam(),P.stam+22*dt);
 const bonus=(sb.wind>0?70:0)+(P.adr>0&&meta.up.adren?35:0);S.spd+=bonus;try{_up2(dt)}finally{S.spd-=bonus}};
const _td2=tryDodge;tryDodge=function(){const was=P?P.dodge:0;_td2();if(P&&was<=0&&P.dodge>0&&armEq.legs==='uq_tempest_legs')stormArc()};

// --- unique boss armor ---
const UB=ASET.length;
ASET.push({n:'Ember Tyrant',rar:4,p:0,def:.1,wt:0,c:['#3a0f0a','#d8501a','#ffc060'],fx:{hp:250,dmg:.25},bn:{}},{n:'Glacial Devourer',rar:4,p:0,def:.1,wt:0,c:['#2a4a6a','#8ad0ff','#f0ffff'],fx:{post:267,pdmg:.667},bn:{}},
 {n:'Tempest Dragon',rar:4,p:0,def:.1,wt:0,c:['#2a2f6a','#f0e04a','#fffbb0'],fx:{spd:56,atkc:.32},bn:{}},{n:'Hollow King',rar:4,p:0,def:.1,wt:0,c:['#1a1026','#8a5ae0','#e8c8ff'],fx:{hp:150,parry:.075},bn:{}});
const UQ=[['ember','helm','Crown of the Ember Tyrant','uq_ember_helm',.07,'Smoldering Aura: scorches enemies standing close to you with fire.'],
 ['glacial','hands','Rimebound Gauntlets','uq_glacial_hands',.06,'Frozen Grip: your strikes chill enemies, may freeze them, and shatter boss posture.'],
 ['tempest','legs','Stormstride Greaves','uq_tempest_legs',.07,'Static Dash: every dash unleashes a lightning arc around you.'],
 ['hollow','chest','Hollowheart Cuirass','uq_hollow_chest',.12,'Void Ward: every 12s the first hit you take is negated and heals 10% max HP.']];
UQ.forEach((u,i)=>{const a={id:u[3],set:UB+i,slot:u[1],name:u[2],rar:4,def:u[4],wt:0,price:0,uq:u[0],pas:u[5]};ARMS.push(a);ARMB[a.id]=a});
const _at=armTxt;armTxt=function(a){return _at(a)+(a.pas?'<br><span style="color:#ffb347">\u2726 '+a.pas+'</span>':'')};
const _fb4=finishBoss;finishBoss=function(B){_fb4(B);const u=UQ.find(q=>q[0]===B.id);if(u&&!armOwned.includes(u[3])){armOwned.push(u[3]);setTimeout(()=>{if(P)toast('\u2726 Unique armor: '+u[2])},2200)}};

// --- per-frame upkeep: debuff timers, ember aura, respawn anchor, spell HUD, quest cleanup, camera release ---
let AUR=0;const _uf3=updFx;updFx=function(dt){_uf3(dt);if(!P||paused)return;
 for(const e of enemies){if(e.frail>0)e.frail-=dt;if(e.weak>0)e.weak-=dt;if(e.hy==null&&!e.boss&&!e.dead)e.hy=e.y}
 AUR-=dt;if(AUR<=0){AUR=.25;if(armEq.helm==='uq_ember_helm'){const px=P.x+6,py=P.y+11;for(const e of enemies){if(e.dead||(e.boss&&['dormant','intro','dying'].includes(e.st)))continue;if(Math.hypot(e.x+e.w/2-px,e.y+e.h/2-py)<80)dotE(e,dmgOut()*.1,'#f93')}
  for(let i=0;i<3;i++)parts.push({x:px+(Math.random()-.5)*60,y:py+(Math.random()-.5)*30,vx:0,vy:-30,l:.5,c:'#f93'})}}
 if(QS)for(let i=0;i<QS.slots.length;i++)if(QS.slots[i]&&QS.slots[i].type==='boss')QS.slots[i]=genQuest(QS.slots[i].tier);
 if(camFocus&&!enemies.some(e=>e.boss&&!e.dead&&(e.st==='intro'||e.st==='corrupt')))camFocus=null;splHud(dt)};

// --- persistence (spells + elixir level) ---
const _sv3=save;save=function(){_sv3();try{const d=JSON.parse(localStorage.getItem(SAVEKEY));if(d){d.spl={own:SPL.own,z:SPL.z,x:SPL.x};d.elxL=ELXL;localStorage.setItem(SAVEKEY,JSON.stringify(d))}}catch(e){}};
const _ld3=load;load=function(){const r=_ld3();if(r){try{const d=JSON.parse(localStorage.getItem(SAVEKEY));SPL.own=(d.spl&&d.spl.own)||[];SPL.z=(d.spl&&d.spl.z)||null;SPL.x=(d.spl&&d.spl.x)||null;SPL.cd={};ELXL=Math.max(0,Math.min(3,d.elxL|0));applyElx()}catch(e){}}return r};
const _st3=start;start=function(n){const had=!!localStorage.getItem(SAVEKEY);const r=_st3(n);if(n||!had){SPL.own=[];SPL.z=SPL.x=null;SPL.cd={};ELXL=0;applyElx()}camFocus=null;return r};
applyElx();

// --- Tempest Dragon: lightning attacks ---
const YEL='rgb(255,244,120)';
Object.assign(AT,{
 stormstrike:{wu:.8,act:2.2,rec:1.1,f(B){B.qn=0;B.qa=0},tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<(B.fury?7:5)){B.qa=.38;B.qn++;const px=P.x+6+P.vx*.4;bzone(B,px,.62,26);bzone(B,px-70,.8,18);bzone(B,px+70,.8,18)}}},
 thunderstorm:{wu:1.0,act:3.0,rec:1.4,f(B){B.qn=0;B.qa=0},tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<(B.fury?16:12)){B.qa=.18;B.qn++;const a=B.ar;bzone(B,(a.cx+(Math.random()-.5)*a.hw*1.9)*T,.75,22);if(B.qn%3===0)bzone(B,P.x+6,.75,22)}}},
 skyfork:{wu:.9,act:1.8,rec:1.2,f(B){B.qn=0;B.qa=0},tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<3){B.qa=.55;B.qn++;const sd=B.qn%2?1:-1,a=B.ar,y0=(a.fy-a.ht+3)*T,yb=a.fy*T-40;for(let i=0;i<7;i++)proj(sd>0?(a.cx-a.hw+2)*T:(a.cx+a.hw-2)*T,y0+i*((yb-y0)/6),sd*300,0,bdm(B)*.5,YEL,B.def.pd*.5,4)}}},
 ballstorm:{wu:.9,act:2.0,rec:1.3,f(B){const n=B.fury?4:3;for(let i=0;i<n;i++){const an=Math.PI/2+(i-(n-1)/2)*.6;proj(bcx(B),bcy(B),Math.cos(an)*95,Math.sin(an)*95,bdm(B)*.6,YEL,B.def.pd*.5,9)}B.qa=0;B.qn=0},tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<4){B.qa=.5;B.qn++;bzone(B,P.x+6,.6,24)}}}});
BD.tempest.a1.push('stormstrike');BD.tempest.a2.push('stormstrike','thunderstorm','skyfork','ballstorm');
Object.assign(HINT,{stormstrike:'BOLTS INCOMING',thunderstorm:'KEEP MOVING',skyfork:'JUMP / DODGE',ballstorm:'AVOID THE ORBS'});
Object.assign(BSND,{stormstrike:(B,v)=>{for(let i=0;i<4;i++){noise(.15,.2*v,6000,800,'highpass',1,i*.38);tone(2600,200,.2,'sawtooth',.08*v,i*.38)}},
 thunderstorm:(B,v)=>{noise(2.4,.3*v,600,60,'lowpass');tone(70,35,2,'sawtooth',.12*v)},skyfork:(B,v)=>{for(let i=0;i<3;i++){tone(3200,300,.3,'square',.08*v,i*.55);noise(.3,.18*v,7000,900,'highpass',1,i*.55)}},
 ballstorm:(B,v)=>{tone(120,300,.8,'sine',.14*v);tone(900,1400,.5,'sawtooth',.05*v)}});

// ---------- 8. Nameless Blessing ----------
const BKEY='ashfall_blessing_v1',BKEY2='ashfall_blessing2_v1';let BLESS=false,BLESS2=false;try{BLESS=localStorage.getItem(BKEY)==='1';BLESS2=localStorage.getItem(BKEY2)==='1'}catch(e){}
const _rc2=recalc;recalc=function(){_rc2();if((!BLESS&&!BLESS2)||typeof P==='undefined'||!P)return;const f=(BLESS?1.05:1)*(BLESS2?1.2:1),fort=P.at.fort,str=P.at.str,agi=P.at.agi;
 S.hp=Math.round((80+fort*10+S.hp)*f-80-fort*10);S.stam=Math.round((80+agi*15+S.stam)*f-80-agi*15);S.post=Math.round((60+fort*4+str*2+S.post)*f-60-fort*4-str*2);
 S.dmg=(1+str*.1+S.dmg)*f-1-str*.1;S.spd=(150+agi*3+S.spd)*f-150-agi*3;S.jump=(1+S.jump)*f-1;S.air=(1+S.air)*f-1;
 S.dodge=1-(1-S.dodge)/f;S.atkc=1-(1-S.atkc)/f;S.pdmg=(1+S.pdmg)*f-1;S.parry=S.parry+.05;S.regen=(1+S.regen)*f-1;S.def=1-(1-(S.def||0))/f;
 P.hp=Math.min(P.hp,maxHp());P.stam=Math.min(P.stam,maxStam())};
const _um=updMenu;updMenu=function(){_um();if(BLESS){const e=$('echoes');e.innerHTML=e.textContent+(BLESS?' &nbsp;\u00b7&nbsp; <span style="color:#ffe08a">\u2726 Nameless Blessing +5%</span>':'')+(BLESS2?' &nbsp;\u00b7&nbsp; <span style="color:#ff8a9a">\u2740 Emptiness Filled +20%</span>':'')}};

// ---------- 9. boss themes (only while a boss fight is live) ----------
const MUS={id:null,out:null,t:0,s:0,B:null};const mf=m=>440*Math.pow(2,(m-69)/12);
const TH={
 ember:{bpm:138,r:[38,38,41,36],sc:[0,3,5,7,10],bp:'1001001010010010',k:'1000100010001010',h:'0010001000100011',ar:[0,-1,2,-1,3,-1,2,-1,4,-1,3,-1,2,-1,1,-1],bw:'sawtooth',lw:'square',pw:'sawtooth',pc:[0,3,7],lv:.05},
 glacial:{bpm:96,r:[40,36,38,35],sc:[0,2,3,7,8],bp:'1000000000001000',k:'1000000010000000',h:'0000000000000000',ar:[0,-1,1,-1,2,-1,3,-1,4,-1,3,-1,2,-1,1,2],bw:'sine',lw:'triangle',pw:'triangle',pc:[0,7,12],lv:.07,bell:1,al:2.6},
 tempest:{bpm:162,r:[45,43,41,43],sc:[0,2,3,5,7,8,10],bp:'1010101010101010',k:'1000100010001000',h:'0010001000100010',ar:[0,2,4,2,5,4,2,0,3,5,7,5,4,2,3,1],bw:'sawtooth',lw:'square',pw:'sawtooth',pc:[0,3,7],lv:.04,al:1},
 hollow:{bpm:88,r:[41,40,39,40],sc:[0,1,5,6,8],bp:'1000000000100000',k:'1001000000000000',h:'0000000000000000',ar:[0,-1,-1,2,-1,-1,1,-1,-1,3,-1,-1,4,-1,2,-1],bw:'sine',lw:'triangle',pw:'sawtooth',pc:[0,1,6],lv:.07,pv:.03,al:3},
 avatar:{bpm:104,r:[38,37,34,36],sc:[0,1,4,5,7,8,10],bp:'1000100010001010',k:'1000001010001000',h:'0010001000100110',ar:[0,-1,2,-1,3,-1,1,-1,4,-1,3,-1,5,-1,2,1],bw:'sawtooth',lw:'triangle',pw:'sawtooth',pc:[0,1,6],lv:.06,pv:.04,al:2,bell:1},
 deity:{bpm:112,r:[43,40,36,38],sc:[0,2,4,5,7,9,11],bp:'1000001010000010',k:'1000001010000010',h:'0010001000100010',ar:[0,2,4,7,4,2,4,7,5,4,2,4,7,9,7,4],bw:'triangle',lw:'sine',pw:'triangle',pc:[0,4,7],lv:.075,pv:.045,bell:1,al:2.2}};
function mnote(f,t,d,type,v,det,at){const a=Audio_.ac;if(!a||!MUS.out)return;try{const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;if(det)o.detune.value=det;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(at||Math.min(.02,d/4)));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(MUS.out);o.start(t);o.stop(t+d+.05)}catch(e){}}
let MNB=null;
function mhat(t,sd){const a=Audio_.ac;if(!a||!MUS.out)return;try{if(!MNB){MNB=a.createBuffer(1,a.sampleRate,a.sampleRate);const c=MNB.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1}
 const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=MNB;f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+sd*.8);s.connect(f);f.connect(g);g.connect(MUS.out);s.start(t);s.stop(t+sd)}catch(e){}}
function mkick(t,v){const a=Audio_.ac;if(!a||!MUS.out)return;try{const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.3*v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.18);o.connect(g);g.connect(MUS.out);o.start(t);o.stop(t+.2)}catch(e){}}
function musPlay(th,st,t,sd,B){const bar=(st>>4)&3,s=st&15,r=th.r[bar],hi=B&&B.ph===2,fu=B&&B.fury;
 if(th.bp[s]==='1'){mnote(mf(r),t,sd*2.4,th.bw,.15);if(hi&&s%4===0)mnote(mf(r+12),t,sd*1.2,th.bw,.06)}
 if(th.k[s]==='1')mkick(t,fu?1.2:1);if(th.h[s]==='1'||(hi&&s%2===1))mhat(t,sd);
 const ai=th.ar[s];if(ai>=0){const n=th.sc.length,m=r+24+th.sc[ai%n]+12*((ai/n)|0);mnote(mf(m),t,sd*(th.al||1.6),th.lw,th.lv*(hi?1.25:1));if(th.bell)mnote(mf(m+12),t,sd*3,'sine',th.lv*.45)}
 if(s===0)for(const iv of th.pc)mnote(mf(r+12+iv),t,sd*15,th.pw,th.pv||.035,(Math.random()-.5)*14,sd*4)}
function musStart(id,B){const a=AC_();if(!a)return;MUS.id=id;MUS.B=B;MUS.out=a.createGain();MUS.out.connect(a.destination);MUS.out.gain.setValueAtTime(.0001,a.currentTime);MUS.out.gain.exponentialRampToValueAtTime(.55,a.currentTime+.8);MUS.t=a.currentTime+.08;MUS.s=0}
function musStop(){if(!MUS.id)return;const a=Audio_.ac,o=MUS.out;MUS.id=null;MUS.out=null;if(a&&o){try{o.gain.cancelScheduledValues(a.currentTime);o.gain.setValueAtTime(Math.max(.0001,o.gain.value),a.currentTime);o.gain.exponentialRampToValueAtTime(.0001,a.currentTime+.6)}catch(e){}setTimeout(()=>{try{o.disconnect()}catch(e){}},900)}}
function musTick(){const a=Audio_.ac,th=TH[MUS.id];if(!a||!th)return;const B=MUS.B,sd=60/th.bpm/4/(B&&B.fury?1.28:B&&B.ph===2?1.14:1);let g=0;
 while(MUS.t<a.currentTime+.25&&g++<12){musPlay(th,MUS.s%64,MUS.t,sd,B);MUS.t+=sd;MUS.s++}}
// custom theme files: put them in a "bossthemes" folder next to index.html (any of mp3/ogg/wav/m4a/opus/flac/aac)
const FILEN={avatar:'emptytheme',ember:'embertyranttheme',glacial:'glacialdevourertheme',tempest:'tempestdragontheme',hollow:'hollowkingtheme',deity:'namelessdeitytheme'},EXTS=['mp3','ogg','wav','m4a','opus','flac','aac'],FILES={};let FA=null;
function probe(id,i){if(i>=EXTS.length)return;try{const a=new Audio();a.preload='auto';a.loop=true;a.addEventListener('canplay',()=>{FILES[id]=a},{once:true});a.addEventListener('error',()=>probe(id,i+1),{once:true});a.src='bossthemes/'+FILEN[id]+'.'+EXTS[i]}catch(e){}}
try{if(typeof Audio==='function')for(const id in FILEN)probe(id,0)}catch(e){}
function fileStart(a){if(a.fi){clearInterval(a.fi);a.fi=0}if(FA===a){if(a.paused)a.play().catch(()=>{});return}fileStop(true);FA=a;a.currentTime=0;a.volume=.7;a.play().catch(()=>{})}
function fileStop(reset){const a=FA;if(!a)return;FA=null;a.fi=setInterval(()=>{a.volume=Math.max(0,a.volume-.1);if(a.volume<=0){clearInterval(a.fi);a.fi=0;a.pause();if(reset)a.currentTime=0;a.volume=.7}},50)}
setInterval(()=>{try{const F=P&&!P.dead?enemies.find(e=>e.boss&&!e.dead&&e.st!=='dormant'&&e.st!=='dying'&&e.st!=='corrupt'):null,B=F&&!paused&&!Audio_.mute?F:null;
 if(!F)fileStop(true);else if(!B&&FA)FA.pause();
 const MK=B?(B.av?'avatar':B.id):null;if(B&&FILES[MK]){musStop();fileStart(FILES[MK]);return}
 if(!B||!TH[MK]){musStop();return}if(MUS.id!==MK){musStop();musStart(MK,B)}MUS.B=B;musTick()}catch(e){}},40);

// ---------- 10. unique boss sound effects ----------
let CB=null;const nz=(...a)=>noise(...a),tn=(...a)=>tone(...a);
const BI={
 ember(k,B){if(k===1){tn(70,38,1.5,'sawtooth',.26);nz(1.4,.22,900,120,'lowpass');for(let i=0;i<6;i++)nz(.08,.16,3000,1500,'highpass',1,.2+i*.17)}
  else if(k===2){const d=B&&B.st==='dying';tn(55,28,d?2.2:1.6,'sawtooth',.3);tn(110,60,1,'square',.12,.1);nz(1.2,.25,1200,90,'lowpass')}else{tn(300,60,1.8,'sine',.15);nz(1.4,.15,3000,300,'highpass')}},
 glacial(k,B){if(k===1){[2400,3200,4000,5200].forEach((f,i)=>tn(f,f*.7,.9,'sine',.07,i*.12));nz(.8,.18,6000,2000,'highpass',2);tn(90,45,1.2,'sine',.2)}
  else if(k===2){nz(.6,.3,5000,300,'bandpass',1.5);tn(1500,200,.5,'square',.1);tn(80,30,1.2,'sine',.25)}else for(let i=0;i<8;i++)tn(2000+Math.random()*3000,900,.4,'triangle',.06,i*.07)},
 tempest(k,B){if(k===1){nz(1.7,.3,500,60,'lowpass');tn(2400,120,.3,'square',.1,.1);tn(60,35,1.4,'sawtooth',.14)}
  else if(k===2){nz(1.2,.35,700,80,'lowpass');tn(3000,100,.4,'sawtooth',.14);tn(3000,100,.3,'square',.1,.25)}else{nz(2,.2,400,50,'lowpass');tn(50,30,2,'sine',.2)}},
 hollow(k,B){if(k===1){[196,233,277,330].forEach((f,i)=>tn(f*.98,f*1.03,1.8,'triangle',.06,i*.2));nz(1.6,.1,900,300,'bandpass',4)}
  else if(k===2){[185,196,277,294].forEach((f,i)=>tn(f,f*.5,1.6,'sawtooth',.07,i*.08));tn(60,30,1.8,'sine',.25)}else{tn(98,90,2.5,'sine',.22);tn(196,180,2.2,'sine',.08)}},
 deity(k,B){if(k===1){tn(45,30,4,'sawtooth',.16);nz(4,.12,200,60,'lowpass');[196,247,294].forEach((f,i)=>tn(f,f*1.01,3,'sine',.04,1+i*.4))}
  else if(k===2){[262,330,392,523,659].forEach((f,i)=>tn(f,f*1.02,1.6,'triangle',.08,i*.07));tn(110,55,1.6,'sine',.25);nz(.8,.15,4000,500,'highpass',1)}
  else[392,494,588,784,988].forEach((f,i)=>tn(f,f,3,'sine',.07,i*.1))},
 avatar(k,B){if(k===1){tn(55,26,3.4,'sawtooth',.3);tn(110,41,2.6,'square',.14);nz(3,.3,3000,70,'lowpass')}
  else if(k===2){tn(70,30,1.8,'sawtooth',.28);[262,311,370,466].forEach((f,i)=>tn(f,f*.5,1.6,'sawtooth',.06,i*.07));nz(1,.25,5000,200,'bandpass',1.5)}
  else{tn(60,35,2.4,'sine',.3);[392,466,587].forEach((f,i)=>tn(f,f,2.6,'triangle',.06,i*.1))}}};
const BHIT={ember:()=>tn(95,60,.12,'square',.08),glacial:()=>tn(2800,1800,.1,'triangle',.07),tempest:()=>{nz(.1,.1,6000,2000,'highpass');tn(300,100,.08,'sawtooth',.06)},
 hollow:()=>tn(160,110,.25,'sine',.1),avatar:()=>{tn(180,90,.2,'sawtooth',.07);tn(1500,700,.15,'triangle',.04)},deity:()=>{tn(1318,1318,.4,'sine',.06);tn(1976,1976,.3,'sine',.03)}};
const BSIG={
 ember:{tele:v=>nz(.4,.1*v,1200,300,'bandpass',2),act:v=>{for(let i=0;i<3;i++)nz(.07,.12*v,3500,1800,'highpass',1,i*.06)}},
 glacial:{tele:v=>tn(3200,2400,.4,'sine',.05*v),act:v=>{tn(4200,1500,.25,'triangle',.07*v);tn(5200,1800,.2,'triangle',.05*v,.05)}},
 tempest:{tele:v=>nz(.35,.08*v,6000,2500,'highpass'),act:v=>{nz(.15,.2*v,6000,600,'highpass');tn(80,35,.3,'sawtooth',.1*v,.05)}},
 hollow:{tele:v=>tn(220,140,.5,'triangle',.06*v),act:v=>{tn(147,70,.5,'sine',.12*v);tn(1400,300,.3,'triangle',.04*v)}},
 avatar:{tele:v=>{tn(110,70,.6,'sawtooth',.05*v);nz(.4,.08*v,4000,800,'bandpass',2)},act:v=>{tn(1800,150,.4,'sawtooth',.06*v);nz(.3,.14*v,6000,500,'highpass')}},
 deity:{tele:v=>{[523,659,784].forEach((f,i)=>tn(f,f*1.2,.5,'sine',.05*v,i*.06))},act:v=>{tn(1568,1568,.5,'sine',.07*v);tn(2093,2093,.4,'sine',.04*v,.04);nz(.25,.12*v,5000,800,'highpass')}}};
bsfx=function(k){const B=CB,f=BI[B&&BI[B.id]?B.id:'ember'];f(k,B)};
const _ub3=updBoss;updBoss=function(B,dt){CB=B;const ps=B.st,dz=B.id==='deity',hz=B.id==='hollow';_ub3(B,(dz||hz)&&ps!=='intro'&&ps!=='dormant'?dt*(dz?1.4:1.3):dt);if(dz)deityIntro(B,ps,dt);if(hz)hollowIntro(B,ps,dt);if(!B.dead&&B.st==='idle'&&!(B.roar>0)&&((dz&&B.t>.25)||(hz&&B.t>.45)))B.t=dz?.25:.45;if(B.dead||!P||B.st===ps)return;const g=BSIG[B.av?'avatar':B.id],v=near(B.x+B.w/2);if(!g)return;if(B.st==='tele')g.tele(v);else if(B.st==='act')g.act(v)};
const A1=['judgment','halo','smite','blink'];
const _hb=hitBoss;hitBoss=function(B){CB=B;const bad=['dormant','intro','phase','dying'].includes(B.st),ph0=B.ph,fu0=B.fury;_hb(B);if(!bad&&BHIT[B.id])BHIT[B.id]();
 if(B.id==='deity'&&!bad&&B.hp>0){const d=B.def;
  if(!B.p2&&B.hp<=B.max*.75){B.p2=1;d.a1.push('seraph','heavenfall');B.st='phase';B.t=1.4;B.vx=0;zones=[];projs=[];toast('PHASE II \u2014 The Deity ascends');bsfx(2)}
  if(B.ph===2&&ph0===1){d.a2=d.a1.concat(['chorus','nova','wall']);toast('PHASE III \u2014 Heaven burns')}
  if(B.fury&&!fu0){d.a2.push('spiral','cataclysm','sunder');toast('PHASE IV \u2014 Judgment Day')}}};
const _bh=bossHud;bossHud=function(){const B=enemies.find(e=>e.boss&&!e.dead&&e.st!=='dormant'),dI=B&&B.id==='deity'&&B.st==='intro',hI=B&&B.id==='hollow'&&B.st==='intro',rt=B&&B.t;if(dI)B.t=rt>5?3:3*rt/5;else if(hI)B.t=Math.min(rt,3);_bh();if(dI||hI)B.t=rt;if(!B||!(B.id==='deity'||B.id==='hollow'))return;
 const rm=B.rmax||1.4;if(B.roar>rm-.4){cx.save();cx.fillStyle=(B.av?'rgba(255,30,60,':B.id==='deity'?'rgba(255,255,255,':'rgba(225,200,255,')+Math.min(.9,(B.roar-(rm-.4))/.4*.9)+')';cx.fillRect(0,0,cv.width,cv.height);cx.restore()}
 if(B.id!=='deity'||dI)return;const n=B.fury?4:B.ph===2?3:B.p2?2:1;
 cx.save();cx.textAlign='center';cx.font='bold 10px Georgia';cx.fillStyle='#ffe08a';cx.shadowColor='#000';cx.shadowBlur=3;cx.fillText('PHASE '+['','I','II','III','IV'][n],cv.width/2,60);cx.restore()};

// ---------- 11. The Nameless Deity (final boss) ----------
const DEITY={id:'deity',cx:60,fy:28,hw:50,ht:24,g:6,side:1,bg:['#e4e1d8','#c9c5b9'],pl:[[-44,5,10],[34,5,10],[-8,10,16],[-32,14,9],[24,14,9],[-5,18,10],[-46,20,6],[40,20,6]]};
BD.deity={n:'The Nameless Deity',sub:'The Void That Watches',tier:5,hp:200000,pmax:Math.round(BD.hollow.pmax*1.25),w:26,h:50,spd:Math.round(BD.hollow.spd*1.25),dmg:Math.round(BD.hollow.dmg*1.25),
 pd:Math.round(BD.hollow.pd*1.25),reach:Math.round(BD.hollow.reach*1.25),jv:0,zc:'70,120,235',wpn:'voidfang',col:['#e9e6df','#1a1a1f'],sn:3,ps:Math.round(BD.hollow.ps*1.25*1.2),fly:1,amb:3.2,aw:30,
 a1:['judgment','halo','smite','blink'],a2:['judgment','halo','smite','blink','seraph','heavenfall','chorus','nova','wall']};
Object.assign(HINT,{judgment:'LIGHT FALLS',halo:'FIND THE GAP',seraph:'BLADES RAIN',smite:'PARRY / BACK OFF',blink:'BEHIND YOU',heavenfall:'RUN',chorus:'WEAVE THROUGH',cataclysm:'FIND THE GAP',sunder:'BACK OFF'});
const dm_=B=>B.def.dmg*(B.er||1),GOLD='rgb(70,120,235)';
Object.assign(AT,{
 judgment:{wu:.95,act:1.5,rec:1.2,f(B){const px=P.x+6+P.vx*.45,g=B.ph===2?1.15:1;[-3,-2,-1,0,1,2,3].forEach(o=>bzone(B,px+o*50*g,.85+Math.abs(o)*.17,28))}},
 halo:{wu:.9,act:2.0,rec:1.3,f(B){B.hn=0;B.ha=0},tk(B,dt){B.ha-=dt;if(B.ha<=0&&B.hn<(B.fury?4:3)){B.ha=.6;const n=26,gap=Math.atan2(P.y+11-bcy(B),P.x+6-bcx(B))+(Math.random()-.5)*1.8,sp=(B.def.ps||200)*.72+B.hn*18;
   for(let i=0;i<n;i++){const a=i/n*6.283;if(Math.abs(Math.atan2(Math.sin(a-gap),Math.cos(a-gap)))<.36)continue;proj(bcx(B),bcy(B),Math.cos(a)*sp,Math.sin(a)*sp,dm_(B)*.5,GOLD,B.def.pd*.5,5)}B.hn++;shake=Math.max(shake,2)}}},
 seraph:{wu:.8,act:1.9,rec:1.2,f(B){B.qn=0;B.qa=0},tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<(B.fury?14:11)){B.qa=.17;B.qn++;const a=B.ar,x=P.x+6+(Math.random()-.5)*240,y=(a.fy-a.ht+2)*T,an=Math.atan2(P.y+11-y,P.x+6+P.vx*.25-x);proj(x,y,Math.cos(an)*250,Math.sin(an)*250,dm_(B)*.55,'rgb(70,120,235)',B.def.pd*.5,4)}}},
 smite:{wu:.7,act:.35,rec:1.0,f(B){B.face=P.x>bcx(B)?1:-1},tk(B){if(!B.hit&&B.t<.3){B.hit=true;shake=7;sfx.hit();bhit(B,B.def.reach*1.25,1.3);for(const s of[-1,1])proj(bcx(B),B.ar.fy*T-8,s*230,0,dm_(B)*.6,GOLD,B.def.pd*.5,6)}}},
 blink:{wu:.55,act:1.1,rec:1.0,f(B){const a=B.ar,tx=P.x+6+(P.face>0?-58:58);B.tp=Math.max((a.cx-a.hw+2)*T,Math.min((a.cx+a.hw-2)*T,tx))-B.w/2;B.tl=.8;B.vis=.15;bzone(B,B.tp+B.w/2,.8,54,true)},
  tk(B,dt){if(B.tp!=null){B.tl-=dt;if(B.tl<=0){burst(bcx(B),bcy(B),16,'#9ab8ff');B.x=B.tp;B.tp=null;B.vis=1;B.face=P.x>bcx(B)?1:-1;burst(bcx(B),bcy(B),20,'#fff');shake=5;bhit(B,B.def.reach*1.1,1.2);
   const o=Math.random()*6.283;for(let i=0;i<10;i++){const a=o+i/10*6.283;proj(bcx(B),bcy(B),Math.cos(a)*190,Math.sin(a)*190,dm_(B)*.45,GOLD,B.def.pd*.4,4)}}}}},
 heavenfall:{wu:1.0,act:2.2,rec:1.3,f(B){const a=B.ar;for(let i=0;i<Math.round(a.hw*.7);i++)bzone(B,(a.cx+(Math.random()-.5)*a.hw*1.8)*T,1.1+i*.06,18);bzone(B,P.x+6,1.2,22);B.qa=0;B.qn=0},
  tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<10){B.qa=.2;B.qn++;const a=B.ar;proj((a.cx+(Math.random()-.5)*a.hw*1.9)*T,(a.fy-a.ht+1)*T,(Math.random()-.5)*40,230,dm_(B)*.5,'rgb(25,25,35)',B.def.pd*.5,6)}}},
 cataclysm:{wu:1.2,act:3.0,rec:1.4,f(B){const a=B.ar,x0=(a.cx-a.hw+2)*T,x1=(a.cx+a.hw-2)*T;for(let k=0;k<3;k++){const gc=Math.max(x0+60,Math.min(x1-60,P.x+6+(k?(Math.random()<.5?-1:1)*(100+Math.random()*140):(Math.random()-.5)*60))),t=1.4+k*.9;for(let x=x0;x<x1;x+=34)if(Math.abs(x-gc)>44)bzone(B,x,t,36)}B.qa=0;B.qn=0;shake=Math.max(shake,4)},
  tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<12){B.qa=.22;B.qn++;const a=B.ar;proj((a.cx+(Math.random()-.5)*a.hw*1.9)*T,(a.fy-a.ht+1)*T,0,240,dm_(B)*.5,'rgb(25,25,35)',B.def.pd*.5,6)}}},
 sunder:{wu:.6,act:1.3,rec:1.0,f(B){B.sc=0;B.sn3=0},tk(B,dt){B.sc-=dt;if(B.sc<=0&&B.sn3<3){B.sc=.38;B.sn3++;B.face=P.x>bcx(B)?1:-1;shake=Math.max(shake,6);sfx.hit();bhit(B,B.def.reach*1.3,1.1);const o=Math.random()*6.283;for(let i=0;i<8;i++){const an=o+i/8*6.283;proj(bcx(B),bcy(B),Math.cos(an)*200,Math.sin(an)*200,dm_(B)*.4,GOLD,B.def.pd*.4,4)}for(const s of[-1,1])proj(bcx(B),B.ar.fy*T-8,s*240,0,dm_(B)*.5,GOLD,B.def.pd*.5,6)}}},
 chorus:{wu:.9,act:2.6,rec:1.2,f(B){B.ca=Math.random()*6.283;B.cs=0},tk(B,dt){B.cs-=dt;if(B.cs<=0){B.cs=B.fury?.1:.13;B.ca+=.43;const arms=B.fury?4:3,sp=(B.def.ps||200)*.8*(1+.25*Math.sin(B.ca*.5));
   for(let i=0;i<arms;i++){const a=B.ca+i*6.283/arms;proj(bcx(B),bcy(B),Math.cos(a)*sp,Math.sin(a)*sp,dm_(B)*.42,'rgb(70,120,235)',B.def.pd*.4,4)}}}}});
// deity attack sounds (the generic hook in extras.js plays BSND[atk] at the start of each attack)
{const v8=(f)=>(B,v)=>f(v);Object.assign(BSND,{
 judgment:v8(v=>{[1568,1976,2349].forEach((f,i)=>tone(f,f*.4,.5,'sine',.07*v,i*.1));noise(.6,.18*v,6000,500,'highpass')}),
 halo:v8(v=>{tone(600,1800,.5,'sine',.1*v);tone(900,2700,.5,'triangle',.06*v,.05)}),
 seraph:v8(v=>{for(let i=0;i<5;i++)tone(2200-i*150,500,.15,'triangle',.06*v,i*.17)}),
 smite:v8(v=>{tone(220,40,.5,'sine',.3*v);noise(.4,.25*v,3000,150,'bandpass');tone(1568,1568,.4,'sine',.08*v)}),
 blink:v8(v=>{tone(2600,300,.4,'sine',.1*v);noise(.4,.15*v,8000,800,'highpass')}),
 heavenfall:v8(v=>{noise(1.4,.25*v,2000,80,'lowpass');tone(1200,100,1.2,'sine',.1*v)}),
 cataclysm:v8(v=>{noise(1.8,.3*v,3000,60,'lowpass');[262,330,392,523].forEach((f,i)=>tone(f,f*.5,1.6,'sawtooth',.06*v,i*.1));tone(1976,300,1.2,'sine',.1*v)}),
 sunder:v8(v=>{for(let i=0;i<3;i++){tone(180,40,.3,'sine',.25*v,i*.38);noise(.25,.2*v,2500,150,'bandpass',1,i*.38)}}),
 chorus:v8(v=>{[392,494,588,784].forEach((f,i)=>tone(f,f*1.01,1.4,'sine',.07*v,i*.08))})});
 const _ch=BSND.charge;BSND.charge=function(B,v){if(B.id==='deity'){tone(330,990,.7,'sine',.09*v);tone(495,1485,.7,'triangle',.05*v);noise(.6,.06*v,3000,6000,'bandpass',2)}else _ch(B,v)}}

// ---- paper-collage art (monochrome newsprint, clock-crowned, winged) ----
const NEWS=(x,y,w,h,col)=>{for(let j=0;j<h;j+=2.4){let xx=x,k=0;while(xx<x+w-1){const l=1.5+(((j*7+k*3)|0)%5);FR(xx,y+j,Math.min(l,x+w-xx),.7,col);xx+=l+1.2+(((k+j)|0)%3);k++}}};
const paper=(pts,fill,edge)=>{cx.save();cx.shadowColor='rgba(0,0,0,.55)';cx.shadowBlur=3;cx.shadowOffsetY=1;PL(pts,fill);cx.restore();cx.strokeStyle=edge||'#1a1a1e';cx.lineWidth=.5;cx.beginPath();cx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)cx.lineTo(pts[i],pts[i+1]);cx.closePath();cx.stroke()};
// ---------- 12. Nameless Deity arena: celestial cathedral ----------
let DPH=0;
const SKY0=[[104,132,200],[176,128,140],[88,34,66]],SKY1=[[212,214,234],[255,214,160],[255,150,118]],SKY2=[[255,230,178],[255,198,108],[255,116,66]],GOLDC=[[255,214,120],[255,188,86],[255,112,84]];
const lerpV=(A,p)=>{const i=Math.max(0,Math.min(A.length-1,Math.floor(p))),j=Math.min(A.length-1,i+1),k=Math.max(0,Math.min(1,p-i));return A[i].map((v,n)=>v+(A[j][n]-v)*k)};
const rgbS=(c,al)=>al==null?'rgb('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+')':'rgba('+(c[0]|0)+','+(c[1]|0)+','+(c[2]|0)+','+al+')';
const cloudP=(x,y,s)=>{for(const[ox,oy,r]of[[-1.2,.1,.7],[-.5,-.35,.85],[.3,-.45,1],[1,-.1,.8],[1.6,.15,.6],[0,.2,1]]){cx.moveTo(x+ox*s+r*s,y+oy*s);cx.arc(x+ox*s,y+oy*s,r*s,0,6.2832)}};
ARB.deity=function(a,X0,Y0,W2,H2,FY,L){const t=time,mx=X0+W2/2,cy=Y0+H2*.44,BB=enemies.find(q=>q.id==='deity'),tg=BB?(BB.fury?2:BB.ph===2?1.5:BB.p2?1:0):0;
 DPH+=(tg-DPH)*.03;const p=DPH,dxp=(cam.x||0)+cv.width/2-a.cx*T,c0=lerpV(SKY0,p),c1=lerpV(SKY1,p),c2=lerpV(SKY2,p),gd=lerpV(GOLDC,p),gs=al=>rgbS(gd,al),TAU=6.2832;
 // --- sky ---
 let g=cx.createLinearGradient(0,Y0,0,FY);g.addColorStop(0,rgbS(c0));g.addColorStop(.55,rgbS(c1));g.addColorStop(1,rgbS(c2));cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);
 for(let i=0;i<54;i++){const x=X0+((i*173)%1000)/1000*W2,y=Y0+((i*89)%997)/997*H2*.55,al=.3+.35*Math.sin(t*1.8+i*1.3);cx.fillStyle='rgba(255,255,255,'+al+')';cx.fillRect(x,y,i%7?1:2,i%7?1:2);
  if(i%9===0){cx.fillStyle='rgba(255,255,255,'+al*.6+')';cx.fillRect(x-4,y+.5,9,1);cx.fillRect(x+.5,y-4,1,9)}}
 // --- sun, halo, god rays ---
 cx.save();cx.globalCompositeOperation='lighter';const RL=Math.max(W2,H2);
 glow(mx,cy,RL*.55,gs(.5));glow(mx,cy,H2*.4,'rgba(255,255,255,.5)');
 for(let i=0;i<24;i++){const an=i/24*TAU+t*.03,w=.04+.02*Math.sin(t*.7+i*1.7);cx.fillStyle=gs(.06+.04*Math.sin(t*.9+i));cx.beginPath();cx.moveTo(mx,cy);cx.lineTo(mx+Math.cos(an-w)*RL,cy+Math.sin(an-w)*RL);cx.lineTo(mx+Math.cos(an+w)*RL,cy+Math.sin(an+w)*RL);cx.fill()}
 cx.restore();
 // --- distant floating ruins ---
 for(let i=0;i<5;i++){const iw=44+(i%3)*16,ix=X0+W2*((i*.23+.08)%1)+dxp*.12,iy=Y0+H2*(.14+.09*(i%3))+Math.sin(t*.4+i*2)*4,rc='rgba(120,134,182,.55)';
  glow(ix,iy+iw*.4,iw*1.4,'rgba(255,255,255,.12)');PL([ix-iw,iy,ix+iw,iy,ix+iw*.7,iy+iw*.3,ix+iw*.3,iy+iw*.55,ix+iw*.05,iy+iw*.95,ix-iw*.25,iy+iw*.6,ix-iw*.65,iy+iw*.35],rc);
  FR(ix-iw,iy-1,iw*2,2,'rgba(210,222,250,.7)');for(let k=0;k<4;k++)FR(ix-iw*.55+k*iw*.36,iy-15,3,15,'rgba(196,208,240,.7)');PL([ix-iw*.65,iy-15,ix,iy-27,ix+iw*.65,iy-15],'rgba(196,208,240,.7)')}
 // --- far clouds ---
 cx.fillStyle='rgba(255,255,255,.32)';cx.beginPath();for(let i=0;i<7;i++){const sp=W2+260,x=X0-130+(((i*W2/6+t*(3+i%3*2)+dxp*.2)%sp)+sp)%sp;cloudP(x,Y0+H2*(.5+.07*(i%3)),24+i%3*9)}cx.fill();
 // --- colonnade helper (wraps with parallax) ---
 const colon=(f,sp,pw,topY,col,arch,det)=>{const off=(((dxp*f)%sp)+sp)%sp,n=Math.ceil((W2+400)/sp)+2;
  for(let k=-1;k<n;k++){const x=X0-200+k*sp+off;if(x>X0+W2+sp)break;if(x+sp<X0-60)continue;
   if(arch){cx.strokeStyle=col[1];cx.lineWidth=det?8:4;cx.beginPath();cx.arc(x+sp/2,topY,sp/2-pw*.5,Math.PI,0);cx.stroke();if(det){cx.strokeStyle=gs(.85);cx.lineWidth=1.5;cx.beginPath();cx.arc(x+sp/2,topY,sp/2-pw*.5-3,Math.PI,0);cx.stroke()}}
   if(x<X0-60||x>X0+W2+60)continue;
   const gr=cx.createLinearGradient(x-pw/2,0,x+pw/2,0);gr.addColorStop(0,col[0]);gr.addColorStop(.3,col[1]);gr.addColorStop(.75,col[2]);gr.addColorStop(1,col[0]);cx.fillStyle=gr;cx.fillRect(x-pw/2,topY,pw,FY-topY);
   if(det){cx.strokeStyle='rgba(110,100,130,.28)';cx.lineWidth=1;for(let q=-1;q<=1;q++){cx.beginPath();cx.moveTo(x+q*pw*.22,topY+10);cx.lineTo(x+q*pw*.22,FY-12);cx.stroke()}
    PL([x-pw*.95,topY-9,x+pw*.95,topY-9,x+pw*.7,topY+4,x-pw*.7,topY+4],col[1]);FR(x-pw,topY-14,pw*2,6,col[2]);FR(x-pw,topY-14,pw*2,1.5,gs(.95));
    FR(x-pw*.8,FY-12,pw*1.6,12,col[1]);FR(x-pw*.9,FY-5,pw*1.8,5,col[2]);FR(x-pw/2,topY+(FY-topY)*.3,pw,3,gs(.85));FR(x-pw/2,topY+(FY-topY)*.3+3,pw,1,'rgba(120,80,20,.35)')}}};
 colon(.28,150,12,Y0+H2*.3,['rgba(150,168,214,.5)','rgba(198,210,242,.55)','rgba(166,182,226,.5)'],false,false);
 // --- the great rose window / astrolabe ---
 cx.save();cx.translate(mx,cy);
 g=cx.createRadialGradient(0,0,0,0,0,152);g.addColorStop(0,'rgba(255,252,240,.9)');g.addColorStop(.6,gs(.3));g.addColorStop(1,gs(.12));cx.fillStyle=g;cx.beginPath();cx.arc(0,0,152,0,TAU);cx.fill();
 for(let i=0;i<16;i++){cx.save();cx.rotate(i*TAU/16+t*.02);cx.fillStyle=['rgba(120,160,255,.42)',gs(.5),'rgba(255,150,190,.38)',gs(.5)][i%4];cx.strokeStyle=gs(.8);cx.lineWidth=1;cx.beginPath();cx.moveTo(0,-34);cx.quadraticCurveTo(15,-70,0,-106);cx.quadraticCurveTo(-15,-70,0,-34);cx.fill();cx.stroke();cx.restore()}
 cx.strokeStyle=gs(.9);for(const[r,w]of[[34,2],[108,2.5],[152,3.5],[160,1]]){cx.lineWidth=w;cx.beginPath();cx.arc(0,0,r,0,TAU);cx.stroke()}
 for(let i=0;i<60;i++){const an=i*TAU/60-t*.012,r0=i%5?142:134;cx.strokeStyle=gs(i%5?.5:.95);cx.lineWidth=i%5?1:2;cx.beginPath();cx.moveTo(Math.cos(an)*r0,Math.sin(an)*r0);cx.lineTo(Math.cos(an)*150,Math.sin(an)*150);cx.stroke()}
 cx.font='bold 13px Georgia';cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle='rgba(90,60,20,.9)';const RN=['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
 for(let i=0;i<12;i++){const an=i*TAU/12-1.5708;cx.save();cx.translate(Math.cos(an)*122,Math.sin(an)*122);cx.rotate(an+1.5708);cx.fillText(RN[i],0,0);cx.restore()}cx.textBaseline='alphabetic';cx.textAlign='left';
 for(let k=0;k<3;k++){cx.save();cx.rotate(t*.12*(k%2?-1:1)+k*1.05);cx.strokeStyle=gs(.6);cx.lineWidth=2;cx.beginPath();cx.ellipse(0,0,176,58,0,0,TAU);cx.stroke();const u=t*(.5+k*.2)+k*2,bx=Math.cos(u)*176,by=Math.sin(u)*58;cx.fillStyle=gs(1);cx.beginPath();cx.arc(bx,by,4.5,0,TAU);cx.fill();cx.fillStyle='#fff';cx.beginPath();cx.arc(bx,by,2,0,TAU);cx.fill();cx.restore()}
 cx.lineCap='round';let an=t*.2-1.5708;cx.strokeStyle='rgba(90,60,20,.75)';cx.lineWidth=3;cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(an)*120,Math.sin(an)*120);cx.stroke();an=t*.017-1.2;cx.lineWidth=5;cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(an)*78,Math.sin(an)*78);cx.stroke();
 cx.fillStyle=gs(1);cx.beginPath();cx.arc(0,0,7,0,TAU);cx.fill();cx.fillStyle='#fff';cx.beginPath();cx.arc(0,0,3,0,TAU);cx.fill();cx.restore();
 // --- mid clouds + grand arches ---
 cx.fillStyle='rgba(255,255,255,.4)';cx.beginPath();for(let i=0;i<6;i++){const sp=W2+300,x=X0-150+(((i*W2/5-t*(5+i%3*3)+dxp*.4)%sp)+sp)%sp;cloudP(x,FY-H2*.16-(i%2)*18,30+i%3*10)}cx.fill();
 colon(.58,230,17,Y0+H2*.14,['#aaa3bd','#f4efe4','#d3cbd9'],true,true);
 // --- hanging banners ---
 for(let i=0;i<7;i++){const x=X0+W2*(i+.5)/7,len=70+(i%3)*22,sw=Math.sin(t*1.2+i*1.1)*4;if(Math.abs(x-mx)<70)continue;
  FR(x-13,Y0,26,3,gs(.9));PL([x-10,Y0+3,x+10,Y0+3,x+10+sw,Y0+len,x+sw,Y0+len-13,x-10+sw,Y0+len],'rgba(250,244,230,.95)');cx.strokeStyle=gs(.9);cx.lineWidth=1.5;cx.beginPath();cx.moveTo(x-10,Y0+3);cx.lineTo(x-10+sw,Y0+len);cx.moveTo(x+10,Y0+3);cx.lineTo(x+10+sw,Y0+len);cx.stroke();
  PL([x+sw*.4,Y0+len*.35,x+5+sw*.4,Y0+len*.35+8,x+sw*.4,Y0+len*.35+16,x-5+sw*.4,Y0+len*.35+8],gs(.95))}
 // --- platform light pools ---
 cx.save();cx.globalCompositeOperation='lighter';for(const[px,py,ln]of a.pl){const sx=X0+(px+a.hw+ln/2)*T,sy=FY-py*T+T;glow(sx,sy+6,ln*T*.55+24,gs(.22+.06*Math.sin(t*2+px)));L.push([sx,sy,70])}cx.restore();
 // --- front fog + golden floor ---
 cx.fillStyle='rgba(255,246,226,.5)';cx.beginPath();for(let i=0;i<7;i++){const sp=W2+300,x=X0-150+(((i*W2/6+t*(9+i%3*4)+dxp*.7)%sp)+sp)%sp;cloudP(x,FY+4,36+i%3*14)}cx.fill();
 g=cx.createLinearGradient(0,FY-80,0,FY);g.addColorStop(0,gs(0));g.addColorStop(1,gs(.5));cx.fillStyle=g;cx.fillRect(X0,FY-80,W2,80);
 cx.save();cx.globalCompositeOperation='lighter';for(let i=0;i<18;i++){const x=X0+W2*((i*.0577+t*.01)%1),w=30+(i%4)*14;cx.fillStyle=gs(.1+.06*Math.sin(t*2+i));cx.fillRect(x,FY-3-(i%3)*3,w,1.5)}cx.restore();
 // --- phase III cracks of dawn ---
 if(p>1.2){const k=Math.min(1,(p-1.2)*1.2);cx.strokeStyle='rgba(255,90,70,'+.5*k+')';cx.lineWidth=2;for(let i=0;i<12;i++){let an=i*TAU/12+.3,x=mx,y=cy;cx.beginPath();cx.moveTo(x,y);for(let j=0;j<7;j++){an+=Math.sin(i*5+j*2.3)*.35;x+=Math.cos(an)*(26+j*4);y+=Math.sin(an)*(26+j*4);cx.lineTo(x,y)}cx.stroke()}}
 // --- feathers, motes, sparkles ---
 for(let i=0;i<18;i++){const lf=(t*.04*(1+i%3*.4)+i*.137)%1,x=X0+((i*97+Math.sin(t*.5+i)*34)%W2+W2)%W2,y=FY-lf*H2;cx.save();cx.translate(x,y);cx.rotate(t*(.5+i%3*.3)+i);cx.globalAlpha=Math.sin(lf*Math.PI)*.95;PL([-9,0,0,-2.6,9,0,0,2.6],'#fffdf6');cx.strokeStyle='rgba(180,170,190,.8)';cx.lineWidth=.6;cx.beginPath();cx.moveTo(-9,0);cx.lineTo(9,0);cx.stroke();cx.restore()}
 cx.save();cx.globalCompositeOperation='lighter';for(let i=0;i<56;i++){const x=X0+((i*131)%1000)/1000*W2+Math.sin(t*.6+i)*14,y=FY-((t*(12+i%5*5)+i*53)%H2),al=.35+.4*Math.sin(t*3+i*2);cx.fillStyle=gs(al);cx.fillRect(x,y,1+i%2,1+i%2)}
 for(let i=0;i<10;i++){const x=X0+((i*271+40)%1000)/1000*W2,y=Y0+H2*(.12+((i*37)%60)/100),s=3+4*Math.max(0,Math.sin(t*1.6+i*1.9));cx.fillStyle='rgba(255,255,255,.85)';cx.fillRect(x-s,y,s*2+1,1);cx.fillRect(x,y-s,1,s*2+1)}cx.restore();
 // --- vignette + phase tint ---
 g=cx.createRadialGradient(mx,cy,H2*.35,mx,cy,W2*.55);g.addColorStop(0,'rgba(30,10,50,0)');g.addColorStop(1,'rgba(30,10,50,'+(.34+.14*p)+')');cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);
 L.push([mx,cy,320]);for(let i=0;i<=6;i++)L.push([X0+W2*i/6,Y0+H2*.5,110]);
 const B=enemies.find(q=>q.id==='deity');if(B&&B.st==='intro'){const e=12-B.t,dk=.62*clamp01(e/2)*(1-clamp01((e-10)/2)),rx=X0+(B.x+B.w/2-(a.cx-a.hw)*T),ry=Y0+(B.y+24-(a.fy-a.ht)*T);
  cx.fillStyle='rgba(8,10,28,'+dk+')';cx.fillRect(X0,Y0,W2,H2);
  for(let i=0;i<46;i++){const an=i*2.399,d=(1-((t*.7+i*.071)%1))*(120+(i%5)*40),x=rx+Math.cos(an)*d,y=ry+Math.sin(an)*d*.75;cx.strokeStyle=i%2?'rgba(255,255,255,'+dk+')':'rgba(70,110,230,'+dk+')';cx.lineWidth=1;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-Math.cos(an)*8,y-Math.sin(an)*6);cx.stroke()}}};
const clamp01=v=>Math.max(0,Math.min(1,v));
function drawRift(e,off,t){const g=e<9.5?clamp01(e/3.5):clamp01(1-(e-9.5)/2.3);if(g<=0)return;const w=3+g*34,h=16+g*118;
 cx.save();cx.translate(0,24-off);glow(0,0,h*.9,'rgba(80,130,255,'+(.3*g)+')');
 cx.beginPath();cx.moveTo(0,-h*.5);for(let i=1;i<=10;i++)cx.lineTo(w*.5*Math.sin(i/10*Math.PI)*(1+.25*Math.sin(t*9+i*2)),-h*.5+i*h/10);for(let i=10;i>=0;i--)cx.lineTo(-w*.5*Math.sin(i/10*Math.PI)*(1+.25*Math.sin(t*8+i*3)),-h*.5+i*h/10);cx.closePath();
 const gr=cx.createRadialGradient(0,0,2,0,0,h*.5);gr.addColorStop(0,'#000');gr.addColorStop(.6,'#0a1230');gr.addColorStop(1,'#1a3a8a');cx.fillStyle=gr;cx.fill();cx.strokeStyle='#cfe0ff';cx.lineWidth=1.2;cx.stroke();
 cx.strokeStyle='rgba(220,235,255,.9)';cx.lineWidth=.8;for(let k=0;k<7;k++){const sd=k%2?1:-1;cx.beginPath();let x=sd*w*.35,y=(k-3)*h*.14;cx.moveTo(x,y);for(let j=0;j<4;j++){x+=sd*(5+Math.random()*7);y+=(Math.random()-.5)*10;cx.lineTo(x,y)}cx.stroke()}
 for(let i=0;i<14;i++){const an=t*(1+i%3*.4)+i*.9,r=(i%5+1)*w*.07;FR(Math.cos(an)*r-.5,Math.sin(an)*h*.4*((i%4+1)/4)-.5,1.2,1.2,'#fff')}cx.restore()}
function roarFx(B,t){const A=cx.globalAlpha;cx.globalAlpha=1;const rm=B.rmax||1.4,k=1-B.roar/rm;cx.save();cx.translate(0,-8);
 for(let q=0;q<3;q++){const r=(k*rm-q*.16)*220;if(r<=0)continue;cx.strokeStyle=(q?'rgba(20,30,60,':'rgba(255,255,255,')+(1-k)*.9+')';cx.lineWidth=5-q*1.4;cx.beginPath();cx.arc(0,0,r,0,7);cx.stroke()}
 for(let i=0;i<20;i++){const an=i*.31416,r0=20+k*40,r1=r0+40+((i*13)%5)*18*(1-k*.5);PL([Math.cos(an-.05)*r0,Math.sin(an-.05)*r0,Math.cos(an)*r1,Math.sin(an)*r1,Math.cos(an+.05)*r0,Math.sin(an+.05)*r0],'rgba(10,10,20,'+((1-k)*.85)+')')}
 cx.restore();cx.globalAlpha=A}
function deityRoar(){tone(70,32,2.4,'sawtooth',.32);tone(140,55,2,'square',.16);tone(35,25,2.6,'sine',.35);noise(2.2,.38,3500,90,'lowpass');noise(.6,.3,9000,1500,'highpass',1,.05);[196,247,294,392].forEach((f,i)=>tone(f,f*.5,2,'sawtooth',.06,i*.05));tone(1318,1318,1.6,'sine',.07,.15);tone(1976,1976,1.4,'sine',.05,.2)}
function deityIntro(B,ps,dt){const a=B.ar;
 if(ps==='dormant'&&B.st==='intro'){B.t=12;B.s1=B.s2=0;toast('\u2026the air begins to tear')}
 if(B.st==='intro'){const e=12-B.t;B.vis=clamp01((e-4)/4.5);B.y=a.fy*T-140;camFocus={x:bcx(B),y:B.y+24};B.x=a.cx*T-B.w/2;P.stun=Math.max(P.stun,.15);P.inv=Math.max(P.inv,.15);
  shake=Math.max(shake,e<4?1+e*.6:e<9?4:e<11?3:3+(e-11)*10);
  if(!B.s1&&e>=4){B.s1=1;noise(.9,.3,7000,400,'highpass');tone(2400,180,.9,'sawtooth',.12);tone(60,30,1.6,'sine',.3);toast('A rift tears open\u2026')}
  if(!B.s2&&e>=8){B.s2=1;[130,196,262,392].forEach((f,i)=>tone(f,f*1.5,2.6,'triangle',.08,i*.15));noise(2,.15,500,2500,'bandpass',2);toast('Something steps through\u2026')}
  if(e>1&&e<11)for(let i=0;i<2;i++){const an=Math.random()*6.283,d=120+Math.random()*120;parts.push({x:bcx(B)+Math.cos(an)*d,y:B.y+24+Math.sin(an)*d*.7,vx:-Math.cos(an)*d*1.1,vy:-Math.sin(an)*d*.77,l:.9,c:Math.random()<.5?'#9ab8ff':'#fff'})}}
 else if(ps==='intro'&&B.st==='idle'){B.roar=1.4;B.t=1.4;B.vis=1;shake=22;deityRoar();P.vx=(P.x<bcx(B)?-1:1)*340;P.vy=-150;P.stun=.4;P.inv=.5;burst(bcx(B),bcy(B),50,'#fff');burst(bcx(B),bcy(B),40,'#9ab8ff');announce('THE NAMELESS DEITY','Worthy? Prove it.','')}
 if(B.roar>0)B.roar-=dt}
BS.deity=function(B,p,ac,st){const t=time,en=B.ph===2,hot=st==='tele'||st==='act',fl=Math.sin(t*2)*(en?5:3),cyc=-8;
 if(st==='intro'){const A0=cx.globalAlpha;cx.globalAlpha=1;drawRift(12-B.t,(1-B.vis)*34,t);cx.globalAlpha=A0}
 cx.save();cx.globalAlpha=.55;PL([0,-70,3,24,0,118,-3,24],'#c9ccd6');PL([-84,24,0,21,84,24,0,27],'#c9ccd6');cx.restore();
 glow(0,12,54+(hot?10:0),'rgba(90,150,255,'+(hot?.35:.18)+')');if(B.fury)glow(0,24,72,'rgba(200,30,30,.18)');
 for(const s of[-1,1])PL([s*10,14,s*72,-6+fl,s*78,24+fl,s*44,50,s*14,34],'rgba(150,152,160,.35)');
 for(const s of[-1,1]){paper([s*10,16,s*30,-6,s*64,-22+fl,s*70,8+fl,s*58,34,s*34,46,s*14,36],'#e6e3da');
  cx.save();cx.beginPath();cx.moveTo(s*14,18);cx.lineTo(s*32,-2);cx.lineTo(s*62,-17+fl);cx.lineTo(s*66,8+fl);cx.lineTo(s*54,30);cx.lineTo(s*34,40);cx.lineTo(s*16,32);cx.closePath();cx.clip();
  FR(-80,-30,160,100,'rgba(0,0,0,0)');PL([s*12,18,s*32,-2,s*64,-18+fl,s*66,8+fl,s*54,30,s*34,40,s*16,32],'#2a2a2f');
  for(let i=0;i<11;i++){const an=-1.15+i*.17,len=44+(i%3)*5;cx.strokeStyle=i%2?'#0b0b0d':'#8d8d94';cx.lineWidth=1.6-(i%2)*.7;cx.beginPath();cx.moveTo(s*14,24);cx.lineTo(s*(14+Math.cos(an)*len),24+Math.sin(an)*len+fl*(i/11));cx.stroke()}
  NEWS(s>0?28:-60,-6,32,40,'rgba(255,255,255,.18)');cx.restore();paper([s*8,12,s*22,2,s*30,16,s*16,26],'#d8d4c8')}
 for(const s of[-1,1]){const hy=46+Math.sin(t*2.4+s)*3-(hot?10:0),hx=s*60;paper([s*26,38,s*52,hy-4,s*54,hy+6,s*28,50],'#9a9aa0');NEWS(s>0?30:-52,hy-2,22,6,'rgba(0,0,0,.4)');
  for(let f=0;f<4;f++)paper([hx-4+f*2.7,hy-2,hx-2+f*2.7,hy-2,hx-3+f*2.7+(f-1.5)*s*1.2,hy-11-(f%2)*2],'#e6e3da');paper([hx-4,hy-2,hx+4,hy-2,hx+5,hy+8,hx-5,hy+8],'#d8d4c8');
  if(hot)glow(hx,hy-4,16,'rgba(90,150,255,.55)')}
 for(const s of[-1,1]){const sw=Math.sin(t*1.6+s)*1.5;paper([s*3,46,s*12,46,s*17+sw,90],'#e6e3da');cx.strokeStyle='#0b0b0d';cx.lineWidth=1.4;cx.beginPath();cx.moveTo(s*8,48);cx.lineTo(s*14+sw,84);cx.stroke();
  for(const q of[.3,.55,.8]){cx.beginPath();cx.arc(s*(8+q*6)+sw*q,48+q*36,1.6,0,7);cx.stroke()}NEWS(s>0?5:-12,50,6,26,'rgba(0,0,0,.25)')}
 paper([-15,18,-10,12,10,12,15,18,16,36,9,47,-9,47,-16,36],'#7e7e84');cx.strokeStyle='#17171a';cx.lineWidth=1.2;for(const s of[-1,1]){cx.beginPath();cx.ellipse(s*7,30,6,10,0,0,7);cx.stroke()}NEWS(-14,14,10,20,'rgba(255,255,255,.35)');
 for(let i=0;i<4;i++)for(let j=0;j<4;j++){const v=((i*5+j*3+(t*3|0))%4);FR(-4+i*2,36+j*2,2,2,v===0?'#fff':v===1?'#c8c8cc':v===2?'#9a9aa2':'#e4e4e8')}
 cx.save();cx.translate(0,16);cx.rotate(.02);paper([-8,-10,8,-10,8,16,-8,16],'#050507');cx.strokeStyle='rgba(235,240,255,.9)';cx.lineWidth=.8;cx.beginPath();cx.moveTo(0,-8);cx.lineTo(0,12);cx.moveTo(-5,-3);cx.lineTo(0,2);cx.lineTo(5,-3);cx.moveTo(-6,5);cx.lineTo(0,-1);cx.lineTo(6,5);cx.moveTo(-3,10);cx.lineTo(0,6);cx.lineTo(3,10);cx.stroke();cx.restore();FR(-6,5,12,2.4,'rgba(185,196,182,.9)');
 paper([-9,cyc-6,-6,cyc-11,6,cyc-11,9,cyc-6,9,cyc+6,6,cyc+11,-6,cyc+11,-9,cyc+6],'#d8d4c8');cx.fillStyle='#123a78';cx.beginPath();cx.arc(0,cyc,7.5,0,7);cx.fill();glow(0,cyc,12,'rgba(90,160,255,.55)');
 for(let k=0;k<12;k++){const an=k*.5236;FR(Math.cos(an)*6-.4,cyc+Math.sin(an)*6-.4,.9,.9,'#e8f0ff')}
 {const ma=t*(hot?10:1.4)-1.57,ha=t*.15-1.57;cx.strokeStyle='#fff';cx.lineWidth=.8;cx.beginPath();cx.moveTo(0,cyc);cx.lineTo(Math.cos(ma)*6,cyc+Math.sin(ma)*6);cx.moveTo(0,cyc);cx.lineTo(Math.cos(ha)*3.8,cyc+Math.sin(ha)*3.8);cx.stroke()}
 paper([-3,cyc-11,0,cyc-17,3,cyc-11],'#d8d4c8');
 const n=en?9:6;for(let k=0;k<n;k++){const an=t*(en?1.5:.9)+k*6.283/n,x=Math.cos(an)*(46+k%3*6),y=24+Math.sin(an)*22,sz=3+k%3;paper([x-sz,y-sz*.6,x+sz,y-sz,x+sz*.8,y+sz*.7,x-sz*.6,y+sz],k%2?'#e6e3da':'#8f8f96')}
 if(hot){const r=st==='tele'?3+p*12:14*(1-ac*.5);glow(0,cyc-20,r*2.4,'rgba(120,170,255,.8)');cx.fillStyle='#fff';cx.beginPath();cx.arc(0,cyc-20,r*.4,0,7);cx.fill()}
 if(B.roar>0)roarFx(B,t)};

// ----- Hollow King: cinematic intro, faster cycle, new attacks -----
function hollowIntro(B,ps,dt){
 if(ps==='dormant'&&B.st==='intro'){B.t=7;B.h1=B.h2=B.h3=0;B.rmax=1.2;toast('The air grows cold\u2026')}
 if(B.st==='intro'){const e=7-B.t;B.vis=clamp01((e-1.5)/3.2);camFocus={x:bcx(B),y:B.y+B.h/2};P.stun=Math.max(P.stun,.15);P.inv=Math.max(P.inv,.15);shake=Math.max(shake,e<5?1.5+e*.5:e<6.4?4:4+(e-6.4)*12);
  if(!B.h1&&e>=1.5){B.h1=1;noise(2.4,.2,300,3000,'bandpass',3);[147,175,208].forEach((f,i)=>tone(f,f*1.4,2.4,'triangle',.07,i*.2));toast('Fragments gather\u2026')}
  if(!B.h2&&e>=4.6){B.h2=1;tone(520,520,1.6,'sine',.12);tone(780,780,1.4,'sine',.06,.05);tone(130,60,1.2,'sine',.25);noise(.5,.25,6000,900,'highpass');burst(bcx(B),B.y+4,24,'#ffd36b');toast('The crown settles\u2026')}
  if(!B.h3&&e>=6.5){B.h3=1;tone(98,88,3.2,'sine',.3);tone(196,176,2.6,'sine',.15);tone(60,30,1.6,'sawtooth',.25);noise(1.4,.28,2500,80,'lowpass');shake=Math.max(shake,16)}
  if(e>.5&&e<6.3)for(let i=0;i<2;i++){const an=Math.random()*6.283,d=80+Math.random()*100;parts.push({x:bcx(B)+Math.cos(an)*d,y:B.y+B.h-Math.random()*16,vx:-Math.cos(an)*d*1.2,vy:-60,l:.8,c:Math.random()<.5?'#b890ff':'#8ff'})}}
 else if(ps==='intro'&&B.st==='idle'){B.roar=1.2;B.t=1.2;B.vis=1;shake=18;P.vx=(P.x<bcx(B)?-1:1)*300;P.vy=-120;P.stun=.35;P.inv=.5;burst(bcx(B),bcy(B),40,'#c8f');burst(bcx(B),bcy(B),20,'#8ff');announce('THE HOLLOW KING','Kneel.','')}
 if(B.roar>0)B.roar-=dt}
// ---------- 16. The Hollow King, redesigned: spiked crown, skull armor, tattered cape, runeblade ----------
BS.hollow=function(B,p,ac,st){const en=B.ph===2,fu=B.fury,t=time,pu=.5+.5*Math.sin(t*5),bob=Math.sin(t*2)*1.2,n=en?6:3,hot=st==='tele'||st==='act',
 DK='#120c1e',D2='#1a1428',MD='#2a2040',PL1='#3a3050',HI='#6a5a8a',BN='#d8d0e8',BN2='#9a90b0',GD='#d9a441',GD2='#8a6a22',cw=Math.sin(t*3)*3,cw2=Math.sin(t*2.3+1)*4;
 orb(0,22,72,'rgba(150,90,255,'+(.22+.14*pu+(en?.1:0))+')');
 cx.save();cx.translate(0,bob);
 // tattered cape streaming behind
 PL([4,7,-4,5,-16,10,-25+cw,26,-34+cw2,44,-28+cw,42,-26+cw2,50,-20+cw,43,-15+cw2,51,-9+cw,43,-3,48,5,42,10,26,8,10],DK);
 PL([2,9,-6,8,-15,13,-22+cw,27,-28+cw2,40,-20+cw,36,-12,40,-4,38,4,30,6,14],MD);
 cx.strokeStyle='rgba(170,120,255,.45)';cx.lineWidth=1;cx.beginPath();cx.moveTo(-6,8);cx.lineTo(-22+cw,27);cx.lineTo(-28+cw2,40);cx.stroke();
 // legs: fur-trimmed greaves, skull knee-guard
 PL([-9,30,-1,30,-2,44,-11,44],MD);PL([1,30,10,30,11,44,2,44],PL1);
 for(const[x0,s]of[[-11,-1],[2,1]]){const y0=33;PL([x0,y0,x0+9,y0,x0+9,y0+11,x0+6,y0+9,x0+4,y0+13,x0+2,y0+9,x0,y0+12],'#4a4064')}
 FR(-12,43,12,3,DK);FR(1,43,13,3,DK);FR(-12,43,12,1,HI);FR(1,43,13,1,HI);
 FR(3,36,6,5,BN2);FR(4,37,1,2,'#000');FR(7,37,1,2,'#000');FR(5,40,3,1,'#000');
 // back arm + fist at the hip
 PL([-8,11,-13,19,-11,28,-6,25],MD);PL([-8,10,-12,13,-9,18],PL1);FR(-13,26,6,5,HI);FR(-13,26,6,1,BN2);
 // torso: plate, ribs, belt with skull buckle
 PL([-8,9,9,9,11,21,7,32,-7,32,-10,21],PL1);PL([-5,10,6,10,7,20,4,30,-4,30,-7,20],MD);
 cx.strokeStyle=HI;cx.lineWidth=1;cx.beginPath();cx.moveTo(-8,9);cx.lineTo(-10,21);cx.lineTo(-7,32);cx.moveTo(9,9);cx.lineTo(11,21);cx.lineTo(7,32);cx.stroke();
 for(let k=0;k<3;k++)FR(-4,13+k*4,8,1,'rgba(170,120,255,.5)');
 orb(0,18,12,'rgba(170,120,255,'+(.2+.12*pu)+')');
 FR(-9,28,18,4,DK);FR(-9,28,18,1,HI);FR(-3,26,6,7,BN);FR(-2,28,1,2,'#000');FR(1,28,1,2,'#000');FR(-1,31,2,1,'#000');
 // hair of pale soul-silk
 for(let k=0;k<6;k++){const w=Math.sin(t*3+k*.8)*3;PL([-3,-2+k*1.6,-10-k*2.2+w,4+k*3.6,-3,2+k*1.6],'rgba(190,176,225,'+(.85-k*.08)+')')}
 // helm and hollow skull face
 PL([-6,11,-7,-1,-3,-6,3,-6,7,-1,6,11,3,14,-3,14],DK);PL([-4,2,4,2,5,8,3,13,-3,13,-5,8],BN);FR(-4,11,8,2,BN2);
 FR(-4,4,3,3,'#000');FR(1,4,3,3,'#000');FR(0,8,1,2,'#000');for(let k=0;k<4;k++)FR(-3+k*2,12,1,2,'#000');
 const ey=hot?1:.8+.2*Math.sin(t*6);orb(-2.5,5.5,7+(hot?3:0)+(fu?2:0),'rgba(160,255,240,'+ey*.8+')');orb(2.5,5.5,7+(hot?3:0)+(fu?2:0),'rgba(160,255,240,'+ey*.8+')');FR(-3,5,2,1,'#cfe');FR(2,5,2,1,'#cfe');
 // the crown of spikes
 FR(-7,-5,14,3,GD);FR(-7,-3,14,1,GD2);
 PL([-1.8,-5,0,-26,1.8,-5],GD);PL([-5.5,-5,-8,-19,-3,-5],GD);PL([3,-5,8,-19,5.5,-5],GD);PL([-7,-3,-15,-14,-5,-5],GD2);PL([7,-3,14,-14,5,-5],GD2);
 if(en){PL([-9,-4,-18,-6,-8,-6],GD2);PL([9,-4,18,-6,8,-6],GD2)}
 FR(-1,-4,2,2,'#c8a8ff');orb(0,-12,14,'rgba(255,200,80,'+(en?.3:.2)+')');
 // far pauldron then near pauldron: spiked, skull-studded
 PL([-8,6,-13,2,-17,9,-15,15,-9,15],PL1);PL([-12,3,-15,-5,-9,4],HI);
 PL([2,5,9,0,17,4,19,13,16,18,7,18,2,13],PL1);PL([3,6,9,2,16,5,17,11,8,13],MD);
 PL([9,1,11,-9,13,1],HI);PL([14,3,20,-5,18,8],HI);PL([17,10,24,5,19,14],HI);
 FR(6,9,7,6,BN);FR(7,10,2,2,'#000');FR(10,10,2,2,'#000');FR(8,13,3,1,'#000');cx.strokeStyle=GD;cx.lineWidth=1;cx.beginPath();cx.moveTo(2,13);cx.lineTo(7,18);cx.lineTo(16,18);cx.stroke();
 // sword arm
 PL([7,14,12,16,13,23,8,25,5,20],PL1);FR(8,22,6,5,HI);FR(8,22,6,1,BN2);
 // the runeblade
 const ang=st==='tele'?-.5-p*1.6:st==='act'?-2.1+ac*3:st==='rec'?.8:-.4;cx.save();cx.translate(10,24);cx.rotate(ang);
 FR(-9,-2,11,4,'#2a2438');FR(-9,-2,11,1,HI);cx.fillStyle=GD2;cx.beginPath();cx.arc(-10,0,3.2,0,7);cx.fill();FR(-11,-1,2,2,GD);
 PL([2,-10,9,-5,10,0,9,5,2,10,5,0],'#4a3a78');PL([3,-8,8,-4,6,0],HI);
 PL([9,-4,22,-5,26,-9,33,-5,39,-10,47,-4,58,-1,63,0,58,2,47,5,39,9,33,5,26,8,22,5,9,4],'#4a3a78');
 PL([10,-2,56,0,10,2],'#7a6aa8');FR(11,-.5,46,1,'#e8d8ff');
 for(let k=0;k<5;k++){const a=.5+.5*Math.sin(t*4+k*1.3);FR(15+k*8,-3,2,2,'rgba(220,200,255,'+(.35+.6*a)+')');FR(15+k*8,1,2,2,'rgba(220,200,255,'+(.35+.6*(1-a))+')')}
 orb(36,0,26,'rgba(170,110,255,'+(hot?.4:.2)+')');orb(63,0,22,'rgba(190,130,255,'+(st==='act'?.9:.5)+')');
 for(let k=0;k<5;k++){const x=12+k*11,y=Math.sin(t*6+k*1.7)*4-(2+k%2)*2;orb(x,y,5,'rgba(190,150,255,.4)')}
 cx.restore();
 // orbiting soul shards
 for(let k=0;k<n;k++){const a=t*2+k*6.283/n,x=Math.cos(a)*28,y=24+Math.sin(a)*12;PL([x,y-4,x+2.5,y,x,y+4,x-2.5,y],'#b890ff');orb(x,y,8,'rgba(180,130,255,.6)')}
 if(en)for(let k=0;k<4;k++){const f=(t*.9+k*.25)%1,x=(k%2?10:-12)+Math.sin(t*3+k)*3,y=10-f*22;orb(x,y,7*(1-f)+2,'rgba(190,140,255,'+(.6*(1-f))+')')}
 cx.restore()};
{const _bsh=BS.hollow;BS.hollow=function(B,p,ac,st){const A0=cx.globalAlpha,t=time;
 if(st==='intro'){const e=7-B.t,off=(1-B.vis)*34,gy=B.h-off,fade=e<6.4?1:Math.max(0,1-(e-6.4)*2);cx.globalAlpha=1;cx.save();cx.translate(0,gy);
  for(let i=0;i<9;i++){const g=clamp01(e/2.5),r=(26-i*2)*g+4,y=-i*6*g;cx.strokeStyle='rgba('+(i%2?'160,110,255':'120,230,230')+','+(.5*(1-i/10)*fade)+')';cx.lineWidth=1.5;cx.setLineDash([5,4]);cx.lineDashOffset=-t*(30+i*6)*(i%2?-1:1);cx.beginPath();cx.ellipse(0,y,r,r*.28,0,0,7);cx.stroke()}cx.setLineDash([]);
  glow(0,-8,40*clamp01(e/2),'rgba(150,90,255,.5)');
  for(let i=0;i<16;i++){const k=clamp01(1-((e-.3-i*.07)/3.5)),an=i*.39+t*.5,d=70*k,x=Math.cos(an)*d,y=-10-Math.sin(an*1.3)*30*k;if(e>.3&&k>0)PL([x-2,y-3,x+2,y,x-1,y+3],'#c8a8ff')}
  if(e>=4.6&&e<6.4){const u=1-(e-4.6)/1.8;glow(0,-B.h+4,36*u+8,'rgba(255,200,80,'+(.6*u)+')')}
  cx.restore();cx.globalAlpha=A0}
 _bsh(B,p,ac,st);if(B.roar>0)roarFx(B,t)}}
{const _arh=ARB.hollow;ARB.hollow=function(a,X0,Y0,W2,H2,FY,L){_arh(a,X0,Y0,W2,H2,FY,L);const B=enemies.find(q=>q.id==='hollow');
 if(B&&B.st==='intro'){const e=7-B.t,dk=.6*clamp01(e/1.5)*(1-clamp01((e-6)/1)),rx=X0+(B.x+B.w/2-(a.cx-a.hw)*T),ry=Y0+(B.y+B.h-(a.fy-a.ht)*T);cx.fillStyle='rgba(6,0,18,'+dk+')';cx.fillRect(X0,Y0,W2,H2);
  for(let i=0;i<40;i++){const an=i*2.399,d=(1-((time*.6+i*.083)%1))*(140+(i%5)*40),x=rx+Math.cos(an)*d,y=ry-Math.abs(Math.sin(an))*d*.6;cx.fillStyle=i%2?'rgba(190,150,255,'+dk+')':'rgba(130,240,230,'+dk+')';cx.fillRect(x,y,1.6,1.6)}}}}
BD.hollow.a1.push('orbs','reaper');BD.hollow.a2.push('orbs','reaper','abyss','soullance');
const PUR='rgb(170,120,255)';
Object.assign(AT,{
 orbs:{wu:.7,act:1.6,rec:.9,f(B){B.on=0;B.oa=0},tk(B,dt){B.oa-=dt;if(B.oa<=0&&B.on<(B.fury?8:B.ph===2?6:4)){B.oa=.22;B.on++;const an=Math.atan2(P.y+11-bcy(B),P.x+6-bcx(B))+(Math.random()-.5)*.3,sp=B.def.ps*1.15;proj(bcx(B),bcy(B)-10,Math.cos(an)*sp,Math.sin(an)*sp,bdm(B)*.55,PUR,B.def.pd*.5,5)}}},
 reaper:{wu:.6,act:1.2,rec:.9,f(B){B.rc=0;B.rk=0;B.face=P.x>bcx(B)?1:-1},tk(B,dt){B.rk-=dt;if(B.rk<=0&&B.rc<3){B.rk=.33;B.rc++;B.face=P.x>bcx(B)?1:-1;shake=Math.max(shake,5);sfx.hit();bhit(B,B.def.reach*1.15,1.0);proj(bcx(B)+B.face*20,B.y+B.h-14,B.face*260,0,bdm(B)*.6,PUR,B.def.pd*.5,6)}}},
 abyss:{wu:.9,act:2.0,rec:1.2,f(B){for(let i=0;i<3;i++)bzone(B,P.x+6+(i-1)*95+(Math.random()-.5)*40,1+i*.35,64);B.qa=0;B.qn=0},tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<9){B.qa=.2;B.qn++;const a=B.ar;proj((a.cx+(Math.random()-.5)*a.hw*1.8)*T,(a.fy-a.ht+1)*T,0,220,bdm(B)*.5,PUR,B.def.pd*.5,5)}}},
 soullance:{wu:.7,act:1.5,rec:1.0,f(B){const dr=P.x>bcx(B)?1:-1;B.face=dr;for(let i=0;i<8;i++)bzone(B,bcx(B)+dr*(40+i*46),.5+i*.13,22,true)}}});
Object.assign(HINT,{orbs:'BLOCK / DODGE',reaper:'BACK OFF',abyss:'MOVE!',soullance:'RUN / JUMP'});
Object.assign(BSND,{orbs:(B,v)=>{for(let i=0;i<4;i++)tone(900-i*80,300,.2,'sine',.06*v,i*.22)},reaper:(B,v)=>{for(let i=0;i<3;i++){noise(.25,.2*v,4000,500,'bandpass',2,i*.33);tone(260,90,.2,'sawtooth',.08*v,i*.33)}},
 abyss:(B,v)=>{tone(90,35,1.2,'sine',.25*v);noise(1,.2*v,800,60,'lowpass')},soullance:(B,v)=>{for(let i=0;i<8;i++)tone(300+i*40,120,.15,'triangle',.05*v,.5+i*.13)}});

// ----- portal at spawn -----
const portalOn=()=>!!(P&&!inHeaven&&bossDead&&bossDead.hollow&&!bossDead.deity);
let PP=null;function portalPos(){const x=spawn.x+6-150;if(PP&&PP.sx===spawn.x&&PP.t===tiles)return PP;let ty=0;while(ty<H&&!solid(x/T|0,ty))ty++;return PP={x,y:ty*T,sx:spawn.x,t:tiles}}
const nearPortal=()=>{if(!portalOn())return false;const p=portalPos();return Math.abs(P.x+6-p.x)<36&&Math.abs(P.y+22-p.y)<30};
function drawPortal(ox,oy,L){if(!portalOn())return;const p=portalPos(),X=Math.round(p.x-ox),Y=Math.round(p.y-oy);if(X<-90||X>cv.width+90||Y<-140||Y>cv.height+140)return;const t=time,pu=.5+.5*Math.sin(t*3);
 FR(X-22,Y-3,44,3,'#e8e0f4');FR(X-26,Y,52,3,'#d9a441');
 AD(()=>{glow(X,Y-34,76+pu*10,'rgba(255,230,150,.5)');PL([X-14,Y-3,X-4,Y-110,X+4,Y-110,X+14,Y-3],'rgba(255,240,190,.13)');cx.save();cx.translate(X,Y-34);cx.scale(1,1.5);glow(0,0,26,'rgba(255,255,255,.9)');cx.restore()});
 cx.save();cx.translate(X,Y-34);cx.scale(.62,1);cx.strokeStyle='rgba(255,226,140,.95)';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,26,0,7);cx.stroke();cx.strokeStyle='#fff';cx.lineWidth=1;cx.beginPath();cx.arc(0,0,22,0,7);cx.stroke();
 cx.setLineDash([4,6]);cx.lineDashOffset=-t*20;cx.strokeStyle='rgba(255,226,140,.8)';cx.beginPath();cx.arc(0,0,32,0,7);cx.stroke();cx.setLineDash([]);cx.restore();
 for(let i=0;i<10;i++){const lf=(t*.5+i*.1)%1;FR(X+Math.sin(i*5+t)*12,Y-4-lf*70,1.6,1.6,'rgba(255,240,170,'+(1-lf)+')')}
 L.push([X,Y-34,170]);cx.save();cx.textAlign='center';cx.font='bold 8px Georgia';cx.shadowColor='#fb4';cx.shadowBlur=6;cx.fillStyle='#fff2c0';cx.fillText('\u2726 PORTAL TO HEAVEN \u2726',X,Y-84);
 if(nearPortal()){cx.fillStyle='#fff';cx.fillText('[E] Enter',X,Y-74)}cx.restore()}
const _dsp3=drawSpawn;drawSpawn=function(ox,oy,L){if(inHeaven)return;_dsp3(ox,oy,L);drawPortal(ox,oy,L)};

// ----- dialogue -----
let dlg=null;
function say(lines,done){if(dlg)return;const el=document.createElement('div');el.id='dlg';el.innerHTML='<div class="dn">NAMELESS DEITY</div><div class="dt"></div><div class="dh">click / Space to continue \u00b7 Esc to skip</div>';document.body.appendChild(el);
 dlg={el,i:0,c:0,iv:null,lines,done};paused=true;const tx=el.querySelector('.dt');
 const show=()=>{dlg.c=0;tx.textContent='';clearInterval(dlg.iv);dlg.iv=setInterval(()=>{dlg.c++;tx.textContent=dlg.lines[dlg.i].slice(0,dlg.c);if(dlg.c>=dlg.lines[dlg.i].length)clearInterval(dlg.iv)},24)};
 dlg.next=()=>{if(dlg.c<dlg.lines[dlg.i].length){dlg.c=dlg.lines[dlg.i].length;tx.textContent=dlg.lines[dlg.i];clearInterval(dlg.iv);return}if(++dlg.i>=dlg.lines.length)return dlg.end();show();tone(660,880,.3,'sine',.04)};
 dlg.end=()=>{clearInterval(dlg.iv);el.remove();const d=dlg.done;dlg=null;d()};el.onclick=()=>dlg&&dlg.next();show()}
addEventListener('keydown',e=>{if(dlg){e.stopImmediatePropagation();e.preventDefault();if(e.repeat)return;if(e.code==='Space'||e.code==='Enter'||e.code==='KeyE')dlg.next();else if(e.code==='Escape')dlg.end();return}
 if(e.code==='KeyE'&&P&&!paused&&nearPortal()){e.stopImmediatePropagation();e.preventDefault();openPortal()}},true);
function openPortal(){say(['\u2026You have come far, wanderer. Through ash, through ice, through storm and void.','I have watched every step. Every fall. Every perfect parry.','The Hollow King was only the last lock upon this door.','Many have stood where you stand. None were worthy of what lies beyond.','Let us see whether you are\u2026 worthy.','But know this: within my realm you are given a single life. Fall, and the Depths will keep you forever.','Come, then. Show me the one who endures.'],enterHeaven)}

// ----- the Heaven dimension -----
const HEAVP={1:['#ece9e0','#e0dcd1','#f5f2ea'],2:['#0d0f1a','#0a0c16','#12162a'],3:['#ece9e0','#e0dcd1','#f5f2ea'],7:['#1a2a50','#15244a','#223566']};
function genHeaven(){const t=new Uint8Array(W*H),a=DEITY,x0=a.cx-a.hw,x1=a.cx+a.hw,y0=a.fy-a.ht;
 t.fill(2);
 for(let y=y0-1;y<=a.fy+1;y++)for(let x=x0-1;x<=x1+1;x++)t[y*W+x]=3;
 for(let x=x0;x<=x1;x++){const c=y0+Math.round(Math.pow(Math.abs(x-a.cx)/a.hw,3)*9);for(let y=c;y<a.fy;y++)t[y*W+x]=0}
 for(const[px,py,ln]of a.pl)for(let k=0;k<ln;k++){t[(a.fy-py)*W+a.cx+px+k]=3}
 return t}
function enterHeaven(){if(inHeaven)return;inHeaven=true;
 HOME={tiles,enemies,chests,zones,projs,GATES,ARCHES,seen,SHOP,QG,ENCP};SHOP=QG=ENCP=null;BD.deity.a1=A1.slice();BD.deity.a2=A1.concat(['seraph','heavenfall','chorus','nova','wall']);
 tiles=genHeaven();enemies=[];chests=[];zones=[];projs=[];parts=[];GATES=[];ARCHES=[];seen=new Uint8Array(W*H);
 ARENAS.push(DEITY);BP[0]=HEAVP;BG[0]='#ffffff';
 P.lives=1;P.hp=maxHp();P.stam=maxStam();P.post=0;P.inv=2;P.stun=0;P.guardBroken=0;P.dodge=0;P.atk=0;P.x=(DEITY.cx-DEITY.hw+4)*T;P.y=DEITY.fy*T-22;P.vx=P.vy=0;P.face=1;
 cam.x=Math.max(0,Math.min(W*T-cv.width,P.x-cv.width/2));cam.y=Math.max(0,Math.min(H*T-cv.height,P.y-cv.height/2));
 mkBosses();enemies=enemies.filter(e=>e.id==='deity');paused=false;shake=8;
 toast('\u2726 Lives set to 1 \u2014 there is no second chance \u2726');tone(220,880,1.4,'sine',.1);tone(330,1320,1.4,'sine',.07,.1)}
function leaveHeaven(){if(!inHeaven)return;inHeaven=false;const i=ARENAS.indexOf(DEITY);if(i>=0)ARENAS.splice(i,1);delete BP[0];delete BG[0];
 if(HOME){tiles=HOME.tiles;GATES=HOME.GATES;ARCHES=HOME.ARCHES;seen=HOME.seen;SHOP=HOME.SHOP;QG=HOME.QG;ENCP=HOME.ENCP;HOME=null}}
const _sv=save;save=function(){if(inHeaven||!P)return;_sv()};
const _st=start;start=function(n){leaveHeaven();camFocus=null;musStop();fileStop(true);return _st(n)};
const _er=endRun;endRun=function(){leaveHeaven();musStop();fileStop(true);return _er()};

// ----- Hollow King falls -> portal announced; Deity falls -> victory -----
function announce(t1,t2,t3){bossBanner('','');const b=$('bossBanner');b.innerHTML='<div class="bb-t" style="font-size:40px">'+t1+'</div><div class="bb-n">'+t2+'</div><div class="bb-s">'+t3+'</div>'}
const _fb3=finishBoss;finishBoss=function(B){
 if(B.id==='deity'){const d=B.def;B.dead=true;bossDead.deity=1;zones=[];projs=[];shake=16;musStop();
  burst(bcx(B),bcy(B),60,'#fff');burst(bcx(B),bcy(B),50,'#ffe08a');for(let i=0;i<90;i++){const a=i/90*6.283;parts.push({x:bcx(B),y:bcy(B),vx:Math.cos(a)*300,vy:Math.sin(a)*300,l:1.1,c:i%2?'#fff':'#ffe08a'})}
  gainXp(300*d.tier);gold+=1000;BI.deity(3,B);setTimeout(B.av&&window.AVV?window.AVV:victoryCut,1400);return}
 _fb3(B);
 if(B.id==='hollow'){setTimeout(()=>{if(!P)return;announce('A PORTAL OPENS','A portal to Heaven has appeared at spawn','Seek the light \u2014 if you dare');toast('A portal to Heaven has appeared at spawn');tone(330,1320,1.6,'sine',.1);tone(495,1980,1.6,'triangle',.06,.15)},4800)}};

// ----- win screen -----
const win=document.createElement('div');win.id='win';win.className='panel hidden';
win.innerHTML='<div class="rune" style="color:#ffe08a;text-shadow:0 0 20px #ffb84a">\u2726</div><h1>VICTORY</h1><h2>The Nameless Deity has fallen</h2><div id="winTxt">\u201cWorthy\u2026 at last. Carry a fragment of the light with you.\u201d</div><div id="winStats"></div><button id="winEnd">End Run &amp; Claim Nameless Blessing</button>';
document.body.appendChild(win);
window.__showWin=()=>showWin();
function showWin(){if(!P)return;paused=true;const ec=bankedEchoes(),av=!!window.AV_WIN;win.querySelector('h2').textContent=av?'The Avatar of Emptiness has fallen':'The Nameless Deity has fallen';$('winTxt').textContent=av?'\u201cSo this is\u2026 what it is to be filled.\u201d':'\u201cWorthy\u2026 at last. Carry a fragment of the light with you.\u201d';$('winEnd').innerHTML=av?'End Run &amp; Claim Blessings':'End Run &amp; Claim Nameless Blessing';
 $('winStats').innerHTML='Level <b>'+P.lvl+'</b> \u00b7 <b>'+Object.keys(bossDead).length+'</b> bosses \u00b7 <b>'+(P.kills||0)+'</b> kills<br><b style="font-size:16px">+'+ec+' \u2756 echoes will be banked</b><br>'+(av?'<span style="color:#ff8a9a">\u2740 Emptiness Filled: all stats +20% permanently</span>'+(BLESS2?' <small>(already owned)</small>':'')+'<br>':'')+'<span style="color:#ffe08a">\u2726 Nameless Blessing: all stats +5% permanently</span>'+(BLESS?' <small>(already owned)</small>':'');
 win.classList.remove('hidden');win.classList.remove('go-in');void win.offsetWidth;win.classList.add('go-in')}
$('winEnd').onclick=()=>{if(!P)return;const av=!!window.AV_WIN;window.AV_WIN=0;const ec=bankedEchoes();meta.echoes+=ec;saveMeta();BLESS=true;if(av){BLESS2=true;try{localStorage.setItem(BKEY2,'1')}catch(e){}}try{localStorage.setItem(BKEY,'1')}catch(e){}
 try{localStorage.removeItem(SAVEKEY)}catch(e){}
 leaveHeaven();musStop();win.classList.add('hidden');P=null;paused=true;sheetOpen=false;shopOpen=false;questOpen=false;enemies=[];zones=[];projs=[];parts=[];floats=[];
 for(const i of['hud','hint','mmw','sheet'])$(i).classList.add('hidden');$('toast').textContent='';$('btnContinue').disabled=true;$('runInfo').innerHTML='';
 recalc();updMenu();$('menu').classList.remove('hidden');toast(av?'\u2740 Emptiness Filled received \u2014 all stats +20% (and Nameless Blessing +5%)':'\u2726 Nameless Blessing received \u2014 all stats +5%')};

// ----- chest respawn tick -----
let crT=0;const _uf2=updFx;updFx=function(dt){_uf2(dt);crT-=dt;if(crT>0||inHeaven||!P)return;crT=2;const now=Date.now();let ch=0;
 for(const k in CR.at){const z=CR.at[k];if(z.t<=now&&!chests.some(c=>c.k===k)){delete CR.at[k];delete opened[k];ch=1;
  const c={tx:z.tx,ty:z.ty,type:z.type,hp:CH[z.type].hp,max:CH[z.type].hp,flash:0,k};if(CR.n[k])c.rs=CR.n[k];chests.push(c)}}if(ch)crSave()};

// ---------- 13. arena blocks are unbreakable (except platforms) ----------
const arenaLocked=(tx,ty)=>{if(inHeaven)return !ARENAS.some(a=>a.pl.some(([px,py,ln])=>{const yy=a.fy-py;return(ty===yy)&&tx>=a.cx+px&&tx<a.cx+px+ln}));
 for(const a of ARENAS){if(tx<a.cx-a.hw-3||tx>a.cx+a.hw+3||ty<a.fy-a.ht-3||ty>a.fy+3)continue;
  for(const[px,py,ln]of a.pl){const yy=a.fy-py;if((ty===yy)&&tx>=a.cx+px&&tx<a.cx+px+ln)return false}return true}return false};
const _mine=mine;mine=function(){if(P){const wx=mouse.x+cam.x,wy=mouse.y+cam.y,tx=wx/T|0,ty=wy/T|0;
 if(tx>0&&ty>=0&&tx<W&&ty<H&&tiles[ty*W+tx]&&arenaLocked(tx,ty)){if(Math.hypot(wx-(P.x+6),wy-(P.y+11))<=T*5)toast('The arena stone will not break \u00b7 only platforms yield');return}}
 _mine()};

// ---------- 14. boss theme volume (shown in the Esc pause menu) ----------
let BVOL=1;try{const v=parseFloat(localStorage.getItem('ashfall_bvol'));if(v>=0&&v<=1)BVOL=v}catch(e){}
{const s=document.createElement('style');s.textContent=`
#volp{min-width:340px;padding:22px 34px;z-index:40}
#volp h1{font-size:26px;letter-spacing:6px;margin:0 0 4px}
#volp .vl{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c8b48c;margin:16px 0 8px}
#volp .vl b{color:#ffd36b;font-size:16px;letter-spacing:1px}
#vsl{-webkit-appearance:none;appearance:none;width:100%;height:14px;border:2px solid #000;outline:1px solid var(--edge);background:#07050c;cursor:pointer;margin:0;display:block}
#vsl::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:22px;background:linear-gradient(#ffe9a8,#c28a2a);border:2px solid #000;box-shadow:0 0 10px #ffb84a}
#vsl::-moz-range-thumb{width:8px;height:20px;border-radius:0;background:linear-gradient(#ffe9a8,#c28a2a);border:2px solid #000;box-shadow:0 0 10px #ffb84a}
#volp .vh{font-size:11px;color:#8a7c68;letter-spacing:2px;margin-top:14px}`;document.head.appendChild(s)}
const volp=document.createElement('div');volp.id='volp';volp.className='panel hidden';
volp.innerHTML='<h1>PAUSED</h1><div class="vl"><span>\u266a Boss Theme Volume</span><b id="vpct">100%</b></div><input type="range" id="vsl" min="0" max="100" step="1" value="100"><div class="vh">Esc resume \u00b7 M mute all sound</div>';
document.body.appendChild(volp);
const vsl=$('vsl'),vpct=$('vpct');
const bvTarget=()=>Math.max(.0002,.55*BVOL);
function paintVol(){const v=Math.round(BVOL*100);vsl.value=v;vpct.textContent=v+'%';vsl.style.background='linear-gradient(90deg,#ffb84a '+v+'%,#07050c '+v+'%)'}
let pvT=0;
vsl.addEventListener('input',()=>{BVOL=vsl.value/100;paintVol();try{localStorage.setItem('ashfall_bvol',String(BVOL))}catch(e){}
 const a=Audio_.ac;if(a&&MUS.out&&MUS.id){try{MUS.out.gain.cancelScheduledValues(a.currentTime);MUS.out.gain.setTargetAtTime(bvTarget(),a.currentTime,.04)}catch(e){}}
 if(FA&&!FA.fi)FA.volume=Math.min(1,.7*BVOL);
 const n=performance.now();if(BVOL>0&&n-pvT>140&&!Audio_.mute){pvT=n;tone(330,330,.3,'sine',.12*BVOL);tone(495,495,.3,'triangle',.07*BVOL,.05)}});
vsl.addEventListener('keydown',e=>{if(e.code!=='ArrowLeft'&&e.code!=='ArrowRight'&&e.code!=='ArrowUp'&&e.code!=='ArrowDown')return;e.stopPropagation()});
paintVol();
const _ms=musStart;musStart=function(id,B){_ms(id,B);const a=Audio_.ac;if(a&&MUS.out){try{const g=MUS.out.gain;g.cancelScheduledValues(a.currentTime);g.setValueAtTime(.0001,a.currentTime);g.exponentialRampToValueAtTime(bvTarget(),a.currentTime+.8)}catch(e){}}};
const _fs=fileStart;fileStart=function(a){_fs(a);if(FA===a&&!a.fi)a.volume=Math.min(1,.7*BVOL)};
setInterval(()=>{try{if(FA&&!FA.fi)FA.volume=Math.min(1,.7*BVOL);
 const w=$('win'),show=!!P&&paused&&!sheetOpen&&!shopOpen&&!questOpen&&!over&&!$('dlg')&&!$('warnbox')&&!$('vcut')&&!(w&&!w.classList.contains('hidden'))&&$('menu').classList.contains('hidden');
 volp.classList.toggle('hidden',!show)}catch(e){}},100);

// ---------- 15. Deity Phase IV: 35% chance to be staggered every 30s ----------
const _ub4=updBoss;updBoss=function(B,dt){_ub4(B,dt);
 if(B.id!=='deity'||B.dead||!B.fury||!P)return;
 if(B.st==='stagger'){if(Math.random()<.35){parts.push({x:B.x+Math.random()*B.w,y:B.y+Math.random()*10,vx:(Math.random()-.5)*50,vy:-40,l:.5,c:'#ffe08a'})}return}
 if(B.sgT===undefined)B.sgT=30;
 if(B.sgT>0){B.sgT-=dt;return}
 if(!['idle','tele','act','rec'].includes(B.st))return; // wait until it can be interrupted
 B.sgT=30;
 if(Math.random()<.35){B.st='stagger';B.t=3.5;B.vx=0;B.chain=0;B.roar=0;shake=Math.max(shake,10);hitstop=Math.max(hitstop,.08);
  burst(bcx(B),bcy(B),36,'#ffe08a');burst(bcx(B),bcy(B),20,'#fff');float(B.x+B.w/2,B.y-22,'ITS POWER WEAKENS','#ffe08a');toast('ITS POWER WEAKENS');
  tone(220,60,.6,'sawtooth',.14);tone(880,440,.5,'triangle',.08,.05)}};

// ---------- 17. dev code ("harubella") ----------
const DEVCODE='harubella',FORGECODE='forgemaster';let DEV=false,DEVARM=false,DEVF=false,DEVFARM=false;
{const s=document.createElement('style');s.textContent=`
#devbox{position:fixed;right:10px;bottom:10px;z-index:55;display:flex;flex-direction:column;align-items:flex-end;gap:4px}
#devbox input{width:124px;background:#07050ccc;border:1px solid #3a2a14;color:#c8b48c;font:11px Georgia,serif;letter-spacing:1px;padding:4px 7px;outline:none;opacity:.4;text-align:center}
#devbox input:hover,#devbox input:focus{opacity:1;border-color:var(--gold)}
#devbox input::placeholder{color:#7a6c58}
#devtag{font-size:10px;letter-spacing:2px;color:#ff6a5a;text-shadow:0 0 8px #f00;pointer-events:none}`;document.head.appendChild(s)}
const devbox=document.createElement('div');devbox.id='devbox';devbox.innerHTML='<div id="devtag"></div><input id="devin" type="text" placeholder="input dev code" autocomplete="off" spellcheck="false" maxlength="24">';document.body.appendChild(devbox);
{const di=$('devin');for(const ev of['keydown','keyup','keypress'])di.addEventListener(ev,e=>e.stopPropagation());
 di.addEventListener('keydown',e=>{if(e.code==='Escape'){di.blur();return}if(e.code!=='Enter'&&e.code!=='NumpadEnter')return;const v=di.value.trim().toLowerCase();di.value='';di.blur();
  if(v===DEVCODE){if(DEV){toast('Dev run already active');return}
   if(P){DEV=true;save();toast('\u2726 DEV RUN \u2014 invulnerable \u00b7 one-hit kills \u00b7 echoes & permanent rewards void');tone(440,880,.4,'sine',.08);tone(660,1320,.4,'triangle',.05,.08)}
   else{DEVARM=true;toast('\u2726 Dev run armed \u2014 applies to the next run you start');tone(440,880,.4,'sine',.08)}}
  else if(v===FORGECODE){if(DEV){toast('Dev run already active');return}
   if(P){DEV=true;DEVF=true;if(window.giveForge)window.giveForge();save();toast('\u2726 DEV FORGE RUN \u2014 Developer Blade (5000 dmg) \u00b7 Developer armor (+5000 HP) \u00b7 echoes, badges & blessings void');tone(440,880,.4,'sine',.08);tone(660,1320,.4,'triangle',.05,.08)}
   else{DEVARM=true;DEVFARM=true;toast('\u2726 Dev forge armed \u2014 applies to the next run you start');tone(440,880,.4,'sine',.08)}}
  else if(v)toast('Invalid code')})}
setInterval(()=>{$('devtag').textContent=DEV?(DEVF?'\u26A0 DEV FORGE RUN':'\u26A0 DEV RUN'):DEVARM?'\u26A0 DEV ARMED':''},150);
// one-hit kills
{const _hb5=hitBoss;hitBoss=function(B){if(DEV&&!DEVF&&P&&B&&!['dormant','intro','phase','dying'].includes(B.st))B.hp=Math.min(B.hp,1);_hb5(B)};
 const _he=hitEnemy;hitEnemy=function(e){if(DEV&&!DEVF&&P&&e&&!e.boss)e.hp=Math.min(e.hp,1);return _he(e)}}
// invulnerable: no damage from enemies, lava or the void, and death is blocked
window.DEVON=()=>DEV;window.DEVFORGE=()=>DEVF;
{const _hpD=hurtPlayer;hurtPlayer=function(a,b,c,d){if(DEV&&!DEVF&&P)return'dodge';return _hpD(a,b,c,d)};
 const _dieD=die;die=function(){if(DEV&&!DEVF&&P){P.hp=maxHp();P.dead=0;if(!inHeaven&&P.y>H*T-40){P.x=spawn.x;P.y=spawn.y-24;P.vx=P.vy=0}return}_dieD()}}
// the dev flag lives in the save so Continue keeps it for that run only
{const _sv2=save;save=function(){_sv2();if(DEV&&P&&!inHeaven){try{const d=JSON.parse(localStorage.getItem(SAVEKEY));if(d){d.dev=1;if(DEVF)d.devf=1;localStorage.setItem(SAVEKEY,JSON.stringify(d))}}catch(e){}}};
 const _st2=start;start=function(n){const arm=DEVARM,armF=DEVFARM;DEVARM=false;DEVFARM=false;const r=_st2(n);
  if(arm){DEV=true;DEVF=armF}else if(n){DEV=false;DEVF=false}else{try{const sd=JSON.parse(localStorage.getItem(SAVEKEY));DEV=!!sd.dev;DEVF=!!sd.devf}catch(e){DEV=false;DEVF=false}}
  if(DEV&&P){if(DEVF&&window.giveForge)window.giveForge();save();setTimeout(()=>toast(DEVF?'\u2726 DEV FORGE RUN \u2014 Developer gear equipped \u00b7 nothing earned is kept':'\u2726 DEV RUN \u2014 invulnerable \u00b7 one-hit kills \u00b7 nothing earned is kept'),600)}return r};}
// nothing earned in a dev run is kept: no banked echoes, no quest echoes, no Nameless Blessing
{const _er=endRun;endRun=function(){const e0=meta.echoes;_er();if(DEV){meta.echoes=e0;saveMeta();updMenu()}DEV=false;DEVF=false};
 const _sgo=showGameOver;showGameOver=function(o){if(DEV)o=Object.assign({},o,{ec:0});_sgo(o);if(DEV)$('goStats').innerHTML+='<br><b style="color:#ff6a5a">DEV RUN \u2014 no echoes banked</b>'};
 const _cq=claimQuest;claimQuest=function(i){const e0=meta.echoes;_cq(i);if(DEV&&meta.echoes!==e0){meta.echoes=e0;saveMeta();const t=$('toast');t.textContent=t.textContent.replace(/\s*\u00b7?\s*\+\d+ echoes/,' \u00b7 (dev run: echoes void)')}};
 const _hud=hud;hud=function(){_hud();if(DEV)$('hEc').textContent='\u2756 dev run \u00b7 echoes void'};
 const _sw=showWin;showWin=function(){_sw();if(DEV){$('winStats').innerHTML='Level <b>'+P.lvl+'</b> \u00b7 <b>'+Object.keys(bossDead).length+'</b> bosses \u00b7 <b>'+(P.kills||0)+'</b> kills<br><b style="color:#ff6a5a">DEV RUN \u2014 no echoes banked \u00b7 no blessings granted (Nameless / Emptiness Filled)</b>';$('winEnd').innerHTML='End Run'}else $('winEnd').innerHTML=window.AV_WIN?'End Run &amp; Claim Blessings':'End Run &amp; Claim Nameless Blessing'};
 const old=$('winEnd').onclick;$('winEnd').onclick=function(){if(!DEV)return old.call(this);if(!P)return;
  leaveHeaven();musStop();win.classList.add('hidden');P=null;paused=true;sheetOpen=false;shopOpen=false;questOpen=false;enemies=[];zones=[];projs=[];parts=[];floats=[];
  for(const i of['hud','hint','mmw','sheet'])$(i).classList.add('hidden');$('toast').textContent='';$('btnContinue').disabled=true;$('runInfo').innerHTML='';
  try{localStorage.removeItem(SAVEKEY)}catch(e){}DEV=false;DEVF=false;window.AV_WIN=0;recalc();updMenu();$('menu').classList.remove('hidden');toast('Dev run complete \u2014 nothing was banked')}}

// ---------- 18. BOSS VANQUISHED cutscene ----------
let VC=0;
//VCDRAW_BEGIN
const VCE=x=>x<0?0:x>1?1:x*x*(3-2*x);
const vcMix=(a,b,k)=>a.map((v,i)=>(v+(b[i]-v)*k)|0);
const vcCloud=(c,x,y,s)=>{for(const[ox,oy,r]of[[-1.2,.1,.7],[-.5,-.35,.85],[.3,-.45,1],[1,-.1,.8],[1.6,.15,.6],[0,.2,1]]){c.moveTo(x+ox*s+r*s,y+oy*s);c.arc(x+ox*s,y+oy*s,r*s,0,6.2832)}};
function vcDraw(c,w,h,t,fs){const TAU=6.2832,U=Math.min(w,h*1.6)/900,cx0=w/2,cy0=h*.34,R=Math.min(w*.5,h*.9)*.3,S=clamp01((t-1.6)/7.5),k1=VCE(S),ts=t-1.1,gr=ts<0?0:VCE(ts/1.5);
 const gl=(x,y,r,col)=>{const q=c.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,col);q.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=q;c.fillRect(x-r,y-r,r*2,r*2)};
 c.globalAlpha=1;c.globalCompositeOperation='source-over';c.shadowBlur=0;
 // sky: bruised twilight -> dawn
 let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgb('+vcMix([14,8,34],[96,128,200],k1)+')');g.addColorStop(.55,'rgb('+vcMix([46,14,50],[246,212,196],k1)+')');g.addColorStop(1,'rgb('+vcMix([72,20,36],[255,228,164],k1)+')');c.fillStyle=g;c.fillRect(0,0,w,h);
 for(let i=0;i<90;i++){const x=((i*173)%1000)/1000*w,y=((i*89)%997)/997*h*.7,a=(1-k1)*(.35+.35*Math.sin(t*2+i));c.fillStyle='rgba(255,255,255,'+a+')';c.fillRect(x,y,i%7?1:2,i%7?1:2)}
 // radiance
 c.save();c.globalCompositeOperation='lighter';gl(cx0,cy0,Math.max(w,h)*(.22+.35*gr+.05*k1),'rgba(255,224,150,'+(.16+.16*gr)+')');gl(cx0,cy0,R*(.3+.55*gr)*(1+.05*Math.sin(t*3)),'rgba(255,255,255,'+(.35+.4*gr)+')');
 const rays=gr*(.06+.03*k1),RL=Math.hypot(w,h);for(let i=0;i<22;i++){const an=i/22*TAU+t*.04,wd=.035+.02*Math.sin(t*.8+i*1.9);c.fillStyle='rgba(255,236,180,'+rays*(.6+.4*Math.sin(t*1.1+i))+')';c.beginPath();c.moveTo(cx0,cy0);c.lineTo(cx0+Math.cos(an-wd)*RL,cy0+Math.sin(an-wd)*RL);c.lineTo(cx0+Math.cos(an+wd)*RL,cy0+Math.sin(an+wd)*RL);c.fill()}c.restore();
 // the Deity's halo-clock, stopped, cracking...
 if(t<1.1){const sh=Math.min(1,t*2)*6;c.save();c.translate(cx0+(Math.random()-.5)*sh,cy0+(Math.random()-.5)*sh);c.strokeStyle='rgba(255,236,190,.95)';c.lineWidth=4*U+1;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.lineWidth=2;c.beginPath();c.arc(0,0,R*.72,0,TAU);c.stroke();
  for(let i=0;i<60;i++){const an=i/60*TAU,r0=R*(i%5?.9:.84);c.lineWidth=i%5?1:2.5;c.beginPath();c.moveTo(Math.cos(an)*r0,Math.sin(an)*r0);c.lineTo(Math.cos(an)*R*.98,Math.sin(an)*R*.98);c.stroke()}
  c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.lineTo(0,-R*.64);c.moveTo(0,0);c.lineTo(Math.cos(-1.1)*R*.4,Math.sin(-1.1)*R*.4);c.stroke();
  c.lineWidth=2;for(let i=0;i<9;i++){const an=i*.7+.2,l=R*.34*clamp01(t/1);c.beginPath();c.moveTo(Math.cos(an)*R*.98,Math.sin(an)*R*.98);c.lineTo(Math.cos(an)*(R*.98-l)+Math.sin(an*5)*4,Math.sin(an)*(R*.98-l)+Math.cos(an*5)*4);c.stroke()}c.restore()}
 // ...and shatters
 if(ts>0){const al=1-clamp01(ts/2.6),Mx=Math.max(w,h);c.save();c.translate(cx0,cy0);
  for(let i=0;i<64;i++){const an=i/64*TAU+((i*37)%11)*.01,sp=(120+((i*53)%260))*U*3.2,d=R*(.7+(i%4)*.1)+sp*Math.pow(ts,.7),x=Math.cos(an)*d,y=Math.sin(an)*d+ts*ts*20*U*((i%3)-.5),len=(10+(i%5)*6)*U;c.save();c.translate(x,y);c.rotate(an+ts*(i%2?2:-2)*(1+i%3*.3));c.globalAlpha=al;c.fillStyle=i%3?'#ffe9a8':'#ffffff';c.beginPath();c.moveTo(-len,0);c.lineTo(0,-len*.22);c.lineTo(len,0);c.lineTo(0,len*.22);c.fill();c.restore()}
  for(let k=0;k<3;k++){const r=(ts-k*.2)*Mx*.55;if(r<=0)continue;c.strokeStyle='rgba(255,'+(240-k*30)+','+(200-k*50)+','+.8*(1-clamp01(r/(Mx*.8)))+')';c.lineWidth=(8-k*2)*U+1;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke()}c.restore()}
 // dawn-flare
 if(t>2.8){const a=VCE((t-2.8)/.7)*(.9-.5*clamp01((t-3.6)/2)),L=w*VCE((t-2.8)/.9);c.save();c.globalCompositeOperation='lighter';const q=c.createLinearGradient(cx0-L/2,0,cx0+L/2,0);q.addColorStop(0,'rgba(255,220,140,0)');q.addColorStop(.5,'rgba(255,248,226,'+a+')');q.addColorStop(1,'rgba(255,220,140,0)');c.fillStyle=q;c.fillRect(cx0-L/2,cy0-2*U-1,L,4*U+2);c.restore()}
 // sea of clouds, warming with the dawn
 const cl=[vcMix([60,28,70],[255,232,204],k1),vcMix([40,20,56],[250,238,216],k1),vcMix([22,12,38],[255,246,232],k1)];
 for(let L=0;L<3;L++){c.fillStyle='rgba('+cl[L]+',.92)';c.beginPath();const sp=w+400*U;for(let i=0;i<8;i++){const x=-200*U+((i*sp/7+t*(15+L*12)*U)%sp+sp)%sp;vcCloud(c,x,h*(.87+L*.06)+Math.sin(t*.5+i)*3,(62+L*24)*U)}c.fill()}
 c.save();c.globalCompositeOperation='lighter';gl(cx0,h*.9,w*.5,'rgba(255,214,140,'+.35*k1+')');
 for(let i=0;i<80;i++){const x=((i*137)%1000)/1000*w+Math.sin(t*.7+i)*16*U,y=h-((t*(26+i%6*9)*U+i*91)%(h*1.1)),a=(.25+.4*Math.sin(t*3+i*2))*(.4+.6*clamp01((t-1)/2));c.fillStyle='rgba(255,226,150,'+a+')';c.fillRect(x,y,(1+i%3)*U+.5,(1+i%3)*U+.5)}c.restore();
 for(let i=0;i<18;i++){const x=((i*211)%1000)/1000*w+Math.sin(t*.6+i)*40*U,y=((t*(18+i%4*7)*U+i*150)%(h+80))-40;c.save();c.translate(x,y);c.rotate(Math.sin(t*.8+i)*1.2+i);c.globalAlpha=.9*clamp01((t-2.5)/2);c.fillStyle='#fffdf4';c.beginPath();c.moveTo(-10*U,0);c.quadraticCurveTo(0,-3*U,10*U,0);c.quadraticCurveTo(0,3*U,-10*U,0);c.fill();c.restore()}
 const bd=VCE((t-3)/1.2)*.55;g=c.createLinearGradient(0,h*.44,0,h*.97);g.addColorStop(0,'rgba(8,4,20,0)');g.addColorStop(.45,'rgba(8,4,20,'+bd*.8+')');g.addColorStop(1,'rgba(8,4,20,'+bd+')');c.fillStyle=g;c.fillRect(0,h*.44,w,h*.56);
 // text
 c.textAlign='left';c.textBaseline='alphabetic';
 const spaced=(txt,y,size,font,t0,step,dur,fillFn,glowc,blur)=>{c.font=font;const sp=size*.16,chs=[...txt],ws=chs.map(ch=>c.measureText(ch).width),tot=ws.reduce((a,b)=>a+b,0)+sp*(chs.length-1);let x=w/2-tot/2;
  chs.forEach((ch,i)=>{const a=clamp01((t-t0-i*step)/dur);if(a>0&&ch!==' '){const e=VCE(a),sc=1+(1-e)*.55;c.save();c.translate(x+ws[i]/2,y-size*.3);c.scale(sc,sc);c.globalAlpha=e;c.lineJoin='round';c.lineWidth=size*.06;c.strokeStyle='rgba(30,12,0,.9)';c.strokeText(ch,-ws[i]/2,size*.3-(1-e)*14);c.shadowColor=glowc;c.shadowBlur=blur*(.6+.4*Math.sin(t*2));c.fillStyle=fillFn(y);c.fillText(ch,-ws[i]/2,size*.3-(1-e)*14);c.restore()}x+=ws[i]+sp})};
 const T1=Math.min(w*.072,h*.16),Ty=h*.6;
 spaced('BOSS VANQUISHED',Ty,T1,'700 '+T1+'px Georgia,"Palatino Linotype",serif',3.4,.075,.55,y=>{const q=c.createLinearGradient(0,y-T1,0,y);q.addColorStop(0,'#fffbe8');q.addColorStop(.5,'#ffd36b');q.addColorStop(1,'#b8751a');return q},'rgba(255,170,60,.95)',26);
 const da=VCE((t-4.6)/.9);if(da>0){const L=Math.min(w*.3,420*U)*da,y=Ty+T1*.32;c.save();const q=c.createLinearGradient(cx0-L,0,cx0+L,0);q.addColorStop(0,'rgba(255,211,107,0)');q.addColorStop(.5,'rgba(255,230,160,.95)');q.addColorStop(1,'rgba(255,211,107,0)');c.fillStyle=q;c.fillRect(cx0-L,y,L*2,2);c.translate(cx0,y+1);c.rotate(.7854);c.fillStyle='#ffe9a8';c.shadowColor='#ffb84a';c.shadowBlur=12;const d=6*U+2;c.fillRect(-d,-d,d*2,d*2);c.restore()}
 const T2=T1*.3;spaced('THE NAMELESS DEITY',Ty+T1*.78,T2,'600 '+T2+'px Georgia,serif',5.2,.05,.6,()=>'#f0e2c4','rgba(255,200,120,.7)',10);
 const line=(txt,y,size,col,t0,t1,font)=>{const a=VCE((t-t0)/.9)*(1-VCE((t-t1)/.6));if(a<=0)return;c.save();c.globalAlpha=a;c.font=font+size+'px Georgia,serif';c.textAlign='center';c.fillStyle=col;c.lineJoin='round';c.lineWidth=size*.12;c.strokeStyle='rgba(10,4,20,.85)';c.strokeText(txt,cx0,y+(1-a)*8);c.shadowColor='rgba(0,0,0,.7)';c.shadowBlur=6;c.fillText(txt,cx0,y+(1-a)*8);c.restore()};
 const T3=T1*.28;line('\u201CWorthy\u2026 at last.\u201D',h*.8,T3,'#ffe9b8',7.2,10.6,'italic ');line('The light returns to the Ashfall Depths.',h*.86,T3*.8,'#fff4dc',8.9,10.6,'');
 if(t>11){const a=VCE((t-11)/1)*1;c.save();c.globalAlpha=a;c.font='600 '+T3*1.1+'px Georgia,serif';const txt='A S H F A L L   I S   F R E E',tw=c.measureText(txt).width;c.lineJoin='round';c.lineWidth=T3*.2;c.strokeStyle='rgba(30,12,0,.9)';c.strokeText(txt,cx0-tw/2,h*.82);c.fillStyle='#ffd36b';c.shadowColor='rgba(255,170,60,.9)';c.shadowBlur=14;c.fillText(txt,cx0-tw/2,h*.82);c.restore()}
 // light-and-dark finish: opening flash, letterbox, vignette, skip hint, final white
 if(t<1.5){c.fillStyle='rgba(255,255,255,'+(1-VCE(t/1.5))+')';c.fillRect(0,0,w,h)}
 g=c.createRadialGradient(cx0,h*.5,Math.min(w,h)*.3,cx0,h*.5,Math.hypot(w,h)*.6);g.addColorStop(0,'rgba(10,4,24,0)');g.addColorStop(1,'rgba(10,4,24,'+(.55-.25*k1)+')');c.fillStyle=g;c.fillRect(0,0,w,h);
 const bh=h*.09*VCE((t-.3)/1)*(1-VCE((t-fs)/1.2));c.fillStyle='#000';c.fillRect(0,0,w,bh);c.fillRect(0,h-bh,w,bh);
 if(t>3&&t<fs){c.save();c.globalAlpha=.55*clamp01((t-3)/1);c.font='12px Georgia,serif';c.textAlign='right';c.fillStyle='#d8cdb8';c.fillText('click / Space to skip',w-18,h-bh-12);c.restore()}
 if(t>fs){c.fillStyle='rgba(255,255,255,'+clamp01((t-fs)/1.4)+')';c.fillRect(0,0,w,h)}}
//VCDRAW_END
function victoryCut(){if(VC||!P)return;VC=1;paused=true;P.inv=60;
 const el=document.createElement('canvas');el.id='vcut';el.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:90;background:#000;image-rendering:auto';document.body.appendChild(el);
 const c=el.getContext('2d');let w=0,h=0;const rs=()=>{w=el.width=innerWidth;h=el.height=innerHeight};rs();addEventListener('resize',rs);
 let fs=14.4,fin=0;const t0=performance.now(),tm=[],at=(s,f)=>tm.push(setTimeout(f,s*1000));
 at(0,()=>{tone(62,24,2.6,'sine',.4);tone(124,40,2,'sawtooth',.14);noise(1.8,.34,3000,90,'lowpass')});
 at(1.05,()=>{noise(1.4,.3,9000,1500,'highpass',1);[2093,2637,3136,3951,4699].forEach((f,i)=>tone(f,f*.6,1.3,'sine',.055,i*.05));tone(90,30,1.2,'sine',.3)});
 at(2.2,()=>{[196,247,294,392,494,587].forEach((f,i)=>{tone(f*.995,f*1.005,5.5,'triangle',.045,i*.18);tone(f*2,f*2,4.5,'sine',.02,i*.18+.3)})});
 at(3.35,()=>{[1318,1976,2637,3136].forEach((f,i)=>tone(f,f,3.2,'sine',.07-i*.01,i*.09));tone(55,50,3,'sine',.25)});
 at(7.6,()=>{[262,330,392,523,659,784].forEach((f,i)=>tone(f,f*1.003,5,'triangle',.05,i*.14))});
 at(11,()=>{[1568,2093,2637].forEach((f,i)=>tone(f,f,3,'sine',.05,i*.2))});
 const skip=()=>{const t=(performance.now()-t0)/1000;if(t>2.5&&fs>t)fs=t};
 const kd=e=>{e.stopImmediatePropagation();e.preventDefault();if(e.code==='Space'||e.code==='Enter'||e.code==='Escape')skip()};addEventListener('keydown',kd,true);el.addEventListener('mousedown',skip);
 const finish=()=>{tm.forEach(clearTimeout);removeEventListener('keydown',kd,true);removeEventListener('resize',rs);try{for(const k in keys)keys[k]=false}catch(e){}VC=0;showWin();el.style.transition='opacity 1.2s';el.style.opacity='0';setTimeout(()=>el.remove(),1300)};
 const loop=()=>{const t=(performance.now()-t0)/1000;try{vcDraw(c,w,h,t,fs)}catch(e){console.error(e);fin=1;finish();return}if(t>=fs+1.4&&!fin){fin=1;finish();return}requestAnimationFrame(loop)};requestAnimationFrame(loop)}

try{updMenu()}catch(e){}
})();
