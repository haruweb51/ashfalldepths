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
const _td=tryDodge;tryDodge=function(){if(!P||(P.dcd||0)>0)return;const was=P.dodge;_td();if(P.dodge>0&&was<=0)P.dcd=.22+.2};
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
const sellOf=p=>Math.max(1,Math.floor(p*SELL));
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
const _ds2=drawShop;drawShop=function(){_ds2();sheet.insertAdjacentHTML('beforeend',sellHTML());
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
 voidfang:['Soul Siphon','Heal 7% of damage dealt. After a dodge, your next strike within 2s deals +40% and heals double.']};
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
 else if(k==='voidfang'){let h=Math.ceil(d*.07);if(P.vfb>0){e.hp-=d*.4;P.vfb=0;h*=2;float(e.x,e.y-26,'SHADOWSTRIKE','#c8f');burst(cxm,cym,18,'#c8f')}P.hp=Math.min(maxHp(),P.hp+h)}};
const _es=enchSheet;enchSheet=function(w){const s=_es(w);return w&&w.unique&&PASS[w.kind]?'<br><small style="color:#ffb347">\u2726 '+PASS[w.kind][0]+': '+PASS[w.kind][1]+'</small>'+s:s};

// ---------- 8. Nameless Blessing ----------
const BKEY='ashfall_blessing_v1';let BLESS=false;try{BLESS=localStorage.getItem(BKEY)==='1'}catch(e){}
const _rc2=recalc;recalc=function(){_rc2();if(!BLESS||typeof P==='undefined'||!P)return;const f=1.25,fort=P.at.fort,str=P.at.str,agi=P.at.agi;
 S.hp=Math.round((80+fort*20+S.hp)*f-80-fort*20);S.stam=Math.round((80+agi*10+S.stam)*f-80-agi*10);S.post=Math.round((60+fort*8+str*4+S.post)*f-60-fort*8-str*4);
 S.dmg=(1+str*.08+S.dmg)*f-1-str*.08;S.spd=(150+agi*6+S.spd)*f-150-agi*6;S.jump=(1+S.jump)*f-1;S.air=(1+S.air)*f-1;
 S.dodge=1-(1-S.dodge)/f;S.atkc=1-(1-S.atkc)/f;S.pdmg=(1+S.pdmg)*f-1;S.parry=S.parry+.05;S.regen=(1+S.regen)*f-1;S.def=1-(1-(S.def||0))/f;
 P.hp=Math.min(P.hp,maxHp());P.stam=Math.min(P.stam,maxStam())};
const _um=updMenu;updMenu=function(){_um();if(BLESS){const e=$('echoes');e.innerHTML=e.textContent+' &nbsp;\u00b7&nbsp; <span style="color:#ffe08a">\u2726 Nameless Blessing +25%</span>'}};

