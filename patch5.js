'use strict';
// ===== Ashfall Depths: Patch 5 (load AFTER patch4.js) =====
// The Nameless Deity has a 45% chance to be CORRUPTED when it dies -> the AVATAR OF EMPTINESS tears itself out of it.
// 200,000 HP · same damage/stats · 4 phases (stagger at phase IV) · dimensional-slash attacks · crimson/black/bone/cyan palette
// own boss theme  bossthemes/emptytheme.(mp3|ogg|wav|m4a|opus|flac|aac) · own victory cutscene · secret badge · "Emptiness Filled" blessing (+20%)
// Test it quickly: open the browser console and type   AVATAR_CHANCE=1   (then beat the Deity)   ·   AVATAR_CHANCE=0 disables it
(()=>{
const TAU=Math.PI*2,c01=v=>Math.max(0,Math.min(1,v)),ease=k=>k*k*(3-2*k);
window.AVATAR_CHANCE=.45;window.AV_WIN=0;
const RD='rgb(255,40,70)',CY='rgb(80,230,255)',INKP='rgb(25,5,15)';
const dmA=B=>B.def.dmg*(B.er||1);
const v8=f=>(B,v)=>f(v==null?1:v);

// ---------- Avatar definition (clone of the Deity: same dmg / pd / reach / speed / posture, 200k HP, red palette) ----------
const AVP={1:['#1a0508','#14040a','#240a10'],2:['#050205','#030103','#0a0408'],3:['#3a0c18','#2e0a14','#48121f'],7:['#0a2a34','#08222c','#0e3744']};
function avDef(){return Object.assign({},BD.deity,{n:'Avatar of Emptiness',sub:'The Void That Wears a God',hp:200000,zc:'255,40,70',col:['#f4f2f6','#050205'],
 a1:['avRift','avCross','avClaw','avEmpty','avRend'],a2:[]})}

// ---------- helpers ----------
function limb(p,w,col,edge){cx.lineCap='round';cx.lineJoin='round';if(edge){cx.strokeStyle=edge;cx.lineWidth=w+2.2;spath(p)}cx.strokeStyle=col;cx.lineWidth=w;spath(p);cx.lineCap='butt';cx.lineJoin='miter'}
function spath(p){cx.beginPath();cx.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)cx.lineTo(p[i],p[i+1]);cx.stroke()}
function pAt(p,u){const n=p.length/2-1,f=u*n,i=Math.min(n-1,Math.max(0,f|0)),r=f-i,x0=p[i*2],y0=p[i*2+1],x1=p[i*2+2],y1=p[i*2+3];return[x0+(x1-x0)*r,y0+(y1-y0)*r,Math.atan2(y1-y0,x1-x0)]}
function blade(x,y,an,len,wid,fill,edge){const c=Math.cos(an),s=Math.sin(an),px=-s*wid,py=c*wid;
 const q=[x+px,y+py,x+c*len*.55+px*1.3,y+s*len*.55+py*1.3,x+c*len,y+s*len,x+c*len*.55-px*1.3,y+s*len*.55-py*1.3,x-px,y-py];PL(q,fill);
 if(edge){cx.strokeStyle=edge;cx.lineWidth=.6;cx.beginPath();cx.moveTo(q[0],q[1]);for(let i=2;i<q.length;i+=2)cx.lineTo(q[i],q[i+1]);cx.stroke()}}
function shard(x,y,r,rot,fill){PL([x+Math.cos(rot)*r*1.6,y+Math.sin(rot)*r*1.6,x+Math.cos(rot+2.2)*r,y+Math.sin(rot+2.2)*r,x+Math.cos(rot+4.1)*r,y+Math.sin(rot+4.1)*r],fill)}
function announce(t1,t2,t3){bossBanner('','');const b=$('bossBanner');b.innerHTML='<div class="bb-t" style="font-size:40px;color:#ff6a7a;text-shadow:0 0 30px #f01a3a,0 0 60px #a00000,0 4px 0 #000">'+t1+'</div><div class="bb-n">'+t2+'</div><div class="bb-s" style="color:#7ff">'+t3+'</div>'}
function avRoar(){tone(55,26,3.2,'sawtooth',.34);tone(110,41,2.6,'square',.16);tone(30,20,3.4,'sine',.4);noise(2.6,.4,3200,70,'lowpass');[185,262,370].forEach((f,i)=>tone(f,f*.6,2.4,'sawtooth',.05,i*.2));tone(2400,260,1.3,'sawtooth',.07,.3);noise(.7,.3,9000,1200,'highpass',1,.05)}

// ======================================================================
// THE AVATAR'S BODY  (inspired by the reference: spiked crimson head under a black spire, bone-white arms, cyan-lit wing, skull mask, ribs & spider legs)
// origin = top-centre of the boss hitbox (same as the Deity)
// ======================================================================
function drawAvatar(B,p,ac,st,S){
 const t=time,hot=st==='tele'||st==='act',ph=B.fury?3:B.ph===2?2:B.p2?1:0,fl=Math.sin(t*1.7)*(2+ph*.8),BK='#050205',WH='#f2f0f4';
 cx.save();cx.scale(S,S);
 AD(()=>{glow(0,16,120+(hot?22:0)+ph*8,'rgba(210,18,44,'+(.2+(hot?.12:0)+ph*.03)+')');glow(0,86,70,'rgba(60,225,255,.14)')});
 // dimensional rings
 cx.save();cx.translate(0,14);cx.lineWidth=1.3;for(let i=0;i<3;i++){cx.strokeStyle='rgba(255,50,80,'+(.34-i*.08)+')';cx.beginPath();cx.arc(0,0,80+i*24+Math.sin(t*1.3+i)*3,0,TAU);cx.stroke()}
 cx.setLineDash([5,8]);cx.lineDashOffset=-t*26;cx.strokeStyle='rgba(90,235,255,.55)';cx.beginPath();cx.arc(0,0,68,0,TAU);cx.stroke();cx.setLineDash([]);cx.restore();
 // black spire behind the head
 PL([-9,-4,-7,-40,-3,-44,-2,-82,0,-98,2,-82,3,-44,7,-40,9,-4],'#06010a');PL([-15,-4,-13,-30,-9,-35,-9,-4],'#06010a');PL([15,-4,13,-30,9,-35,9,-4],'#06010a');
 cx.strokeStyle='rgba(255,40,70,.7)';cx.lineWidth=.8;cx.beginPath();cx.moveTo(-3,-44);cx.lineTo(-2,-82);cx.lineTo(0,-98);cx.lineTo(2,-82);cx.lineTo(3,-44);cx.stroke();
 for(let i=0;i<5;i++){const y=-30-i*13+Math.sin(t*2+i)*1.2;FR(-18+(i%2)*36-.8,y,1.6,1.6,'#fff2f2');FR(-18+(i%2)*36-.8,y+3,1.6,1.6,'#e0203a')}
 // wings: left bone-white, right cyan-lit
 for(const s of[-1,1]){cx.save();cx.scale(s,1);const cyan=s>0;
  for(let i=0;i<8;i++){const an=-1.25+i*.205+Math.sin(t*1.2+i)*.03-(hot?.08:0),len=74+(i%3)*13+fl*(i/8)+(ph>1?8:0),dark=!cyan&&i%3===2;
   blade(12,8+i*1.4,an,len,3.6-i*.1,dark?'#1a0610':cyan?'#d6fbff':WH,dark?'#ff2a46':cyan?'#27d3f0':'#8a8a96')}
  if(cyan)AD(()=>{for(let i=0;i<8;i++){const an=-1.25+i*.205;glow(12+Math.cos(an)*60,8+Math.sin(an)*60,16,'rgba(60,225,255,.18)')}});
  cx.restore()}
 // reaching black arms with claws
 for(const s of[-1,1]){const sw=Math.sin(t*1.4+s)*4,h2=hot?1:0,hx=s*108+sw,hy=-82+sw-h2*14;
  limb([s*14,0,s*38,-18,s*62,-26+sw*.5-h2*8,s*88,-58+sw*.6,hx,hy],6,BK,'#7a0a1c');AD(()=>glow(hx,hy,16+h2*10,'rgba(255,30,60,'+(.25+h2*.2)+')'));
  for(let k=0;k<5;k++){const an=s>0?-.9+(k-2)*.36:-Math.PI+.9-(k-2)*.36;blade(hx,hy,an,24+(k%2)*8,1.7,BK,'#ff2a46')}}
 // spider legs
 for(const s of[-1,1])for(let i=0;i<4;i++){const sw=Math.sin(t*2+i*1.3+s)*3,fx=s*(58+i*13)+sw,fy=88+i*8+Math.abs(sw);
  limb([s*6,62+i*1.5,s*(26+i*9),48+i*2,s*(40+i*11),66+i*5,fx,fy],2.8,BK,'#c0102a');AD(()=>glow(fx,fy,5,'rgba(255,40,70,.6)'))}
 // torso, spine and ribs
 cx.beginPath();cx.ellipse(0,36,19,36,0,0,TAU);cx.fillStyle='#07020b';cx.fill();cx.strokeStyle='#7a0a1c';cx.lineWidth=1;cx.stroke();
 for(let i=0;i<9;i++){const y=14+i*7.2,sz=3.4-(i>5?(i-5)*.4:0);PL([-sz,y,0,y-3.2,sz,y,0,y+3.2],'#efeef2');FR(-.6,y-.6,1.2,1.2,'#d01830')}
 for(let i=0;i<6;i++)for(const s of[-1,1]){const an=s>0?.15+i*.12:Math.PI-(.15+i*.12),len=i<4?30+i*3:30-(i-3)*5;blade(s*2,17+i*7.5,an,len,2.3,'#f1eff4','#14040a')}
 // bone-white lower arms: bandaged + red band (left), black band lit cyan (right)
 for(const s of[-1,1]){const sw=Math.sin(t*1.5+s*2)*3,wx=s*60+sw,wy=94+fl,arm=[s*12,22,s*34,30,s*54,52,wx,wy-8];
  limb(arm,11,WH,'#1a1a22');
  cx.strokeStyle='rgba(20,20,30,.75)';cx.lineWidth=.7;for(let k=0;k<9;k++){const q=pAt(arm,.12+k*.09);cx.beginPath();cx.arc(q[0],q[1],1.2+(k%3),k,k+3.6);cx.stroke()}
  if(s<0){cx.strokeStyle='rgba(185,185,200,.95)';cx.lineWidth=1.1;for(let k=0;k<7;k++){const q=pAt(arm,.3+k*.06);cx.beginPath();cx.moveTo(q[0]-Math.sin(q[2])*6,q[1]+Math.cos(q[2])*6);cx.lineTo(q[0]+Math.sin(q[2])*6,q[1]-Math.cos(q[2])*6);cx.stroke()}
   const a0=pAt(arm,.8),a1=pAt(arm,.93);limb([a0[0],a0[1],a1[0],a1[1]],13,'#c4122c','#050205')}
  else{const a0=pAt(arm,.78),a1=pAt(arm,.9);limb([a0[0],a0[1],a1[0],a1[1]],13,'#08040c','#050205');cx.strokeStyle='rgba(110,240,255,.9)';cx.lineWidth=.8;spath([a0[0],a0[1]-5,a1[0],a1[1]-5]);AD(()=>glow(s*50,60,28,'rgba(60,225,255,.24)'))}
  PL([wx-6,wy-8,wx+6,wy-8,wx+5,wy+3,wx-5,wy+3],WH);for(let k=0;k<4;k++)blade(wx+(k-1.5)*3.2,wy+2,1.5708+(k-1.5)*.13+Math.sin(t*2+k)*.05,15+(k%2)*4,1.5,WH,'#1a1a22')}
 // head: spiked crimson mane over a black face
 for(let i=0;i<19;i++){const an=-Math.PI*1.12+i/18*Math.PI*1.24+Math.sin(t*2+i)*.03;blade(Math.cos(an)*6,-4+Math.sin(an)*6,an,20+((i*7)%5)*4+(hot?5:0)+ph*2,2.2,i%2?'#e0203a':'#7a0a1c','#14020a')}
 cx.fillStyle=BK;cx.beginPath();cx.arc(0,-4,9.5,0,TAU);cx.fill();cx.strokeStyle='#c0102a';cx.lineWidth=.8;cx.stroke();
 AD(()=>{for(const s of[-1,1])glow(s*4,-5,6,'rgba(255,60,80,.85)')});for(const s of[-1,1])PL([s*2,-6.5,s*7,-8,s*6,-4.8,s*2,-5],'#ff6a7a');
 cx.strokeStyle='#d01830';cx.lineWidth=.7;cx.beginPath();cx.moveTo(-5,1);for(let k=0;k<6;k++)cx.lineTo(-5+k*2+1,1+(k%2?2.4:0));cx.stroke();
 // skull mask ringed by cyan
 const sy=84+fl*.5;AD(()=>glow(0,sy,28,'rgba(70,230,255,.3)'));
 cx.strokeStyle=BK;cx.lineWidth=2.2;cx.beginPath();cx.arc(0,sy,17,0,TAU);cx.stroke();cx.strokeStyle='rgba(120,240,255,.9)';cx.lineWidth=.8;cx.beginPath();cx.arc(0,sy,19.5,0,TAU);cx.stroke();
 cx.setLineDash([3,5]);cx.lineDashOffset=t*14;cx.beginPath();cx.arc(0,sy,23,0,TAU);cx.stroke();cx.setLineDash([]);
 cx.fillStyle=WH;cx.beginPath();cx.arc(0,sy,11,0,TAU);cx.fill();cx.strokeStyle=BK;cx.lineWidth=1;cx.stroke();
 for(const s of[-1,1]){cx.fillStyle=BK;cx.beginPath();cx.arc(s*4.4,sy-1.5,3.4,0,TAU);cx.fill();cx.strokeStyle='#d01830';cx.lineWidth=.7;cx.stroke();FR(s*4.4-.7,sy-2.2,1.4,1.4,'#ff4a5a')}
 PL([0,sy+1.5,-1.4,sy+4.4,1.4,sy+4.4],BK);for(let k=-2;k<=2;k++)FR(k*2-.4,sy+6.2,.8,3.2,BK);
 // orbiting shards (more in later phases) + phase IV bleeding
 const n=ph>=2?9:5;for(let k=0;k<n;k++){const an=t*(ph>=2?1.4:.8)+k*TAU/n;shard(Math.cos(an)*(76+k%3*8),22+Math.sin(an)*34,2.6+k%3,t*2+k,k%2?BK:'#c0102a')}
 if(B.fury)AD(()=>{glow(0,30,90,'rgba(255,20,40,.18)');for(let i=0;i<5;i++){const lf=(t*.6+i*.2)%1;glow(Math.sin(i*5)*30,-20+lf*130,5,'rgba(255,30,50,'+(1-lf)*.7+')')}});
 if(hot){const r=st==='tele'?3+p*12:14*(1-ac*.5);AD(()=>glow(0,84,r*2.6,'rgba(255,70,90,.7)'))}
 if(B.roar>0){const k=1-B.roar/(B.rmax||1.4);cx.save();cx.translate(0,24);for(let q=0;q<3;q++){const r=(k*1.4-q*.16)*220;if(r<=0)continue;cx.strokeStyle='rgba('+(q?'20,0,10':'255,60,80')+','+(1-k)*.9+')';cx.lineWidth=5-q*1.4;cx.beginPath();cx.arc(0,0,r,0,7);cx.stroke()}cx.restore()}
 cx.restore()}

// ---------- the corruption: the Deity cracks, tears down the middle and the Avatar climbs out ----------
const jg=y=>Math.sin(y*.37)*3+Math.sin(y*.9+1)*2;
function drawCorrupt(B){
 const cs=B.cz,t=time,rip=c01((cs-4.2)/1.6),em=ease(c01((cs-4.5)/3.6)),sepK=ease(c01((cs-4.9)/2.2)),fade=c01((cs-6.3)/2),jt=cs<4.2?c01((cs-.6)/3.6):0,
  sepPx=rip*10+sepK*74,rot=sepK*.24,fall=cs>6.3?Math.pow(cs-6.3,2)*38:0;
 cx.save();
 if(jt>0)cx.translate(Math.sin(t*83)*jt*2.2,Math.cos(t*71)*jt*1.5);
 if(cs>=4.2){ // dark tear behind everything
  const hw=sepPx+4;cx.beginPath();for(let y=-110;y<=140;y+=10)cx.lineTo(-hw+jg(y),y);for(let y=140;y>=-110;y-=10)cx.lineTo(hw+jg(y),y);cx.closePath();cx.fillStyle='#020003';cx.fill();
  cx.strokeStyle='rgba(255,40,70,'+(.9-.5*sepK)+')';cx.lineWidth=1.6;cx.stroke();
  cx.save();cx.globalAlpha*=Math.min(1,em*1.6);drawAvatar(B,0,0,'idle',.45+.55*em);cx.restore();
  AD(()=>glow(0,24,70+rip*40,'rgba(255,30,60,'+(.45*(1-sepK*.6))+')'))}
 // the deity's two halves
 for(const s of[-1,1]){cx.save();cx.translate(s*sepPx,fall+(s>0?fall*.15:0));cx.translate(0,24);cx.rotate(s*rot);cx.translate(0,-24);
  cx.beginPath();for(let y=-130;y<=150;y+=10)cx.lineTo(jg(y),y);cx.lineTo(s*420,150);cx.lineTo(s*420,-130);cx.closePath();cx.clip();
  cx.globalAlpha*=1-fade;_BSd(B,0,0,'idle');
  if(cs<4.2&&jt>0){cx.globalAlpha=1;cx.globalCompositeOperation='source-atop';cx.fillStyle='rgba(120,0,20,'+(.45*jt)+')';cx.fillRect(-120,-110,240,260)}
  cx.restore()}
 // spreading cracks (before the tear)
 if(cs<5&&jt>0){const k=jt;cx.save();cx.globalCompositeOperation='lighter';cx.lineWidth=1.4;
  for(let i=0;i<10;i++){let an=i*TAU/10+.4,x=0,y=18;cx.strokeStyle='rgba(255,40,70,'+(.9-.3*(i%3))+')';cx.beginPath();cx.moveTo(x,y);for(let j=0;j<9&&j<2+k*8;j++){an+=Math.sin(i*5+j*2.3)*.5;x+=Math.cos(an)*(7+j);y+=Math.sin(an)*(7+j);cx.lineTo(x,y)}cx.stroke()}
  glow(0,18,14+k*46,'rgba(255,30,60,'+(.3+.4*k)+')');cx.restore()}
 cx.restore()}

let _BSd=BS.deity;
BS.deity=function(B,p,ac,st){if(B.st==='corrupt')return drawCorrupt(B);if(B.av)return drawAvatar(B,p,ac,st,1);_BSd(B,p,ac,st)};

// ======================================================================
// Arena: same cathedral, recoloured to crimson/black with a spire, dark rings, cyan floor mist
// ======================================================================
function avArena(a,X0,Y0,W2,H2,FY,L,B,k){
 const t=time,mx=X0+W2/2,cy=Y0+H2*.42,R=H2*.36,vx0=Math.max(X0,-60),vx1=Math.min(X0+W2,cv.width+60),ph=B?(B.fury?3:B.ph===2?2:B.p2?1:0):0;let g;
 cx.save();cx.globalCompositeOperation='multiply';cx.globalAlpha=Math.min(1,k*1.15);g=cx.createLinearGradient(0,Y0,0,FY);g.addColorStop(0,'#4a0818');g.addColorStop(.65,'#32060f');g.addColorStop(1,'#1f1220');cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);cx.restore();
 cx.save();cx.globalAlpha=.5*k;g=cx.createRadialGradient(mx,cy,R*.3,mx,cy,W2*.6);g.addColorStop(0,'#2a0410');g.addColorStop(1,'#050105');cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);cx.restore();
 cx.save();cx.globalAlpha=k;
 g=cx.createRadialGradient(mx,cy,0,mx,cy,R*1.12);g.addColorStop(0,'rgba(5,0,6,.95)');g.addColorStop(.7,'rgba(40,2,12,.9)');g.addColorStop(1,'rgba(70,4,20,0)');cx.fillStyle=g;cx.beginPath();cx.arc(mx,cy,R*1.12,0,TAU);cx.fill();
 for(let i=0;i<9;i++){const r=R*(.5+i*.36),dir=i%2?1:-1;cx.save();cx.translate(mx,cy);cx.rotate(t*.05*dir*(1+ph*.3)+i);cx.strokeStyle='rgba('+(i%3===0?'210,20,50':'120,10,30')+','+(.5-i*.04)+')';cx.lineWidth=2.6-i*.18;cx.setLineDash([r*.9,r*.28]);cx.beginPath();cx.arc(0,0,r,0,TAU);cx.stroke();cx.restore()}
 const sp=(x,hh,ww,al)=>{PL([x-ww,FY,x-ww,FY-hh*.55,x-ww*.55,FY-hh*.62,x-ww*.35,FY-hh*.86,x-ww*.12,FY-hh*.9,x,FY-hh,x+ww*.12,FY-hh*.9,x+ww*.35,FY-hh*.86,x+ww*.55,FY-hh*.62,x+ww,FY-hh*.55,x+ww,FY],'rgba(4,0,6,'+al+')');
  cx.strokeStyle='rgba(255,40,70,'+al*.35+')';cx.lineWidth=.8;cx.beginPath();cx.moveTo(x-ww*.35,FY-hh*.86);cx.lineTo(x,FY-hh);cx.lineTo(x+ww*.35,FY-hh*.86);cx.stroke()};
 sp(mx,H2*1.0,R*.5,.96);for(const s of[-1,1]){sp(mx+s*R*1.35,H2*.62,R*.3,.9);sp(mx+s*R*2.3,H2*.45,R*.24,.85)}
 cx.save();cx.globalCompositeOperation='lighter';for(let i=0;i<22;i++){const an=i/22*TAU+t*.03,w=.03;cx.fillStyle=i%2?'rgba(190,20,45,'+(.05+.02*ph)+')':'rgba(60,200,255,.02)';cx.beginPath();cx.moveTo(mx,cy);cx.lineTo(mx+Math.cos(an-w)*W2,cy+Math.sin(an-w)*W2);cx.lineTo(mx+Math.cos(an+w)*W2,cy+Math.sin(an+w)*W2);cx.fill()}cx.restore();
 for(let i=0;i<16;i++){const lf=(t*.04*(1+i%3*.3)+i*.0625)%1,x=X0+(((i*151+Math.sin(t*.4+i)*50)%W2)+W2)%W2,y=Y0+H2-lf*H2;if(x<vx0-10||x>vx1+10)continue;cx.globalAlpha=k*Math.sin(lf*Math.PI);shard(x,y,3+i%4,t*.7+i,i%3?'#050105':'#a01028')}cx.globalAlpha=k;
 g=cx.createLinearGradient(0,FY-H2*.3,0,FY);g.addColorStop(0,'rgba(60,225,255,0)');g.addColorStop(1,'rgba(70,230,255,.34)');cx.fillStyle=g;cx.fillRect(X0,FY-H2*.3,W2,H2*.3);
 cx.save();cx.globalCompositeOperation='lighter';for(let i=0;i<30;i++){const x=X0+((i*131)%1000)/1000*W2+Math.sin(t*.5+i)*12,y=FY-((t*(10+i%5*5)+i*53)%(H2*.7));if(x<vx0||x>vx1)continue;cx.fillStyle='rgba(120,240,255,'+(.25+.35*Math.sin(t*3+i*2))+')';cx.fillRect(x,y,1.6,1.6)}cx.restore();
 if(ph>=2){const c=ph>=3?1:.6;cx.strokeStyle='rgba(255,35,65,'+.5*c+')';cx.lineWidth=2;for(let i=0;i<12;i++){let an=i*TAU/12+.3,x=mx,y=cy;cx.beginPath();cx.moveTo(x,y);for(let j=0;j<8;j++){an+=Math.sin(i*5+j*2.3)*.4;x+=Math.cos(an)*(28+j*5);y+=Math.sin(an)*(28+j*5);cx.lineTo(x,y)}cx.stroke()}}
 g=cx.createRadialGradient(mx,cy,H2*.35,mx,cy,W2*.56);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(8,0,6,.6)');cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);
 cx.restore()}
