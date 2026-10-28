'use strict';
// ===== Ashfall Depths: Patch 4 (load AFTER patch3.js) =====
// Optional tutorial with the guide Choiatsm: asked after every New Game · flat training world · pixel dialogue box with his portrait
// movement / jump / double jump / ladder / strike / mine / elixir / sheet, then dodge · block · parry drills where Choiatsm (invulnerable, harmless) really attacks you
(()=>{
// ---- art hooks: drop these files next to index.html (optional; a pixel-art fallback is drawn if they are missing) ----
const CHOI_IMG='data:image/png;base64,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';          // portrait for the dialogue box (square-ish; downscaled to 48x48 for the pixel look)
const CHOI_NPC_IMG='data:image/png;base64,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';  // optional sprite for the in-world NPC (drawn ~24x34; transparent background)

const GY=28,XL=22,XR=168;               // ground row, west wall, east wall of the training world
let TUT=false,HM=null,N=null,cur=null,idx=-1,li=0,phase='',okT=0,tDodgeT=-9,tDJ=0,tHits=0,tTab=false,askArm=false,P0=null;
const TDK='ashfall_tutdone_v1';let TDONE=false;try{TDONE=localStorage.getItem(TDK)==='1'}catch(e){}
const markDone=()=>{if(TDONE)return;TDONE=true;try{localStorage.setItem(TDK,'1')}catch(e){}};
const K={},IMG={p:null,n:null,k:null},D={s:'',c:0,hint:'',hT:0};
const g$=id=>document.getElementById(id);

// ---------- styles ----------
{const s=document.createElement('style');s.textContent=`
#tutBox{position:fixed;left:50%;bottom:36px;transform:translateX(-50%);width:min(780px,94vw);z-index:55;display:flex;gap:14px;align-items:stretch;
 background:linear-gradient(#2a2140f5,#120d1ef5);border:2px solid #d9a441;box-shadow:0 0 0 2px #000,0 0 40px #ff9a3a44,inset 0 0 30px #000;padding:12px 16px;text-align:left;cursor:pointer}
#tutBox canvas,#tutAsk canvas{width:96px;height:96px;flex:none;image-rendering:pixelated;border:2px solid #7a5a2e;outline:2px solid #000;background:#150f22}
#tutAsk canvas{display:block;margin:0 auto 10px}
#tutBox .tb-r{flex:1;min-width:0}
#tutBox .tb-n{font-weight:700;letter-spacing:4px;color:#ffd36b;font-size:13px;text-shadow:0 0 10px #ff8a2a}
#tutBox .tb-n small{letter-spacing:2px;color:#a8957a;font-weight:400;font-style:italic;margin-left:6px}
#tutBox .tb-t{font-size:16px;line-height:1.5;color:#f0e2c4;min-height:50px;margin-top:4px}
#tutBox .tb-o{font-size:13px;color:#9fe;letter-spacing:1px;min-height:16px;margin-top:2px}
#tutBox .tb-h{font-size:11px;color:#a8957a;font-style:italic;min-height:14px;margin-top:2px}
#tutBox .tb-h.bad{color:#ff9a8a}
#tutSkip{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:56;padding:6px 16px;font-size:11px}
#volp{left:auto!important;right:18px;top:50%;transform:translateY(-50%)!important;min-width:260px;max-width:min(300px,40vw)}
#tutAsk{max-width:460px}#tutAsk h1{font-size:26px}#tutAskTxt{font-size:15px;line-height:1.6;color:#e8dcc8;margin:6px 0 14px;font-style:italic}`;
document.head.appendChild(s)}

// ---------- images ----------
function loadImg(src,k){const i=new Image();i.onload=()=>{IMG[k]=i;paintAll()};i.onerror=()=>{};i.src=src}
loadImg(CHOI_IMG,'p');loadImg(CHOI_NPC_IMG,'n');
const pg=(g,p,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.closePath();g.fill()};
function paintPort(c){if(!c)return;const g=c.getContext('2d');g.globalCompositeOperation='source-over';g.imageSmoothingEnabled=true;g.clearRect(0,0,48,48);
 if(IMG.p){const w=IMG.p.width,h=IMG.p.height,s=Math.min(w,h);g.drawImage(IMG.p,(w-s)/2,0,s,s,0,0,48,48);return}
 g.imageSmoothingEnabled=false;
 const bg=g.createLinearGradient(0,0,0,48);bg.addColorStop(0,'#1b1530');bg.addColorStop(1,'#43264a');g.fillStyle=bg;g.fillRect(0,0,48,48);
 const gl=g.createRadialGradient(24,44,2,24,44,30);gl.addColorStop(0,'rgba(255,150,60,.5)');gl.addColorStop(1,'rgba(255,150,60,0)');g.fillStyle=gl;g.fillRect(0,0,48,48);
 pg(g,[0,48,3,38,14,31,34,31,45,38,48,48],'#34406a');pg(g,[0,48,3,38,10,34,12,48],'#27315a');g.fillStyle='#d9a441';g.fillRect(12,43,24,2);
 pg(g,[24,2,36,9,40,25,35,35,13,35,8,25,12,9],'#2a3358');pg(g,[24,2,12,9,8,25,13,35,16,30,13,24,16,11],'#3c4a7e');
 pg(g,[24,8,33,14,35,26,30,33,18,33,13,26,15,14],'#0b0814');
 pg(g,[24,12,31,16,31,27,27,33,21,33,17,27,17,16],'#e9e1cc');pg(g,[24,12,31,16,31,27,27,33,25,33,26,20],'#cfc6ae');
 g.fillStyle='#ffc85a';g.fillRect(19,21,4,3);g.fillRect(26,21,4,3);g.fillStyle='#fff6d0';g.fillRect(20,21,1,1);g.fillRect(27,21,1,1);
 g.fillStyle='#ff8a1a';g.fillRect(23,14,2,4);
 g.globalCompositeOperation='lighter';for(const ex of[21,28]){const e=g.createRadialGradient(ex,22,0,ex,22,7);e.addColorStop(0,'rgba(255,200,90,.55)');e.addColorStop(1,'rgba(255,200,90,0)');g.fillStyle=e;g.fillRect(ex-7,15,14,14)}
 g.globalCompositeOperation='source-over'}
function paintAll(){paintPort(g$('tutPort'));paintPort(g$('tutAskPort'))}
paintAll();

// ---------- the training world ----------
function genTut(){const t=new Uint8Array(W*H),set=(x,y,v)=>{t[y*W+x]=v};
 for(let x=0;x<W;x++)for(let y=0;y<H;y++){if(x<=XL||x>=XR){t[y*W+x]=3;continue}if(y===GY)t[y*W+x]=1;else if(y>GY)t[y*W+x]=y<GY+6?2:3}
 for(let x=50;x<=52;x++)for(let y=GY-2;y<GY;y++)set(x,y,y===GY-2?1:2);          // low step (jump)
 for(let x=62;x<=65;x++)for(let y=GY-5;y<GY;y++)set(x,y,y===GY-5?1:3);          // tall block (double jump)
 for(let x=80;x<=89;x++){set(x,22,1);set(x,23,3)}for(let y=21;y<=27;y++)set(79,y,6); // ladder + platform
 for(let x=108;x<=114;x++)for(let y=25;y<GY;y++)set(x,y,3);set(110,25,4);set(112,25,4); // ore mound
 return t}
const SIGNS=[[40,'MOVE'],[50,'JUMP'],[62,'DOUBLE JUMP'],[77,'LADDER'],[98,'STRIKE'],[111,'MINE'],[128,'TRAINING RING']];
function mkDummy(){const x=100*T;return{x:x-7,y:GY*T-26,w:14,h:26,vx:0,vy:0,hp:1e9,max:1e9,post:0,pmax:1,st:'idle',t:0,face:-1,lvl:1,dead:false,hit:false,home:x,tdummy:1,flash:0}}

// ---------- Choiatsm (the NPC) ----------
function mkNpc(x){return{x,y:GY*T-22,w:14,h:22,face:-1,st:'idle',t:0,wt:.8,cd:1.2,bob:0,mv:0,fl:0}}
const gTop=(x,r0)=>{let r=Math.max(0,r0);while(r<H&&!solid(x/T|0,r))r++;return r*T};

function tRes(r){const t=cur&&cur.task;if(!t||phase!=='task'||!t.combat)return;const c=t.combat;let good;
 if(c==='dodge')good=r==='dodge';else if(c==='block')good=r==='block'||r==='parry';else good=r==='parry';
 if(good){K.n++;tone(880,1320,.25,'sine',.05);tone(1320,1760,.2,'sine',.03,.05);return}
 if(r==='whiff')return;
 if(r==='hit-aim')return hint('Aim the cursor at me while you guard!',1);
 if(r==='dodge')return hint('Nicely dodged \u2014 but I asked for the guard.');
 if(r==='parry'||r==='block'){if(c==='dodge')return hint('A guard, not a roll. Press Shift when the glow begins.',1);return hint(t.hints[0],1)}
 hint(t.hints[(K.miss=(K.miss|0)+1)%t.hints.length],1)}
function strike(){const f=N.face,pc=P.x+6,nc=N.x+7,dx=pc-nc,dy=(P.y+11)-(N.y+11),wouldHit=dx*f>-8&&Math.abs(dx)<46&&Math.abs(dy)<30;let r='whiff';
 if(P.inv>0||time-tDodgeT<.5){if(Math.abs(dx)<120)r='dodge'}
 else if(wouldHit){let da=Math.atan2(N.y+11-(P.y+11),nc-pc)-(P.blockAng||0);da=Math.atan2(Math.sin(da),Math.cos(da));const fac=Math.abs(da)<1.3;
  if(P.blocking&&fac&&P.guardBroken<=0)r=time-P.blockT<=.2+S.parry?'parry':'block';else r=P.blocking&&!fac?'hit-aim':'hit'}
 N.st='atk';N.t=.2;N.fl=.2;sfx.swing();Audio_.beep(260,.12,'sawtooth',.07);N.x+=f*10;
 if(r==='dodge')float(P.x,P.y-8,'dodge','#9cf');
 else if(r==='parry'){sfx.parry();burst(P.x+6+P.face*10,P.y+8,12,'#fff');shake=4;hitstop=.08;float(P.x,P.y-12,'PARRY','#ffd');P.pcd=0;P.stam=Math.min(maxStam(),P.stam+15);
  N.st='stag';N.t=.9;float(N.x,N.y-10,'staggered','#ffd36b')}
 else if(r==='block'){sfx.block();float(P.x,P.y-6,'block','#aaa');P.stam=Math.max(1,P.stam-8);P.vx=(pc<nc?-1:1)*60}
 else if(r==='hit'||r==='hit-aim'){sfx.hit();burst(P.x+6,P.y+10,6,'#aaa');float(P.x,P.y-6,'no damage','#bbb');P.vx=(pc<nc?-1:1)*140;P.vy=-80;P.inv=Math.max(P.inv,.35)}
 tRes(r)}

function tutUpd(dt){if(!N)return;chests.length=0;const t=phase==='task'&&cur&&cur.task;
 if(t&&t.low)P.hp=Math.max(P.hp,1);else if(!pokeLive())P.hp=Math.max(P.hp,maxHp());
 N.bob+=dt;N.fl=Math.max(0,N.fl-dt);for(const e of enemies)if(e.tdummy)e.flash=Math.max(0,e.flash-dt);
 pokeUpd(dt);
 const dx=P.x+6-(N.x+7),ad=Math.abs(dx),fight=t&&t.combat;
 if(N.st==='idle'){N.face=dx>0?1:-1;
  if(fight){if(ad>40)N.x+=Math.sign(dx)*130*dt;N.cd-=dt;
   if(N.cd<=0&&ad<=62){N.st='wind';N.wt=N.t=t.wt*(.92+Math.random()*.22);Audio_.beep(150,.3,'sawtooth',.1);Audio_.beep(300,.2,'square',.06)}}
  else if(!(t&&t.boss)){if(ad>110)N.mv=1;if(ad<70)N.mv=0;if(N.mv)N.x+=Math.sign(dx)*120*dt}}
 else if(N.st==='wind'){N.t-=dt;if(!fight){N.st='idle'}else if(N.t<=0)strike()}
 else{N.t-=dt;if(N.t<=0){if(N.st==='atk'){N.st='rec';N.t=.6}else{N.st='idle';N.cd=.9+Math.random()*.7}}}
 N.x=Math.max((XL+2)*T,Math.min((XR-3)*T,N.x));
 const ty=gTop(N.x+7,((P.y+22)/T|0)-3)-22;N.y+=(ty-N.y)*Math.min(1,dt*10)}

// ---------- drawing ----------
function drawNpc(ox,oy,L){if(!N)return;const X=Math.round(N.x+7-ox),Y=Math.round(N.y+22-oy+Math.sin(N.bob*2.2)*1.5),f=N.face||1;if(X<-60||X>cv.width+60)return;
 const wind=N.st==='wind',atk=N.st==='atk',stg=N.st==='stag',wp=wind?clamp(1-N.t/N.wt,0,1):0;
 cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(X-7,Math.round(N.y+22-oy),14,2);
 if(IMG.n){cx.save();cx.imageSmoothingEnabled=false;cx.translate(X,Y);cx.scale(f,1);if(stg)cx.globalAlpha=.7;cx.drawImage(IMG.n,-15,-42,30,42);cx.restore()}
 else{const rb=stg?'#b8c0dc':'#34406a',rh=stg?'#dde':'#2a3358';
  PL([X-8,Y,X-6,Y-14,X+6,Y-14,X+8,Y],rb);PL([X-8,Y,X-6,Y-14,X-3,Y-14,X-4,Y],'rgba(0,0,0,.28)');FR(X-8,Y-2,16,2,'#d9a441');FR(X-6,Y-9,12,2,'#d9a441');
  PL([X-6,Y-13,X-6,Y-24,X-2,Y-30,X+2,Y-30,X+6,Y-24,X+6,Y-13],rh);FR(X-4,Y-24,8,9,'#0b0814');FR(X-3,Y-23,6,8,'#e9e1cc');
  FR(X-2+(f>0),Y-20,1,2,'#ffc85a');FR(X+1+(f>0),Y-20,1,2,'#ffc85a');FR(X-1,Y-22,2,2,'#ff8a1a')}
 // training blade
 const hx=X+f*6,hy=Y-11;let ang=f>0?.9:Math.PI-.9;if(wind)ang=f>0?-2-wp*.35:Math.PI+2+wp*.35;else if(atk){const q=clamp(1-N.t/.2,0,1);ang=f>0?-1.3+q*2.6:Math.PI+1.3-q*2.6}
 cx.save();cx.translate(hx,hy);cx.rotate(ang);FR(0,-2,5,4,'#6a4a2a');FR(5,-2,20,4,'#c9a46a');FR(5,-1,20,1,'#fff2c8');cx.restore();
 if(wind){const pulse=(time*(10+wp*20)|0)%2,pc=X,py=Y-11;L.push([pc,py,60+wp*40]);
  cx.save();cx.translate(pc,py);cx.fillStyle='rgba(255,40,40,'+(.1+.3*wp)+')';cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,40,f>0?-1.1:Math.PI-1.1,f>0?1.1:Math.PI+1.1);cx.closePath();cx.fill();
  cx.strokeStyle='rgba(255,100,70,'+(.5+.5*wp)+')';cx.lineWidth=1.5;cx.stroke();cx.strokeStyle='rgba(255,60,60,'+(.4+.6*wp)+')';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,34*(1-wp)+8,0,7);cx.stroke();
  if(N.t<.2){cx.strokeStyle='#fff';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,13,0,7);cx.stroke();cx.fillStyle='rgba(255,255,255,.25)';cx.fill()}cx.restore();
  if(pulse){cx.fillStyle='rgba(255,60,60,.25)';cx.fillRect(X-8,Y-30,16,30)}bang(X,Y-(IMG.n?46:32))}
 if(atk){const q=clamp(1-N.t/.2,0,1),a=f>0?-1.3+q*2.6:Math.PI+1.3-q*2.6;L.push([X+f*18,Y-11,80]);cx.save();cx.translate(X,Y-11);
  const cols=['rgba(255,40,40,.45)','rgba(255,150,50,.85)','#fff'],lw=[11,6,2];for(let k=0;k<3;k++){cx.strokeStyle=cols[k];cx.lineWidth=lw[k];cx.beginPath();if(f>0)cx.arc(0,0,34,a-1.3,a);else cx.arc(0,0,34,a,a+1.3);cx.stroke()}cx.restore()}
 if(stg){cx.fillStyle='#ffd36b';for(let k=0;k<3;k++)cx.fillRect(X-6+k*5,Y-36+Math.sin(time*12+k*2)*2,2,2)}
 orb(X,Y-16,26,'rgba(255,150,60,.28)');L.push([X,Y-14,70]);
 cx.save();cx.textAlign='center';cx.font='bold 8px Georgia';cx.shadowColor='#ff8a2a';cx.shadowBlur=5;cx.fillStyle='#ffd36b';cx.fillText('CHOIATSM',X,Y-(wind?(IMG.n?72:66):(IMG.n?48:38)));cx.restore()}