// ---------- 9. boss themes (only while a boss fight is live) ----------
const MUS={id:null,out:null,t:0,s:0,B:null};const mf=m=>440*Math.pow(2,(m-69)/12);
const TH={
 ember:{bpm:138,r:[38,38,41,36],sc:[0,3,5,7,10],bp:'1001001010010010',k:'1000100010001010',h:'0010001000100011',ar:[0,-1,2,-1,3,-1,2,-1,4,-1,3,-1,2,-1,1,-1],bw:'sawtooth',lw:'square',pw:'sawtooth',pc:[0,3,7],lv:.05},
 glacial:{bpm:96,r:[40,36,38,35],sc:[0,2,3,7,8],bp:'1000000000001000',k:'1000000010000000',h:'0000000000000000',ar:[0,-1,1,-1,2,-1,3,-1,4,-1,3,-1,2,-1,1,2],bw:'sine',lw:'triangle',pw:'triangle',pc:[0,7,12],lv:.07,bell:1,al:2.6},
 tempest:{bpm:162,r:[45,43,41,43],sc:[0,2,3,5,7,8,10],bp:'1010101010101010',k:'1000100010001000',h:'0010001000100010',ar:[0,2,4,2,5,4,2,0,3,5,7,5,4,2,3,1],bw:'sawtooth',lw:'square',pw:'sawtooth',pc:[0,3,7],lv:.04,al:1},
 hollow:{bpm:88,r:[41,40,39,40],sc:[0,1,5,6,8],bp:'1000000000100000',k:'1001000000000000',h:'0000000000000000',ar:[0,-1,-1,2,-1,-1,1,-1,-1,3,-1,-1,4,-1,2,-1],bw:'sine',lw:'triangle',pw:'sawtooth',pc:[0,1,6],lv:.07,pv:.03,al:3},
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
const FILEN={ember:'embertyranttheme',glacial:'glacialdevourertheme',tempest:'tempestdragontheme',hollow:'hollowkingtheme',deity:'namelessdeitytheme'},EXTS=['mp3','ogg','wav','m4a','opus','flac','aac'],FILES={};let FA=null;
function probe(id,i){if(i>=EXTS.length)return;try{const a=new Audio();a.preload='auto';a.loop=true;a.addEventListener('canplay',()=>{FILES[id]=a},{once:true});a.addEventListener('error',()=>probe(id,i+1),{once:true});a.src='bossthemes/'+FILEN[id]+'.'+EXTS[i]}catch(e){}}
try{if(typeof Audio==='function')for(const id in FILEN)probe(id,0)}catch(e){}
function fileStart(a){if(a.fi){clearInterval(a.fi);a.fi=0}if(FA===a){if(a.paused)a.play().catch(()=>{});return}fileStop(true);FA=a;a.currentTime=0;a.volume=.7;a.play().catch(()=>{})}
function fileStop(reset){const a=FA;if(!a)return;FA=null;a.fi=setInterval(()=>{a.volume=Math.max(0,a.volume-.1);if(a.volume<=0){clearInterval(a.fi);a.fi=0;a.pause();if(reset)a.currentTime=0;a.volume=.7}},50)}
setInterval(()=>{try{const F=P&&!P.dead?enemies.find(e=>e.boss&&!e.dead&&e.st!=='dormant'&&e.st!=='dying'):null,B=F&&!paused&&!Audio_.mute?F:null;
 if(!F)fileStop(true);else if(!B&&FA)FA.pause();
 if(B&&FILES[B.id]){musStop();fileStart(FILES[B.id]);return}
 if(!B||!TH[B.id]){musStop();return}if(MUS.id!==B.id){musStop();musStart(B.id,B)}MUS.B=B;musTick()}catch(e){}},40);

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
  else[392,494,588,784,988].forEach((f,i)=>tn(f,f,3,'sine',.07,i*.1))}};
const BHIT={ember:()=>tn(95,60,.12,'square',.08),glacial:()=>tn(2800,1800,.1,'triangle',.07),tempest:()=>{nz(.1,.1,6000,2000,'highpass');tn(300,100,.08,'sawtooth',.06)},
 hollow:()=>tn(160,110,.25,'sine',.1),deity:()=>{tn(1318,1318,.4,'sine',.06);tn(1976,1976,.3,'sine',.03)}};
const BSIG={
 ember:{tele:v=>nz(.4,.1*v,1200,300,'bandpass',2),act:v=>{for(let i=0;i<3;i++)nz(.07,.12*v,3500,1800,'highpass',1,i*.06)}},
 glacial:{tele:v=>tn(3200,2400,.4,'sine',.05*v),act:v=>{tn(4200,1500,.25,'triangle',.07*v);tn(5200,1800,.2,'triangle',.05*v,.05)}},
 tempest:{tele:v=>nz(.35,.08*v,6000,2500,'highpass'),act:v=>{nz(.15,.2*v,6000,600,'highpass');tn(80,35,.3,'sawtooth',.1*v,.05)}},
 hollow:{tele:v=>tn(220,140,.5,'triangle',.06*v),act:v=>{tn(147,70,.5,'sine',.12*v);tn(1400,300,.3,'triangle',.04*v)}},
 deity:{tele:v=>{[523,659,784].forEach((f,i)=>tn(f,f*1.2,.5,'sine',.05*v,i*.06))},act:v=>{tn(1568,1568,.5,'sine',.07*v);tn(2093,2093,.4,'sine',.04*v,.04);nz(.25,.12*v,5000,800,'highpass')}}};