const _arbD=ARB.deity;
ARB.deity=function(a,X0,Y0,W2,H2,FY,L){_arbD(a,X0,Y0,W2,H2,FY,L);const B=enemies.find(q=>q.boss&&q.id==='deity'),k=B?(B.ak||0):0;if(k>.01)avArena(a,X0,Y0,W2,H2,FY,L,B,k)};

// ======================================================================
// Dimensional slashes: a thin warning line -> the world is cut open along it (damages whoever stands on the line)
// ======================================================================
const SL=[];let slId=0;
function slash(B,x1,y1,x2,y2,warn,w,dm){SL.push({B,x1,y1,x2,y2,t:warn,t0:warn,w:w||12,dm:dm||1,st:0,l:0,id:slId++,hit:0})}
function slashThru(B,x,y,an,len,warn,w,dm){const c=Math.cos(an)*len,s=Math.sin(an)*len;slash(B,x-c,y-s,x+c,y+s,warn,w,dm)}
function segDist(px,py,x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy||1,u=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/l2));return Math.hypot(px-(x1+dx*u),py-(y1+dy*u))}
const lead=()=>({x:P.x+6+P.vx*.4,y:P.y+11});
const aB=B=>{const a=B.ar;return{x0:(a.cx-a.hw+2)*T,x1:(a.cx+a.hw-2)*T,y0:(a.fy-a.ht+2)*T,y1:a.fy*T}};
function slHit(s){if(s.hit||!P||P.dead)return;if(segDist(P.x+6,P.y+11,s.x1,s.y1,s.x2,s.y2)<=s.w*.5+8){s.hit=1;hurtPlayer(bdm(s.B)*s.dm,s.B.def.pd*.5,s.B)}}
function slStrike(s){s.st=1;s.l=.4;const mx=(s.x1+s.x2)/2,v=near(mx);shake=Math.max(shake,3);
 tone(2600,180,.28,'sawtooth',.09*v);tone(90,40,.3,'sine',.14*v);noise(.3,.2*v,7000,500,'highpass');
 const n=Math.max(3,Math.hypot(s.x2-s.x1,s.y2-s.y1)/60|0);for(let i=0;i<n;i++){const u=Math.random();parts.push({x:s.x1+(s.x2-s.x1)*u,y:s.y1+(s.y2-s.y1)*u,vx:(Math.random()-.5)*90,vy:(Math.random()-.5)*90-20,l:.5,c:Math.random()<.5?'#ff3a5a':'#7ff'})}
 slHit(s)}