function drawDummy(e,ox,oy){const X=Math.round(e.x+7-ox),Y=Math.round(e.y+26-oy),w=e.flash>0?Math.sin(e.flash*50)*3:0;if(X<-40||X>cv.width+40)return;
 cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(X-8,Y,16,2);FR(X-2,Y-18,4,18,'#5a3c20');FR(X-7,Y-4,14,4,'#3a2614');
 cx.save();cx.translate(X,Y-17);cx.rotate(w*.03);FR(-10,-8,20,4,'#7a5430');FR(-10,-8,20,1,'#9a7040');FR(-6,-9,12,12,e.flash>0?'#fff':'#c9a46a');FR(-6,-9,12,2,'#e0c088');
 FR(-6,-2,12,2,'#a8362a');FR(-3,-12,6,6,'#d8c090');FR(-3,-12,6,1,'#f0dcae');FR(-2,-10,1,1,'#222');FR(1,-10,1,1,'#222');cx.restore()}
function drawSign(ox,oy,tx,txt){const X=Math.round(tx*T+8-ox),Y=Math.round(GY*T-oy);if(X<-60||X>cv.width+60)return;
 FR(X-1,Y-16,2,16,'#3a2614');cx.font='bold 7px Georgia';const w=cx.measureText(txt).width+8;FR(X-w/2,Y-26,w,11,'#5a3c20');FR(X-w/2,Y-26,w,1,'#7a5430');
 cx.save();cx.textAlign='center';cx.fillStyle='#ffd36b';cx.fillText(txt,X,Y-18);cx.restore()}
function drawTut(ox,oy,L){for(const s of SIGNS)drawSign(ox,oy,s[0],s[1]);drawNpc(ox,oy,L);drawPokeFx(ox,oy,L);
 const t=phase==='task'&&cur&&cur.task&&cur.task.target;if(t){const p=t(),X=Math.round(p.x-ox),Y=Math.round(p.y-oy+Math.sin(time*4)*3);
  cx.save();cx.shadowColor='#ffb02a';cx.shadowBlur=8;PL([X-6,Y-8,X+6,Y-8,X,Y],'#ffd36b');cx.restore();L.push([X,Y,50])}}

// ---------- the lesson ----------
const dj0=djFx;djFx=function(){if(TUT)tDJ++;return dj0()};
const td0=tryDodge;tryDodge=function(){const d0=P?P.dodge:0;td0();if(TUT&&P&&d0<=0&&P.dodge>0)tDodgeT=time};
addEventListener('keydown',e=>{if(!TUT||e.repeat)return;if(e.code==='Tab')tTab=true;if(e.code==='Enter')advance()});

