'use strict';
// ===== Ashfall Depths: Patch 7 (load AFTER patch6.js) =====
// Weapon passives for every normal weapon type + the heavy SCYTHE (lifesteal 1%-4% of max HP per hit, scaling with rarity)
// Passives also work on the tutorial dummy and Poke, and the passive name is shown next to the weapon in the HUD.
(()=>{
 // ---- Scythe (pixel-art style: long wooden shaft, flared socket, crescent blade hanging to one side) ----
 WK.scythe={reach:40,dur:.54,pd:1.3,dm:1.5,col:['#8a8a9a55','#c8c8d8aa','#ffffff'],names:['Reaper Scythe','Harvester','Grim Scythe'],
  draw(){
   const fl=(P&&P.face<0)?-1:1;cx.save();cx.scale(1,fl);
   // shaft
   FR(-11,-1.2,50,2.4,'#7a4a10');FR(-11,-1.2,50,1,'#d08a1c');FR(-11,.5,50,.7,'#4e3008');
   for(const x of[-6,2,10,18,26])FR(x,-1.2,1,2.4,'#5e3a0c');
   FR(-12,-1.4,2,2.8,'#4e3008');
   // socket + flared head
   PL([36,-1.4,38.2,-2.6,40,-5.6,42,-5.6,43.9,-1.5,47.4,-.5,44.7,3.2,39.7,3.2,36,1.6],'#808080');
   PL([38.2,-2.6,42,-5.6,43.9,-1.5,40,0],'#9a9a9a');PL([43.9,-1.5,47.4,-.5,44.7,3.2,41,1],'#6a6a6a');
   FR(36,-1.2,3,2.4,'#5a5a5a');
   // thin spike continuing the shaft
   PL([47,-.6,53,-.1,47,.8],'#a0a0a0');
   // crescent blade hanging to the +y side
   PL([44.7,3.2,43.6,7,41.6,11.6,38,16,33.6,19.7,30.2,20.8,25.8,22.2,28.4,18.2,31.9,17.6,35,14.4,37.8,11.4,39,7,39.7,3.2],'#8c8c8c');
   PL([44.7,3.2,43.6,7,41.6,11.6,38,16,33.6,19.7,30.2,20.8,25.8,22.2,31,19.2,36.2,15.4,40,11,42.2,6.8],'#b4b4b4');        // bright outer rim
   PL([39.7,3.2,39,7,37.8,11.4,35,14.4,31.9,17.6,28.4,18.2,31,15.8,34,12.4,36.2,8.6,37.4,4.6],'#6c6c6c');                // dark inner edge
   cx.strokeStyle='#d6d6d6';cx.lineWidth=.8;cx.beginPath();cx.moveTo(43.6,4.2);cx.quadraticCurveTo(42,14,31,20);cx.stroke();   // ridge line
   if(typeof AD==='function'&&typeof rc==='function'&&P&&P.weapon&&P.weapon.rar>=2)AD(()=>{glow(36,12,24,ca(rc(),'55'))});
   cx.restore()}};
 if(!KINDS.includes('scythe'))KINDS.push('scythe');

 // ---- Glacial Devourer drop: Rimefang, an ice scythe (replaces Frostbite Edge as the boss reward) ----
 WK.icescythe={reach:42,dur:.5,pd:1.4,dm:1.5,bd:46,col:['#6cf6','#bff9','#ffffff'],names:[],
  draw(){
   const fl=(P&&P.face<0)?-1:1;cx.save();cx.scale(1,fl);
   // frosted shaft with icy wraps
   FR(-11,-1.2,50,2.4,'#2c4f78');FR(-11,-1.2,50,1,'#7cc4ee');FR(-11,.5,50,.7,'#1c3556');
   for(const x of[-6,2,10,18,26])FR(x,-1.2,1,2.4,'#183050');
   FR(-12,-1.4,2,2.8,'#bfe8ff');
   // crystalline socket and head
   PL([36,-1.4,38.2,-2.6,40,-6.5,42,-6.5,43.9,-1.5,47.4,-.5,44.7,3.2,39.7,3.2,36,1.6],'#5aa0d0');
   PL([38.2,-2.6,42,-6.5,43.9,-1.5,40,0],'#aee0ff');PL([43.9,-1.5,47.4,-.5,44.7,3.2,41,1],'#3a78a8');
   // ice spike
   PL([47,-.8,56,-.1,47,1],'#dff6ff');
   // crescent ice blade
   PL([44.7,3.2,43.6,7,41.6,11.6,38,16,33.6,19.7,30.2,20.8,25.8,22.2,28.4,18.2,31.9,17.6,35,14.4,37.8,11.4,39,7,39.7,3.2],'#5db4e6');
   PL([44.7,3.2,43.6,7,41.6,11.6,38,16,33.6,19.7,30.2,20.8,25.8,22.2,31,19.2,36.2,15.4,40,11,42.2,6.8],'#cfeeff');
   PL([39.7,3.2,39,7,37.8,11.4,35,14.4,31.9,17.6,28.4,18.2,31,15.8,34,12.4,36.2,8.6,37.4,4.6],'#3a86bc');
   cx.strokeStyle='#fff';cx.lineWidth=.8;cx.beginPath();cx.moveTo(43.6,4.2);cx.quadraticCurveTo(42,14,31,20);cx.stroke();
   // icicle shards along the blade
   PL([41,9,46,10.5,41.6,12.4],'#e8f8ff');PL([37.5,14.6,41.5,17.6,36,17.2],'#e8f8ff');PL([32.5,18.6,34,23,30.4,20.6],'#e8f8ff');
   if(typeof AD==='function')AD(()=>{glow(36,12,30,'rgba(120,210,255,.38)');for(let i=0;i<3;i++)FR(30+((time*16+i*7)%14),4+((time*20+i*11)%18),1.5,1.5,'rgba(255,255,255,.85)')});
   if(Math.random()<.15)parts.push({x:P.x+6,y:P.y+8,vx:0,vy:20,l:.5,c:'#cff'});
   cx.restore()}};
 WN.icescythe='Rimefang, Glacial Scythe';
 if(BD.glacial)BD.glacial.wpn='icescythe';
 // old Frostbite Edges already in a pack are converted so the drop is not duplicated
 const upgradeOld=w=>{if(w&&w.kind==='odachi'&&!w.d60){w.d60=1;w.dmg=60}   // existing Gale Odachis are set to base 60 once
  if(w&&w.kind==='frostbite'&&w.unique){w.kind='icescythe';w.name=WN.icescythe;w.dmg=Math.max(w.dmg|0,WK.icescythe.bd)}};
 const _ugi=setInterval(()=>{try{if(typeof inv!=='undefined'){inv.forEach(upgradeOld);if(P&&P.weapon)upgradeOld(P.weapon)}}catch(e){}},1500);

 // ---- Gale Odachi (Elder Maren's reward): long black-and-crimson serrated blade, 5-stage M1 combo passive ----
 WK.odachi={reach:50,dur:.62,pd:1.6,dm:1.45,col:['#2aff7a44','#5aff9aaa','#ffffff'],names:[],
  draw(){
   const fl=(P&&P.face<0)?-1:1,st=(P&&P.odS&&time-(P.odT||-9)<.6)?P.odS:0;cx.save();cx.scale(.9,.9*fl);
   // ito-wrapped grip: black cord with crimson diamonds
   FR(-12,-1.8,25,3.6,'#09130d');for(let x=-10;x<12;x+=4){FR(x,-1.8,2,3.6,'#14401f');FR(x+2,-1.8,1,3.6,'#0f2616')}
   FR(-14,-2.4,3,4.8,'#2a3a30');FR(-14,-1,1.5,2,'#2f9a52');
   // tsuba (guard): dark plate with crimson rim
   PL([12.5,-5.6,15.5,-5.6,17,-3,17,3,15.5,5.6,12.5,5.6,11,3,11,-3],'#15231b');PL([13.4,-4.2,15,-4.2,15.6,0,15,4.2,13.4,4.2,12.4,0],'#14401f');FR(13.6,-.8,1.4,1.6,'#d8c070');
   // blade: long, curved, serrated on the spine
   const N=18,top=[],bot=[],cl=t=>[17+58*t,-13*t*t],wd=t=>5.4*(1-.82*Math.pow(t,1.4));
   for(let i=0;i<=N;i++){const t=i/N,[x,y]=cl(t),w=wd(t);top.push(x,y-w*.55);bot.unshift(x,y+w*.45)}
   PL(top.concat(bot),'#0e1a14');
   // crimson-lit cutting edge + highlight
   const edge=[],hl=[];for(let i=0;i<=N;i++){const t=i/N,[x,y]=cl(t),w=wd(t);edge.push(x,y+w*.45);hl.push(x,y+w*.05)}
   cx.lineJoin='round';cx.strokeStyle='#1f7a40';cx.lineWidth=1.1;cx.beginPath();for(let i=0;i<edge.length;i+=2)i?cx.lineTo(edge[i],edge[i+1]):cx.moveTo(edge[i],edge[i+1]);cx.stroke();
   cx.strokeStyle='rgba(130,255,170,.55)';cx.lineWidth=.6;cx.beginPath();for(let i=0;i<hl.length;i+=2)i?cx.lineTo(hl[i],hl[i+1]):cx.moveTo(hl[i],hl[i+1]);cx.stroke();
   // saw-teeth along the spine
   for(let t=.1;t<.93;t+=.052){const[x,y]=cl(t),w=wd(t);PL([x,y-w*.5,x+2.6,y-w*.55-3.4+t*2,x+3.6,y-w*.5+.3],'#060d08')}
   // little hook-spike beside the guard
   PL([17,-3.2,19.5,-8,23,-11.5,21.8,-6.4,19.5,-2.6],'#1c2e24');PL([19.5,-8,23,-11.5,21,-7.5],'#1f7a40');
   // gale glow grows with the combo stage
   if(typeof AD==='function')AD(()=>{const gs=st/5;glow(48,-4,18+st*7,'rgba(40,220,110,'+(.12+.1*st)+')');if(st>=3)glow(60,-7,16,'rgba(190,255,215,'+(.15*gs)+')')});
   if(st>=2&&Math.random()<.2*st)parts.push({x:P.x+6+fl*0,y:P.y+8,vx:(Math.random()-.5)*60,vy:-20,l:.35,c:st>=4?'#dff':'#7aff9a'});
   cx.restore()}};
 // each M1 swing gets an id so the combo advances once per swing (not once per enemy hit)
 const _ta7=tryAttack;tryAttack=function(){const a=P?P.atk:0;_ta7.apply(this,arguments);if(P&&P.atk>a){P.swId=(P.swId|0)+1;if(P.weapon&&P.weapon.kind==='odachi')P.odN=(P.odS&&time-(P.odT||-9)<.6)?(P.odS%5)+1:1}};
 window.giveGaleOdachi=function(o){
  const lvl=Math.max(1,P.lvl+3),w={id:uid++,type:'weapon',kind:'odachi',name:'Gale Odachi',rar:4,dmg:60,speed:1,d60:1};
  if(inv.length<20){inv.push(w);o.push(w.name);return}
  let idx=inv.findIndex(i=>i&&i.type==='weapon'&&i.rar===0);       // bag full: it takes the place of a Common weapon
  if(idx<0){let br=9;inv.forEach((i,j)=>{if(i&&i.type==='weapon'&&i.rar<br){br=i.rar;idx=j}})}
  if(idx>=0){const old=inv[idx];inv[idx]=w;o.push(w.name+' (replaced '+old.name+')')}else{gold+=500;o.push('+500g (pack full)')}};

 // ---- Scholar echo upgrade: more levels ----
 {const u=UPG.find(q=>q[0]==='xp');if(u)u[3]=15}

 // ---- Boss kills: +3 levels (first kill) / +1 level (rekindled); rekindled bosses still drop a Boss Treasure Cache ----
 const giveLevels=n=>{for(let i=0;i<n;i++){P.xp=Math.max(P.xp,xpNeed(P.lvl));gainXp(0)}};
 let noXp=0;const _gx7=gainXp;gainXp=function(){if(noXp)return;return _gx7.apply(this,arguments)};   // a boss kill grants exactly its levels, not random xp on top
 const _fb7=finishBoss;finishBoss=function(B){
  const was=B&&B.dead;noXp=1;try{_fb7.apply(this,arguments)}finally{noXp=0}
  if(!B||was||!B.dead||!P)return;
  const n=B.rs?1:3;giveLevels(n);
  if(B.rs&&B.ar){const k='cache'+B.id;delete opened[k];chests=chests.filter(c=>c.k!==k);addCache(B.ar)}
  setTimeout(()=>{if(P)toast('✦ Boss slain · +'+n+(n>1?' levels':' level')+(B.rs?' · treasure cache appeared':''))},2600)};


 // ---- Judgement Cut (Gale Odachi stage V): 8 slashes = 300% burst, heavy boss posture, full cinematic ----
 const JC=[];let jcO=[0,0];
 const mkJC=(x,y,n,big,dmg)=>{const sl=[];for(let i=0;i<n;i++){const a=(i%2?.75:-.75)+(i*.31)+(Math.random()-.5)*.9;sl.push({a,l:(big?170:90)+Math.random()*(big?110:40),c:(Math.random()-.5)*(big?70:30),ox:(Math.random()-.5)*(big?26:14),oy:(Math.random()-.5)*(big?26:14),t:(big?.16:.05)+i*(big?.045:.04),d:0})}
  JC.push({x,y,t0:time,n,big,dmg,s:sl,fin:(big?.16:.05)+n*(big?.045:.04),fd:0})};
 let jcSw=-1;
 // applies Judgement Cut damage for real (shows the number, flashes the target, kills splashed mobs properly)
 function jcDmg(o,v,main){const pk=!!o.tpoke;if(pk)o.hp=Math.max(2,o.hp-v);else o.hp-=v;
  float(o.x+(o.w||14)/2-10,o.y-20-(main?10:0),Math.round(v)+(main?'!':''),'#ffb347');o.flash=Math.max(o.flash||0,.12);
  if(!main&&!pk&&!o.tdummy&&o.hp<=0&&!o.dead)dotE(o,0)}
 function judgementCut(e,d,mx,my){
  const N=8,first=jcSw!==P.swId;jcSw=P.swId;
  jcDmg(e,d*3*CM(),true);                                                 // 300% burst x crit multiplier (x2 + Ruthlessness) = 600%+ burst damage
  if(!e.tpoke&&!e.tdummy)e.post=(e.post||0)+(e.boss?130:50);          // heavy posture damage (bosses nearly break)
  mkJC(mx,my,first?N:4,first,Math.round(d*3/(first?N:4)*CM()));
  for(const o of enemies){if(o===e||o.dead||o.boss||o.tdummy||o.tpoke)continue;
   if(Math.hypot(o.x-e.x,o.y-e.y)<120){jcDmg(o,d*2.5*CM(),false);o.post=(o.post||0)+20;mkJC(o.x+(o.w||14)/2,o.y+(o.h||22)/2,4,false,Math.round(d*2.5/4*CM()));float(o.x,o.y-10,'CUT','#bfd')}}
  if(first){float(e.x,e.y-48,'JUDGEMENT CUT','#fff');hitstop=Math.max(hitstop||0,.5);
   for(let i=0;i<N;i++)tone(2100-i*140,260,.16,'sawtooth',.055,.16+i*.045);tone(90,30,.7,'sine',.22,.16+N*.045);tone(1400,3000,.5,'triangle',.07,.16+N*.045)}}
 const drawJC=()=>{
  const w=cv.width,h=cv.height,ox=jcO[0],oy=jcO[1];
  for(let q=JC.length-1;q>=0;q--){const j=JC[q],T=time-j.t0;if(T>1.6){JC.splice(q,1);continue}
   const X=j.x-ox,Y=j.y-oy,sc=j.big?1:.55;cx.save();
   if(j.big){   // darkening + cinematic bars
    const dimA=T<.12?T/.12:(T<1?1:Math.max(0,1-(T-1)/.4));
    cx.fillStyle='rgba(0,16,8,'+(.5*dimA)+')';cx.fillRect(0,0,w,h);
    const bh=h*.1*Math.min(1,T/.14)*(T>1.1?Math.max(0,1-(T-1.1)/.3):1);cx.fillStyle='#000';cx.fillRect(0,0,w,bh);cx.fillRect(0,h-bh,w,bh);
    if(T<.16){const k=T/.16;cx.fillStyle='rgba(120,255,170,'+(.25*k)+')';cx.beginPath();cx.arc(X,Y,30*(1-k)+6,0,6.283);cx.fill()}}   // charge-up
   const fa=T-j.fin;
   if(j.big&&fa>0&&fa<.3){cx.fillStyle='rgba(235,255,242,'+(.8*(1-fa/.3))+')';cx.fillRect(0,0,w,h)}   // finishing flash
   cx.globalCompositeOperation='lighter';cx.lineCap='round';
   for(let i=0;i<j.n;i++){const sl=j.s[i],ta=T-sl.t;if(ta<0)continue;
    if(!sl.d){sl.d=1;float(j.x+(Math.random()-.5)*34,j.y-8-Math.random()*26,j.dmg,'#ffb347');parts.push({x:j.x+sl.ox,y:j.y+sl.oy,vx:0,vy:-40,l:.3,c:'#ffd36b'});
     shake=Math.max(shake,j.big?4+i*.8:2);for(let p=0;p<(j.big?10:4);p++){const u=Math.random()-.5,ca=Math.cos(sl.a),sa=Math.sin(sl.a);parts.push({x:j.x+sl.ox+ca*u*sl.l,y:j.y+sl.oy+sa*u*sl.l,vx:(Math.random()-.5)*220,vy:(Math.random()-.5)*220-30,l:.5,c:p%2?'#fff':'#5aff8a'})}}
    const grow=Math.min(1,ta/.06),life=j.big?.55:.3,fade=Math.max(0,1-ta/life);if(fade<=0)continue;
    const L=sl.l*sc/2,ca=Math.cos(sl.a),sa=Math.sin(sl.a),cxx=X+sl.ox,cyy=Y+sl.oy,x0=cxx-ca*L,y0=cyy-sa*L,x1=x0+ca*2*L*grow,y1=y0+sa*2*L*grow,mxx=(x0+x1)/2-sa*sl.c*grow,myy=(y0+y1)/2+ca*sl.c*grow;
    for(const[lw,col]of[[16*sc,'rgba(20,200,90,'+(.28*fade)+')'],[7*sc,'rgba(120,255,170,'+(.75*fade)+')'],[2.4*sc+.4,'rgba(255,255,255,'+fade+')']]){cx.strokeStyle=col;cx.lineWidth=lw*(.4+.6*fade);cx.beginPath();cx.moveTo(x0,y0);cx.quadraticCurveTo(mxx,myy,x1,y1);cx.stroke()}
    if(grow<1)glow(x1,y1,30*sc,'rgba(200,255,220,.8)')}
   if(j.big&&fa>0){
    if(!j.fd){j.fd=1;shake=Math.max(shake,14);for(let i=0;i<48;i++){const a=i/48*6.283,v=120+Math.random()*260;parts.push({x:j.x,y:j.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.7-20,l:.7,c:i%3?'#5aff8a':'#fff'})}}
    const k=Math.min(1,fa/.5),fade=Math.max(0,1-fa/.8);
    glow(X,Y,60+k*160,'rgba(90,255,150,'+(.55*fade)+')');
    for(let r=0;r<12;r++){const a=r/12*6.283+.26,R0=fa*420,R1=R0+90+fa*160;cx.strokeStyle='rgba(180,255,210,'+fade+')';cx.lineWidth=5*(1-k)+1;cx.beginPath();cx.moveTo(X+Math.cos(a)*R0,Y+Math.sin(a)*R0);cx.lineTo(X+Math.cos(a)*R1,Y+Math.sin(a)*R1);cx.stroke()}
    for(const[sp,lw]of[[760,12],[480,6]]){const R=fa*sp;cx.strokeStyle='rgba(90,255,150,'+(.8*fade)+')';cx.lineWidth=lw*(1-k)+1;cx.beginPath();cx.arc(X,Y,R,0,6.283);cx.stroke()}
    const wv=26*Math.max(0,1-fa/.5);if(wv>0){cx.fillStyle='rgba(60,255,130,'+(.5*(1-fa/.5))+')';cx.fillRect(X-wv/2,0,wv,h);cx.fillStyle='rgba(255,255,255,'+(1-fa/.5)+')';cx.fillRect(X-wv*.16,0,wv*.32,h)}   // the judgement line splits the screen
    cx.globalCompositeOperation='source-over';cx.textAlign='center';cx.textBaseline='middle';
    const zk=fa<.15?1.5-fa/.15*.5:1,ta2=Math.max(0,Math.min(1,fa/.08))*Math.max(0,1-(fa-.8)/.4);
    if(ta2>0){cx.save();cx.globalAlpha=ta2*.28;cx.fillStyle='#6fffa0';cx.font='bold '+(h*.62|0)+'px serif';cx.fillText('\u65ac',w/2,h/2);cx.restore();
     cx.save();cx.globalAlpha=ta2;cx.translate(w/2,h*.24);cx.scale(zk,zk);cx.font='bold '+(h*.075|0)+'px Georgia';try{cx.letterSpacing=(h*.012|0)+'px'}catch(e){}
     cx.shadowColor='#2f8';cx.shadowBlur=26;cx.fillStyle='#eafff0';cx.fillText('JUDGEMENT CUT',0,0);cx.shadowBlur=0;cx.strokeStyle='#2fe07a';cx.lineWidth=1.5;cx.strokeText('JUDGEMENT CUT',0,0);cx.restore()}}
   cx.restore()}};
 {const _dfx7=drawFx;drawFx=function(ox,oy,L){jcO=[ox,oy];return _dfx7.apply(this,arguments)}}
 {const _bh7=bossHud;bossHud=function(){_bh7.apply(this,arguments);try{if(JC.length)drawJC()}catch(e){cx.restore&&0}}}

 // Odachi stage multiplier applied INSIDE the hit, so the numbers shown (and boss damage) are real: I x1.1 II x1.2 III x1.3 IV x1.45 then x2 crit
 const CM=()=>2+((meta.up.critd|0)*.12)+enc('critd');   // crit damage = x2 + Ruthlessness (echo upgrade, +12% each)
 let inOd=0;
 const odW=f=>function(e){
  if(inOd||!P||!P.weapon||P.weapon.kind!=='odachi'||!e||e.tdummy||e.tpoke)return f.apply(this,arguments);
  const w=P.weapon,d0=w.dmg,st=P.odN||1,U=meta.up,c0=U.crit,ck=(w.ench||[]).filter(b=>b.k==='crit'||b.k==='critr');inOd=1;w.dmg=d0*[1,1.1,1.2,1.3,1.45*CM(),1][st];
  if(st===4){U.crit=0;ck.forEach(b=>b.k+='_')}   // stage IV is already a guaranteed crit: no second random crit on top
  try{return f.apply(this,arguments)}finally{w.dmg=d0;inOd=0;if(st===4){U.crit=c0;ck.forEach(b=>b.k=b.k.replace(/_$/,''))}}};

 // ---- Passives ----
 const lsPct=w=>.01+.0075*((w&&w.rar)|0);                      // Common 1% ... Legendary 4% of max HP per hit
 const PASS={
  sword:['Balanced','Each hit restores 2 stamina and calms 4 posture'],
  dagger:['Flurry','Hits within 1.5s of each other stack +8% damage (max 5 stacks, +32%)'],
  greatsword:['Cleave','Hits also strike nearby enemies for 20% damage'],
  spear:['Pierce','Thrusts pierce through every enemy in a line'],
  hammer:['Crushing','+25% posture damage'],
  scimitar:['Twin Strike','20% chance to strike again for 50% damage'],
  katana:['Precision','15% chance to crit (x2 damage)'],
  axe:['Sunder','+15% damage to enemies below 50% HP'],
  odachi:['Gale Rhythm','5-stage M1 combo (resets after 0.6s without a hit): I +10% dmg \u00b7 II +20%, 3 stamina & heal 5% max HP \u00b7 III +30% & cleave \u00b7 IV +45%, GUARANTEED CRIT (crit damage: x2 + Ruthlessness) & posture break \u00b7 V Judgement Cut: 8 slashes, EVERY slash crits (x2 + Ruthlessness) for a 600%+ damage burst and heavy posture damage (bosses nearly break)'],
  icescythe:['Shatter','Strikes chill and slow. Chilled foes take +25% damage; the 3rd chill SHATTERS them: 150% burst damage, 70% to nearby foes, bosses lose heavy posture.'],
  scythe:['Soul Harvest',w=>'Lifesteal: heal '+(Math.round(lsPct(w)*1000)/10)+'% of max HP per hit']};
 const passTxt=w=>{const p=w&&PASS[w.kind];if(!p)return'';return p[0]+': '+(typeof p[1]==='function'?p[1](w):p[1])};
 window.weaponPassive=passTxt;

 // extra damage that never kills Poke by itself (he is only finished by the Enuma Elish parry)
 const extra=(o,v)=>{if(o.tpoke)o.hp=Math.max(2,o.hp-v);else o.hp-=v};
 function proc(e,d){const k=P.weapon.kind,mx=e.x+(e.w||14)/2,my=e.y+(e.h||22)/2;
  if(k==='sword'){P.stam=Math.min(maxStam(),P.stam+2);P.post=Math.max(0,P.post-4);burst(P.x+6,P.y+4,2,'#9fe')}
  else if(k==='dagger'){P.dgS=(time-(P.dgT||-9)<1.5)?Math.min(5,(P.dgS||0)+1):1;P.dgT=time;if(P.dgS>1){extra(e,d*.08*(P.dgS-1));if(P.dgS>=3)float(e.x,e.y-26,'FLURRY x'+P.dgS,'#9ef');burst(mx,my,3+P.dgS,'#cfe')}}
  else if(k==='greatsword'){for(const o of enemies){if(o===e||o.dead||o.boss||o.tdummy||o.tpoke)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<46){o.hp=Math.max(1,o.hp-d*.2);burst(o.x+7,o.y+8,5,'#fa6');float(o.x,o.y-10,'CLEAVE','#fa6')}}}
  else if(k==='hammer'){if(!e.tpoke&&!e.tdummy)e.post=(e.post||0)+14*WK.hammer.pd*.25;float(e.x,e.y-24,'CRUSH','#ccd');burst(mx,my,4,'#bbb')}
  else if(k==='scimitar'){if(Math.random()<.2){extra(e,d*.5);float(e.x,e.y-24,'TWIN','#fd8');burst(mx,my,6,'#fd8')}}
  else if(k==='katana'){if(Math.random()<.15){extra(e,d);float(e.x,e.y-24,'CRIT x2','#ffb347');burst(mx,my,8,'#fff')}}
  else if(k==='axe'){if(e.hp>0&&e.hp<e.max*.5){extra(e,d*.15);float(e.x,e.y-24,'SUNDER','#f88')}}
  else if(k==='odachi'){
   // combo state lives in P.odS / P.odT / P.odSw (NOT P.gT -- the Ghost talent uses that as an invulnerability timer).
   // Real enemies/bosses already took the stage multiplier (+10/20/30/45%, x2 crit on IV) inside the hit (see odW below);
   // the tutorial dummy and Poke never go through it, so they get the same bonus as extra damage here.
   if(P.odSw!==P.swId){P.odSw=P.swId;P.odS=P.odN||1}
   P.odT=time;const s=P.odS,RN=['','I','II','III','IV','V'],B=[0,.1,.2,.3,.45,0][s],real=!(e.tpoke||e.tdummy);
   if(!real&&B)extra(e,d*B);
   if(s<5){float(e.x,e.y-24-s*2,'GALE '+RN[s],'#7aff9a');burst(mx,my,3+s*2,s>=4?'#dfd':'#5aff8a')}
   if(s===2){P.stam=Math.min(maxStam(),P.stam+3);const h=Math.max(1,Math.round(maxHp()*.05));if(P.hp<maxHp()){P.hp=Math.min(maxHp(),P.hp+h);float(P.x,P.y-12,'+'+h,'#6aff9a')}}
   if(s===3){for(const o of enemies){if(o===e||o.dead||o.boss||o.tdummy||o.tpoke)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<60){o.hp=Math.max(1,o.hp-d*.4);burst(o.x+7,o.y+8,6,'#bfd')}}}
   if(s===4){if(!real)extra(e,d*(1+B)*(CM()-1));float(e.x,e.y-40,'CRIT \u00d7'+CM().toFixed(2).replace(/0$/,''),'#ffb347');burst(mx,my,14,'#fff');burst(mx,my,8,'#ffb347');shake=Math.max(shake,5);hitstop=Math.max(hitstop||0,.05);if(!e.tpoke&&!e.tdummy)e.post=(e.post||0)+12}
   if(s===5)judgementCut(e,d,mx,my)}
  else if(k==='icescythe'){e.slow=2;e.chill=(e.chill||0)+1;burst(mx,my,6,'#8ef');
   if(e.chill>1)extra(e,d*.25);
   if(e.chill>=3){e.chill=0;extra(e,d*1.5);if(e.boss)e.post=(e.post||0)+55;else if(!e.tpoke&&!e.tdummy){e.st='stagger';e.t=.8;e.vx=0}
    burst(mx,my,34,'#dff');burst(mx,my,16,'#8ef');for(let i=0;i<10;i++){const a=i/10*6.283;parts.push({x:mx,y:my,vx:Math.cos(a)*120,vy:Math.sin(a)*120-20,l:.5,c:'#eaffff'})}
    float(e.x,e.y-28,'SHATTER','#bff');shake=Math.max(shake,4);tone(2600,500,.3,'triangle',.09);
    for(const o of enemies){if(o===e||o.dead||o.boss||o.tdummy||o.tpoke)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<80){o.hp=Math.max(1,o.hp-d*.7);o.slow=2;burst(o.x+7,o.y+8,8,'#bff');float(o.x,o.y-10,'SHATTER','#bff')}}}}
  else if(k==='scythe'){const h=Math.max(1,Math.round(maxHp()*lsPct(P.weapon)));if(P.hp<maxHp()){P.hp=Math.min(maxHp(),P.hp+h);float(P.x,P.y-12,'+'+h,'#ff6a9a')}
   for(let i=0;i<6;i++)parts.push({x:mx,y:my,vx:(P.x+6-mx)*1.4+(Math.random()-.5)*30,vy:(P.y+8-my)*1.4-20,l:.45,c:i%2?'#ff6a9a':'#d8a0ff'})}}

 // normal enemies and bosses: wfx runs inside hitEnemy / hitBoss
 const _wfx=wfx;
 wfx=function(e,d){_wfx(e,d);if(!P||!P.weapon||e.tdummy||e.tpoke)return;proc(e,d)};

 // tutorial dummy and Poke are handled by patch4 and never reach wfx, so run the passive here
 const pokeOK=e=>e.act&&!e.res&&!e.fin&&!e.alm&&e.st!=='enter'&&e.st!=='wait';
 const _he7=hitEnemy;
 hitEnemy=function(e){_he7(e);if(P&&P.weapon&&e&&(e.tdummy||(e.tpoke&&pokeOK(e))))proc(e,Math.round(dmgOut()*(P.combo===2?1.3:1)))};
 hitEnemy=odW(hitEnemy);hitBoss=odW(hitBoss);

 // ---- show passives on the HUD and the character sheet ----
 const _hud7=hud;hud=function(){_hud7();const w=document.getElementById('hWpn');if(w&&P&&P.weapon){const p=PASS[P.weapon.kind];if(p&&w.textContent.indexOf('✦ '+p[0])<0)w.textContent+=' · ✦ '+p[0]}};
 const _ds7=drawSheet;
 drawSheet=function(){_ds7();const hrs=sheet.querySelectorAll('hr');
  if(hrs[2]&&P&&P.weapon)hrs[2].insertAdjacentHTML('beforebegin','<div style="color:#9fe;font-size:12px;margin-top:6px">✦ '+passTxt(P.weapon)+'</div>');
  sheet.querySelectorAll('[data-e]').forEach(b=>{const it=inv[+b.dataset.e],row=b.closest('.row');if(it&&row&&row.firstElementChild)row.firstElementChild.insertAdjacentHTML('beforeend','<br><small style="color:#9fe">✦ '+passTxt(it)+'</small>')})};
})();