function drawSlash(s,ox,oy,L){const x1=s.x1-ox,y1=s.y1-oy,x2=s.x2-ox,y2=s.y2-oy;
 if(Math.max(x1,x2)<-40||Math.min(x1,x2)>cv.width+40||Math.max(y1,y2)<-40||Math.min(y1,y2)>cv.height+40)return;
 const len=Math.hypot(x2-x1,y2-y1)||1,nx=-(y2-y1)/len,ny=(x2-x1)/len;cx.save();
 if(s.st===0){const k=1-s.t/s.t0,fl=(time*(6+16*k)|0)%2;
  cx.strokeStyle='rgba(255,40,70,'+(.05+.14*k)+')';cx.lineWidth=s.w;cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();
  cx.strokeStyle='rgba(255,80,100,'+(.35+.5*k)+')';cx.lineWidth=1+k*1.6;cx.setLineDash(fl?[10,6]:[4,8]);cx.beginPath();cx.moveTo(x1,y1);cx.lineTo(x2,y2);cx.stroke();cx.setLineDash([]);
  L.push([(x1+x2)/2,(y1+y2)/2,50+k*40])}
 else{const a=c01(s.l/.4),n=Math.max(4,len/22|0),pts=[];for(let i=0;i<=n;i++){const u=i/n,j=(i&&i<n)?Math.sin(s.id*7.3+i*2.1)*s.w*.3:0;pts.push(x1+(x2-x1)*u+nx*j,y1+(y2-y1)*u+ny*j)}
  const path=()=>{cx.beginPath();cx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)cx.lineTo(pts[i],pts[i+1])};
  cx.save();cx.globalCompositeOperation='lighter';cx.strokeStyle='rgba(255,30,60,'+.55*a+')';cx.lineWidth=s.w*1.9*a+2;path();cx.stroke();cx.restore();
  cx.strokeStyle='rgba(2,0,3,'+(.4+.6*a)+')';cx.lineWidth=s.w*(.4+.6*a);path();cx.stroke();
  cx.strokeStyle='rgba(210,250,255,'+a+')';cx.lineWidth=2.2;path();cx.stroke();
  L.push([(x1+x2)/2,(y1+y2)/2,120*a])}
 cx.restore()}