// ======================= POKE (secret boss after the lessons) =======================
const POKE_IMG='data:image/png;base64,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';
IMG.k=null;loadImg(POKE_IMG,'k');
let PK=null,PSW=[],PPT=[],PWV=[],PBM=null;
const PKEY='ashfall_poke_v1';let PE={seed:-1,ec:0};try{const d=JSON.parse(localStorage.getItem(PKEY));if(d&&typeof d.ec==='number')PE=d}catch(e){}
const _se0=window.shrineEchoes;window.shrineEchoes=()=>(typeof _se0==='function'?_se0():0)+(PE.seed===seed?PE.ec:0);   // Poke's 500 echoes join the banked total
{const s=document.createElement('style');s.textContent=`
#pkBar{position:fixed;top:48px;left:50%;transform:translateX(-50%);width:min(520px,80vw);z-index:30;text-align:center;pointer-events:none}
#pkBar .pk-n{font-weight:700;letter-spacing:10px;color:#ff6a5a;text-shadow:0 0 12px #f00,0 2px 0 #000;font-size:15px;margin-bottom:3px;padding-left:10px}
#pkBar .bar{height:14px}#pkBar .bar i{background:linear-gradient(#ff7a7a,#7a0e1a)}
#pkWarn{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:31;pointer-events:none;font-size:46px;font-weight:700;letter-spacing:12px;color:#ff3a3a;text-shadow:0 0 24px #f00,0 3px 0 #000;animation:pkw .22s steps(2) infinite;white-space:nowrap}
#pkWarn.go{color:#fff;text-shadow:0 0 30px #ffd36b,0 0 60px #fff,0 3px 0 #000;animation-duration:.1s}
@keyframes pkw{0%{opacity:1}50%{opacity:.35}}
@media(max-width:600px){#pkWarn{font-size:24px;letter-spacing:5px}}`;document.head.appendChild(s)}
{const b=document.createElement('div');b.id='pkBar';b.className='hidden';b.innerHTML='<div class="pk-n">POKE</div><div class="bar hp"><i></i><span></span></div>';document.body.appendChild(b);
 const w=document.createElement('div');w.id='pkWarn';w.className='hidden';w.textContent='\u26a0 PARRY \u26a0';document.body.appendChild(w)}

const PCH=4.5,PWN=1.8;   // Enuma Elish: charge time, parry-warning time (s)
const PG=()=>GY*T;
const pcen=()=>({x:PK.x+PK.w/2,y:PK.y+PK.h/2});
function pokeShout(s){if(PK)PK.sh={s,t:1.7}}
function mkPoke(){const x=156*T;return{x:x-12,y:PG()-54,w:24,h:54,vx:0,vy:0,hp:1000,max:1000,post:0,pmax:1,st:'enter',t:1.8,face:-1,lvl:1,dead:false,hit:false,home:x,tpoke:1,flash:0,act:0,res:'',cd:1.2,seq:[],k:0,ph:0,sh:null,fin:0,sg:30}}
function pokeClear(){PK=null;PSW=[];PPT=[];PWV=[];PBM=null;const b=g$('pkBar'),w=g$('pkWarn');if(b)b.classList.add('hidden');if(w)w.classList.add('hidden')}
function pokeEnter(){if(PK)return;markDone();enemies=enemies.filter(e=>!e.tdummy);PK=mkPoke();enemies.push(PK);PSW=[];PPT=[];PWV=[];PBM=null;
 const x=PK.x+12,y=PK.y+26;burst(x,y,40,'#ffd36b');burst(x,y,24,'#fff');shake=Math.max(shake,5);tone(200,900,.8,'sine',.1);tone(300,1350,.8,'triangle',.06,.1);noise(.6,.1,3000,400,'bandpass',2);
 pokeShout('Heh\u2026 so you are the new choom?')}
function pokeStart(){if(!PK)return;PK.act=1;PK.cd=1.6;if(PK.st==='wait')PK.st='idle';
 P.hp=maxHp();P.stam=maxStam();P.post=0;P.el=Math.max(P.el|0,3);P.ecd=0;P.inv=Math.max(P.inv,1);tone(110,55,.8,'sawtooth',.12);pokeShout('Show me what you can do!')}
function nextAtk(){const s=PK.seq;if(!s.length){const a=['gate','rapid','aerial','almighty'];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}PK.seq=a}return PK.seq.shift()}
function swd(x,y,a,sp,k,l){PSW.push({x,y,a,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,k,l:l||2.6})}
function pokeAtk(){const e=PK,a=nextAtk();e.t=0;e.k=0;e.vx=0;const pc=P.x+6,pcy=P.y+11;
 if(a==='gate'){e.st='gate';pokeShout('GATES OF BABYLON!');PPT=[];const n=7,o=Math.random()*5|0;
  for(let i=0;i<n;i++){const ang=-2.85+i*(2.55/(n-1)),r=70+(i%3)*22;PPT.push({x:pc+Math.cos(ang)*r,y:pcy+Math.sin(ang)*r,t:-i*.14,d:.7,a:0,f:0,k:(i+o)%5})}
  tone(300,900,.5,'sine',.08);tone(450,1350,.5,'triangle',.05,.05)}
 else if(a==='rapid'){e.st='rapid';pokeShout('RAPID FIRE!');tone(220,660,.4,'sawtooth',.06)}
 else if(a==='aerial'){e.st='jump';e.ph=0;e.vy=-560;pokeShout('AERIAL BOMBARDMENT!');tone(150,420,.3,'sawtooth',.08);burst(e.x+12,e.y+e.h,12,'#ff9a3a')}
 else if(a==='almighty')pokeAlmighty();
 else pokeEnuma()}
// THE ALMIGHTY: 4s of invulnerability (heals 100 HP, still fires swords) while Poke is turned black and covered in yellow eyes
const ALM_T=4;
function pokeAlmighty(){const e=PK;e.st='almighty';e.t=0;e.vx=0;e.alm=1;e.hh=0;e.k=0;e.eyes=[];
 for(let i=0;i<24;i++)e.eyes.push({k:0,ox:(Math.random()-.5)*34,oy:-4-Math.random()*48,r:2.5+Math.random()*4.5,rot:(Math.random()-.5)*2.4,ph:Math.random()*Math.PI*2,sp:1.2+Math.random()*1.6,d:.05+Math.random()*.5});
 for(let i=0;i<14;i++)e.eyes.push({k:1,ang:Math.random()*6.283,rad:30+Math.random()*34,r:5+Math.random()*7,rot:(Math.random()-.5)*2.4,ph:Math.random()*Math.PI*2,sp:1+Math.random()*1.4,d:.1+Math.random()*.6,w:(Math.random()<.5?-1:1)*(.4+Math.random()*.5)});
 pokeShout('THE ALMIGHTY!');burst(e.x+12,e.y+26,26,'#ffe45a');shake=Math.max(shake,4);tone(130,70,1.1,'sawtooth',.12);tone(520,1040,.8,'sine',.06,.1);noise(.8,.08,2500,200,'bandpass',2)}
function pokeEyes(e,X,Y,bob){const t=e.t,fi=clamp(t/.6,0,1),fo=clamp((ALM_T-t)/.5,0,1),a=Math.min(fi,fo);if(a<=0)return;
 cx.save();cx.translate(X,Y+bob);
 for(const q of e.eyes){const g=clamp((t-q.d)/.35,0,1)*fo;if(g<=0)continue;
  let x,y;if(q.k){const an=q.ang+time*q.w;x=Math.cos(an)*q.rad;y=-28+Math.sin(an)*q.rad*.8}else{x=q.ox;y=q.oy}
  const bl=Math.max(.08,Math.min(1,.5+Math.sin(time*q.sp*2+q.ph)*1.6)),rx=q.r*(.7+.3*g)*1.5,ry=q.r*.7*bl*g;if(ry<.4)continue;
  cx.save();cx.translate(x,y);cx.rotate(q.rot+(q.k?Math.sin(time+q.ph)*.4:0));cx.globalAlpha=g;
  cx.fillStyle='#f6e66a';cx.strokeStyle='#000';cx.lineWidth=1;cx.beginPath();cx.ellipse(0,0,rx,ry,0,0,7);cx.fill();cx.stroke();
  cx.fillStyle='#000';cx.beginPath();cx.ellipse(0,0,rx*.28,Math.max(.4,ry*.8),0,0,7);cx.fill();cx.restore()}
 cx.restore()}
function pokeEnuma(){const e=PK;e.st='ascend';e.t=0;e.vx=0;e.vy=0;pokeShout('ENUMA ELISH!');tone(80,220,1.2,'sawtooth',.12);noise(1,.1,600,100,'lowpass')}
// Poke cannot be killed by damage: at 0 he is held at 1 HP and unleashes Enuma Elish. Parry it to win.
function pokeFinale(){const e=PK;if(!e||e.res||e.fin)return;e.fin=1;e.hp=1;e.stunned=0;PSW=[];PPT=[];PWV=[];zones=[];projs=[];
 burst(e.x+12,e.y+26,30,'#ff6a3a');shake=Math.max(shake,8);hitstop=Math.max(hitstop,.12);toast('Poke is at his limit\u2026 PARRY his final attack!');pokeEnuma()}
function pokeDmg(n){const e=PK;if(!e||e.res||e.fin||e.alm)return;e.hp-=n;e.flash=.12;if(e.hp<=1)pokeFinale()}
// 25% chance every 30s: Poke gets staggered
function pokeAngry(){const e=PK;e.st='stun';e.t=3.5;e.vx=0;e.stunned=0;pokeShout("He's getting angry");toast("He's getting angry\u2026");float(e.x,e.y-14,'STAGGERED','#ffd36b');
 burst(e.x+12,e.y+20,18,'#ff8a3a');shake=Math.max(shake,5);tone(160,60,.6,'sawtooth',.12);noise(.4,.1,900,120,'lowpass')}
function pokeHit(e){if(!e.act||e.res||e.fin||e.st==='enter'||e.st==='wait'){try{sfx.block()}catch(x){}float(e.x,e.y-6,'\u2026','#999');return}
 if(e.alm){try{sfx.block()}catch(x){}burst(e.x+12,e.y+20,5,'#ffe45a');float(e.x+6,e.y-4,'INVULNERABLE','#ffe45a');return}
 let d=dmgOut()*(P.combo===2?1.3:1);if(e.st==='stun')d*=1.5;d=Math.round(d);
 hitstop=.04;shake=Math.max(shake,2);sfx.hit();burst(e.x+12,e.y+20,8,'#c33');float(e.x+6,e.y-4,d,'#fff');pokeDmg(d)}
