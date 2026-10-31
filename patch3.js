'use strict';
// ===== Ashfall Depths: Patch 3 (load AFTER patch2.js) =====
// echo modifiers (pick before a run) · menu badges · more echo upgrades & passives (everything 3x price)
// flashier Tempest / Hollow King / Nameless Deity attack effects · Nameless Deity arena redone in the Deity's own palette
(()=>{
const $=id=>document.getElementById(id);
const clamp01=v=>Math.max(0,Math.min(1,v)),TAU=6.2832,rr=Math.random;

// ---------- styles ----------
{const s=document.createElement('style');s.textContent=`
#modsel{max-width:760px;width:94vw;z-index:30}
#modsel h1{font-size:28px}
.ms-tot{color:#ffe08a;margin:-6px 0 12px;font-size:15px;letter-spacing:2px}.ms-tot b{font-size:20px;color:#9fe}
.modgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;text-align:left}
.modcard{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;background:#ffffff08;border:1px solid #3a2a14;border-left:4px solid var(--c);cursor:pointer;transition:background .12s}
.modcard:hover{background:#ffffff14}
.modcard.on{background:linear-gradient(90deg,#3a2a1a,#22180f);border-color:var(--c);box-shadow:0 0 12px -2px var(--c)}
.mc-ab{flex:none;width:34px;height:34px;border-radius:6px;display:grid;place-items:center;font-size:12px;font-weight:700;color:var(--c);border:1px solid var(--c);background:#0d0914}
.modcard.on .mc-ab{background:var(--c);color:#0d0914}
.mc-t b{color:#f0e2c4;letter-spacing:1px}.mc-t em{color:#9fe;font-style:normal;font-size:12px;margin-left:4px}.mc-t small{color:#a89a84;line-height:1.35;display:block;margin-top:2px}
.ms-btns{margin-top:14px}
@media(max-width:700px){.modgrid{grid-template-columns:1fr}}
#badges{margin:4px 0 12px;padding:8px 4px 6px;border-top:1px solid #3a2a14;border-bottom:1px solid #3a2a14}
.bd-h{font-size:11px;letter-spacing:5px;color:#a8957a;margin:2px 0 6px}
.bd-h2{font-size:10px;letter-spacing:3px;color:#8a7c68;margin:8px 0 4px}
.bd-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:2px 0}
.bd-b{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:22px;border:2px solid #3a2a34;background:radial-gradient(#241a30,#0d0914);color:#4a4056;position:relative;cursor:default}
.bd-b.on{border-color:var(--c);color:var(--c);box-shadow:0 0 12px -1px var(--c),inset 0 0 8px #000;background:radial-gradient(#3a2a4a,#120d1a);text-shadow:0 0 8px var(--c)}
.bd-b i{position:absolute;right:-5px;bottom:-4px;font-size:9px;font-style:normal;background:#000;border:1px solid var(--c);border-radius:8px;padding:0 4px;color:#fff;line-height:13px}
.bd-b.m{width:34px;height:34px;border-radius:7px;font-size:11px;font-weight:700;letter-spacing:0}
.bd-sub{font-size:11px;color:#8a7c68;margin-top:6px;letter-spacing:1px}.bd-sub b{color:#ffe08a}
#hMod{font-size:11px;color:#ffd36b;letter-spacing:1px;text-shadow:0 1px 3px #000}
.wp-h{font-size:11px;letter-spacing:4px;color:#a8957a;margin:0 0 6px;text-align:center}
.wp-row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.wp-c{padding:5px 11px;border:1px solid #3a2a14;background:#ffffff08;cursor:pointer;font-size:12px;letter-spacing:1px;color:#d8c8a8}
.wp-c:hover{background:#ffffff14}
.wp-c.on{border-color:var(--gold);color:var(--gold);background:linear-gradient(90deg,#3a2a1a,#22180f);box-shadow:0 0 10px -2px var(--gold)}
.wp-d{font-size:12px;color:#9fe;text-align:center;margin:6px 0 14px;min-height:16px}`;document.head.appendChild(s)}

// ======================================================================
// ECHO MODIFIERS
// ======================================================================
const MODS=[
 {id:'fragile',n:'Fragile Heart',ab:'FH',e:.5,d:'All incoming mob damage is doubled.'},
 {id:'slowburn',n:'Slowburn',ab:'SB',e:.1,d:'All incoming healing is heavily reduced.'},
 {id:'dealbreaker',n:'Dealbreaker',ab:'DB',e:.35,d:'You sell items for 25% less; buying, enchanting and upgrading cost 25% more.'},
 {id:'normaldude',n:'Normaldude',ab:'ND',e:.05,d:'You are unable to use spells.'},
 {id:'crestfallen',n:'Crestfallen',ab:'CF',e:.35,d:'Armor stats are halved.'},
 {id:'hardcore',n:'Hardcore',ab:'HC',e:1,d:'You only have one life.'},
 {id:'destined',n:'Destined',ab:'DS',e:.5,d:'You cannot choose your stats \u2014 points are spent at random instead.'},
 {id:'gari',n:'Gari',ab:'GA',e:1,d:'Enemies and bosses gain lifesteal, and you deal 50% less damage.'},
 {id:'choiatsm',n:'Choiatsm',ab:'CH',e:.5,d:'Stamina regeneration is halved.'},
 {id:'poke',n:'Poke',ab:'PK',e:.5,d:'The lower your HP, the more damage you take (up to double).'},
 {id:'sonya',n:'Sonya',ab:'SO',e:.25,d:'You are unable to parry.'},
 {id:'fish',n:'Fish',ab:'FI',e:5,d:'You are set to 1 HP.'},
 {id:'worried',n:'Worried',ab:'WO',e:.2,d:'You take 50% more damage in the Ember layer, boss included.'},
 {id:'jdong',n:'Jdong',ab:'JD',e:.35,d:'You take 20 damage every 60 seconds.'}];
const MODB={};MODS.forEach((m,i)=>{m.c='hsl('+(i*26+8)+',72%,62%)';MODB[m.id]=m});
const RUN={mods:[],wpn:'random'},has=id=>RUN.mods.includes(id);
const echoMult=()=>1+RUN.mods.reduce((s,id)=>s+(MODB[id]?MODB[id].e:0),0);
window.echoMult=echoMult;
let lHp=-1,lLv=-1,JD=60,MN=8;

// ---- data-level effects (prices, armor) ----
function applyMods(){
 window.FISH=has('fish');window.NOSPELL=has('normaldude');
 const pm=has('dealbreaker')?1.25:1;window.PRICEM=pm;window.SELLM=has('dealbreaker')?.75:1;
 ELX_PRICE=Math.round(200*pm);ENCH_PRICE=Math.round(500*pm);
 for(const a of ACC){if(a.p0==null)a.p0=a.price;a.price=Math.round(a.p0*pm)}
 for(const a of ARMS){if(a.p0==null)a.p0=a.price;a.price=Math.round(a.p0*pm)}
 if(window.SPD_)for(const s of window.SPD_){if(s.g0==null)s.g0=s.g;s.g=Math.round(s.g0*pm)}
 const half=has('crestfallen');
 for(const a of ARMS){if(a.d0==null)a.d0=a.def;a.def=half?+(a.d0*.5).toFixed(3):a.d0}
 ASET.forEach(s=>{if(!s.fx0){s.fx0=Object.assign({},s.fx);s.bn0=Object.assign({},s.bn||{})}
  for(const k in s.fx)s.fx[k]=s.fx0[k]*(half?.5:1);if(s.bn)for(const k in s.bn)s.bn[k]=s.bn0[k]*(half?.5:1)});
 if(typeof P!=='undefined'&&P)recalc()}
window.dmgMult=()=>{if(!P)return 1;let m=1;const U=meta.up;if(has('gari'))m*=.5;
 if(U.laststand&&P.hp<maxHp()*.3)m*=1+[0,.12,.2,.28][U.laststand];
 if(U.momentum)m*=1+(P.mom||0)*[0,.02,.03,.04][U.momentum];return m};

// ---- recalc: modifiers + new echo stats ----
const _rcE=recalc;recalc=function(){_rcE();if(typeof P==='undefined'||!P)return;const U=meta.up;
 S.post+=(U.stalwart||0)*8;S.dodge=Math.min(.5,(S.dodge||0)+.04*(U.lightfoot||0));S.atkc=Math.min(.5,(S.atkc||0)+.05*(U.quick||0));
 if(has('choiatsm'))S.regen=(1+(S.regen||0))*.5-1;
 if(has('sonya'))S.parry=-9;
 P.hp=Math.min(P.hp,maxHp());P.stam=Math.min(P.stam,maxStam())};

// ---- damage taken: modifiers + echo passives ----
const _hpE=hurtPlayer;hurtPlayer=function(dmg,pd,from,br){
 if(!P)return _hpE(dmg,pd,from,br);
 const U=meta.up;let m=1;
 if(has('fragile'))m*=2;
 if(has('poke'))m*=1+(1-clamp01(P.hp/Math.max(1,maxHp())));
 if(has('worried')&&(layerAt(P.y/T|0)===1||(from&&from.id==='ember')))m*=1.5;
 if(U.laststand&&P.hp<maxHp()*.3)m*=1-[0,.12,.2,.28][U.laststand];
 const hp0=P.hp,r=_hpE(dmg*m,pd,from,br),lost=hp0-P.hp;
 if(lost>0){P.mom=0;
  if(has('gari')&&from&&from.max&&!from.dead){from.hp=Math.min(from.max,from.hp+lost*(from.boss?.4:.75));float(from.x,from.y-10,'+'+Math.round(lost*.5),'#f66')}
  if(U.thorns&&from&&from.max&&from.hp>1&&!from.dead){const rf=lost*[0,.25,.4,.6][U.thorns]*(from.boss?.25:1);
   if(!(from.boss&&['dormant','intro','phase','dying'].includes(from.st))){from.hp=Math.max(1,from.hp-rf);float(from.x,from.y-20,'THORNS','#c8f');burst(from.x+(from.w||14)/2,from.y+(from.h||22)/2,5,'#c8f')}}}
 if(r==='block'&&U.bastion)P.stam=Math.min(maxStam(),P.stam+[0,4,7,10][U.bastion]);
 return r};
const _heE=hitEnemy;hitEnemy=function(e){_heE(e);if(P&&meta.up.momentum)P.mom=Math.min(6,(P.mom||0)+1)};
const _tdE=tryDodge;tryDodge=function(){const was=P?P.dodge:0;_tdE();if(P&&was<=0&&P.dodge>0&&meta.up.phantom)P.inv=Math.max(P.inv,.25+[0,.12,.22,.32][meta.up.phantom])};
const gw=f=>function(){const g0=gold,r=f.apply(this,arguments),l=meta.up.fortune|0;if(l&&gold>g0)gold+=Math.round((gold-g0)*.06*l);return r};
dropLoot=gw(dropLoot);openChest=gw(openChest);
const _gxE=gainXp;gainXp=function(n){_gxE(n);if(P&&has('hardcore')&&P.lives>1)P.lives=1};

// ---- per-step upkeep: slowburn, jdong, destined, mender ----
function assignRandom(){let n=0;while(P.pts>0){const k=['str','agi','fort'][rr()*3|0];P.pts--;P.at[k]++;n++}if(n){recalc();toast('\u2726 Destined \u2014 fate spent '+n+' stat point'+(n>1?'s':'')+' for you')}}
const _ufE=updFx;updFx=function(dt){_ufE(dt);if(!P||P.dead||paused)return;
 if(has('jdong')&&!(window.DEVON&&window.DEVON())){JD-=dt;if(JD<=0){JD=60;P.hp-=20;float(P.x,P.y-12,'-20','#f66');shake=Math.max(shake,5);sfx.hit();burst(P.x+6,P.y+10,10,'#f55');if(P.hp<=0)die()}}
 if(has('destined')&&P.pts>0)assignRandom();
 if(meta.up.mender){MN-=dt;if(MN<=0){MN=8;if(P.hp<maxHp()){P.hp=Math.min(maxHp(),P.hp+maxHp()*[0,.015,.025,.035][meta.up.mender]);float(P.x,P.y-14,'MENDED','#9fe')}}}
 if(P.dead){lHp=-1;return}
 if(has('slowburn')&&lHp>=0&&P.lives>=lLv&&P.hp>lHp)P.hp=lHp+(P.hp-lHp)*.25;
 lHp=P.hp;lLv=P.lives};
const _dsE=drawSheet;drawSheet=function(){_dsE();if(has('destined')){sheet.querySelectorAll('[data-a]').forEach(b=>b.disabled=true);const h=sheet.querySelector('h1');if(h)h.insertAdjacentHTML('afterend','<div style="color:#c8a0ff;font-size:12px">Destined \u2014 stat points are assigned at random</div>')}};

// ---- echo upgrades: more stats + passives, ALL prices tripled ----
Object.assign(U0,{stalwart:0,lightfoot:0,quick:0,hardy:0,fortune:0,laststand:0,momentum:0,bastion:0,mender:0,phantom:0,thorns:0});
for(const k in U0)if(meta.up[k]==null)meta.up[k]=0;
UPG.push(['stalwart','Stalwart','+8 max posture',8,45],['lightfoot','Light Foot','-4% dash stamina cost',6,40],['quick','Quick Hands','-5% attack stamina cost',6,45],
 ['hardy','Hardy Flask','+1 starting Health Elixir',3,70],['fortune','Gold Sense','+6% gold from kills & chests',8,50],
 ['laststand','\u2726 Last Stand','Passive: below 30% HP take 12% / 20% / 28% less damage and deal 12% / 20% / 28% more',3,290,1],
 ['momentum','\u2726 Momentum','Passive: each hit you land without being hit grants +2% / 3% / 4% damage (max 6 stacks)',3,270,1],
 ['bastion','\u2726 Bastion','Passive: every blocked hit restores 4 / 7 / 10 stamina',3,230,1],
 ['mender','\u2726 Mender\u2019s Grace','Passive: regain 1.5% / 2.5% / 3.5% max HP every 8 seconds',3,300,1],
 ['phantom','\u2726 Phantom Step','Passive: dashing grants +0.12s / +0.22s / +0.32s of extra invulnerability',3,250,1],
 ['thorns','\u2726 Thornmail','Passive: enemies that hurt you take 25% / 40% / 60% of that damage back (never lethal to bosses)',3,260,1]);
for(const u of UPG)u[4]=Math.round(u[4]*3);      // everything costs 3x

// ======================================================================
// BADGES (main menu)
// ======================================================================
const BK='ashfall_badges_v1';let BADG={boss:{},win:{},best:0};
try{const d=JSON.parse(localStorage.getItem(BK));if(d)BADG=Object.assign(BADG,d)}catch(e){}BADG.boss=BADG.boss||{};BADG.win=BADG.win||{};
const isDev=()=>!!(window.DEVON&&window.DEVON());
const saveBadges=()=>{try{localStorage.setItem(BK,JSON.stringify(BADG))}catch(e){}};
const BOSSB=[['ember','Ember Tyrant','\u2739','#ff8a2a'],['glacial','Glacial Devourer','\u2744','#8fd8ff'],['tempest','Tempest Dragon','\u26a1','#ffe84a'],['hollow','Hollow King','\u265b','#b48aff'],['deity','Nameless Deity','\u2726','#f4f1ea'],['avatar','Avatar of Emptiness','\u2740','#ff2a46']];
{const bd=document.createElement('div');bd.id='badges';$('menu').insertBefore(bd,$('btnContinue'))}
function renderBadges(){const el=$('badges');if(!el)return;
 el.innerHTML='<div class="bd-h">BADGES</div><div class="bd-row">'+BOSSB.map(b=>{const n=BADG.boss[b[0]]|0;if(b[0]==='avatar'&&!n)return '';return '<div class="bd-b'+(n?' on':'')+'" style="--c:'+b[3]+'" title="'+(n?b[1]+' \u2014 slain '+n+'\u00d7':'???')+'">'+(n?b[2]:'?')+(n>1?'<i>'+n+'</i>':'')+'</div>'}).join('')+'</div>'+
 '<div class="bd-h2">ECHO MODIFIERS CONQUERED</div><div class="bd-row">'+MODS.map(m=>{const n=BADG.win[m.id]|0;return '<div class="bd-b m'+(n?' on':'')+'" style="--c:'+m.c+'" title="'+m.n+(n?' \u2014 won '+n+'\u00d7':' \u2014 not yet conquered')+'">'+m.ab+(n>1?'<i>'+n+'</i>':'')+'</div>'}).join('')+'</div>'+
 '<div class="bd-sub">Victories <b>'+(BADG.win.total|0)+'</b>'+(BADG.win.none?' \u00b7 clean <b>'+BADG.win.none+'</b>':'')+(BADG.best>1?' \u00b7 best multiplier <b>\u00d7'+BADG.best.toFixed(2)+'</b>':'')+'</div>'}
window.__badgeBoss=k=>{if(isDev())return;BADG.boss[k]=(BADG.boss[k]|0)+1;saveBadges();renderBadges()};const _fbB=finishBoss;finishBoss=function(B){_fbB(B);if(B&&B.id&&!isDev()){BADG.boss[B.id]=(BADG.boss[B.id]|0)+1;saveBadges();renderBadges()}};
{const w=$('win');if(w)w.addEventListener('click',e=>{if(e.target&&e.target.id==='winEnd'&&P&&!isDev()){BADG.win.total=(BADG.win.total|0)+1;
 if(!RUN.mods.length)BADG.win.none=(BADG.win.none|0)+1;for(const id of RUN.mods)BADG.win[id]=(BADG.win[id]|0)+1;BADG.best=Math.max(BADG.best||0,echoMult());saveBadges()}},true)}

// ======================================================================
// PICKER + RUN START / LOAD / END
// ======================================================================
function openPicker(cb){let el=$('modsel');if(!el){el=document.createElement('div');el.id='modsel';el.className='panel hidden';document.body.appendChild(el)}
 let last=[];try{last=JSON.parse(localStorage.getItem('ashfall_lastmods'))||[]}catch(e){}const sel=new Set(last.filter(id=>MODB[id]));
 let wpn='random';try{const w=localStorage.getItem('ashfall_lastwpn');if(w&&(w==='random'||WK[w]))wpn=w}catch(e){}
 const wpnName=k=>k==='random'?'Random':k[0].toUpperCase()+k.slice(1);
 const wpnHTML=()=>{const ks=['random'].concat(KINDS.filter(k=>WK[k]&&WK[k].names&&WK[k].names.length));if(!ks.includes(wpn))wpn='random';
  const info=wpn==='random'?'A random Common weapon, as usual.':'Common '+WK[wpn].names[0]+' \u00b7 '+Math.round(9.5*WK[wpn].dm)+' base dmg'+(window.weaponPassive?' \u00b7 \u2726 '+window.weaponPassive({kind:wpn,rar:0}):'');
  return '<div class="wp-h">STARTING WEAPON</div><div class="wp-row">'+ks.map(k=>'<span class="wp-c'+(k===wpn?' on':'')+'" data-w="'+k+'">'+wpnName(k)+'</span>').join('')+'</div><div class="wp-d">'+info+'</div>'};
 const draw=()=>{const st=el.scrollTop,tot=[...sel].reduce((s,id)=>s+MODB[id].e,1);
  el.innerHTML='<div class="rune">\u2756</div><h1>ECHO MODIFIERS</h1><h2>A harder descent pays more echoes</h2><div class="ms-tot">Echo multiplier <b>\u00d7'+tot.toFixed(2)+'</b> <small>('+sel.size+' active)</small></div>'+wpnHTML()+'<div class="modgrid">'+
   MODS.map(m=>'<div class="modcard'+(sel.has(m.id)?' on':'')+'" data-m="'+m.id+'" style="--c:'+m.c+'"><span class="mc-ab">'+m.ab+'</span><span class="mc-t"><b>'+m.n+'</b><em>+'+Math.round(m.e*100)+'% echoes</em><small>'+m.d+'</small></span></div>').join('')+
   '</div><div class="ms-btns"><button id="msGo">Begin Descent</button><button id="msClr">Clear all</button><button id="msBack">Back</button></div>';
  el.scrollTop=st;
  el.querySelectorAll('[data-m]').forEach(c=>c.onclick=()=>{const id=c.dataset.m;sel.has(id)?sel.delete(id):sel.add(id);draw()});
  el.querySelectorAll('[data-w]').forEach(c=>c.onclick=()=>{wpn=c.dataset.w;draw()});
  $('msGo').onclick=()=>{el.classList.add('hidden');try{localStorage.setItem('ashfall_lastwpn',wpn)}catch(e){}cb([...sel],wpn)};$('msClr').onclick=()=>{sel.clear();draw()};
  $('msBack').onclick=()=>{el.classList.add('hidden');$('menu').classList.remove('hidden')}};
 $('menu').classList.add('hidden');$('gameover').classList.add('hidden');el.classList.remove('hidden');draw()}
let BY=false;const _s0=start;
start=function(n){if(n&&!BY){openPicker((sel,wk)=>{RUN.mods=sel.slice();RUN.wpn=wk||'random';try{localStorage.setItem('ashfall_lastmods',JSON.stringify(RUN.mods))}catch(e){}applyMods();
  BY=true;try{_s0(true)}finally{BY=false}postStart()});return}return _s0(n)};
function giveStartWeapon(){const k=RUN.wpn;if(!k||k==='random'||!WK[k]||!WK[k].names||!WK[k].names.length)return;const K=WK[k];
 P.weapon={id:uid++,type:'weapon',kind:k,name:'Common '+K.names[rr()*K.names.length|0],rar:0,dmg:Math.round(9.5*K.dm),speed:1}}
function postStart(){if(!P)return;lHp=-1;lLv=-1;JD=60;MN=8;P.mom=0;giveStartWeapon();
 if(meta.up.hardy)P.el=Math.min(ELX_MAX,(P.el|0)+meta.up.hardy);
 if(has('hardcore'))P.lives=1;
 if(has('destined'))assignRandom();
 recalc();P.hp=maxHp();P.stam=maxStam();save();toast(RUN.mods.length?'Modifiers active \u00b7 echoes \u00d7'+echoMult().toFixed(2):'')}
const _svE=save;save=function(){_svE();if(!P)return;try{const d=JSON.parse(localStorage.getItem(SAVEKEY));if(d){d.runmods=RUN.mods;d.jd=JD;localStorage.setItem(SAVEKEY,JSON.stringify(d))}}catch(e){}};
const _ldE=load;load=function(){let d=null;try{d=JSON.parse(localStorage.getItem(SAVEKEY))}catch(e){}
 RUN.mods=(d&&Array.isArray(d.runmods))?d.runmods.filter(id=>MODB[id]):[];applyMods();
 const r=_ldE();if(!r){RUN.mods=[];applyMods();return r}
 lHp=-1;lLv=-1;JD=(d&&d.jd)||60;MN=8;P.mom=0;if(has('hardcore'))P.lives=Math.min(P.lives,1);recalc();P.hp=Math.min(P.hp,maxHp());return r};
const _umE=updMenu;updMenu=function(){_umE();if(!P&&RUN.mods.length){RUN.mods=[];applyMods()}renderBadges()};
const _sgE=showGameOver;showGameOver=function(o){_sgE(o);if(RUN.mods.length)$('goStats').insertAdjacentHTML('beforeend','<br><span style="color:#c8a0ff">Modifiers: '+RUN.mods.map(id=>MODB[id].n).join(', ')+'</span> \u00b7 echoes <b>\u00d7'+echoMult().toFixed(2)+'</b>')};
// small modifier readout under the HUD
const _hudE=hud;hud=function(){_hudE();let hm=$('hMod');if(!hm){hm=document.createElement('div');hm.id='hMod';$('hPts').parentNode.appendChild(hm)}
 const t=RUN.mods.length?RUN.mods.map(id=>MODB[id].ab).join(' ')+' \u00b7 \u00d7'+echoMult().toFixed(2)+(has('jdong')?' \u00b7 \u2620 '+Math.ceil(JD)+'s':''):'';if(hm.textContent!==t)hm.textContent=t};
applyMods();renderBadges();

// ======================================================================
// FLASHIER (BUT SUBTLE) ATTACK EFFECTS: Tempest Dragon · Hollow King · Nameless Deity
// ======================================================================
let FL={a:0,c:'255,255,255'},EG={a:0,c:'255,255,255'};
const flash=(c,a)=>{if(a>FL.a){FL.a=a;FL.c=c}},edge=(c,a)=>{if(a>EG.a){EG.a=a;EG.c=c}};
function zig(x1,y1,x2,y2,n,j){const p=[x1,y1];for(let i=1;i<n;i++){const u=i/n;p.push(x1+(x2-x1)*u+(rr()-.5)*2*j,y1+(y2-y1)*u+(rr()-.5)*j*.4)}p.push(x2,y2);return p}
const strokeP=(p,col,lw)=>{cx.strokeStyle=col;cx.lineWidth=lw;cx.lineJoin='round';cx.beginPath();cx.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)cx.lineTo(p[i],p[i+1]);cx.stroke()};
const gring=(x,y,r,col,lw,sy)=>{cx.save();cx.translate(x,y);cx.scale(1,sy||.22);cx.strokeStyle=col;cx.lineWidth=lw;cx.beginPath();cx.arc(0,0,Math.max(1,r),0,TAU);cx.stroke();cx.restore()};
const shard=(x,y,s,rot,col)=>{cx.save();cx.translate(x,y);cx.rotate(rot);cx.fillStyle=col;cx.beginPath();cx.moveTo(-s,-s*.5);cx.lineTo(s,-s*.2);cx.lineTo(s*.2,s*.9);cx.closePath();cx.fill();cx.restore()};

function zoneFx(z,ox,oy){const c=z.col,kind=c==='255,255,120'?1:c==='170,120,255'?2:c==='70,120,235'?3:0;if(!kind)return;
 const sx=z.x-ox,y0=z.y0-oy,y1=z.y1-oy,w=z.w,hh=y1-y0,tt=time;if(sx<-90||sx>cv.width+90||y1<-30||y0>cv.height+30)return;
 if(z.t>0){const k=1-z.t/z.t0;
  if(kind===1){AD(()=>{gring(sx,y1,w*.8+(1-k)*26,'rgba(255,255,170,'+(.25+.5*k)+')',3);gring(sx,y1,w*.4+(1-k)*14,'rgba(150,200,255,'+(.2+.5*k)+')',2);
    if(rr()<.5+.4*k)strokeP(zig(sx,y0,sx+(rr()-.5)*18,y0+16+k*42,4,6),'rgba(255,255,200,'+(.35+.4*k)+')',1.2);
    if(rr()<.35){cx.fillStyle='rgba(255,255,210,.9)';cx.fillRect(sx+(rr()-.5)*w,y1-rr()*12,1.5,1.5)}})}
  else if(kind===2){AD(()=>{const R=w*.95;cx.save();cx.translate(sx,y1);cx.scale(1,.22);cx.strokeStyle='rgba(190,140,255,'+(.25+.5*k)+')';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,R,0,TAU);cx.stroke();
    cx.lineWidth=2;for(let i=0;i<8;i++){const an=i*TAU/8+tt*1.6;cx.beginPath();cx.moveTo(Math.cos(an)*R*.55,Math.sin(an)*R*.55);cx.lineTo(Math.cos(an)*R*1.12,Math.sin(an)*R*1.12);cx.stroke()}
    cx.rotate(-tt*.8);cx.beginPath();for(let i=0;i<=6;i++){const an=i*TAU/6;cx.lineTo(Math.cos(an)*R*.5,Math.sin(an)*R*.5)}cx.stroke();cx.restore();
    for(let i=0;i<3;i++){const yy=y1-((tt*70+i*50)%Math.max(40,hh));cx.fillStyle='rgba(190,140,255,'+(.35*k)+')';cx.fillRect(sx+Math.sin(tt*4+i*2)*w*.3-1,yy,2,8)}})}
  else{cx.save();cx.translate(sx,y1);cx.scale(1,.22);const R=w*.95;cx.strokeStyle='rgba(11,11,13,'+(.35+.4*k)+')';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,R,0,TAU);cx.stroke();
    cx.strokeStyle='rgba(90,150,255,'+(.4+.5*k)+')';cx.lineWidth=1.6;cx.beginPath();cx.arc(0,0,R+4,0,TAU);cx.stroke();
    for(let i=0;i<12;i++){const an=i*TAU/12-1.57,r2=R+(i%3?1:6);cx.strokeStyle='rgba(11,11,13,.8)';cx.lineWidth=1.6;cx.beginPath();cx.moveTo(Math.cos(an)*(R-4),Math.sin(an)*(R-4));cx.lineTo(Math.cos(an)*r2,Math.sin(an)*r2);cx.stroke()}
    const ha=-1.57+k*TAU;cx.strokeStyle='#0b0b0d';cx.lineWidth=2.4;cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(ha)*R,Math.sin(ha)*R);cx.stroke();cx.restore();
    for(let i=0;i<4;i++){const yy=y0+((tt*90+i*55)%Math.max(30,hh));shard(sx+Math.sin(i*4+tt*3)*w*.35,yy,2.2,tt*4+i,i%2?'rgba(11,11,13,.7)':'rgba(240,238,230,.9)')}}
 }else{const a=clamp01(z.a/.3);
  if(kind===1){AD(()=>{const bp=zig(sx,y0,sx,y1,9,11*a+3);strokeP(bp,'rgba(110,160,255,'+.55*a+')',6);strokeP(bp,'rgba(255,255,225,'+a+')',2.2);
    strokeP(zig(sx,y0+hh*.3,sx+(rr()<.5?-1:1)*30,y0+hh*.62,4,6),'rgba(255,255,200,'+.7*a+')',1.2);gring(sx,y1,(1-a)*76+8,'rgba(255,255,170,'+.85*a+')',5);glow(sx,y1-4,36*a+10,'rgba(255,255,200,'+.5*a+')')});
    flash('255,255,200',.06*a);
    if(!z.fx){z.fx=1;for(let i=0;i<9;i++)parts.push({x:z.x+(rr()-.5)*w,y:z.y1-2,vx:(rr()-.5)*170,vy:-60-rr()*150,l:.45,c:i%2?'#ffe':'#8cf'})}}
  else if(kind===2){const n=Math.max(3,Math.round(w/9)),g=Math.min(1,(1.15-a)*2.4);
    for(let i=0;i<n;i++){const bx=sx-w/2+(i+.5)*w/n,hs=(26+((i*53)%34))*g;PL([bx-4,y1,bx,y1-hs,bx+4,y1],'rgba(8,0,18,'+(.55+.4*a)+')');strokeP([bx-4,y1,bx,y1-hs,bx+4,y1],'rgba(190,140,255,'+.8*a+')',1)}
    AD(()=>{gring(sx,y1,a*(w*1.3)+6,'rgba(190,140,255,'+.7*a+')',4);glow(sx,y1-6,34*a+8,'rgba(160,90,255,'+.4*a+')');
      for(let i=0;i<8;i++){const an=i*.785+tt*3,r=a*52+4;cx.fillStyle='rgba(215,180,255,'+a+')';cx.fillRect(sx+Math.cos(an)*r-1,y1-6+Math.sin(an)*r*.3-1,2,2)}});
    flash('150,90,255',.05*a);
    if(!z.fx){z.fx=1;for(let i=0;i<7;i++)parts.push({x:z.x+(rr()-.5)*w,y:z.y1-4,vx:(rr()-.5)*40,vy:-50-rr()*90,l:.7,c:i%2?'#b48aff':'#2a1048'})}}
  else{AD(()=>{cx.fillStyle='rgba(255,255,255,'+.34*a+')';cx.fillRect(sx-w*.28,y0,w*.56,hh);cx.fillStyle='rgba(120,170,255,'+.22*a+')';cx.fillRect(sx-w*.5,y0,w,hh);gring(sx,y1,(1-a)*70+10,'rgba(120,170,255,'+.9*a+')',4);glow(sx,y1-6,32*a+8,'rgba(255,255,255,'+.5*a+')')});
    FR(sx-w/2,y0,1.5,hh,'rgba(11,11,13,'+.85*a+')');FR(sx+w/2-1.5,y0,1.5,hh,'rgba(11,11,13,'+.85*a+')');
    for(let i=0;i<6;i++){const yy=y1-((tt*150+i*60)%Math.max(30,hh));cx.fillStyle='rgba(11,11,13,'+.55*a+')';cx.fillRect(sx+Math.sin(i*5+tt*6)*w*.3,yy,2,2)}
    flash('200,225,255',.05*a);
    if(!z.fx){z.fx=1;for(let i=0;i<10;i++)parts.push({x:z.x+(rr()-.5)*w,y:z.y1-4,vx:(rr()-.5)*200,vy:-80-rr()*140,l:.6,c:i%2?'#0b0b0d':'#f0eee6'})}}}}