function avTele(B,ox,oy,L){if(B.st!=='tele')return;const bx=B.x+B.w/2-ox,by=B.y+B.h/2-oy;if(bx<-200||bx>cv.width+200)return;
 const p=c01(1-B.t/(B.twu||1)),t=time;cx.save();cx.translate(bx,by+10);
 cx.strokeStyle='rgba(255,40,70,'+(.3+.5*p)+')';cx.lineWidth=1.5;cx.beginPath();cx.arc(0,0,34+p*18,0,TAU);cx.stroke();
 cx.strokeStyle='rgba(80,230,255,'+(.3+.5*p)+')';cx.setLineDash([3,5]);cx.lineDashOffset=-t*30;cx.beginPath();cx.arc(0,0,46+p*18,0,TAU);cx.stroke();cx.setLineDash([]);
 for(let i=0;i<7;i++){const an=t*(1+p*2)+i*TAU/7,r=(1-p)*90+26;shard(Math.cos(an)*r,Math.sin(an)*r*.8,2.6,t*4+i,i%2?'rgba(5,2,5,.9)':'rgba(255,60,90,.9)')}
 cx.restore()}
const _ufA=updFx;updFx=function(dt){_ufA(dt);
 for(const p of projs)if(p.hm>0){p.hm-=dt;if(P&&!P.dead){const dx=P.x+6-p.x,dy=P.y+11-p.y,d=Math.hypot(dx,dy)||1,k=Math.min(1,dt*1.6);p.vx+=(dx/d*125-p.vx)*k;p.vy+=(dy/d*125-p.vy)*k}}
 if(!SL.length)return;const live=P&&!P.dead&&enemies.some(e=>e.boss&&e.id==='deity'&&e.av&&!e.dead&&e.st!=='dying');
 if(!live){SL.length=0;return}
 for(let i=SL.length-1;i>=0;i--){const s=SL[i];if(s.st===0){s.t-=dt;if(s.t<=0)slStrike(s)}else{s.l-=dt;if(s.l>.3)slHit(s);if(s.l<=0)SL.splice(i,1)}}};
const _dfA=drawFx;drawFx=function(ox,oy,L){_dfA(ox,oy,L);if(!P)return;for(const s of SL)drawSlash(s,ox,oy,L);for(const B of enemies)if(B.boss&&B.av&&!B.dead)avTele(B,ox,oy,L)};