function pokeBeam(){const e=PK,c=pcen(),ang=Math.atan2(P.y+11-c.y,P.x+6-c.x);PBM={x:c.x,y:c.y,a:ang,t:.55};
 tone(900,60,.7,'sawtooth',.16);noise(.7,.2,5000,200,'bandpass',1);shake=Math.max(shake,10);
 if(P.blocking&&P.guardBroken<=0&&time-P.blockT<=.2+S.parry+.12)P.blockT=time;   // small grace so a parry on the white flash always counts
 const r=hurtPlayer(9999,60,{x:c.x,y:c.y,w:0,h:0,face:Math.cos(ang)>0?1:-1,post:0,st:'',t:0,stun:0});
 if(!PK||PK.res)return;
 if(r==='parry')pokeStun();
 else if(r==='dodge'){e.st='warn';e.t=0;e.go=0;e.tk=-1;pokeShout('Not so fast!')}
 else pokeLose()}
function pokeStun(){const e=PK;float(e.x,e.y-14,'PARRIED!','#ffd');burst(e.x+12,e.y+20,24,'#fff');hitstop=Math.max(hitstop,.2);pokeWin()}
function pokeLose(){const e=PK;if(!e||e.res)return;e.res='lose';enemies=enemies.filter(q=>q!==e);PSW=[];PPT=[];PWV=[];PBM=null;
 P.hp=maxHp();P.stam=maxStam();P.dead=0;P.inv=Math.max(P.inv,1.5);P.vx=P.vy=0;zones=[];projs=[];burst(e.x+12,e.y+26,30,'#ffd36b');pokeShout('Too slow!');tone(220,70,.8,'sawtooth',.1)}
function pokeReward(){P.lvl+=10;P.pts+=20;P.xp=0;P.lives=MAXL;P.hp=maxHp();PE={seed,ec:500};try{localStorage.setItem(PKEY,JSON.stringify(PE))}catch(e){}
 try{sfx.level()}catch(e){}toast('\u2726 +10 levels \u00b7 +20 points (Tab) \u00b7 +500 \u2756 echoes banked')}
function pokeWin(){const e=PK;if(!e||e.res)return;e.res='win';e.hp=0;enemies=enemies.filter(q=>q!==e);PSW=[];PPT=[];PWV=[];PBM=null;zones=[];projs=[];
 burst(e.x+12,e.y+26,60,'#ffd36b');burst(e.x+12,e.y+26,30,'#fff');shake=Math.max(shake,8);hitstop=.15;pokeShout('Not bad\u2026 not bad at all.');
 [523,659,784,1046].forEach((f,i)=>tone(f,f*1.5,.5,'sine',.06,i*.08));pokeReward()}

function updSwords(dt){for(const s of PSW){s.x+=s.vx*dt;s.y+=s.vy*dt;s.l-=dt;if(solid(s.x/T|0,s.y/T|0))s.l=0;
  if(s.l>0&&P.inv<=0&&!P.dead){const tx=s.x+Math.cos(s.a)*10,ty=s.y+Math.sin(s.a)*10;
   if(Math.hypot(P.x+6-s.x,P.y+11-s.y)<10||Math.hypot(P.x+6-tx,P.y+11-ty)<10){s.l=0;burst(s.x,s.y,6,'#ffd36b');hurtPlayer(15,12,{x:s.x,y:s.y,w:2,h:2,face:s.vx>0?1:-1,post:0})}}}
 PSW=PSW.filter(s=>s.l>0)}
function updWaves(dt){for(const w of PWV){w.l+=300*dt;const f=w.x+w.d*w.l;
  if(!w.h&&P.inv<=0&&Math.abs(P.x+6-f)<10&&P.y+22>PG()-14){w.h=1;hurtPlayer(15,18,{x:f,y:PG()-8,w:2,h:2,face:w.d,post:0})}}
 PWV=PWV.filter(w=>w.l<230)}
function pokeLand(){const e=PK,c=e.x+e.w/2;e.y=PG()-e.h;e.vy=0;PWV.push({x:c,d:-1,l:0,h:0},{x:c,d:1,l:0,h:0});shake=Math.max(shake,10);hitstop=.06;
 burst(c,PG(),30,'#ff8a2a');burst(c,PG(),14,'#ffe28c');tone(90,30,.7,'sawtooth',.18);noise(.7,.2,1500,80,'lowpass');
 if(Math.abs(P.x+6-c)<26&&P.y+22>=PG()-8&&P.inv<=0)hurtPlayer(15,20,{x:c,y:PG()-10,w:2,h:2,face:P.x+6>c?1:-1,post:0});
 if(PK&&!PK.res){e.st='rec';e.t=.8}}
function pokeUpd(dt){const e=PK;if(!e||!P)return;
 if(e.sh&&e.sh.t>0)e.sh.t-=dt;
 updSwords(dt);updWaves(dt);if(PBM){PBM.t-=dt;if(PBM.t<=0)PBM=null}
 if(e.res)return;
 e.flash=Math.max(0,e.flash-dt);
 if(e.act&&!e.fin){e.sg=(e.sg===undefined?30:e.sg)-dt;if(e.sg<=0&&e.st==='idle'){e.sg=30;if(Math.random()<.25)pokeAngry()}}
 const pc=P.x+6,ec=e.x+e.w/2;
 const clampX=()=>{e.x=Math.max(118*T,Math.min(164*T-e.w,e.x))};
 const trackX=sp=>{const d=pc-ec;e.x+=Math.sign(d)*Math.min(Math.abs(d),sp*dt);e.face=d>=0?1:-1;clampX()};
 switch(e.st){
 case'enter':e.t-=dt;e.face=pc>=ec?1:-1;if(e.t<=0)e.st=e.act?'idle':'wait';break;
 case'wait':e.face=pc>=ec?1:-1;break;
 case'idle':{const d=pc-ec;e.face=d>=0?1:-1;if(Math.abs(d)>150)trackX(60);else if(Math.abs(d)<50){e.x-=Math.sign(d)*40*dt;clampX()}
  e.cd-=dt;if(e.cd<=0)pokeAtk();break}
 case'gate':{e.t+=dt;e.face=pc>=ec?1:-1;
  for(const p of PPT){p.t+=dt;p.a=p.t<0?0:Math.min(1,p.t/.4);
   if(!p.f&&p.t>=p.d){p.f=1;swd(p.x,p.y,Math.atan2(P.y+11-p.y,pc-p.x),330,p.k);tone(900,1500,.12,'triangle',.05)}
   if(p.f&&p.t>p.d+.3)p.a=Math.max(0,1-(p.t-p.d-.3)/.3)}
  PPT=PPT.filter(p=>!p.f||p.t<p.d+.6);
  if(!PPT.length&&e.t>.5){e.st='idle';e.cd=1.2}break}
 case'rapid':{e.t+=dt;e.face=pc>=ec?1:-1;
  if(e.k<14){if(e.t>=.75+e.k*.1){e.k++;const ox=ec+e.face*12,oy=e.y+e.h*.35,a=Math.atan2(P.y+11-oy,pc-ox)+(Math.random()-.5)*.08;swd(ox,oy,a,470,Math.random()*5|0,1.8);tone(700+Math.random()*500,1400,.07,'triangle',.04)}}
  else if(e.t>.75+14*.1+.8){e.st='idle';e.cd=1.2}break}
 case'jump':{
  if(e.ph===0){e.vy+=1500*dt;e.y+=e.vy*dt;trackX(230);if(e.vy>=0){e.ph=1;e.t=0;e.vy=0}}
  else if(e.ph===1){e.t+=dt;trackX(260);if(e.t>=.45){e.ph=2;e.vy=1100;tone(500,100,.4,'sawtooth',.08)}}
  else{e.y+=e.vy*dt;if(e.y+e.h>=PG())pokeLand()}break}
 case'almighty':{e.t+=dt;e.face=pc>=ec?1:-1;
  // heals 100 HP in total over the 4s, and keeps attacking: a sword every .4s aimed at the player
  {const h=Math.min(100/ALM_T*dt,e.max-e.hp);if(h>0){e.hp+=h;e.hh=(e.hh||0)+h;if(e.hh>=25){e.hh-=25;float(e.x+6,e.y-6,'+25','#7aff8a');burst(ec,e.y+e.h*.5,4,'#7aff8a')}}}
  if(Math.abs(pc-ec)>150)trackX(60);
  if(e.k<8&&e.t>=.6+e.k*.4){e.k++;const ox=ec+e.face*12,oy=e.y+e.h*.35,a=Math.atan2(P.y+11-oy,pc-ox)+(Math.random()-.5)*.1;swd(ox,oy,a,430,Math.random()*5|0,1.8);tone(600+Math.random()*400,1200,.07,'triangle',.04)}
  if(e.t>=ALM_T){e.alm=0;e.hh=0;e.k=0;e.eyes=null;e.st='idle';e.cd=1.3;burst(ec,e.y+e.h*.5,16,'#ffe45a');tone(400,200,.3,'sine',.07)}break}
 case'rec':e.t-=dt;if(e.t<=0){e.st='idle';e.cd=1.3}break;
 case'ascend':{e.t+=dt;e.face=pc>=ec?1:-1;e.y+=((PG()-e.h-150)-e.y)*Math.min(1,dt*3.2);if(e.t>=1.1){e.st='charge';e.t=0}break}
 case'charge':{e.t+=dt;e.face=pc>=ec?1:-1;if(e.t>=PCH){e.st='warn';e.t=0;e.go=0;e.tk=-1;pokeShout('PARRY\u2026 OR PERISH!');tone(300,100,1,'sawtooth',.1)}break}
 case'warn':{e.t+=dt;e.face=pc>=ec?1:-1;const win=.2+S.parry,k=Math.floor(e.t/.25);
  if(!e.go&&k!==e.tk&&e.t<PWN-win){e.tk=k;tone(520+k*50,520+k*50,.07,'square',.05)}            // ticking countdown
  if(!e.go&&e.t>=PWN-win){e.go=1;tone(1568,1568,.22,'sine',.13);tone(2093,2093,.22,'triangle',.08,.02)}   // the parry window is open: chime + white flash
  if(e.t>=PWN)pokeBeam();break}
 case'fall':{e.vy+=1500*dt;e.y+=e.vy*dt;if(e.y+e.h>=PG()){e.y=PG()-e.h;e.vy=0;shake=Math.max(shake,5);burst(ec,PG(),14,'#ffd36b');e.st=e.stunned?'stun':'idle';e.t=3.5;e.cd=2;e.stunned=0}break}
 case'stun':e.t-=dt;if(e.t<=0){e.st='idle';e.cd=1.4}break;
 }}