bsfx=function(k){const B=CB,f=BI[B&&BI[B.id]?B.id:'ember'];f(k,B)};
const _ub3=updBoss;updBoss=function(B,dt){CB=B;const ps=B.st,dz=B.id==='deity',hz=B.id==='hollow';_ub3(B,(dz||hz)&&ps!=='intro'&&ps!=='dormant'?dt*(dz?1.4:1.3):dt);if(dz)deityIntro(B,ps,dt);if(hz)hollowIntro(B,ps,dt);if(!B.dead&&B.st==='idle'&&!(B.roar>0)&&((dz&&B.t>.25)||(hz&&B.t>.45)))B.t=dz?.25:.45;if(B.dead||!P||B.st===ps)return;const g=BSIG[B.id],v=near(B.x+B.w/2);if(!g)return;if(B.st==='tele')g.tele(v);else if(B.st==='act')g.act(v)};
const A1=['judgment','halo','smite','blink'];
const _hb=hitBoss;hitBoss=function(B){CB=B;const bad=['dormant','intro','phase','dying'].includes(B.st),ph0=B.ph,fu0=B.fury;_hb(B);if(!bad&&BHIT[B.id])BHIT[B.id]();
 if(B.id==='deity'&&!bad&&B.hp>0){const d=B.def;
  if(!B.p2&&B.hp<=B.max*.75){B.p2=1;d.a1.push('seraph','heavenfall');B.st='phase';B.t=1.4;B.vx=0;zones=[];projs=[];toast('PHASE II \u2014 The Deity ascends');bsfx(2)}
  if(B.ph===2&&ph0===1){d.a2=d.a1.concat(['chorus','nova','wall']);toast('PHASE III \u2014 Heaven burns')}
  if(B.fury&&!fu0){d.a2.push('spiral','cataclysm','sunder');toast('PHASE IV \u2014 Judgment Day')}}};
const _bh=bossHud;bossHud=function(){const B=enemies.find(e=>e.boss&&!e.dead&&e.st!=='dormant'),dI=B&&B.id==='deity'&&B.st==='intro',hI=B&&B.id==='hollow'&&B.st==='intro',rt=B&&B.t;if(dI)B.t=rt>5?3:3*rt/5;else if(hI)B.t=Math.min(rt,3);_bh();if(dI||hI)B.t=rt;if(!B||!(B.id==='deity'||B.id==='hollow'))return;
 const rm=B.rmax||1.4;if(B.roar>rm-.4){cx.save();cx.fillStyle=(B.id==='deity'?'rgba(255,255,255,':'rgba(225,200,255,')+Math.min(.9,(B.roar-(rm-.4))/.4*.9)+')';cx.fillRect(0,0,cv.width,cv.height);cx.restore()}
 if(B.id!=='deity'||dI)return;const n=B.fury?4:B.ph===2?3:B.p2?2:1;
 cx.save();cx.textAlign='center';cx.font='bold 10px Georgia';cx.fillStyle='#ffe08a';cx.shadowColor='#000';cx.shadowBlur=3;cx.fillText('PHASE '+['','I','II','III','IV'][n],cv.width/2,cv.height-68);cx.restore()};