function projFx(p,ox,oy){const c=p.col||'';let k=0;
 if(c.indexOf('255,244,120')>0||c.indexOf('255,255,120')>0)k=1;else if(c.indexOf('170,120,255')>0)k=2;else if(c.indexOf('70,120,235')>0)k=3;else if(c==='rgb(25,25,35)')k=4;if(!k)return;
 const X=p.x-ox,Y=p.y-oy;if(X<-30||X>cv.width+30||Y<-30||Y>cv.height+30)return;const r=p.r+3,sp=Math.hypot(p.vx,p.vy)||1,nx=p.vx/sp,ny=p.vy/sp,tt=time;
 if(k===1){AD(()=>{strokeP(zig(X,Y,X+(rr()-.5)*r*5,Y+(rr()-.5)*r*5,3,4),'rgba(255,255,215,.8)',1);if(rr()<.5)strokeP(zig(X,Y,X-nx*r*5+(rr()-.5)*8,Y-ny*r*5+(rr()-.5)*8,3,4),'rgba(130,180,255,.7)',1)});if(rr()<.12)parts.push({x:p.x,y:p.y,vx:(rr()-.5)*50,vy:(rr()-.5)*50,l:.25,c:'#ffe'})}
 else if(k===2){cx.save();cx.translate(X,Y);cx.rotate(tt*5);cx.strokeStyle='rgba(215,180,255,.8)';cx.lineWidth=1;cx.setLineDash([3,3]);cx.beginPath();cx.arc(0,0,r+3,0,TAU);cx.stroke();cx.setLineDash([]);cx.restore();
  cx.fillStyle='rgba(12,0,26,.85)';cx.beginPath();cx.arc(X,Y,r*.55,0,TAU);cx.fill();if(rr()<.2)parts.push({x:p.x-nx*4,y:p.y-ny*4,vx:(rr()-.5)*20,vy:-10-rr()*20,l:.5,c:'#3a1a68'})}
 else{for(let i=1;i<=4;i++){const q=1-i/5;shard(X-nx*i*6+Math.sin(tt*8+i)*1.5,Y-ny*i*6,r*.7,tt*9+i*1.7,(i%2?'rgba(11,11,13,':'rgba(245,242,234,')+q*.85+')')}
  AD(()=>{cx.strokeStyle=k===3?'rgba(150,200,255,.8)':'rgba(255,255,255,.7)';cx.lineWidth=1;cx.beginPath();cx.arc(X,Y,r+2+Math.sin(tt*12)*1,0,TAU);cx.stroke()})}}