function pkUI(){const b=g$('pkBar'),w=g$('pkWarn'),on=!!(TUT&&PK&&PK.act&&!PK.res);b.classList.toggle('hidden',!on);
 if(on){b.querySelector('i').style.width=Math.max(0,PK.hp/PK.max*100)+'%';b.querySelector('span').textContent=Math.max(0,Math.ceil(PK.hp))+' / '+PK.max}
 w.classList.toggle('hidden',!(TUT&&PK&&!PK.res&&PK.st==='warn'&&!paused));
 if(PK){w.textContent=PK.go?'\u2694 PARRY NOW! \u2694':'\u26a0 AIM AT HIM \u00b7 GET READY \u26a0';w.classList.toggle('go',!!PK.go)}}
const pokeLive=()=>!!(PK&&PK.act&&!PK.res);

// ---- drawing ----
function sword(k,X,Y,a,al){cx.save();cx.translate(X,Y);cx.rotate(a);cx.globalAlpha=al==null?1:al;const G='#ffd36b',B='#f2f6ff';
 if(k===0){FR(-8,-1,6,2,'#6a3a1a');FR(-3,-4,2,8,G);FR(-1,-1.5,17,3,B);FR(-1,-.5,17,1,'#fff');PL([16,-1.5,20,0,16,1.5],B)}
 else if(k===1){PL([-1,-1.5,10,-3,18,-1,20,3,16,1,8,1.5,-1,1.5],B);FR(-6,-1,5,2,'#6a3a1a');FR(-2,-3.5,2,7,G)}
 else if(k===2){FR(-12,-.75,22,1.5,'#a07840');PL([10,-3,22,0,10,3],B);FR(8,-3,2,6,G)}
 else if(k===3){FR(-8,-1.5,6,3,'#4a2a6a');FR(-3,-6,3,12,G);FR(0,-3,16,6,B);PL([16,-3,22,0,16,3],B);FR(0,-.5,16,1,G)}
 else{FR(-5,-1,4,2,'#6a3a1a');FR(-1,-3,2,6,G);PL([1,-2,10,0,1,2],B)}
 cx.restore()}
function drawPoke(e,ox,oy,L){if(e.res)return;const X=Math.round(e.x+e.w/2-ox),Y=Math.round(e.y+e.h-oy);if(X<-90||X>cv.width+90||Y<-120||Y>cv.height+140)return;
 const gy=Math.round(PG()-oy),hg=Math.max(0,gy-Y),al=e.st==='enter'?clamp(1-e.t/1.8,.12,1):1,fl=e.face||1;
 cx.fillStyle='rgba(0,0,0,'+Math.max(.08,.38-hg/380)+')';cx.fillRect(X-13,gy-1,26,2);
 const air=e.st==='charge'||e.st==='warn'||e.st==='ascend',bob=air?Math.sin(time*3)*2:0,cy=Y-28+bob;
 if(e.st==='enter'){orb(X,cy,50,'rgba(255,200,70,'+(.5*(1-al))+')');const r=22*(1-al*.5);cx.save();cx.strokeStyle='rgba(255,220,100,'+(1-al*.6)+')';cx.lineWidth=2;cx.beginPath();cx.ellipse(X,Y-26,r*.5,r*1.4,0,0,7);cx.stroke();cx.restore()}
 orb(X,cy,38,'rgba(190,20,40,'+(.2+.08*Math.sin(time*4))+')');
 if(IMG.k){cx.save();cx.globalAlpha=al;cx.translate(X,Y+bob);cx.scale(fl>0?1:-1,1);if(e.alm)cx.filter='brightness(0)';else if(e.flash>0)cx.filter='brightness(3)';cx.drawImage(IMG.k,-19,-56,38,56);cx.restore()}
 else{FR(X-10,Y-48+bob,20,48,'#111')}
 if(e.alm&&e.eyes){const q=clamp(e.t/.6,0,1)*clamp((ALM_T-e.t)/.5,0,1);orb(X,cy,46,'rgba(255,230,70,'+(.22*q+.08*Math.sin(time*6))+')');pokeEyes(e,X,Y,bob);L.push([X,cy,60*q])}
 if(e.st==='gate'||e.st==='rapid'||e.st==='jump'){const g=e.st==='jump'?'rgba(255,120,30,.55)':'rgba(255,210,90,.55)';orb(X+fl*14,Y-34+bob,16,g);orb(X-fl*14,Y-34+bob,12,g)}
 if(e.st==='jump'&&e.ph>=1)orb(X,Y-6,34,'rgba(255,100,20,.5)');
 if(e.st==='charge'||e.st==='warn'){const q=e.st==='warn'?1:clamp(e.t/PCH,0,1),r=8+q*26;
  orb(X,cy-30,r*1.8,'rgba(255,40,40,'+(.25+.35*q)+')');orb(X,cy-30,r*.9,'rgba(255,220,160,'+(.35+.4*q)+')');
  cx.save();cx.translate(X,cy-30);cx.strokeStyle='rgba(255,90,60,'+(.4+.5*q)+')';cx.lineWidth=1.5;
  for(let i=0;i<3;i++){cx.beginPath();cx.ellipse(0,0,r*(1+i*.35),r*(.35+i*.1),time*(1.5+i*.6)+i,0,7);cx.stroke()}
  for(let i=0;i<8;i++){const ph=(time*.9+i/8)%1,a=i*.785+time,rr=60*(1-ph)+4;FR(Math.cos(a)*rr-1,Math.sin(a)*rr*.7-1,2,2,'rgba(255,200,120,'+ph+')')}
  cx.restore();L.push([X,cy-30,70+q*60])}
 if(e.st==='stun'){for(let k=0;k<3;k++){const a=time*4+k*2.1;FR(X+Math.cos(a)*14-1,Y-60+Math.sin(a)*4,3,3,'#ffd36b')}}
 L.push([X,cy,50])}
function drawPokeFx(ox,oy,L){if(!PK)return;const gy=Math.round(PG()-oy);
 for(const p of PPT){if(p.a<=0)continue;const X=Math.round(p.x-ox),Y=Math.round(p.y-oy);if(X<-60||X>cv.width+60||Y<-60||Y>cv.height+60)continue;
  const aim=Math.atan2(P.y+11-p.y,P.x+6-p.x),a=p.a,r=12*a;
  orb(X,Y,28*a,'rgba(255,200,70,'+(.5*a)+')');
  if(p.t<p.d&&p.t>p.d-.5){const q=(p.t-(p.d-.5))/.5;sword(p.k,X+Math.cos(aim)*(-10+q*12),Y+Math.sin(aim)*(-10+q*12),aim,q)}
  cx.save();cx.translate(X,Y);cx.rotate(aim);cx.fillStyle='rgba(255,230,140,'+(.35*a)+')';cx.beginPath();cx.ellipse(0,0,r*.4,r*.95,0,0,7);cx.fill();
  cx.strokeStyle='rgba(255,220,100,'+a+')';cx.lineWidth=2;cx.beginPath();cx.ellipse(0,0,r*.45,r,0,0,7);cx.stroke();
  cx.strokeStyle='rgba(255,255,255,'+(.8*a)+')';cx.lineWidth=1;cx.beginPath();cx.ellipse(0,0,r*.3,r*.7,0,0,7);cx.stroke();
  for(let i=0;i<3;i++){const t=time*5+i*2.1;FR(Math.cos(t)*r*.3-1,Math.sin(t)*r*.8-1,2,2,'rgba(255,255,255,'+a+')')}
  cx.restore();L.push([X,Y,46*a])}
 for(const s of PSW){const X=Math.round(s.x-ox),Y=Math.round(s.y-oy);if(X<-30||X>cv.width+30||Y<-30||Y>cv.height+30)continue;orb(X,Y,12,'rgba(255,215,110,.4)');sword(s.k,X,Y,s.a,1);L.push([X,Y,34])}
 for(const w of PWV){const f=Math.round(w.x+w.d*w.l-ox),fade=1-w.l/230;if(f<-80||f>cv.width+80)continue;
  cx.save();cx.globalCompositeOperation='lighter';
  for(let i=0;i<14;i++){const xx=f-w.d*i*5,h=(22-i*1.3)+Math.sin(time*30+i*1.7)*4;if(h<=1)continue;PL([xx-3,gy,xx,gy-h,xx+3,gy],'rgba(255,'+(110+i*9)+',20,'+(fade*(1-i/15))+')')}
  cx.restore();L.push([f,gy-10,70*fade])}
 if(PBM){const q=clamp(PBM.t/.55,0,1),X=Math.round(PBM.x-ox),Y=Math.round(PBM.y-oy),ex=X+Math.cos(PBM.a)*1500,ey=Y+Math.sin(PBM.a)*1500;
  cx.save();cx.globalCompositeOperation='lighter';cx.lineCap='round';
  for(const[lw,c]of[[20*q+4,'rgba(255,20,20,'+.35*q+')'],[10*q+2,'rgba(255,110,60,'+.8*q+')'],[4*q+1,'rgba(255,255,255,'+q+')']]){cx.strokeStyle=c;cx.lineWidth=lw;cx.beginPath();cx.moveTo(X,Y);cx.lineTo(ex,ey);cx.stroke()}
  cx.restore();L.push([X,Y,140*q+20]);L.push([X+Math.cos(PBM.a)*120,Y+Math.sin(PBM.a)*120,90*q])}
 if(PK.st==='warn'&&!PK.res){const c0=pcen(),X=Math.round(c0.x-ox),Y=Math.round(c0.y-oy),win=.2+S.parry,q=clamp(PK.t/PWN,0,1),go=!!PK.go,fl=(time*(10+q*20)|0)%2,PX=Math.round(P.x+6-ox),PY=Math.round(P.y+11-oy);
  cx.save();cx.strokeStyle='rgba(255,50,50,'+(go?.9:.25+.5*fl)+')';cx.lineWidth=go?2:1;cx.setLineDash([4,3]);cx.beginPath();cx.moveTo(X,Y);cx.lineTo(PX,PY);cx.stroke();cx.setLineDash([]);
  cx.translate(X,Y);cx.strokeStyle='rgba(255,60,60,'+(.4+.6*q)+')';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,40*(1-q)+10,0,7);cx.stroke();
  if(go){cx.strokeStyle='#fff';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,14,0,7);cx.stroke();cx.fillStyle='rgba(255,255,255,.3)';cx.fill()}cx.restore();
  // countdown ring closing on YOU; it turns solid white the instant a parry will work
  const prog=clamp(PK.t/(PWN-win),0,1),rr=go?15:15+60*(1-prog);
  cx.save();cx.translate(PX,PY);cx.lineWidth=go?3:2;cx.strokeStyle=go?'#fff':'rgba(255,200,90,'+(.5+.4*prog)+')';cx.beginPath();cx.arc(0,0,rr,0,7);cx.stroke();
  cx.strokeStyle='rgba(255,255,255,.35)';cx.lineWidth=1;cx.beginPath();cx.arc(0,0,15,0,7);cx.stroke();
  if(go){cx.fillStyle='rgba(255,255,255,'+(.25+.25*fl)+')';cx.beginPath();cx.arc(0,0,15,0,7);cx.fill();cx.textAlign='center';cx.font='bold 10px Georgia';cx.fillStyle='#fff';cx.shadowColor='#ffd36b';cx.shadowBlur=8;cx.fillText('NOW!',0,-26)}cx.restore();
  if(go){cx.save();cx.fillStyle='rgba(255,255,255,'+(.10+.08*fl)+')';cx.fillRect(0,0,cv.width,cv.height);cx.restore()}
  L.push([X,Y,90])}
 if(PK.sh&&PK.sh.t>0){const X=Math.round(PK.x+PK.w/2-ox),Y=Math.round(PK.y-oy-8);cx.save();cx.textAlign='center';cx.font='bold 11px Georgia';cx.lineWidth=3;cx.strokeStyle='#000';cx.fillStyle='#ffd36b';cx.shadowColor='#ff3a2a';cx.shadowBlur=8;cx.globalAlpha=Math.min(1,PK.sh.t*3);cx.strokeText(PK.sh.s,X,Y);cx.fillText(PK.sh.s,X,Y);cx.restore()}}