// ---------- 11. The Nameless Deity (final boss) ----------
const DEITY={id:'deity',cx:60,fy:28,hw:50,ht:24,g:6,side:1,bg:['#cfd0d6','#f6f6f8'],pl:[[-44,5,10],[34,5,10],[-8,10,16],[-32,14,9],[24,14,9],[-5,18,10],[-46,20,6],[40,20,6]]};
BD.deity={n:'The Nameless Deity',sub:'The Void That Watches',tier:5,hp:100000,pmax:Math.round(BD.hollow.pmax*1.25),w:26,h:50,spd:Math.round(BD.hollow.spd*1.25),dmg:Math.round(BD.hollow.dmg*1.25),
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
ARB.deity=function(a,X0,Y0,W2,H2,FY,L){const t=time,mx=X0+W2/2,cy=Y0+H2*.42;
 glow(mx,cy,Math.min(W2,H2*2)*.45,'rgba(255,255,255,.9)');
 cx.save();cx.shadowColor='rgba(0,0,0,.35)';cx.shadowBlur=10;PL([mx,Y0,mx+7,cy,mx,FY,mx-7,cy],'#fff');PL([X0,cy,mx,cy-6,X0+W2,cy,mx,cy+6],'#fff');cx.restore();
 PL([mx-120,cy-120,mx,cy-3,mx+120,cy+120,mx,cy+3],'rgba(255,255,255,.7)');PL([mx+120,cy-120,mx+3,cy,mx-120,cy+120,mx-3,cy],'rgba(255,255,255,.7)');
 cx.save();cx.translate(mx,cy);cx.lineCap='round';cx.strokeStyle='rgba(30,30,40,.13)';cx.lineWidth=1.5;for(const r of[60,100,140]){cx.beginPath();cx.arc(0,0,r,0,7);cx.stroke()}
 for(let i=0;i<60;i++){const an=i*.10472+t*.03,r0=i%5?148:140;cx.strokeStyle='rgba(20,20,30,'+(i%5?.18:.4)+')';cx.lineWidth=i%5?1:2;cx.beginPath();cx.moveTo(Math.cos(an)*r0,Math.sin(an)*r0);cx.lineTo(Math.cos(an)*156,Math.sin(an)*156);cx.stroke()}
 cx.strokeStyle='rgba(15,15,25,.35)';cx.lineWidth=3;let ang=t*.2-1.57;cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(ang)*128,Math.sin(ang)*128);cx.stroke();ang=t*.017-1.2;cx.lineWidth=4;cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.cos(ang)*80,Math.sin(ang)*80);cx.stroke();cx.restore();
 glow(mx,cy,70,'rgba(70,130,255,.18)');
 for(let i=0;i<12;i++){const x=X0+W2*(i+.5)/12,ch=(H2-40)*(.55+.3*((i*37)%5)/5);cx.save();cx.shadowColor='rgba(0,0,0,.4)';cx.shadowBlur=5;PL([x-9,FY,x-10,FY-ch+6,x-4,FY-ch,x+2,FY-ch+5,x+9,FY-ch+1,x+10,FY],'rgba(228,225,216,.92)');cx.restore();NEWS(x-8,FY-ch+8,16,ch*.5,'rgba(0,0,0,.22)');L.push([x,FY-ch*.6,60])}
 for(let i=0;i<16;i++){const lf=(t*.04*(1+i%3*.4)+i*.137)%1,x=X0+((i*97+Math.sin(t*.5+i)*30)%W2+W2)%W2,y=FY-lf*H2,an=t*(.6+i%3*.3)+i;cx.save();cx.translate(x,y);cx.rotate(an);cx.globalAlpha=Math.sin(lf*Math.PI)*.9;cx.shadowColor='rgba(0,0,0,.4)';cx.shadowBlur=3;PL([-6,-4,7,-5,6,5,-7,4],'#e8e5dc');cx.restore()}
 for(let i=0;i<14;i++){const x=X0+W2*(i*.07+.03),r=3+(i*7)%6;cx.fillStyle='rgba(10,10,14,.5)';cx.beginPath();cx.arc(x,FY-2,r,0,7);cx.fill()}
 const mg=cx.createLinearGradient(0,FY-50,0,FY);mg.addColorStop(0,'rgba(120,120,135,0)');mg.addColorStop(1,'rgba(120,120,135,.35)');cx.fillStyle=mg;cx.fillRect(X0,FY-50,W2,50);
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
 if(B.st==='intro'){const e=12-B.t;B.vis=clamp01((e-4)/4.5);B.y=a.fy*T-140;B.x=a.cx*T-B.w/2;P.stun=Math.max(P.stun,.15);P.inv=Math.max(P.inv,.15);
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
 if(B.st==='intro'){const e=7-B.t;B.vis=clamp01((e-1.5)/3.2);P.stun=Math.max(P.stun,.15);P.inv=Math.max(P.inv,.15);shake=Math.max(shake,e<5?1.5+e*.5:e<6.4?4:4+(e-6.4)*12);
  if(!B.h1&&e>=1.5){B.h1=1;noise(2.4,.2,300,3000,'bandpass',3);[147,175,208].forEach((f,i)=>tone(f,f*1.4,2.4,'triangle',.07,i*.2));toast('Fragments gather\u2026')}
  if(!B.h2&&e>=4.6){B.h2=1;tone(520,520,1.6,'sine',.12);tone(780,780,1.4,'sine',.06,.05);tone(130,60,1.2,'sine',.25);noise(.5,.25,6000,900,'highpass');burst(bcx(B),B.y+4,24,'#ffd36b');toast('The crown settles\u2026')}
  if(!B.h3&&e>=6.5){B.h3=1;tone(98,88,3.2,'sine',.3);tone(196,176,2.6,'sine',.15);tone(60,30,1.6,'sawtooth',.25);noise(1.4,.28,2500,80,'lowpass');shake=Math.max(shake,16)}
  if(e>.5&&e<6.3)for(let i=0;i<2;i++){const an=Math.random()*6.283,d=80+Math.random()*100;parts.push({x:bcx(B)+Math.cos(an)*d,y:B.y+B.h-Math.random()*16,vx:-Math.cos(an)*d*1.2,vy:-60,l:.8,c:Math.random()<.5?'#b890ff':'#8ff'})}}
 else if(ps==='intro'&&B.st==='idle'){B.roar=1.2;B.t=1.2;B.vis=1;shake=18;P.vx=(P.x<bcx(B)?-1:1)*300;P.vy=-120;P.stun=.35;P.inv=.5;burst(bcx(B),bcy(B),40,'#c8f');burst(bcx(B),bcy(B),20,'#8ff');announce('THE HOLLOW KING','Kneel.','')}
 if(B.roar>0)B.roar-=dt}
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
const HEAVP={1:['#e9e6df','#dedbd2','#f4f2ec'],2:['#1c1c20','#17171b','#232328'],3:['#e9e6df','#dedbd2','#f4f2ec']};
function genHeaven(){const t=new Uint8Array(W*H),a=DEITY,x0=a.cx-a.hw,x1=a.cx+a.hw,y0=a.fy-a.ht;
 t.fill(2);
 for(let y=y0-1;y<=a.fy+1;y++)for(let x=x0-1;x<=x1+1;x++)t[y*W+x]=3;
 for(let x=x0;x<=x1;x++){const c=y0+Math.round(Math.pow(Math.abs(x-a.cx)/a.hw,3)*9);for(let y=c;y<a.fy;y++)t[y*W+x]=0}
 for(const[px,py,ln]of a.pl)for(let k=0;k<ln;k++){t[(a.fy-py)*W+a.cx+px+k]=3;t[(a.fy-py+1)*W+a.cx+px+k]=3}
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
const _st=start;start=function(n){leaveHeaven();musStop();fileStop(true);return _st(n)};
const _er=endRun;endRun=function(){leaveHeaven();musStop();fileStop(true);return _er()};

// ----- Hollow King falls -> portal announced; Deity falls -> victory -----
function announce(t1,t2,t3){bossBanner('','');const b=$('bossBanner');b.innerHTML='<div class="bb-t" style="font-size:40px">'+t1+'</div><div class="bb-n">'+t2+'</div><div class="bb-s">'+t3+'</div>'}
const _fb3=finishBoss;finishBoss=function(B){
 if(B.id==='deity'){const d=B.def;B.dead=true;bossDead.deity=1;zones=[];projs=[];shake=16;musStop();
  burst(bcx(B),bcy(B),60,'#fff');burst(bcx(B),bcy(B),50,'#ffe08a');for(let i=0;i<90;i++){const a=i/90*6.283;parts.push({x:bcx(B),y:bcy(B),vx:Math.cos(a)*300,vy:Math.sin(a)*300,l:1.1,c:i%2?'#fff':'#ffe08a'})}
  gainXp(300*d.tier);gold+=1000;BI.deity(3,B);setTimeout(showWin,2600);return}
 _fb3(B);
 if(B.id==='hollow'){setTimeout(()=>{if(!P)return;announce('A PORTAL OPENS','A portal to Heaven has appeared at spawn','Seek the light \u2014 if you dare');toast('A portal to Heaven has appeared at spawn');tone(330,1320,1.6,'sine',.1);tone(495,1980,1.6,'triangle',.06,.15)},4800)}};

// ----- win screen -----
const win=document.createElement('div');win.id='win';win.className='panel hidden';
win.innerHTML='<div class="rune" style="color:#ffe08a;text-shadow:0 0 20px #ffb84a">\u2726</div><h1>VICTORY</h1><h2>The Nameless Deity has fallen</h2><div id="winTxt">\u201cWorthy\u2026 at last. Carry a fragment of the light with you.\u201d</div><div id="winStats"></div><button id="winEnd">End Run &amp; Claim Nameless Blessing</button>';
document.body.appendChild(win);
function showWin(){if(!P)return;paused=true;const ec=bankedEchoes();
 $('winStats').innerHTML='Level <b>'+P.lvl+'</b> \u00b7 <b>'+Object.keys(bossDead).length+'</b> bosses \u00b7 <b>'+(P.kills||0)+'</b> kills<br><b style="font-size:16px">+'+ec+' \u2756 echoes will be banked</b><br><span style="color:#ffe08a">\u2726 Nameless Blessing: all stats +25% permanently</span>'+(BLESS?' <small>(already owned)</small>':'');
 win.classList.remove('hidden');win.classList.remove('go-in');void win.offsetWidth;win.classList.add('go-in')}
$('winEnd').onclick=()=>{if(!P)return;const ec=bankedEchoes();meta.echoes+=ec;saveMeta();BLESS=true;try{localStorage.setItem(BKEY,'1')}catch(e){}
 try{localStorage.removeItem(SAVEKEY)}catch(e){}
 leaveHeaven();musStop();win.classList.add('hidden');P=null;paused=true;sheetOpen=false;shopOpen=false;questOpen=false;enemies=[];zones=[];projs=[];parts=[];floats=[];
 for(const i of['hud','hint','mmw','sheet'])$(i).classList.add('hidden');$('toast').textContent='';$('btnContinue').disabled=true;$('runInfo').innerHTML='';
 recalc();updMenu();$('menu').classList.remove('hidden');toast('\u2726 Nameless Blessing received \u2014 all stats +25%')};

// ----- chest respawn tick -----
let crT=0;const _uf2=updFx;updFx=function(dt){_uf2(dt);crT-=dt;if(crT>0||inHeaven||!P)return;crT=2;const now=Date.now();let ch=0;
 for(const k in CR.at){const z=CR.at[k];if(z.t<=now&&!chests.some(c=>c.k===k)){delete CR.at[k];delete opened[k];ch=1;
  const c={tx:z.tx,ty:z.ty,type:z.type,hp:CH[z.type].hp,max:CH[z.type].hp,flash:0,k};if(CR.n[k])c.rs=CR.n[k];chests.push(c)}}if(ch)crSave()};

try{updMenu()}catch(e){}
})();