function bossFx(B,ox,oy){if(B.av)return;const id=B.id;if(id!=='tempest'&&id!=='hollow'&&id!=='deity')return;if(B.dead||(B.st!=='tele'&&B.st!=='act'))return;
 const bx=B.x+B.w/2-ox,by=B.y+B.h/2-oy,tt=time,A=AT[B.atk];if(bx<-200||bx>cv.width+200)return;
 const p=B.st==='tele'?clamp01(1-B.t/(B.twu||1)):1,q=B.st==='act'&&A?clamp01(1-B.t/A.act):0,fy=(B.ar?B.ar.fy*T:B.y+B.h)-oy;
 if(id==='tempest'){
  if(B.st==='tele'){AD(()=>{for(let i=0;i<12;i++){const an=i*TAU/12+tt*2.4,r=(1-p)*120+16+Math.sin(tt*9+i)*3;cx.fillStyle='rgba(255,255,190,'+(.35+.5*p)+')';cx.fillRect(bx+Math.cos(an)*r-1,by+Math.sin(an)*r*.7-1,2,2)}
    if(rr()<.55)strokeP(zig(bx+(rr()-.5)*30,by+(rr()-.5)*14,bx+(rr()-.5)*150,by+(rr()-.5)*90,4,12),'rgba(190,225,255,.8)',1.2);glow(bx,by,30+p*40,'rgba(255,255,170,'+.25*p+')')});edge('255,240,120',.05+.07*p)}
  else{AD(()=>{for(let k=0;k<2;k++){const r=clamp01(q+k*.12)*170;cx.strokeStyle='rgba(255,255,190,'+(.5*(1-q))+')';cx.lineWidth=2;cx.beginPath();cx.ellipse(bx,by,r,r*.6,0,0,TAU);cx.stroke()}
    if(q<.3&&rr()<.45)strokeP(zig(bx,by,bx+(rr()-.5)*320,fy,6,16),'rgba(255,255,215,.85)',1.6)});edge('255,240,120',.05*(1-q))}}
 else if(id==='hollow'){
  if(B.st==='tele'){AD(()=>{for(let j=0;j<3;j++)for(let i=0;i<8;i++){const an=tt*2+i*.5+j*2.09,r=(1-p)*90*(1-i/10)+10+i*5;cx.fillStyle='rgba(190,140,255,'+(.25+.5*p)*(1-i/9)+')';cx.fillRect(bx+Math.cos(an)*r-1,by+Math.sin(an)*r*.8-1,2,2)}
    gring(bx,by+B.h/2,(1-p)*80+12,'rgba(160,100,255,'+(.2+.5*p)+')',3);glow(bx,by,26+p*30,'rgba(150,90,255,'+.25*p+')')});edge('120,60,220',.05+.08*p)}
  else{const f=B.face||1;AD(()=>{for(let k=0;k<3;k++){const rad=(B.def.reach||64)*(.7+.25*q+k*.08);cx.strokeStyle='rgba(195,150,255,'+(.5*(1-q)*(1-k*.25))+')';cx.lineWidth=5-k*1.5;cx.beginPath();
     if(f>0)cx.arc(bx,by,rad,-1.2,1.2);else cx.arc(bx,by,rad,Math.PI-1.2,Math.PI+1.2);cx.stroke()}});edge('120,60,220',.05*(1-q))}}
 else{
  if(B.st==='tele'){cx.save();cx.translate(bx,by);const R=30+p*26;cx.strokeStyle='rgba(11,11,13,'+(.35+.4*p)+')';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,R,0,TAU);cx.stroke();
    cx.strokeStyle='rgba(90,150,255,'+(.4+.5*p)+')';cx.lineWidth=1;cx.beginPath();cx.arc(0,0,R+4,0,TAU);cx.stroke();
    for(let i=0;i<12;i++){const an=i*TAU/12+tt*.6,l=i%3?2:7;cx.beginPath();cx.moveTo(Math.cos(an)*(R-3),Math.sin(an)*(R-3));cx.lineTo(Math.cos(an)*(R+l),Math.sin(an)*(R+l));cx.stroke()}
    const ha=-1.57+p*TAU;cx.strokeStyle='#0b0b0d';cx.lineWidth=2;cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(ha)*R,Math.sin(ha)*R);cx.stroke();cx.restore();
    for(let i=0;i<8;i++){const an=i*.785+tt,r=(1-p)*100+12;shard(bx+Math.cos(an)*r,by+Math.sin(an)*r*.8,2.4,tt*5+i,i%2?'rgba(11,11,13,.8)':'rgba(245,242,234,.9)')}
    AD(()=>glow(bx,by,26+p*40,'rgba(110,160,255,'+.3*p+')'));edge('120,170,255',.05+.06*p)}
  else{for(let i=0;i<14;i++){const an=i*TAU/14+B.x*.01,r=q*190+10;shard(bx+Math.cos(an)*r,by+Math.sin(an)*r*.8,2.8*(1-q*.5),tt*6+i,(i%2?'rgba(11,11,13,':'rgba(245,242,234,')+(1-q)+')')}
    AD(()=>{cx.strokeStyle='rgba(120,170,255,'+(.7*(1-q))+')';cx.lineWidth=2.5;cx.beginPath();cx.arc(bx,by,q*170+8,0,TAU);cx.stroke()});edge('120,170,255',.05*(1-q));flash('225,235,255',.035*(1-q))}}}