const PT={boss:1,init(){pokeStart()},
 chk(){if(!PK||!PK.res)return false;PT.ok=[PK.res==='win'?'\u2026Poke bows, and dissolves into gold. Remarkable.':'\u2026Poke smirks and fades away. You live \u2014 that is enough.'];return true},
 obj:()=>PK&&!PK.res?(PK.fin?'Parry his Enuma Elish!':'Poke  '+Math.max(1,Math.ceil(PK.hp/PK.max*100))+'%'):(PK&&PK.res==='win'?'Poke defeated':'Poke prevailed'),ok:['\u2026']};

const ST=[
 {lines:['Ah\u2026 another flame stumbles into the ash. Welcome, wanderer.','I am Choiatsm. I have watched a thousand descents end in the first corridor. Let us make yours the exception.','This is a training ground, far from Ashfall. Nothing here can hurt you \u2014 not even me. Press Enter or click this box to continue.']},
 {lines:['First, the basics. Walk with A and D \u2014 go left, then right.'],
  task:{init(){K.x0=P.x;K.l=K.r=0},chk(){K.l=Math.max(K.l,K.x0-P.x);K.r=Math.max(K.r,P.x-K.x0);return K.l>=40&&K.r>=40},obj:()=>'Left '+(K.l>=40?'\u2714':'\u2026')+'    Right '+(K.r>=40?'\u2714':'\u2026'),ok:['Good. Feet that obey.']}},
 {lines:['Now leap. Press Space \u2014 hold it for a higher jump.'],task:{chk:()=>!P.onGround&&!P.climb&&P.vy<-150,obj:()=>'Press Space',ok:['Gravity is only a suggestion.']}},
 {lines:['Again \u2014 but press Space a second time while you are still in the air. A double jump. The tall block to the east will teach you why.'],task:{init(){tDJ=0},chk:()=>tDJ>=1,obj:()=>'Space \u2192 Space (in the air)',ok:['Twice the sky.']}},
 {lines:['Ladders. Walk to the ladder east of here and hold W to climb, S to descend. At the top, press Space to leap off onto the platform.'],
  task:{init(){K.cl=0},chk(){if(P.climb)K.cl=1;return K.cl&&P.onGround&&Math.abs(P.y+22-22*T)<3&&P.x>=80*T&&P.x<=90*T},obj:()=>'Climb to the platform',target:()=>({x:79.5*T,y:20*T}),ok:['Up and over.']}},
 {lines:['Steel next. Left-click to strike \u2014 you swing toward the cursor, and every swing costs stamina (the green bar). Hit the training dummy three times.'],
  task:{init(){tHits=0},chk:()=>tHits>=3,obj:()=>'Strikes '+Math.min(3,tHits)+'/3',target:()=>({x:100*T,y:GY*T-36}),ok:['Wood fears you now.']}},
 {lines:['Stone is not a wall, only a delay. Aim the cursor at a glowing crystal in the mound and press E to mine it \u2014 it must be within five blocks.'],
  task:{chk:()=>!tiles[25*W+110]||!tiles[25*W+112],obj:()=>'Press E on a crystal',target:()=>({x:111*T,y:24*T}),ok:['Crystals are gold in disguise.']}},
 {lines:['You are wounded \u2014 I took the liberty. Press R to drink a Health Elixir. They cost 200 gold at the Merchant, and drinking has a short cooldown.'],
  task:{low:1,init(){P.el=1;P.ecd=0;P.hp=Math.max(10,Math.round(maxHp()*.4))},chk:()=>(P.el|0)<1,obj:()=>'Press R',ok:['Warm, isn\u2019t it?']}},
 {lines:['Press Tab to open your character sheet \u2014 attribute points, weapons and armor live there. Press Tab again to close it.'],
  task:{init(){tTab=false},chk:()=>tTab&&!sheetOpen&&!paused,obj:()=>'Press Tab',ok:['Spend your points wisely.']}},
 {lines:['At Ashfall\u2019s camp you will find the Merchant, the Questwarden and the Enchanting Altar \u2014 stand near them and press E. Spells bought from the Merchant are cast with Z and X.','Shrines let you travel between the camp and every layer you have unlocked. Now \u2014 the lesson that keeps the living living.','Come. The training ring.'],go(){ringTP()}},
 {lines:['This is where you learn to survive. I will attack you \u2014 my blade is blunt tonight, but pretend it is not.','When I glow red, press Shift to dodge. You are untouchable for a moment. Dodge three of my strikes.'],
  task:{combat:'dodge',wt:.9,init(){K.n=0;K.miss=0},chk:()=>K.n>=3,obj:()=>'Dodges '+K.n+'/3',hints:['Too slow \u2014 press Shift as the glow begins.','Dodge toward or through me. Shift!','Watch the red arc. When it closes in, roll.'],ok:['Clean. You slipped the blade.']}},
 {lines:['Now the guard. Hold RMB with the cursor aimed at me and my blows are blunted \u2014 but blocking drains stamina and posture, and a broken guard leaves you stunned. Block two of my strikes.'],
  task:{combat:'block',wt:.85,init(){K.n=0;K.miss=0},chk:()=>K.n>=2,obj:()=>'Blocks '+K.n+'/2',hints:['Hold RMB before I strike \u2014 and point the cursor at me.','Guard up! Right mouse button, cursor on me.'],ok:['A wall, however briefly.']}},
 {lines:['The finest art: the parry. Do not hold early \u2014 press RMB at the very last moment, when the ring flashes white. A perfect parry staggers me and restores your stamina.','A failed tap costs you a second of cooldown, so be patient. Parry three of my strikes.'],
  task:{combat:'parry',wt:.8,init(){K.n=0;K.miss=0},chk:()=>K.n>=3,obj:()=>'Parries '+K.n+'/3',hints:['Too early, or too late. Tap RMB when the ring turns white.','Wait for the white flash \u2014 then press RMB. Aim at me.','Do not hold the guard beforehand \u2014 just tap at the last instant.'],ok:['Perfectly turned. You may yet survive the Depths.']}},
 {lines:['That is all I can teach you.','\u2026But hold. Do you feel that? Something has followed us into the ring.','A boy with crimson horns and a crooked grin. His name is Poke \u2014 and he wishes to test you.','Wear him down. When he is spent he will unleash his final technique \u2014 parry it, and the victory is yours. Fail, and \u2026 well. Try not to fail.'],go(){pokeEnter()},task:PT},
 {when:'win',lines:['By the embers\u2026 you felled him. I have not seen that in a century.','Take what the ring has granted you: ten levels, and five hundred echoes banked for the descent.','Now listen well. The rest the Depths will teach \u2014 harshly.','Four layers lie below Ashfall \u2014 Ember, Glacial, Tempest and Hollow. Each is sealed by a gate and each has a boss waiting at its far east end.','At the very bottom waits The Hollow King. Defeat him, and Ashfall is free.','Go, wanderer. Descend. Endure. Parry.']},
 {when:'lose',lines:['Poke is no ordinary fishbowl member. Rise \u2014 there is no shame in it.','Now go. Descend, and defeat The Hollow King to free Ashfall.']}
];