// ======================================================================
// Avatar attacks
// ======================================================================
Object.assign(HINT,{avRift:'LEAVE THE LINES',avCross:'GET OFF THE CROSS',avClaw:'FIND THE GAP',avEmpty:'WEAVE THROUGH',avRend:'BEHIND YOU',avRain:'RUN',avOrbs:'KEEP MOVING',avRadial:'GET FAR AWAY',avSever:'FIND THE GAP',avSpiral:'WEAVE THROUGH',avAnnihilate:'EVERYTHING CUTS',avCollapse:'FIND THE GAP'});
Object.assign(AT,{
 avRift:{wu:.9,act:1.7,rec:1.0,f(B){B.qn=0;B.qa=0},tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<(B.fury?5:B.ph===2?4:3)){B.qa=B.fury?.4:.55;const p=lead(),o=[0,1.5708,.7854,-.7854];
   slashThru(B,p.x,p.y,o[(B.qn+(Math.random()*4|0))%4]+(Math.random()-.5)*.3,300,B.fury?.7:.85,13,1.05);B.qn++;shake=Math.max(shake,2)}}},
 avCross:{wu:1.0,act:1.4,rec:1.1,f(B){const p=lead(),r=Math.random()*.5-.25,w=B.fury?.95:1.15;slashThru(B,p.x,p.y,.7854+r,320,w,14,1.15);slashThru(B,p.x,p.y,-.7854+r,320,w,14,1.15);
   if(B.ph===2){slashThru(B,p.x,p.y,r,360,w+.35,14,1.15);slashThru(B,p.x,p.y,1.5708+r,360,w+.35,14,1.15)}shake=Math.max(shake,3)}},
 avClaw:{wu:.85,act:1.9,rec:1.2,f(B){B.qn=0;B.qa=.1;B.qd=Math.random()<.5?1:-1},tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<(B.fury?4:3)){B.qa=.5;const p=lead(),d=B.qd*(B.qn%2?-1:1),an=d>0?1.15:Math.PI-1.15,ox=(Math.random()-.5)*60;
   for(let j=-1;j<=2;j++){const off=j*36-18;slashThru(B,p.x+ox+off*Math.cos(an+1.5708),p.y+off*Math.sin(an+1.5708),an,240,.8,9,.95)}B.qn++}}},
 avEmpty:{wu:.9,act:1.3,rec:1.1,f(B){B.qn=0;B.qa=0},tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<2){B.qa=.55;const n=14+(B.ph===2?4:0)+(B.fury?4:0),o=Math.random()*TAU,sp=B.def.ps||200,c=B.qn?CY:RD,v=sp*(B.qn?.62:.85);
   for(let i=0;i<n;i++){const an=o+(i+(B.qn?.5:0))/n*TAU;proj(bcx(B),bcy(B),Math.cos(an)*v,Math.sin(an)*v,dmA(B)*.5,c,B.def.pd*.5,5)}B.qn++;shake=Math.max(shake,4)}}},
 avRend:{wu:.55,act:1.3,rec:1.0,f(B){const a=B.ar,tx=P.x+6+(P.face>0?-60:60);B.tp=Math.max((a.cx-a.hw+2)*T,Math.min((a.cx+a.hw-2)*T,tx))-B.w/2;B.tl=.9;B.vis=.15;
   slash(B,B.tp+B.w/2,(a.fy-a.ht)*T,B.tp+B.w/2,a.fy*T,.85,16,1.1);const p=lead();slashThru(B,p.x,p.y,0,320,1.0,12,1)},
  tk(B,dt){if(B.tp!=null){B.tl-=dt;if(B.tl<=0){burst(bcx(B),bcy(B),16,'#ff2a46');B.x=B.tp;B.tp=null;B.vis=1;B.face=P.x>bcx(B)?1:-1;burst(bcx(B),bcy(B),22,'#5ff');shake=7;bhit(B,B.def.reach*1.15,1.25);
   const o=Math.random()*TAU;for(let i=0;i<12;i++){const an=o+i/12*TAU;proj(bcx(B),bcy(B),Math.cos(an)*200,Math.sin(an)*200,dmA(B)*.45,i%2?CY:RD,B.def.pd*.4,4)}}}}},
 avRain:{wu:1.0,act:2.3,rec:1.3,f(B){const a=B.ar;for(let i=0;i<Math.round(a.hw*.5);i++)bzone(B,(a.cx+(Math.random()-.5)*a.hw*1.8)*T,1.1+i*.06,18);bzone(B,P.x+6,1.2,22);B.qa=0;B.qn=0},
  tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<14){B.qa=.17;B.qn++;const a=B.ar;proj((a.cx+(Math.random()-.5)*a.hw*1.9)*T,(a.fy-a.ht+1)*T,(Math.random()-.5)*40,230,dmA(B)*.5,B.qn%3?INKP:CY,B.def.pd*.5,6)}}},
 avOrbs:{wu:.9,act:1.0,rec:1.4,f(B){const n=B.fury?4:3,o=Math.random()*TAU;for(let i=0;i<n;i++){const an=o+i/n*TAU;projs.push({x:bcx(B),y:bcy(B),vx:Math.cos(an)*90,vy:Math.sin(an)*90,dmg:dmA(B)*.7,col:i%2?CY:RD,pd:B.def.pd*.5,r:8,l:5,hm:3.2})}shake=Math.max(shake,3)}},
 avRadial:{wu:1.0,act:2.2,rec:1.2,f(B){B.qn=0;B.qa=0;B.qo=Math.random()*TAU},tk(B,dt){B.qa-=dt;const n=B.fury?9:7;if(B.qa<=0&&B.qn<n*2){B.qa=.2;const k=B.qn%n,set=(B.qn/n)|0,an=B.qo+(k+set*.5)/n*TAU;
   slash(B,bcx(B),bcy(B),bcx(B)+Math.cos(an)*480,bcy(B)+Math.sin(an)*480,.9,12,1);B.qn++}}},
 avSever:{wu:1.2,act:2.6,rec:1.4,f(B){const q=aB(B),px=P.x+6;for(let k=0;k<3;k++){const gc=Math.max(q.x0+80,Math.min(q.x1-80,px+(k?(Math.random()<.5?-1:1)*(110+Math.random()*150):(Math.random()-.5)*50))),w=1.5+k*.8;
   for(let x=Math.max(q.x0,px-520);x<Math.min(q.x1,px+520);x+=52)if(Math.abs(x-gc)>46)slash(B,x,q.y0-10,x,q.y1+10,w,14,1.1)}shake=Math.max(shake,4)}},
 avSpiral:{wu:.8,act:2.8,rec:1.2,f(B){B.ca=Math.random()*TAU;B.cs2=0},tk(B,dt){B.cs2-=dt;if(B.cs2<=0){B.cs2=B.fury?.1:.14;B.ca+=.4;const arms=B.fury?4:3,sp=(B.def.ps||200)*.78;
   for(let i=0;i<arms;i++){const a1=B.ca+i*TAU/arms,a2=-B.ca*.8+i*TAU/arms+.5;proj(bcx(B),bcy(B),Math.cos(a1)*sp,Math.sin(a1)*sp,dmA(B)*.4,RD,B.def.pd*.4,4);
    if(i%2===0)proj(bcx(B),bcy(B),Math.cos(a2)*sp*.8,Math.sin(a2)*sp*.8,dmA(B)*.4,CY,B.def.pd*.4,4)}}}},
 avAnnihilate:{wu:1.3,act:3.4,rec:1.5,f(B){B.qn=0;B.qa=0;const p=lead();slashThru(B,p.x,p.y,.7854,330,1.3,15,1.2);slashThru(B,p.x,p.y,-.7854,330,1.3,15,1.2);shake=Math.max(shake,4)},
  tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<11){B.qa=.3;B.qn++;const p=lead(),q=aB(B);
   if(B.qn%3===0){const x=Math.max(q.x0,Math.min(q.x1,p.x+(Math.random()-.5)*800));slash(B,x,q.y0-10,x,q.y1+10,.8,14,1.1)}
   else slashThru(B,p.x,p.y,Math.random()*Math.PI,300,.8,13,1.1)}}},
 avCollapse:{wu:1.2,act:3.2,rec:1.4,f(B){const q=aB(B),px=P.x+6;for(let k=0;k<3;k++){const gc=Math.max(q.x0+60,Math.min(q.x1-60,px+(k?(Math.random()<.5?-1:1)*(100+Math.random()*140):(Math.random()-.5)*60))),t=1.4+k*.9;
   for(let x=q.x0;x<q.x1;x+=34)if(Math.abs(x-gc)>44)bzone(B,x,t,36)}B.qa=0;B.qn=0;shake=Math.max(shake,4)},
  tk(B,dt){B.qa-=dt;if(B.qa<=0&&B.qn<12){B.qa=.24;B.qn++;const a=B.ar;proj((a.cx+(Math.random()-.5)*a.hw*1.9)*T,(a.fy-a.ht+1)*T,0,240,dmA(B)*.5,B.qn%2?INKP:CY,B.def.pd*.5,6);
   if(B.qn===6){const p=lead();slashThru(B,p.x,p.y,0,360,.9,12,1)}}}}});