const _dfxE=drawFx;drawFx=function(ox,oy,L){_dfxE(ox,oy,L);if(!P)return;FL.a=0;EG.a=0;
 for(const z of zones)zoneFx(z,ox,oy);
 for(const p of projs)projFx(p,ox,oy);
 for(const e of enemies)if(e.boss)bossFx(e,ox,oy);
 if(EG.a>0){const w=cv.width,h=cv.height,g=cx.createRadialGradient(w/2,h/2,h*.35,w/2,h/2,h*.95);g.addColorStop(0,'rgba('+EG.c+',0)');g.addColorStop(1,'rgba('+EG.c+','+Math.min(.14,EG.a)+')');cx.fillStyle=g;cx.fillRect(0,0,w,h)}
 if(FL.a>0){cx.fillStyle='rgba('+FL.c+','+Math.min(.07,FL.a)+')';cx.fillRect(0,0,cv.width,cv.height)}};

// ======================================================================
// NAMELESS DEITY ARENA: monochrome paper-collage cathedral (ivory · ink · cobalt)
// ======================================================================
const HT=(()=>{const c=document.createElement('canvas');c.width=c.height=6;const g=c.getContext('2d');g.fillStyle='#0b0b0d';g.fillRect(0,0,2,2);g.fillRect(3,3,2,2);return c})();
let HTP=null,dph=0;
const IV='#ece9e0',IV2='#d8d4c8',GRY='#9a9aa0',INK='#0b0b0d',BLU='#123a78',BLU2='#2f66c8';
const paperP=(pts,fill,edge,sh)=>{cx.save();if(sh!==0){cx.shadowColor='rgba(0,0,0,.4)';cx.shadowBlur=3;cx.shadowOffsetY=1.5}PL(pts,fill);cx.restore();cx.strokeStyle=edge||INK;cx.lineWidth=.8;cx.beginPath();cx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)cx.lineTo(pts[i],pts[i+1]);cx.closePath();cx.stroke()};
const hatch=(x,y,w,h,col,gap)=>{cx.fillStyle=col;for(let j=0;j<h;j+=gap||3){let xx=x+((j*7)%5);while(xx<x+w-2){const l=2+((xx*3+j)|0)%5;cx.fillRect(xx,y+j,Math.min(l,x+w-xx),.7);xx+=l+1.6}}};
function gear(x,y,r,n,rot,fill){cx.save();cx.translate(x,y);cx.rotate(rot);cx.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n,rad=i%2?r*.82:r;cx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}cx.closePath();cx.fillStyle=fill;cx.fill();cx.strokeStyle=INK;cx.lineWidth=1;cx.stroke();cx.fillStyle=INK;cx.beginPath();cx.arc(0,0,r*.28,0,TAU);cx.fill();cx.restore()}
function arch(x,base,w,h,fill,edge){const pts=[x-w,base,x-w,base-h*.62];for(let i=1;i<8;i++){const u=i/8,a=u*Math.PI/2;pts.push(x-w+w*(1-Math.cos(a))*1.0,base-h*.62-Math.sin(a)*h*.38)}pts.push(x,base-h);for(let i=7;i>=1;i--){const u=i/8,a=u*Math.PI/2;pts.push(x+w-w*(1-Math.cos(a))*1.0,base-h*.62-Math.sin(a)*h*.38)}pts.push(x+w,base-h*.62,x+w,base);paperP(pts,fill,edge,0)}