function setText(s){D.s=s;D.c=0;g$('tutBox').querySelector('.tb-t').textContent=''}
function hint(s,bad){D.hint=s;D.hT=4.5;const h=g$('tutBox').querySelector('.tb-h');h.textContent=s;h.className='tb-h'+(bad?' bad':'')}
function startTask(){phase='task';const t=cur.task;if(t.init)t.init();N.cd=1.4}
function begin(i){while(ST[i]&&ST[i].when&&ST[i].when!==(PK&&PK.res))i++;idx=i;cur=ST[i];if(!cur){return finish()}li=0;phase='say';if(cur.task&&cur.lines.length===1)startTask();setText(cur.lines[0])}
function advance(){if(!TUT||phase!=='say')return;
 if(D.c<D.s.length){D.c=D.s.length;g$('tutBox').querySelector('.tb-t').textContent=D.s;return}
 if(li<cur.lines.length-1){li++;if(li===1&&cur.go)cur.go();setText(cur.lines[li]);if(li===cur.lines.length-1&&cur.task)startTask();tone(660,880,.2,'sine',.03)}
 else if(!cur.task)begin(idx+1)}
function ringTP(){burst(P.x+6,P.y+12,18,'#ffe28c');P.x=130*T;P.y=GY*T-23;P.vx=P.vy=0;P.climb=false;N.x=P.x+64;N.st='idle';N.cd=2;
 cam.x=Math.max(0,Math.min(W*T-cv.width,P.x-cv.width/2));cam.y=Math.max(0,Math.min(H*T-cv.height,P.y-cv.height/2));
 burst(P.x+6,P.y+12,24,'#ffc85a');shake=Math.max(shake,3);tone(330,990,.5,'sine',.08);noise(.4,.08,4000,500,'bandpass',2)}

function tick(dt){if(askArm){if(!g$('menu').classList.contains('hidden'))askArm=false;else if(P&&P!==P0&&!paused){askArm=false;showAsk()}}
 if(!g$('tutAsk').classList.contains('hidden'))paused=true;
 if(!TUT){g$('tutPk').classList.add('hidden');return}const box=g$('tutBox');pkUI();g$('tutPk').classList.toggle('hidden',!(TDONE&&!PK&&!paused));
 if(D.c<D.s.length){D.c++;box.querySelector('.tb-t').textContent=D.s.slice(0,D.c);if(D.c%3===0&&D.c<D.s.length)Audio_.beep(560+(D.c%5)*40,.018,'square',.012)}
 if(D.hT>0){D.hT-=dt;if(D.hT<=0){const h=box.querySelector('.tb-h');h.textContent='';h.className='tb-h'}}
 const o=box.querySelector('.tb-o');
 if(phase==='task'){const t=cur.task;if(!paused&&t.chk()){phase='ok';N.st='idle';N.cd=1;okT=1.9;o.textContent='\u2714 '+t.obj();setText(t.ok[Math.random()*t.ok.length|0]);burst(P.x+6,P.y,14,'#ffd36b');tone(660,1320,.4,'sine',.07);return}
  o.textContent='\u25b6 '+t.obj();if(D.c>=D.s.length&&!D.hT)box.querySelector('.tb-h').textContent=''}
 else if(phase==='ok'){okT-=dt;if(okT<=0){o.textContent='';begin(idx+1)}}
 else if(phase==='say'){o.textContent='';if(!D.hT&&D.c>=D.s.length)box.querySelector('.tb-h').textContent='\u25b6 Enter / click to continue'}}
setInterval(()=>tick(.033),33);

// ---------- Poke's boss theme: bossthemes/poketheme.(mp3|ogg|wav|m4a|opus|flac|aac) ----------
let PMU=null,pmOn=false;const PEXT=['mp3','ogg','wav','m4a','opus','flac','aac'];
function pmProbe(i){if(i>=PEXT.length)return;try{const a=new Audio();a.preload='auto';a.loop=true;a.addEventListener('canplay',()=>{PMU=a},{once:true});a.addEventListener('error',()=>pmProbe(i+1),{once:true});a.src='bossthemes/poketheme.'+PEXT[i]}catch(e){}}
try{if(typeof Audio==='function')pmProbe(0)}catch(e){}
function pmVol(){let v=1;try{const x=parseFloat(localStorage.getItem('ashfall_bvol'));if(x>=0&&x<=1)v=x}catch(e){}return Math.min(1,.7*v)}
setInterval(()=>{try{const a=PMU;if(!a)return;const live=!!(TUT&&pokeLive()&&P&&!P.dead),tv=pmVol();
 if(live&&!paused&&!Audio_.mute){if(!pmOn){pmOn=true;a.currentTime=0;a.volume=0}if(a.paused)a.play().catch(()=>{});a.volume=Math.max(0,Math.min(tv,a.volume+(a.volume<tv?.05:-.05)))}
 else if(live){if(!a.paused)a.pause()}                                              // game paused / muted: hold the track
 else if(pmOn){a.volume=Math.max(0,a.volume-.08);if(a.volume<=0){a.pause();a.currentTime=0;pmOn=false}}}catch(e){}},50);

// ---------- enter / leave ----------
function enterTutorial(){if(TUT||!P)return;
 HM={tiles,mods,enemies,chests,zones,projs,GATES,ARCHES,seen,SHOP,QG,ENCP,gold,p:{x:P.x,y:P.y,hp:P.hp,stam:P.stam,post:P.post,el:P.el,ecd:P.ecd,face:P.face}};
 TUT=true;window.TUTON=true;pokeClear();tiles=genTut();mods={};enemies=[mkDummy()];chests=[];zones=[];projs=[];parts=[];floats=[];GATES=[];ARCHES=[];seen=new Uint8Array(W*H);SHOP=QG=ENCP=null;
 P.x=29*T;P.y=GY*T-23;P.vx=P.vy=0;P.face=1;P.climb=false;P.atk=0;P.dodge=0;P.stun=0;P.guardBroken=0;P.pcd=0;P.hp=maxHp();P.stam=maxStam();P.post=0;P.inv=1.5;
 N=mkNpc(35*T);tDodgeT=-9;tDJ=0;tHits=0;tTab=false;D.hint='';D.hT=0;
 cam.x=Math.max(0,Math.min(W*T-cv.width,P.x-cv.width/2));cam.y=Math.max(0,Math.min(H*T-cv.height,P.y-cv.height/2));
 g$('menu').classList.add('hidden');g$('tutAsk').classList.add('hidden');g$('tutBox').classList.remove('hidden');g$('tutSkip').classList.remove('hidden');
 g$('tutBox').querySelector('.tb-o').textContent='';g$('tutBox').querySelector('.tb-h').textContent='';
 paintAll();paused=false;burst(P.x+6,P.y+12,24,'#ffe28c');tone(330,990,.5,'sine',.08);toast('\u2726 The Training Ground');begin(0)}
function leaveTutorial(skipped){if(!TUT)return;TUT=false;window.TUTON=false;pokeClear();const h=HM;HM=null;
 tiles=h.tiles;mods=h.mods;enemies=h.enemies;chests=h.chests;zones=h.zones;projs=h.projs;GATES=h.GATES;ARCHES=h.ARCHES;seen=h.seen;SHOP=h.SHOP;QG=h.QG;ENCP=h.ENCP;gold=h.gold;parts=[];floats=[];
 Object.assign(P,h.p);P.vx=P.vy=0;P.climb=false;P.atk=0;P.dodge=0;P.stun=0;P.guardBroken=0;P.pcd=0;P.blocking=false;P.inv=1.2;
 N=null;cur=null;phase='';tDodgeT=-9;
 cam.x=Math.max(0,Math.min(W*T-cv.width,P.x-cv.width/2));cam.y=Math.max(0,Math.min(H*T-cv.height,P.y-cv.height/2));
 g$('tutBox').classList.add('hidden');g$('tutSkip').classList.add('hidden');paused=false;
 burst(P.x+6,P.y+12,24,'#ffe28c');tone(990,330,.5,'sine',.08);
 toast(skipped?'Tutorial skipped':'\u2726 Free Ashfall \u2014 defeat The Hollow King');save()}
function finish(){markDone();leaveTutorial(false)}
g$('tutSkip').onclick=()=>leaveTutorial(true);g$('tutBox').onclick=advance;

// ---------- the question after "New Game" ----------
function showAsk(){paused=true;paintAll();g$('tutPoke').classList.toggle('hidden',!TDONE);g$('tutAsk').classList.remove('hidden')}
// skip straight to Poke (only offered after the tutorial has been done once)
{const b=document.createElement('button');b.id='tutPoke';b.className='hidden';b.textContent='Fight Poke Now';g$('tutYes').after(b);b.onclick=()=>{enterTutorial();skipToPoke()};
 const k=document.createElement('button');k.id='tutPk';k.className='hidden';k.textContent='Skip to Poke';k.onclick=skipToPoke;document.body.appendChild(k);
 const st=document.createElement('style');st.textContent='#tutPk{position:fixed;top:46px;left:50%;transform:translateX(-50%);z-index:56;padding:6px 16px;font-size:11px}';document.head.appendChild(st)}
function skipToPoke(){if(!TUT||PK||!TDONE)return;const i=ST.findIndex(q=>q.task===PT);if(i<0)return;
 ringTP();idx=i;cur=ST[i];li=cur.lines.length-1;phase='say';K.n=0;D.hint='';D.hT=0;pokeEnter();
 setText('Back for more? Poke is already waiting in the ring. Show him what you have learned.');startTask();
 g$('tutBox').querySelector('.tb-o').textContent='';g$('tutBox').querySelector('.tb-h').textContent=''}
g$('tutYes').onclick=enterTutorial;
g$('tutNo').onclick=()=>{g$('tutAsk').classList.add('hidden');paused=false};
const st4=start;start=function(n){if(TUT)leaveTutorial(true);askArm=!!n;P0=P;return st4(n)};

