'use strict';
// ===== Ashfall Depths: Patch 10 (load AFTER patch9.js) =====
// DIFFICULTY: chosen when starting a new run (before the Echo Modifier picker).
//   easy       badges invalid · echoes -50% · every enemy & boss -25% HP
//   normal     unchanged · earns the Normal badge on victory
//   hard       enemies & bosses x2 HP and +30% damage · echoes +20% · Hard badge on victory
//   nightmare  x3 HP, +50% damage · echoes +50% · Nightmare badge + permanent +10% all stats on victory
//   purgatory  x5 HP, +100% damage, -25% XP from all sources · echoes +100% · Purgatory badge + permanent +10% all stats on victory
// Also: existing saved basic weapons are brought under the new damage cap (30 at Legendary, scaled down for lower tiers).
(()=>{
const $=id=>document.getElementById(id);
const DIFFS=[
 {id:'easy',n:'Easy',ab:'EZ',c:'#7fe08a',hp:.75,dmg:1,xp:1,ec:.5,
  d:'Every enemy and boss has 25% less HP. Echoes are 50% lower. Badges, the Nameless Blessing and Emptiness Filled are invalid.'},
 {id:'normal',n:'Normal',ab:'NM',c:'#e8dcc8',hp:1,dmg:1,xp:1,ec:1,
  d:'The standard descent. Victory earns the Normal badge.'},
 {id:'hard',n:'Hard',ab:'HD',c:'#ffb347',hp:2,dmg:1.3,xp:1,ec:1.2,
  d:'Every enemy and boss has twice the HP and deals 30% more damage. +20% echoes. Victory earns the Hard badge.'},
 {id:'nightmare',n:'Nightmare',ab:'NT',c:'#ff6a6a',hp:3,dmg:1.5,xp:1,ec:1.5,perm:1,
  d:'Every enemy and boss has triple HP and deals 50% more damage. +50% echoes. Victory earns the Nightmare badge and permanently grants +10% to all stats.'},
 {id:'purgatory',n:'Purgatory',ab:'PG',c:'#c06bff',hp:5,dmg:2,xp:.75,ec:2,perm:1,
  d:'Every enemy and boss has five times the HP and deals 100% more damage. 25% less XP from all sources. +100% echoes. Victory earns the Purgatory badge and permanently grants +10% to all stats.'}];
const DB={};DIFFS.forEach(d=>DB[d.id]=d);
window.DIFF='normal';
const cur=()=>DB[window.DIFF]||DB.normal;
const isDev=()=>!!(window.DEVON&&window.DEVON());

// ---------- styles ----------
{const s=document.createElement('style');s.textContent=`
#diffsel{max-width:640px;width:94vw;z-index:31}
#diffsel h1{font-size:28px}
.dfgrid{display:flex;flex-direction:column;gap:8px;text-align:left;margin:6px 0 4px}
.dfcard{display:flex;gap:12px;align-items:flex-start;padding:9px 12px;background:#ffffff08;border:1px solid #3a2a14;border-left:4px solid var(--c);cursor:pointer;transition:background .12s}
.dfcard:hover{background:#ffffff14}
.dfcard.on{background:linear-gradient(90deg,#3a2a1a,#22180f);border-color:var(--c);box-shadow:0 0 14px -2px var(--c)}
.df-ab{flex:none;width:38px;height:38px;border-radius:6px;display:grid;place-items:center;font-size:13px;font-weight:700;color:var(--c);border:1px solid var(--c);background:#0d0914}
.dfcard.on .df-ab{background:var(--c);color:#0d0914}
.df-t b{color:#f0e2c4;letter-spacing:2px;text-transform:uppercase}.df-t em{font-style:normal;font-size:12px;margin-left:8px;color:var(--c)}
.df-t small{display:block;color:#a89a84;line-height:1.4;margin-top:3px}
#hDiff{font-size:11px;letter-spacing:1px;text-shadow:0 1px 3px #000}
.bd-b.d{width:38px;height:38px;border-radius:7px;font-size:11px;font-weight:700}
`;document.head.appendChild(s)}

// ---------- difficulty picker (shown before the Echo Modifier picker) ----------
let DBY=false;
function pickDiff(cb){
 let el=$('diffsel');if(!el){el=document.createElement('div');el.id='diffsel';el.className='panel hidden';document.body.appendChild(el)}
 let sel='normal';try{const l=localStorage.getItem('ashfall_lastdiff');if(l&&DB[l])sel=l}catch(e){}
 const draw=()=>{
  el.innerHTML='<div class="rune">\u2620</div><h1>DIFFICULTY</h1><h2>Choose how deep the dark goes</h2><div class="dfgrid">'+
   DIFFS.map(d=>{
    const ec=d.ec===1?'':(d.ec<1?'\u2212'+Math.round((1-d.ec)*100)+'% echoes':'+'+Math.round((d.ec-1)*100)+'% echoes');
    return '<div class="dfcard'+(d.id===sel?' on':'')+'" data-d="'+d.id+'" style="--c:'+d.c+'"><span class="df-ab">'+d.ab+'</span><span class="df-t"><b>'+d.n+'</b><em>'+ec+'</em><small>'+d.d+'</small></span></div>'}).join('')+
   '</div><div class="ms-btns"><button id="dfGo">Choose Modifiers</button><button id="dfBack">Back</button></div>';
  el.querySelectorAll('[data-d]').forEach(c=>c.onclick=()=>{sel=c.dataset.d;draw()});
  $('dfGo').onclick=()=>{el.classList.add('hidden');try{localStorage.setItem('ashfall_lastdiff',sel)}catch(e){}cb(sel)};
  $('dfBack').onclick=()=>{el.classList.add('hidden');$('menu').classList.remove('hidden')}};
 $('menu').classList.add('hidden');$('gameover').classList.add('hidden');el.classList.remove('hidden');draw()}
const _s10=start;
start=function(n){
 if(n&&!DBY){pickDiff(id=>{window.DIFF=id;DBY=true;try{_s10(true)}finally{DBY=false}});return}
 return _s10.apply(this,arguments)};

// ---------- persistence: the difficulty is part of the run ----------
const _sv10=save;save=function(){_sv10.apply(this,arguments);if(!P)return;
 try{const d=JSON.parse(localStorage.getItem(SAVEKEY));if(d){d.diff=window.DIFF;localStorage.setItem(SAVEKEY,JSON.stringify(d))}}catch(e){}};
const _ld10=load;load=function(){let d=null;try{d=JSON.parse(localStorage.getItem(SAVEKEY))}catch(e){}
 window.DIFF=(d&&DB[d.diff])?d.diff:'normal';
 const r=_ld10.apply(this,arguments);if(!r)window.DIFF='normal';
 try{capAll()}catch(e){}
 return r};
const _um10=updMenu;updMenu=function(){_um10.apply(this,arguments);if(!P)window.DIFF='normal';renderDiffBadges();permLine()};

// ---------- enemy / boss HP scaling (lazy, so every spawn path and respawn is covered) ----------
function scaleEnemies(){
 const D=cur();if(window.TUTON)return;
 for(const e of enemies){
  if(!e||e.tpoke||e.tdummy||!(e.max>0)||e.max>=1e8||(e.def&&e.def.noDie))continue;
  if(e.dsc!==e.max){                     // new enemy, or the game changed its max HP (e.g. the Avatar's transformation)
   if(D.hp!==1){const r=D.hp;e.max=Math.max(1,Math.round(e.max*r));if(e.hp>1)e.hp=Math.max(1,Math.round(e.hp*r))}
   e.dsc=e.max}}}
const _uf10=updFx;updFx=function(dt){if(P)scaleEnemies();return _uf10.apply(this,arguments)};

// ---------- damage taken / XP / echoes ----------
const _hp10=hurtPlayer;hurtPlayer=function(dmg,pd,from,br){
 const D=cur();
 if(P&&!window.TUTON&&D.dmg!==1&&dmg>0&&!(from&&from.def&&from.def.noDie))dmg*=D.dmg;
 return _hp10.call(this,dmg,pd,from,br)};
const _gx10=gainXp;gainXp=function(n){const D=cur();if(P&&D.xp!==1&&n>0)n=n*D.xp;return _gx10.call(this,n)};
{const _em=window.echoMult;window.echoMult=function(){const m=_em?_em.apply(this,arguments):1;return m*(P?cur().ec:1)}}

// ---------- HUD readout ----------
const _hud10=hud;hud=function(){_hud10.apply(this,arguments);
 let h=$('hDiff');if(!h){h=document.createElement('div');h.id='hDiff';const p=$('hPts');if(p&&p.parentNode)p.parentNode.appendChild(h);else return}
 const D=cur(),t=D.id==='normal'?'':'\u2620 '+D.n.toUpperCase();
 if(h.textContent!==t){h.textContent=t;h.style.color=D.c}};
const _sgo10=showGameOver;showGameOver=function(){_sgo10.apply(this,arguments);
 try{const D=cur();if(D.id!=='normal')$('goStats').insertAdjacentHTML('beforeend','<br><span style="color:'+D.c+'">Difficulty: '+D.n+'</span>')}catch(e){}};

// ---------- victory: badges + permanent stat bonuses ----------
const DK='ashfall_diffbadges_v1',PK_='ashfall_diffperm_v1';
let DBG={normal:0,hard:0,nightmare:0,purgatory:0},PERM={nightmare:0,purgatory:0};
try{const d=JSON.parse(localStorage.getItem(DK));if(d)DBG=Object.assign(DBG,d)}catch(e){}
try{const d=JSON.parse(localStorage.getItem(PK_));if(d)PERM=Object.assign(PERM,d)}catch(e){}
const saveD=()=>{try{localStorage.setItem(DK,JSON.stringify(DBG));localStorage.setItem(PK_,JSON.stringify(PERM))}catch(e){}};
const permF=()=>(PERM.nightmare?1.1:1)*(PERM.purgatory?1.1:1);

function renderDiffBadges(){
 const el=$('badges');if(!el)return;let row=$('dfBadges');
 if(!row){row=document.createElement('div');row.id='dfBadges';el.appendChild(row)}
 row.innerHTML='<div class="bd-h2">DIFFICULTIES CONQUERED</div><div class="bd-row">'+
  DIFFS.filter(d=>d.id!=='easy').map(d=>{const n=DBG[d.id]|0;
   return '<div class="bd-b d'+(n?' on':'')+'" style="--c:'+d.c+'" title="'+d.n+(n?' \u2014 won '+n+'\u00d7':' \u2014 not yet conquered')+'">'+d.ab+(n>1?'<i>'+n+'</i>':'')+'</div>'}).join('')+'</div>'}
function permLine(){
 if(!PERM.nightmare&&!PERM.purgatory)return;const e=$('echoes');if(!e)return;   // updMenu rewrites #echoes every call, so appending here never duplicates
 e.innerHTML=e.innerHTML+(PERM.nightmare?' &nbsp;\u00b7&nbsp; <span style="color:#ff6a6a">\u2620 Nightmare Conqueror +10%</span>':'')+(PERM.purgatory?' &nbsp;\u00b7&nbsp; <span style="color:#c06bff">\u2620 Purgatory Conqueror +10%</span>':'')}
{const w=$('win');if(w)w.addEventListener('click',e=>{
 if(!(e.target&&e.target.id==='winEnd')||!P||isDev())return;
 const D=cur();if(D.id==='easy')return;                       // easy: badges are invalid
 DBG[D.id]=(DBG[D.id]|0)+1;let msg='';
 if(D.perm&&!PERM[D.id]){PERM[D.id]=1;msg='\u2620 '+D.n+' conquered \u2014 all stats +10% permanently'}
 saveD();setTimeout(()=>{renderDiffBadges();try{if(msg)toast(msg)}catch(_){}},60)},true)}
// the victory panel tells the player what this difficulty grants (showWin is private to patch.js, so watch the panel instead)
{const w=$('win');if(w)new MutationObserver(()=>{
 if(w.classList.contains('hidden')||!P||w.querySelector('#dfWin'))return;
 const D=cur(),st=$('winStats');if(!st||D.id==='normal')return;
 st.insertAdjacentHTML('beforeend','<br><span id="dfWin" style="color:'+D.c+'">\u2620 '+D.n+' victory'+(D.id==='easy'?' \u2014 badges are invalid on Easy':D.perm?' \u2014 all stats +10% permanently'+(PERM[D.id]?' <small>(already owned)</small>':''):' \u2014 badge earned')+'</span>')
}).observe(w,{attributes:true,attributeFilter:['class']})}

// permanent Conqueror bonus (same maths as the Nameless Blessing in patch.js)
const _rc10=recalc;recalc=function(){_rc10.apply(this,arguments);
 if(typeof P==='undefined'||!P)return;const f=permF();if(f===1)return;
 const fort=P.at.fort,str=P.at.str,agi=P.at.agi;
 S.hp=Math.round((80+fort*10+S.hp)*f-80-fort*10);S.stam=Math.round((80+agi*15+S.stam)*f-80-agi*15);S.post=Math.round((60+fort*4+str*2+S.post)*f-60-fort*4-str*2);
 S.dmg=(1+str*.1+S.dmg)*f-1-str*.1;S.spd=(150+agi*3+S.spd)*f-150-agi*3;S.jump=(1+S.jump)*f-1;S.air=(1+S.air)*f-1;
 S.dodge=1-(1-S.dodge)/f;S.atkc=1-(1-S.atkc)/f;S.pdmg=(1+S.pdmg)*f-1;S.regen=(1+S.regen)*f-1;S.def=1-(1-(S.def||0))/f;
 P.hp=Math.min(P.hp,maxHp());P.stam=Math.min(P.stam,maxStam())};

// ---------- weapon damage cap for weapons that already exist in a save ----------
// Basic (rolled) weapons are capped at 30 base damage at Legendary, scaled by rarity below that.
// Boss weapons (unique), the Gale Odachi and the developer blade are never touched.
function capW(w){
 if(!w||w.type!=='weapon'||w.unique||w.dev||w.kind==='odachi'||w.kind==='icescythe')return;
 const ri=Math.max(0,Math.min(4,w.rar|0)),cap=Math.round(30*RAR[ri][2]/1.8);
 if(w.dmg>cap)w.dmg=cap}
function capAll(){if(typeof inv!=='undefined')inv.forEach(capW);if(P&&P.weapon)capW(P.weapon)}
setInterval(()=>{try{capAll()}catch(e){}},2000);

renderDiffBadges();
})();