ARB.deity=function(a,X0,Y0,W2,H2,FY,L){
 const t=time,mx=X0+W2/2,cy=Y0+H2*.42,BB=enemies.find(q=>q.id==='deity'),tg=BB?(BB.fury?2:BB.ph===2?1.5:BB.p2?1:0):0;dph+=(tg-dph)*.03;const p=dph;
 const dxp=(cam.x||0)+cv.width/2-a.cx*T,vx0=Math.max(X0,-60),vx1=Math.min(X0+W2,cv.width+60),R=H2*.36,warm=clamp01(p-1);
 // --- paper ground ---
 let g=cx.createLinearGradient(0,Y0,0,FY);g.addColorStop(0,p>1.2?'#bdb7b0':'#efece4');g.addColorStop(.6,p>1.2?'#a9a29c':'#dcd8cc');g.addColorStop(1,p>1.2?'#8e8884':'#bfbbb0');cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);
 if(!HTP)HTP=cx.createPattern(HT,'repeat');cx.save();cx.globalAlpha=.1;cx.fillStyle=HTP;cx.fillRect(vx0,Y0,vx1-vx0,H2);cx.restore();
 g=cx.createRadialGradient(mx,cy,R*.4,mx,cy,W2*.55);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);
 // --- ink rays ---
 cx.save();for(let i=0;i<30;i++){const an=i/30*TAU+t*(.02+.03*p),w=.045;cx.fillStyle=i%2?'rgba(11,11,13,.055)':'rgba(255,255,255,.18)';cx.beginPath();cx.moveTo(mx,cy);cx.lineTo(mx+Math.cos(an-w)*W2,cy+Math.sin(an-w)*W2);cx.lineTo(mx+Math.cos(an+w)*W2,cy+Math.sin(an+w)*W2);cx.fill()}cx.restore();
 // --- distant cathedral arches (cut paper) ---
 for(let i=-1;i<9;i++){const sp=190,x=X0+(((i*sp+dxp*.14)%(sp*8))+sp*8)%(sp*8)-sp;if(x<vx0-90||x>vx1+90)continue;
  arch(x,FY-8,56,H2*.74,i%2?'#d2cec2':'#e3dfd4','#6c6c74');arch(x,FY-8,34,H2*.5,'#b9b5aa','#6c6c74');hatch(x-28,FY-8-H2*.4,56,H2*.36,'rgba(11,11,13,.2)',3);
  FR(x-1,FY-8-H2*.5,2,H2*.5,'rgba(11,11,13,.5)')}
 // --- floating torn-paper islands ---
 for(let i=0;i<6;i++){const iw=36+(i%3)*18,ix=X0+W2*((i*.19+.06)%1)+dxp*.2,iy=Y0+H2*(.12+.1*(i%3))+Math.sin(t*.5+i*2)*5;if(ix<vx0-80||ix>vx1+80)continue;
  paperP([ix-iw,iy,ix+iw,iy-2,ix+iw*.7,iy+iw*.3,ix+iw*.35,iy+iw*.5,ix+iw*.05,iy+iw*.95,ix-iw*.25,iy+iw*.6,ix-iw*.7,iy+iw*.32],i%2?IV2:'#c6c2b6','#3a3a40');
  hatch(ix-iw*.8,iy+3,iw*1.5,iw*.3,'rgba(11,11,13,.22)',3);for(let k=0;k<3;k++)FR(ix-iw*.5+k*iw*.45,iy-14,3,14,IV);PL([ix-iw*.55,iy-14,ix+iw*.35,iy-14,ix-iw*.1,iy-24],INK);
  FR(ix-iw,iy-1,iw*2,1.5,INK)}
 // --- the great clock-eye rose window ---
 cx.save();cx.fillStyle='rgba(0,0,0,.22)';cx.beginPath();cx.arc(mx+4,cy+5,R*1.02,0,TAU);cx.fill();cx.restore();
 for(const s of[-1,1]){gear(mx+s*R*1.28,cy+R*.5,R*.34,14,t*.25*s*(1+p),'#c3bfb3');gear(mx+s*R*1.62,cy-R*.35,R*.22,10,-t*.4*s*(1+p),'#d3cfc3')}
 cx.beginPath();cx.arc(mx,cy,R,0,TAU);cx.fillStyle=IV;cx.fill();cx.strokeStyle=INK;cx.lineWidth=3;cx.stroke();
 cx.strokeStyle=INK;cx.lineWidth=1;for(const k of[.93,.86])cx.beginPath(),cx.arc(mx,cy,R*k,0,TAU),cx.stroke();
 for(let i=0;i<60;i++){const an=i/60*TAU-1.5708,l=i%5?R*.025:R*.06;cx.lineWidth=i%5?.8:1.8;cx.beginPath();cx.moveTo(mx+Math.cos(an)*R*.93,cy+Math.sin(an)*R*.93);cx.lineTo(mx+Math.cos(an)*(R*.93-l),cy+Math.sin(an)*(R*.93-l));cx.stroke()}
 for(let i=0;i<16;i++){const an=i/16*TAU+t*.04*(1+p),a2=TAU/16*.42,r0=R*.42,r1=R*.84;const pts=[mx+Math.cos(an)*r0,cy+Math.sin(an)*r0,mx+Math.cos(an-a2)*r1*.8,cy+Math.sin(an-a2)*r1*.8,mx+Math.cos(an)*r1,cy+Math.sin(an)*r1,mx+Math.cos(an+a2)*r1*.8,cy+Math.sin(an+a2)*r1*.8];
  cx.globalAlpha=.94;PL(pts,i%3===0?BLU:i%3===1?'#1c4d9a':IV2);cx.globalAlpha=1;cx.strokeStyle=INK;cx.lineWidth=1;cx.beginPath();cx.moveTo(pts[0],pts[1]);for(let k=2;k<8;k+=2)cx.lineTo(pts[k],pts[k+1]);cx.closePath();cx.stroke()}
 AD(()=>{glow(mx,cy,R*.9,'rgba(80,140,255,'+(.22+.1*Math.sin(t*1.2)+.12*p)+')')});
 cx.beginPath();cx.arc(mx,cy,R*.4,0,TAU);cx.fillStyle=IV;cx.fill();cx.strokeStyle=INK;cx.lineWidth=2;cx.stroke();
 {const px=P?P.x+6-(cam.x||0)-mx:0,py=P?P.y+11-(cam.y||0)-(cy):0,d=Math.hypot(px,py)||1,k=Math.min(1,d/200)*R*.1;
  cx.fillStyle=BLU2;cx.beginPath();cx.arc(mx+px/d*k,cy+py/d*k,R*.27,0,TAU);cx.fill();cx.fillStyle='#0a1a3a';cx.beginPath();cx.arc(mx+px/d*k*1.4,cy+py/d*k*1.4,R*.14*(1+.2*Math.sin(t*2)),0,TAU);cx.fill();
  cx.fillStyle='rgba(255,255,255,.85)';cx.fillRect(mx+px/d*k*1.4-R*.07,cy+py/d*k*1.4-R*.08,R*.05,R*.05)}
 {const ma=t*(.18+.55*p)-1.5708,ha=t*.018-1.5708;cx.lineCap='round';cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=4.5;cx.beginPath();cx.moveTo(mx,cy);cx.lineTo(mx+Math.cos(ma)*R*.82,cy+Math.sin(ma)*R*.82);cx.stroke();
  cx.strokeStyle=INK;cx.lineWidth=2.5;cx.beginPath();cx.moveTo(mx,cy);cx.lineTo(mx+Math.cos(ma)*R*.82,cy+Math.sin(ma)*R*.82);cx.moveTo(mx,cy);cx.lineTo(mx+Math.cos(ha)*R*.55,cy+Math.sin(ha)*R*.55);cx.stroke();cx.lineCap='butt'}
 // --- mid colonnade with hanging pendulum clocks ---
 {const sp=230;for(let i=-1;i<8;i++){const x=X0+(((i*sp+dxp*.32)%(sp*7))+sp*7)%(sp*7)-sp;if(x<vx0-60||x>vx1+60)continue;const top=Y0-4,cw=15;
  paperP([x-cw,top,x+cw,top,x+cw-3,FY,x-cw+3,FY],'#cfcbbe','#2a2a30',0);FR(x-cw-4,top,cw*2+8,10,'#e8e4d9');FR(x-cw-4,top+10,cw*2+8,2,INK);FR(x-cw-3,FY-14,cw*2+6,14,'#b8b4a8');FR(x-cw-3,FY-14,cw*2+6,1.5,INK);
  for(let k=-1;k<=1;k++)FR(x+k*8-1,top+14,1.5,FY-top-30,'rgba(11,11,13,.45)');
  const sw=Math.sin(t*1.4+i*1.3)*.2,len=H2*(.36+(i%3)*.06),px2=x+Math.sin(sw)*len,py2=top+12+Math.cos(sw)*len;
  cx.strokeStyle=INK;cx.lineWidth=1;cx.beginPath();cx.moveTo(x,top+12);cx.lineTo(px2,py2);cx.stroke();for(let k=1;k<7;k++)FR(x+(px2-x)*k/7-1,top+12+(py2-top-12)*k/7-1,2,2,INK);
  cx.fillStyle=IV;cx.beginPath();cx.arc(px2,py2+8,9,0,TAU);cx.fill();cx.strokeStyle=INK;cx.lineWidth=1.5;cx.stroke();const ha=t*(2+i%3)+i;cx.beginPath();cx.moveTo(px2,py2+8);cx.lineTo(px2+Math.cos(ha)*6,py2+8+Math.sin(ha)*6);cx.stroke();FR(px2-1,py2-1,2,3,BLU2)}}
 // --- cobalt light shafts + floor mist ---
 AD(()=>{for(let i=0;i<5;i++){const x=mx+(i-2)*W2*.17+Math.sin(t*.3+i)*20,w=22+8*Math.sin(t*.7+i);cx.fillStyle='rgba(110,160,255,'+(.035+.02*Math.sin(t*.9+i*1.7)+.02*p)+')';cx.beginPath();cx.moveTo(x-w*.4,Y0+H2*.1);cx.lineTo(x+w*.4,Y0+H2*.1);cx.lineTo(x+w*1.6,FY);cx.lineTo(x-w*1.6,FY);cx.fill()}});
 g=cx.createLinearGradient(0,FY-H2*.22,0,FY);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,.5)');cx.fillStyle=g;cx.fillRect(X0,FY-H2*.22,W2,H2*.22);
 // --- falling newsprint scraps, ink flecks and cobalt sparks ---
 for(let i=0;i<34;i++){const lf=(t*.05*(1+i%3*.35)+i*.0917)%1,x=X0+(((i*97+Math.sin(t*.6+i)*40)%W2)+W2)%W2,y=Y0+lf*H2;if(x<vx0-8||x>vx1+8)continue;
  cx.save();cx.translate(x,y);cx.rotate(t*(.6+i%4*.3)+i);cx.globalAlpha=Math.sin(lf*Math.PI)*.9;const s=2+i%3;cx.fillStyle=i%5===0?BLU2:i%2?IV:INK;cx.fillRect(-s,-s*.6,s*2,s*1.2);if(i%2){cx.fillStyle='rgba(11,11,13,.5)';cx.fillRect(-s+1,-.5,s*2-2,.7)}cx.restore()}
 AD(()=>{for(let i=0;i<30;i++){const x=X0+((i*131)%1000)/1000*W2+Math.sin(t*.5+i)*12,y=FY-((t*(10+i%5*5)+i*53)%H2);if(x<vx0||x>vx1)continue;cx.fillStyle='rgba(140,185,255,'+(.3+.4*Math.sin(t*3+i*2))+')';cx.fillRect(x,y,1.5,1.5)}});
 // --- later phases: the page tears ---
 if(p>1.2){const k=Math.min(1,(p-1.2)*1.2);cx.strokeStyle='rgba(190,25,25,'+.55*k+')';cx.lineWidth=2;for(let i=0;i<12;i++){let an=i*TAU/12+.3,x=mx,y=cy;cx.beginPath();cx.moveTo(x,y);for(let j=0;j<7;j++){an+=Math.sin(i*5+j*2.3)*.35;x+=Math.cos(an)*(26+j*4);y+=Math.sin(an)*(26+j*4);cx.lineTo(x,y)}cx.stroke()}}
 // --- ink vignette ---
 g=cx.createRadialGradient(mx,cy,H2*.4,mx,cy,W2*.56);g.addColorStop(0,'rgba(11,11,13,0)');g.addColorStop(1,'rgba(11,11,13,'+(.32+.1*p)+')');cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);
 L.push([mx,cy,320]);for(let i=0;i<=6;i++)L.push([X0+W2*i/6,Y0+H2*.5,110]);
 // --- the Deity's entrance: the arena darkens, ink rushes toward the rift ---
 const B=BB;if(B&&B.st==='intro'){const e=12-B.t,dk=.62*clamp01(e/2)*(1-clamp01((e-10)/2)),rx=X0+(B.x+B.w/2-(a.cx-a.hw)*T),ry=Y0+(B.y+24-(a.fy-a.ht)*T);
  cx.fillStyle='rgba(8,10,28,'+dk+')';cx.fillRect(X0,Y0,W2,H2);
  for(let i=0;i<46;i++){const an=i*2.399,d=(1-((t*.7+i*.071)%1))*(120+(i%5)*40),x=rx+Math.cos(an)*d,y=ry+Math.sin(an)*d*.75;cx.strokeStyle=i%2?'rgba(255,255,255,'+dk+')':'rgba(70,110,230,'+dk+')';cx.lineWidth=1;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-Math.cos(an)*8,y-Math.sin(an)*6);cx.stroke()}}};