// ---------- hooks that keep the real run untouched ----------
const sv4=save;save=function(){if(TUT)return;return sv4()};
const di4=die;die=function(){if(TUT){if(pokeLive()){pokeLose();return}P.hp=maxHp();P.dead=0;return}return di4()};
const ds4=drawSpawn;drawSpawn=function(ox,oy,L){if(TUT){drawTut(ox,oy,L);return}return ds4(ox,oy,L)};
const de4=drawE;drawE=function(e,ox,oy,L){if(e&&e.tdummy){drawDummy(e,ox,oy);return}if(e&&e.tpoke){drawPoke(e,ox,oy,L);return}return de4(e,ox,oy,L)};
const ue4=updEnemy;updEnemy=function(e,dt){if(e.tdummy||e.tpoke)return;return ue4(e,dt)};
const u24=updE2;updE2=function(e,dt){if(e.tdummy||e.tpoke)return;return u24(e,dt)};
const he4=hitEnemy;hitEnemy=function(e){if(e&&e.tpoke){pokeHit(e);return}if(e&&e.tdummy){tHits++;e.flash=.25;e.face*=-1;sfx.hit();burst(e.x+7,e.y+10,6,'#c9a46a');shake=Math.max(shake,1.5);float(e.x,e.y-8,'HIT','#ffd36b');return}return he4(e)};
const uf4=updFx;updFx=function(dt){if(TUT)tutUpd(dt);return uf4(dt)};
// ---------- Poke's battle backdrop: a sunset field of swords under hanging rusted gears ----------
let PBG=0;
const hsh=n=>{const q=Math.sin(n*127.1+311.7)*43758.5453;return q-Math.floor(q)};
function ubwGear(x,y,r,n,rot,holes,shade){
 cx.save();cx.translate(x,y);cx.rotate(rot);const p=6.2832/n;cx.beginPath();
 for(let i=0;i<n;i++){const a=i*p,rb=r*.86;
  const pts=[[rb,a-.5*p],[r,a-.3*p],[r,a+.3*p],[rb,a+.5*p]];
  pts.forEach((q,j)=>{const px=Math.cos(q[1])*q[0],py=Math.sin(q[1])*q[0];(i===0&&j===0)?cx.moveTo(px,py):cx.lineTo(px,py)})}
 cx.closePath();
 for(let j=0;j<holes;j++){const aj=j*6.2832/holes,hx=Math.cos(aj)*r*.5,hy=Math.sin(aj)*r*.5,rx=r*.2,ry=r*.12,ar=aj+1.5708;
  cx.moveTo(hx+Math.cos(ar)*rx,hy+Math.sin(ar)*rx);cx.ellipse(hx,hy,rx,ry,ar,0,6.2832)}
 const gr=cx.createRadialGradient(-r*.3,-r*.3,r*.1,0,0,r*1.05);gr.addColorStop(0,'rgb('+(190*shade|0)+','+(98*shade|0)+','+(44*shade|0)+')');gr.addColorStop(1,'rgb('+(84*shade|0)+','+(34*shade|0)+','+(16*shade|0)+')');
 cx.fillStyle=gr;cx.fill('evenodd');cx.lineWidth=Math.max(1.5,r*.025);cx.strokeStyle='rgba(30,10,4,.9)';cx.stroke();
 cx.beginPath();cx.arc(0,0,r*.76,0,6.2832);cx.strokeStyle='rgba(255,150,70,.28)';cx.lineWidth=Math.max(1,r*.02);cx.stroke();
 cx.beginPath();cx.arc(0,0,r*.15,0,6.2832);cx.fillStyle='#3a1608';cx.fill();cx.strokeStyle='rgba(255,140,60,.5)';cx.stroke();
 cx.restore()}
function ubwSword(x,gy,hh,ang,col,hi){
 cx.save();cx.translate(x,gy);cx.rotate(ang);const bw=Math.max(1,hh*.06),gY=-hh*.6;cx.fillStyle=col;
 cx.fillRect(-bw/2,gY,bw,-gY);                                   // blade sunk into the ground
 cx.fillRect(-hh*.11,gY-hh*.035,hh*.22,hh*.035);                 // crossguard
 cx.fillRect(-bw*.32,-hh*.9,bw*.64,hh*.3-hh*.035);               // grip
 cx.beginPath();cx.arc(0,-hh*.92,bw*.65,0,6.2832);cx.fill();     // pommel
 if(hi){cx.fillStyle='rgba(255,160,70,.35)';cx.fillRect(-bw/2,gY,bw*.3,-gY);cx.fillRect(-bw*.32,-hh*.9,bw*.2,hh*.3-hh*.035)}
 cx.restore()}
function pokeBG(ox,oy,a){
 const w=cv.width,h=cv.height,t=time,hz=Math.round(clamp(GY*T-oy-4,h*.3,h*.9)),sx=w*.5,sy=hz-h*.14,uh=h/720;
 cx.save();cx.globalAlpha=a;
 // sky
 let g=cx.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#d9753f');g.addColorStop(.5,'#f7ac58');g.addColorStop(1,'#ffd88a');cx.fillStyle=g;cx.fillRect(0,0,w,hz+2);
 // drifting cloud streaks
 for(let i=0;i<14;i++){const y=hz*(.1+.8*hsh(i+3)),cw=(140+hsh(i)*220)*w/1280,xx=((hsh(i+9)*(w+400)+t*(4+i%4*2)-ox*.03)%(w+400)+w+400)%(w+400)-200;
  cx.fillStyle='rgba(255,150,80,'+(.14+.1*hsh(i+5))+')';cx.beginPath();cx.ellipse(xx,y,cw,5+hsh(i+1)*9,0,0,6.2832);cx.fill()}
 // sun + rays
 cx.globalCompositeOperation='lighter';glow(sx,sy,h*.7,'rgba(255,150,50,.5)');glow(sx,sy,h*.22,'rgba(255,240,190,.75)');
 for(let i=0;i<10;i++){const an=-1.5708+(i-4.5)*.2+Math.sin(t*.25+i)*.02,L=h*1.3,wd=.035+.02*hsh(i);
  cx.fillStyle='rgba(255,200,110,'+(.05+.03*hsh(i+2))+')';cx.beginPath();cx.moveTo(sx,sy);cx.lineTo(sx+Math.cos(an-wd)*L,sy+Math.sin(an-wd)*L);cx.lineTo(sx+Math.cos(an+wd)*L,sy+Math.sin(an+wd)*L);cx.fill()}
 cx.globalCompositeOperation='source-over';
 // ground
 g=cx.createLinearGradient(0,hz,0,h);g.addColorStop(0,'#cf6a30');g.addColorStop(.35,'#8a3416');g.addColorStop(1,'#3a1208');cx.fillStyle=g;
 cx.beginPath();cx.moveTo(0,h);for(let x=0;x<=w;x+=16){const wx=x+ox*.1;cx.lineTo(x,hz+Math.sin(wx*.006+1)*7*uh+Math.sin(wx*.017)*3*uh)}cx.lineTo(w,h);cx.fill();
 for(let i=0;i<90;i++){const x=((hsh(i+40)*(w+100)-ox*.15)%(w+100)+w+100)%(w+100)-50,y=hz+8+hsh(i+70)*(h-hz);cx.fillStyle='rgba(40,12,4,'+(.12+.12*hsh(i+7))+')';cx.fillRect(x,y,2+hsh(i)*6,1+hsh(i+2)*2)}
 // sword layers: far (small, hazy) -> mid (tall, only their hilts clear the ground tiles)
 const layers=[{n:110,k:.05,y0:2,y1:h*.05,h0:.05,h1:.09,col:'#8a4a24',hi:0},{n:34,k:.12,y0:h*.04,y1:h*.14,h0:.14,h1:.26,col:'#5a2812',hi:0},{n:9,k:.24,y0:h*.12,y1:h*.22,h0:.34,h1:.6,col:'#3a1608',hi:1}];
 layers.forEach((L,li)=>{const ww=w+240;for(let i=0;i<L.n;i++){const f=(i+hsh(i*3+li))/L.n,x=((hsh(i*7+li*50)*ww-ox*L.k)%ww+ww)%ww-120,gy=hz+L.y0+Math.pow(f,1.2)*(L.y1-L.y0),hh=h*(L.h0+hsh(i*5+li)*(L.h1-L.h0)),an=(hsh(i*11+li)-.5)*.14;
   ubwSword(x,gy,hh,an,L.col,L.hi)}
  if(li===0){g=cx.createLinearGradient(0,hz-h*.12,0,hz+h*.08);g.addColorStop(0,'rgba(255,170,70,0)');g.addColorStop(.6,'rgba(255,170,70,.28)');g.addColorStop(1,'rgba(255,170,70,0)');cx.fillStyle=g;cx.fillRect(0,hz-h*.12,w,h*.2)}});
 // hanging gears (alternate spin directions)
 const GS=[[.0,.0,.17,20,1,5,.8],[.2,-.02,.15,18,-1,6,.8],[.39,.01,.17,22,1,5,.75],[.58,-.01,.16,20,-1,6,.8],[.76,.0,.17,18,1,5,.75],[.96,.02,.19,22,-1,6,.8],
  [.1,.07,.15,18,-1,5,1],[.3,.09,.17,20,1,6,1],[.5,.08,.19,22,-1,5,1],[.68,.1,.15,18,1,6,1],[.86,.09,.17,20,-1,5,1]];
 for(const q of GS){const r=q[2]*h;ubwGear(q[0]*w-ox*.03,q[1]*h,r,q[3],t*.12*q[4]+q[0]*5,q[5],q[6])}
 // warm haze + vignette
 cx.globalCompositeOperation='lighter';cx.fillStyle='rgba(255,120,30,.06)';cx.fillRect(0,0,w,h);cx.globalCompositeOperation='source-over';
 g=cx.createRadialGradient(w/2,h*.55,h*.3,w/2,h*.55,h*.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(30,6,0,.5)');cx.fillStyle=g;cx.fillRect(0,0,w,h);
 cx.restore()}
const dab4=drawArenaBG;drawArenaBG=function(ox,oy,L){if(PBG>.01)pokeBG(ox,oy,PBG);return dab4(ox,oy,L)};
const uf5=updFx;updFx=function(dt){const on=!!(TUT&&PK&&PK.act&&!PK.res);PBG=TUT?clamp(PBG+(on?dt/1.5:-dt/1.2),0,1):0;return uf5(dt)};
})();