Object.assign(BSND,{
 avRift:v8(v=>{tone(2200,200,.4,'sawtooth',.08*v);noise(.4,.16*v,8000,600,'highpass')}),
 avCross:v8(v=>{tone(1800,120,.5,'sawtooth',.09*v);tone(2400,160,.5,'sawtooth',.06*v,.1);noise(.5,.2*v,7000,400,'highpass')}),
 avClaw:v8(v=>{for(let i=0;i<3;i++){tone(2000-i*300,150,.3,'sawtooth',.07*v,i*.15);noise(.25,.14*v,6000,500,'highpass',1,i*.15)}}),
 avEmpty:v8(v=>{tone(90,40,.7,'sawtooth',.16*v);tone(900,1900,.5,'sine',.05*v);noise(.5,.16*v,500,3000,'bandpass',2)}),
 avRend:v8(v=>{tone(2600,200,.4,'sawtooth',.09*v);noise(.45,.18*v,9000,700,'highpass')}),
 avRain:v8(v=>{noise(1.4,.25*v,2200,70,'lowpass');tone(900,80,1.2,'sawtooth',.07*v)}),
 avOrbs:v8(v=>{tone(70,140,.9,'sawtooth',.12*v);tone(700,300,.6,'sine',.06*v)}),
 avRadial:v8(v=>{for(let i=0;i<5;i++)tone(1500+i*180,200,.25,'sawtooth',.05*v,i*.2)}),
 avSever:v8(v=>{noise(1.6,.28*v,3000,60,'lowpass');[185,233,277].forEach((f,i)=>tone(f,f*.5,1.6,'sawtooth',.06*v,i*.1));tone(2200,200,1,'sawtooth',.07*v)}),
 avSpiral:v8(v=>{[196,233,294,370].forEach((f,i)=>tone(f,f*1.02,1.4,'sawtooth',.045*v,i*.08))}),
 avAnnihilate:v8(v=>{noise(2,.32*v,4000,60,'lowpass');tone(50,25,2.4,'sawtooth',.25*v);for(let i=0;i<4;i++)tone(2600-i*300,150,.3,'sawtooth',.07*v,i*.5)}),
 avCollapse:v8(v=>{noise(1.8,.3*v,3000,60,'lowpass');[185,233,311,370].forEach((f,i)=>tone(f,f*.5,1.6,'sawtooth',.06*v,i*.1))})});
{const _ch=BSND.charge;BSND.charge=function(B,v){if(B&&B.av){tone(110,70,.7,'sawtooth',.09*v);tone(1500,600,.6,'sine',.04*v);noise(.6,.07*v,3000,6000,'bandpass',2)}else _ch(B,v)}}

// ======================================================================
// Corruption roll + sequence
// ======================================================================
function beginCorrupt(B){B.st='corrupt';B.cz=0;B.cf={};B.hbT=0;B.ak=B.ak||0;B.hp=1;B.vx=0;B.t=9;B.vis=1;B.dead=false;B.post=0;zones=[];projs=[];SL.length=0;
 P.inv=Math.max(P.inv,30);toast('\u2026')}
function ripOut(B){B.def=avDef();B.max=B.def.hp;B.hp=1;B.av=1;B.ph=1;B.p2=0;B.fury=0;B.chain=0;B.lastA='';B.sgT=30;B.ak=1;B.pmax=B.def.pmax;
 BP[0]=AVP;BG[0]='#240610';shake=26;const x=bcx(B),y=bcy(B);burst(x,y,60,'#fff');burst(x,y,50,'#ff2a46');burst(x,y,30,'#5ff');
 for(let i=0;i<70;i++){const a=i/70*TAU;parts.push({x,y,vx:Math.cos(a)*(120+Math.random()*220),vy:Math.sin(a)*(120+Math.random()*220)-40,l:1.2,c:i%3?'#f4f2f6':'#ff2a46'})}
 noise(1.6,.4,9000,200,'highpass');tone(45,22,2.8,'sawtooth',.4);tone(2600,120,1,'sawtooth',.12);tone(150,40,1.4,'square',.12);noise(2,.3,2500,60,'lowpass');toast('IT TEARS ITSELF OUT')}
function emerge(B){B.st='idle';B.t=1.2;B.roar=1.4;B.rmax=1.4;B.cz=0;B.hp=B.max;B.vis=1;camFocus=null;shake=24;avRoar();
 P.vx=(P.x<bcx(B)?-1:1)*340;P.vy=-150;P.stun=.4;P.inv=Math.max(P.inv,1.2);burst(bcx(B),bcy(B),50,'#ff2a46');burst(bcx(B),bcy(B),40,'#5ff');
 announce('AVATAR OF EMPTINESS','The Void That Wears a God','Nothing is left to hold back')}
function corruptTick(B,dt){const a=B.ar,f=B.cf;B.cz+=dt;const cs=B.cz;
 B.vx=0;B.vis=1;B.flash=0;B.post=0;B.t=9;B.x+=(a.cx*T-B.w/2-B.x)*Math.min(1,dt*2);B.y+=(a.fy*T-140-B.y)*Math.min(1,dt*2);
 P.inv=Math.max(P.inv,.25);P.stun=Math.max(P.stun,.12);camFocus={x:bcx(B),y:B.y+24};zones=[];projs=[];
 B.ak+=((cs>=4.2?1:c01((cs-1)/3.4)*.7)-B.ak)*Math.min(1,dt*3);
 shake=Math.max(shake,cs<1?0:cs<4.2?1+(cs-1)*1.1:cs<5.8?9:3);
 if(cs<4.2){B.hbT-=dt;if(B.hbT<=0){B.hbT=Math.max(.35,1.1-cs*.2);tone(52,36,.4,'sine',.28);tone(80,50,.25,'sine',.14,.18)}}
 if(cs>1&&cs<4.2&&Math.random()<dt*20)parts.push({x:B.x+Math.random()*B.w,y:B.y+Math.random()*B.h,vx:(Math.random()-.5)*60,vy:-30-Math.random()*50,l:.7,c:Math.random()<.5?'#f4f2f6':'#ff2a46'});
 if(cs>5&&cs<8&&Math.random()<dt*40)parts.push({x:B.x+Math.random()*B.w,y:B.y+Math.random()*B.h,vx:(Math.random()-.5)*200,vy:-80-Math.random()*120,l:.8,c:Math.random()<.5?'#f4f2f6':'#5ff'});
 if(!f.b&&cs>=1){f.b=1;noise(1.2,.2,2500,200,'bandpass',2);tone(1900,120,1.2,'sawtooth',.06);toast('The light begins to fracture\u2026')}
 if(!f.c&&cs>=2.8){f.c=1;tone(60,34,2,'sawtooth',.2);noise(1.6,.18,300,60,'lowpass');burst(bcx(B),bcy(B),20,'#ff2a46');toast('Something stirs beneath the shell\u2026')}
 if(!f.d&&cs>=4.2){f.d=1;ripOut(B)}
 if(!f.e&&cs>=6.2){f.e=1;[196,233,277,370].forEach((q,i)=>tone(q,q*1.5,2.4,'sawtooth',.06,i*.12));noise(1.6,.2,400,3000,'bandpass',3)}
 if(cs>=6.2)B.hp=B.max*ease(c01((cs-6.2)/2.3));
 if(cs>=8.7)emerge(B)}

// updBoss: sequence + smooth arena colour
const _ubA=updBoss;updBoss=function(B,dt){
 if(B.id==='deity'&&!B.dead&&B.st==='corrupt'){corruptTick(B,dt);return}
 _ubA(B,dt);if(B.id==='deity'&&B.av&&!B.dead)B.ak=1};
// the shell can't be hurt during the transformation; the Avatar has its own phase logic
const _hbA=hitBoss;hitBoss=function(B){
 if(B.st==='corrupt')return;
 if(!B.av||B.id!=='deity'){_hbA(B);return}
 const bad=['dormant','intro','phase','dying'].includes(B.st),ph0=B.ph,fu0=B.fury;
 B.id='avatar';try{_hbA(B)}finally{B.id='deity'}
 if(bad||B.hp<=0)return;const d=B.def;
 if(!B.p2&&B.hp<=B.max*.75){B.p2=1;d.a1.push('avRain','avOrbs');B.st='phase';B.t=1.4;B.vx=0;zones=[];projs=[];SL.length=0;toast('PHASE II \u2014 The Emptiness spreads')}
 if(B.ph===2&&ph0===1){d.a2=d.a1.concat(['avRadial','avSever','avSpiral']);toast('PHASE III \u2014 Reality frays')}
 if(B.fury&&!fu0){d.a2.push('avAnnihilate','avCollapse');toast('PHASE IV \u2014 Annihilation')}};

