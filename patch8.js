'use strict';
// ===== Ashfall Depths: Patch 8 (load AFTER patch7.js and patch6.js) =====
// Maestro Evengarde Rest: the trial for the Gale Odachi. Elder Maren sends you to his hall when you turn in her quest.
// Humanoid boss, 70000 HP, 1000 posture, 90 damage, telegraphed slashes only, 2 phases. He can never be killed by damage:
// at 1 HP he starts the JUDGEMENT CUT and only a PARRY (same window as Shatter Reality) ends the duel.
// Theme: bossthemes/maestrotheme.(mp3|ogg|wav|m4a|opus|flac|aac)
(()=>{
 const MN='Maestro Evengarde Rest',TOT=70000,JW=3.4,JPW=.1,JDMG=540;
 let inM=false,HM8=null,MB=null,MSL=[],MJ=[],jcO=[0,0],mDone=0,FD={a0:0,a1:0,t0:0,dur:1};
 const lerp=(a,b,k)=>a+(b-a)*Math.max(0,Math.min(1,k));
 const fadeTo=(a,ms)=>{FD={a0:fdA(),a1:a,t0:performance.now(),dur:ms}};
 const fdA=()=>lerp(FD.a0,FD.a1,(performance.now()-FD.t0)/FD.dur);

 // ---------- the hall ----------
 const MAES={id:'maestro',cx:60,fy:28,hw:34,ht:17,g:6,side:1,bg:['#0f1519','#1d272d'],pl:[]};
 const MAESP={1:['#6b7a80','#5d6c72','#7a898f'],2:['#10161a','#0c1114','#161e23'],3:['#9aa6ab','#8b979d','#aab5ba'],7:['#2a3a40','#22313a','#32454d']};
 function genMaes(){const t=new Uint8Array(W*H),a=MAES,x0=a.cx-a.hw,x1=a.cx+a.hw,y0=a.fy-a.ht;t.fill(2);
  for(let y=y0-3;y<=a.fy+3;y++)for(let x=x0-3;x<=x1+3;x++)t[y*W+x]=3;
  for(let y=y0;y<a.fy;y++)for(let x=x0;x<=x1;x++)t[y*W+x]=0;
  return t}
 ARB.maestro=function(a,X0,Y0,W2,H2,FY,L){const t=time,B=MB&&!MB.dead?MB:null,p2=!!(B&&B.ph===2);
  const g=cx.createLinearGradient(0,Y0,0,FY);g.addColorStop(0,p2?'#09130e':'#0d1317');g.addColorStop(.7,p2?'#15231c':'#1b252b');g.addColorStop(1,'#26323a');cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);
  const n=7,cw=W2/n;
  for(let i=0;i<n;i++){const px=X0+cw*(i+.5),ww=cw*.5,wx=px-ww/2,wy=Y0+H2*.16,wh=H2*.46;
   cx.fillStyle=p2?'#1c3a2a':'#2a3d49';cx.fillRect(wx,wy+ww/2,ww,wh-ww/2);cx.beginPath();cx.arc(wx+ww/2,wy+ww/2,ww/2,Math.PI,0);cx.fill();
   AD(()=>{PL([wx+2,wy+wh,wx+ww-2,wy+wh,wx+ww*1.5,FY,wx-ww*.5,FY],p2?'rgba(120,255,170,.045)':'rgba(190,220,255,.045)');glow(px,wy+wh*.35,ww*1.3,p2?'rgba(110,255,170,.12)':'rgba(180,215,255,.12)')});
   const bx=px-6,by=Y0+H2*.015;cx.fillStyle='#10301c';cx.fillRect(bx,by,12,H2*.17);PL([bx,by+H2*.17,bx+6,by+H2*.17-7,bx+12,by+H2*.17],'#10301c');cx.fillStyle='#d9a441';cx.beginPath();cx.arc(px,by+H2*.06,2.6,0,7);cx.fill();cx.fillStyle='#0a1a10';cx.beginPath();cx.arc(px,by+H2*.06,1.1,0,7);cx.fill();
   L.push([px,wy+wh*.5,100])}
  const pw=Math.max(10,cw*.15);for(let i=0;i<=n;i++){const sx=X0+cw*i;cx.fillStyle='#151c21';cx.fillRect(sx-pw/2,Y0,pw,H2);cx.fillStyle='#252f36';cx.fillRect(sx-pw/2,Y0,2,H2);cx.fillStyle='#0c1115';cx.fillRect(sx+pw/2-2,Y0,2,H2);cx.fillStyle='#2f3b43';cx.fillRect(sx-pw/2-2,Y0+H2*.62,pw+4,3)}
  cx.fillStyle='#aab5ba';cx.fillRect(X0,FY-3,W2,3);cx.fillStyle='#6b777c';cx.fillRect(X0,FY-3,W2,1);
  for(let i=0;i<26;i++){const sp=40+(i%5)*22,x=X0+((i*131+t*sp)%W2),y=Y0+(((i*57+t*18+Math.sin(t+i)*20)%H2)+H2)%H2;cx.fillStyle=i%3?'#2f9a52':'#1b5a30';cx.fillRect(x,y,3,1.5)}}

 // ---------- the boss ----------
 BD.maestro={n:MN,sub:'Wielder of the Gale',tier:4,hp:TOT,pmax:1000,w:16,h:36,spd:96,dmg:90,pd:30,reach:60,jv:0,zc:'60,220,120',wpn:'odachi',col:['#9fb0b6','#1a2226'],sn:0,ps:240,amb:99,aw:0,noFury:1,noDie:1,noAmb:1,
  a1:['mslash','mwave','mcombo','mdash','mblades','mtornado','mleap'],a2:['mslash','mwave','mcombo','mdash','mblades','mtornado','mgale','mfall','mcyclone','mastral','mrend','mafter','mleap','mleap','meye']};
 // every attack is a slash: the telegraph (red cone / line) fills while he winds up
 const faceP=B=>{B.face=P.x+6>bcx(B)?1:-1};
 const WB=[],TW=[],GW=[],PH=[],SQF=[];
 // crit enchants (new): Deadeye = +crit chance, Brutality = +crit damage (both stack with Precision / Keen Eye / Ruthlessness)
 try{if(!EPB.critr){const a={k:'critr',n:'Deadeye',min:.05,max:.15,f:v=>'+'+Math.round(v*100)+'% critical chance'},b={k:'critd',n:'Brutality',min:.20,max:.60,f:v=>'+'+Math.round(v*100)+'% critical damage'};EP.push(a,b);EPB.critr=a;EPB.critd=b}}catch(e){}
 {const _td8=tryDodge;tryDodge=function(){const was=!!(P&&P.dodge>0),r=_td8.apply(this,arguments);if(P&&!was&&P.dodge>0)P.mdT=time;return r}}
 const dodgedNow=(g)=>P.dodge>0||time-(P.mdT||-9)<=(g||.26);
 const FYT=()=>MAES.fy*T;
 // AFTERIMAGE: a phantom appears behind you and slashes after a short warning (spawned by his 'mafter' attack, or ambushing during any other phase-2 attack)
 const phSpawn=(B,tw)=>{const a=MAES,L=(a.cx-a.hw+4)*T,R=(a.cx+a.hw-4)*T,pc=P.x+6;let d=-P.face,x=pc+d*44;if(x<L||x>R){d=-d;x=pc+d*44}x=Math.max(L,Math.min(R,x));
  PH.push({x,f:pc>x?1:-1,t:0,tw:tw||.75,k:0});
  for(let i=0;i<14;i++)parts.push({x:x+(Math.random()-.5)*14,y:FYT()-Math.random()*36,vx:(Math.random()-.5)*80,vy:-30-Math.random()*60,l:.45,c:i%2?'#6fffa0':'#e4fff0'});
  tone(900,300,.25,'sine',.07);noise(.2,.08,3000,8000,'highpass')};
 // WHOLE-MAP SEQUENCE: five slashes that hit everywhere: PARRY, PARRY, DODGE, PARRY, PARRY. Ignores i-frames.
 const SQEVERY=10,SQDMG=60,SQT=[.4,.98,1.56,2.14,2.72],SQK=['P','P','D','P','P'];
 const seqHit=(B,i)=>{const dd=SQK[i]==='D',pd=B.def.pd*1.4;faceP(B);
  const src={x:bcx(B)-8,y:B.y,w:16,h:B.h,face:B.face,post:0,stun:0},inv=P.inv,dg=P.dodge,bl=P.blocking;let r;
  const hit=()=>{P.inv=0;P.dodge=0;P.blocking=false;try{r=hurtPlayer(SQDMG,pd,src)}finally{P.blocking=bl}};   // unblockable: guard never reduces it, i-frames never stop it
  if(dd){if(dodgedNow(.18)){r='dodge';float(P.x,P.y-14,'DODGED','#9cf')}else hit()}
  else{const ok=P.blocking&&P.guardBroken<=0&&time-P.blockT<=.2+S.parry-.05;
   if(ok){r='parry';try{sfx.parry();qEv('parry')}catch(e){}burst(P.x+6+P.face*10,P.y+8,14,'#fff');float(P.x,P.y-12,'PARRY','#ffd');P.pcd=0;P.stam=Math.min(maxStam(),P.stam+15);P.inv=Math.max(P.inv,inv);P.dodge=Math.max(P.dodge,dg)}
   else{hit();float(P.x,P.y-24,'NO BLOCKING','#fb6')}}
  B.sqr[i]=(r==='parry'||r==='dodge')?'ok':r==='block'?'blk':'x';
  SQF.push({t0:time,k:SQK[i],res:r,i});shake=Math.max(shake,r==='hit'?16:9);hitstop=Math.max(hitstop,r==='hit'?.1:.05);
  tone(70,25,.8,'sawtooth',.22);noise(.5,.3,6000,150,'highpass');if(r==='parry'||r==='dodge')tone(1568,2093,.4,'sine',.1,.05)};
 const slfx=(B,rch,big)=>{MSL.push({x:bcx(B)+B.face*6,y:bcy(B)-2,f:B.face,r:rch,t0:time,big:!!big,a:(Math.random()-.5)*.5});
  for(let i=0;i<(big?16:7);i++)parts.push({x:bcx(B)+B.face*(10+Math.random()*rch*.8),y:B.y+B.h-2-Math.random()*(big?26:12),vx:B.face*(90+Math.random()*180),vy:-20-Math.random()*60,l:.55,c:i%3?'#6fffa0':'#e4fff0'});
  shake=Math.max(shake,big?6:3);tone(big?420:640,big?90:160,.18,'sawtooth',.07);noise(.14,.14,6500,1400,'highpass')};
 const sl=(B,rch,dm,big)=>{faceP(B);slfx(B,rch,big);
  const dx=P.x+6-bcx(B),dy=P.y+11-bcy(B);
  if(Math.hypot(dx,dy)<rch+6&&dx*B.face>-10)hurtPlayer(bdm(B)*dm*(B.dm||1),B.def.pd*(big?1.3:1),B)};
 // wind blades: spinning crescents of gale (own projectile list, see updWind)
 const blade=(x,y,ang,sp,dm,sz)=>WB.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,a:ang,sz:sz||12,dm,l:4,tr:[]});
 const wave=(B,sp,dm,hi)=>blade(bcx(B)+B.face*12,hi?bcy(B)-10:MAES.fy*T-13,B.face>0?0:Math.PI,sp,bdm(B)*dm*(B.dm||1),hi?12:17);
 const tornado=(x,ph2)=>{if(TW.length>=4)TW.shift();TW.push({x,dir:x<MAES.cx*T?1:-1,sp:ph2?98:72,t:ph2?6.5:5.2,t0:ph2?6.5:5.2,hc:.5,rt:.5,ph:Math.random()*6,h:76})};
 const tPos=B=>{const a=MAES,L=(a.cx-a.hw+6)*T,R=(a.cx+a.hw-6)*T,o=[L,R];if(B.ph===2)o.push(Math.max(L,Math.min(R,P.x+6+(Math.random()<.5?-1:1)*170)));return o};
 const MS=[.08,.38],CT=[.05,.42,.79,1.2],GT=[.05,.26,.47,.68,.89,1.1,1.5];
 AT.mslash={wu:.6,act:.75,rec:.8,f(B){B.cs=0},tk(B){const e=AT.mslash.act-B.t;if(B.cs<2&&e>=MS[B.cs]){const s2=B.cs===1;sl(B,B.def.reach*(s2?1.1:1),s2?1.15:1,s2);B.x+=B.face*(s2?18:12);if(s2&&B.ph===2)wave(B,B.def.ps,.8,false);B.cs++}}};
 AT.mwave={wu:.7,act:1.0,rec:.9,f(B){B.cs=0},tk(B){const e=AT.mwave.act-B.t,Tm=B.ph===2?[.08,.42,.76]:[.08,.5];if(B.cs<Tm.length&&e>=Tm[B.cs]){sl(B,B.def.reach*.8,.7);wave(B,B.def.ps*(1+B.cs*.1),.9,B.cs%2===1);B.cs++}}};
 AT.mcombo={wu:.75,act:1.7,rec:1.1,f(B){B.cs=0},tk(B){const e=AT.mcombo.act-B.t;if(B.cs<4&&e>=CT[B.cs]){const last=B.cs===3;sl(B,B.def.reach*(last?1.25:1),last?1.5:1,last);B.x+=B.face*(last?26:16);if(last)wave(B,B.def.ps*1.1,1,false);B.cs++}}};
 AT.mdash={wu:.8,act:1.2,rec:1.1,f(B){faceP(B);B.dv=B.face;B.dd=0;B.dd2=0;B.d2=0;B.dhit=0;tone(200,900,.25,'sawtooth',.08)},
  tk(B,dt){const e=AT.mdash.act-B.t;
   if(e>=.5&&!B.d2){B.d2=1;faceP(B);B.dv=B.face;B.dhit=0;tone(200,950,.25,'sawtooth',.08)}
   const dashing=e<.22||(e>=.5&&e<.72);
   if(dashing){B.vx=B.dv*(e>=.5?900:820);B.gh=B.gh||[];if(!B.ghT||time-B.ghT>.03){B.ghT=time;B.gh.push({x:B.x,y:B.y,f:B.face,t:time})}burst(bcx(B),B.y+B.h-4,1,'#6fffa0');
    if(!B.dhit&&Math.abs(P.x+6-bcx(B))<22&&Math.abs(P.y+11-bcy(B))<30){B.dhit=1;hurtPlayer(bdm(B)*.9*(B.dm||1),B.def.pd,B)}}
   else{B.vx=0;if(e>=.22&&!B.dd){B.dd=1;sl(B,B.def.reach*1.1,1.2,false)}if(e>=.72&&!B.dd2){B.dd2=1;sl(B,B.def.reach*1.2,1.3,true)}}}};

 // ASTRAL WIND (phase 2 only): 5 blindingly fast dashes, each re-aimed at you, each leaving a wind crescent; the last ends in a heavy cut
 AT.mastral={wu:1.0,act:1.75,rec:1.2,AS:.12,AD:.3,
  f(B){B.ds=0;B.dg=0;B.dhit=0;faceP(B);tone(300,1400,.4,'sawtooth',.09);noise(.4,.1,1200,6000,'bandpass',1.5)},
  tk(B,dt){const A=AT.mastral,e=A.act-B.t;
   if(B.dg>0){B.dg-=dt;B.vx=B.dv*1700;B.gh=B.gh||[];if(!B.ghT||time-B.ghT>.016){B.ghT=time;B.gh.push({x:B.x,y:B.y,f:B.face,t:time})}burst(bcx(B),B.y+B.h-4,2,'#bfffd2');
    if(!B.dhit&&Math.abs(P.x+6-bcx(B))<24&&Math.abs(P.y+11-bcy(B))<30){B.dhit=1;hurtPlayer(bdm(B)*.8*(B.dm||1),B.def.pd,B)}
    if(B.dg<=0){B.vx=0;slfx(B,B.def.reach*.8,B.ds===5);wave(B,B.def.ps*1.25,.6,false);if(B.ds===5)sl(B,B.def.reach*1.25,1.4,true)}}
   else{B.vx=0;if(B.ds<5){faceP(B);if(e>=A.AS+B.ds*A.AD){B.ds++;B.dv=B.face;B.dg=.13;B.dhit=0;shake=Math.max(shake,4);tone(500+B.ds*120,1800,.12,'sawtooth',.07)}}}}};
 // HORIZON RENDING (phase 2 only): he cleaves the whole arena floor; two ground shockwaves race out to both walls. JUMP over them.
 AT.mrend={wu:1.15,act:.9,rec:1.5,
  f(B){B.gs=0;faceP(B);tone(90,500,1.0,'sawtooth',.12)},
  tk(B,dt){B.vx=0;const e=AT.mrend.act-B.t;
   if(!B.gs&&e>=.22){B.gs=1;slfx(B,B.def.reach*1.4,true);shake=Math.max(shake,14);hitstop=Math.max(hitstop,.06);tone(70,30,.7,'sawtooth',.2);noise(.6,.25,4000,200,'highpass');
    for(const d of[-1,1])GW.push({x:bcx(B),ox:bcx(B),dir:d,sp:860,dm:bdm(B)*1.5*(B.dm||1),hit:0,tr:[]});
    banner2('JUMP!')}}};
 // TEMPEST EYE (phase 2): a quick cast that puts a 5s STATUS on him (he keeps attacking normally). Strike him while it lasts and he parries you, then counters.
 AT.meye={wu:.7,act:.5,rec:.5,f(B){B.eyeT=5;B.cn=0;B.eyeCd=0;B.eyeL=-9;faceP(B);toast('TEMPEST EYE \u2014 do not strike him');tone(120,900,.9,'sawtooth',.1);tone(240,1800,.9,'sine',.08)},tk(B){B.vx=0}};
 const eyeOn=()=>!!(MB&&inM&&MB.eyeT>0&&!MB.dead&&!MB.fin&&MB.st!=='phase');
 const eyeParry=B=>{if(time-(B.eyeL||-9)<.35){B.eyeL=time;return}B.eyeL=time;
  const dir=P.x+6>bcx(B)?1:-1;faceP(B);P.stun=Math.max(P.stun,.22);P.vx=dir*260;P.vy=-80;P.post=Math.min(maxPost()*.9,P.post+18);
  burst(bcx(B)+dir*14,bcy(B)-4,18,'#fff');burst(bcx(B)+dir*14,bcy(B)-4,10,'#6fffa0');float(P.x,P.y-16,'PARRIED!','#ff8a8a');
  hitstop=Math.max(hitstop,.1);shake=Math.max(shake,7);tone(1800,900,.15,'square',.1);tone(500,200,.2,'sawtooth',.1);
  if(!(B.cn>0)&&(B.eyeCd||0)<=0){B.cn=.4;B.eyeCd=1.1}};
 {const _hb8=hitBoss;hitBoss=function(e){if(e&&e===MB&&eyeOn()){eyeParry(e);return}return _hb8.apply(this,arguments)}}
 // the eyes, drawn on the canvas: left = green swirl, right = purple slit
 const drawEye=(x,y,ew,eh,kind,t)=>{cx.save();cx.translate(x,y);if(kind)cx.scale(-1,1);
  eh*=1-Math.max(0,Math.min(.88,(Math.sin(t*1.3+kind*2)-.97)*33));
  cx.beginPath();cx.ellipse(0,0,ew/2,eh/2,0,0,7);cx.fillStyle='#fff';cx.fill();
  cx.save();cx.beginPath();cx.ellipse(0,0,ew/2,eh/2,0,0,7);cx.clip();
  const r=Math.min(eh*.55,ew*.2),ix=ew*.03,iy=eh*.02;cx.fillStyle='#0a0a0a';cx.beginPath();cx.arc(ix,iy,r,0,7);cx.fill();
  if(!kind){cx.fillStyle='#22c24f';cx.beginPath();cx.arc(ix,iy,r*.78,0,7);cx.fill();cx.strokeStyle='#c4ffd0';cx.lineWidth=Math.max(1.5,r*.1);cx.lineCap='round';cx.beginPath();
   for(let a=0;a<12;a+=.2){const rr=r*.1+r*.6*a/12,an=a+t*2.4,px=ix+Math.cos(an)*rr,py=iy+Math.sin(an)*rr;a?cx.lineTo(px,py):cx.moveTo(px,py)}cx.stroke();cx.fillStyle='#052a10';cx.beginPath();cx.arc(ix,iy,r*.13,0,7);cx.fill()}
  else{cx.fillStyle='#6a3fb0';cx.beginPath();cx.arc(ix,iy,r*.78,0,7);cx.fill();cx.fillStyle='#b896ec';cx.beginPath();cx.ellipse(ix,iy,r*.3*(1+.15*Math.sin(t*3)),r*.72,0,0,7);cx.fill();cx.fillStyle='#2a1050';cx.beginPath();cx.ellipse(ix,iy,r*.09,r*.52,0,0,7);cx.fill()}
  cx.fillStyle='rgba(255,255,255,.8)';cx.beginPath();cx.arc(ix-r*.3,iy-r*.32,r*.11,0,7);cx.fill();cx.restore();
  cx.strokeStyle='#000';cx.lineWidth=Math.max(1.5,ew*.012);cx.beginPath();cx.ellipse(0,0,ew/2,eh/2,0,0,7);cx.stroke();
  cx.strokeStyle='#050505';cx.lineWidth=eh*.34;cx.lineCap='round';cx.beginPath();cx.ellipse(0,eh*.06,ew*.53,eh*.52,0,Math.PI*1.03,Math.PI*1.97);cx.stroke();
  cx.lineWidth=Math.max(2,ew*.016);for(let i=0;i<3;i++){cx.beginPath();cx.moveTo(-ew*.4+i*ew*.035,eh*.44);cx.quadraticCurveTo(-ew*.5+i*ew*.03,eh*.62,-ew*.58+i*ew*.02,eh*.66+i*eh*.06);cx.stroke()}
  cx.restore()};
 const drawEyes=(w,h,al,t)=>{cx.save();const gr=cx.createRadialGradient(w/2,h*.45,h*.1,w/2,h*.45,Math.max(w,h)*.7);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(40,10,70,'+(.18*al)+')');cx.fillStyle=gr;cx.fillRect(0,0,w,h);
  cx.globalAlpha=al;const ew=Math.min(w*.17,230),eh=ew*.42,y=h*.2+Math.sin(t*2)*2;drawEye(w*.5-ew*.62,y,ew,eh,0,t);drawEye(w*.5+ew*.62,y,ew,eh,1,t);cx.restore()};
 AT.mafter={wu:.6,act:2.0,rec:1.1,f(B){B.ap=0;faceP(B);tone(1200,200,.5,'sine',.1)},
  tk(B){B.vx=0;const e=AT.mafter.act-B.t,TT=[.05,.6,1.15];if(B.ap<3&&e>=TT[B.ap]){B.ap++;phSpawn(B,.75)}}};
 AT.mseq={wu:1.0,act:3.3,rec:2.0,f(B){B.sq=0;B.sqr=[];B.sqw=0;faceP(B);tone(80,200,1.2,'sawtooth',.1)},
  tk(B){B.vx=0;const e=AT.mseq.act-B.t;
   if(B.sq<5){if(!B.sqw&&e>=SQT[B.sq]-.35){B.sqw=1;const dd=SQK[B.sq]==='D';tone(dd?260:1500,dd?120:1500,.3,dd?'sawtooth':'sine',.1)}
    if(e>=SQT[B.sq]){seqHit(B,B.sq);B.sq++;B.sqw=0}}}};
 // LEAP: he springs straight up from where he stands, hangs while he aims (the line locks onto you), then lunges. Dodge or parry it.
 AT.mleap={wu:.7,act:1.8,rec:1.3,f(B){B.lin=0;B.lk=0;B.lt=null;B.lh=0;B.lg=0;B.l1=0;faceP(B)},
  tk(B,dt){B.vx=0;B.vy=0;B.lv=1;const A=AT.mleap,e=A.act-B.t,base=FYT()-B.h,H=175,TL=.2,E0=.38,EL=.6,EU=.95,Lb=(MAES.cx-MAES.hw)*T+6,Rb=(MAES.cx+MAES.hw)*T-B.w-6;
   if(!B.lin){B.lin=1;B.lx0=B.x;B.ly0=Math.min(B.y,base);B.lx=B.x;B.ly=B.y;tone(200,760,.3,'sine',.1);for(let i=0;i<10;i++)parts.push({x:bcx(B),y:B.y+B.h,vx:(Math.random()-.5)*200,vy:-30-Math.random()*60,l:.4,c:'#bfffd2'})}
   let x=B.lx0,y;
   if(e<E0){const k=e/E0;y=B.ly0-H*(1-Math.pow(1-k,3))}
   else if(e<EU){y=B.ly0-H+Math.sin(time*16)*2;faceP(B);if(e<EL)B.lt={x:P.x+6,y:P.y+11};else if(!B.lk){B.lk=1;tone(1400,500,.25,'square',.1)}}
   else{if(!B.lt)B.lt={x:P.x+6,y:P.y+11};const k=Math.min(1,(e-EU)/TL),tx=B.lt.x-B.w/2,ty=Math.min(base,B.lt.y-B.h/2);
    if(!B.l1){B.l1=1;B.lxs=x;B.lys=B.ly0-H;tone(300,1800,.2,'sawtooth',.12);noise(.2,.15,1500,7000,'bandpass',1.5)}
    x=lerp(B.lxs,tx,k);y=lerp(B.lys,ty,k);
    B.gh=B.gh||[];if(!B.ghT||time-B.ghT>.016){B.ghT=time;B.gh.push({x:Math.max(Lb,Math.min(Rb,x)),y,f:B.face,t:time})}
    if(!B.lh&&Math.hypot(x+B.w/2-(P.x+6),y+B.h/2-(P.y+11))<34){B.lh=1;hurtPlayer(bdm(B)*1.35*(B.dm||1),B.def.pd*1.3,B)}
    if(k>=1&&!B.lg){B.lg=1;slfx(B,B.def.reach,true);shake=Math.max(shake,9)}
    if(k>=1)y=lerp(ty,base,Math.min(1,(e-EU-TL)/.18))}
   B.lx=Math.max(Lb,Math.min(Rb,x));B.ly=y}};
 AT.mgale={wu:.9,act:2.2,rec:1.3,f(B){B.cs=0},tk(B){const e=AT.mgale.act-B.t;if(B.cs<7&&e>=GT[B.cs]){const last=B.cs===6;sl(B,B.def.reach*(last?1.3:.95),last?1.6:.9,last);B.x+=B.face*(last?18:10);
   if(B.cs===3)wave(B,B.def.ps,.9,true);if(last){wave(B,B.def.ps*1.15,1.1,false);blade(bcx(B)-B.face*12,MAES.fy*T-13,B.face>0?Math.PI:0,B.def.ps*1.15,bdm(B)*1.1,17)}B.cs++}}};
 AT.mfall={wu:.8,act:1.9,rec:1.2,f(B){[-132,-88,-44,0,44,88,132].forEach((o,i)=>bzone(B,P.x+6+o,.9+i*.1,22));if(B.ph===2)for(let i=0;i<3;i++)bzone(B,(MAES.cx+(Math.random()-.5)*MAES.hw*1.6)*T,1.2+i*.2,22)}};
 AT.mblades={wu:.9,act:1.5,rec:1.1,f(B){B.cs=0},tk(B){const e=AT.mblades.act-B.t,Tm=B.ph===2?[.1,.45,.8,1.15]:[.1,.5,.9];if(B.cs<Tm.length&&e>=Tm[B.cs]){faceP(B);slfx(B,B.def.reach*.9,B.cs===Tm.length-1);
   const n=B.ph===2?7:5,base=Math.atan2(P.y+11-bcy(B),P.x+6-bcx(B)),sp=B.cs%2?300:260;for(let i=0;i<n;i++)blade(bcx(B)+B.face*10,bcy(B),base+(i-(n-1)/2)*.2,sp,bdm(B)*.7*(B.dm||1),10);B.cs++}}};
 AT.mcyclone={wu:1.0,act:2.4,rec:1.5,f(B){B.cy=0;B.cr=0},tk(B,dt){B.vx=0;B.cr-=dt;if(B.cr<=0){B.cr=.32;const n=8,off=B.cy*.45;for(let i=0;i<n;i++)blade(bcx(B),bcy(B),off+i/n*6.283,200,bdm(B)*.6*(B.dm||1),10);B.cy++;
   MSL.push({x:bcx(B),y:bcy(B),f:B.cy%2?1:-1,r:60,t0:time,big:true,a:B.cy*.9});shake=Math.max(shake,3);tone(300+B.cy*40,120,.2,'sawtooth',.05)}}};
 AT.mtornado={wu:1.1,act:1.6,rec:1.6,f(B){const ps=B.tw0||tPos(B);B.tw0=null;ps.forEach(x=>tornado(x,B.ph===2));shake=Math.max(shake,8);tone(70,240,1.2,'sawtooth',.16);noise(1.6,.2,300,2600,'bandpass',1.5);banner2('TORNADO WINDS')}};
 const banner2=t=>toast(t);

 // engine hooks: no fury phase / no death / no ambient zones for him (see game.js guards)
 const startFinale=B=>{B.fin=1;B.fs='enter';B.ft=2.4;B.st='phase';B.vx=0;zones=[];projs=[];shake=14;tone(60,30,1.6,'sawtooth',.2);
  banner('\u201c ENOUGH. \u201d',MN,'Parry the JUDGEMENT CUT with RMB \u2014 only a parry can end this duel')};
 const startWind=B=>{B.fs='wind';B.ft=B.ftot=JW;B.tk=0;B.cue=0;B.res=null;zones=[];projs=[];tone(70,320,JW,'sawtooth',.12);tone(140,640,JW,'sine',.1);noise(JW,.08,200,3000,'bandpass',2)};
 function strike(B){
  const dodged=P.inv>0||P.dodge>0||time-(P.mdT||-9)<=.26;let r;
  if(dodged){r='dodge';float(P.x,P.y-14,'DODGED \u2014 only a PARRY ends it','#9cf')}
  else{const sp=S.parry;S.parry=sp+(JPW-.2);try{r=hurtPlayer(JDMG,B.def.pd*2,B)}finally{S.parry=sp}}
  B.st='phase';B.hp=1;B.res=r;B.fs='strike';B.ft=.8;
  MJ.push({x:P.x+6,y:P.y+11,t0:time,res:r});shake=Math.max(shake,r==='hit'?22:14);hitstop=Math.max(hitstop,.18);
  const good=r==='parry';burst(P.x+6,P.y+10,40,good?'#7ff':'#ff4a5a');burst(bcx(B),bcy(B),30,'#6fffa0');
  tone(60,22,1.6,'sawtooth',.4);noise(1.2,.4,6000,120,'highpass');if(good){tone(1568,2093,.6,'sine',.14,.1);tone(2093,3136,.5,'triangle',.08,.18)}}
 function finTick(B,dt){
  B.vx=0;B.st='phase';B.hp=1;faceP(B);B.flash=Math.max(0,(B.flash||0)-dt);move(B,dt);B.ft-=dt;
  if(B.fs==='enter'){if(B.ft<=0)startWind(B)}
  else if(B.fs==='wind'){const rem=Math.max(0,B.ft);B.tk-=dt;
   if(B.tk<=0){B.tk=Math.max(.12,.1+rem*.2);tone(rem<JPW+.15?1400:rem<1.2?520:210,rem<.6?1700:rem<1.2?700:260,.12,'square',rem<.6?.1:.06)}
   if(!B.cue&&rem<=JPW+.08){B.cue=1;tone(1760,1760,.35,'sine',.16);tone(2637,2637,.3,'triangle',.1,.03)}
   if(rem<=0)strike(B)}
  else if(B.fs==='strike'){if(B.ft<=0){if(B.res==='parry'){B.fs='vic';B.ft=3.6;B.vt=0;hitstop=Math.max(hitstop,.45);shake=18;P.stam=maxStam();
     banner('JUDGEMENT PARRIED',MN,'\u201c\u2026Well parried.\u201d');[392,523,659,784,1046].forEach((f,i)=>tone(f,f*1.5,.6,'sine',.07,i*.12))}
    else{B.fs='rec';B.ft=B.res==='dodge'?1.6:2.4}}}
  else if(B.fs==='rec'){if(B.ft<=0)startWind(B)}
  else if(B.fs==='vic'){B.vt+=dt;if(Math.random()<.5)parts.push({x:B.x+Math.random()*B.w,y:B.y+Math.random()*B.h,vx:(Math.random()-.5)*60,vy:-50,l:.7,c:Math.random()<.5?'#6fffa0':'#fff'});if(B.ft<=0)mWin()}
  return true}
 function mPre(B,dt){
  if(B.hp<1)B.hp=1;if(B.st==='dying'){B.st='idle';B.t=.5}
  BD.maestro.dmg=B.ph===2?Math.round(90/1.35):90;      // "90 damage" in both phases (the engine's phase multiplier is cancelled)
  if(!B.fin&&B.hp<=1&&B.st!=='dormant'&&B.st!=='intro')startFinale(B);
  if(B.fin)return finTick(B,dt);
  if(B.ph===2){if(B.sqT==null)B.sqT=SQEVERY;
   if(['idle','tele','act','rec'].includes(B.st))B.sqT-=dt;
   if(B.sqT<=0&&B.atk!=='mseq'&&(B.st==='idle'||(B.st==='rec'&&B.t-dt<=0))){B.sqT=SQEVERY;B.atk='mseq';B.lastA='mseq';B.st='tele';B.twu=B.t=AT.mseq.wu;B.vx=0;B.chain=0;zones=[];projs=[];WB.length=0;GW.length=0;PH.length=0;faceP(B)}}
  if(B.st==='intro'&&!B.bn){B.bn=1;banner(MN.toUpperCase(),'Wielder of the Gale','Slashes are telegraphed \u2014 parry or dodge them. He cannot be killed by damage.')}
  if(B.ph===2&&!B.p2n){B.p2n=1;banner('PHASE II','THE GALE RISES','He moves faster and strikes in longer strings')}
  return false}
 {const _ub8=updBoss;updBoss=function(B,dt){if(B.id==='maestro'&&!B.dead){if(mPre(B,dt))return}const r=_ub8.apply(this,arguments);if(B.id==='maestro'&&B.lv){if(B.st==='act'&&B.atk==='mleap'&&B.lx!=null){B.x=B.lx;B.y=B.ly;B.vx=B.vy=0}else B.lv=0}return r}}

 function updWind(dt){
  const B=MB;if(!B||!P)return;const a=MAES,fyT=a.fy*T,Lx=(a.cx-a.hw)*T+16,Rx=(a.cx+a.hw)*T-16,calm=!!(B.fin||B.st==='phase'||B.st==='dying'||mDone);
  // gale drag: during any melee-slash attack he drags you across the whole hall toward him, gradually (walk/dash away to resist)
  if(!calm&&!P.dead&&(B.st==='tele'||B.st==='act')&&['mslash','mwave','mcombo','mgale','mdash'].includes(B.atk)){
   const pdx=bcx(B)-(P.x+6),ad=Math.abs(pdx);
   if(ad>26){const v=Math.min(360,90+ad*.7),nx=P.x+Math.sign(pdx)*Math.min(v*dt,ad-26);
    if(!boxSolid(nx,P.y,12,22))P.x=nx;if(Math.random()<.7)parts.push({x:P.x+6-Math.sign(pdx)*(6+Math.random()*16),y:P.y+Math.random()*22,vx:Math.sign(pdx)*(160+Math.random()*140),vy:-8,l:.25,c:Math.random()<.5?'#6fffa0':'#e4fff0'})}}
  if(B.eyeT>0)B.eyeT=calm?0:Math.max(0,B.eyeT-dt);B.eyeCd=Math.max(0,(B.eyeCd||0)-dt);if(B.cn>0){B.cn-=dt;if(B.cn<=0){B.cn=0;if(!calm){faceP(B);sl(B,B.def.reach*1.3,1.5,true);wave(B,B.def.ps*1.1,.7,false)}}}
  if(!calm&&B.ph===2&&(B.st==='tele'||B.st==='act')&&!['mseq','mafter','mrend'].includes(B.atk)){B.aft=(B.aft==null?7:B.aft)-dt;if(B.aft<=0){phSpawn(B,.8);B.aft=10+Math.random()*5}}
  for(let i=PH.length-1;i>=0;i--){const g=PH[i];g.t+=dt;if(calm){PH.splice(i,1);continue}
   if(!g.k&&g.t>=g.tw){g.k=1;g.f=P.x+6>g.x?1:-1;const px={x:g.x-8,y:FYT()-36,w:16,h:36,face:g.f,post:0};slfx(px,58,false);
    const dx=P.x+6-g.x,dy=P.y+11-(FYT()-18);if(Math.abs(dx)<64&&Math.abs(dy)<44&&dx*g.f>-14)hurtPlayer(bdm(B)*.95*(B.dm||1),B.def.pd,px)}
   if(g.t>g.tw+.5)PH.splice(i,1)}
  for(let i=GW.length-1;i>=0;i--){const g=GW[i],o=g.x;g.x+=g.dir*g.sp*dt;g.tr.unshift(g.x);if(g.tr.length>10)g.tr.pop();
   if(calm||g.x<Lx-24||g.x>Rx+24){GW.splice(i,1);continue}
   parts.push({x:g.x,y:fyT-Math.random()*20,vx:g.dir*(40+Math.random()*80),vy:-40-Math.random()*90,l:.4,c:Math.random()<.5?'#bfffd2':'#2f9a52'});
   const lo=Math.min(o,g.x)-10,hi=Math.max(o,g.x)+10,pc=P.x+6;
   if(!g.hit&&!P.dead&&pc>=lo&&pc<=hi&&P.y+22>fyT-18){g.hit=1;hurtPlayer(g.dm,B.def.pd*1.4,{x:g.x-8,y:fyT-34,w:16,h:34,face:g.dir,post:0});burst(pc,fyT-8,16,'#6fffa0')}}
  for(let i=TW.length-1;i>=0;i--){const w=TW[i];w.t-=dt;w.hc-=dt;w.ph+=dt*9;if(calm)w.t=Math.min(w.t,.3);
   w.rt-=dt;if(w.rt<=0){w.rt=.9;w.dir=P.x+6>w.x?1:-1}w.x=Math.max(Lx,Math.min(Rx,w.x+w.dir*w.sp*dt));
   const dx=w.x-(P.x+6);
   if(!calm&&!P.dead&&Math.abs(dx)<150&&P.y+22>fyT-95){P.x=Math.max((a.cx-a.hw)*T+4,Math.min((a.cx+a.hw+1)*T-16,P.x+Math.sign(dx)*(1-Math.abs(dx)/150)*70*dt))}
   if(!calm&&!P.dead&&w.hc<=0&&Math.abs(dx)<20&&P.y+22>fyT-w.h){w.hc=.8;hurtPlayer(bdm(B)*.7*(B.dm||1),B.def.pd*.6,{x:w.x-8,y:fyT-w.h,w:16,h:w.h,face:dx>0?-1:1,post:0})}
   if(Math.random()<.6)parts.push({x:w.x+(Math.random()-.5)*30,y:fyT-Math.random()*w.h,vx:(Math.random()-.5)*120,vy:-60-Math.random()*60,l:.5,c:Math.random()<.5?'#bfffd2':'#2f9a52'});
   if(w.t<=0)TW.splice(i,1)}
  for(let i=WB.length-1;i>=0;i--){const b=WB[i];b.l-=dt;b.tr.unshift([b.x,b.y]);if(b.tr.length>8)b.tr.pop();b.x+=b.vx*dt;b.y+=b.vy*dt;
   let dead=b.l<=0||calm||solid(b.x/T|0,b.y/T|0);
   if(!dead&&!P.dead&&Math.hypot(P.x+6-b.x,P.y+11-b.y)<b.sz*.8+7){hurtPlayer(b.dm,B.def.pd*.6,{x:b.x-4,y:b.y-4,w:8,h:8,face:b.vx>=0?1:-1,post:0});dead=true;burst(b.x,b.y,8,'#6fffa0')}
   if(dead){if(!calm)burst(b.x,b.y,3,'#bfffd2');WB.splice(i,1)}}}
 {const _uf8=updFx;updFx=function(dt){_uf8.apply(this,arguments);if(inM){try{updWind(dt)}catch(e){}}}}

 // ---------- banner / dialogue ----------
 function banner(t1,t2,t3){bossBanner('','');const b=document.getElementById('bossBanner');b.innerHTML='<div class="bb-t" style="font-size:38px;color:#bfffd2;text-shadow:0 0 30px #2fe07a,0 0 60px #0a6a30,0 4px 0 #000">'+t1+'</div><div class="bb-n">'+t2+'</div><div class="bb-s" style="color:#9fe">'+t3+'</div>'}
 let dl=null;
 function mDlg(name,lines,done){if(dl)return;const el=document.createElement('div');el.id='dlg';el.innerHTML='<div class="dn">'+name+'</div><div class="dt"></div><div class="dh">click / Space to continue</div>';document.body.appendChild(el);
  dl={el,i:0,c:0,iv:null,lines,done};paused=true;const tx=el.querySelector('.dt');
  const show=()=>{dl.c=0;tx.textContent='';clearInterval(dl.iv);dl.iv=setInterval(()=>{dl.c++;tx.textContent=dl.lines[dl.i].slice(0,dl.c);if(dl.c>=dl.lines[dl.i].length)clearInterval(dl.iv)},24)};
  dl.next=()=>{if(dl.c<dl.lines[dl.i].length){dl.c=dl.lines[dl.i].length;tx.textContent=dl.lines[dl.i];clearInterval(dl.iv);return}if(++dl.i>=dl.lines.length){clearInterval(dl.iv);el.remove();const d=dl.done;dl=null;d();return}show();tone(660,880,.3,'sine',.04)};
  el.onclick=()=>dl&&dl.next();show()}
 addEventListener('keydown',e=>{if(dl){e.stopImmediatePropagation();e.preventDefault();if(e.repeat)return;if(e.code==='Space'||e.code==='Enter'||e.code==='KeyE')dl.next()}},true);

 // ---------- enter / leave the hall ----------
 function enterM(){if(inM||!P)return;inM=true;mDone=0;
  HM8={tiles,mods,enemies,chests,zones,projs,GATES,ARCHES,seen,SHOP,QG,ENCP,p:{x:P.x,y:P.y,face:P.face}};SHOP=QG=ENCP=null;
  tiles=genMaes();enemies=[];chests=[];zones=[];projs=[];parts=[];floats=[];GATES=[];ARCHES=[];seen=new Uint8Array(W*H);
  ARENAS.push(MAES);BP[0]=MAESP;BG[0]='#0c1114';
  P.hp=maxHp();P.stam=maxStam();P.post=0;P.inv=2;P.stun=0;P.guardBroken=0;P.dodge=0;P.atk=0;P.climb=false;P.blocking=false;P.x=(MAES.cx-MAES.hw+5)*T;P.y=MAES.fy*T-22;P.vx=P.vy=0;P.face=1;
  cam.x=Math.max(0,Math.min(W*T-cv.width,P.x-cv.width/2));cam.y=Math.max(0,Math.min(H*T-cv.height,P.y-cv.height/2));
  mkBosses();enemies=enemies.filter(e=>e.id==='maestro');MB=enemies[0]||null;if(MB){MB.face=-1}
  MSL=[];MJ=[];WB.length=0;GW.length=0;PH.length=0;SQF.length=0;TW.length=0;paused=false;shake=6;fadeTo(0,700);toast('\u2726 The Maestro\u2019s Hall \u2726');tone(220,880,1.2,'sine',.1)}
 function leaveM(){if(!inM)return;inM=false;MB=null;MSL=[];MJ=[];WB.length=0;GW.length=0;PH.length=0;SQF.length=0;TW.length=0;const h=HM8;HM8=null;
  const i=ARENAS.indexOf(MAES);if(i>=0)ARENAS.splice(i,1);delete BP[0];delete BG[0];
  if(h){tiles=h.tiles;mods=h.mods;enemies=h.enemies;chests=h.chests;zones=h.zones;projs=h.projs;GATES=h.GATES;ARCHES=h.ARCHES;seen=h.seen;SHOP=h.SHOP;QG=h.QG;ENCP=h.ENCP;
   P.x=h.p.x;P.y=h.p.y;P.face=h.p.face}
  parts=[];floats=[];zones=[];projs=[];P.vx=P.vy=0;P.climb=false;P.atk=0;P.dodge=0;P.stun=0;P.guardBroken=0;P.blocking=false;P.inv=Math.max(P.inv||0,1.5);
  cam.x=Math.max(0,Math.min(W*T-cv.width,P.x-cv.width/2));cam.y=Math.max(0,Math.min(H*T-cv.height,P.y-cv.height/2))}
 function mWin(){if(!inM||mDone)return;mDone=1;fadeTo(1,900);
  setTimeout(()=>{leaveM();P.hp=maxHp();P.stam=maxStam();P.post=0;try{window.__elder&&__elder.claim()}catch(e){}fadeTo(0,900);setTimeout(()=>{try{window.__elder&&__elder.reopen()}catch(e){}},700)},950)}
 function mLose(){if(!inM||mDone)return;mDone=1;P.hp=maxHp();P.inv=30;if(MB){MB.st='phase';MB.t=99}zones=[];projs=[];WB.length=0;GW.length=0;PH.length=0;SQF.length=0;TW.length=0;fadeTo(1,700);
  setTimeout(()=>{leaveM();P.hp=maxHp();P.stam=maxStam();P.post=0;P.inv=2;fadeTo(0,800);toast('The Maestro was too strong \u2014 speak to the Elder to try again');save();setTimeout(()=>{try{window.__elder&&__elder.reopen()}catch(e){}},600)},750)}
 {const _d8=die;die=function(){if(inM&&P&&!P.dead){mLose();return}return _d8.apply(this,arguments)}}
 {const _sv8=save;save=function(){if(inM||!P)return;_sv8()}}
 {const _st8=start;start=function(n){if(inM)leaveM();mDone=0;return _st8.apply(this,arguments)}}
 window.maestroTrial={go(){mDlg('ELDER MAREN',[
   'Take this legendary Gale Odachi, passed down by \u201cMaestro Evengarde Rest\u201d\u2026',
   '\u2026but a blade such as this is not simply handed over. The Maestro still guards it, and he does not yield to the unworthy.',
   'He cannot be cut down by strength alone. Learn his rhythm, wanderer \u2014 and when he calls the Judgement, answer it with a parry.',
   'Go. He is waiting.'],()=>{fadeTo(1,500);setTimeout(()=>{enterM()},520)})},inside:()=>inM};

 // ---------- hits on him: nothing special (engine hitBoss); posture/crit windows are the engine's ----------

 // ---------- drawing ----------
 const ease=k=>k*k*(3-2*k);
 function swordAng(B){const st=B.st;if(B.fin&&B.fs==='wind')return -2.0-Math.sin(time*6)*.04;if(B.fs==='vic')return 1.45;
  if(st==='tele'){const p=Math.max(0,Math.min(1,1-B.t/B.twu));return lerp(1.25,-2.0,ease(p))}
  if(st==='act'){const A=AT[B.atk],ac=A?Math.max(0,Math.min(1,1-B.t/A.act)):0;
   if(B.atk==='mcyclone')return time*12;
   if(B.atk==='mblades')return lerp(-1.2,.3,ease(Math.min(1,ac*3)));
   if(B.atk==='mcombo'||B.atk==='mgale'||B.atk==='mslash'){const arr=B.atk==='mgale'?GT:B.atk==='mslash'?MS:CT,e=A.act-B.t,i=Math.max(0,Math.min(arr.length-1,(B.cs||1)-1)),ph=Math.min(1,(e-arr[i])/.18);return lerp(B.cs%2?-1.4:.7,B.cs%2?.7:-1.4,ease(Math.max(0,ph)))}
   return lerp(-2.0,.5,ease(Math.min(1,ac*2.2)))}
  if(st==='rec')return lerp(.5,1.25,ease(Math.max(0,Math.min(1,1-B.t/.6))));
  if(st==='broken'||st==='stagger')return 1.5;
  return 1.25+Math.sin(time*2)*.05}
 function drawBlade(len,glow_){
  cx.fillStyle='#09130d';cx.fillRect(-11,-1.6,13,3.2);for(let x=-9;x<1;x+=4){cx.fillStyle='#14401f';cx.fillRect(x,-1.6,2,3.2)}
  PL([2,-4.6,4,-4.6,5.2,-2,5.2,2,4,4.6,2,4.6,1,2,1,-2],'#15231b');PL([2.6,-3.4,3.8,-3.4,4.2,0,3.8,3.4,2.6,3.4,2.2,0],'#14401f');
  PL([5,-2.4,len*.4,-3.4,len*.8,-6,len,-9,len*.82,-1.6,len*.4,1.2,5,1.6],'#0e1a14');
  cx.strokeStyle='#1f7a40';cx.lineWidth=1;cx.beginPath();cx.moveTo(5,1.6);cx.lineTo(len*.4,1.2);cx.lineTo(len*.82,-1.6);cx.lineTo(len,-9);cx.stroke();
  cx.strokeStyle='rgba(130,255,170,.5)';cx.lineWidth=.6;cx.beginPath();cx.moveTo(6,.4);cx.lineTo(len*.4,0);cx.lineTo(len*.8,-3.2);cx.stroke();
  for(let t=.12;t<.9;t+=.07){const x=5+(len-5)*t,y=-2.4-(len*.4>x?1:(x-len*.4)/len*10);PL([x,y,x+2.4,y-2.6,x+3.2,y+.4],'#060d08')}
  if(glow_>0)AD(()=>glow(len*.8,-4,16+glow_*16,'rgba(60,230,120,'+(.15+.3*glow_)+')'))}
 function drawM(B,ox,oy,L){
  if(B.gh&&!B.gh2){B.gh=B.gh.filter(g=>time-g.t<.35);for(const g of B.gh)drawM(Object.assign({},B,{x:g.x,y:g.y,face:g.f,vis:.45*(1-(time-g.t)/.35),gh2:1,st:'act',atk:'mslash',cs:1,t:0,gh:null,fin:0}),ox,oy,L)}
  const X=Math.round(B.x-ox),Y=Math.round(B.y-oy),f=B.face||1,t=time;if(X<-120||X>cv.width+120||Y<-140||Y>cv.height+120)return;
  const vis=B.vis==null?1:Math.max(0,Math.min(1,B.vis)),kneel=B.fs==='vic',a=swordAng(B),sway=Math.sin(t*2.4)*1.5*(B.ph===2?2.2:1),bob=(B.st==='idle'||B.st==='dormant')?Math.sin(t*2)*.6:0;
  const p=B.st==='tele'?Math.max(0,Math.min(1,1-B.t/B.twu)):(B.fin&&B.fs==='wind'?1-B.ft/B.ftot:0);
  cx.save();cx.globalAlpha=vis;if(!B.gh2){cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(X-3,Y+B.h-1,B.w+6,3)}
  cx.translate(X+B.w/2,Y+B.h+(kneel?-0:0));cx.scale(f,1);
  if(!B.gh2&&(B.ph===2||B.fin||B.st==='tele'||B.st==='act')){AD(()=>{glow(0,-20,40+Math.sin(t*5)*4,'rgba(40,220,110,'+(B.fin?.22:B.ph===2?.16:.1)+')');
   cx.lineCap='round';for(let i=0;i<4;i++){const an=t*(3.5+i*.8)+i*1.7;cx.strokeStyle='rgba(150,255,190,'+(.22+.08*i)+')';cx.lineWidth=1.4;cx.beginPath();cx.ellipse(0,-6-i*9,15+i*2.5,4.5,0,an,an+2.3);cx.stroke()}
   for(let i=0;i<6;i++){const f2=(t*.9+i*.17)%1,an=t*5+i*1.3;cx.fillStyle='rgba(190,255,215,'+(.7*(1-f2))+')';cx.fillRect(Math.cos(an)*(12+f2*8),-4-f2*40,1.6,1.6)}})}
  const dy=kneel?9:0+bob;
  // cloak behind
  PL([-8,-32+dy,-15-sway,-26+dy,-16-sway*1.5,-6,-9,-5],'#7f9096');PL([-8,-32+dy,-12-sway,-27+dy,-11-sway,-8,-9,-6],'#97a8ae');
  // boots + long coat
  cx.fillStyle='#0b0b10';cx.fillRect(-6,-3,5,3);cx.fillRect(1,-3,5,3);
  if(kneel){cx.fillRect(-7,-2,14,2)}
  PL([-9,-21+dy,-11,-5,11,-5,9,-21+dy],'#a8b6bb');PL([-3,-21+dy,-4,-5,4,-5,3,-21+dy],'#14191c');
  cx.fillStyle='#2c383d';cx.fillRect(-9,-21+dy,2,16-dy);cx.fillRect(7,-21+dy,2,16-dy);cx.fillRect(-1,-21+dy,.8,16-dy);
  cx.fillStyle='#5e6d73';cx.fillRect(-10,-9,20,1);
  // torso
  cx.fillStyle='#a8b6bb';cx.fillRect(-8,-31+dy,16,11);PL([-3,-31+dy,3,-31+dy,0,-21+dy],'#101417');cx.fillStyle='#2c383d';cx.fillRect(-8,-22+dy,16,2);
  cx.fillStyle='#d9a441';cx.beginPath();cx.arc(0,-27+dy,2.4,0,7);cx.fill();cx.fillStyle='#0b0b10';cx.beginPath();cx.arc(0,-27+dy,1,0,7);cx.fill();
  // shoulders (wide pads)
  PL([-13,-30+dy,-9,-35+dy,-4,-33+dy,-5,-27+dy,-10,-26+dy],'#b9c6ca');PL([13,-30+dy,9,-35+dy,4,-33+dy,5,-27+dy,10,-26+dy],'#b9c6ca');cx.fillStyle='#2c383d';cx.fillRect(-12,-30+dy,1,3);cx.fillRect(11,-30+dy,1,3);
  // head
  cx.fillStyle='#dfe3e1';cx.fillRect(-2,-35+dy,4,3);cx.fillStyle='#e9ece9';cx.fillRect(-4.5,-43+dy+(kneel?3:0),9,9);
  const hy=-43+dy+(kneel?3:0);
  PL([-5.5,hy+2,-4.5,hy-3,-1,hy-2,2,hy-4,5.5,hy-1,5.5,hy+3,3.5,hy+1,2,hy-1,-3,hy+1],'#0f1114');cx.fillStyle='#0f1114';cx.fillRect(-5.5,hy+1,1.8,6);cx.fillRect(3.7,hy+1,1.8,5);
  cx.fillStyle='#14161a';cx.fillRect(-2.6,hy+4.2,1.8,1.1);cx.fillRect(.9,hy+4.2,1.8,1.1);cx.fillStyle='#3a3f44';cx.fillRect(-2.2,hy+5.4,.7,3.4);cx.fillRect(1.5,hy+5.4,.7,3.4);
  // arm + sword
  const hx=6,hy2=-21+dy;cx.strokeStyle='#a8b6bb';cx.lineWidth=4;cx.lineCap='round';cx.beginPath();cx.moveTo(6,-29+dy);cx.lineTo(hx,hy2);cx.stroke();cx.fillStyle='#14191c';cx.fillRect(hx-2,hy2-2,4,4);
  cx.save();cx.translate(hx,hy2);cx.rotate(kneel?1.55:a);drawBlade(50,B.st==='act'?1:p);cx.restore();
  if(B.flash>0){cx.globalAlpha=.4;cx.fillStyle='#fff';cx.fillRect(-9,-43,18,40)}
  // judgement: ring of floating blades
  if(B.fin&&B.fs==='wind'){AD(()=>{for(let i=0;i<8;i++){const an=t*2.4+i/8*6.283,r=26+p*22;cx.save();cx.translate(Math.cos(an)*r,-20+Math.sin(an)*r*.5);cx.rotate(an+1.57);cx.fillStyle='rgba(120,255,170,'+(.3+.6*p)+')';cx.fillRect(-1,-9,2,18);cx.restore()}})}
  cx.restore();if(!B.gh2)L.push([X+B.w/2,Y+14,B.fin?150:90])}
 {const _de8=drawE;drawE=function(e,ox,oy,L){if(e&&e.boss&&e.id==='maestro'){drawM(e,ox,oy,L);return}return _de8.apply(this,arguments)}}

 // world effects: slash crescents + telegraphs
 const sector=(X,Y,f,r,p)=>{const ca=f>0?0:Math.PI;cx.beginPath();cx.moveTo(X,Y);cx.arc(X,Y,r,ca-1.05,ca+1.05);cx.closePath();cx.fillStyle='rgba(255,60,60,'+(.07+.3*p)+')';cx.fill();cx.strokeStyle='rgba(255,'+(90+160*p|0)+','+(90+160*p|0)+','+(.35+.55*p)+')';cx.lineWidth=1+p*1.5;cx.stroke()};
 function drawTele(B,ox,oy){
  if(!B||B.dead||B.fin||B.id!=='maestro')return;const X=bcx(B)-ox,Y=bcy(B)-oy,f=B.face||1,k=B.atk,d=B.def,rc=d.reach;let p=0,on=0;
  const arrs={mcombo:CT,mgale:GT,mslash:MS};
  if(B.st==='tele'){p=Math.max(0,Math.min(1,1-B.t/B.twu));on=1}
  else if(B.st==='act'&&k==='mastral'&&B.ds<5&&!(B.dg>0)){const AA=AT.mastral,rem=AA.AS+B.ds*AA.AD-(AA.act-B.t);if(rem>=0&&rem<.2){p=1-rem/.2;on=2}}
  else if(B.st==='act'&&arrs[k]){const arr=arrs[k],e=AT[k].act-B.t,i=B.cs||0;if(i<arr.length&&arr[i]-e<.26&&arr[i]-e>=0){p=1-(arr[i]-e)/.26;on=2}}
  if(!on)return;cx.save();
  if(k==='mslash'||k==='mcombo'||k==='mgale'){sector(X,Y,f,rc,p)}
  else if(k==='mwave'){sector(X,Y,f,rc*.8,p);const g=cx.createLinearGradient(X,0,X+f*d.ps*1.3,0);g.addColorStop(0,'rgba(255,60,60,'+(.12+.25*p)+')');g.addColorStop(1,'rgba(255,60,60,0)');cx.fillStyle=g;cx.fillRect(f>0?X:X-d.ps*1.3,Y-6,d.ps*1.3,14);cx.fillRect(f>0?X:X-d.ps*1.3,MAES.fy*T-oy-26,d.ps*1.3,26)}
  else if(k==='mdash'||k==='mastral'){const len=Math.min(260,(f>0?(MAES.cx+MAES.hw)*T-B.x:B.x-(MAES.cx-MAES.hw)*T));const g=cx.createLinearGradient(X,0,X+f*len,0);g.addColorStop(0,'rgba(255,60,60,'+(.15+.4*p)+')');g.addColorStop(1,'rgba(255,60,60,.02)');cx.fillStyle=g;cx.fillRect(f>0?X:X-len,Y-14,len,30);sector(X+f*len*.95,Y,f,rc*1.1,p*.6);
   cx.strokeStyle='rgba(255,140,120,'+(.3+.4*p)+')';cx.lineWidth=1.5;for(let i=0;i<4;i++){const cxx=X+f*(30+((time*160+i*60)%len));cx.beginPath();cx.moveTo(cxx,Y-10);cx.lineTo(cxx+f*10,Y);cx.lineTo(cxx,Y+10);cx.stroke()}}
  else if(k==='mblades'){const base=Math.atan2(P.y+11-bcy(B),P.x+6-bcx(B)),n=B.ph===2?7:5;cx.strokeStyle='rgba(255,90,90,'+(.15+.4*p)+')';cx.lineWidth=1;cx.setLineDash([6,6]);cx.lineDashOffset=-time*60;for(let i=0;i<n;i++){const an=base+(i-(n-1)/2)*.2;cx.beginPath();cx.moveTo(X,Y);cx.lineTo(X+Math.cos(an)*320,Y+Math.sin(an)*320);cx.stroke()}cx.setLineDash([])}
  else if(k==='mcyclone'){cx.strokeStyle='rgba(255,90,90,'+(.3+.5*p)+')';cx.lineWidth=2;cx.setLineDash([8,6]);cx.lineDashOffset=-time*70;for(let i=0;i<3;i++){cx.beginPath();cx.arc(X,Y,30+i*34+p*14,0,7);cx.stroke()}cx.setLineDash([])}
  else if(k==='mrend'){const fy=MAES.fy*T-oy,x0=(MAES.cx-MAES.hw)*T-ox,ww=MAES.hw*2*T;cx.fillStyle='rgba(255,60,60,'+(.08+.28*p)+')';cx.fillRect(x0,fy-20,ww,20);cx.fillStyle='rgba(255,'+(110+120*p|0)+',110,'+(.5+.5*p)+')';cx.fillRect(x0,fy-2,ww,2);
   cx.font='bold 16px Georgia';cx.textAlign='center';for(let i=0;i<9;i++){const xx=x0+ww*(i+.5)/9;cx.fillText('\u25b2',xx,fy-26-(Math.sin(time*8+i)*3))}cx.fillText('JUMP',X,Y-52)}
  else if(k==='mtornado'){if(!B.tw0)B.tw0=tPos(B);const fy=MAES.fy*T-oy;for(const wx of B.tw0){const x=wx-ox;cx.fillStyle='rgba(255,60,60,'+(.05+.12*p)+')';cx.fillRect(x-24,fy-90,48,90);cx.strokeStyle='rgba(255,'+(90+140*p|0)+',90,'+(.4+.5*p)+')';cx.lineWidth=2;
    for(let i=0;i<3;i++){const an=time*(5+i*2)+i*2;cx.beginPath();cx.ellipse(x,fy-3,26-i*5,7-i,0,an,an+3.2);cx.stroke()}
    cx.fillStyle='rgba(255,'+(120+120*p|0)+',90,'+(.7+.3*p)+')';cx.font='bold 13px Georgia';cx.textAlign='center';cx.fillText('!',x,fy-96)}}
  // rotating gale glyph ring
  cx.strokeStyle='rgba(255,'+(110+120*p|0)+',110,'+(.25+.45*p)+')';cx.lineWidth=1.2;cx.setLineDash([5,7]);cx.lineDashOffset=time*40;cx.beginPath();cx.arc(X,Y+10,rc*.55+p*6,0,7);cx.stroke();cx.setLineDash([]);
  cx.fillStyle='rgba(255,'+(120+120*p|0)+',90,'+(.6+.4*p)+')';cx.font='bold 14px Georgia';cx.textAlign='center';cx.fillText('!',X,Y-34);
  cx.restore()}
 function drawWind(ox,oy){
  const fy=MAES.fy*T-oy;
  if(MB&&MB.cn>0){const X=bcx(MB)-ox,Y=bcy(MB)-oy;AD(()=>glow(X,Y,40+(1-MB.cn/.4)*30,'rgba(255,80,80,.45)'));cx.save();cx.fillStyle='#ff6a6a';cx.font='bold 20px Georgia';cx.textAlign='center';cx.fillText('!',X,Y-30);cx.restore()}
  for(const g of PH){const X=g.x-ox,Y=fy,al=g.k?Math.max(0,1-(g.t-g.tw)/.5):Math.min(1,g.t/.25)*(.5+.25*Math.sin(g.t*30));
   AD(()=>{glow(X,Y-18,34,'rgba(60,255,140,'+(.25*al)+')');cx.save();cx.translate(X,Y);cx.scale(g.f,1);cx.globalAlpha=al;cx.fillStyle='rgba(120,255,180,.6)';cx.fillRect(-6,-34,12,34);cx.beginPath();cx.arc(0,-38,5,0,7);cx.fill();cx.strokeStyle='rgba(220,255,235,.95)';cx.lineWidth=2;cx.beginPath();cx.moveTo(4,-22);cx.lineTo(g.k?46:30,g.k?-32:-16);cx.stroke();cx.restore()});
   if(!g.k){cx.save();cx.fillStyle='rgba(255,'+(90+90*Math.sin(g.t*20)|0)+',90,'+Math.min(1,g.t/.2)+')';cx.font='bold 16px Georgia';cx.textAlign='center';cx.fillText('!',X,Y-52);cx.restore()}}
  if(MB&&MB.lv&&MB.st==='act'&&MB.atk==='mleap'&&MB.lx!=null){const t=MB.lt||{x:P.x+6,y:P.y+11},bx=MB.lx+MB.w/2-ox,by=MB.ly+MB.h/2-oy,tx=t.x-ox,ty=t.y-oy,lk=!!MB.lk;
   AD(()=>{cx.strokeStyle=lk?'rgba(255,70,80,.95)':'rgba(255,190,90,.5)';cx.lineWidth=lk?3:1.5;cx.setLineDash(lk?[]:[6,6]);cx.beginPath();cx.moveTo(bx,by);cx.lineTo(tx,ty);cx.stroke();cx.setLineDash([]);const r=14+Math.sin(time*(lk?30:10))*3;cx.beginPath();cx.arc(tx,ty,r,0,7);cx.stroke()})}
  for(const g of GW){const X=g.x-ox;if(X<-80||X>cv.width+80)continue;AD(()=>{cx.lineCap='round';
   for(let j=g.tr.length-1;j>=0;j--){const q=g.tr[j]-ox,al=(1-j/g.tr.length)*.3;cx.fillStyle='rgba(120,255,170,'+al+')';cx.fillRect(q-3,fy-30*(1-j/12),6,30*(1-j/12))}
   glow(X,fy-14,70,'rgba(60,230,120,.35)');cx.save();cx.translate(X,fy-1);cx.scale(g.dir,1);
   for(const[lw,col]of[[12,'rgba(30,210,100,.4)'],[4,'rgba(130,255,175,.95)'],[1.6,'rgba(255,255,255,1)']]){cx.strokeStyle=col;cx.lineWidth=lw;cx.beginPath();cx.arc(-14,-1,34,-1.15,.05);cx.stroke()}cx.restore()})}
  for(const w of TW){const X=w.x-ox,k=Math.min(1,w.t/.5,(w.t0-w.t)/.4),H=w.h*(.6+.4*k);if(X<-90||X>cv.width+90)continue;
   cx.save();const g=cx.createLinearGradient(0,fy-H,0,fy);g.addColorStop(0,'rgba(30,70,50,0)');g.addColorStop(1,'rgba(10,45,28,'+(.4*k)+')');cx.fillStyle=g;cx.beginPath();cx.moveTo(X-30,fy-H);cx.lineTo(X+30,fy-H);cx.lineTo(X+7,fy);cx.lineTo(X-7,fy);cx.closePath();cx.fill();cx.restore();
   AD(()=>{glow(X,fy-H*.5,64,'rgba(60,230,120,'+(.2*k)+')');glow(X,fy-4,34,'rgba(190,255,215,'+(.25*k)+')');
    for(let i=0;i<15;i++){const f=i/14,y=fy-f*H,r=6+f*22,an=w.ph+i*.7;cx.strokeStyle='rgba('+(110+110*f|0)+',255,'+(170+60*f|0)+','+(.55*k*(1-f*.3))+')';cx.lineWidth=2.2-f;cx.beginPath();cx.ellipse(X+Math.cos(an)*3,y,r,r*.28,0,an%6.283,an%6.283+2.7);cx.stroke()}
    for(let i=0;i<12;i++){const an=w.ph*(1+i%3*.3)+i*.9,f=((i*.173+time*.6)%1),y=fy-f*H,r=8+f*24;cx.fillStyle='rgba(205,255,225,'+(.7*k)+')';cx.fillRect(X+Math.cos(an)*r,y+Math.sin(an)*r*.28,2.2,2.2)}
    cx.strokeStyle='rgba(150,255,190,'+(.35*k)+')';cx.lineWidth=1.5;for(let i=0;i<3;i++){const an=time*(7+i*2)+i*2;cx.beginPath();cx.ellipse(X,fy-2,30+i*8,7+i*2,0,an,an+2.4);cx.stroke()}})}
  for(const b of WB){const X=b.x-ox,Y=b.y-oy;if(X<-60||X>cv.width+60||Y<-60||Y>cv.height+60)continue;
   AD(()=>{cx.lineCap='round';
    for(let j=b.tr.length-1;j>=0;j--){const q=b.tr[j],al=(1-j/b.tr.length)*.3;cx.save();cx.translate(q[0]-ox,q[1]-oy);cx.rotate(b.a);cx.strokeStyle='rgba(120,255,170,'+al+')';cx.lineWidth=b.sz*.3*(1-j/10);cx.beginPath();cx.arc(-b.sz*.3,0,b.sz,-1.1,1.1);cx.stroke();cx.restore()}
    cx.strokeStyle='rgba(190,255,220,.35)';cx.lineWidth=1;for(let i=-1;i<=1;i++){cx.beginPath();cx.moveTo(X,Y+i*b.sz*.4);cx.lineTo(X-Math.cos(b.a)*36,Y+i*b.sz*.4-Math.sin(b.a)*36);cx.stroke()}
    glow(X,Y,b.sz*1.8,'rgba(60,230,120,.3)');cx.save();cx.translate(X,Y);cx.rotate(b.a);
    for(const[lw,col]of[[b.sz*.5,'rgba(30,210,100,.4)'],[3.2,'rgba(130,255,175,.95)'],[1.3,'rgba(255,255,255,1)']]){cx.strokeStyle=col;cx.lineWidth=lw;cx.beginPath();cx.arc(-b.sz*.3,0,b.sz,-1.2,1.2);cx.stroke()}cx.restore()})}}
 function drawSlashes(ox,oy){for(let q=MSL.length-1;q>=0;q--){const s=MSL[q],age=time-s.t0,dur=s.big?.3:.2;if(age>dur){MSL.splice(q,1);continue}const k=age/dur;
  AD(()=>{cx.save();cx.translate(s.x-ox,s.y-oy);cx.scale(s.f,1);cx.rotate(s.a);cx.lineCap='round';const r=s.r*(.7+.3*Math.min(1,k*3));
   cx.strokeStyle='rgba(120,255,170,'+(.22*(1-k))+')';cx.lineWidth=16*(1-k)+2;cx.beginPath();cx.arc(-r*.25-10*k,0,r*1.14,-1.28,1.28);cx.stroke();
   for(let i=0;i<6;i++){const yy=(i-2.5)*r*.3,len=r*(.45+.8*Math.min(1,k*2.5)),x0=r*.55-Math.abs(yy)*.5;cx.strokeStyle='rgba(190,255,220,'+(.55*(1-k))+')';cx.lineWidth=1;cx.beginPath();cx.moveTo(x0,yy);cx.lineTo(x0+len,yy*1.2);cx.stroke()}
   for(const[lw,col]of[[(s.big?20:12)*(1-k)+1,'rgba(30,210,100,'+(.4*(1-k))+')'],[5.5*(1-k)+.6,'rgba(130,255,175,'+(.9*(1-k))+')'],[2.2*(1-k)+.4,'rgba(255,255,255,'+(1-k)+')']]){cx.strokeStyle=col;cx.lineWidth=lw;cx.beginPath();cx.arc(-r*.25,0,r,-1.18,1.18);cx.stroke()}
   cx.restore()})}}
 {const _dfx8=drawFx;drawFx=function(ox,oy,L){jcO=[ox,oy];_dfx8.apply(this,arguments);if(inM){try{if(MB)drawTele(MB,ox,oy);drawWind(ox,oy);drawSlashes(ox,oy)}catch(e){}}}}

 // screen overlay: Judgement Cut indicator, strike flash, fades
 function drawMO(){
  const w=cv.width,h=cv.height,B=MB;
  if(inM&&B&&!B.dead&&B.atk==='mseq'&&(B.st==='tele'||B.st==='act')){
   const act=B.st==='act',e=act?AT.mseq.act-B.t:0,i=act?Math.min(B.sq|0,5):0,rs=act?(B.sqr||[]):[],until=i>=5?9:act?SQT[i]-e:B.t+SQT[0],bw=50,gap=8,x0=w/2-(5*bw+4*gap)/2,y0=Math.round(h*.17);
   cx.save();cx.textAlign='center';cx.fillStyle='rgba(0,0,0,.6)';cx.fillRect(x0-10,y0-26,5*bw+4*gap+20,bw+40);cx.font='bold 12px Georgia';cx.fillStyle='#bfffd2';cx.fillText('WHOLE-MAP SEQUENCE \u2014 unblockable \u00b7 i-frames will not save you \u00b7 '+(SQDMG*5)+' damage if you fail',w/2,y0-10);
   for(let q=0;q<5;q++){const bx=x0+q*(bw+gap),dd=SQK[q]==='D',col=dd?'255,110,110':'255,211,107',done=q<i,cur=q===i;
    cx.fillStyle=done?(rs[q]==='ok'?'rgba(70,200,120,.35)':rs[q]==='blk'?'rgba(255,200,100,.3)':'rgba(255,60,60,.4)'):'rgba('+col+','+(cur?.35:.14)+')';cx.fillRect(bx,y0,bw,bw);
    cx.strokeStyle=cur?'rgba(255,255,255,'+(.6+.4*Math.sin(time*14))+')':'rgba('+col+',.7)';cx.lineWidth=cur?3:1.5;cx.strokeRect(bx,y0,bw,bw);
    cx.fillStyle='rgb('+col+')';cx.font='bold 11px Georgia';cx.fillText(dd?'DODGE':'PARRY',bx+bw/2,y0+bw/2-2);cx.font='bold 16px Georgia';cx.fillText(done?(rs[q]==='ok'?'\u2713':rs[q]==='blk'?'~':'\u2717'):(q+1),bx+bw/2,y0+bw/2+16)}
   if(i<5&&until<.35){const a=1-Math.max(0,until)/.35,dd=SQK[i]==='D',py=P.y+11-jcO[1];cx.globalCompositeOperation='lighter';cx.fillStyle='rgba('+(dd?'255,70,70':'255,211,107')+','+(.2+.6*a)+')';cx.fillRect(0,py-1,w,2+10*a);cx.globalCompositeOperation='source-over';
    cx.font='bold '+(26+a*14|0)+'px Georgia';cx.fillStyle=dd?'#ff8a8a':'#ffe08a';cx.fillText(dd?'DODGE!':'PARRY!',w/2,y0+bw+62)}
   cx.restore()}
  if(eyeOn()){const al=Math.min(1,(5-B.eyeT)/.3,B.eyeT/.3)*.5;drawEyes(w,h,Math.max(0,al),time);
   cx.save();cx.textAlign='center';cx.font='bold 15px Georgia';cx.fillStyle='rgba(220,200,255,'+Math.max(0,al/.5)+')';cx.fillText('TEMPEST EYE \u2014 '+B.eyeT.toFixed(1)+'s \u00b7 strike him and he parries and counters',w/2,h*.2+Math.min(w*.17,230)*.42*.5+30);cx.restore()}
  for(let q=SQF.length-1;q>=0;q--){const f=SQF[q],age=time-f.t0;if(age>.6){SQF.splice(q,1);continue}const k=age/.6,sg=f.i%2?-1:1,y1=h*(.25+.1*(f.i%3)),y2=h*(.75-.1*(f.i%3));
   cx.save();cx.globalCompositeOperation='lighter';cx.lineCap='round';cx.strokeStyle='rgba(120,255,170,'+(1-k)+')';cx.lineWidth=26*(1-k)+2;cx.beginPath();cx.moveTo(sg>0?-40:w+40,y1);cx.lineTo(sg>0?w+40:-40,y2);cx.stroke();cx.strokeStyle='rgba(255,255,255,'+(1-k)+')';cx.lineWidth=4*(1-k)+1;cx.stroke();
   if(age>.05&&age<.35){const kk=(age-.05)/.3,c=(f.res==='parry'||f.res==='dodge')?'160,230,255':f.res==='hit'?'255,50,60':'255,200,120';cx.fillStyle='rgba('+c+','+(.4*(1-kk))+')';cx.fillRect(0,0,w,h)}cx.restore()}
  if(inM&&B&&B.fin&&!B.dead){const bx=bcx(B)-jcO[0],by=bcy(B)-jcO[1];cx.save();
   if(B.fs==='enter'||B.fs==='wind'||B.fs==='rec'){const k=B.fs==='wind'?1-B.ft/B.ftot:.25,gr=cx.createRadialGradient(bx,by,70,bx,by,Math.max(w,h)*.75);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,14,6,'+(.35+.35*k)+')');cx.fillStyle=gr;cx.fillRect(0,0,w,h)}
   if(B.fs==='wind'){const k=1-B.ft/B.ftot,bw=Math.min(380,w*.55),x0=(w-bw)/2,y0=Math.round(h*.2),z0=x0+bw*(1-JPW/JW),cue=B.ft<=JPW+.08;
    cx.fillStyle='rgba(0,0,0,.65)';cx.fillRect(x0-6,y0-30,bw+12,58);cx.strokeStyle='#2fe07a';cx.lineWidth=1;cx.strokeRect(x0-6,y0-30,bw+12,58);
    cx.textAlign='center';cx.font='bold 14px Georgia';cx.fillStyle='#bfffd2';cx.fillText('JUDGEMENT CUT',w/2,y0-12);cx.font='11px Georgia';cx.fillStyle=cue?'#fff':'#9fe';cx.fillText(cue?'\u25b6  PARRY NOW (RMB)  \u25c0':'Parry (tight window!) or DODGE to survive \u00b7 only a parry ends it',w/2,y0+2);
    cx.fillStyle='#0b1a12';cx.fillRect(x0,y0+9,bw,10);cx.fillStyle='rgba(60,220,120,.55)';cx.fillRect(x0,y0+9,bw*k,10);
    cx.fillStyle='rgba(90,140,255,.55)';cx.fillRect(x0+bw*(1-.26/JW),y0+8,z0-(x0+bw*(1-.26/JW)),12);
    cx.fillStyle=cue?'rgba(255,255,255,'+(.7+.3*Math.sin(time*40))+')':'rgba(120,240,255,.9)';cx.fillRect(z0,y0+6,x0+bw-z0,16);
    cx.fillStyle='#fff';cx.fillRect(x0+bw*k-1,y0+4,2,20);
    if(cue){cx.globalCompositeOperation='lighter';const r=40+(1-B.ft/(JPW+.08))*60;cx.strokeStyle='rgba(180,255,220,.8)';cx.lineWidth=3;cx.beginPath();cx.arc(bx,by,r,0,7);cx.stroke();cx.globalCompositeOperation='source-over'}}
   cx.restore()}
  for(let q=MJ.length-1;q>=0;q--){const j=MJ[q],age=time-j.t0;if(age>.9){MJ.splice(q,1);continue}const X=j.x-jcO[0],Y=j.y-jcO[1];cx.save();cx.globalCompositeOperation='lighter';cx.lineCap='round';
   for(let i=0;i<8;i++){const ta=age-i*.03;if(ta<0||ta>.4)continue;const k=ta/.4,an=-1.2+i*.34+(i%2?.5:0),L2=420;cx.strokeStyle='rgba(120,255,170,'+(1-k)+')';cx.lineWidth=8*(1-k)+1;cx.beginPath();cx.moveTo(X-Math.cos(an)*L2/2,Y-Math.sin(an)*L2/2);cx.lineTo(X+Math.cos(an)*L2/2,Y+Math.sin(an)*L2/2);cx.stroke();cx.strokeStyle='rgba(255,255,255,'+(1-k)+')';cx.lineWidth=1.5;cx.stroke()}
   cx.globalCompositeOperation='source-over';if(age>.26&&age<.6){const k=(age-.26)/.34,c=j.res==='parry'?'200,255,255':j.res==='hit'?'255,50,60':j.res==='dodge'?'140,200,255':'255,200,120';cx.fillStyle='rgba('+c+','+(.55*(1-k))+')';cx.fillRect(0,0,w,h)}
   cx.restore()}
  if(inM&&MB&&!MB.dead&&(TW.length||(MB.st==='act'&&(MB.atk==='mgale'||MB.atk==='mcyclone'||MB.atk==='mtornado'||MB.atk==='mdash'||MB.atk==='mastral'||MB.atk==='mrend'||MB.atk==='mleap'||MB.atk==='mseq'||MB.atk==='meye')))){cx.save();cx.globalCompositeOperation='lighter';cx.lineCap='round';
   for(let i=0;i<34;i++){const y=(i*53.7+Math.sin(i*3.1)*40)%h,sp=520+(i%7)*70,L2=70+(i%5)*40,x=((time*sp+i*131)%(w+260))-130;cx.strokeStyle='rgba(150,255,190,'+(.06+.05*(i%4))+')';cx.lineWidth=1+(i%3)*.5;cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+L2,y+Math.sin(i)*6);cx.stroke()}cx.restore()}
  const fa=fdA();if(fa>.003){cx.save();cx.fillStyle='rgba(0,0,0,'+Math.min(1,fa)+')';cx.fillRect(0,0,w,h);cx.restore()}}
 {const _bh8=bossHud;bossHud=function(){_bh8.apply(this,arguments);try{drawMO()}catch(e){}}}

 // ---------- music: bossthemes/maestrotheme.* ----------
 let MMU=null,mmOn=false;const MEXT=['mp3','ogg','wav','m4a','opus','flac','aac'];
 function mmProbe(i){if(i>=MEXT.length)return;try{const a=new Audio();a.preload='auto';a.loop=true;a.addEventListener('canplay',()=>{MMU=a},{once:true});a.addEventListener('error',()=>mmProbe(i+1),{once:true});a.src='bossthemes/maestrotheme.'+MEXT[i]}catch(e){}}
 try{if(typeof Audio==='function')mmProbe(0)}catch(e){}
 const mmVol=()=>{let v=1;try{const x=parseFloat(localStorage.getItem('ashfall_bvol'));if(x>=0&&x<=1)v=x}catch(e){}return Math.min(1,.7*v)};
 setInterval(()=>{try{const a=MMU;if(!a)return;const live=!!(inM&&MB&&P&&!P.dead&&!mDone&&MB.st!=='dormant'&&!(MB.fs==='vic')),tv=mmVol();
  if(live&&!paused&&!Audio_.mute){if(!mmOn){mmOn=true;a.currentTime=0;a.volume=0}if(a.paused)a.play().catch(()=>{});a.volume=Math.max(0,Math.min(tv,a.volume+(a.volume<tv?.05:-.05)))}
  else if(live){if(!a.paused)a.pause()}
  else if(mmOn){a.volume=Math.max(0,a.volume-.08);if(a.volume<=0){a.pause();a.currentTime=0;mmOn=false}}}catch(e){}},50);
})();