// ink + paper trim on the Heaven floor and platforms
const _dgtE=drawGates;drawGates=function(ox,oy,L){_dgtE(ox,oy,L);if(!P||!ARENAS.some(a=>a.id==='deity'))return;
 const x0=Math.max(1,ox/T|0),x1=Math.min(W-2,(ox+cv.width)/T+1|0),y0=Math.max(1,oy/T|0),y1=Math.min(H-2,(oy+cv.height)/T+1|0),fy=DEITY_FY();
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(tiles[y*W+x]!==3)continue;const X=x*T-ox,Y=y*T-oy,h=hsh(x,y),up=!tiles[(y-1)*W+x],dn=!tiles[(y+1)*W+x],lf=!tiles[y*W+x-1],rt=!tiles[y*W+x+1];
  if(up){FR(X,Y,T,2,INK);FR(X,Y+2,T,1,'#fff');if(h%3===0)FR(X+5,Y+6,2,2,BLU2);if(y===fy&&x%4===0){PL([X+8,Y+4,X+12,Y+8,X+8,Y+12,X+4,Y+8],BLU);FR(X+7,Y+7,2,2,'#fff')}}
  if(dn){FR(X,Y+T-2,T,1.5,INK);for(let k=0;k<4;k++){const hh2=3+((h+k*5)%5);PL([X+k*4,Y+T,X+k*4+2,Y+T+hh2,X+k*4+4,Y+T],k%2?IV2:'#fff');}}
  if(lf)FR(X,Y,1.5,T,INK);if(rt)FR(X+T-1.5,Y,1.5,T,INK)}};
const hsh=(x,y)=>((x*73856093)^(y*19349663))>>>0;
const DEITY_FY=()=>{const a=ARENAS.find(q=>q.id==='deity');return a?a.fy:-1};
renderBadges();
})();