// the Deity's death: 45% chance to be corrupted instead of finishing
const _fbA=finishBoss;finishBoss=function(B){
 if(!B||B.id!=='deity'||B.dead){_fbA(B);return}
 if(!B.av){if(Math.random()<window.AVATAR_CHANCE){beginCorrupt(B);return}_fbA(B);return}
 window.AV_WIN=1;_fbA(B);gold+=1500;gainXp(500*B.def.tier);
 if(window.__badgeBoss)window.__badgeBoss('avatar');
 setTimeout(()=>{if(P)toast('Avatar of Emptiness vanquished \u00b7 +1500 gold \u00b7 +'+500*B.def.tier+' exp')},2600)};

// hud: hide the boss bar while the shell is still tearing; cinematic bars, flash and subtitles
const _bhA=bossHud;bossHud=function(){
 const B=enemies.find(e=>e.boss&&e.id==='deity'&&!e.dead&&e.st==='corrupt');if(!B){_bhA();return}
 const cs=B.cz,st0=B.st;if(cs<6.2)B.st='dormant';try{_bhA()}finally{B.st=st0}
 const w=cv.width,h=cv.height;cx.save();
 const fl=cs>=4.2&&cs<5.4?1-c01((cs-4.2)/1.2):0;if(fl>0){cx.fillStyle='rgba(255,255,255,'+fl*.9+')';cx.fillRect(0,0,w,h);cx.fillStyle='rgba(255,20,50,'+fl*.3+')';cx.fillRect(0,0,w,h)}
 const rv=c01((cs-1)/3.2)*.5+(cs>=4.2?.2:0);let g=cx.createRadialGradient(w/2,h/2,h*.3,w/2,h/2,Math.hypot(w,h)*.6);g.addColorStop(0,'rgba(80,0,10,0)');g.addColorStop(1,'rgba(80,0,10,'+rv+')');cx.fillStyle=g;cx.fillRect(0,0,w,h);
 const bh=h*.11*c01(cs/.6)*(1-c01((cs-8.2)/.5));cx.fillStyle='#000';cx.fillRect(0,0,w,bh);cx.fillRect(0,h-bh,w,bh);
 const sub=cs<.5?'':cs<2.8?'\u2026The light was only a shell.':cs<4.2?'Something has been wearing this face.':cs<6.4?'It tears itself free.':'';
 if(sub){cx.textAlign='center';cx.font='italic 16px Georgia';cx.shadowColor='#f01a3a';cx.shadowBlur=10;cx.fillStyle='#ffd0d6';cx.fillText(sub,w/2,h-bh-14)}
 cx.restore()};

