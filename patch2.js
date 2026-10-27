'use strict';
// ===== Ashfall Depths: Patch 2 (load AFTER patch.js) =====
// layer shrines + teleport UI · boss rekindling (+10% stats / rewards each time) · per-boss platform-kick attacks · boss echo bonus
(()=>{
const c01=v=>Math.max(0,Math.min(1,v));
const hv=()=>ARENAS.some(a=>a.id==='deity');           // true while inside the Heaven dimension
const arenas4=()=>ARENAS.filter(a=>a.id!=='deity');

// ---------- persistent shrine state (per run seed) ----------
const RK='ashfall_shrine_v1';
let R={seed:-1,n:{},act:{},ek:0,seen:{}};
function ensureR(){
 if(!P||R.seed===seed)return;
 let d=null;try{d=JSON.parse(localStorage.getItem(RK))}catch(e){}
 R=d&&d.seed===seed?d:{seed,n:{},act:{},ek:0,seen:{}};
 R.n=R.n||{};R.act=R.act||{};R.seen=R.seen||{};R.ek=R.ek|0}
const saveR=()=>{try{localStorage.setItem(RK,JSON.stringify(R))}catch(e){}};
window.shrineEchoes=()=>{ensureR();return R.ek|0};      // read by bankedEchoes() in game.js

// ---------- styles ----------
{const s=document.createElement('style');s.textContent=`
#sheet .shr-note{color:#a8957a;font-size:12px;margin:-8px 0 10px;font-style:italic}
#sheet .shr-up{color:#9fe}`;document.head.appendChild(s)}

// ---------- shrine placement ----------
const COL={spawn:'255,226,140',ember:'255,138,26',glacial:'140,215,255',tempest:'255,255,120',hollow:'170,120,255'};
// layer n is unlocked when its gate is open (Ember from the start, the rest after the previous boss dies)
const unl=n=>{const r=GATE_REQ(n);return !r||!!bossDead[r]};
let HUB=null;
function hubPos(){if(!spawn)return null;if(HUB&&HUB.sx===spawn.x&&HUB.t===tiles)return HUB;
 const x=spawn.x+6-85;let ty=0;while(ty<H&&!solid(x/T|0,ty))ty++;
 return HUB={x,y:ty*T,sx:spawn.x,t:tiles,id:'spawn',n:0,name:'Spawn Shrine',c:COL.spawn}}
function shrines(){if(!P||hv()||window.TUTON)return[];const l=[],h=hubPos();if(h)l.push(h);
 arenas4().forEach((a,i)=>{const n=i+1;if(unl(n))l.push({id:a.id,n,x:(a.cx-a.hw-10)*T,y:a.fy*T,name:LN[n]+' Shrine',c:COL[a.id]})});
 return l}
const nearSh=()=>{if(!P||P.dead)return null;for(const s of shrines())if(Math.abs(P.x+6-s.x)<34&&Math.abs(P.y+22-s.y)<30)return s;return null};

function drawOne(s,ox,oy,L,near){
 const X=Math.round(s.x-ox),Y=Math.round(s.y-oy);if(X<-70||X>cv.width+70||Y<-100||Y>cv.height+100)return;
 const t=time,pu=.5+.5*Math.sin(t*2.4+s.x*.1),c=s.c,fy=Math.sin(t*2+s.x*.1)*2.5;
 FR(X-15,Y-3,30,3,'#2e2640');FR(X-12,Y-6,24,3,'#40365a');FR(X-9,Y-9,18,3,'#544a74');
 FR(X-3,Y-27,6,18,'#6a5e86');FR(X-1,Y-26,2,16,'rgba('+c+',.55)');FR(X-7,Y-30,14,3,'#8a7ea6');FR(X-5,Y-33,10,3,'#6a5e86');
 cx.save();cx.globalCompositeOperation='lighter';glow(X,Y-42+fy,38+pu*10,'rgba('+c+','+(.32+.2*pu)+')');cx.restore();
 PL([X,Y-54+fy,X+7,Y-43+fy,X,Y-32+fy,X-7,Y-43+fy],'rgb('+c+')');PL([X,Y-54+fy,X+3,Y-43+fy,X,Y-36+fy,X-7,Y-43+fy],'rgba(255,255,255,.55)');
 for(let i=0;i<5;i++){const lf=(t*.45+i*.2)%1;FR(X+Math.sin(i*4+t)*10,Y-12-lf*44,1.6,1.6,'rgba('+c+','+(1-lf)+')')}
 L.push([X,Y-42,110]);
 cx.save();cx.textAlign='center';cx.font='bold 8px Georgia';cx.shadowColor='rgb('+c+')';cx.shadowBlur=5;cx.fillStyle='rgba(255,255,255,.85)';cx.fillText('\u2726 '+s.name.toUpperCase()+' \u2726',X,Y-64);
 if(near){cx.fillStyle='#ffd36b';cx.shadowBlur=0;cx.fillText('[E] Shrine',X,Y-54)}cx.restore()}
const _dsp5=drawSpawn;drawSpawn=function(ox,oy,L){_dsp5(ox,oy,L);if(!P)return;const n=nearSh();for(const s of shrines())drawOne(s,ox,oy,L,n&&n.id===s.id)};

// ---------- shrine UI ----------
const closeUI=()=>{paused=false;sheetOpen=false;sheet.classList.add('hidden')};
function openShrine(s){sheetOpen=true;shopOpen=false;questOpen=false;paused=true;sheet.classList.remove('hidden');drawShrine(s)}
function drawShrine(s){ensureR();const list=shrines();
 let h='<h1>SHRINE</h1><h2>'+s.name+'</h2><div class="shr-note">Travel between the spawn camp and every unlocked layer</div>';
 for(const d of list){const here=d.id===s.id,nm=d.id==='spawn'?'Spawn Camp':LN[d.n]+' Depths',sub=d.id==='spawn'?'Merchant \u00b7 Questwarden \u00b7 Enchanting Altar':'Outside '+BD[d.id].n+'\u2019s chamber';
  h+='<div class="row"><span><b style="color:rgb('+d.c+')">'+nm+'</b><br><small>'+sub+'</small></span><button data-tp="'+d.id+'" '+(here?'disabled':'')+'>'+(here?'Here':'Teleport')+'</button></div>'}
 if(s.id!=='spawn'&&bossDead[s.id]&&BD[s.id]){const bd=BD[s.id],n=R.n[s.id]|0,alive=enemies.some(e=>e.boss&&e.id===s.id&&!e.dead),pct=(n+1)*10;
  h+='<hr><div class="row"><span><b>Rekindle '+bd.n+'</b><br><small>'+(alive?'It already waits in the middle of its arena.':'Summons it in the middle of the arena \u00b7 rekindled '+n+'\u00d7 so far<br><span class="shr-up">next: boss stats +'+pct+'% \u00b7 gold, exp &amp; echoes +'+pct+'%</span>')+'</small></span><button data-rk="1" '+(alive?'disabled':'')+'>'+(alive?'Awaiting':'Rekindle')+'</button></div>'}
 h+='<hr><button id="shX">Close</button>';sheet.innerHTML=h;
 sheet.querySelectorAll('[data-tp]').forEach(b=>b.onclick=()=>{const d=list.find(q=>q.id===b.dataset.tp);if(d)teleport(d)});
 sheet.querySelectorAll('[data-rk]').forEach(b=>b.onclick=()=>{rekindle(s.id)});
 $('shX').onclick=closeUI}
function teleport(d){if(!P||hv())return;closeUI();
 burst(P.x+6,P.y+12,18,'rgb('+COL.spawn+')');
 P.x=d.x-6;P.y=d.y-23;P.vx=P.vy=0;P.climb=false;P.kick=null;P.stun=0;P.atk=0;P.dodge=0;P.inv=Math.max(P.inv,1.2);
 zones=[];projs=[];
 cam.x=Math.max(0,Math.min(W*T-cv.width,P.x-cv.width/2+P.face*30));cam.y=Math.max(0,Math.min(H*T-cv.height,P.y-cv.height/2));
 burst(P.x+6,P.y+12,24,'rgb('+d.c+')');shake=Math.max(shake,3);
 tone(330,990,.5,'sine',.08);tone(495,1485,.5,'triangle',.05,.05);noise(.4,.08,4000,500,'bandpass',2);
 toast('\u2726 '+(d.id==='spawn'?'Spawn Camp':LN[d.n]+' Depths'));save()}
addEventListener('keydown',e=>{if(e.code==='KeyE'&&P&&!paused&&!e.repeat){const s=nearSh();if(s){e.stopImmediatePropagation();e.preventDefault();openShrine(s)}}},true);

// ---------- unlock notice ----------
let shT=0;
const _ufS=updFx;updFx=function(dt){_ufS(dt);shT-=dt;if(shT>0||!P||hv())return;shT=1;ensureR();
 const nw=[];for(let n=1;n<=4;n++){if(unl(n)&&!R.seen[n]){R.seen[n]=1;if(n>1)nw.push(LN[n])}}
 if(nw.length){saveR();setTimeout(()=>{if(P)toast('\u2726 A shrine awakens outside the boss chamber \u2014 '+nw.join(' & ')+' Depths');tone(330,1320,1.2,'sine',.08)},4200)}};

// ---------- boss rekindling ----------
function mkRB(a){const b=BD[a.id],n=R.n[a.id]|0,m=1+.1*n;
 const d=Object.assign({},b,{hp:Math.round(b.hp*m),dmg:Math.round(b.dmg*m),pd:Math.round(b.pd*m),pmax:Math.round(b.pmax*m),spd:Math.round(b.spd*m)});
 return{boss:1,id:a.id,rs:n,def:d,ar:a,x:a.cx*T-d.w/2,y:a.fy*T-d.h-2,w:d.w,h:d.h,vx:0,vy:0,hp:d.hp,max:d.hp,post:0,pmax:d.pmax,st:'dormant',t:0,twu:1,face:-1,ph:1,fury:0,chain:0,atk:'',lastA:'',dead:false,vis:1,flash:0,lvl:6}}
function rekindle(id){ensureR();const a=ARENAS.find(q=>q.id===id);
 if(!a||id==='deity'||hv()||!bossDead[id]||enemies.some(e=>e.boss&&e.id===id&&!e.dead))return;
 R.n[id]=(R.n[id]|0)+1;R.act[id]=1;saveR();
 enemies=enemies.filter(e=>!(e.boss&&e.id===id));enemies.push(mkRB(a));closeUI();
 const bx=a.cx*T,by=(a.fy-3)*T,col='rgb('+BD[id].zc+')';burst(bx,by,40,col);burst(bx,by,30,'#fff');shake=Math.max(shake,8);
 tone(70,40,1,'sawtooth',.16);noise(.9,.14,900,80,'lowpass');[392,523,659].forEach((f,i)=>tone(f,f*1.5,.5,'sine',.05,.1+i*.1));
 toast(BD[id].n+' is rekindled \u00b7 stats +'+R.n[id]*10+'% \u00b7 rewards +'+R.n[id]*10+'%')}
// rekindled bosses survive death/reset/reload until they are killed again
const _mkB=mkBosses;mkBosses=function(){_mkB();ensureR();for(const a of arenas4())if(bossDead[a.id]&&R.act[a.id])enemies.push(mkRB(a))};
// kill rewards: gold / exp +10% per rekindling (plus echoes); no duplicate unique weapon or cache
const _fbS=finishBoss;finishBoss=function(B){
 if(!B.rs||B.id==='deity'){_fbS(B);return}
 ensureR();const d=B.def,mult=.1*B.rs,w0=new Set(inv);
 _fbS(B);
 for(let i=inv.length-1;i>=0;i--){const w=inv[i];if(!w0.has(w)&&w.unique&&w.kind===BD[B.id].wpn){inv.splice(i,1);break}}
 const k='cache'+B.id;chests=chests.filter((c,i,ar)=>c.k!==k||(!opened[k]&&ar.findIndex(q=>q.k===k)===i));
 const g=Math.round(150*d.tier*mult),xp=Math.round(300*d.tier*mult),ec=Math.round(100*d.tier*(1+mult));
 gold+=g;gainXp(xp);R.ek=(R.ek|0)+ec;R.act[B.id]=0;saveR();
 setTimeout(()=>{if(P)toast('Rekindled '+d.n+' vanquished \u00b7 +'+g+' gold \u00b7 +'+xp+' exp \u00b7 +'+ec+' \u2756 echoes banked')},2600);save()};

// ---------- platform-kick attacks (one unique attack per boss) ----------
const KICK={
 ember:  {id:'kickEmber',  nm:'CINDER KICK',     col:'255,120,20', fc:'#ffa04a',dm:1.0, up:-170,v:1},
 glacial:{id:'kickGlacial',nm:'GLACIER SHOVE',   col:'140,215,255',fc:'#bfe8ff',dm:1.0, up:-300,v:1},
 tempest:{id:'kickTempest',nm:'THUNDER KNOCK',   col:'255,255,120',fc:'#ffff9a',dm:1.15,up:-200,v:1.05,shock:.5},
 hollow: {id:'kickHollow', nm:'VOID SHOVE',      col:'170,120,255',fc:'#c8a8ff',dm:1.1, up:-240,v:1.1},
 deity:  {id:'kickDeity',  nm:'DIVINE EVICTION', col:'255,235,170',fc:'#fff2c0',dm:1.0, up:-260,v:1.25}};
// the platform the player is standing on inside arena a (null on the arena floor / in the air)
function platOf(a){if(!P||P.dead||!P.onGround||P.climb||!a)return null;const feet=P.y+22;
 if(a.fy*T-feet<T*1.5||Math.abs(P.x/T-a.cx)>=a.hw+1)return null;
 const tx=((P.x+6)/T)|0,ty=((feet+.5)/T)|0;if(!solid(tx,ty)||solid(tx,ty-1))return null;
 let xl=tx,xr=tx;while(xl>0&&solid(xl-1,ty)&&!solid(xl-1,ty-1))xl--;while(xr<W-1&&solid(xr+1,ty)&&!solid(xr+1,ty-1))xr++;
 return{xl:xl*T,xr:(xr+1)*T,y:ty*T}}
// kick direction: away from the boss, unless that edge is far and the other one is closer
function kdir(B,p){const c=P.x+6,dist=d=>d>0?p.xr-c:c-p.xl;let d=c>=bcx(B)?1:-1;if(dist(d)>150&&dist(-d)<dist(d))d=-d;return d}
function kickHit(B,p,K){const c=P.x+6,d=kdir(B,p),dist=d>0?p.xr-c:c-p.xl,l0=P.lives,t=.5;
 const r=hurtPlayer(bdm(B)*K.dm,B.def.pd*.8,B);
 if(r==='dodge'||r==='parry'||!P||P.dead||P.lives!==l0)return;
 P.kick={d,t,v:Math.min(720,Math.max(240,(dist+46)/t)*Math.max(1,K.v))};
 P.vx=d*P.kick.v;P.vy=K.up;P.onGround=false;P.climb=false;P.atk=0;P.jbuf=0;P.stun=Math.max(P.stun,t+.12)+(K.shock||0);
 shake=Math.max(shake,8);float(P.x,P.y-18,'KICKED!',K.fc)}
for(const id in KICK){const K=KICK[id];AT[K.id]={wu:.85,act:.5,rec:1.0,
 f(B){B.kfx=.5;const pl=platOf(B.ar);if(!pl||!B.kp||Math.abs(pl.y-B.kp.y)>2||pl.xr<=B.kp.xl||pl.xl>=B.kp.xr){B.kd=1;return}  // player left the platform: the kick whiffs
  B.kp=pl;B.kd=kdir(B,pl);kickHit(B,pl,K)},
 tk(B,dt){B.kfx=Math.max(0,(B.kfx||0)-dt)}}}
// trigger: player has been standing on a platform for a moment -> boss answers with its kick
const _ubK=updBoss;updBoss=function(B,dt){
 const K=KICK[B.id];
 if(K&&!B.dead&&P&&!P.dead&&!['dormant','intro','phase','broken','dying','stagger'].includes(B.st)){
  B.kcd=Math.max(0,(B.kcd||0)-dt);const pl=platOf(B.ar);B.kon=pl?(B.kon||0)+dt:0;
  if(pl&&B.st==='idle'&&B.kon>=1.2&&B.kcd<=0){const m=B.fury?.55:B.ph===2?.68:1;
   B.atk=K.id;B.kp=pl;B.st='tele';B.twu=B.t=AT[K.id].wu*m*1.15;B.vx=0;B.chain=0;B.kcd=B.fury?3.5:B.ph===2?4.5:6;B.kon=0;
   float(B.x+B.w/2,B.y-26,K.nm,K.fc)}}
 _ubK(B,dt)};
// the kicked player is flung sideways for a moment (no steering)
const _upK=updPlayer;updPlayer=function(dt){const k=P&&P.kick;if(k){if(P.dead||k.t<=0)P.kick=null;else{k.t-=dt;P.stun=Math.max(P.stun,.03);P.vx=k.d*k.v}}_upK(dt)};

// sounds
Object.assign(BSND,{
 kickEmber:(B,v)=>{v=v==null?1:v;noise(.5,.22*v,400,2400,'bandpass',2);tone(180,60,.4,'sawtooth',.14*v)},
 kickGlacial:(B,v)=>{v=v==null?1:v;noise(.35,.2*v,3000,8000,'highpass',1);tone(900,300,.3,'triangle',.1*v);tone(1400,500,.25,'sine',.06*v,.05)},
 kickTempest:(B,v)=>{v=v==null?1:v;noise(.3,.28*v,6000,500,'highpass',1);tone(2400,120,.25,'sawtooth',.12*v)},
 kickHollow:(B,v)=>{v=v==null?1:v;tone(110,40,.6,'sawtooth',.14*v);noise(.5,.16*v,200,1200,'bandpass',3)},
 kickDeity:(B,v)=>{v=v==null?1:v;[523,784,1046].forEach((f,i)=>tone(f,f*1.5,.4,'sine',.08*v,i*.05));noise(.4,.18*v,6000,300,'highpass',1)}});

// telegraph + strike visuals
function kdraw(B,ox,oy,L){const K=KICK[B.id];if(!K||B.dead||!B.kp||B.atk!==K.id)return;
 const p=B.kp,x0=p.xl-ox,x1=p.xr-ox,y=p.y-oy,w=x1-x0;if(x1<-20||x0>cv.width+20)return;const t=time;
 cx.save();
 if(B.st==='tele'){const k=1-c01(B.t/(B.twu||1)),d=P?kdir(B,p):1,fl=(t*(8+22*k)|0)%2;
  cx.fillStyle='rgba('+K.col+','+(.08+.26*k)+')';cx.fillRect(x0,y-36,w,36);cx.fillStyle='rgba('+K.col+','+(.55+.4*k)+')';cx.fillRect(x0,y-3,w,3);
  if(fl){cx.strokeStyle='rgba('+K.col+',.95)';cx.lineWidth=1.5;cx.strokeRect(x0+.5,y-35.5,w-1,35)}
  for(let i=0;i<w/18;i++){const xx=x0+(((i*18+t*60*d)%w)+w)%w;PL([xx,y-26,xx+6*d,y-18,xx,y-10],'rgba(255,255,255,'+(.3+.45*k)+')')}
  cx.textAlign='center';cx.font='bold 9px Georgia';cx.fillStyle=K.fc;cx.fillText(K.nm,(x0+x1)/2,y-42);L.push([(x0+x1)/2,y-18,60+k*50])}
 else if(B.st==='act'&&B.kfx>0){const q=1-B.kfx/.5,a=1-q,dir=B.kd||1;
  if(B.id==='ember'){const fx=dir>0?x0+w*q:x1-w*q,a0=dir>0?x0:fx,aw=Math.abs(fx-(dir>0?x0:x1));
   cx.globalCompositeOperation='lighter';cx.fillStyle='rgba(255,110,20,'+.7*a+')';cx.fillRect(a0,y-28,aw,28);cx.fillStyle='rgba(255,230,140,'+.8*a+')';cx.fillRect(a0,y-12,aw,12);
   for(let xx=a0;xx<a0+aw;xx+=7){const h=12+((xx*7+t*90)%24);PL([xx,y,xx+3.5,y-h-14,xx+7,y],'rgba(255,150,30,'+a+')')}L.push([fx,y-16,90])}
  else if(B.id==='glacial'){const g=Math.sin(Math.min(1,q*1.8)*Math.PI);cx.globalCompositeOperation='lighter';
   for(let xx=x0;xx<x1;xx+=14){const h=(18+((xx*13)%17))*g;PL([xx,y,xx+7,y-h-10,xx+14,y],'rgba(190,235,255,'+.9*a+')');PL([xx+3,y,xx+7,y-h,xx+9,y],'rgba(255,255,255,'+.8*a+')')}
   cx.fillStyle='rgba(140,215,255,'+.35*a+')';cx.fillRect(x0,y-6,w,6);L.push([(x0+x1)/2,y-20,90])}
  else if(B.id==='tempest'){cx.fillStyle='rgba(255,255,160,'+.3*a+')';cx.fillRect(x0,y-40,w,40);
   if(q<.65)for(let i=0;i<4;i++){const bx=x0+w*(i+.5)/4;bolt(bx+(Math.random()-.5)*8,y-150,bx,y,'#ffffb0',2.2);bolt(bx,y-150,bx+(Math.random()-.5)*12,y,'#fff',1)}L.push([(x0+x1)/2,y-30,110])}
  else if(B.id==='hollow'){cx.globalCompositeOperation='lighter';cx.fillStyle='rgba(60,10,110,'+.55*a+')';cx.fillRect(x0,y-36,w,36);
   cx.strokeStyle='rgba(200,160,255,'+a+')';cx.lineWidth=2;for(let i=0;i<3;i++){const e=q*18+i*8;cx.strokeRect(x0-e*.5,y-36-e,w+e,36+e)}
   for(let xx=x0;xx<x1;xx+=22)PL([xx,y,xx+4,y-30*a-8,xx+8,y],'rgba(20,0,40,.9)');L.push([(x0+x1)/2,y-18,90])}
  else{cx.globalCompositeOperation='lighter';
   for(let xx=x0+6;xx<x1;xx+=18){cx.fillStyle='rgba(255,245,200,'+.55*a+')';cx.fillRect(xx,y-170*Math.min(1,q*3),8,170*Math.min(1,q*3));cx.fillStyle='rgba(255,255,255,'+.9*a+')';cx.fillRect(xx+3,y-170*Math.min(1,q*3),2,170*Math.min(1,q*3))}
   cx.fillStyle='rgba(255,235,170,'+.45*a+')';cx.fillRect(x0,y-10,w,10);L.push([(x0+x1)/2,y-40,130])}}
 cx.restore()}
const _dfx=drawFx;drawFx=function(ox,oy,L){_dfx(ox,oy,L);for(const B of enemies)if(B.boss)kdraw(B,ox,oy,L)};
})();