// ======================================================================
// Avatar victory cutscene (different from the Deity's: the void collapses, is cut open, and fills with light)
// ======================================================================
let AVC=0;
window.AVV=function(){if(AVC||!P)return;AVC=1;paused=true;P.inv=60;
 const el=document.createElement('canvas');el.id='vcut';el.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:90;background:#000';document.body.appendChild(el);
 const c=el.getContext('2d');let w=0,h=0;const rs=()=>{w=el.width=innerWidth;h=el.height=innerHeight};rs();addEventListener('resize',rs);
 let fs=15.2,fin=0;const t0=performance.now(),tm=[],at=(s,f)=>tm.push(setTimeout(f,s*1000));
 const SLS=[];for(let i=0;i<10;i++)SLS.push({t0:3.0+i*.27,an:(i*.97+.3)%Math.PI,off:((i*53)%100-50)/100,w:6+(i%3)*3,seed:i*7.7});
 const PTS=[];for(let i=0;i<150;i++)PTS.push({an:i*2.399,d:.25+((i*37)%100)/100*.75,c:i%3===0?'#5ff':i%3===1?'#ff2a46':'#fff',sp:.8+((i*13)%10)/20});
 at(0,()=>{tone(50,20,3.2,'sawtooth',.34);noise(2.6,.22,200,6000,'bandpass',1.5);tone(98,65,2.6,'sine',.18)});
 at(2.7,()=>{tone(60,22,1.6,'sine',.5);noise(1.3,.4,4000,90,'lowpass');tone(2400,200,.8,'sawtooth',.1);noise(.5,.3,9000,800,'highpass')});
 SLS.forEach(s=>at(s.t0,()=>{tone(2600-s.an*300,160,.3,'sawtooth',.08);noise(.3,.15,7000,500,'highpass')}));
 at(5.4,()=>{[262,311,392,466].forEach((f,i)=>tone(f*.995,f*1.005,5,'triangle',.05,i*.2))});
 at(8.2,()=>{[392,523,659,784].forEach((f,i)=>tone(f,f*1.002,4.5,'sine',.05,i*.15))});
 at(11.8,()=>{[1568,2093,2637,3136].forEach((f,i)=>tone(f,f,3,'sine',.06-i*.008,i*.14));tone(65,60,3,'sine',.2)});
 const mix=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',');
 const draw=t=>{const cx0=w/2,cy0=h*.46,U=Math.min(w,h)/700,k2=ease(c01((t-5.4)/3.2));
  let g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgb('+mix([18,2,10],[24,60,78],k2)+')');g.addColorStop(1,'rgb('+mix([6,0,4],[250,236,230],k2)+')');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.save();c.globalCompositeOperation='lighter';
  if(t<3){const k=ease(t/2.7);for(const p of PTS){const r=p.d*Math.hypot(w,h)*.55*(1-k*p.sp*.98),x=cx0+Math.cos(p.an+k*2)*r,y=cy0+Math.sin(p.an+k*2)*r*.8;c.fillStyle=p.c;c.globalAlpha=.25+.6*k;c.fillRect(x,y,2*U+1,2*U+1);c.globalAlpha=.12;c.fillRect(cx0+(x-cx0)*1.12,cy0+(y-cy0)*1.12,1,(y-cy0)*.06+1)}
   c.globalAlpha=1;const r=(8+k*60)*U;g=c.createRadialGradient(cx0,cy0,0,cx0,cy0,r);g.addColorStop(0,'rgba(255,255,255,'+(.4+.6*k)+')');g.addColorStop(.4,'rgba(255,40,70,.5)');g.addColorStop(1,'rgba(255,40,70,0)');c.fillStyle=g;c.fillRect(cx0-r,cy0-r,r*2,r*2)}
  c.restore();
  for(const s of SLS){const a=t-s.t0;if(a<0)continue;const life=a<5.2-s.t0+3?1:0,fadeIn=c01(a/.15),heal=ease(c01((t-5.2)/2.8)),L=Math.hypot(w,h),nx=Math.cos(s.an+1.5708),ny=Math.sin(s.an+1.5708),px=cx0+nx*s.off*w*.5,py=cy0+ny*s.off*h*.5,dx=Math.cos(s.an)*L,dy=Math.sin(s.an)*L;
   const pts=[];const n=22;for(let i=0;i<=n;i++){const u=i/n*2-1,j=(i&&i<n)?Math.sin(s.seed+i*2.3)*s.w*U*.5:0;pts.push(px+dx*u+nx*j,py+dy*u+ny*j)}
   const path=()=>{c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1])};
   const gone=c01(1-(t-6.8-s.t0*.1)/2.2);if(life&&gone>0){c.save();c.globalAlpha=gone*fadeIn;c.globalCompositeOperation='lighter';c.strokeStyle=heal>.5?'rgba(120,240,255,.6)':'rgba(255,30,60,.6)';c.lineWidth=s.w*U*2.4;path();c.stroke();c.restore();
    c.globalAlpha=gone*fadeIn;c.strokeStyle=heal>.4?'rgba(230,255,255,1)':'#030003';c.lineWidth=s.w*U*(heal>.4?.5:1);path();c.stroke();c.strokeStyle='rgba(235,252,255,.95)';c.lineWidth=1.6*U+.5;path();c.stroke();c.globalAlpha=1}}
  c.save();c.globalCompositeOperation='lighter';
  g=c.createRadialGradient(cx0,h*.95,0,cx0,h*.95,w*.7);g.addColorStop(0,'rgba(190,250,255,'+.6*k2+')');g.addColorStop(1,'rgba(190,250,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  if(t>5.4)for(let i=0;i<70;i++){const x=((i*137)%1000)/1000*w+Math.sin(t*.7+i)*14*U,y=h-((t*(24+i%6*8)*U+i*91)%(h*1.1)),a=(.25+.4*Math.sin(t*3+i*2))*k2;c.fillStyle='rgba(180,248,255,'+a+')';c.fillRect(x,y,(1+i%3)*U+.5,(1+i%3)*U+.5)}c.restore();
  c.textAlign='center';c.textBaseline='alphabetic';
  const txt=(s,y,size,t0,t1,col,glow,font)=>{const a=ease(c01((t-t0)/.9))*(1-ease(c01((t-t1)/.6)));if(a<=0)return;c.save();c.globalAlpha=a;c.font=font+size+'px Georgia,serif';c.lineJoin='round';c.lineWidth=size*.1;c.strokeStyle='rgba(10,0,6,.9)';c.strokeText(s,cx0,y+(1-a)*8);c.shadowColor=glow;c.shadowBlur=18;c.fillStyle=col;c.fillText(s,cx0,y+(1-a)*8);c.restore()};
  const T1=Math.min(w*.07,h*.15);txt('BOSS VANQUISHED',h*.56,T1,5.2,15,'#ffe3e8','rgba(255,40,70,.95)','700 ');
  txt('THE AVATAR OF EMPTINESS',h*.56+T1*.7,T1*.3,6.4,15,'#f0e2c4','rgba(255,120,140,.7)','600 ');
  txt('\u201CSo this is\u2026 what it is to be filled.\u201D',h*.8,T1*.28,8.2,11.6,'#e4fbff','rgba(80,230,255,.7)','italic ');
  txt('The hollow places are made whole.',h*.86,T1*.23,9.6,11.6,'#fff4f6','rgba(255,150,170,.6)','');
  if(t>11.8){const a=ease(c01((t-11.8)/1));c.save();c.globalAlpha=a;c.font='600 '+T1*.3+'px Georgia,serif';const s='E M P T I N E S S   F I L L E D',tw=c.measureText(s).width;c.lineJoin='round';c.lineWidth=T1*.04;c.strokeStyle='rgba(10,0,6,.9)';c.strokeText(s,cx0-tw/2,h*.82);c.textAlign='left';c.fillStyle='#bff8ff';c.shadowColor='rgba(80,230,255,.9)';c.shadowBlur=16;c.fillText(s,cx0-tw/2,h*.82);c.restore();c.textAlign='center'}
  if(t<1.2){c.fillStyle='rgba(255,60,80,'+(.6*(1-t/1.2))+')';c.fillRect(0,0,w,h)}
  if(t>2.7&&t<3.6){c.fillStyle='rgba(255,255,255,'+(1-(t-2.7)/.9)+')';c.fillRect(0,0,w,h)}
  g=c.createRadialGradient(cx0,h*.5,Math.min(w,h)*.3,cx0,h*.5,Math.hypot(w,h)*.6);g.addColorStop(0,'rgba(10,0,6,0)');g.addColorStop(1,'rgba(10,0,6,'+(.6-.4*k2)+')');c.fillStyle=g;c.fillRect(0,0,w,h);
  const bh=h*.09*ease(c01((t-.3)/1))*(1-ease(c01((t-fs)/1.2)));c.fillStyle='#000';c.fillRect(0,0,w,bh);c.fillRect(0,h-bh,w,bh);
  if(t>3&&t<fs){c.save();c.globalAlpha=.55*c01((t-3)/1);c.font='12px Georgia,serif';c.textAlign='right';c.fillStyle='#d8cdb8';c.fillText('click / Space to skip',w-18,h-bh-12);c.restore()}
  if(t>fs){c.fillStyle='rgba(255,255,255,'+c01((t-fs)/1.4)+')';c.fillRect(0,0,w,h)}};
 const skip=()=>{const t=(performance.now()-t0)/1000;if(t>2.5&&fs>t)fs=t};
 const kd=e=>{e.stopImmediatePropagation();e.preventDefault();if(e.code==='Space'||e.code==='Enter'||e.code==='Escape')skip()};addEventListener('keydown',kd,true);el.addEventListener('mousedown',skip);
 const finish=()=>{tm.forEach(clearTimeout);removeEventListener('keydown',kd,true);removeEventListener('resize',rs);try{for(const k in keys)keys[k]=false}catch(e){}AVC=0;if(window.__showWin)window.__showWin();el.style.transition='opacity 1.2s';el.style.opacity='0';setTimeout(()=>el.remove(),1300)};
 const loop=()=>{const t=(performance.now()-t0)/1000;try{draw(t)}catch(e){console.error(e);fin=1;finish();return}if(t>=fs+1.4&&!fin){fin=1;finish();return}requestAnimationFrame(loop)};requestAnimationFrame(loop)};

// a new run clears any leftover state
{const _s5=start;start=function(n){window.AV_WIN=0;SL.length=0;return _s5(n)}}
{const _e5=endRun;endRun=function(){window.AV_WIN=0;SL.length=0;return _e5()}}


// ======================================================================
// DEV FORGE (code "forgemaster"): Developer Blade = exactly 5000 base damage per hit, Developer armor set = +5000 max HP.
// The run is flagged as a dev run in patch.js: echoes, quest echoes, badges, Nameless Blessing and Emptiness Filled are all void.
// ======================================================================
ASET.push({n:'Developer Plate',rar:4,p:0,def:0,wt:0,c:['#101018','#ff2a46','#7ff'],fx:{},bn:{}});
{const DS=ASET.length-1;for(const sl of ASL){const a={id:'dev_'+sl,set:DS,slot:sl,name:'Developer '+ASN[sl],rar:4,def:0,wt:0,price:0,pas:'+1250 max HP (dev forge \u2014 4 pieces = +5000)'};ARMS.push(a);ARMB[a.id]=a}}
{const _rcF=recalc;recalc=function(){_rcF();if(typeof P!=='undefined'&&P)for(const sl of ASL)if(armEq[sl]==='dev_'+sl)S.hp+=1250;if(P){P.hp=Math.min(P.hp,maxHp())}}}
{const _dmF=window.dmgMult;window.dmgMult=function(){const m=_dmF?_dmF():1;
 if(P&&P.weapon&&P.weapon.dev){const base=P.weapon.dmg*(1+P.at.str*.12+S.dmg+(typeof enc==='function'?enc('dmg'):0));return base>0?5000/base:1}return m}}
{const _wfD=wfx;wfx=function(e,d){_wfD(e,d);if(P&&P.weapon&&P.weapon.dev&&d>0){const h=Math.ceil(d);P.hp=Math.min(maxHp(),P.hp+h);float(P.x,P.y-14,'+'+h,'#7f9');burst(P.x+6,P.y+10,4,'#c8f')}}}
{const _esD=enchSheet;enchSheet=function(w){const s=_esD(w);return w&&w.dev?'<br><small style="color:#ffb347">\u2726 Devour: Heal 100% of damage dealt.</small>'+s:s}}
window.giveForge=function(){if(!P)return;
 if(!(P.weapon&&P.weapon.dev)&&!inv.some(w=>w&&w.dev)){const old=P.weapon;P.weapon={id:uid++,type:'weapon',kind:'sword',name:'Developer Blade',rar:4,dmg:5000,speed:1,unique:1,dev:1};if(old)inv.push(old)}
 for(const sl of ASL){const id='dev_'+sl;if(!armOwned.includes(id))armOwned.push(id);armEq[sl]=id}
 recalc();P.hp=maxHp();P.stam=maxStam()};

window.__avTest={drawAvatar,drawCorrupt,avArena,drawSlash,avTele,SL,slash,corruptTick,beginCorrupt,avDef,AT};
})();