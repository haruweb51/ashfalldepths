'use strict';
// ===== Ashfall Depths: lean vertical slice =====
const T=16,W=240,H=138,SAVEKEY='ashfall_save_v3',VER=3,METAKEY='ashfall_meta_v1';
// ---- Layers: surface + 4 stacked biome layers (Ember > Glacial > Tempest > Hollow), each boss arena at the far east end ----
const MAXL=2,NL=4,LAYER_H=22,ybF=n=>24+LAYER_H*n,LN=['Surface','Ember','Glacial','Tempest','Hollow'];
const layerAt=ty=>ty<ybF(1)?0:Math.min(NL,((ty-24)/LAYER_H)|0);
const cv=document.getElementById('c'),cx=cv.getContext('2d');
function resize(){cv.width=innerWidth/2|0;cv.height=innerHeight/2|0;cx.imageSmoothingEnabled=false}
addEventListener('resize',resize);resize();

// ---- Audio (synth) ----
const Audio_={ac:null,mute:false,
 beep(f,d,type='square',v=.06){if(this.mute)return;try{this.ac=this.ac||new AudioContext();const o=this.ac.createOscillator(),g=this.ac.createGain();
  o.type=type;o.frequency.value=f;g.gain.value=v;g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+d);
  o.connect(g).connect(this.ac.destination);o.start();o.stop(this.ac.currentTime+d)}catch(e){}}};
const sfx={swing:()=>Audio_.beep(300,.08,'sawtooth'),hit:()=>Audio_.beep(120,.1),block:()=>Audio_.beep(200,.1,'triangle'),
 parry:()=>{Audio_.beep(1200,.15,'sine',.1);Audio_.beep(1800,.1,'sine',.08)},guard:()=>Audio_.beep(80,.4,'sawtooth',.1),
 loot:()=>Audio_.beep(800,.1,'sine'),level:()=>{[500,700,900].forEach((f,i)=>setTimeout(()=>Audio_.beep(f,.2,'sine'),i*90))},dodge:()=>Audio_.beep(500,.06,'triangle')};

// ---- Meta progression (echoes) ----
const UPG=[['vit','Vitality','+10 max HP',10,20],['end','Endurance','+8 max stamina',10,20],['might','Might','+4% damage',10,30],['ward','Warding','+0.015s parry window',5,40],['pts','Insight','+1 starting attribute point',5,50],['gold','Plunder','+30 starting gold',6,15],['xp','Scholar','+10% XP gained',8,35]];
const U0={vit:0,end:0,might:0,ward:0,pts:0,gold:0,xp:0};
let meta=(()=>{try{const m=JSON.parse(localStorage.getItem(METAKEY));if(m)return{echoes:m.echoes|0,up:Object.assign({},U0,m.up)}}catch(e){}return{echoes:0,up:Object.assign({},U0)}})();
const saveMeta=()=>{try{localStorage.setItem(METAKEY,JSON.stringify(meta))}catch(e){}};
const upCost=u=>Math.round(u[4]*(1+meta.up[u[0]]*.8));
let over=0,seen=new Uint8Array(W*H);
// ---- Seeded RNG & world ----
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let tiles=new Uint8Array(W*H),seed=1,mods={};
// 0 air,1 grass,2 dirt,3 stone,4 crystal(resource)
function gen(sd){seed=sd;const r=rng(sd);tiles=new Uint8Array(W*H);const ph=[r()*6,r()*6,r()*6];
 const hs=x=>Math.floor(24-peak(x)+Math.sin(x*.05+ph[0])*5+Math.sin(x*.13+ph[1])*3),SYc=hs(W>>1);
 for(let x=0;x<W;x++){const d0=Math.abs(x-(W>>1)),k=d0<=11?1:d0>=22?0:1-(d0-11)/11,sm=k*k*(3-2*k),sh=Math.round(hs(x)*(1-sm)+SYc*sm);
  for(let y=sh;y<H;y++)tiles[y*W+x]=y===sh?1:y<sh+6?2:3;}
 for(let i=0;i<(90*H/130|0);i++){let x=r()*W|0,y=34+r()*(H-50)|0,a=r()*6.28;for(let k=0;k<90;k++){a+=(r()-.5)*.9;x+=Math.cos(a)*1.4;y+=Math.sin(a)*.8;
  for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++){const tx=x+dx|0,ty=y+dy|0;if(tx>1&&tx<W-2&&ty>30&&ty<H-2)tiles[ty*W+tx]=0}}}
 for(let i=0;i<(460*H/130|0);i++){const x=r()*W|0,y=32+r()*(H-40)|0;if(tiles[y*W+x]===3)tiles[y*W+x]=4}
 for(let x=0;x<W;x++){tiles[(H-1)*W+x]=3;}for(let y=0;y<H;y++){tiles[y*W]=3;tiles[y*W+W-1]=3}
 for(let i=0;i<8;i++){const sx0=14+r()*(W-28)|0;if(Math.abs(sx0-(W>>1))<12)continue;let s0=0;while(s0<H&&!tiles[s0*W+sx0])s0++;
  const dep=Math.max(6,Math.min(14+r()*16|0,41-s0));for(let k=0;k<dep;k++){for(let dx=-2;dx<2;dx++)tiles[(s0+k)*W+sx0+dx]=0;tiles[(s0+k)*W+sx0+2]=6}
  for(let k=5;k<dep;k+=4){const sd=(k/4|0)%2?-2:0;for(let dx=0;dx<2;dx++)tiles[(s0+k)*W+sx0+sd+dx]=3}
  const ey=s0+dep;for(let dx=-8;dx<=8;dx++)for(let dy=-4;dy<=3;dy++)if(dx*dx/64+dy*dy/16<=1){const tx=sx0+dx,ty=ey+dy;if(tx>1&&tx<W-2&&ty<H-2)tiles[ty*W+tx]=0}
  for(let dx=3;dx<=6;dx++){tiles[(ey-1)*W+sx0+dx]=3;tiles[(ey-1)*W+sx0-dx]=3}
  for(const dx of[-4,0,4])if(tiles[(ey+3)*W+sx0+dx])tiles[(ey+3)*W+sx0+dx]=4}
 carveWorld(r);deepWorks(r);
 // safe spawn clearing
 const sx=W>>1;let sy=0;while(!tiles[sy*W+sx])sy++;for(let dx=-3;dx<=3;dx++)for(let dy=1;dy<=4;dy++)tiles[(sy-dy)*W+sx+dx]=0;
 return{x:sx*T,y:(sy-1)*T}}
const solid=(tx,ty)=>tx<0||ty<0||tx>=W||ty>=H?true:tiles[ty*W+tx]>0&&tiles[ty*W+tx]!==5&&tiles[ty*W+tx]!==6;
function deepWorks(r){const yb=ybF,NM=NL;GATES=[];ARCHES=[];
 // lava pools only in the Ember layer
 for(let i=0;i<110;i++){const x=4+r()*(W-8)|0,y=yb(1)+3+r()*(LAYER_H-8)|0,n=2+r()*5|0;
  for(let k=0,xx=x;k<n&&xx<W-3&&!tiles[y*W+xx]&&tiles[(y+1)*W+xx]===3&&!inAB(xx,y,2);k++,xx++)tiles[y*W+xx]=5}
 // unbreakable strata seal every layer, plus the bottom of the world
 for(let n=1;n<=NM+1;n++)for(let k=0;k<2;k++)for(let x=1;x<W-1;x++)if(!inAB(x,yb(n)+k,1))tiles[(yb(n)+k)*W+x]=7;
 for(const a of ARENAS)for(let x=a.cx-a.hw-3;x<=a.cx+a.hw+3;x++){tiles[a.fy*W+x]=7;tiles[(a.fy+1)*W+x]=7}
 const gx=[];let px=120;for(let n=1;n<=NM+1;n++){let x;do x=100+r()*40|0;while(Math.abs(x-px)<16);gx[n]=px=x}
 const cv_=(x0,x1,y0,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tiles[y*W+x]=0},fl=(x0,x1,y)=>{for(let x=x0;x<=x1;x++)if(!tiles[y*W+x])tiles[y*W+x]=3};
 // gate n leads down into layer n; the last chamber (n=NM+1) is a dead end at the bottom of the final layer that leads to its boss
 for(let n=1;n<=NM+1;n++){const b=yb(n),x=gx[n],term=n>NM;let top;
  cv_(x-4,x+4,b-5,b-1);
  if(!term){cv_(x-2,x+2,b,b+1);cv_(x-4,x+4,b+2,b+6);fl(x-4,x+4,b+7)}
  if(n===1){let s0=0;while(s0<H&&!tiles[s0*W+x])s0++;top=s0;cv_(x-1,x+1,s0,b-6)}
  else{const pb=yb(n-1),x0=gx[n-1];top=pb+3;cv_(Math.min(x,x0)-1,Math.max(x,x0)+1,pb+3,pb+6);fl(Math.min(x,x0)-1,Math.max(x,x0)+1,pb+7);cv_(x-1,x+1,pb+7,b-6)}
  for(let y=top;y<=(term?b-1:b+5);y++)tiles[y*W+x]=6;
  if(!term)GATES.push({x,y:b,n});
  // boss arena of layer n-1 sits at the far east end, reached by a long corridor from this chamber
  const a=ARENAS.find(a=>a.g===n);if(a){const x0=a.cx-a.hw;cv_(x+5,x0,a.fy-4,a.fy-1);fl(x+5,x0,a.fy);ARCHES.push({x:x0-2,y:a.fy,id:a.id})}}}
function setTile(tx,ty,v){tiles[ty*W+tx]=v;mods[tx+','+ty]=v}

// ---- Entity physics ----
function move(e,dt){e.onGround=false;if(!e.climb)e.vy=Math.min(e.vy+1500*dt,700);
 e.x+=e.vx*dt;e.hitWall=false;
 let x0=Math.floor(e.x/T),x1=Math.floor((e.x+e.w-.01)/T),y0=Math.floor(e.y/T),y1=Math.floor((e.y+e.h-.01)/T);
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)if(solid(tx,ty)){e.hitWall=true;
  if(e.vx>0)e.x=tx*T-e.w-.01;else if(e.vx<0)e.x=(tx+1)*T;e.vx=0;
  x0=Math.floor(e.x/T);x1=Math.floor((e.x+e.w-.01)/T)}
 e.y+=e.vy*dt;
 x0=Math.floor(e.x/T);x1=Math.floor((e.x+e.w-.01)/T);y0=Math.floor(e.y/T);y1=Math.floor((e.y+e.h-.01)/T);
 for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)if(solid(tx,ty)){
  if(e.vy>0){e.y=ty*T-e.h-.01;e.onGround=true}else if(e.vy<0)e.y=(ty+1)*T;e.vy=0;
  y0=Math.floor(e.y/T);y1=Math.floor((e.y+e.h-.01)/T)}}

// ---- Items ----
const RAR=[['Common','#bbb',1],['Uncommon','#5c5','1.15'],['Rare','#58f',1.3],['Epic','#b4f',1.5],['Legendary','#fa3',1.8]];
let uid=1;
const FR=(x,y,w,h,c)=>{cx.fillStyle=c;cx.fillRect(x,y,w,h)};
const PL=(pts,c)=>{cx.fillStyle=c;cx.beginPath();cx.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)cx.lineTo(pts[i],pts[i+1]);cx.fill()};
const WK={
 sword:{reach:24,dur:.36,pd:1,dm:1,col:['#ff7a1a66','#ffd36baa','#fff'],names:['Iron Sword','Cinder Blade','Ash Sword'],draw(){FR(4,-1,4,3,'#6a4a2a');FR(7,-3,2,7,'#d9a441');FR(9,-1,15,2,'#d9e4ff');FR(9,-1,15,1,'#fff')}},
 dagger:{reach:14,dur:.22,pd:.6,dm:.6,col:['#9cf6','#cdfa','#fff'],names:['Ash Dagger','Stiletto'],draw(){FR(2,-1,3,3,'#4a3a2a');FR(4,-3,2,7,'#aaa');FR(6,-1,10,2,'#cfe');PL([16,-1,19,0,16,1],'#fff')}},
 greatsword:{reach:36,dur:.55,pd:1.6,dm:1.7,col:['#ff3a1a55','#ff9a3aaa','#ffe'],names:['Greatsword','Executioner'],draw(){FR(0,-1,6,3,'#5a3a2a');FR(5,-6,3,12,'#b8862b');FR(8,-3,22,6,'#9fb2d8');FR(8,-1,22,2,'#e8f0ff');FR(9,0,19,1,'#5a6a8a');PL([30,-3,38,0,30,3],'#e8f0ff')}},
 spear:{thrust:1,reach:38,dur:.42,pd:1,dm:1.1,col:['#8f86','#cfc9','#fff'],names:['Ash Spear','Pike'],draw(){FR(-6,-1,34,2,'#7a5a32');PL([26,-4,38,0,26,4],'#dfe8f0');FR(24,-2,2,4,'#c33');FR(20,-1,3,2,'#c33')}},
 hammer:{reach:26,dur:.6,pd:2.4,dm:1.5,col:['#aaa6','#ddd9','#fff'],names:['War Hammer','Maul'],draw(){FR(2,-1,20,2,'#6a4a2a');FR(20,-7,11,14,'#555a68');FR(20,-7,11,3,'#8a90a0');FR(20,4,11,3,'#3a3e4a');FR(30,-5,2,10,'#aab')}},
 scimitar:{reach:26,dur:.32,pd:.9,dm:.95,col:['#f4a6','#fd8a','#fff'],names:['Scimitar','Sand Blade'],draw(){FR(2,-1,5,3,'#6a2a2a');FR(6,-3,2,7,'#d9a441');cx.fillStyle='#cfe4ff';cx.beginPath();cx.moveTo(8,-1);cx.quadraticCurveTo(22,-9,29,3);cx.quadraticCurveTo(18,-3,8,1);cx.fill()}},
 katana:{reach:30,dur:.3,pd:.8,dm:1.05,col:['#f8f6','#fcfa','#fff'],names:['Katana','Night Edge'],draw(){FR(0,-1,8,3,'#222');FR(2,-1,1,3,'#a33');FR(5,-1,1,3,'#a33');FR(8,-3,2,7,'#d9a441');FR(10,-1,20,2,'#e6eeff');FR(10,0,20,1,'#fff')}},
 axe:{reach:24,dur:.46,pd:1.4,dm:1.4,col:['#f446','#f99a','#fff'],names:['Battle Axe','Cleaver'],draw(){FR(0,-1,20,2,'#6a4a2a');cx.fillStyle='#9aa3b5';cx.beginPath();cx.moveTo(16,-1);cx.lineTo(21,-9);cx.quadraticCurveTo(29,0,21,9);cx.lineTo(16,1);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=1;cx.beginPath();cx.moveTo(21,-9);cx.quadraticCurveTo(29,0,21,9);cx.stroke()}}};
const KINDS=Object.keys(WK),wd=()=>WK[P.weapon.kind]||WK.sword;
function rollWeapon(lvl,rarIdx,R=Math.random){const ri=rarIdx??(()=>{const q=R();return q<.6?0:q<.85?1:q<.95?2:q<.99?3:4})();
 const k=KINDS[R()*KINDS.length|0],K=WK[k],nm=K.names[R()*K.names.length|0];
 return{id:uid++,type:'weapon',kind:k,name:RAR[ri][0]+' '+nm,rar:ri,dmg:Math.round((8+lvl*1.5)*RAR[ri][2]*K.dm),speed:1}}
const SLOTS=['head','neck','arms','legs'];
const PRICE_MULT=2.5;
const ACC=[['iron_crown','head','Iron Crown',0,40,{hp:15,post:8}],['hunter_band','head',"Hunter's Headband",0,35,{spd:6,stam:8}],['focus_circlet','head','Circlet of Focus',1,90,{dmg:.06}],
['warden_helm','head',"Warden's Helm",1,100,{hp:25,post:12}],['ember_mask','head','Ember Mask',2,220,{dmg:.1,hp:20}],['fallen_crown','head','Crown of the Fallen',3,0,{hp:45,dmg:.12}],['ash_halo','head','Halo of Ash',4,0,{hp:60,dmg:.15,post:20}],
['bone_charm','neck','Bone Charm',0,35,{stam:10}],['ember_amulet','neck','Amulet of Embers',1,110,{dmg:.1}],['void_pendant','neck','Void Pendant',2,240,{dmg:.1,parry:.04}],['life_talisman','neck','Lifewarden Talisman',2,230,{hp:40}],
['mountain_heart','neck','Heart of the Mountain',3,0,{hp:50,post:15}],['eclipse_amulet','neck','Eclipse Amulet',4,0,{dmg:.18,regen:.25}],
['leather_bracers','arms','Leather Bracers',0,40,{pdmg:.1}],['duelist_bracers','arms',"Duelist's Bracers",1,100,{atkc:.25}],['parry_vambraces','arms','Parrying Vambraces',1,105,{parry:.05}],
['storm_gauntlets','arms','Stormforged Gauntlets',2,250,{dmg:.1,atkc:.15}],['titan_grips','arms',"Titan's Grips",3,0,{pdmg:.3,dmg:.08}],['warbreaker','arms','Warbreaker Gauntlets',4,0,{dmg:.2,pdmg:.25,atkc:.2}],
['trav_boots','legs',"Traveler's Boots",0,40,{spd:10}],['windrunner','legs','Windrunner Boots',1,120,{spd:14,air:.4}],['spring_greaves','legs','Springheel Greaves',2,240,{jump:.06,air:.3}],
['blood_greaves','legs','Bloodbound Greaves',2,260,{dodge:.35,hp:-15}],['phantom_treads','legs','Phantom Treads',3,0,{spd:18,dodge:.2,jump:.08}],['storm_greaves','legs','Stormstrider Greaves',4,0,{spd:24,jump:.1,air:.6,stam:15}],
['scout_hood','head','Scout Hood',0,60,{spd:8,stam:6}],['bronze_helm','head','Bronze Helm',1,140,{hp:30,post:10}],['berserker_horns','head','Berserker Horns',2,300,{dmg:.12,hp:-10}],['glacier_tiara','head','Glacier Tiara',2,320,{stam:25,regen:.15}],['stormcaller_crown','head','Stormcaller Crown',3,880,{dmg:.1,atkc:.15,stam:15}],['phoenix_circlet','head','Phoenix Circlet',4,0,{hp:70,dmg:.12,regen:.3}],
['rope_charm','neck','Frayed Rope Charm',0,50,{hp:10,stam:5}],['wolf_fang','neck','Wolf Fang Necklace',1,130,{dmg:.06,spd:6}],['frost_locket','neck','Frozen Locket',2,290,{parry:.03,post:15}],['tempest_pendant','neck','Tempest Pendant',2,310,{atkc:.2,stam:12}],['bloodstone','neck','Bloodstone Choker',3,850,{dmg:.14,hp:-20,regen:.2}],['worldheart','neck','Worldheart Locket',4,0,{hp:80,post:25,parry:.04}],
['padded_wraps','arms','Padded Wraps',0,45,{pdmg:.08,stam:6}],['iron_gauntlets','arms','Iron Gauntlets',1,135,{post:12,pdmg:.1}],['ember_bracers','arms','Emberforged Bracers',2,295,{dmg:.1,pdmg:.1}],['reflex_bands','arms','Reflex Bands',2,305,{parry:.05,atkc:.1}],['sunder_fists','arms','Sundering Fists',3,880,{pdmg:.25,dmg:.1,hp:-10}],['kings_fists','arms',"King's Fists",4,0,{dmg:.15,pdmg:.2,parry:.06}],
['padded_greaves','legs','Padded Greaves',0,45,{hp:10,spd:4}],['hunter_boots','legs',"Hunter's Boots",1,140,{spd:12,stam:10}],['frostwalkers','legs','Frostwalkers',2,300,{spd:10,dodge:.2,air:.2}],['skyleap','legs','Skyleap Sabatons',2,320,{jump:.07,air:.3,spd:6}],['voidstriders','legs','Voidstriders',3,900,{spd:16,dodge:.3,jump:.06,regen:.15}],['abyss_walkers','legs','Abyss Walkers',4,0,{spd:20,dodge:.4,air:.5,hp:30}]
].map(a=>({id:a[0],slot:a[1],name:a[2],rar:a[3],price:Math.round(a[4]*PRICE_MULT),fx:a[5]}));
const ACCB={};ACC.forEach(a=>ACCB[a.id]=a);
let accOwned=[],eq={},opened={},chests=[],SHOP=null,shopOpen=false,S={};
function recalc(){S={hp:0,stam:0,post:0,dmg:0,spd:0,jump:0,air:0,dodge:0,atkc:0,pdmg:0,parry:0,regen:0};
 for(const sl of SLOTS){const a=ACCB[eq[sl]];if(a)for(const k in a.fx)S[k]+=a.fx[k]}
 const U=meta.up;S.hp+=U.vit*10;S.stam+=U.end*8;S.dmg+=U.might*.04;S.parry+=U.ward*.015;
 S.jump=Math.min(S.jump,.15);S.air=Math.min(S.air,.6);S.dodge=Math.min(S.dodge,.5);S.atkc=Math.min(S.atkc,.5);
 if(typeof P!=='undefined'&&P){P.hp=Math.min(P.hp,maxHp());P.stam=Math.min(P.stam,maxStam())}}
const FXN={hp:'Max HP',stam:'Max Stamina',post:'Max Posture',dmg:'Damage',spd:'Move speed',jump:'Jump height',air:'Air control',dodge:'Dodge stamina cost',atkc:'Attack stamina cost',pdmg:'Posture damage',parry:'Parry window',regen:'Stamina regen'};
const NEG={dodge:1,atkc:1},PCT={dmg:1,jump:1,air:1,dodge:1,atkc:1,pdmg:1,regen:1};
const fxText=fx=>Object.keys(fx).map(k=>{const v=fx[k];return FXN[k]+' '+(NEG[k]?'-':v<0?'':'+')+(PCT[k]?Math.round(Math.abs(v)*100)+'%':k==='parry'?v+'s':v)}).join(', ');
const CH=[{n:'Wooden Chest',hp:30,g:12,w:.25,a:.1,minr:0,maxar:1,c1:'#7a4e2a',c2:'#96643a',c3:'#3a2a1a'},
{n:'Reinforced Chest',hp:80,g:30,w:.5,a:.3,minr:1,maxar:2,c1:'#55596a',c2:'#6d7288',c3:'#2a2c38'},
{n:'Ancient Chest',hp:140,g:60,w:.7,a:.5,minr:2,maxar:4,c1:'#2a5a5a',c2:'#3a7a7a',c3:'#d9a441'},
{n:'Cursed Chest',hp:100,g:70,w:.7,a:.5,minr:2,maxar:3,c1:'#3a1a4a',c2:'#5a2a6a',c3:'#c33'}];


// ---- State ----
let P,enemies=[],floats=[],parts=[],spawn,gold=0,inv=[],cam={x:0,y:0},shake=0,paused=true,sheetOpen=false,time=0,hitstop=0;
const keys={},mouse={x:0,y:0,l:false,r:false};
function newPlayer(){return{x:0,y:0,w:12,h:22,vx:0,vy:0,face:1,hp:100,stam:100,post:0,lvl:1,xp:0,pts:3+meta.up.pts,lives:MAXL,kills:0,maxLy:0,at:{str:1,agi:1,fort:1},
 el:3,ecd:0,air:1,atkC:false,coyote:0,jbuf:0,atk:0,atkPhase:0,atkHit:false,combo:0,blockT:-9,blocking:false,dodge:0,inv:0,stun:0,weapon:rollWeapon(1,0),guardBroken:0,onGround:false}}
const maxHp=()=>window.FISH?1:80+P.at.fort*20+S.hp,maxStam=()=>80+P.at.agi*10+S.stam,maxPost=()=>60+P.at.fort*8+P.at.str*4+S.post;
const dmgOut=()=>Math.round(P.weapon.dmg*(1+P.at.str*.08+S.dmg+enc('dmg'))*(window.dmgMult?window.dmgMult():1));
const xpNeed=l=>Math.round(40*Math.pow(l,1.45));
function toast(s){const t=document.getElementById('toast');t.textContent=s;clearTimeout(toast.h);toast.h=setTimeout(()=>t.textContent='',2200)}
function mkE(x,y,deep){return{x,y,w:14,h:22,vx:0,vy:0,hp:deep?55:35,max:deep?55:35,post:0,pmax:deep?50:30,st:'chase',t:0,face:1,lvl:deep?3:1,dead:false,hit:false,home:x}}
function shopPos(){const x=spawn.x+36;let ty=0;while(ty<H&&!solid(x/T|0,ty))ty++;return{x,y:ty*T}}
const nearShop=()=>SHOP&&Math.abs(P.x+6-SHOP.x)<36&&Math.abs(P.y+22-SHOP.y)<30;
function placeChests(){chests=[];SHOP=shopPos();QG=questPos();ENCP=enchPos();const r=rng(seed+99);let n=0,t=0;
 while(n<(60*H/130|0)&&t++<22000){const tx=8+r()*(W-16)|0,ty=24+r()*(H-32)|0;
  if(!solid(tx,ty)&&!solid(tx+1,ty)&&!solid(tx,ty-1)&&!solid(tx+1,ty-1)&&solid(tx,ty+1)&&solid(tx+1,ty+1)&&(tx*T<spawn.x-70||tx*T>spawn.x+200)&&!inAB(tx,ty,2)&&!chests.some(c=>Math.abs(c.tx-tx)<6&&Math.abs(c.ty-ty)<6)){
   const q=r(),deep=ty>45,type=deep?(q<.3?1:q<.55?2:q<.8?3:0):(q<.7?0:q<.9?1:3),k=tx+','+ty;
   chests.push({tx,ty,type,hp:CH[type].hp,max:CH[type].hp,flash:0,k});n++}}
 chests=chests.filter(c=>!opened[c.k]);for(const a of ARENAS)if(bossDead[a.id]&&!opened['cache'+a.id])addCache(a)}
function hitChest(c){c.hp-=dmgOut()*(P.weapon.kind==='hammer'||P.weapon.kind==='axe'?1.5:1);c.flash=.15;sfx.hit();burst(c.tx*T+16,c.ty*T+8,5,CH[c.type].c2);shake=Math.max(shake,1.5);if(c.hp<=0)openChest(c)}
function openChest(c){if(opened[c.k])return;opened[c.k]=1;qEv('chest');chests=chests.filter(x=>x!==c);
 const r=rng(seed*31+c.tx*131+c.ty*17+c.type),d=CH[c.type],lvl=1+Math.max(0,((c.ty-24)/22)|0)*2,m=[];
 const g=Math.round((d.g+r()*d.g)*(1+lvl*.3));gold+=g;m.push('+'+g+' gold');
 if(r()<d.w&&inv.length<20){const w=rollWeapon(lvl,Math.min(4,d.minr+(r()<.25?1:0)),r);inv.push(w);m.push(w.name)}
 if(r()<d.a){const pool=ACC.filter(a=>!accOwned.includes(a.id)&&a.rar<=d.maxar);if(pool.length){const a=pool[r()*pool.length|0];accOwned.push(a.id);m.push(a.name)}else{gold+=30;m.push('+30 gold')}}
 if(r()<.4){P.hp=Math.min(maxHp(),P.hp+25);m.push('+25 HP')}
 if(c.type===3){for(let k=0;k<2;k++)enemies.push(mkE(c.tx*T+(k?40:-30),c.ty*T-22,c.ty>45));m.push('CURSED! Enemies appear')}
 toast(m.join(' · '));sfx.loot();burst(c.tx*T+16,c.ty*T+8,22,CH[c.type].c3);burst(c.tx*T+16,c.ty*T+8,10,'#fd5');save()}
function djFx(){for(let i=0;i<10;i++){const a=i/10*6.283;parts.push({x:P.x+6,y:P.y+22,vx:Math.cos(a)*90,vy:Math.sin(a)*30,l:.35,c:'#bdf'})}Audio_.beep(700,.08,'sine',.07)}
function spawnEnemies(){enemies=[];const r=rng(seed+7);let n=0,tries=0;
 while(n<18&&tries++<9000){const tx=10+r()*(W-20)|0,ty=26+r()*18|0;
  if(!solid(tx,ty)&&!solid(tx,ty-1)&&solid(tx,ty+1)&&Math.abs(tx*T-spawn.x)>200&&bio(tx,ty)===0&&!inAB(tx,ty,2)){
   const deep=ty>45;enemies.push({x:tx*T,y:ty*T-22,w:14,h:22,vx:0,vy:0,hp:deep?55:35,max:deep?55:35,post:0,pmax:deep?50:30,st:'idle',t:0,face:1,
   lvl:deep?3:1,dead:false,hit:false,home:tx*T});n++}}biomeEnemies();mkBosses()}

// ---- Save ----
function save(){try{localStorage.setItem(SAVEKEY,JSON.stringify({v:VER,seed,mods,P:{lvl:P.lvl,xp:P.xp,pts:P.pts,at:P.at,weapon:P.weapon,hp:P.hp,lives:P.lives,kills:P.kills,maxLy:P.maxLy,el:P.el,ecd:P.ecd},gold,inv,spawn,uid,acc:accOwned,eq,opened,bd:bossDead,qs:QS,arm:armOwned,aeq:armEq}))}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(SAVEKEY));if(!d||d.v>VER||!d.P)return false;
 gen(d.seed);for(const k in d.mods){const[x,y]=k.split(',').map(Number);if(x>0&&y>0&&x<W&&y<H)setTile(x,y,d.mods[k])}
 P=newPlayer();Object.assign(P,d.P);P.lives=Math.max(1,Math.min(MAXL,P.lives|0));P.at=Object.assign({str:1,agi:1,fort:1},d.P.at);spawn=d.spawn;P.x=spawn.x;P.y=spawn.y;
 armOwned=d.arm||[];armEq=d.aeq||{};gold=d.gold|0;inv=d.inv||[];uid=d.uid||100;accOwned=d.acc||[];eq=d.eq||{};opened=d.opened||{};bossDead=d.bd||{};QS=(d.qs&&d.qs.slots&&d.qs.slots.length===3)?d.qs:newQS();applyGateLocks();recalc();placeChests();P.hp=maxHp();P.stam=maxStam();spawnEnemies();return true}catch(e){return false}}
function start(isNew){if(isNew){localStorage.removeItem(SAVEKEY);mods={};spawn=gen(Date.now()%100000);P=newPlayer();P.x=spawn.x;P.y=spawn.y;gold=meta.up.gold*30;inv=[];armOwned=[];armEq={};accOwned=[];eq={};opened={};bossDead={};QS=newQS();applyGateLocks();recalc();placeChests();P.hp=maxHp();P.stam=maxStam();spawnEnemies();save()}
 else if(!load()){return start(true)}
 seen=new Uint8Array(W*H);$('runInfo').textContent='';document.getElementById('menu').classList.add('hidden');paused=false}
btnNew.onclick=()=>{if(localStorage.getItem(SAVEKEY)&&!confirm('Delete existing save and start over?'))return;start(true)};
btnContinue.onclick=()=>start(false);
if(!localStorage.getItem(SAVEKEY))btnContinue.disabled=true;
setInterval(()=>{if(P&&!paused)save()},10000);

// ---- Input ----
addEventListener('keydown',e=>{if(e.repeat)return;keys[e.code]=true;
 if(e.code==='Space'){P&&(P.jbuf=.12);e.preventDefault()}
 if(e.code==='Escape'&&P){paused=!paused;if(!paused){sheetOpen=false;shopOpen=false;questOpen=false}sheet.classList.add('hidden');if(paused)toast('Paused (Esc to resume)')}
 if(e.code==='Tab'&&P){e.preventDefault();sheetOpen=!sheetOpen;shopOpen=false;questOpen=false;paused=sheetOpen;sheet.classList.toggle('hidden',!sheetOpen);if(sheetOpen)drawSheet()}
 if(e.code==='KeyM'){Audio_.mute=!Audio_.mute;toast(Audio_.mute?'Muted':'Sound on')}
 if((e.code==='ShiftLeft'||e.code==='ShiftRight')&&P&&!paused)tryDodge();
 if(e.code==='KeyE'&&P&&!paused){if(nearShop())openShop();else if(nearQuest())openQuests();else if(nearEnch())openEnch();else mine()}
 if(e.code==='KeyR'&&P&&!paused)useElixir();});
addEventListener('keyup',e=>keys[e.code]=false);
cv.addEventListener('mousemove',e=>{mouse.x=e.clientX/2;mouse.y=e.clientY/2});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('mousedown',e=>{if(!P||paused)return;if(e.button===0){mouse.l=true;tryAttack()}if(e.button===2){mouse.r=true;if(!P.blocking){if((P.pcd||0)<=0){P.blockT=time;P.pcd=1}else P.blockT=-9}P.blockAng=aimAng();}});
addEventListener('mouseup',e=>{if(e.button===0)mouse.l=false;if(e.button===2)mouse.r=false});

function tryDodge(){if(P.dodge>0||P.stam<22*(1-S.dodge)||P.stun>0)return;P.stam-=22*(1-S.dodge);P.dodge=.22;P.inv=.25;
 const d=(keys.KeyD||keys.ArrowRight)?1:(keys.KeyA||keys.ArrowLeft)?-1:-P.face;P.vx=d*320;P.vy=Math.min(P.vy,0);sfx.dodge();burst(P.x+6,P.y+11,4,'#9cf')}
const aimAng=()=>Math.atan2(mouse.y+cam.y-(P.y+11),mouse.x+cam.x-(P.x+6));
function tryAttack(){if(P.atk>0||P.stun>0||P.dodge>0||P.guardBroken>0||P.stam<10)return;P.stam-=10*(1-S.atkc);P.atk=wd().dur;P.atkHit=false;P.atkC=false;hitSet=new Set();P.aim=aimAng();P.face=Math.cos(P.aim)>=0?1:-1;P.combo=(P.combo+1)%3;sfx.swing()}
function mine(){const wx=mouse.x+cam.x,wy=mouse.y+cam.y,tx=wx/T|0,ty=wy/T|0;
 if(Math.hypot(wx-(P.x+6),wy-(P.y+11))>T*5||ty>=H-1||tx<=0||tx>=W-1)return;
 const t=tiles[ty*W+tx];if(!t)return;if(t===7){toast('The strata will not break \u00b7 find the gate');return}setTile(tx,ty,0);burst(tx*T+8,ty*T+8,6,t===4?'#6ff':'#a86');
 if(t===4){gold+=5;toast('+5 gold (crystal)');sfx.loot()}}

// ---- Effects ----
function burst(x,y,n,c){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*160,vy:-Math.random()*120,l:.4,c})}
function float(x,y,s,c='#fff'){floats.push({x,y,s,c,l:.8})}
function gainXp(n){P.xp+=Math.round(n*(1+meta.up.xp*.1));while(P.xp>=xpNeed(P.lvl)){P.xp-=xpNeed(P.lvl);P.lvl++;P.pts+=2;sfx.level();{const gl=P.lives<MAXL;P.lives=Math.min(MAXL,P.lives+1);toast('Level '+P.lvl+'! +2 points (Tab) \u00b7 +'+(3*P.lvl)+' echoes banked'+(gl?' · +1 life ♥':''))};P.hp=maxHp();save()}}
function dropLoot(e){if(e.el){gold+=25;if(inv.length<20){const w=rollWeapon(e.lvl+2,Math.min(4,2+(Math.random()<.3?1:0)));inv.push(w);toast('Elite drop: '+w.name)}if(Math.random()<.3){const pl=ACC.filter(a=>!accOwned.includes(a.id)&&a.rar<=3);if(pl.length){const a=pl[Math.random()*pl.length|0];accOwned.push(a.id);toast('Elite drop: '+a.name)}}}const g=3+e.lvl*3+Math.random()*4|0;gold+=g;float(e.x,e.y-8,'+'+g+'g','#fd5');
 if(Math.random()<.18+e.lvl*.04&&inv.length<20){const w=rollWeapon(e.lvl);inv.push(w);toast('Loot: '+w.name);sfx.loot()}}

// ---- Damage to player ----
function hurtPlayer(dmg,pdmg,from,breakable){
 if(P.inv>0){float(P.x,P.y-6,'dodge','#9cf');return 'dodge'}
 if(P.blocking&&P.guardBroken<=0&&(from.x<P.x?-1:1)!==-P.face*-1&&false){}
 let da=Math.atan2(from.y+from.h/2-(P.y+11),from.x+from.w/2-(P.x+6))-(P.blockAng||0);da=Math.atan2(Math.sin(da),Math.cos(da));const facing=Math.abs(da)<1.3;
 if(P.blocking&&facing&&P.guardBroken<=0){
  if(time-P.blockT<=.2+S.parry){sfx.parry();burst(P.x+6+P.face*10,P.y+8,12,'#fff');shake=4;hitstop=.08;float(P.x,P.y-12,'PARRY','#ffd');P.pcd=0;
   from.post+=25;from.stun=.8;from.st='stagger';from.t=.8;P.stam=Math.min(maxStam(),P.stam+15);qEv('parry');return 'parry'}
  sfx.block();P.stam-=dmg*.6;P.post+=pdmg;P.hp-=dmg*.15;float(P.x,P.y-6,'block','#aaa');P.vx=-from.face*-60*(-1);
  if(P.stam<=0||P.post>=maxPost()){P.guardBroken=1.6;P.post=0;P.stam=0;sfx.guard();shake=6;toast('GUARD BROKEN');}
  return 'block'}
 P.hp-=dmg;if((P.ifcd||0)<=0){P.inv=.5;P.ifcd=1}P.stun=.25;P.vx=(P.x<from.x?-1:1)*140;P.vy=-120;shake=5;sfx.hit();burst(P.x+6,P.y+10,8,'#f55');float(P.x,P.y-6,'-'+Math.round(dmg),'#f66');
 if(P.hp<=0)die();return 'hit'}
function die(){if(P.dead)return;if(--P.lives<=0){P.dead=1;over=1;paused=true;sfx.guard();toast('YOU HAVE FALLEN');return}resetBosses();const lost=Math.floor(gold*.2);gold-=lost;toast('You died · '+P.lives+'/'+MAXL+' lives left · lost '+lost+' gold');P.hp=maxHp();P.stam=maxStam();P.post=0;P.x=spawn.x;P.y=spawn.y;P.vx=P.vy=0;P.inv=2.5;P.stun=0;P.guardBroken=0;save()}

// ---- Enemy AI (Cave Stalker) ----
function updEnemy(e,dt){if(e.dead)return;e.t-=dt;e.stun=Math.max(0,(e.stun||0)-dt);if(e.kb>0){e.kb-=dt;e.kbv*=Math.pow(.03,dt);e.vx=e.kbv;move(e,dt);return}
 const dx=P.x-e.x,dist=Math.abs(dx),sees=dist<200&&Math.abs(P.y-e.y)<90;e.post=Math.max(0,e.post-(e.st==='stagger'?0:6*dt));
 if(e.post>=e.pmax&&e.st!=='broken'){e.st='broken';e.t=2;e.post=0;sfx.guard();burst(e.x+7,e.y+8,14,'#fc6')}
 switch(e.st){
 case'idle':e.vx=0;if(sees){e.st='chase'}break;
 case'chase':e.face=dx>0?1:-1;e.vx=e.face*85;if(e.hitWall&&e.onGround)e.vy=-340;
  if(!sees&&dist>260)e.st='idle';
  if(dist<30&&e.onGround){e.st='windup';e.t=.55;e.vx=0;e.lunge=Math.random()<.3;Audio_.beep(160,.35,'sawtooth',.08);setTimeout(()=>Audio_.beep(320,.2,'square',.06),250)}break;
 case'windup':e.vx=0;if(e.t<=0){e.st='attack';e.t=.14;e.hit=false;Audio_.beep(90,.15,'sawtooth',.12);burst(e.x+7+e.face*12,e.y+11,10,'#f84');if(Math.hypot(P.x-e.x,P.y-e.y)<180)shake=Math.max(shake,3);if(e.lunge){e.vx=e.face*260;e.vy=-120}}break;
 case'attack':if(!e.hit){const hx=e.x+e.w/2+e.face*14;if(Math.abs(hx-(P.x+6))<20&&Math.abs(e.y-P.y)<24){e.hit=true;hurtPlayer(9+e.lvl*3,12,e)}}
  if(e.t<=0){e.st='recover';e.t=.6;e.vx=0}break;
 case'recover':e.vx*=.8;if(e.t<=0)e.st='chase';break;
 case'stagger':e.vx=0;if(e.t<=0)e.st='chase';break;
 case'broken':e.vx=0;if(e.t<=0)e.st='chase';break}
 move(e,dt)}

// ---- Player update ----
function updPlayer(dt){const L=keys.KeyA||keys.ArrowLeft,R=keys.KeyD||keys.ArrowRight;
 P.ecd=Math.max(0,(P.ecd||0)-dt);P.inv=Math.max(0,P.inv-dt);P.pcd=Math.max(0,(P.pcd||0)-dt);P.stun=Math.max(0,P.stun-dt);P.guardBroken=Math.max(0,P.guardBroken-dt);P.dodge=Math.max(0,P.dodge-dt);
 P.blocking=mouse.r&&P.atk<=0&&P.dodge<=0&&P.stun<=0&&P.guardBroken<=0&&P.stam>0;
 const maxV=150+P.at.agi*6+S.spd;
 if(P.dodge<=0&&P.stun<=0){const acc=P.onGround?1600:900*(1+S.air);let d=(R?1:0)-(L?1:0);if(P.blocking||P.atk>0)d*=.35;
  if(d){P.vx+=d*acc*dt;P.vx=Math.max(-maxV,Math.min(maxV,P.vx));if(P.atk<=0)P.face=d}
  else P.vx*=P.onGround?Math.pow(.0005,dt):Math.pow(.2,dt)}
 if(P.blocking){P.blockAng=aimAng();P.face=Math.cos(P.blockAng)>=0?1:-1}
 // ladders
 P.nc=Math.max(0,(P.nc||0)-dt);{const lt=tiles[((P.y+11)/T|0)*W+((P.x+6)/T|0)]===6,up=keys.KeyW||keys.ArrowUp,dn=keys.KeyS||keys.ArrowDown;
  P.climb=!!(lt&&P.nc<=0&&P.stun<=0&&P.dodge<=0&&(up||dn||P.climb));
  if(P.climb){P.vy=up?-115:dn?115:0;P.air=1;P.vx*=Math.pow(.01,dt);if(P.jbuf>0){P.climb=false;P.nc=.3;P.vy=-330;P.jbuf=0}}}
 // jump: coyote + buffer + variable height
 P.coyote=P.onGround?.1:P.coyote-dt;P.jbuf-=dt;if(P.onGround)P.air=1;
 if(P.jbuf>0&&P.stun<=0){if(P.coyote>0){P.vy=-390*(1+S.jump);P.jbuf=0;P.coyote=0}
  else if(P.air>0){P.air--;P.vy=-360*(1+S.jump);P.jbuf=0;djFx()}}
 if(!keys.Space&&P.vy<-140)P.vy+=2400*dt*.5;
 // attack
 const WD=wd();if(P.atk>0){const prev=P.atk;if(P.atk>WD.dur*.67){P.aim=aimAng();P.face=Math.cos(P.aim)>=0?1:-1}P.atk-=dt*(1+enc('spd'));const act=P.atk<WD.dur*.67&&P.atk>WD.dur*.28;
  if(WD.thrust){if(act)thrustHit(WD)}else if(act&&!P.atkHit)for(const e of enemies){if(e.dead)continue;
   const ex=e.x+e.w/2-(P.x+6),ey=e.y+e.h/2-(P.y+11),d=Math.hypot(ex,ey);let da=Math.atan2(ey,ex)-P.aim;da=Math.atan2(Math.sin(da),Math.cos(da));
   if(d<WD.reach+14+Math.max(e.w,e.h)/2&&(Math.abs(da)<1.1||d<16)){P.atkHit=true;hitEnemy(e);break}}
  if(act&&!P.atkC&&!WD.thrust)for(const c of chests){const ex=c.tx*T+T-(P.x+6),ey=c.ty*T+8-(P.y+11),d=Math.hypot(ex,ey);let da=Math.atan2(ey,ex)-P.aim;da=Math.atan2(Math.sin(da),Math.cos(da));
   if(d<WD.reach+30&&(Math.abs(da)<1.2||d<26)){P.atkC=true;hitChest(c);break}}}
 else if(mouse.l)tryAttack();
 // regen
 const busy=P.blocking||P.atk>0||P.dodge>0;
 if(!busy&&P.guardBroken<=0)P.stam=Math.min(maxStam(),P.stam+(25+P.at.agi*2)*(1+S.regen)*dt);
 if(P.guardBroken>0)P.stam=0;
 P.post=Math.max(0,P.post-(P.blocking?2:14)*dt);
 move(P,dt);
 if(P.y>H*T)die()}
function hitEnemy(e){if(e.boss)return hitBoss(e);let d=dmgOut()*(P.combo===2?1.3:1),pd=14*wd().pd*(1+S.pdmg);const crit=e.st==='broken';if(crit){d*=2.5;pd=0;e.st='stagger';e.t=.5;float(e.x,e.y-14,'CRIT','#fa3')}
 if(e.def&&e.def.shield&&!crit&&!wd().thrust&&(e.face>0)===(P.x>e.x)){d*=.25;pd*=2.2;sfx.block&&sfx.block();float(e.x,e.y-14,'BLOCKED','#aac')}
 if(!crit&&e.st==='windup'){e.post+=pd}else e.post+=pd*.6;
 e.hp-=d;wfx(e,d);{const kd=e.x+e.w/2>P.x+6?1:-1,fy=e.def&&e.def.k==='fly';e.kb=.2;e.kbv=kd*(230+60*wd().pd+(crit?60:0))*(e.def&&e.def.shield?.6:1);e.vy=fy?-70:-130}if(e.st==='idle'||e.st==='chase'){e.st='stagger';e.t=.25}
 hitstop=.05;shake=crit?6:2;sfx.hit();burst(e.x+7,e.y+10,8,'#fc8');float(e.x,e.y-4,Math.round(d),'#fff');
 if(e.hp<=0){e.dead=true;P.kills=(P.kills||0)+1;qEv('kill',e);gainXp(12+e.lvl*14);dropLoot(e);burst(e.x+7,e.y+10,18,'#f84');setTimeout(()=>{e.x=e.home;e.y=-100;},0);
  setTimeout(()=>{if(!P)return;e.dead=false;e.hp=e.max;e.st='idle';e.vx=0;e.y=(e.hy!=null?e.hy:findY(e.home))},60000)}}
function findY(x){let ty=0;while(ty<H&&!solid(x/T|0,ty))ty++;return(ty-2)*T}

// ---- Main loop ----
let last=0,acc=0;const STEP=1/120;
function frame(ts){const dt=Math.min(.1,(ts-last)/1000);last=ts;if(over){over=0;endRun()}
 if(P&&!paused){acc+=dt;while(acc>=STEP){acc-=STEP;time+=STEP;if(hitstop>0){hitstop-=STEP;continue}updPlayer(STEP);enemies.forEach(e=>{if(e.boss)updBoss(e,STEP);else if(Math.abs(e.x-P.x)>720||Math.abs(e.y-P.y)>480)return;else e.def?updE2(e,STEP):updEnemy(e,STEP)});chests.forEach(c=>c.flash=Math.max(0,c.flash-STEP));updFx(STEP);
  for(const p of parts){p.x+=p.vx*STEP;p.y+=p.vy*STEP;p.vy+=400*STEP;p.l-=STEP}parts=parts.filter(p=>p.l>0);
  for(const f of floats){f.y-=20*STEP;f.l-=STEP}floats=floats.filter(f=>f.l>0)}
  let tx=P.x-cv.width/2+P.face*30,ty=P.y-cv.height/2;if(camFocus){tx=camFocus.x-cv.width/2;ty=camFocus.y-cv.height/2}const cs=Math.min(1,dt*(camFocus?2.2:3.2));cam.x+=(tx-cam.x)*cs;cam.y+=(ty-cam.y)*cs;
  cam.x=Math.max(0,Math.min(W*T-cv.width,cam.x));cam.y=Math.max(0,Math.min(H*T-cv.height,cam.y));reveal()}
 shake=Math.max(0,shake-dt*20);try{render()}catch(err){if(!window.__rerr){window.__rerr=1;console.error(err)}try{cx.restore();cx.globalAlpha=1;cx.globalCompositeOperation='source-over'}catch(e2){}}requestAnimationFrame(frame)}
requestAnimationFrame(frame);

// ---- Render ----
const off=document.createElement('canvas'),oc=off.getContext('2d');
const hsh=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%100;
const PAL={1:['#3f8a3a','#4a9a42','#357a32'],2:['#6b4a31','#5d4029','#7a563b'],3:['#4c4c62','#434357','#55556c'],4:['#2a7a8a','#2f8a9a','#256a7a']};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function mtn(w,h,off_,base,amp,f1,f2,col){cx.fillStyle=col;cx.beginPath();cx.moveTo(0,h);
 for(let x=0;x<=w;x+=6){const wx=x+off_;cx.lineTo(x,base-(Math.sin(wx*f1)+Math.sin(wx*f2+2)*.6+1.6)*amp)}cx.lineTo(w,h);cx.fill()}
function light(c,x,y,r,a){const g=c.createRadialGradient(x,y,r*.1,x,y,r);g.addColorStop(0,'rgba(0,0,0,'+a+')');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
const fixC=c=>{if(typeof c!=='string')return'rgba(255,255,255,.3)';const m=/^#([0-9a-f]{3})([0-9a-f]{2})$/i.exec(c);if(m)return'#'+m[1].replace(/./g,'$&$&')+m[2];if(/^#[0-9a-f]{3,8}$/i.test(c)&&[4,5,7,9].indexOf(c.length)<0)return c.slice(0,7);return c};
function glow(x,y,r,col){const g=cx.createRadialGradient(x,y,0,x,y,r);try{g.addColorStop(0,col)}catch(e){try{g.addColorStop(0,fixC(col))}catch(e2){g.addColorStop(0,'rgba(255,255,255,.3)')}}g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(x-r,y-r,r*2,r*2)}
function render(){const w=cv.width,h=cv.height;if(!P){cx.fillStyle='#0a0710';cx.fillRect(0,0,w,h);return}
 const sf=clamp((P.y/T-26)/14,0,1),ox=Math.round(cam.x+(Math.random()-.5)*shake),oy=Math.round(cam.y+(Math.random()-.5)*shake);
 // sky / cave backdrop
 const sky=cx.createLinearGradient(0,0,0,h);
 if(sf<1){sky.addColorStop(0,'#1a1040');sky.addColorStop(.55,'#5a2a5a');sky.addColorStop(1,'#d9703a')}
 cx.fillStyle=sky;cx.fillRect(0,0,w,h);
 if(sf<1){for(let i=0;i<50;i++){const sx=(i*137.5)%w,sy=(i*61.8)%(h*.6);cx.fillStyle='rgba(255,240,220,'+(.3+.5*Math.abs(Math.sin(time*2+i)))+')';cx.fillRect(sx,sy,1,1)}
  glow(w*.78,h*.18-oy*.02,60,'rgba(255,230,180,.45)');cx.fillStyle='#fff3d4';cx.beginPath();cx.arc(w*.78,h*.18-oy*.02,13,0,7);cx.fill();
  cx.fillStyle='#e6d2ac';cx.beginPath();cx.arc(w*.78-4,h*.18-3,3,0,7);cx.fill();
  const by=h*.8-oy*.25;mtn(w,h,ox*.1,by-30,40,.012,.03,'#3a1f4a');mtn(w,h,ox*.2,by,28,.02,.05,'#2a1638');mtn(w,h,ox*.35,by+30,20,.03,.07,'#190d24')}
 if(sf>0){cx.fillStyle='rgba(8,5,16,'+sf+')';cx.fillRect(0,0,w,h);
  cx.fillStyle='rgba(60,40,90,'+.25*sf+')';for(let i=0;i<14;i++){const px=((i*83-ox*.3)%(w+60)+w+60)%(w+60)-30,ph=40+i%4*30;cx.beginPath();cx.moveTo(px,0);cx.lineTo(px+10,ph);cx.lineTo(px+20,0);cx.fill()}}
 const pb=bio(P.x/T|0,P.y/T|0);if(pb){cx.fillStyle=BT[pb];cx.fillRect(0,0,w,h)}
 const dpf=clamp((P.y/T-120)/180,0,1);if(dpf>0){cx.fillStyle='rgba('+(60+dpf*80|0)+',0,'+(30+dpf*40|0)+','+(.08+.14*dpf)+')';cx.fillRect(0,0,w,h)}
 const lights=[];drawArenaBG(ox,oy,lights);
 // tiles
 const x0=Math.max(0,ox/T|0),x1=Math.min(W-1,(ox+w)/T+1|0),y0=Math.max(0,oy/T|0),y1=Math.min(H-1,(oy+h)/T+1|0),crys=[];
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const t=tiles[y*W+x];if(!t)continue;const hh=hsh(x,y),X=x*T-ox,Y=y*T-oy;
  if(t===6){cx.fillStyle='#5a3a1c';cx.fillRect(X+2,Y,2,T);cx.fillRect(X+T-4,Y,2,T);cx.fillStyle='#b07a3c';for(let k=1;k<T;k+=5)cx.fillRect(X+2,Y+k,T-4,2);continue}
  cx.fillStyle=((BP[bio(x,y)]||PAL)[t]||PAL[t])[hh%3];cx.fillRect(X,Y,T,T);
  if(t===3||t===2){cx.fillStyle='rgba(0,0,0,.18)';cx.fillRect(X+(hh%10),Y+(hh%7)+2,3,2);cx.fillStyle='rgba(255,255,255,.06)';cx.fillRect(X+(hh%9)+2,Y+(hh%5),2,2)}
  if(t===7){cx.fillStyle='rgba(217,164,65,.35)';cx.fillRect(X,Y+7,T,2);if(hh%4===0){cx.fillStyle='rgba(255,220,120,.7)';cx.fillRect(X+5,Y+3,2,10)}}
  const up=y>0&&!tiles[(y-1)*W+x];
  if(t===1&&up){cx.fillStyle=BG[bio(x,y)]||'#7ad45a';cx.fillRect(X,Y,T,3);cx.fillStyle='#5aa83f';for(let k=0;k<T;k+=3)cx.fillRect(X+k,Y+3,1,2+(hh+k)%3)}
  else if(up){cx.fillStyle='rgba(255,255,255,.14)';cx.fillRect(X,Y,T,1)}
  if(y<H-1&&!tiles[(y+1)*W+x]){cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(X,Y+T-2,T,2)}
  if(t===4){crys.push(X+8,Y+8);cx.fillStyle='#bff';cx.fillRect(X+4,Y+3,3,9);cx.fillStyle='#6ef';cx.fillRect(X+8,Y+5,3,7);cx.fillStyle='#fff';cx.fillRect(X+5,Y+4,1,3)}}
 // enemies
drawSpawn(ox,oy,lights);drawGates(ox,oy,lights);
 for(const c of chests){const X=c.tx*T-ox,Y=c.ty*T-oy;if(X<-40||X>w||Y<-20||Y>h)continue;const d=CH[c.type],fl=c.flash>0,n=1-c.hp/c.max;
  FR(X,Y+T-1,32,2,'rgba(0,0,0,.3)');FR(X+1,Y+4,30,T-5,fl?'#fff':d.c1);FR(X+1,Y+1,30,5,fl?'#fff':d.c2);FR(X+3,Y+1,3,T-2,d.c3);FR(X+26,Y+1,3,T-2,d.c3);FR(X+14,Y+5,4,5,d.c3);
  if(c.type===1){FR(X+1,Y+9,30,2,'#99a');FR(X+2,Y+2,2,2,'#ddd');FR(X+28,Y+2,2,2,'#ddd')}
  if(c.type===2){for(let k=0;k<4;k++)FR(X+8+k*5,Y+7,2,2,'#6ff');lights.push([X+16,Y+8,46])}
  if(c.type===3){const p=.5+.5*Math.sin(time*5);FR(X+9,Y+6,3,2,'#f33');FR(X+20,Y+6,3,2,'#f33');lights.push([X+16,Y+8,40+p*20]);if(Math.random()<.04)parts.push({x:c.tx*T+16,y:c.ty*T,vx:0,vy:-30,l:.6,c:'#a3f'})}
  if(n>.3){cx.strokeStyle='#000';cx.lineWidth=1;cx.beginPath();cx.moveTo(X+8,Y+2);cx.lineTo(X+12,Y+9);cx.stroke()}if(n>.65){cx.beginPath();cx.moveTo(X+22,Y+3);cx.lineTo(X+18,Y+12);cx.stroke()}}
 drawQuestGiver(ox,oy,lights);drawEnchantAltar(ox,oy,lights);
 if(SHOP){const X=Math.round(SHOP.x-ox),Y=Math.round(SHOP.y-oy);FR(X-20,Y-12,14,12,'#6a4a2a');FR(X-21,Y-14,16,3,'#8a6a3a');FR(X-18,Y-17,3,3,'#d9a441');FR(X-13,Y-17,3,3,'#6cf');FR(X-9,Y-17,3,3,'#f66');
  PL([X-6,Y,X-4,Y-14,X+8,Y-14,X+10,Y],'#4a2a6a');FR(X-3,Y-22,10,9,'#4a2a6a');FR(X-1,Y-20,6,5,'#150d20');FR(X,Y-18,1,2,'#fd5');FR(X+3,Y-18,1,2,'#fd5');PL([X-5,Y-22,X+2,Y-30,X+9,Y-22],'#5a3a7a');
  const sw=Math.sin(time*3)*2;FR(X+10+sw,Y-12,2,5,'#fc4');lights.push([X+11+sw,Y-9,50]);
  if(nearShop()){cx.fillStyle='#ffd36b';cx.font='bold 9px Georgia';cx.textAlign='center';cx.fillText('[E] Shop',X+2,Y-34);cx.textAlign='left'}}
 for(const e of enemies){if(e.dead)continue;if(true){drawE(e,ox,oy,lights);continue}const X=Math.round(e.x-ox),Y=Math.round(e.y-oy),f=e.face,tint=e.lvl>1?['#5a2a6a','#7a3a8a']:['#6a2a1e','#8a3a2a'];
  const wind=e.st==='windup',brk=e.st==='broken',flash=e.st==='stagger';
  cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(X,Y+e.h,e.w,2);
  const sway=e.onGround&&Math.abs(e.vx)>10?Math.sin(time*16)*2:0;
  cx.fillStyle=flash?'#ddd':brk?'#fc4':tint[0];cx.fillRect(X+2,Y+8,e.w-4,e.h-12);cx.fillRect(X+2+sway,Y+e.h-5,4,5);cx.fillRect(X+e.w-6-sway,Y+e.h-5,4,5);
  cx.fillStyle=flash?'#fff':brk?'#ffe08a':tint[1];cx.fillRect(X+1,Y,e.w-2,10);
  cx.fillStyle=tint[0];cx.fillRect(X,Y-3,3,5);cx.fillRect(X+e.w-3,Y-3,3,5);
  cx.fillStyle=wind?'#ff2a2a':'#ffd23a';cx.fillRect(X+(f>0?8:3),Y+4,3,2);cx.fillRect(X+(f>0?4:7),Y+4,2,2);
  const cl=wind?'#f55':'#caa';cx.fillStyle=cl;cx.fillRect(f>0?X+e.w:X-4,Y+12,4,2);
  const pc=X+7,py=Y+11;
  if(wind){const p=clamp(1-e.t/.55,0,1),pulse=(time*(10+p*20)|0)%2;lights.push([pc,py,60+p*40]);
   if(pulse){cx.fillStyle='rgba(255,60,60,.5)';cx.fillRect(X,Y,e.w,e.h)}
   cx.save();cx.translate(pc,py);cx.fillStyle='rgba(255,40,40,'+(.1+.3*p)+')';cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,e.lunge?48:30,f>0?-1.1:Math.PI-1.1,f>0?1.1:Math.PI+1.1);cx.closePath();cx.fill();
   cx.strokeStyle='rgba(255,100,70,'+(.5+.5*p)+')';cx.lineWidth=1.5;cx.stroke();
   cx.strokeStyle='rgba(255,60,60,'+(.4+.6*p)+')';cx.lineWidth=2;cx.beginPath();cx.arc(0,0,34*(1-p)+8,0,7);cx.stroke();if(e.t<.25){cx.strokeStyle='#fff';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,13,0,7);cx.stroke();cx.fillStyle='rgba(255,255,255,.25)';cx.fill()}
   if(e.lunge){cx.fillStyle='#ffd23a';for(let k=0;k<3;k++){cx.beginPath();const ax=f*(18+k*9+p*4);cx.moveTo(ax,-5);cx.lineTo(ax+f*8,0);cx.lineTo(ax,5);cx.fill()}}
   cx.restore();
   cx.save();cx.translate(pc+f*4,py-3);cx.rotate((f>0?-1.9:Math.PI+1.9)+(f>0?p*.35:-p*.35));cx.fillStyle='#ff6a4a';cx.fillRect(0,-2,22,4);cx.fillStyle='#ffe';cx.fillRect(0,-1,22,2);cx.restore();
   cx.fillStyle=pulse?'#ff2a2a':'#ffd23a';cx.beginPath();cx.moveTo(pc,Y-24);cx.lineTo(pc+8,Y-9);cx.lineTo(pc-8,Y-9);cx.closePath();cx.fill();cx.strokeStyle='#000';cx.lineWidth=1;cx.stroke();
   cx.fillStyle='#000';cx.fillRect(pc-1,Y-20,2,6);cx.fillRect(pc-1,Y-12,2,2)}
  if(brk){lights.push([pc,py,45]);cx.fillStyle='#ffe08a';cx.font='bold 8px Georgia';cx.textAlign='center';cx.fillText('BREAK',pc,Y-10);cx.textAlign='left'}
  if(e.st==='attack'){const p=clamp(1-e.t/.14,0,1),ang=f>0?-1.3+p*2.6:Math.PI+1.3-p*2.6;lights.push([pc+f*18,py,80]);
   if(e.lunge&&Math.abs(e.vx)>60){for(let k=1;k<=3;k++){cx.fillStyle='rgba(255,70,50,'+(.3-k*.08)+')';cx.fillRect(X-f*k*8,Y,e.w,e.h)}}
   cx.save();cx.translate(pc,py);const cols=['rgba(255,40,40,.45)','rgba(255,150,50,.85)','#fff'],lw=[11,6,2];
   for(let k=0;k<3;k++){cx.strokeStyle=cols[k];cx.lineWidth=lw[k];cx.beginPath();if(f>0)cx.arc(0,0,30,ang-1.3,ang);else cx.arc(0,0,30,ang,ang+1.3);cx.stroke()}
   cx.fillStyle='#fff';cx.fillRect(Math.cos(ang)*30-1,Math.sin(ang)*30-1,3,3);cx.restore()}
  if(e.hp<e.max){bar(X-1,Y-8,e.w+2,3,e.hp,e.max,'#c33');bar(X-1,Y-5,e.w+2,2,e.post,e.pmax,'#fb3')}}
 drawFx(ox,oy,lights);
 // player
 const X=Math.round(P.x-ox),Y=Math.round(P.y-oy),f=P.face;cx.globalAlpha=P.inv>0&&(time*20|0)%2?.72:1;
 cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(X,Y+P.h,P.w,2);
 const run=P.onGround&&Math.abs(P.vx)>20,lg=run?Math.sin(time*18)*3:0,sw=Math.sin(time*7)*1.5+(run?3:0)+(P.vy<0?-3:0);
 heroDraw(X,Y,f,run,lg,sw);
 // sword & slash
 const WD2=wd(),a=P.atk>0?1-P.atk/WD2.dur:0,sa=P.atk>0?(WD2.thrust?P.aim:P.aim-1.1+a*2.2):(f>0?.5:Math.PI-.5);
 const ext=WD2.thrust&&P.atk>0?(a<.33?-8*(a/.33):a<.72?-8+(WD2.reach*.55+8)*(a-.33)/.39:WD2.reach*.55*(1-(a-.72)/.28)):0;
 if(WD2.thrust&&P.atk>0&&a>.3&&a<.78){cx.save();cx.translate(X+6,Y+11);cx.rotate(sa);for(let k=0;k<3;k++){cx.fillStyle=WD2.col[k];cx.fillRect(WD2.reach*.2,-3+k,WD2.reach*.95,6-2*k)}PL([WD2.reach*1.2,0,WD2.reach*1.0,-6,WD2.reach*1.0,6],'#fff');cx.restore()}
 cx.save();cx.translate(X+6+Math.cos(sa)*ext,Y+11+Math.sin(sa)*ext);cx.rotate(sa);WD2.draw();cx.restore();
 if(!WD2.thrust&&P.atk>0&&a>.15&&a<.85){slashFx(X,Y,WD2,sa,a)}
 cx.globalAlpha=1;
 if(P.blocking){const par=time-P.blockT<=.2+S.parry;cx.strokeStyle=par?'#fff3b0':'#6a9aff';cx.fillStyle=par?'#ffe08a55':'#3a6aff44';cx.lineWidth=2;
  cx.beginPath();const ba=P.blockAng||0;cx.arc(X+6+Math.cos(ba)*9,Y+11+Math.sin(ba)*9,15,ba-1.3,ba+1.3);cx.stroke();cx.fill()}
 if(P.guardBroken>0){cx.fillStyle='#fc4';for(let k=0;k<3;k++)cx.fillRect(X+2+k*4,Y-6+Math.sin(time*12+k)*2,2,2)}
 // glows (additive)
 cx.globalCompositeOperation='lighter';glow(X+6,Y+11,P.atk>0?60:44,P.atk>0?'rgba(255,150,60,.25)':'rgba(255,170,90,.12)');
 for(let i=0;i<crys.length;i+=2)glow(crys[i],crys[i+1],22,'rgba(80,220,255,.28)');cx.globalCompositeOperation='source-over';
 // particles
 for(const p of parts){cx.fillStyle=p.c;cx.globalAlpha=clamp(p.l*2.5,0,1);cx.fillRect(p.x-ox,p.y-oy,2,2)}cx.globalAlpha=1;
 // ambient embers
 for(let i=0;i<24;i++){const ex=((i*71+time*(8+i%5)-ox*.5)%w+w)%w,ey=((i*53-time*(14+i%7)-oy*.3)%h+h)%h;cx.fillStyle='rgba(255,'+(140+i*4)+',60,'+(.25+.3*Math.sin(time*3+i))+')';cx.fillRect(ex,ey,1,1)}
 // lighting / darkness
 if(off.width!==w||off.height!==h){off.width=w;off.height=h}
 const dark=.12+.78*sf;oc.globalCompositeOperation='source-over';oc.clearRect(0,0,w,h);oc.fillStyle='rgba(5,3,12,'+dark+')';oc.fillRect(0,0,w,h);
 oc.globalCompositeOperation='destination-out';light(oc,X+6,Y+11,(130+(1-sf)*200)*(pb===4?.5:1),1);
 for(let i=0;i<crys.length;i+=2)light(oc,crys[i],crys[i+1],36,.9);for(const l of lights)light(oc,l[0],l[1],l[2],.9);
 for(const p of parts)if(p.l>.2)light(oc,p.x-ox,p.y-oy,10,.5);
 cx.drawImage(off,0,0);
 // text floats
 cx.font='bold 9px Georgia';cx.textAlign='center';for(const t of floats){cx.fillStyle='#000';cx.fillText(t.s,t.x-ox+7+1,t.y-oy+1);cx.fillStyle=t.c;cx.fillText(t.s,t.x-ox+7,t.y-oy)}cx.textAlign='left';
 // cursor
 const mtx=(mouse.x+ox)/T|0,mty=(mouse.y+oy)/T|0,inr=Math.hypot(mtx*T+8-(P.x+6),mty*T+8-(P.y+11))<=T*5&&tiles[mty*W+mtx]>0;
 cx.strokeStyle=inr?'#ffd36b':'#ffffff22';cx.lineWidth=1;cx.strokeRect(mtx*T-ox+.5,mty*T-oy+.5,T-1,T-1);
 // vignette
 const vg=cx.createRadialGradient(w/2,h/2,h*.35,w/2,h/2,h*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');cx.fillStyle=vg;cx.fillRect(0,0,w,h);
 if(P.hp<maxHp()*.3){cx.fillStyle='rgba(160,0,0,'+(.1+.08*Math.sin(time*6))+')';cx.fillRect(0,0,w,h)}
 bossHud();hud();drawMini()}
function bar(x,y,w,h,v,m,c){cx.fillStyle='#000';cx.fillRect(x,y,w,h);cx.fillStyle=c;cx.fillRect(x+.5,y+.5,(w-1)*clamp(v/m,0,1),h-1)}
const $=id=>document.getElementById(id);
function hud(){$('hud').classList.remove('hidden');$('mmw').classList.remove('hidden');$('hLives').innerHTML=Array.from({length:MAXL},(_,i)=>i).map(i=>'<b class="'+(i<P.lives?'on':'off')+'">♥</b>').join('');$('hint').classList.remove('hidden');
 $('bHp').style.width=clamp(P.hp/maxHp(),0,1)*100+'%';$('tHp').textContent=Math.ceil(P.hp)+' / '+maxHp();
 $('bSt').style.width=clamp(P.stam/maxStam(),0,1)*100+'%';$('bPo').style.width=clamp(P.post/maxPost(),0,1)*100+'%';$('bPc').style.width=(1-clamp(P.pcd||0,0,1))*100+'%';$('pcBar').classList.toggle('ready',!(P.pcd>0));
 $('bXp').style.width=clamp(P.xp/xpNeed(P.lvl),0,1)*100+'%';$('hLv').textContent=P.lvl;$('hEc').textContent='\u2756 '+bankedEchoes()+' echoes banked';updQHud();hElx();$('hGold').textContent='\u25C6 '+gold+' gold';
 const w=$('hWpn');w.textContent=P.weapon.name+enchTxt(P.weapon)+' · '+dmgOut()+' dmg';w.style.color=RAR[P.weapon.rar][1];$('hPts').textContent=P.pts?'\u2726 '+P.pts+' points to spend (Tab)':''}

// ---- Character sheet ----
function drawSheet(){const names={str:['Strength','+8% damage, +4 max posture each'],agi:['Agility','+10 stamina, +6 speed each'],fort:['Fortitude','+20 HP, +8 max posture each']};
 let h=`<h1>CHARACTER</h1><div>Level ${P.lvl} · XP ${P.xp}/${xpNeed(P.lvl)} · ${gold} gold · Points: ${P.pts}</div><hr>`;
 for(const k in names)h+=`<div class="row"><span><b>${names[k][0]}</b> ${P.at[k]}<br><small>${names[k][1]}</small></span><button data-a="${k}" ${P.pts?'':'disabled'}>+</button></div>`;
 h+=`<hr><b>Equipped:</b> <span style="color:${RAR[P.weapon.rar][1]}">${P.weapon.name}</span> (${P.weapon.dmg} base)${enchSheet(P.weapon)}<br><b>Damage:</b> ${dmgOut()} · HP ${maxHp()} · Stamina ${maxStam()} · Posture ${maxPost()}<br><small>${SLOTS.map(sl=>sl+': '+(ACCB[eq[sl]]?ACCB[eq[sl]].name:'-')).join(' \u00b7 ')}</small><hr><b>Inventory (${inv.length}/20)</b>`;
 inv.forEach((it,i)=>{h+=`<div class="row"><span style="color:${RAR[it.rar][1]}">${it.name} (${it.dmg} dmg)${enchTxt(it)}</span><span><button data-e="${i}">Equip</button><button data-d="${i}">Discard</button></span></div>`});
 if(!inv.length)h+='<div><small>Empty. Enemies drop weapons.</small></div>';
 sheet.innerHTML=h+'<br><small>Tab to close</small>';
 sheet.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(P.pts>0){P.pts--;P.at[b.dataset.a]++;save();drawSheet()}});
 sheet.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const i=+b.dataset.e,old=P.weapon;P.weapon=inv[i];inv[i]=old;save();drawSheet()});
 sheet.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{inv.splice(+b.dataset.d,1);save();drawSheet()})}

// ---- Shop ----
const iconCache={};
function icon(a){if(iconCache[a.id])return iconCache[a.id];const c=document.createElement('canvas');c.width=c.height=20;const g=c.getContext('2d'),col=RAR[a.rar][1];
 let h=0;for(const ch of a.id)h=(h*31+ch.charCodeAt(0))%360;const m='hsl('+h+',55%,50%)';g.fillStyle='#120d1a';g.fillRect(0,0,20,20);g.strokeStyle=col;g.strokeRect(.5,.5,19,19);g.fillStyle=m;
 if(a.slot==='head'){g.fillRect(4,6,12,9);g.fillRect(3,13,14,3);g.fillStyle=col;g.fillRect(5,3,2,4);g.fillRect(9,2,2,5);g.fillRect(13,3,2,4)}
 else if(a.slot==='neck'){g.fillStyle=col;g.fillRect(9,2,2,5);g.fillRect(6,7,2,4);g.fillRect(12,7,2,4);g.fillStyle=m;g.beginPath();g.moveTo(10,10);g.lineTo(15,15);g.lineTo(10,19);g.lineTo(5,15);g.fill()}
 else if(a.slot==='arms'){g.fillRect(4,4,12,12);g.fillStyle='#120d1a';g.fillRect(7,7,6,6);g.fillStyle=col;g.fillRect(4,4,12,2);g.fillRect(4,14,12,2)}
 else{g.fillRect(6,3,6,11);g.fillRect(6,12,11,5);g.fillStyle=col;g.fillRect(6,16,11,2)}
 return iconCache[a.id]=c.toDataURL()}
function openShop(){shopOpen=true;sheetOpen=true;paused=true;sheet.classList.remove('hidden');drawShop()}
function accRow(a,btns){return `<div class="row"><span style="display:flex;gap:10px;align-items:center"><img src="${icon(a)}" width="40" height="40" style="image-rendering:pixelated"><span><b style="color:${RAR[a.rar][1]}">${a.name}</b> <small>${RAR[a.rar][0]} ${a.slot}</small><br><small>${fxText(a.fx)}</small></span></span><span>${btns}</span></div>`}
function drawShop(){let h=`<h1>WANDERING MERCHANT</h1><div>Gold: <b style="color:#ffd36b">${gold}</b> · Esc to leave</div><hr>${elixRow()}<hr><b>Equipped</b>`;
 for(const sl of SLOTS){const a=ACCB[eq[sl]];h+=a?accRow(a,`<button data-u="${sl}">Unequip</button>`):`<div class="row"><span><b>${sl}</b> <small>empty</small></span></div>`}
 h+=`<hr><b>Owned</b>`;const own=accOwned.map(id=>ACCB[id]).filter(a=>a&&eq[a.slot]!==a.id);
 own.forEach(a=>h+=accRow(a,`<button data-q="${a.id}">${eq[a.slot]?'Replace':'Equip'}</button>`));if(!own.length)h+='<div><small>Nothing in reserve.</small></div>';
 h+=`<hr><b>For sale</b>`;SLOTS.forEach(sl=>{h+='<div style="text-align:left;margin-top:8px;color:#a8957a;letter-spacing:2px;font-size:11px">'+sl.toUpperCase()+'</div>';ACC.filter(a=>a.slot===sl&&a.price&&!accOwned.includes(a.id)).sort((a,b)=>a.price-b.price).forEach(a=>h+=accRow(a,`<small style="color:#ffd36b">${a.price}g</small> <button data-b="${a.id}" ${gold<a.price?'disabled':''}>Buy</button>`))});
 sheet.innerHTML=h;
 sheet.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{delete eq[b.dataset.u];recalc();save();drawShop()});
 sheet.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const a=ACCB[b.dataset.q];eq[a.slot]=a.id;recalc();save();sfx.loot();drawShop()});
 sheet.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{const a=ACCB[b.dataset.b];if(gold<a.price||accOwned.includes(a.id))return;gold-=a.price;accOwned.push(a.id);sfx.loot();save();drawShop()});
 sheet.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{if(gold<ELX_PRICE||(P.el|0)>=ELX_MAX)return;gold-=ELX_PRICE;P.el=(P.el|0)+1;sfx.loot();save();drawShop()})}


// ======================= BOSS & BIOME EXPANSION =======================
const bio=(tx,ty)=>layerAt(ty);
const peak=()=>0;
const ARENAS=[{id:'ember',cx:200,fy:ybF(2),hw:32,ht:18,g:2,side:1,bg:['#1a0a10','#3a1208'],pl:[[-26,4,8],[18,4,8],[-5,8,10],[-15,12,6],[9,12,6]]},
 {id:'glacial',cx:200,fy:ybF(3),hw:32,ht:18,g:3,side:1,bg:['#0c1a30','#1c3858'],pl:[[-27,4,9],[18,4,9],[-8,8,16],[-24,11,7],[18,11,7],[-3,14,7]]},
 {id:'tempest',cx:200,fy:ybF(4),hw:32,ht:18,g:4,side:1,bg:['#0a0c24','#1a2050'],pl:[[-25,4,6],[19,4,6],[-4,8,8],[-22,11,5],[17,11,5],[-3,14,6]]},
 {id:'hollow',cx:200,fy:ybF(5),hw:32,ht:18,g:5,side:1,bg:['#08050f','#1a1030'],pl:[[-26,4,7],[19,4,7],[-5,8,10],[-20,11,6],[14,11,6],[-3,14,6]]}];
// Gate n leads into layer n and stays sealed until the boss of layer n-1 is dead (ember > glacial > tempest > hollow)
const GATE_REQ=n=>n>=2&&ARENAS[n-2]?ARENAS[n-2].id:null;
const gateOpen=g=>{const r=GATE_REQ(g.n);return !r||!!bossDead[r]};
function applyGateLocks(){if(!tiles)return;for(const g of GATES){const open=gateOpen(g);for(let y=g.y;y<=g.y+1;y++)for(let x=g.x-2;x<=g.x+2;x++)tiles[y*W+x]=open?(x===g.x?6:0):7}}
function bossBanner(title,sub){let b=document.getElementById('bossBanner');if(!b){b=document.createElement('div');b.id='bossBanner';document.body.appendChild(b)}
 b.innerHTML='<div class="bb-t">BOSS DEFEATED</div><div class="bb-n">'+title+'</div><div class="bb-s">'+(sub||'')+'</div>';b.classList.remove('show');void b.offsetWidth;b.classList.add('show');clearTimeout(bossBanner.h);bossBanner.h=setTimeout(()=>b.classList.remove('show'),4500)}
let GATES=[],ARCHES=[];const inAB=(x,y,m=1)=>ARENAS.some(a=>Math.abs(x-a.cx)<=a.hw+m&&y>=a.fy-a.ht-m&&y<=a.fy+m);
PAL[5]=['#e8501a','#ff8a2a','#c83a10'];PAL[7]=['#2a2438','#241e32','#302a42'];
const BP={1:{1:['#4a3028','#3a2622','#54382e'],2:['#5a2a20','#4a2018','#6a3224'],3:['#2e2626','#262020','#382c2c']},
 2:{1:['#cfe8f8','#bcdcf0','#dff4ff'],2:['#7aa4c8','#6a94b8','#8ab4d8'],3:['#5a7a9a','#4e6e8e','#6a8aaa']},
 3:{1:['#8a9ab0','#7a8aa0','#9aaac0'],2:['#5a5a6a','#4e4e5e','#66667a'],3:['#6a6e82','#5e6276','#767a90']},
 4:{1:['#3a3050','#322848','#443a5c'],2:['#241a34','#1e162c','#2a2040'],3:['#1c1630','#18122a','#221a3a']}};
const BG={1:'#6a3a30',2:'#eefaff',3:'#aab8cc',4:'#4a3a68'};
const BT=[0,'rgba(255,60,20,.13)','rgba(120,200,255,.13)','rgba(220,220,120,.10)','rgba(60,20,110,.22)'];
function carveWorld(r){
 for(const a of ARENAS){const x0=a.cx-a.hw,x1=a.cx+a.hw,y0=a.fy-a.ht;
  for(let y=y0-3;y<=a.fy+3;y++)for(let x=x0-3;x<=x1+3;x++)tiles[y*W+x]=3;
  for(let x=x0;x<=x1;x++){const c=y0+Math.round(Math.pow(Math.abs(x-a.cx)/a.hw,3)*9);for(let y=c;y<a.fy;y++)tiles[y*W+x]=0}
  for(const[px,py,ln]of a.pl)for(let k=0;k<ln;k++){tiles[(a.fy-py)*W+a.cx+px+k]=3;tiles[(a.fy-py+1)*W+a.cx+px+k]=3}
  if(a.id==='ember')for(const sd of[-1,1])for(let k=0;k<5;k++)tiles[(a.fy-1)*W+a.cx+sd*(a.hw-12)+k]=5}
 ladderPass(r)}
const inArena=()=>ARENAS.find(a=>Math.abs(P.x/T-a.cx)<a.hw+1&&P.y/T>a.fy-a.ht-1&&P.y/T<a.fy+1);
// ---------- zones / projectiles ----------
let zones=[],projs=[],bossDead={},zt=0;
function zone(x,y0,y1,w,t,dmg,col,sp){zones.push({x,y0,y1,w,t,t0:t,dmg,col,a:0,hit:false,sp})}
function proj(x,y,vx,vy,dmg,col,pd=12,r=4){projs.push({x,y,vx,vy,dmg,col,pd,r,l:4})}
function updFx(dt){const ly=layerAt(P.y/T|0);if(ly>(P.maxLy||0))P.maxLy=ly;qEv('layer',ly);if(ly!==curLayer){curLayer=ly;if(ly>0)toast('Layer '+ROM[ly]+' \u00b7 the '+LN[ly]+' Depths')}
 for(const z of zones){if(z.t>0){z.t-=dt;if(z.t<=0)z.a=.3;continue}z.a-=dt;
  if(!z.hit&&Math.abs(P.x+6-z.x)<z.w/2+6&&P.y+22>z.y0&&P.y<z.y1){z.hit=true;hurtPlayer(z.dmg,z.dmg,{x:z.x,y:z.y0,w:2,h:2,face:1,post:0})}}
 zones=zones.filter(z=>z.t>0||z.a>0);
 for(const p of projs){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;if(solid(p.x/T|0,p.y/T|0))p.l=0;
  if(Math.hypot(P.x+6-p.x,P.y+11-p.y)<p.r+8){p.l=0;hurtPlayer(p.dmg,p.pd,{x:p.x,y:p.y,w:2,h:2,face:p.vx>0?1:-1,post:0});burst(p.x,p.y,6,p.col)}
  if(Math.random()<.3)parts.push({x:p.x,y:p.y,vx:0,vy:0,l:.2,c:p.col})}
 projs=projs.filter(p=>p.l>0);
 if(tiles[((P.y+20)/T|0)*W+((P.x+6)/T|0)]===5){P.hp-=14*dt;if(Math.random()<.4)burst(P.x+6,P.y+20,1,'#f80');if(P.hp<=0)die()}
 zt-=dt;if(zt<=0&&!inArena()){zt=3.5;const b=bio(P.x/T|0,P.y/T|0),px=P.x+(Math.random()-.5)*120;
  if(b===1)zone(px,P.y-30,P.y+40,28,1.5,14,'255,120,20');
  else if(b===2)zone(px,P.y-150,P.y+30,14,1.4,14,'150,220,255');
  else if(b===3)zone(px,P.y-110,P.y+30,12,1.3,18,'255,255,120')}}
function drawFx(ox,oy,lights){
 for(const z of zones){const sx=z.x-ox,y0=z.y0-oy,hh=z.y1-z.y0;
  if(z.t>0){const k=1-z.t/z.t0;if(z.sp){const B=enemies.find(e=>e.id==='hollow');if(B){cx.save();cx.globalAlpha=.2+.6*k;cx.translate(sx,z.y1-oy-B.h);BS.hollow(B,k,0,'tele');cx.restore()}}
   cx.fillStyle='rgba('+z.col+','+(.1+.28*k)+')';cx.fillRect(sx-z.w/2,y0,z.w,hh);if((time*(8+22*k)|0)%2){cx.strokeStyle='rgba('+z.col+',.9)';cx.lineWidth=2;cx.strokeRect(sx-z.w/2,y0,z.w,hh)}const by=z.y1-oy;cx.fillStyle='rgba('+z.col+',.95)';cx.fillRect(sx-z.w/2-3,by-5,z.w+6,5);for(let q=0;q<z.w+6;q+=8){cx.fillStyle='#000';cx.fillRect(sx-z.w/2-3+q,by-5,4,5)}
   PL([sx,by-30,sx+8,by-14,sx-8,by-14],(time*(8+22*k)|0)%2?'#ff2a2a':'#ffd23a');cx.fillStyle='#000';cx.fillRect(sx-1,by-26,2,6);if(z.t<.22){cx.fillStyle='rgba(255,255,255,.4)';cx.fillRect(sx-z.w/2,y0,z.w,hh)}}
  else{cx.fillStyle='rgba('+z.col+','+Math.min(1,z.a*4)+')';cx.fillRect(sx-z.w/2,y0,z.w,hh);cx.fillStyle='#fff';cx.fillRect(sx-2,y0,4,hh);lights.push([sx,y0+hh/2,70])}}
 for(const p of projs){const X=p.x-ox,Y=p.y-oy,r=p.r+2,pu=(time*16|0)%2;cx.fillStyle='rgba(255,255,255,.25)';cx.fillRect(X-r-2,Y-r-2,r*2+4,r*2+4);cx.fillStyle=p.col;cx.fillRect(X-r,Y-r,r*2,r*2);cx.strokeStyle=pu?'#fff':'#f33';cx.lineWidth=1.5;cx.strokeRect(X-r-.5,Y-r-.5,r*2+1,r*2+1);cx.fillStyle='#fff';cx.fillRect(X-1,Y-1,2,2);
  for(let k=1;k<4;k++){cx.globalAlpha=.4/k;cx.fillStyle=p.col;const tx=X-p.vx*.012*k,ty=Y-p.vy*.012*k;cx.fillRect(tx-r+k,ty-r+k,(r-k*.5)*2,(r-k*.5)*2)}cx.globalAlpha=1;lights.push([X,Y,34])}}
// ---------- weapon effects & boss weapons ----------
function wfx(e,d){enchFx(e,d);const k=P.weapon.kind,cxm=e.x+e.w/2,cym=e.y+e.h/2;
 if(k==='infernal'){e.hp-=d*.3;burst(cxm,cym,10,'#f60')}
 else if(k==='frostbite'){e.slow=2;e.post+=6;burst(cxm,cym,8,'#8ef')}
 else if(k==='stormpiercer'){const o=enemies.find(o=>o!==e&&!o.dead&&!o.boss&&Math.hypot(o.x-e.x,o.y-e.y)<110);if(o){o.hp=Math.max(1,o.hp-d*.5);burst(o.x+7,o.y+8,8,'#ff8');float(o.x,o.y-10,'CHAIN','#ff8')}}
 else if(k==='voidfang'){P.hp=Math.min(maxHp(),P.hp+Math.ceil(d*.06))}}
const WN={infernal:'Infernal Reaver',frostbite:'Frostbite Edge',stormpiercer:'Stormpiercer',voidfang:'Voidfang Blades'};
Object.assign(WK,{
 infernal:{reach:44,dur:.5,pd:1.8,dm:1,bd:38,col:['#ff2a0066','#ff8a1aaa','#ffe08a'],names:[],draw(){FR(-2,-2,8,4,'#2a1410');PL([6,-9,9,-9,9,9,6,9,4,0],'#8a2a1a');PL([9,-5,16,-8,24,-6,30,-10,38,-5,48,0,38,5,30,10,24,6,16,8,9,5],'#3a1410');FR(10,-1,36,2,'#ff9a2a');
  for(let k=0;k<5;k++){const fy=Math.sin(time*14+k*2)*2;PL([14+k*7,-6,17+k*7,-11+fy,20+k*7,-6],'#ff6a1a');PL([14+k*7,6,17+k*7,11-fy,20+k*7,6],'#ff6a1a')}}},
 frostbite:{reach:36,dur:.3,pd:.9,dm:1,bd:44,col:['#6cf6','#9ef9','#fff'],names:[],draw(){FR(0,-1,6,3,'#3a5a7a');PL([5,-6,9,0,5,6,3,0],'#7ad');PL([9,-3,30,-5,40,0,30,5,9,3],'#a8e4ff');PL([12,-1,36,0,12,1],'#fff');
  PL([16,-3,19,-11,23,-4],'#cfeeff');PL([24,3,28,10,31,2],'#cfeeff');PL([30,-4,34,-9,35,-3],'#fff');if(Math.random()<.2)parts.push({x:P.x+6,y:P.y+8,vx:0,vy:20,l:.5,c:'#cff'})}},
 stormpiercer:{thrust:1,reach:48,dur:.4,pd:1.1,dm:1,bd:50,col:['#ff86','#ffc9','#fff'],names:[],draw(){FR(-8,-1,40,2,'#2a3a6a');FR(2,-2,3,4,'#d9a441');FR(14,-2,3,4,'#d9a441');PL([32,-5,40,-2,36,0,48,0,34,6,38,1,30,3],'#ffe84a');PL([34,-2,40,-1,36,1],'#fff');
  cx.strokeStyle='#ff8';cx.lineWidth=1;for(let k=0;k<2;k++){const x=30+Math.random()*16;cx.beginPath();cx.moveTo(x,-4);cx.lineTo(x+(Math.random()-.5)*10,-10);cx.stroke()}}},
 voidfang:{reach:24,dur:.2,pd:.7,dm:1,bd:34,col:['#a4f6','#c8f9','#fff'],names:[],draw(){for(const a of[-.22,.22]){cx.save();cx.rotate(a);FR(0,-1,6,3,'#150a22');FR(5,-4,2,8,'#6a3aa8');cx.fillStyle='#2a1a4a';cx.beginPath();cx.moveTo(7,-3);cx.quadraticCurveTo(22,-8,30,2);cx.quadraticCurveTo(18,-1,7,1);cx.fill();FR(9,0,16,1,'#c8f');PL([26,-1,28,4,24,0],'#fff');cx.restore()}}}});
// ---------- enemy definitions ----------
const ED={
 ash:{n:'Ash Warrior',b:1,hp:70,pm:45,spd:105,dmg:15,pd:14,rng:30,wu:.4,k:'melee',c:['#3a2a28','#6a3a30','#f84']},
 cinder:{n:'Cinder Caster',b:1,hp:45,pm:30,spd:55,dmg:13,pd:8,wu:.7,k:'ranged',ps:130,pc:'#fa3',c:['#601a10','#8a3a20','#ff0']},
 stalker:{n:'Frost Stalker',b:2,hp:55,pm:30,spd:150,dmg:12,pd:10,rng:28,wu:.25,k:'melee',c:['#6a9ac0','#9ad0e8','#fff']},
 frozen:{n:'Frozen Warrior',b:2,hp:95,pm:60,spd:60,dmg:18,pd:20,rng:32,wu:.55,k:'melee',shield:1,c:['#4a6a88','#7a9ab8','#9ff']},
 archer:{n:'Storm Archer',b:3,hp:50,pm:30,spd:70,dmg:14,pd:8,wu:.6,k:'ranged',ps:200,pc:'#ff6',c:['#3a3a5a','#5a5a8a','#ff6']},
 wisp:{n:'Gale Wisp',b:3,w:14,h:14,hp:40,pm:25,spd:80,dmg:15,pd:10,wu:.55,k:'fly',nb:1,c:['#ffe86a','#fff','#fff']},
 shade:{n:'Shade',b:4,hp:60,pm:35,spd:90,dmg:17,pd:12,rng:28,wu:.35,k:'tele',c:['#2a1a3a','#4a3a6a','#fff']},
 hknight:{n:'Hollow Knight',b:4,w:18,h:28,hp:130,pm:70,spd:55,dmg:26,pd:40,rng:36,wu:.7,k:'melee',c:['#2a2a3a','#5a5a7a','#a8f']}};
for(const k in ED){ED[k].id=k;ED[k].wu=Math.max(.5,ED[k].wu*1.35)}
const DR={
 ash:()=>{FR(-5,10,2,6,'#f84');FR(3,14,2,5,'#f84');PL([-7,0,-9,-7,-4,0],'#222');PL([7,0,9,-7,4,0],'#222');FR(7,12,13,2,'#caa');FR(18,11,3,4,'#f84')},
 cinder:()=>{PL([-8,2,0,-9,8,2],'#601a10');const y=4+Math.sin(time*4)*2;FR(9,y,5,5,'#fa3');FR(10,y+1,3,3,'#ff0')},
 stalker:()=>{FR(-9,-2,3,5,'#cff');FR(-3,-4,3,6,'#cff');FR(3,-2,3,4,'#cff');FR(7,13,5,2,'#fff')},
 frozen:()=>{FR(5,6,7,16,'#9ad');FR(6,7,5,14,'#cfe');FR(-7,-1,14,3,'#bde')},
 archer:()=>{cx.strokeStyle='#a86';cx.lineWidth=1.5;cx.beginPath();cx.arc(8,11,9,-1.3,1.3);cx.stroke();FR(8,2,1,18,'#ddd');PL([-7,8,-12,22,-4,20],'#5a5a8a')},
 wisp:()=>{const fl=Math.sin(time*20)*3;cx.fillStyle='#ffe86a';cx.beginPath();cx.arc(0,7,6,0,7);cx.fill();FR(-3,5,6,4,'#fff');PL([-4,6,-14,-2+fl,-10,8],'#ffd');PL([4,6,14,-2+fl,10,8],'#ffd')},
 shade:()=>{PL([-7,18,-4,27,0,19,4,27,7,18],'#2a1a3a');FR(-2,4,2,3,'#fff')},
 hknight:()=>{FR(-12,6,6,6,'#8a7aa8');FR(6,6,6,6,'#8a7aa8');FR(-2,-6,4,7,'#a33');FR(9,12,18,3,'#8a7aa8');FR(25,10,2,7,'#c8f')}};
function biomeEnemies(){const r=rng(seed+55),keys=Object.keys(ED);
 for(let b=1;b<=NL;b++){const ks=keys.filter(k=>ED[k].b===b);let n=0,tr=0;
  while(n<26&&tr++<14000){const tx=6+r()*(W-12)|0,ty=ybF(b)+2+r()*(LAYER_H-3)|0,d=ED[ks[n%2]],fly=d.k==='fly';
   const ok=fly?(ty>18&&!solid(tx,ty)&&!solid(tx,ty-1)&&!solid(tx,ty+1)):(!solid(tx,ty)&&!solid(tx,ty-1)&&solid(tx,ty+1));
   if(!ok||inAB(tx,ty,3))continue;
   const ly=Math.max(0,((ty-24)/22)|0),el=r()<.18+.04*ly,w=(d.w||14)*(el?1.2:1),h=(d.h||22)*(el?1.2:1),hp=Math.round(d.hp*(el?1.9:1)*(1+.25*ly));
   enemies.push({def:d,id:d.id,el,x:tx*T,y:fly?ty*T:(ty+1)*T-h,w,h,vx:0,vy:0,hp,max:hp,post:0,pmax:d.pm*(el?1.3:1),st:'idle',t:0,face:1,lvl:b+2+ly+(el?1:0),dm:1+.14*ly,dead:false,hit:false,home:tx*T,cool:0});n++}}}
const boxSolid=(x,y,w,h)=>solid(x/T|0,y/T|0)||solid((x+w-1)/T|0,y/T|0)||solid(x/T|0,(y+h-1)/T|0)||solid((x+w-1)/T|0,(y+h-1)/T|0);
function fm(e,vx,vy,dt){const nx=e.x+vx*dt;if(!boxSolid(nx,e.y,e.w,e.h))e.x=nx;const ny=e.y+vy*dt;if(!boxSolid(e.x,ny,e.w,e.h))e.y=ny}
function updE2(e,dt){if(e.dead)return;const d=e.def;if(e.st==='windup'&&e.pst!=='windup'){e.tw=Math.max(e.t,.3);Audio_.beep(d.k==='ranged'?520:220,.2,'sawtooth',.07)}e.pst=e.st;const dx=P.x-e.x,dist=Math.abs(dx),fly=d.k==='fly';e.t-=dt;e.cool=(e.cool||0)-dt;e.slow=Math.max(0,(e.slow||0)-dt);if(e.kb>0){e.kb-=dt;e.kbv*=Math.pow(.03,dt);e.vx=e.kbv;if(d.k==='fly'){e.vy*=Math.pow(.05,dt);fm(e,e.vx,e.vy,dt)}else move(e,dt);return}
 const sees=dist<240&&Math.abs(P.y-e.y)<140,sp=d.spd*(e.slow>0?.5:1);e.post=Math.max(0,e.post-(e.st==='stagger'?0:6*dt));
 if(e.post>=e.pmax&&e.st!=='broken'){e.st='broken';e.t=2;e.post=0;sfx.guard();burst(e.x+7,e.y+8,14,'#fc6')}
 switch(e.st){
 case'idle':e.vx=0;if(fly)e.vy=0;if(sees)e.st='chase';break;
 case'chase':e.face=dx>0?1:-1;
  if(fly){e.vx=Math.sign(P.x-e.x)*sp*.7;e.vy=Math.max(-1,Math.min(1,(P.y-46-e.y)/20))*sp*.6;if(e.cool<=0&&sees&&dist<200){e.st='windup';e.t=d.wu;e.tx=P.x+6;e.ty=P.y+11}}
  else if(d.k==='ranged'){e.vx=dist<100?-e.face*sp:dist>170?e.face*sp:0;if(e.hitWall&&e.onGround)e.vy=-340;if(e.cool<=0&&sees&&dist<230){e.st='windup';e.t=d.wu;e.vx=0}}
  else if(d.k==='tele'){e.vx=e.face*sp;if(e.cool<=0&&dist<170&&sees){const nx=P.x+(P.face>0?-30:30);if(!boxSolid(nx,P.y,e.w,e.h)){burst(e.x+7,e.y+10,10,'#a8f');e.x=nx;e.y=P.y+22-e.h;e.vx=0;burst(e.x+7,e.y+10,10,'#a8f');e.st='windup';e.t=d.wu}}else if(dist<d.rng&&e.onGround){e.st='windup';e.t=d.wu;e.vx=0}}
  else{e.vx=e.face*sp;if(e.hitWall&&e.onGround)e.vy=-340;if(dist<d.rng&&e.onGround){e.st='windup';e.t=d.wu;e.vx=0}}
  if(!sees&&dist>320)e.st='idle';break;
 case'windup':e.vx=0;if(fly)e.vy=0;e.face=dx>0?1:-1;
  if(e.t<=0){e.st='attack';e.hit=false;e.t=fly?.5:.16;
   if(d.k==='ranged'){const n=e.el?3:1,b=Math.atan2(P.y+11-(e.y+11),P.x+6-(e.x+7));for(let i=0;i<n;i++){const a=b+(i-(n-1)/2)*.25;proj(e.x+7,e.y+8,Math.cos(a)*d.ps,Math.sin(a)*d.ps,(d.dmg*(e.dm||1)),d.pc,d.pd,3)}}
   if(fly){const a=Math.atan2(e.ty-(e.y+7),e.tx-(e.x+7));e.vx=Math.cos(a)*270;e.vy=Math.sin(a)*270}}break;
 case'attack':
  if(fly){if(!e.hit&&Math.hypot(e.x+7-(P.x+6),e.y+7-(P.y+11))<14){e.hit=true;hurtPlayer((d.dmg*(e.dm||1)),d.pd,e)}}
  else if(d.k!=='ranged'&&!e.hit&&Math.abs(e.x+e.w/2+e.face*14-(P.x+6))<22&&Math.abs(e.y+e.h-(P.y+22))<26){e.hit=true;hurtPlayer((d.dmg*(e.dm||1)),d.pd,e)}
  if(e.t<=0){e.st='recover';e.t=fly?1:.6;e.cool=d.k==='ranged'?2.2:fly?2:1.2}break;
 case'recover':e.vx*=.8;e.vy=fly?-30:e.vy;if(e.t<=0){if(e.el&&!e.again&&d.k!=='ranged'){e.again=1;e.st='windup';e.t=.45;e.tx=P.x+6;e.ty=P.y+11}else{e.again=0;e.st='chase'}}break;
 case'stagger':e.vx=0;if(e.t<=0)e.st='chase';break;
 case'broken':e.vx=0;if(fly)e.vy=200;if(e.t<=0)e.st='chase';break}
 if(fly)fm(e,e.vx,e.vy,dt);else move(e,dt)}
// ---------- bosses ----------
const BD={
ember:{n:'The Ember Tyrant',tier:1,hp:15000,pmax:500,w:38,h:56,spd:70,dmg:45,pd:28,reach:84,jv:430,zc:'255,138,26',wpn:'infernal',col:['#4a1a14','#8a2a1a'],amb:3.2,aw:26,a1:['slam','sweep','pillars','nova'],a2:['slam','sweep','pillars','dash','nova','wall','spiral']},
 glacial:{n:'The Glacial Devourer',tier:2,hp:25000,pmax:700,w:60,h:38,spd:55,dmg:60,pd:34,reach:76,jv:540,zc:'140,215,255',wpn:'frostbite',col:['#6aa0d0','#bfe4ff'],sn:3,ps:165,amb:2.8,aw:60,a1:['slam','shoot','icicles','sweep','nova'],a2:['slam','shoot','icicles','sweep','icicles','wall','spiral','nova']},
 tempest:{n:'The Tempest Dragon',tier:3,hp:55000,pmax:900,w:84,h:36,fly:1,spd:90,dmg:90,pd:28,reach:60,zc:'255,255,120',wpn:'stormpiercer',col:['#3a4a98','#5a6ac0'],sn:3,ps:180,amb:2.5,aw:18,a1:['dash','shoot','bolts','nova'],a2:['dash','shoot','bolts','chain','nova','spiral','wall']},
 hollow:{n:'The Hollow King',tier:4,hp:85000,pmax:1500,w:22,h:44,spd:85,dmg:90,pd:32,reach:64,zc:'170,120,255',wpn:'voidfang',col:['#2a2438','#6a5a8a'],sn:2,ps:185,ctr:1,amb:4,aw:30,a1:['tele','sweep','shoot','wall'],a2:['tele','sweep','shoot','clones','nova','wall','spiral']}};
const bcx=B=>B.x+B.w/2,bcy=B=>B.y+B.h/2;
for(const k in BD){BD[k].dmg=Math.round(BD[k].dmg*1.12)}
const bdm=B=>B.def.dmg*(B.er||1);
function bhit(B,r,dm){const dx=P.x+6-bcx(B),dy=P.y+11-bcy(B);if(Math.hypot(dx,dy)<r&&dx*B.face>-10)hurtPlayer(bdm(B)*dm*(B.dm||1),B.def.pd,B)}
function bzone(B,x,t,w,sp){const a=B.ar;zone(x,(a.fy-a.ht)*T,a.fy*T,w,t,bdm(B),B.def.zc,sp)}
const AT={
 slam:{wu:.9,act:1.1,rec:1.3,f(B){B.vy=-B.def.jv;B.vx=Math.max(-260,Math.min(260,(P.x-B.x)*1.3));B.land=1},
  tk(B){if(B.land&&B.onGround&&B.vy>=0){B.land=0;shake=9;sfx.hit();burst(bcx(B),B.y+B.h,16,'rgb('+B.def.zc+')');B.vx=0;const gy=B.y+B.h-5,c='rgb('+B.def.zc+')';proj(bcx(B),gy,170,0,bdm(B)*.8,c,14,6);proj(bcx(B),gy,-170,0,bdm(B)*.8,c,14,6);if(Math.abs(P.x-bcx(B))<60&&P.onGround)hurtPlayer(bdm(B),B.def.pd*1.5,B)}}},
 sweep:{wu:.75,act:.3,rec:1.0,f(B){B.face=P.x>bcx(B)?1:-1},tk(B){if(!B.hit&&B.t<.27){B.hit=true;shake=5;sfx.hit();bhit(B,B.def.reach,1.2)}}},
 pillars:{wu:.8,act:1.5,rec:1.3,f(B){[-110,-55,0,55,110].forEach((o,i)=>bzone(B,P.x+6+o*(B.ph===2?1.2:1),1.1+i*.12,24))}},
 dash:{wu:.8,act:.7,rec:1.4,f(B){if(B.def.fly){const a=Math.atan2(P.y+11-bcy(B),P.x+6-bcx(B));B.vx=Math.cos(a)*380;B.vy=Math.sin(a)*380}else{B.face=P.x>bcx(B)?1:-1;B.vx=B.face*340}},
  tk(B,dt){if(B.def.fly){B.x+=B.vx*dt;B.y+=B.vy*dt;B.y=Math.min(B.y,B.ar.fy*T-B.h)}
   if(!B.hit&&Math.abs(bcx(B)-(P.x+6))<B.w/2+8&&Math.abs(bcy(B)-(P.y+11))<B.h/2+12){B.hit=true;hurtPlayer(bdm(B)*1.2,B.def.pd,B)}}},
 shoot:{wu:.6,act:.5,rec:.9,f(B){const d=B.def,n=d.sn+(B.ph===2?2:0),b=Math.atan2(P.y+11-bcy(B),P.x+6-bcx(B));for(let i=0;i<n;i++){const a=b+(i-(n-1)/2)*.22;proj(bcx(B),bcy(B),Math.cos(a)*d.ps,Math.sin(a)*d.ps,d.dmg*(B.er||1)*.7,'rgb('+d.zc+')',d.pd*.6,5)}}},
 icicles:{wu:.9,act:1.7,rec:1.2,f(B){const a=B.ar;for(let i=0;i<10;i++)bzone(B,(a.cx+(Math.random()-.5)*a.hw*1.8)*T,1.2+i*.1,16);bzone(B,P.x+6,1.3,16)}},
 bolts:{wu:.7,act:1.3,rec:1.2,f(B){[0,60,-60,(Math.random()-.5)*160].forEach((o,i)=>bzone(B,P.x+6+o,.9+i*.12,14))}},
 chain:{wu:.8,act:2.6,rec:1.3,f(B){const dr=Math.random()<.5?1:-1;for(let i=0;i<7;i++)bzone(B,P.x+6+dr*i*52,.8+i*.26,22)}},
 tele:{wu:.5,act:1.2,rec:.9,f(B){B.vis=.12;const tx=P.x+6+(P.face>0?-34:34);B.tp=tx-B.w/2;B.tl=1;bzone(B,tx,1,44,true)},
  tk(B,dt){B.tl-=dt;if(B.tp!=null&&B.tl<=0){B.x=B.tp;B.tp=null;B.vis=1;B.face=P.x>bcx(B)?1:-1;burst(bcx(B),bcy(B),14,'#a8f')}}},
 clones:{wu:.6,act:2.0,rec:1.1,f(B){[-70,70,0].forEach((o,i)=>bzone(B,P.x+6+o,1+i*.4,44,true))}},
 // --- harder patterns ---
 nova:{wu:.9,act:.7,rec:1.1,f(B){const d=B.def,n=B.fury?20:B.ph===2?16:12,o=Math.random()*6.283,sp=d.ps||150;for(let i=0;i<n;i++){const a=o+i/n*6.283;proj(bcx(B),bcy(B),Math.cos(a)*sp,Math.sin(a)*sp,d.dmg*(B.er||1)*.6,'rgb('+d.zc+')',d.pd*.5,5)}shake=Math.max(shake,4)}},
 wall:{wu:1.0,act:1.8,rec:1.2,f(B){const a=B.ar,x0=(a.cx-a.hw+2)*T,x1=(a.cx+a.hw-2)*T,pass=B.fury?3:B.ph===2?2:1;for(let k=0;k<pass;k++){const gc=Math.max(x0+60,Math.min(x1-60,P.x+6+(k?(Math.random()<.5?-1:1)*(120+Math.random()*120):(Math.random()-.5)*60))),t=1.3+k*.75;for(let x=x0;x<x1;x+=34)if(Math.abs(x-gc)>48)bzone(B,x,t,36)}shake=Math.max(shake,3)}},
 spiral:{wu:.8,act:2.4,rec:1.2,f(B){B.sa=Math.random()*6.283;B.sn_=0},tk(B,dt){B.sn_-=dt;if(B.sn_<=0){B.sn_=B.fury?.07:B.ph===2?.09:.13;B.sa+=.52;const d=B.def,arms=B.fury?3:B.ph===2?2:1,sp=(d.ps||150)*.9;for(let i=0;i<arms;i++){const a=B.sa+i*6.283/arms;proj(bcx(B),bcy(B),Math.cos(a)*sp,Math.sin(a)*sp,d.dmg*(B.er||1)*.5,'rgb('+d.zc+')',d.pd*.4,4)}}}}};
function mkBosses(){enemies=enemies.filter(e=>!e.boss);for(const a of ARENAS){if(bossDead[a.id])continue;const d=BD[a.id];
 enemies.push({boss:1,id:a.id,def:d,ar:a,x:a.cx*T-d.w/2,y:a.fy*T-d.h-2,w:d.w,h:d.h,vx:0,vy:0,hp:d.hp,max:d.hp,post:0,pmax:d.pmax,st:'dormant',t:0,twu:1,face:-1,ph:1,fury:0,chain:0,atk:'',lastA:'',dead:false,vis:1,flash:0,lvl:6})}}
function resetBosses(){mkBosses();zones=[];projs=[]}
function addCache(a){chests.push({tx:a.cx,ty:a.fy-1,type:4,hp:CH[4].hp,max:CH[4].hp,flash:0,k:'cache'+a.id})}
CH[4]={n:'Boss Treasure Cache',hp:60,g:150,w:1,a:1,minr:3,maxar:4,c1:'#8a6a1a',c2:'#d9a441',c3:'#fff'};
function bsfx(k){if(k===1){Audio_.beep(55,.9,'sawtooth',.14);Audio_.beep(80,.7,'square',.08)}else if(k===2)Audio_.beep(40,1.2,'sawtooth',.14);else[400,500,650,800].forEach((f,i)=>setTimeout(()=>Audio_.beep(f,.25,'triangle',.1),i*140))}
function hover(B,dt,still){const a=B.ar,tx=P.x+6-B.w/2+(still?0:Math.sin(time*1.5)*60),ty=a.fy*T-120+Math.sin(time*2)*8;B.x+=(tx-B.x)*dt*1.5;B.y+=(ty-B.y)*dt*2}
function updBoss(B,dt){if(B.dead)return;const d=B.def,a=B.ar,fy=a.fy*T,m=B.fury?.55:B.ph===2?.68:1;B.er=B.fury?1.65:B.ph===2?1.35:1;B.t-=dt;B.flash=Math.max(0,B.flash-dt);if(B.st==='tele'&&B.pst!=='tele'){Audio_.beep(150,.3,'sawtooth',.1);Audio_.beep(300,.2,'square',.06)}B.pst=B.st;
 const inA=Math.abs(P.x/T-a.cx)<a.hw+1&&P.y/T>a.fy-a.ht-1&&P.y/T<a.fy+1;
 if(B.st==='dormant'){if(!inA)return;B.st='intro';B.t=3;B.face=P.x>B.x?1:-1;shake=10;toast(d.n);bsfx(1)}
 if(!['intro','dying','phase','broken'].includes(B.st)&&B.post>=B.pmax){B.st='broken';B.t=2.8;B.post=0;B.vx=0;shake=9;sfx.guard();burst(bcx(B),bcy(B),20,'#fc4');float(B.x,B.y-10,'POSTURE BREAK','#fc4')}
 if(B.st!=='broken'&&B.st!=='stagger')B.post=Math.max(0,B.post-5*dt);
 if(Math.random()<.25&&B.st!=='dormant')parts.push({x:B.x+Math.random()*B.w,y:B.y+Math.random()*B.h,vx:0,vy:-30,l:.5,c:'rgb('+d.zc+')'});
 if(B.fury&&Math.random()<.6)parts.push({x:B.x+Math.random()*B.w,y:B.y+Math.random()*B.h,vx:(Math.random()-.5)*60,vy:-60,l:.6,c:'#ff3a2a'});
 switch(B.st){
 case'intro':B.vis=1-B.t/3;if(Math.random()<.3)shake=Math.max(shake,3);if(B.t<=0){B.st='idle';B.t=.8;B.vis=1}break;
 case'phase':B.vx=0;if(Math.random()<.5)burst(bcx(B),bcy(B),4,'rgb('+d.zc+')');shake=Math.max(shake,4);if(B.t<=0){B.st='idle';B.t=.4}break;
 case'idle':B.face=P.x>bcx(B)?1:-1;if(d.fly)hover(B,dt,0);else{const dist=P.x-bcx(B);B.vx=Math.abs(dist)>60?B.face*d.spd*(1+((B.er||1)-1)*.8):0}
  if(B.t<=0){const L=B.ph===2?d.a2:d.a1;let k;do k=L[Math.random()*L.length|0];while(k===B.lastA&&L.length>1);B.lastA=k;B.atk=k;B.st='tele';B.twu=B.t=AT[k].wu*m*1.15;B.vx=0}break;
 case'tele':B.vx=0;if(['nova','spiral','wall'].includes(B.atk)&&Math.random()<.5)burst(bcx(B),bcy(B),2,'rgb('+d.zc+')');if(!d.fly&&B.atk!=='dash')B.face=P.x>bcx(B)?1:-1;if(d.fly)hover(B,dt,1);
  if(B.t<=0){B.hit=false;B.dm=B.ctr?1.3:1;B.ctr=0;AT[B.atk].f(B);B.st='act';B.t=AT[B.atk].act}break;
 case'act':{const A=AT[B.atk];A.tk&&A.tk(B,dt);if(B.t<=0){B.st='rec';B.t=A.rec*m;B.vx*=.3}break}
 case'rec':B.vx*=Math.pow(.02,dt);if(d.fly)hover(B,dt,0);if(B.t<=0){const mc=B.fury?3:B.ph===2?2:1;if((B.chain||0)<mc&&Math.random()<(B.fury?.75:B.ph===2?.6:.25)){B.chain=(B.chain||0)+1;const L=B.ph===2?d.a2:d.a1;let k;do k=L[Math.random()*L.length|0];while(k===B.lastA&&L.length>1);B.lastA=k;B.atk=k;B.st='tele';B.twu=B.t=AT[k].wu*m*.8;B.vx=0}else{B.chain=0;B.st='idle';B.t=B.fury?.25:B.ph===2?.4:.8}}break;
 case'broken':B.vx=0;if(d.fly)B.y+=(fy-B.h-B.y)*Math.min(1,dt*4);if(B.t<=0){B.st='idle';B.t=.8}break;
 case'stagger':B.vx=0;if(B.t<=0){B.st='idle';B.t=.5}break;
 case'dying':if(Math.random()<.5)burst(B.x+Math.random()*B.w,B.y+Math.random()*B.h,8,Math.random()<.5?'#fff':'rgb('+d.zc+')');shake=Math.max(shake,5);if(B.t<=0)finishBoss(B);break}
 if(B.ph===2&&['idle','tele','act','rec'].includes(B.st)){B.az=(B.az||0)-dt;if(B.az<=0){B.az=d.amb*(B.fury?.5:.8);for(let q=0;q<(B.fury?2:1);q++)zone((a.cx+(Math.random()-.5)*a.hw*1.8)*T,(a.fy-a.ht)*T,fy,d.aw,1.5,14*(B.er||1),d.zc)}}
 if(!d.fly)move(B,dt);B.x=Math.max((a.cx-a.hw)*T+4,Math.min((a.cx+a.hw)*T-B.w-4,B.x));if(d.fly)B.y=Math.max((a.fy-a.ht+3)*T,Math.min(fy-B.h,B.y))}
function hitBoss(B){if(['dormant','intro','phase','dying'].includes(B.st))return;const d=B.def;
 let dm=dmgOut()*(P.combo===2?1.3:1),pd=14*wd().pd*(1+S.pdmg);
 if(B.st==='broken'){dm*=2.2;pd=0;float(B.x,B.y-14,'CRIT','#fa3')}else if(B.st==='rec'||B.st==='stagger')dm*=1.3;else if(B.st==='tele')pd*=1.5;
 if(d.ctr&&B.st==='tele'&&B.atk==='sweep'){B.t=0;B.ctr=1;float(B.x,B.y-24,'COUNTER!','#c8f')}
 if(B.fury)dm*=.85;else if(B.ph===2)dm*=.92;B.hp-=dm;B.post+=pd;B.flash=.08;wfx(B,dm);sfx.hit();shake=Math.max(shake,2);burst(bcx(B),bcy(B),6,'rgb('+d.zc+')');float(B.x+B.w/2,B.y-6,Math.round(dm),'#fff');
 if(B.hp<=B.max*.5&&B.ph===1&&B.hp>0){B.ph=2;B.st='phase';B.t=1.8;B.vx=0;zones=[];projs=[];toast(d.n+' is enraged!');bsfx(2);B.hp=Math.min(B.max,B.hp+B.max*.06)}
 if(B.ph===2&&!B.fury&&B.hp<=B.max*.25&&B.hp>0){B.fury=1;B.st='phase';B.t=1.2;B.vx=0;zones=[];projs=[];toast(d.n+': FINAL FURY!');bsfx(2);shake=12;B.hp=Math.min(B.max,B.hp+B.max*.03)}
 if(B.hp<=0){B.st='dying';B.t=3.2;B.vx=0;zones=[];projs=[];toast('...');bsfx(2)}}
function finishBoss(B){const d=B.def,a=B.ar;B.dead=true;bossDead[B.id]=1;applyGateLocks();qEv('boss',B.id);burst(bcx(B),bcy(B),50,'#fff');burst(bcx(B),bcy(B),40,'rgb('+d.zc+')');shake=14;for(let i=0;i<70;i++){const a=i/70*6.283;parts.push({x:bcx(B),y:bcy(B),vx:Math.cos(a)*280,vy:Math.sin(a)*280,l:.9,c:i%2?'#fff':'rgb('+d.zc+')'})}
 const w={id:uid++,type:'weapon',kind:d.wpn,name:WN[d.wpn],rar:4,dmg:WK[d.wpn].bd,speed:1,unique:1};inv.push(w);gold+=150*d.tier;gainXp(300*d.tier);
 {const bi=ARENAS.findIndex(q=>q.id===B.id),nx=LN[bi+2];toast('You obtained '+w.name);bossBanner(d.n,nx?'The gate to the '+nx+' Depths is unsealed':'The Ashfall Depths are conquered')}bsfx(3);addCache(a);save()}
// ---------- boss/enemy rendering ----------
const AD=f=>{cx.save();cx.globalCompositeOperation='lighter';f();cx.restore()};
const orb=(x,y,r,c)=>AD(()=>glow(x,y,r,c));
function flame(x,y,w,h,k=0,c=['#c8300e','#ff8a1a','#ffe08a']){for(let i=0;i<3;i++){const s=1-i*.3,fl=Math.sin(time*13+k+i*2)*w*.25;PL([x-w/2*s,y,x+fl,y-h*s,x+w/2*s,y],c[i])}}
function bolt(x1,y1,x2,y2,c,lw=1.5){cx.strokeStyle=c;cx.lineWidth=lw;cx.beginPath();cx.moveTo(x1,y1);for(let i=1;i<5;i++){const t=i/5;cx.lineTo(x1+(x2-x1)*t+(Math.random()-.5)*10,y1+(y2-y1)*t+(Math.random()-.5)*10)}cx.lineTo(x2,y2);cx.stroke()}
Object.assign(BD.ember,{sub:'Lord of the Cinder Throne'});Object.assign(BD.glacial,{sub:'Hunger of the Frozen Deep'});Object.assign(BD.tempest,{sub:'Wrath Upon the Wind'});Object.assign(BD.hollow,{sub:'Sovereign of the Empty Crown'});
const BS={
 ember(B,p,ac,st){const c=B.def.col,en=B.ph===2,pu=.5+.5*Math.sin(time*(en?10:4)),br=st==='broken';
  orb(0,26,64+pu*16,'rgba(255,'+(en?50:100)+',10,'+(.3+.15*pu)+')');
  for(let i=0;i<8;i++){const w=Math.sin(time*5+i*.8)*3;PL([-17+i*4.4,12,-15+i*4.4+w,46+i%3*6,-12+i*4.4,12],i%2?'#d8420f':'#8a1a0a')}
  for(const s of[-1,1]){FR(s*8-5,38,10,18,'#1a0806');FR(s*8-6,50,12,6,'#2a0e0a');FR(s*8-1,41,2,9,'#ff7a1a')}
  FR(-17,14,34,26,c[0]);FR(-13,16,26,8,c[1]);FR(-15,30,30,4,'#2a0e0a');
  cx.strokeStyle='rgb(255,'+(140+pu*90|0)+',30)';cx.lineWidth=1.5;cx.beginPath();cx.moveTo(-12,30);cx.lineTo(-6,24);cx.lineTo(-9,18);cx.moveTo(10,32);cx.lineTo(5,26);cx.lineTo(12,20);cx.moveTo(0,36);cx.lineTo(-2,29);cx.stroke();
  orb(0,26,18,'rgba(255,200,80,'+(.6+.3*pu)+')');FR(-5,22,10,10,'#ff8a1a');FR(-3,24,6,6,'#ffe08a');
  for(const s of[-1,1]){PL([s*12,18,s*26,14,s*24,2,s*16,6,s*10,0],c[1]);PL([s*18,8,s*22,-8,s*14,4],'#222');flame(s*21,6,10,18+pu*5,s*3)}
  FR(-9,-2,18,17,c[1]);FR(-11,2,3,12,c[0]);FR(8,2,3,12,c[0]);FR(-9,12,18,3,'#2a0e0a');
  PL([-9,2,-20,-4,-23,-18,-14,-9,-8,-4],'#1a0806');PL([9,2,20,-4,23,-18,14,-9,8,-4],'#1a0806');
  for(let i=-2;i<=2;i++)flame(i*4,-2,6,12+(2-Math.abs(i))*5+pu*4,i);
  const ec=br?'#aaa':en?'#ff3a1a':'#ffd23a';FR(-6,5,5,3,ec);FR(1,5,5,3,ec);orb(-3,6,14,'rgba(255,180,40,.7)');orb(4,6,14,'rgba(255,180,40,.7)');FR(-3,11,6,2,'#ff8a1a');
  const ang=st==='tele'?-.7-p*1.7:st==='act'?-2.4+ac*3.3:st==='rec'?.9:st==='broken'?1.4:-.7+Math.sin(time*2)*.08;
  cx.save();cx.translate(12,24);cx.rotate(ang);FR(-5,-4,12,8,'#222');PL([7,-8,64,-11,90,0,64,11,7,8],'#3a1410');PL([9,-5,64,-7,84,0,64,7,9,5],'#8a2a1a');FR(8,-1,76,2,'#ffd04a');
  for(let k=0;k<6;k++){flame(16+k*11,-8,8,10+Math.sin(time*9+k)*4,k);PL([14+k*11,8,17+k*11,14,20+k*11,8],'#ff6a1a')}
  orb(84,0,26,'rgba(255,140,30,'+(st==='act'?.9:.5)+')');cx.restore();
  if(br)for(let k=0;k<5;k++)FR(-14+k*7,-4-(time*30+k*9)%24,2,2,'#ffd23a')},
 glacial(B,p,ac,st){const c=B.def.col,en=B.ph===2,pu=.5+.5*Math.sin(time*3),j=st==='tele'?p*10:st==='act'?12:st==='broken'?-3:Math.sin(time*2)*1.5;
  orb(0,22,76,'rgba('+(en?'200,140':'120,210')+',255,'+(.22+.1*pu)+')');
  PL([-28,16,-52,6+Math.sin(time*3)*4,-62,0,-50,20,-28,30],c[0]);PL([-52,6,-62,-10,-56,2],'#e8f8ff');PL([-44,17,-50,29,-38,24],'#e8f8ff');
  FR(-22,30,11,12,'#3a6a98');FR(8,30,11,12,'#3a6a98');
  FR(-31,8,62,26,c[0]);FR(-31,24,62,10,'#4a80b0');FR(-28,10,56,6,c[1]);
  cx.strokeStyle='#e8f8ff';cx.lineWidth=1;cx.beginPath();cx.moveTo(-20,14);cx.lineTo(-14,22);cx.lineTo(-18,30);cx.moveTo(4,12);cx.lineTo(10,20);cx.lineTo(6,28);cx.moveTo(18,24);cx.lineTo(12,32);cx.stroke();
  orb(0,26,40,'rgba(150,230,255,'+(.18+.1*pu)+')');
  for(let i=0;i<8;i++){const h=14+(i%3)*7+(en?8:0),x=-27+i*7.6;PL([x-3.5,10,x,10-h,x+3.5,10],i%2?'#e8f8ff':'#9fd8ff');PL([x,10-h,x+3.5,10,x+.5,10],'#fff');orb(x,10-h+4,9,'rgba(150,230,255,.55)')}
  FR(-26,30,13,12,c[0]);FR(10,30,13,12,c[0]);for(const x of[-26,-22,10,14])FR(x,40,3,3,'#fff');
  FR(16,0,22,24,c[1]);PL([36,8,50,14,36,19],c[1]);FR(18,2,18,4,'#e8f8ff');
  PL([20,3,10,-12,27,1],'#e8f8ff');PL([29,1,27,-16,36,2],'#e8f8ff');
  FR(18,20+j,24,6,'#7ab');for(let k=0;k<5;k++){PL([20+k*4.5,20,22+k*4.5,25,24+k*4.5,20],'#fff');PL([21+k*4.5,20+j+1,23+k*4.5,16+j,25+k*4.5,20+j+1],'#fff')}
  FR(29,8,6,3,en?'#f0f':'#0ef');orb(32,9,16,'rgba(0,240,255,.85)');
  if(st==='tele'||st==='act')for(let k=0;k<9;k++){cx.fillStyle='rgba(210,245,255,'+(.55-k*.05)+')';cx.beginPath();cx.arc(48+k*6+Math.sin(time*20+k)*2,22+j*.5+Math.sin(time*13+k*2)*4,3+k*.9,0,7);cx.fill()}
  if(st==='broken')FR(-10,-4,20,3,'#ff4')},
 tempest(B,p,ac,st){const en=B.ph===2,ch=st==='tele',ca=st==='act',br=st==='broken',rc=st==='rec',t=time,pu=.5+.5*Math.sin(t*8),
  N0='#10152e',N1='#1c2450',N2='#2c3c78',B1='#2a56b0',B2='#4a84dc',B3='#8dbcf0',WH='#e2e8f8',W2='#a4b0d4',CY=en?'#d6f4ff':'#6fdcff',
  fa=br?7:rc?5+Math.sin(t*3)*3:ch?-9-p*9+Math.sin(t*26)*2:Math.sin(t*(ca?9:4.5))*(ca?15:10),
  wy=(x,y)=>y+fa*Math.max(0,10-y)/48,jaw=ch?p*9:ca?12:br?-1:2+Math.sin(t*2)*.8;
  orb(0,10,110,'rgba('+(en?'150,130':'70,160')+',255,'+(.2+.1*pu)+')');
  const wing=(dx,dy,sc,dark)=>{const S=[6+dx,8+dy],E=[-12,-38],Wr=[-48,-62],Ts=[[-98,-38],[-112,-4],[-100,22],[-68,30]],Sc=[[-90,-16],[-94,10],[-78,20]],
   tf=q=>[q[0]*sc+dx,wy(q[0],q[1])*sc+dy],pts=[S,tf(E),tf(Wr),tf(Ts[0]),tf(Sc[0]),tf(Ts[1]),tf(Sc[1]),tf(Ts[2]),tf(Sc[2]),tf(Ts[3]),[-18+dx,16+dy]],
   path=()=>{cx.beginPath();pts.forEach((q,i)=>i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1]));cx.closePath()};
   path();cx.fillStyle=dark?N1:B1;cx.fill();cx.save();path();cx.clip();
   for(const[x,y,r,k]of[[-60,-34,20,0],[-84,-12,18,1],[-92,12,16,2],[-52,-50,14,3],[-72,8,22,4],[-36,-16,16,5]]){const q=tf([x+Math.sin(t*.8+k)*3,y]);cx.fillStyle=dark?N2:B2;cx.beginPath();cx.arc(q[0],q[1],r*sc,0,7);cx.fill();cx.fillStyle=dark?B1:B3;cx.beginPath();cx.arc(q[0]-2,q[1]-3,r*.55*sc,0,7);cx.fill()}
   cx.restore();const e=tf(E),w=tf(Wr);cx.lineCap='round';cx.lineJoin='round';cx.strokeStyle=N0;cx.lineWidth=3.2*sc;cx.beginPath();cx.moveTo(S[0],S[1]);cx.lineTo(e[0],e[1]);cx.lineTo(w[0],w[1]);for(const T_ of Ts){const q=tf(T_);cx.moveTo(w[0],w[1]);cx.lineTo(q[0],q[1])}cx.stroke();cx.strokeStyle=N2;cx.lineWidth=1.1;cx.stroke();
   if(!dark){PL([w[0]-3,w[1]+3,w[0]+16,w[1]-14,w[0]+5,w[1]+7],WH);if(Math.random()<(en?.75:.45)){const a=tf([-30-Math.random()*60,-44+Math.random()*50]),b=tf([-40-Math.random()*60,-30+Math.random()*50]);bolt(a[0],a[1],b[0],b[1],'rgba(150,235,255,.95)',1.3)}}};
  wing(-7,-8,.82,1);
  let tx=0,ty=0;for(let i=0;i<=13;i++){const u=i/13,x=-26-u*70,y=18+u*9-u*u*13+Math.sin(t*2.6-u*5)*5*u,r=9.5*(1-u)+2.5;
   cx.fillStyle=i%2?N1:N2;cx.beginPath();cx.arc(x,y,r,0,7);cx.fill();cx.fillStyle=WH;cx.beginPath();cx.arc(x,y+r*.35,r*.62,0,3.14);cx.fill();
   if(i%2===0)PL([x+3,y-r+1,x-2,y-r-9-(1-u)*7,x-6,y-r+1],i%4?B3:WH);tx=x;ty=y}
  for(let k=0;k<6;k++){const a=-1.2+k*.34+Math.sin(t*4+k)*.1,l=32-Math.abs(k-2.5)*4,ex=tx-Math.cos(a)*l,ey=ty+Math.sin(a)*l,mx=tx-Math.cos(a)*l*.5,my=ty+Math.sin(a)*l*.5;
   PL([tx,ty-3,mx,my-5,ex,ey,mx+2,my+4,tx,ty+3],k%2?WH:B2);PL([tx,ty,mx,my,ex,ey],'rgba(120,225,255,.7)')}
  const leg=(x,s,c1,c2)=>{cx.fillStyle=c1;cx.beginPath();cx.arc(x,20,9,0,7);cx.fill();PL([x-6,22,x+6,22,x+5+s*.5,31,x-5+s*.5,32],c1);PL([x-5+s*.5,30,x+5+s*.5,30,x+4+s,36,x-4+s,36],c2);for(let k=0;k<3;k++)PL([x-6+s+k*4,35,x-4+s+k*4,40,x-2+s+k*4,35],WH)};
  leg(-14,-2,N0,N1);leg(20,2,N0,N1);
  PL([-30,16,-26,6,-8,3,10,5,24,9,31,16,27,26,8,29,-14,28,-28,24],N1);PL([-24,8,-6,5,12,7,22,11,4,12,-18,12],N2);
  for(let i=0;i<9;i++)for(let j=0;j<3;j++){FR(-24+i*6+(j%2)*3,11+j*5,3,2,N0);FR(-23+i*6+(j%2)*3,11+j*5,1,1,N2)}
  PL([-27,23,-8,27,10,26,27,23,22,29,6,32,-12,31,-28,28],WH);for(let i=0;i<8;i++)FR(-24+i*6.6,26,5,1,W2);
  for(let i=0;i<7;i++){const x=-26+i*8.5;PL([x-3,6,x-1,-5-(i%3)*3,x+5,5],i%2?WH:B3)}
  for(let i=0;i<6;i++){const x=22+i*4.6,y=12-i*2.4+Math.sin(t*2+i)*.8,r=9-i*.55;cx.fillStyle=i%2?N1:N2;cx.beginPath();cx.arc(x,y,r,0,7);cx.fill();cx.fillStyle=WH;cx.beginPath();cx.arc(x+1,y+r*.4,r*.6,0,3.14);cx.fill();PL([x-4,y-r+1,x-1,y-r-8,x+3,y-r+1],i%2?B3:WH)}
  // head
  PL([14,-8,28,-24,34,-34,30,-22,22,-8],'#0000');
  PL([46,-6,30,-12,16,-26,12,-32,26,-24,42,-13],WH);PL([48,-3,36,-6,26,-12,32,-16,44,-9],W2);
  for(let k=0;k<3;k++)PL([48-k*4,-6,38-k*7,-12-k*2,40-k*7,-4],k%2?B3:CY);
  PL([42,-6,56,-10,70,-3,82,6,76,10,58,9,44,11],N1);PL([44,-5,56,-9,70,-3,58,-4],N2);PL([60,6,80,7,76,10,58,9],W2);
  PL([46,9,76,9+jaw,72,14+jaw,48,15],N2);PL([48,14,72,14+jaw,70,16+jaw,50,17],WH);
  for(let k=0;k<4;k++){FR(58+k*5,9,1.5,3,'#fff');FR(59+k*5,8+jaw,1.5,3,'#fff')}
  const ec=br?'#567':en?'#ff7aff':CY;FR(61,-3,6,3,ec);orb(64,-2,14,en?'rgba(255,140,255,.9)':'rgba(120,235,255,.9)');
  leg(-24,0,N1,N2);leg(12,3,N1,N2);
  wing(0,0,1,0);
  const cr=[[[-20,8],[-14,14],[-18,20],[-12,26]],[[-2,6],[3,13],[0,19],[6,26]],[[14,10],[10,16],[16,22]],[[-28,18],[-34,16],[-40,20]]];
  cx.lineWidth=1.2;for(const c of cr){cx.strokeStyle='rgba(120,225,255,'+(.5+.45*Math.sin(t*9+c[0][0]))+')';cx.beginPath();c.forEach((q,i)=>i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1]));cx.stroke()}
  AD(()=>{for(const c of cr)glow(c[1][0],c[1][1],8,'rgba(100,200,255,.28)')});
  if(Math.random()<(en?.7:.35)||ch){const x=-24+Math.random()*60,y=6+Math.random()*18;bolt(x,y,x+(Math.random()-.5)*30,y+(Math.random()-.5)*20,'rgba(170,240,255,.95)',1.2)}
  if(en)bolt(46,-10,46+(Math.random()-.5)*40,-30-Math.random()*16,'rgba(220,245,255,.9)',1);
  if(ch||ca){const r=10+(ch?p*24:20);orb(79,9+jaw/2,r,'rgba(150,230,255,.85)');orb(79,9+jaw/2,r*.4,'rgba(255,255,255,.95)')}
  if(br)for(let k=0;k<5;k++)FR(-20+k*10,-4-(t*30+k*9)%22,2,2,'#8df')},
 hollow(B,p,ac,st){const en=B.ph===2,pu=.5+.5*Math.sin(time*5),fl=Math.sin(time*3)*2,n=en?6:3;
  orb(0,24,64,'rgba(150,90,255,'+(.25+.15*pu)+')');
  PL([-9,10,-20+fl,30,-26+fl*2,48,-16,44,-12,50,-6,44,0,52,6,44,12,50,16,44,24-fl,48,19-fl,30,9,10],'#120c1e');
  PL([-6,12,-14,40,-9,46,-3,40,0,48,3,40,9,46,14,40,6,12],'#2a2040');
  FR(-8,12,16,22,'#1a1428');cx.fillStyle='#000';cx.beginPath();cx.arc(0,24,6,0,7);cx.fill();
  for(let k=0;k<4;k++){const a=time*3+k*1.57;FR(Math.cos(a)*5-1,24+Math.sin(a)*5-1,2,2,'#c8a8ff')}
  orb(0,24,18,'rgba(190,130,255,.75)');for(let k=0;k<3;k++)FR(-6,15+k*3,12,1,'#6a5a8a');
  for(const s of[-1,1]){PL([s*7,12,s*17,10,s*15,0,s*10,4],'#3a3050');PL([s*14,6,s*17,-6,s*11,3],'#6a5a8a')}
  FR(-6,0,12,12,'#d8d0e8');FR(-6,9,12,3,'#9a90b0');FR(-4,4,3,4,'#000');FR(1,4,3,4,'#000');FR(-3,5,1,2,'#cfe');FR(2,5,1,2,'#cfe');orb(-2,6,12,'rgba(160,255,240,.8)');orb(3,6,12,'rgba(160,255,240,.8)');
  const cy=-14+Math.sin(time*2)*2;PL([-9,cy+8,-9,cy-2,-5,cy+3,-2,cy-6,0,cy+2,2,cy-6,5,cy+3,9,cy-2,9,cy+8],'#d9a441');orb(0,cy+2,18,'rgba(255,200,80,.5)');
  for(let k=0;k<n;k++){const a=time*2+k*6.283/n,x=Math.cos(a)*28,y=24+Math.sin(a)*12;PL([x,y-4,x+2.5,y,x,y+4,x-2.5,y],'#b890ff');orb(x,y,8,'rgba(180,130,255,.6)')}
  const ang=st==='tele'?-.5-p*1.6:st==='act'?-2.1+ac*3:st==='rec'?.8:-.4;cx.save();cx.translate(8,22);cx.rotate(ang);FR(-3,-2,8,4,'#444');PL([5,-5,42,-3,56,0,42,3,5,5],'#4a3a78');PL([6,-3,42,-1,52,0,42,1,6,3],'#7a6aa8');FR(6,-1,46,1,'#e8d8ff');orb(52,0,22,'rgba(190,130,255,'+(st==='act'?.9:.5)+')');cx.restore()}};
function drawE(e,ox,oy,lights){const X=Math.round(e.x-ox),Y=Math.round(e.y-oy),f=e.face;if(X<-100||X>cv.width+100||Y<-100||Y>cv.height+100)return;
 if(e.boss){const B=e,d=B.def,p=B.st==='tele'?Math.max(0,Math.min(1,1-B.t/B.twu)):0,ac=B.st==='act'?Math.max(0,Math.min(1,1-B.t/AT[B.atk].act)):0;
  if(B.st==='dormant'){cx.fillStyle='rgba(0,0,0,.35)';cx.fillRect(X,Y+B.h-4,B.w,6);return}
  if(B.ph===2){cx.save();cx.translate(X+B.w/2,Y+B.h/2);cx.strokeStyle='rgba('+d.zc+',.55)';cx.lineWidth=2;cx.setLineDash([7,6]);cx.lineDashOffset=-time*34;cx.beginPath();cx.arc(0,0,Math.max(B.w,B.h)*.95+Math.sin(time*5)*3,0,7);cx.stroke();cx.lineDashOffset=time*22;cx.beginPath();cx.arc(0,0,Math.max(B.w,B.h)*1.2,0,7);cx.stroke();cx.restore()}
  let al=B.st==='dying'?((time*20|0)%2?.4:.9):B.st==='intro'?B.vis:(B.vis||1);cx.save();cx.globalAlpha=al;cx.translate(X+B.w/2,Y+(B.st==='intro'?(1-B.vis)*34:0)+(B.st==='dying'?Math.sin(time*50)*2:0));cx.scale(f,1);BS[B.id](B,p,ac,B.st);
  if(B.flash>0){cx.globalAlpha=.5;FR(-B.w/2,0,B.w,B.h,'#fff')}cx.restore();
  if(B.st==='tele')bossTele(B,X,Y,ox,oy);
  if(B.st==='broken'){cx.fillStyle='#fc4';for(let k=0;k<4;k++)cx.fillRect(X+B.w/2+Math.cos(time*6+k*1.6)*18-2,Y-12+Math.sin(time*6+k*1.6)*5,4,4)}
  lights.push([X+B.w/2,Y+B.h/2,120+(B.ph===2?50:0)]);return}
 return drawFoe(e,X,Y,lights);
 const d=e.def,c=d.c,wind=e.st==='windup',fl=e.flash>0||e.st==='stagger';
 cx.save();cx.translate(X+e.w/2,Y);cx.scale(f,1);if(d.id==='shade')cx.globalAlpha=.7;
 if(!d.nb){FR(-e.w/2+2,8,e.w-4,e.h-12,fl?'#fff':c[0]);FR(-e.w/2+2,e.h-6,4,6,c[0]);FR(e.w/2-6,e.h-6,4,6,c[0]);FR(-e.w/2+1,0,e.w-2,10,fl?'#fff':c[1]);FR(1,4,3,2,wind?'#f22':c[2])}
 DR[d.id]();if(wind){cx.fillStyle='rgba(255,40,40,'+(.25+.3*Math.sin(time*30))+')';cx.fillRect(-e.w/2,0,e.w,e.h)}
 if(e.el){cx.strokeStyle='#ffd36b';cx.lineWidth=1;cx.strokeRect(-e.w/2-1,-1,e.w+2,e.h+2);FR(-3,-6,6,3,'#fd5');lights.push([X+e.w/2,Y+e.h/2,40])}
 cx.restore();if(wind)enemyTele(e,X,Y);
 if(e.hp<e.max){FR(X,Y-6,e.w,3,'#300');FR(X,Y-6,e.w*e.hp/e.max,3,e.el?'#fd5':'#f44')}
 if(e.st==='broken'){cx.fillStyle='#fc4';cx.fillRect(X+e.w/2-2,Y-12,4,4)}}
const HINT={slam:'JUMP!',sweep:'PARRY / BACK OFF',pillars:'MOVE!',dash:'DODGE / JUMP',shoot:'BLOCK / DODGE',icicles:'MOVE!',bolts:'MOVE!',chain:'KEEP MOVING',tele:'LEAVE THE GHOST',clones:'WATCH THE GHOSTS'};
function bang(x,y,txt){const pu=(time*14|0)%2;PL([x,y-26,x+9,y-9,x-9,y-9],pu?'#ff2a2a':'#ffd23a');cx.fillStyle='#000';cx.fillRect(x-1,y-21,2,7);cx.fillRect(x-1,y-12,2,2);
 if(txt){cx.font='bold 10px Georgia';cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='#000';cx.strokeText(txt,x,y-31);cx.fillStyle='#fff';cx.fillText(txt,x,y-31);cx.textAlign='left'}}
function cue(x,y,r,p,t){cx.strokeStyle='rgba(255,60,60,'+(.4+.6*p)+')';cx.lineWidth=2;cx.beginPath();cx.arc(x,y,r*(1-p)+10,0,7);cx.stroke();
 if(t<.25){cx.strokeStyle='#fff';cx.lineWidth=3;cx.beginPath();cx.arc(x,y,r*.3,0,7);cx.stroke();cx.fillStyle='rgba(255,255,255,.22)';cx.fill()}}
const RED=p=>'rgba(255,50,50,'+(.1+.3*p)+')';
function aimLines(x,y,n,spread,len,p){const b=Math.atan2(P.y+11-y,P.x+6-x);cx.lineWidth=1.5;for(let i=0;i<n;i++){const a=b+(i-(n-1)/2)*spread;cx.strokeStyle='rgba(255,80,60,'+(.35+.5*p)+')';cx.setLineDash([6,4]);cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);cx.stroke()}cx.setLineDash([]);cx.fillStyle='rgba(255,120,60,'+(.3+.5*p)+')';cx.beginPath();cx.arc(x,y,4+8*p,0,7);cx.fill()}
function enemyTele(e,X,Y){const d=e.def,p=Math.max(0,Math.min(1,1-e.t/(e.tw||d.wu))),ecx=X+e.w/2,ecy=Y+e.h/2,f=e.face,feet=Y+e.h;
 if(d.k==='ranged')aimLines(ecx,ecy-3,e.el?3:1,.25,190,p);
 else if(d.k==='fly'){const a=Math.atan2((e.ty||P.y)-(e.y+7),(e.tx||P.x)-(e.x+7));cx.save();cx.translate(ecx,ecy);cx.rotate(a);cx.fillStyle=RED(p);cx.fillRect(0,-8,140,16);cx.strokeStyle='rgba(255,80,60,'+(.4+.5*p)+')';cx.lineWidth=1.5;cx.strokeRect(0,-8,140,16);cx.restore()}
 else{const x0=ecx+f*14-22;cx.fillStyle=RED(p);cx.fillRect(x0,feet-44,44,48);cx.strokeStyle='rgba(255,80,60,'+(.4+.5*p)+')';cx.lineWidth=1.5;cx.strokeRect(x0,feet-44,44,48);
  cx.fillStyle='rgba(255,40,40,'+(.25+.4*p)+')';cx.fillRect(x0,feet-44+48*(1-p),44,48*p)}
 cue(ecx,ecy,40,p,e.t);bang(ecx,Y-2,e.el?'ELITE':'')}
function bossTele(B,X,Y,ox,oy){const d=B.def,p=Math.max(0,Math.min(1,1-B.t/B.twu)),bx=X+B.w/2,by=Y+B.h/2,a=B.atk,f=B.face,fy=B.ar.fy*T-oy;
 if(a==='sweep'){cx.fillStyle=RED(p);cx.beginPath();cx.moveTo(bx,by);cx.arc(bx,by,d.reach,f>0?-1.57:1.57,f>0?1.57:4.71);cx.closePath();cx.fill();cx.strokeStyle='rgba(255,80,60,'+(.4+.5*p)+')';cx.lineWidth=2;cx.stroke();
  cx.fillStyle='rgba(255,50,50,'+(.2+.4*p)+')';cx.beginPath();cx.moveTo(bx,by);cx.arc(bx,by,d.reach*p,f>0?-1.57:1.57,f>0?1.57:4.71);cx.closePath();cx.fill()}
 else if(a==='slam'){const vx=Math.max(-260,Math.min(260,(P.x-B.x)*1.3)),lx=bx+vx*(2*d.jv/1500)-ox+ox,ar=B.ar,mx=Math.max((ar.cx-ar.hw+1)*T,Math.min((ar.cx+ar.hw-1)*T,lx+ox))-ox;
  cx.fillStyle='rgba(255,50,50,'+(.15+.35*p)+')';cx.fillRect(mx-B.w/2-6,fy-8,B.w+12,8);cx.strokeStyle='rgba(255,80,60,.9)';cx.lineWidth=2;cx.strokeRect(mx-B.w/2-6,fy-8,B.w+12,8);
  for(const sg of[-1,1])for(let k=0;k<3;k++){const ax=mx+sg*(B.w/2+14+k*12+(time*30%12));PL([ax,fy-12,ax+sg*8,fy-6,ax,fy-1],'rgba(255,170,60,'+(.7-.2*k)+')')}
  cx.setLineDash([3,5]);cx.strokeStyle='rgba(255,120,60,.6)';cx.beginPath();cx.moveTo(bx,by);cx.lineTo(mx,fy-8);cx.stroke();cx.setLineDash([])}
 else if(a==='dash'){if(d.fly){const an=Math.atan2(P.y+11-(B.y+B.h/2),P.x+6-(B.x+B.w/2));cx.save();cx.translate(bx,by);cx.rotate(an);cx.fillStyle=RED(p);cx.fillRect(0,-B.h/2,260,B.h);cx.strokeStyle='rgba(255,80,60,'+(.4+.5*p)+')';cx.strokeRect(0,-B.h/2,260,B.h);cx.restore()}
  else{const dr=P.x>bcx(B)?1:-1,w=240;cx.fillStyle=RED(p);cx.fillRect(dr>0?bx:bx-w,Y,w,B.h);cx.strokeStyle='rgba(255,80,60,'+(.4+.5*p)+')';cx.lineWidth=2;cx.strokeRect(dr>0?bx:bx-w,Y,w,B.h);for(let k=0;k<4;k++)PL([bx+dr*(40+k*50),by-9,bx+dr*(54+k*50),by,bx+dr*(40+k*50),by+9],'rgba(255,200,60,'+(.35+.5*p)+')')}}
 else if(a==='shoot')aimLines(bx,by,d.sn+(B.ph===2?2:0),.22,230,p);
 cx.save();cx.globalAlpha=.12+.25*Math.abs(Math.sin(time*(10+20*p)));cx.fillStyle='#f22';cx.fillRect(X,Y,B.w,B.h);cx.restore();
 cue(bx,by,Math.max(B.w,B.h)*.9,p,B.t);bang(bx,Y-6,HINT[a]||'')}
function bossHud(){if(P&&P.pcd>0){const sx=P.x-cam.x-2,sy=P.y-cam.y+30;FR(sx-1,sy-1,18,5,'#000c');FR(sx,sy,16*(1-P.pcd),3,'#8cf')}
 const B=enemies.find(e=>e.boss&&!e.dead&&e.st!=='dormant');if(!B)return;const w=cv.width,h=cv.height,d=B.def,bw=Math.min(420,w*.64),x=(w-bw)/2,y=30,col='rgb('+d.zc+')';
 cx.save();cx.textAlign='center';
 if(B.st==='intro'){const k=1-B.t/3,a=Math.min(1,k*5,B.t*1.5),bh=h*.14*Math.min(1,k*6);cx.globalAlpha=a*.92;cx.fillStyle='#000';cx.fillRect(0,0,w,bh);cx.fillRect(0,h-bh,w,bh);
  cx.globalAlpha=a;const g=cx.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(0,0,0,.8)');g.addColorStop(1,'rgba(0,0,0,0)');cx.fillStyle=g;cx.fillRect(0,h*.33,w,84);
  cx.shadowColor=col;cx.shadowBlur=22;cx.fillStyle='#ffe3a0';cx.font='bold 30px Georgia';cx.fillText(d.n.toUpperCase(),w/2,h*.33+40);cx.shadowBlur=0;cx.font='italic 13px Georgia';cx.fillStyle=col;cx.fillText(d.sub||'',w/2,h*.33+66);cx.fillRect(w/2-110,h*.33+49,220,1)}
 cx.globalAlpha=1;cx.font='bold 13px Georgia';cx.shadowColor='#000';cx.shadowBlur=4;cx.fillStyle='#ffd36b';cx.fillText('\u2020 '+d.n+(B.ph===2?'  \u2014  ENRAGED':'')+' \u2020',w/2,y-6);cx.shadowBlur=0;
 FR(x-3,y-3,bw+6,18,'#000');cx.strokeStyle=B.ph===2?col:'#7a5a2e';cx.lineWidth=1;cx.strokeRect(x-2.5,y-2.5,bw+5,17);FR(x,y,bw,12,'#1a0608');
 const hp=Math.max(0,B.hp/B.max),g2=cx.createLinearGradient(0,y,0,y+12);g2.addColorStop(0,B.ph===2?'#ff8a3a':'#e0303a');g2.addColorStop(1,B.ph===2?'#a01a0a':'#6a0a18');cx.fillStyle=g2;cx.fillRect(x,y,bw*hp,12);FR(x,y,bw*hp,2,'#ffffff44');
 FR(x+bw/2-1,y-3,2,18,'#ffd36b');for(const sx of[x-8,x+bw+2])PL([sx,y+6,sx+3,y-2,sx+6,y+6,sx+3,y+14],'#ffd36b');
 FR(x,y+14,bw*(B.post/B.pmax),4,B.st==='broken'?'#fff':'#ffd06a');cx.restore()}

// ---------- layers, ladders, spear thrust ----------
const ROM=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII'];let curLayer=0,hitSet=new Set();
function ladderPass(r){let nl=0;const inAr=(x,y)=>inAB(x,y,3);
 for(let x=3;x<W-4&&nl<(80*H/130|0);x++){let run=0;for(let y=30;y<=H-5;y++){
   const wall=tiles[y*W+x+1]>0&&tiles[y*W+x+1]<5,ok=tiles[y*W+x]===0&&wall&&!inAr(x,y);
   if(ok)run++;else{if(run>=7&&r()<.55){for(let k=1;k<=run;k++)tiles[(y-k)*W+x]=6;nl++;x+=2;break}run=0}}}}
function thrustHit(WD){const ux=Math.cos(P.aim),uy=Math.sin(P.aim),px=P.x+6,py=P.y+11;
 const lane=(cxp,cyp,rw,rh)=>{const ex=cxp-px,ey=cyp-py,al=ex*ux+ey*uy,pe=Math.abs(-ex*uy+ey*ux);
  if(al<-6||al>WD.reach*1.55+Math.max(rw,rh)/2||pe>8+Math.min(rw,rh)/2+3)return false;
  for(let q=8;q<al;q+=8)if(solid((px+ux*q)/T|0,(py+uy*q)/T|0))return false;return true};
 for(const e of enemies){if(e.dead||hitSet.has(e))continue;if(lane(e.x+e.w/2,e.y+e.h/2,e.w,e.h)){hitSet.add(e);hitEnemy(e);float(e.x,e.y-22,'PIERCE','#9ef')}}
 for(const c of chests){if(hitSet.has(c))continue;if(lane(c.tx*T+T,c.ty*T+8,32,16)){hitSet.add(c);hitChest(c)}}}
// ---------- run end, echoes menu, minimap ----------
const $m=id=>document.getElementById(id);
function updMenu(){$m('echoes').textContent='\u2756 Echoes: '+meta.echoes}
// ======================= QUESTS (Questwarden at spawn) =======================
let QS=null,questOpen=false,QG=null;
const QTIER=[{n:'Easy',c:'#8fe58f'},{n:'Medium',c:'#ffd36b'},{n:'Hard',c:'#ff6a5a'}];
function genQuest(tier){const ml=(P&&P.maxLy)||0,R=Math.random,ri=(a,b)=>a+Math.floor(R()*(b-a+1)),c=['kill','chest','parry'];
 if(tier>0)c.push('elite');
 const lt=[1,2+(R()<.5?1:0),3+(R()<.5?1:0)][tier];if(lt>ml)c.push('layer','layer');
 const alive=Object.keys(BD).filter(k=>!bossDead[k]);
 const type=c[R()*c.length|0],N={kill:[10,25,50],chest:[3,7,12],parry:[3,10,25],elite:[1,3,8]}[type];
 const q={tier,type,prog:0,state:'open',n:N?N[tier]:1};
 if(type==='layer')q.n=lt;
 if(type==='boss')q.bid=alive[R()*alive.length|0];
 q.rw=tier===0?{g:ri(90,160),x:70,acc:null,wpn:R()<.3?0:null,echo:0,life:false}
  :tier===1?(R()<.55?{g:ri(260,420),x:190,acc:[0,2],wpn:null,echo:0,life:false}:{g:ri(260,420),x:190,acc:null,wpn:R()<.5?1:2,echo:0,life:false})
  :{g:ri(700,1100),x:520,acc:[2,3],wpn:R()<.5?3:null,echo:ri(30,50),life:true};
 return q}
const newQS=()=>({slots:[genQuest(0),genQuest(1),genQuest(2)]});
const descQ=q=>q.type==='kill'?'Slay '+q.n+' enemies':q.type==='elite'?'Slay '+q.n+' elite '+(q.n>1?'enemies':'enemy'):q.type==='chest'?'Smash open '+q.n+' chests':q.type==='parry'?'Land '+q.n+' parries':q.type==='layer'?'Descend into the '+LN[q.n]+' Depths':'Slay '+BD[q.bid].n;
function rwText(q){const r=q.rw,o=[r.g+' gold',Math.round(r.x*(1+(P?P.lvl:1)*.15))+' XP'];
 if(r.echo)o.push(r.echo+' \u2756 echoes');if(r.life)o.push('+1 life');
 if(r.acc)o.push('Accessory ('+RAR[r.acc[0]][0]+(r.acc[1]>r.acc[0]?'\u2013'+RAR[r.acc[1]][0]:'')+')');
 if(r.wpn!=null)o.push('Weapon ('+RAR[r.wpn][0]+')');return o.join(' \u00b7 ')}
function qEv(t,x){if(!QS)return;for(const q of QS.slots){if(q.state!=='active')continue;let ch=0;
 if(q.type==='kill'&&t==='kill'){q.prog++;ch=1}
 else if(q.type==='elite'&&t==='kill'&&x&&x.el){q.prog++;ch=1}
 else if(q.type==='chest'&&t==='chest'){q.prog++;ch=1}
 else if(q.type==='parry'&&t==='parry'){q.prog++;ch=1}
 else if(q.type==='layer'&&t==='layer'){if(x>q.prog){q.prog=Math.min(x,q.n);ch=1}}
 else if(q.type==='boss'&&t==='boss'&&x===q.bid){q.prog=q.n;ch=1}
 if(ch&&q.prog>=q.n){q.prog=q.n;q.state='ready';toast('Quest complete! Return to the Questwarden (E)');sfx.level();save()}}}
function questPos(){const x=spawn.x-26;let ty=0;while(ty<H&&!solid(x/T|0,ty))ty++;return{x,y:ty*T}}
const nearQuest=()=>QG&&Math.abs(P.x+6-QG.x)<36&&Math.abs(P.y+22-QG.y)<30;
function refreshQ(){QS.slots.forEach((q,i)=>{if(q.state==='open'&&q.type==='boss'&&bossDead[q.bid])QS.slots[i]=genQuest(q.tier)})}
function openQuests(){questOpen=true;sheetOpen=true;paused=true;sheet.classList.remove('hidden');drawQuests()}
function drawQuests(){refreshQ();let h='<h1>THE QUESTWARDEN</h1><div><small style="font-style:italic">\u201cThree contracts, three prices. Try not to die owing me.\u201d</small><br>Gold: <b style="color:#ffd36b">'+gold+'</b> \u00b7 Esc to leave</div><hr>';
 QS.slots.forEach((q,i)=>{const T_=QTIER[q.tier],pc=Math.round(q.prog/q.n*100),btn=q.state==='open'?'<button data-qa="'+i+'">Accept</button>':q.state==='active'?'<button data-qd="'+i+'">Abandon</button>':'<button data-qc="'+i+'" style="border-color:#8fe58f;color:#8fe58f">Turn in</button>';
  h+='<div class="row" style="border-left-color:'+T_.c+';flex-direction:column;align-items:stretch;gap:5px"><div style="display:flex;justify-content:space-between;align-items:center;gap:20px"><span><b style="color:'+T_.c+'">'+T_.n.toUpperCase()+'</b> \u00b7 '+descQ(q)+'</span><span>'+btn+'</span></div><div class="qbar"><i style="width:'+pc+'%;background:'+T_.c+'"></i></div><small>'+(q.state==='ready'?'Complete! ':q.prog+'/'+q.n+' \u00b7 ')+'Reward: '+rwText(q)+'</small></div>'});
 sheet.innerHTML=h;
 sheet.querySelectorAll('[data-qa]').forEach(b=>b.onclick=()=>{const q=QS.slots[+b.dataset.qa];if(q.type==='boss'&&bossDead[q.bid]){QS.slots[+b.dataset.qa]=genQuest(q.tier);return drawQuests()}q.state='active';q.prog=q.type==='layer'?Math.min(layerAt(P.y/T|0),q.n):0;sfx.loot();save();if(q.type==='layer'&&q.prog>=q.n){q.state='ready'}drawQuests()});
 sheet.querySelectorAll('[data-qd]').forEach(b=>b.onclick=()=>{const i=+b.dataset.qd;QS.slots[i]=genQuest(QS.slots[i].tier);save();drawQuests()});
 sheet.querySelectorAll('[data-qc]').forEach(b=>b.onclick=()=>claimQuest(+b.dataset.qc))}
function claimQuest(i){const q=QS.slots[i];if(!q||q.state!=='ready')return;const rw=q.rw,out=[];
 gold+=rw.g;out.push('+'+rw.g+'g');
 if(rw.echo){meta.echoes+=rw.echo;saveMeta();out.push('+'+rw.echo+' echoes')}
 if(rw.life){if(P.lives<MAXL){P.lives++;out.push('+1 life')}else{gold+=150;out.push('+150g (lives full)')}}
 if(rw.acc){const pool=ACC.filter(a=>!accOwned.includes(a.id)&&a.rar>=rw.acc[0]&&a.rar<=rw.acc[1]);if(pool.length){const a=pool[Math.random()*pool.length|0];accOwned.push(a.id);out.push(a.name)}else{const b=80*(q.tier+1);gold+=b;out.push('+'+b+'g bonus')}}
 if(rw.wpn!=null){if(inv.length<20){const w=rollWeapon(Math.max(1,P.lvl),rw.wpn);inv.push(w);out.push(w.name)}else{gold+=80;out.push('+80g (pack full)')}}
 QS.slots[i]=genQuest(q.tier);gainXp(Math.round(rw.x*(1+P.lvl*.15)));
 toast('Quest reward: '+out.join(' \u00b7 '));sfx.loot();save();drawQuests()}
function updQHud(){const sx=QS?QS.slots.filter(q=>q.state!=='open').map(q=>q.state==='ready'?'<div style="color:#8fe58f">\u2714 '+descQ(q)+' \u2014 turn in</div>':'<div style="color:'+QTIER[q.tier].c+'">\u25c6 '+descQ(q)+' '+q.prog+'/'+q.n+'</div>').join(''):'';
 if(sx!==updQHud.s){updQHud.s=sx;$('hQ').innerHTML=sx}}
function drawQuestGiver(ox,oy,L){if(!QG||!P)return;const X=Math.round(QG.x-ox),Y=Math.round(QG.y-oy);if(X<-90||X>cv.width+90)return;
 const f=P.x+6<QG.x?-1:1,bob=Math.sin(time*2.2),ready=QS&&QS.slots.some(q=>q.state==='ready');
 // notice board
 FR(X-48,Y-18,3,18,'#3a2614');FR(X-29,Y-18,3,18,'#3a2614');FR(X-52,Y-38,30,20,'#5a3c20');FR(X-52,Y-38,30,2,'#7a5430');FR(X-52,Y-20,30,2,'#3a2614');
 FR(X-49,Y-35,7,9,'#e8dcb8');FR(X-40,Y-34,6,8,'#d8c898');FR(X-32,Y-35,8,11,'#e8dcb8');FR(X-46,Y-36,1,1,'#c33');FR(X-37,Y-35,1,1,'#c33');FR(X-29,Y-36,1,1,'#c33');
 // the Questwarden
 PL([X-9,Y,X-6,Y-18,X-2,Y-26,X+2,Y-26,X+6,Y-18,X+9,Y],'#7a1a2a');FR(X-9,Y-2,18,2,'#d9a441');FR(X-8,Y-20,16,4,'#9a2a3a');
 PL([X-6,Y-24,X,Y-35,X+6,Y-24],'#5a1220');FR(X-3,Y-28,6,5,'#120a10');FR(X-2+f,Y-26,1,1,'#7ff');FR(X+1+f,Y-26,1,1,'#7ff');
 const sx=X+f*13;FR(sx,Y-36,2,36,'#6a4a2a');FR(sx-2,Y-38+bob,6,3,'#d9a441');orb(sx+1,Y-40+bob,16,'rgba(120,220,255,.75)');FR(sx-1,Y-42+bob,4,4,'#bff');L.push([sx+1,Y-40,70]);
 cx.save();cx.textAlign='center';cx.shadowColor=ready?'#4f4':'#fa0';cx.shadowBlur=8;cx.fillStyle=ready?'#8fe58f':'#ffd36b';cx.font='bold 17px Georgia';cx.fillText(ready?'?':'!',X,Y-48+bob*2);cx.shadowBlur=0;
 if(nearQuest()){cx.fillStyle='#ffd36b';cx.font='bold 9px Georgia';cx.fillText('[E] Quests',X,Y-62)}cx.restore()}

// ======================= SPAWN: the Ashfall Hearth =======================
let SPC=null;
function drawSpawn(ox,oy,L){if(!spawn||!P)return;
 if(!SPC||SPC.sd!==seed||SPC.sx!==spawn.x){let ty=0;const tx=spawn.x/T|0;while(ty<H&&!solid(tx,ty))ty++;SPC={sd:seed,sx:spawn.x,cxp:spawn.x+6,gy:ty*T}}
 const w=cv.width,h=cv.height,cxs=Math.round(SPC.cxp-ox),gy=Math.round(SPC.gy-oy),ps=Math.round(spawn.x-ox),t=time;
 if(cxs<-300||cxs>w+300||gy<-220||gy>h+140)return;
 const pu=.5+.5*Math.sin(t*2),pu2=.5+.5*Math.sin(t*3.3+1),y0=gy-100+Math.sin(t*1.5)*5;
 // sky beam
 AD(()=>{const g=cx.createLinearGradient(0,0,0,y0);g.addColorStop(0,'rgba(180,140,255,0)');g.addColorStop(1,'rgba(180,140,255,'+(.12+.06*pu)+')');cx.fillStyle=g;cx.beginPath();cx.moveTo(cxs-8,0);cx.lineTo(cxs+8,0);cx.lineTo(cxs+30,y0);cx.lineTo(cxs-30,y0);cx.fill()});
 // pillars with banners + fire crowns
 for(const s of[-1,1]){const px=cxs+s*150,sw=Math.sin(t*1.7+s)*3;
  FR(px-10,gy-7,20,7,'#2e2a3c');FR(px-7,gy-120,14,114,'#3a3550');FR(px-7,gy-120,3,114,'#4a4562');FR(px+4,gy-120,3,114,'#2a2638');FR(px-12,gy-127,24,8,'#4e4868');FR(px-12,gy-127,24,2,'#7a7298');
  AD(()=>{for(let i=0;i<5;i++){cx.fillStyle='rgba(255,150,60,'+(.35+.6*Math.sin(t*2+i+s)*Math.sin(t*2+i+s))+')';cx.fillRect(px-2,gy-104+i*14,4,6)}});
  PL([px-6,gy-118,px+6,gy-118,px+6+sw,gy-62,px+sw*1.6,gy-53,px-6+sw,gy-62],'#8a1a2a');FR(px-6,gy-118,12,6,'#d9a441');FR(px-2+sw*.5,gy-100,4,4,'#d9a441');FR(px-1+sw*.6,gy-93,2,11,'#d9a441');
  flame(px,gy-128,12,18+pu*5,s*5);orb(px,gy-138,46,'rgba(255,140,40,.42)');L.push([px,gy-138,120])}
 // chain garland with lanterns
 cx.strokeStyle='#8a8498';cx.lineWidth=1.5;cx.beginPath();for(let i=0;i<=20;i++){const x=cxs-150+i*15,y=gy-120+Math.sin(i/20*Math.PI)*24;i?cx.lineTo(x,y):cx.moveTo(x,y)}cx.stroke();
 for(const i of[5,10,15]){const x=cxs-150+i*15,y=gy-120+Math.sin(i/20*Math.PI)*24;FR(x-3,y,6,9,'#3a3040');FR(x-2,y+2,4,6,'#ffcf6a');orb(x,y+5,28,'rgba(255,190,80,.5)');L.push([x,y+5,80])}
 // flagstone plaza
 const x0=ps-11*T,wd=23*T;FR(x0,gy,wd,7,'#4a4458');FR(x0,gy,wd,1,'#a49cc2');FR(x0,gy+4,wd,1,'#2c2838');
 for(let x=x0;x<x0+wd;x+=16){FR(x,gy+1,1,3,'#2c2838');FR(x+8,gy+5,1,2,'#2c2838')}
 FR(x0-5,gy+2,5,5,'#3a3548');FR(x0+wd,gy+2,5,5,'#3a3548');FR(cxs-70,gy+2,140,2,'#a8832a');
 AD(()=>{for(let i=0;i<8;i++){cx.fillStyle='rgba(255,200,90,'+(.2+.5*Math.sin(t*3+i)*Math.sin(t*3+i))+')';cx.fillRect(cxs-63+i*18,gy+1,7,4)}});
 // summoning circle
 AD(()=>{cx.save();cx.translate(cxs,gy-2);cx.scale(1,.25);glow(0,0,110,'rgba(255,130,50,'+(.3+.15*pu)+')');cx.restore();
  cx.lineWidth=2;cx.strokeStyle='rgba(255,140,50,'+(.6+.3*pu)+')';cx.beginPath();cx.ellipse(cxs,gy-1,76,12,0,0,6.283);cx.stroke();
  cx.strokeStyle='rgba(190,140,255,'+(.55+.3*pu2)+')';cx.beginPath();cx.ellipse(cxs,gy-1,56,9,0,0,6.283);cx.stroke();
  cx.lineWidth=1.3;cx.strokeStyle='rgba(255,210,130,.6)';for(let tri=0;tri<2;tri++){cx.beginPath();for(let k=0;k<=3;k++){const a=t*.35+tri*Math.PI/3+k*2.0944,px=cxs+Math.cos(a)*62,py=gy-1+Math.sin(a)*10;k?cx.lineTo(px,py):cx.moveTo(px,py)}cx.stroke()}
  for(let i=0;i<12;i++){const a=-t*.4+i*.5236,px=cxs+Math.cos(a)*86,py=gy-1+Math.sin(a)*14;cx.fillStyle='rgba(255,170,70,'+(.4+.5*Math.sin(t*4+i))+')';cx.fillRect(px-1,py-2,2,3)}});
 // braziers
 for(const s of[-1,1]){const bx=cxs+s*92;PL([bx-11,gy-22,bx+11,gy-22,bx+7,gy-10,bx-7,gy-10],'#2a2430');FR(bx-4,gy-10,8,10,'#3a3445');FR(bx-10,gy-25,20,4,'#6a6078');FR(bx-8,gy-3,16,3,'#2a2430');
  flame(bx,gy-25,16,28+Math.sin(t*9+s)*5,s,['#c8300e','#ff8a1a','#ffe08a']);orb(bx,gy-34,56,'rgba(255,140,40,.45)');L.push([bx,gy-34,180]);
  for(let i=0;i<4;i++){const sx=bx+Math.sin(t*3+i*2+s)*7,sy=gy-32-((t*32+i*17+s*9)%42);FR(sx,sy,1,1,'#ffd06a')}}
 // waystone obelisk
 FR(cxs-18,gy-9,36,9,'#3a3450');FR(cxs-13,gy-16,26,7,'#4a4460');FR(cxs-8,gy-20,16,4,'#5a5478');
 AD(()=>{cx.strokeStyle='rgba(200,160,255,'+(.25+.3*pu2)+')';cx.lineWidth=2;cx.beginPath();cx.moveTo(cxs,gy-20);cx.lineTo(cxs,y0+32);cx.stroke()});
 PL([cxs,y0-36,cxs+14,y0,cxs,y0+36,cxs-14,y0],'#6a4aa8');PL([cxs,y0-36,cxs+14,y0,cxs,y0+3],'#9a7ae0');PL([cxs,y0-36,cxs-14,y0,cxs,y0+3],'#7a5ac0');PL([cxs,y0+3,cxs+14,y0,cxs,y0+36],'#4a2a88');
 AD(()=>{for(let i=0;i<3;i++){cx.fillStyle='rgba(255,230,255,'+(.4+.5*Math.sin(t*2.5+i*2)*Math.sin(t*2.5+i*2))+')';cx.fillRect(cxs-1,y0-14+i*13,2,6)}});
 orb(cxs,y0,76+pu*14,'rgba(170,120,255,.5)');L.push([cxs,y0,190]);
 for(let i=0;i<5;i++){const a=t*.9+i*1.2566,sx=cxs+Math.cos(a)*36,sy=y0+Math.sin(a)*9+Math.sin(t*2+i)*3;PL([sx,sy-5,sx+3,sy,sx,sy+5,sx-3,sy],'#d8bcff');orb(sx,sy,9,'rgba(200,160,255,.6)')}
 // title
 cx.save();cx.textAlign='center';cx.shadowColor='#a060ff';cx.shadowBlur=10;cx.fillStyle='#eadfff';cx.font='bold 12px Georgia';cx.fillText('THE ASHFALL HEARTH',cxs,y0-48);cx.shadowBlur=0;cx.fillStyle='#a8957a';cx.font='italic 8px Georgia';cx.fillText('rest \u00b7 trade \u00b7 descend',cxs,y0-38);cx.restore();
 // drifting embers & spirit motes
 AD(()=>{for(let i=0;i<30;i++){const lf=((t*13*(1+i%4*.3)+i*29)%130)/130,x=cxs+Math.sin(i*2.4+t*.25*(1+i%3*.2))*(40+i%5*32),y=gy-4-lf*140,a=Math.sin(lf*Math.PI);cx.fillStyle=i%2?'rgba(255,170,70,'+a*.9+')':'rgba(190,150,255,'+a*.9+')';cx.fillRect(x,y,2,2)}});
 L.push([cxs,gy-40,260])}

// ======================= GAME OVER =======================
const INSULTS=["That was embarrassing. Even the training dummies would have lasted longer.","Level {lv}? Did you level up by accident?","Two lives, and you spent them like a drunk merchant at a clearance sale.","The Cave Stalkers are writing songs about how easy you were.","Your parry timing is a myth. Your dodge button is a rumor.","Skill issue. Severe. Possibly terminal.","Did you fight with your eyes closed? You can tell us.","Even the Wandering Merchant is shaking his head at you.","You didn't lose to the {ly}. The {ly} just stood there and you walked into it.","The bosses heard you were coming. They didn't even stretch.","Mashing left click is not a strategy. It's a cry for help.","Gravity beat you. Enemies beat you. What's left, the tutorial?","You blocked like a wet curtain.","Somewhere, a Cave Stalker is telling his grandkids about the easiest fight of his life.","The echoes are laughing. Politely, but still.","Hint: the glowing attack is the thing you're supposed to NOT stand in.","Impressive. Most people need at least three lives to be this bad.","You have the reflexes of a sleeping boulder.","Maybe try playing with both hands next time.","That wasn't a death. That was a surrender with extra steps.","Your gear was fine. The problem was the person holding it.","Level {lv} and still dying like a fresh spawn. Consistency is a talent, I suppose.","Stamina is not a decoration. Neither is the guard button.","The Questwarden is disappointed. So is everyone else.","Even the lava felt bad for you. Then it burned you anyway.","I've seen fence posts with better dodge frames.","You fell for a telegraphed attack. The telegraph was the big glowing warning. Remember that.","Try parrying. It's the one with the button."];
const RANKS=[[3,'Rank: Cave Snack'],[6,'Rank: Training Dummy'],[10,'Rank: Walking Tutorial'],[15,'Rank: Almost Respectable'],[99,'Rank: Disappointing Veteran']];
let lastIns=-1;
function showGameOver(o){let i;do i=Math.random()*INSULTS.length|0;while(i===lastIns&&INSULTS.length>1);lastIns=i;
 const lay=o.ly?LN[Math.min(o.ly,NL)]+' Depths':'Surface';
 $m('goInsult').textContent='\u201c'+INSULTS[i].split('{lv}').join(o.lv).split('{ly}').join(lay)+'\u201d';
 $m('goRank').textContent=(RANKS.find(r=>o.lv<r[0])||RANKS[RANKS.length-1])[1];
 $m('goStats').innerHTML='Level <b>'+o.lv+'</b> \u00b7 '+lay+' \u00b7 <b>'+o.bk+'</b> bosses \u00b7 <b>'+o.kl+'</b> kills<br>Levels +'+o.lvE+' \u00b7 Depth +'+o.ly*10+' \u00b7 Bosses +'+Math.max(0,o.ec-o.lvE-o.ly*10)+'<br><b style="font-size:16px">+'+o.ec+' \u2756 echoes banked</b>';
 const g=$m('gameover');g.classList.remove('hidden');g.classList.remove('go-in');void g.offsetWidth;g.classList.add('go-in')}
$m('goMenu').onclick=()=>{$m('gameover').classList.add('hidden');$m('menu').classList.remove('hidden')};
$m('goRetry').onclick=()=>{$m('gameover').classList.add('hidden');start(true)};

// Echoes are paid out when a run ends (all lives lost). Level is the main driver and every level is worth more than the last:
// reaching level L is worth 3L echoes, so the payout grows faster the further you level. Deeper layers and bosses add a bonus.
const levelEchoes=lv=>{let s=0;for(let i=2;i<=lv;i++)s+=3*i;return s};
const BOSS_ECHO=200;// echoes per boss = 200 x its tier (+ bonus echoes from rekindled bosses, see patch2.js)
const bossEchoes=()=>{let s=0;for(const k in bossDead)if(bossDead[k])s+=BOSS_ECHO*((BD[k]&&BD[k].tier)||1);return s+(typeof shrineEchoes==='function'?shrineEchoes():0)};
const bankedEchoes=()=>P.lvl<10?0:Math.round((levelEchoes(P.lvl)+(P.maxLy||0)*10+bossEchoes())*(window.echoMult?window.echoMult():1));
function endRun(){const ly=P.maxLy||0,bk=Object.keys(bossDead).length,kl=P.kills||0,lv=P.lvl,lvE=levelEchoes(lv),ec=bankedEchoes();
 meta.echoes+=ec;saveMeta();try{localStorage.removeItem(SAVEKEY)}catch(e){}
 P=null;paused=true;sheetOpen=false;shopOpen=false;questOpen=false;enemies=[];zones=[];projs=[];parts=[];floats=[];
 for(const i of['hud','hint','mmw','sheet'])$m(i).classList.add('hidden');$m('toast').textContent='';
 $m('btnContinue').disabled=true;$m('runInfo').innerHTML='';
 showGameOver({lv,ly,bk,kl,lvE,ec});updMenu()}
function drawEchoes(){let h=`<h1>ECHOES</h1><div>\u2756 <b style="color:#9fe">${meta.echoes}</b> echoes \u00b7 power carried into every new run</div><hr>`;
 for(const u of UPG){const l=meta.up[u[0]],mx=l>=u[3],c=upCost(u);h+=`<div class="row"><span><b>${u[1]}</b> ${l}/${u[3]}<br><small>${u[2]}${u[5]?'':' per level'}</small></span><button data-up="${u[0]}" ${mx||meta.echoes<c?'disabled':''}>${mx?'MAX':c+' \u2756'}</button></div>`}
 sheet.innerHTML=h+'<br><button id="echoBack">Back</button>';
 sheet.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const u=UPG.find(x=>x[0]===b.dataset.up),c=upCost(u);if(meta.up[u[0]]>=u[3]||meta.echoes<c)return;meta.echoes-=c;meta.up[u[0]]++;saveMeta();sfx.loot();drawEchoes();updMenu()});
 $m('echoBack').onclick=()=>{sheet.classList.add('hidden');$m('menu').classList.remove('hidden')}}
$m('btnEcho').onclick=()=>{$m('menu').classList.add('hidden');sheet.classList.remove('hidden');drawEchoes()};
updMenu();
function reveal(){const px=(P.x+6)/T|0,py=(P.y+11)/T|0,R=9;for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){if(dx*dx+dy*dy>R*R)continue;const x=px+dx,y=py+dy;if(x>=0&&y>=0&&x<W&&y<H)seen[y*W+x]=1}}
const mmx=$m('mm').getContext('2d'),MW=80,MH=56,mimg=mmx.createImageData(MW,MH);let mmc=0;
const MC={1:[74,154,66],2:[107,74,49],3:[76,76,98],4:[60,200,230],5:[255,110,30],6:[200,140,60],7:[150,110,50]};
function drawMini(){if(++mmc%3)return;const px=(P.x+6)/T|0,py=(P.y+11)/T|0,x0=px-MW/2,y0=py-MH/2,d=mimg.data;
 for(let j=0;j<MH;j++)for(let i=0;i<MW;i++){const x=x0+i,y=y0+j,o=(j*MW+i)*4;let c=[8,6,14];
  if(x<0||y<0||x>=W||y>=H)c=[0,0,0];else if(seen[y*W+x]){const t=tiles[y*W+x];c=t?(MC[t]||[90,90,90]):[26,18,40]}
  d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}
 const dot=(wx,wy,c,s)=>{const i=(wx/T|0)-x0,j=(wy/T|0)-y0;for(let a=0;a<s;a++)for(let b=0;b<s;b++){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=MW||jj>=MH)continue;const o=(jj*MW+ii)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2]}};
 for(const c of chests)if(seen[c.ty*W+c.tx])dot(c.tx*T,c.ty*T,[255,210,70],2);
 if(SHOP)dot(SHOP.x,SHOP.y-8,[255,120,255],2);
 for(const g of GATES)if(seen[g.y*W+g.x])dot(g.x*T,g.y*T,[90,255,230],3);
 for(const a of ARCHES)if(seen[a.y*W+a.x])dot(a.x*T,(a.y-2)*T,[255,110,60],3);
 for(const e of enemies){if(e.dead)continue;const ex=(e.x+e.w/2)/T|0,ey=(e.y+e.h/2)/T|0;
  if(e.boss){if(e.st!=='dormant'||seen[ey*W+ex])dot(e.x+e.w/2,e.y+e.h/2,[255,60,255],3)}
  else if(Math.abs(ex-px)<16&&Math.abs(ey-py)<12)dot(e.x+e.w/2,e.y+e.h/2,[255,60,60],2)}
 dot(P.x+6,P.y+11,(time*4|0)%2?[255,255,255]:[120,220,255],2);mmx.putImageData(mimg,0,0);
 const ly=Math.max(0,((py-24)/22)|0);$m('mmt').textContent='Depth '+Math.max(0,py-24)+'m'+(ly?' \u00b7 '+LN[Math.min(ly,NL)]:' \u00b7 Surface')}

// ---------- arenas & gates: scenery ----------
const ARB={
 ember(a,X0,Y0,W2,H2,FY,L){const t=time,mx=X0+W2/2,my=Y0+H2*.45;glow(mx,my,150,'rgba(255,100,20,.35)');
  cx.save();cx.translate(mx,my);cx.strokeStyle='rgba(255,140,40,.55)';cx.lineWidth=3;for(let k=0;k<3;k++){cx.setLineDash([14+k*6,10]);cx.lineDashOffset=t*(20+k*14)*(k%2?-1:1);cx.beginPath();cx.arc(0,0,50+k*22,0,7);cx.stroke()}cx.setLineDash([]);
  for(let k=0;k<8;k++){const an=k*.785+t*.2;PL([Math.cos(an)*40,Math.sin(an)*40,Math.cos(an+.1)*118,Math.sin(an+.1)*118,Math.cos(an-.1)*118,Math.sin(an-.1)*118],'rgba(255,90,20,.12)')}cx.restore();
  const n=7;for(let i=0;i<n;i++){const x=X0+W2*(i+.5)/n,cw=18,ch=H2-24,fl=.5+.5*Math.sin(t*3+i*1.7);FR(x-cw/2,Y0+24,cw,ch,'#1a0c10');FR(x-cw/2-3,Y0+20,cw+6,8,'#2a1218');FR(x-cw/2-3,FY-10,cw+6,10,'#2a1218');
   cx.fillStyle='rgba(255,'+(90+fl*80|0)+',20,'+(.5+.4*fl)+')';cx.fillRect(x-1,Y0+34,2,ch*.4);cx.fillRect(x-5,Y0+60+i%3*10,1.5,ch*.3);cx.fillRect(x+4,Y0+48,1.5,ch*.35);
   if(i<n-1){const bx=x+W2/n/2,by=Y0+34+i%2*14;cx.fillStyle='#4a3a3a';cx.fillRect(bx,Y0,1,by-Y0);FR(bx-5,by,10,4,'#2a1a1a');flame(bx,by,9,13+Math.sin(t*9+i)*3,i);L.push([bx,by-6,70])}}
  for(const s of[-1,1])L.push([mx+s*(a.hw-10)*T,FY-8,60]);
  const fg=cx.createLinearGradient(0,FY-40,0,FY);fg.addColorStop(0,'rgba(255,90,20,0)');fg.addColorStop(1,'rgba(255,90,20,.35)');cx.fillStyle=fg;cx.fillRect(X0,FY-40,W2,40)},
 glacial(a,X0,Y0,W2,H2,FY,L){const t=time,mx=X0+W2/2;
  for(let k=0;k<3;k++){cx.fillStyle=['rgba(80,255,200,.13)','rgba(120,160,255,.12)','rgba(200,120,255,.10)'][k];cx.beginPath();cx.moveTo(X0,Y0);for(let x=0;x<=W2;x+=12)cx.lineTo(X0+x,Y0+16+k*10+Math.sin(x*.03+t*.8+k*2)*14+Math.sin(x*.07-t*.5)*6);cx.lineTo(X0+W2,Y0);cx.fill()}
  glow(mx,FY-60,130,'rgba(120,220,255,.3)');for(let k=-3;k<=3;k++){const hh=70+(3-Math.abs(k))*26,wd=12+(k&1)*5,x=mx+k*20;PL([x-wd,FY,x-wd*.3,FY-hh,x+wd*.2,FY-hh-8,x+wd,FY],k&1?'#7cc4ec':'#a8e0ff');PL([x-wd*.3,FY-hh,x+wd*.2,FY-hh-8,x+wd*.3,FY],'rgba(255,255,255,.5)')}
  for(let i=0;i<22;i++){const x=X0+W2*(i+.3)/22,l=22+(i*37%40);PL([x-8,Y0,x,Y0+l,x+8,Y0],i%2?'#6aa8d8':'#9ad0f0');PL([x-2,Y0,x,Y0+l,x+3,Y0],'rgba(255,255,255,.45)')}
  for(let i=0;i<5;i++){const x=X0+W2*(i+.5)/5-40;FR(x,Y0+30,16,H2-30,'rgba(150,210,255,.10)');FR(x+3,Y0+30,3,H2-30,'rgba(255,255,255,.12)')}
  for(let i=0;i<50;i++)FR(X0+((i*97+t*(10+i%5*4))%W2),Y0+((i*53+t*(24+i%7*5))%H2),1.5,1.5,'rgba(255,255,255,.7)');
  for(let i=0;i<4;i++)L.push([X0+W2*(i+.5)/4,Y0+30,90])},
 tempest(a,X0,Y0,W2,H2,FY,L){const t=time,fl=(t*1.1%4)<.12||(t*2.3%7)<.08;
  if(fl){cx.fillStyle='rgba(220,230,255,.3)';cx.fillRect(X0,Y0,W2,H2)}
  for(let i=0;i<14;i++){const x=X0+((i*83-t*(6+i%3*3))%(W2+120)+W2+120)%(W2+120)-60,y=Y0+10+(i*29%60);cx.fillStyle='rgba('+(30+i%3*12)+','+(36+i%3*12)+','+(70+i%3*14)+',.45)';for(let k=0;k<4;k++){cx.beginPath();cx.arc(x+k*18,y+(k%2)*6,22-k*2,0,7);cx.fill()}}
  for(let i=0;i<6;i++){const x=X0+W2*(i+.5)/6,y=Y0+H2*.5+Math.sin(t*1.2+i*2)*8+(i%2)*30;PL([x-12,y,x+12,y-3,x+9,y+14,x-4,y+22,x-10,y+10],'#2a2e58');FR(x-12,y-2,24,2,'#6a74c0')}
  if(fl)bolt(X0+W2*(.2+.6*((t*7)%1)),Y0,X0+W2*(.2+.6*((t*13)%1)),FY,'rgba(255,255,200,.9)',2);
  cx.strokeStyle='rgba(170,190,255,.35)';cx.lineWidth=1;cx.beginPath();for(let i=0;i<60;i++){const x=X0+((i*61+t*40)%W2),y=Y0+((i*47+t*260)%H2);cx.moveTo(x,y);cx.lineTo(x-3,y+9)}cx.stroke();
  for(let i=0;i<6;i++){const x=X0+W2*(i+.5)/6+20,hh=50+(i*41%70);FR(x-9,FY-hh,18,hh,'#1a1e3a');FR(x-9,FY-hh,18,3,'#5a64b0');FR(x-4,FY-hh+10,1.5,hh*.5,'#8a96ff')}
  for(let i=0;i<5;i++)L.push([X0+W2*(i+.5)/5,Y0+40,100])},
 hollow(a,X0,Y0,W2,H2,FY,L){const t=time,mx=X0+W2/2,n=6;
  for(let i=0;i<n;i++){const x=X0+W2*(i+.5)/n,aw=W2/n*.36;PL([x-aw,FY,x-aw,Y0+60,x,Y0+22,x+aw,Y0+60,x+aw,FY],'#0c0814');PL([x-aw*.55,FY-20,x-aw*.55,Y0+66,x,Y0+40,x+aw*.55,Y0+66,x+aw*.55,FY-20],'rgba(110,70,200,'+(.16+.08*Math.sin(t*2+i))+')')}
  glow(mx,FY-80,150,'rgba(150,90,255,.35)');PL([mx-26,FY,mx-26,FY-120,mx-18,FY-150,mx-10,FY-120,mx,FY-170,mx+10,FY-120,mx+18,FY-150,mx+26,FY-120,mx+26,FY],'#0a0612');FR(mx-34,FY-40,68,40,'#0e0a18');FR(mx-34,FY-42,68,3,'#6a5a8a');FR(mx-18,FY-70,36,30,'#120c1c');
  cx.strokeStyle='rgba(190,140,255,.7)';cx.lineWidth=2;cx.beginPath();cx.arc(mx,FY-120,14+Math.sin(t*2)*2,0,7);cx.stroke();cx.setLineDash([4,5]);cx.lineDashOffset=t*14;cx.beginPath();cx.arc(mx,FY-120,24,0,7);cx.stroke();cx.setLineDash([]);
  for(let i=0;i<16;i++){const x=X0+((i*131+Math.sin(t*.5+i)*20)%W2+W2)%W2,y=Y0+40+((i*71-t*10*(1+i%3))%(H2-60)+(H2-60))%(H2-60);FR(x-1,y-1,2,3,'#cfe');glow(x,y,10,'rgba(170,255,240,.5)')}
  const mg=cx.createLinearGradient(0,FY-50,0,FY);mg.addColorStop(0,'rgba(140,100,220,0)');mg.addColorStop(1,'rgba(140,100,220,.3)');cx.fillStyle=mg;cx.fillRect(X0,FY-50,W2,50);
  for(let i=0;i<4;i++)L.push([X0+W2*(i+.5)/4,FY-60,100])}};
function drawArenaBG(ox,oy,L){const w=cv.width,h=cv.height;for(const a of ARENAS){const X0=(a.cx-a.hw)*T-ox,W2=a.hw*2*T,Y0=(a.fy-a.ht)*T-oy,FY=a.fy*T-oy,H2=FY-Y0;if(X0+W2<-20||X0>w+20||FY<-20||Y0>h+20)continue;
 const g=cx.createLinearGradient(0,Y0,0,FY);g.addColorStop(0,a.bg[0]);g.addColorStop(1,a.bg[1]);cx.fillStyle=g;cx.fillRect(X0,Y0,W2,H2);
 cx.save();cx.beginPath();cx.rect(X0,Y0,W2,H2);cx.clip();ARB[a.id](a,X0,Y0,W2,H2,FY,L);cx.restore();
 for(let i=0;i<=6;i++)L.push([X0+W2*i/6,Y0+H2*.55,120])}}
function drawGates(ox,oy,L){const w=cv.width,h=cv.height,t=time;
 for(const g of GATES){const X=g.x*T-ox+8,Y=g.y*T-oy,open=gateOpen(g),rq=GATE_REQ(g.n);
  if(!open&&P&&Math.abs(P.x/T-g.x)<8&&P.y/T>g.y-9&&P.y/T<g.y+2&&time>(drawGates.hc||0)){drawGates.hc=time+3;toast('The gate is sealed \u00b7 defeat '+BD[rq].n)}
  if(X<-90||X>w+90||Y<-130||Y>h+130)continue;
  for(const s of[-1,1]){const px=X+s*3.5*T-6;FR(px,Y-5*T,12,5*T,'#2a2438');FR(px,Y-5*T,12,3,'#6a5a8a');FR(px+4,Y-5*T+8,2,5*T-16,'rgba(217,164,65,.7)');FR(px-2,Y-4,16,4,'#3a3050')}
  PL([X-3.5*T-8,Y-5*T,X,Y-5*T-26,X+3.5*T+8,Y-5*T,X+3.5*T,Y-5*T+8,X,Y-5*T-14,X-3.5*T,Y-5*T+8],'#3a3050');
  const p=.5+.5*Math.sin(t*3);cx.save();cx.globalCompositeOperation='lighter';glow(X,Y+8,70+p*10,open?'rgba(90,255,230,'+(.3+.2*p)+')':'rgba(255,60,50,'+(.25+.15*p)+')');
  for(let k=0;k<3;k++){cx.strokeStyle=open?'rgba(120,255,235,'+(.6-k*.15)+')':'rgba(255,90,80,'+(.6-k*.15)+')';cx.lineWidth=2;cx.beginPath();cx.ellipse(X,Y+8,22+k*8+p*3,6+k*2,0,0,7);cx.stroke()}
  for(let k=0;k<8;k++)FR(X-20+((k*13+t*30)%40),Y+16-((k*9+t*26)%40),1.5,1.5,open?'#bff':'#f98');cx.restore();
  cx.font='bold 9px Georgia';cx.textAlign='center';cx.fillStyle=open?'#ffd36b':'#ff6a5a';cx.fillText('GATE TO THE '+LN[g.n].toUpperCase()+' DEPTHS'+(open?'':' \u00b7 SEALED'),X,Y-5*T-30);if(!open){cx.font='italic 8px Georgia';cx.fillText('slay '+BD[rq].n+' to unseal',X,Y-5*T-20);cx.font='bold 9px Georgia'}cx.textAlign='left';L.push([X,Y,100])}
 for(const a of ARCHES){const d=BD[a.id],c='rgb('+d.zc+')',X=a.x*T-ox+8,Y=a.y*T-oy,top=Y-4*T-12;if(X<-90||X>w+90||Y<-130||Y>h+130)continue;
  for(const s of[-1,1]){const px=X+s*20-8;FR(px,top,16,4*T+12,'#1c1626');FR(px,top,16,4,c);FR(px+6,top+12,4,4*T-8,c);PL([px,top,px+8,top-18,px+16,top],'#2a2038')}
  PL([X-30,top,X,top-22,X+30,top,X+20,top+4,X,top-10,X-20,top+4],'#2a2038');cx.fillStyle=c;cx.beginPath();cx.arc(X,top-4,4,0,7);cx.fill();orb(X,Y-2*T,50+10*Math.sin(t*4),'rgba('+d.zc+',.35)');
  cx.font='bold 8px Georgia';cx.textAlign='center';cx.fillStyle=c;cx.fillText(d.n.toUpperCase(),X,top-28);cx.textAlign='left';L.push([X,Y-2*T,80])}}

// ======================================================================
// ===== ADDED: Health Elixir · Enchanting Altar · Enemy art overhaul ====
// ======================================================================
let camFocus=null,ELX_MAX=6,ELX_HEAL=45,ELX_CD=5,ELX_PRICE=200,ENCH_PRICE=500;

// ---------------------------- Health Elixir ----------------------------
function useElixir(){if(!P||paused||P.dead)return;
 if((P.el|0)<=0){toast('No elixirs left \u00b7 buy more from the Merchant ('+ELX_PRICE+'g)');return}
 if((P.ecd||0)>0){toast('Elixir on cooldown \u00b7 '+Math.ceil(P.ecd)+'s');return}
 if(P.hp>=maxHp()){toast('Already at full health');return}
 P.el--;P.ecd=ELX_CD;const h=Math.min(ELX_HEAL,maxHp()-P.hp);P.hp+=h;
 float(P.x,P.y-10,'+'+Math.round(h),'#7fff9a');
 for(let i=0;i<20;i++)parts.push({x:P.x+6+(Math.random()-.5)*12,y:P.y+22,vx:(Math.random()-.5)*50,vy:-40-Math.random()*80,l:.75,c:i%2?'#7fff9a':'#d8ffe4'});
 Audio_.beep(520,.12,'sine',.08);setTimeout(()=>Audio_.beep(780,.18,'sine',.08),90);
 toast('Health Elixir \u00b7 +'+Math.round(h)+' HP');save()}
function hElx(){const el=$('hElx');if(!el)return;const cd=P.ecd||0,n=P.el|0;
 const s='<span style="color:'+(cd>0||!n?'#8a9a8a':'#7fff9a')+'">\u2697 Elixir \u00d7'+n+'/'+ELX_MAX+' [R]</span>'+(cd>0?' <span style="color:#ffd36b">'+Math.ceil(cd)+'s</span>':(n?' <span style="color:#7fff9a">ready</span>':' <span style="color:#f88">empty</span>'));
 if(el._s!==s){el._s=s;el.innerHTML=s}
 const b=$('bEl');if(b){b.style.width=(1-clamp(cd/ELX_CD,0,1))*100+'%';$('elBar').classList.toggle('ready',cd<=0&&n>0)}}
let elixIc=null;
function elixIcon(){if(elixIc)return elixIc;const c=document.createElement('canvas');c.width=c.height=20;const g=c.getContext('2d');
 g.fillStyle='#120d1a';g.fillRect(0,0,20,20);g.strokeStyle='#5c5';g.strokeRect(.5,.5,19,19);
 g.fillStyle='#8a6a3a';g.fillRect(8,2,4,3);g.fillStyle='#cfe';g.fillRect(8,5,4,4);
 g.fillStyle='#cfe8d8';g.beginPath();g.moveTo(8,8);g.lineTo(12,8);g.lineTo(16,16);g.lineTo(4,16);g.fill();
 g.fillStyle='#2fd55a';g.beginPath();g.moveTo(7,11);g.lineTo(13,11);g.lineTo(16,16);g.lineTo(4,16);g.fill();
 g.fillStyle='#9fffb0';g.fillRect(6,13,2,2);g.fillStyle='#fff';g.fillRect(9,6,1,3);
 return elixIc=c.toDataURL()}
function elixRow(){const n=P.el|0,full=n>=ELX_MAX;
 return `<b>Alchemy</b><div class="row"><span style="display:flex;gap:10px;align-items:center"><img src="${elixIcon()}" width="40" height="40" style="image-rendering:pixelated"><span><b style="color:#7fff9a">Health Elixir</b> <small>Consumable \u00b7 key R</small><br><small>Heals ${ELX_HEAL} HP \u00b7 ${ELX_CD}s cooldown \u00b7 You carry ${n}/${ELX_MAX}</small></span></span><span><small style="color:#ffd36b">${ELX_PRICE}g</small> <button data-x="1" ${gold<ELX_PRICE||full?'disabled':''}>${full?'Full':'Buy'}</button></span></div>`}

// ---------------------------- Weapon enchanting ----------------------------
const EP=[
 {k:'dmg',n:'Keen Edge',min:.08,max:.22,f:v=>'+'+Math.round(v*100)+'% damage'},
 {k:'spd',n:'Swiftness',min:.08,max:.22,f:v=>'+'+Math.round(v*100)+'% attack speed'},
 {k:'crit',n:'Precision',min:.08,max:.22,f:v=>Math.round(v*100)+'% chance to crit (\u00d72 damage)'},
 {k:'burn',n:'Emberbrand',min:.12,max:.30,f:v=>'+'+Math.round(v*100)+'% bonus fire damage'},
 {k:'leech',n:'Vampiric',min:2,max:6,int:1,f:v=>'heal '+v+' HP on every hit'},
 {k:'vig',n:'Vigor',min:2,max:6,int:1,f:v=>'+'+v+' stamina on every hit'},
 {k:'post',n:'Breaker',min:.20,max:.60,f:v=>'+'+Math.round(v*100)+'% posture damage'},
 {k:'exec',n:'Executioner',min:.25,max:.60,f:v=>'+'+Math.round(v*100)+'% damage to wounded foes (under 35% HP)'}];
const EPB={};EP.forEach(p=>EPB[p.k]=p);
const enc=k=>{let v=0;const a=P&&P.weapon&&P.weapon.ench;if(a)for(const b of a)if(b.k===k)v+=b.v;return v};
const qcol=q=>q<.35?'#9fd89f':q<.7?'#6cc8ff':q<.9?'#c8a0ff':'#ffb347';
function rollEnchant(){const pool=EP.slice(),out=[],n=2+(Math.random()<.35?1:0);
 for(let i=0;i<n;i++){const p=pool.splice(Math.random()*pool.length|0,1)[0],q=Math.random();let v=p.min+(p.max-p.min)*q;v=p.int?Math.round(v):Math.round(v*100)/100;out.push({k:p.k,v,q})}
 return out}
function enchFx(e,d){const E=P.weapon&&P.weapon.ench;if(!E||!E.length)return;const mx=e.x+(e.w||14)/2,my=e.y+(e.h||22)/2;
 const cr=enc('crit');if(cr&&Math.random()<cr){e.hp-=d;float(e.x,e.y-24,'CRIT \u00d72','#ffb347');burst(mx,my,10,'#ffd36b')}
 const bu=enc('burn');if(bu){e.hp-=d*bu;burst(mx,my,5,'#f84')}
 const ex=enc('exec');if(ex&&e.hp>0&&e.hp<e.max*.35){e.hp-=d*ex;float(e.x,e.y-32,'EXECUTE','#f66')}
 const pb=enc('post');if(pb)e.post=(e.post||0)+14*wd().pd*pb;
 const lc=enc('leech');if(lc){P.hp=Math.min(maxHp(),P.hp+lc);burst(P.x+6,P.y+8,2,'#f66')}
 const vg=enc('vig');if(vg)P.stam=Math.min(maxStam(),P.stam+vg)}
const enchTxt=w=>w&&w.ench&&w.ench.length?' \u2726'+w.ench.length:'';

let ENCP=null;
function enchPos(){const x=spawn.x+130;let ty=0;while(ty<H&&!solid(x/T|0,ty))ty++;return{x,y:ty*T}}
const nearEnch=()=>ENCP&&P&&Math.abs(P.x+6-ENCP.x)<38&&Math.abs(P.y+22-ENCP.y)<30;
function openEnch(){sheetOpen=true;shopOpen=false;questOpen=false;paused=true;sheet.classList.remove('hidden');drawEnch()}
function drawEnch(){const w=P.weapon,E=w.ench||[],can=gold>=ENCH_PRICE;
 let h=`<h1>ENCHANTING ALTAR</h1><div><small style="font-style:italic">\u201cSteel remembers what it is given. Give it something new.\u201d</small></div><div style="margin-top:8px">Gold: <b style="color:#ffd36b">${gold}</b> \u00b7 Esc to leave</div><hr>`;
 h+=`<div style="font-size:18px;color:${RAR[w.rar][1]}">${w.name}${enchTxt(w)}</div><div><small>${w.dmg} base \u00b7 ${dmgOut()} total damage \u00b7 enchants stay on the weapon</small></div><hr>`;
 if(E.length)E.forEach(b=>{const p=EPB[b.k];h+=`<div class="row" style="border-left-color:${qcol(b.q)}"><span><b style="color:${qcol(b.q)}">${p.n}</b><br><small>${p.f(b.v)}</small></span></div>`});
 else h+='<div><small>This weapon is unenchanted.</small></div>';
 h+=`<br><button id="enRoll" ${can?'':'disabled'}>${E.length?'Reroll':'Enchant'} \u00b7 ${ENCH_PRICE}g</button><br><small>${E.length?'A reroll replaces every current enchantment with new random ones.':'Grants 2\u20133 random enchantments.'}</small>`;
 sheet.innerHTML=h;
 $('enRoll').onclick=()=>{if(gold<ENCH_PRICE)return;gold-=ENCH_PRICE;P.weapon.ench=rollEnchant();
  for(let i=0;i<24;i++)parts.push({x:P.x+6,y:P.y+10,vx:(Math.random()-.5)*160,vy:-Math.random()*140,l:.8,c:i%2?'#c8a0ff':'#ffe08a'});
  Audio_.beep(400,.1,'sine',.08);setTimeout(()=>Audio_.beep(600,.1,'sine',.08),80);setTimeout(()=>Audio_.beep(900,.2,'sine',.09),160);
  save();drawEnch()}}

function drawEnchantAltar(ox,oy,L){if(!ENCP||!P)return;const X=Math.round(ENCP.x-ox),Y=Math.round(ENCP.y-oy),t=time;
 if(X<-90||X>cv.width+90||Y<-100||Y>cv.height+60)return;
 const pu=.5+.5*Math.sin(t*2.2),pu2=.5+.5*Math.sin(t*3.1+1);
 AD(()=>{cx.save();cx.translate(X,Y-1);cx.scale(1,.28);glow(0,0,52,'rgba(180,120,255,'+(.4+.15*pu)+')');cx.restore();
  cx.lineWidth=1.4;cx.strokeStyle='rgba(200,150,255,'+(.55+.3*pu)+')';cx.beginPath();cx.ellipse(X,Y-1,32,6.5,0,0,6.283);cx.stroke();
  cx.strokeStyle='rgba(255,210,120,'+(.4+.3*pu2)+')';cx.beginPath();cx.ellipse(X,Y-1,22,4.4,0,0,6.283);cx.stroke();
  for(let i=0;i<10;i++){const a=t*.7+i*.628,px=X+Math.cos(a)*32,py=Y-1+Math.sin(a)*6.5;cx.fillStyle='rgba(255,225,150,'+(.35+.6*Math.sin(t*3+i)**2)+')';cx.fillRect(px-1,py-1,2,2)}});
 FR(X-18,Y-4,36,4,'#2e2a3c');FR(X-18,Y-4,36,1,'#6a6288');FR(X-14,Y-8,28,4,'#3a3550');FR(X-14,Y-8,28,1,'#7a7298');
 FR(X-8,Y-23,16,15,'#463f60');FR(X-8,Y-23,3,15,'#5a5278');FR(X+5,Y-23,3,15,'#2e2842');FR(X-10,Y-26,20,4,'#5a5278');FR(X-10,Y-26,20,1,'#a49cc8');
 FR(X-4,Y-8,8,1,'#2a2438');
 AD(()=>{for(let i=0;i<3;i++){cx.fillStyle='rgba(210,160,255,'+(.35+.55*Math.sin(t*2.5+i*1.7)**2)+')';cx.fillRect(X-1,Y-21+i*4.5,2,2)}
  cx.fillStyle='rgba(255,215,120,'+(.4+.4*pu)+')';cx.fillRect(X-6,Y-24,2,1);cx.fillRect(X+4,Y-24,2,1)});
 const fy=Y-46+Math.sin(t*1.8)*3;
 orb(X,fy,42+pu*10,'rgba(190,130,255,.55)');
 cx.save();cx.translate(X,fy);cx.rotate(Math.sin(t*.9)*.12);
  FR(-2,-16,4,23,'#2a2a3e');FR(-1,-15,2,21,'#dfe8ff');FR(-1,-15,1,21,'#fff');PL([-2,-16,0,-22,2,-16],'#fff');
  FR(-6,6,12,2,'#d9a441');FR(-6,6,12,1,'#ffe08a');FR(-1,8,2,5,'#6a4a2a');FR(-2,13,4,2,'#d9a441');
  AD(()=>{cx.fillStyle='rgba(200,150,255,'+(.4+.4*pu2)+')';for(let i=0;i<3;i++)cx.fillRect(-1,-11+i*6,2,2)});
 cx.restore();
 for(let i=0;i<4;i++){const a=t*1.4+i*1.57,sx=X+Math.cos(a)*18,sy=fy+Math.sin(a)*7;PL([sx,sy-3,sx+2,sy,sx,sy+3,sx-2,sy],i%2?'#ffe08a':'#d8bcff');orb(sx,sy,7,'rgba(200,160,255,.6)')}
 for(let i=0;i<6;i++){const lf=((t*18+i*23)%60)/60;AD(()=>{cx.fillStyle='rgba(220,180,255,'+Math.sin(lf*Math.PI)*.8+')';cx.fillRect(X+Math.sin(i*2.1+t)*12,Y-10-lf*50,1,2)})}
 L.push([X,fy,130],[X,Y-6,70]);
 cx.save();cx.textAlign='center';cx.font='bold 8px Georgia';cx.shadowColor='#a060ff';cx.shadowBlur=6;cx.fillStyle='#e6d6ff';cx.fillText('ENCHANTING ALTAR',X,fy-30);cx.shadowBlur=0;
 if(nearEnch()){cx.fillStyle='#ffd36b';cx.font='bold 9px Georgia';cx.fillText('[E] Enchant weapon \u00b7 '+ENCH_PRICE+'g',X,fy-20)}cx.restore()}

// ---------------------------- Enemy art overhaul ----------------------------
const FW=112,FHH=96,OXs=56,OYs=78;
const FOS=document.createElement('canvas');FOS.width=FW;FOS.height=FHH;const fg=FOS.getContext('2d');
const FOO=document.createElement('canvas');FOO.width=FW;FOO.height=FHH;const og=FOO.getContext('2d');
const fR=(x,y,w,h,c)=>{fg.fillStyle=c;fg.fillRect(Math.round(x),Math.round(y),w,h)};
const fP=(p,c)=>{fg.fillStyle=c;fg.beginPath();fg.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)fg.lineTo(p[i],p[i+1]);fg.closePath();fg.fill()};
const fC=(x,y,r,c)=>{fg.fillStyle=c;fg.beginPath();fg.arc(x,y,r,0,6.283);fg.fill()};
const fL=(x1,y1,x2,y2,w,c)=>{fg.strokeStyle=c;fg.lineWidth=w;fg.lineCap='butt';fg.beginPath();fg.moveTo(x1,y1);fg.lineTo(x2,y2);fg.stroke()};
const ease=t=>1-(1-t)*(1-t),lerp=(a,b,t)=>a+(b-a)*t;
const poseA=(S,idle,raise,fin)=>S.a>0?lerp(raise,fin,ease(S.a)):lerp(idle,raise,ease(S.w));
function legs(S,hy,sep,w,c1,c2,boot){for(const dr of[-1,1]){const ang=S.sw*dr,hx=dr*sep/2,fx=hx+ang*4.5,fy=-Math.max(0,ang)*2.6;
 fL(hx,hy,fx,fy-2,w,dr<0?c1:c2);fR(fx-w/2-.5+(dr>0?.6:0),fy-2,w+2,2,boot)}}
const LEGD={id:'cave',k:'melee',wu:.55,c:['#6a2a1e','#8a3a2a','#f84']};
const NOOUT={wisp:1};
function foeS(e){const d=e.def,fly=!!(d&&d.k==='fly'),wu=d?d.wu:.55,st=e.st,
 mv=!fly&&e.onGround&&Math.abs(e.vx)>14&&st!=='windup'&&st!=='stagger'&&st!=='broken'&&st!=='attack'?1:0,ph=((e.home|0)%97)*.37;
 return{fly,mv,sw:Math.sin(e.x*.42)*mv,ph,
  w:st==='windup'?clamp(1-e.t/(e.tw||wu),0,1):0,
  a:st==='attack'?clamp(1-e.t/(fly?.5:d?.16:.14),0,1):0,
  brk:st==='broken',stg:st==='stagger',el:!!e.el,
  bob:mv?-Math.abs(Math.sin(e.x*.42))*1.3:Math.sin(time*2.4+ph)*.7}}
const FP={},FX={};

// --- Cave Stalker (surface / shallow caves) ---
FP.cave=(S,e)=>{const dp=e.lvl>1,k=dp?['#3e2450','#62387c','#8a5ca8']:['#4e3224','#74492f','#9a6a48'],ew=S.w?'#ff3030':'#ffe03a';
 legs(S,-8,5.5,3,k[0],k[1],'#1c120e');
 fg.save();fg.translate(0,S.bob);fg.translate(0,-8);fg.rotate(S.w*-.12+S.a*.2);fg.translate(0,8);
 fL(-3,-15,-6,-9,2.6,k[0]);fR(-7,-10,3,3,k[1]);
 fP([-6,-8,-6,-15,-2,-19,4,-18,6,-13,5,-8],k[1]);fP([-6,-8,-6,-15,-2,-19,-1,-13,-2,-8],k[0]);
 fR(1,-15,4,1,k[2]);fR(0,-12,5,1,k[0]);fR(-4,-17,3,1,k[2]);
 fP([-6,-8,6,-8,5,-3,2,-5,0,-2,-3,-5,-5,-3],'#2c1c14');fR(-6,-9,12,1,'#b8a888');fR(-1,-9,3,1,'#d9a441');
 fP([-1,-24,6,-24,9,-20,8,-16,0,-16,-2,-20],k[1]);fP([-1,-24,6,-24,9,-20,4,-20],k[2]);
 fP([-2,-22,-7,-26,-3,-19],k[1]);fP([-2,-22,-5,-25,-3,-20],k[2]);fP([3,-24,4,-29,7,-24],k[1]);
 fR(3,-22,5,1,k[0]);fR(5,-21,2,2,ew);fR(6,-20,1,1,'#000');fR(4,-18,4,1,'#1a0c0c');fR(4,-18,1,2,'#eee');fR(7,-18,1,2,'#eee');
 const a=poseA(S,1.05,-2.5,1.0),hx=3+Math.cos(a)*7,hy=-15+Math.sin(a)*7;fL(3,-15,hx,hy,3,k[2]);fR(hx-1.5,hy-1.5,3,3,k[1]);
 fg.save();fg.translate(hx,hy);fg.rotate(a-.7);fR(-2,-1,13,3,'#d8cdb0');fR(-2,-1,13,1,'#fff');fC(12,0.5,3,'#c8bc9c');fR(9,-2,2,1,'#8a7a5a');fR(10,2,2,1,'#8a7a5a');fg.restore();
 fg.restore()};
FX.cave=(S,e,cxm,Y,f,sc,L)=>{L.push([cxm+f*5*sc,Y+4*sc,S.w?44:26])};

// --- Ash Warrior ---
FP.ash=(S,e)=>{const A=['#241614','#3a2420','#5a3630','#8a5446'],em='#ff8a2a',ef=S.w?'#ff3a1a':em;
 legs(S,-9,6,3.4,A[0],A[1],'#120a09');fR(-5,-5,3,1,em);fR(2,-4,3,1,em);fR(-3,-7,1,2,em);
 fg.save();fg.translate(0,S.bob);fg.translate(0,-9);fg.rotate(S.w*-.1+S.a*.18);fg.translate(0,9);
 fP([-6,-17,-9,-8,-8,-3,-5,-6,-4,-9],'#1a0e0e');fP([-6,-17,-9,-8,-8,-3,-7,-9],'#2a1414');
 fL(-4,-16,-7,-10,3,A[0]);fR(-9,-11,3,3,A[1]);
 fP([-6,-9,-7,-16,-3,-18,4,-18,7,-16,6,-9],A[1]);fP([-6,-9,-7,-16,-3,-18,-2,-9],A[0]);fR(-2,-17,7,1,A[3]);
 fR(0,-16,1,4,ef);fR(1,-13,2,1,ef);fR(-1,-11,1,2,ef);fR(3,-15,1,3,ef);fR(2,-12,1,2,ef);
 fR(-6,-10,12,2,'#2a1a14');fR(-1,-10,3,2,'#d9a441');fP([-6,-9,6,-9,5,-5,0,-6,-5,-5],A[0]);
 fP([-3,-17,-8,-17,-8,-14,-3,-14],A[2]);fP([-8,-17,-9,-22,-6,-17],A[3]);fP([4,-18,9,-17,9,-14,4,-14],A[2]);fP([8,-17,10,-22,11,-16],A[3]);
 fR(-3,-26,8,8,A[1]);fR(-3,-26,8,2,A[2]);fR(-4,-23,1,4,A[0]);fR(5,-22,1,5,A[0]);
 fP([-3,-26,-8,-32,-5,-24],'#c8b898');fP([5,-26,10,-32,7,-24],'#c8b898');fP([-3,-26,-8,-32,-6,-26],'#8a7a60');
 fR(0,-23,5,2,'#080404');fR(1,-23,3,1,ef);fR(-1,-19,6,1,A[0]);
 const a=poseA(S,.95,-2.4,1.0),ex=4+Math.cos(a)*7,ey=-15+Math.sin(a)*7;fL(4,-15,ex,ey,3.2,A[2]);fR(ex-1.5,ey-1.5,3,3,A[3]);
 fg.save();fg.translate(ex,ey);fg.rotate(a-.9);fR(-3,-1,5,3,'#2a1a14');fR(1,-3,2,7,'#d9a441');
 fP([3,-1.8,16,-1.4,21,0,16,1.4,3,1.8],'#6a5a58');fR(3,0,16,1,ef);fR(4,-1,14,1,'#8a7a76');fg.restore();
 fg.restore()};
FX.ash=(S,e,cxm,Y,f,sc,L)=>{AD(()=>{for(let i=0;i<5;i++){const lf=((time*.9+i*.37+S.ph)%1),x=cxm+Math.sin(i*2.3+time*2)*5*sc,y=Y+(14-lf*26)*sc;cx.fillStyle='rgba(255,'+(120+i*20)+',40,'+Math.sin(lf*Math.PI)*.9+')';cx.fillRect(x,y,1.5,1.5)}});
 L.push([cxm,Y+11*sc,S.w?70:38])};

// --- Cinder Caster ---
FP.cinder=(S,e)=>{const R=['#3a0c08','#601a10','#8a3a20','#c8643a'],y0=-3+Math.sin(time*3+S.ph)*1.6,ew=S.w?'#fff':'#ffd23a';
 fg.save();fg.translate(0,y0+S.bob*.3);
 fP([-8,0,-6,-13,6,-13,8,0,5,-3,2,1,-1,-3,-4,1],R[1]);fP([-8,0,-6,-13,-2,-13,-3,-3,-4,1],R[0]);fR(-6,-12,12,1,'#d9a441');fR(-5,-9,10,1,'#d9a441');
 fR(-1,-8,2,2,'#ff7a1a');fR(0,-7,1,1,'#ffe08a');
 fL(-3,-12,-6,-13-S.w*7,2.6,R[2]);fR(-8,-15-S.w*7,3,3,'#e0b890');if(S.w>0)fC(-7,-14-S.w*7,1.5+S.w*2,'rgba(255,200,80,.9)');
 fP([-6,-13,-5,-22,-1,-26,4,-24,7,-17,6,-13],R[2]);fP([-6,-13,-5,-22,-1,-26,0,-15],R[1]);fP([-1,-26,4,-24,7,-17,5,-17],R[3]);
 fP([-1,-22,4,-22,6,-17,0,-16],'#0a0305');fR(1,-20,1,2,ew);fR(4,-20,1,2,ew);fR(2,-14,1,1,'#ffd23a');
 fL(3,-12,7,-12,2.6,R[2]);fR(6,-14,3,3,'#e0b890');
 fR(7,-27,1.6,27,'#4a2a1a');fR(6,-8,3,1,'#d9a441');fR(6,-17,3,1,'#d9a441');fR(6,-25,3,1,'#d9a441');
 fP([5,-27,7.8,-31,10,-27,7.8,-25],'#2a1410');
 fC(7.8,-28,2.2+S.w*2.6+Math.sin(time*9)*.3,'#ff8a1a');fC(7.8,-28,1.2+S.w*1.6,'#ffee9a');
 fg.restore()};
FX.cinder=(S,e,cxm,Y,f,sc,L)=>{const ox=cxm+f*7.8*sc,oy=Y+(e.h-31-Math.sin(time*3+S.ph)*1.6)*sc;orb(ox,oy,16+S.w*22,'rgba(255,140,40,'+(.5+.4*S.w)+')');L.push([ox,oy,60+S.w*60]);
 AD(()=>{for(let i=0;i<4;i++){const a=time*2.2+i*1.57+S.ph,r=9+S.w*5;cx.fillStyle='rgba(255,'+(150+i*25)+',60,.9)';cx.fillRect(ox+Math.cos(a)*r,oy+Math.sin(a)*r*.6,1.5,1.5)}})};

// --- Frost Stalker ---
FP.stalker=(S,e)=>{const C=['#3a5878','#6a9ac0','#9ad0e8','#e4f6ff'],ey=S.w?'#ff5a5a':'#fff';
 legs(S,-8,7,3.4,C[0],C[1],'#dff0fa');
 fg.save();fg.translate(0,S.bob);fg.translate(0,-8);fg.rotate(.26-S.w*.38+S.a*.55);fg.translate(0,8);
 for(let k=0;k<4;k++){const sx=-6+k*2.8,sy=-17+k*.7;fP([sx,sy,sx-2.8,sy-6-(k%2)*2.5,sx+1.6,sy-1],k%2?C[3]:C[2])}
 fL(-2,-15,-6,-8+S.sw*2,3,C[0]);
 fP([-7,-8,-6,-17,0,-19,6,-17,6,-8],C[1]);fP([-7,-8,-6,-17,0,-19,0,-9],C[0]);fR(0,-16,5,1,C[2]);fR(1,-13,4,1,C[2]);fR(1,-10,3,1,C[2]);
 const ar=S.w?-1.1:.95+S.sw*.4,ax=3+Math.cos(ar)*9,ay=-15+Math.sin(ar)*9;
 fL(3,-15,ax,ay,3.4,C[1]);fR(ax-1.5,ay-1.5,3,3,C[2]);for(let c=-1;c<=1;c++)fP([ax+c*1.5,ay,ax+c*1.5+2.5,ay+(S.w?-4:4),ax+c*1.5+.5,ay+1],'#fff');
 fP([2,-23,9,-22,12,-18,10,-15,3,-16],C[2]);fP([2,-23,9,-22,12,-18,3,-18],C[1]);fP([4,-15,11,-15,10,-12,5,-13],C[0]);
 fR(6,-16,1,2,'#fff');fR(9,-16,1,2,'#fff');fR(7,-21,3,2,ey);fR(8,-20,1,1,'#000');fR(5,-23,5,1,C[0]);
 fP([2,-23,0,-29,5,-23],C[3]);fP([5,-23,6,-28,8,-23],C[2]);
 fg.restore()};
FX.stalker=(S,e,cxm,Y,f,sc,L)=>{AD(()=>{for(let i=0;i<4;i++){const lf=((time*.8+i*.31+S.ph)%1);cx.fillStyle='rgba(200,240,255,'+Math.sin(lf*Math.PI)*.7+')';cx.fillRect(cxm-f*(4+lf*14)*sc,Y+e.h*sc*.5+Math.sin(i*3+time*5)*3,1.5,1.5)}});L.push([cxm+f*7*sc,Y+5*sc,28])};

// --- Frozen Warrior ---
FP.frozen=(S,e)=>{const I=['#2e4660','#4a6a88','#7a9ab8','#c4e4f8','#fff'];
 legs(S,-9,6.5,3.8,I[0],I[1],I[0]);
 fg.save();fg.translate(0,S.bob);fg.translate(0,-9);fg.rotate(S.w*-.08+S.a*.14);fg.translate(0,9);
 const a=poseA(S,.9,-1.8,.2),hx=-3+Math.cos(a)*7,hy=-16+Math.sin(a)*7;fL(-3,-16,hx,hy,3.2,I[1]);fR(hx-1.5,hy-1.5,3,3,I[2]);
 fg.save();fg.translate(hx,hy);fg.rotate(a-.6);fR(-3,-1,5,3,'#4a3a2a');fR(1,-3,2,7,I[2]);fP([3,-2,18,-2,23,0,18,2,3,2],I[3]);fR(3,-1,18,1,'#fff');fP([8,-2,10,-6,12,-2],I[3]);fP([13,2,15,6,17,2],I[3]);fg.restore();
 fP([-7,-9,-8,-17,-3,-19,5,-19,8,-17,7,-9],I[1]);fP([-7,-9,-8,-17,-3,-19,-2,-9],I[0]);fR(-3,-19,8,1,I[3]);fR(-7,-13,14,1,I[2]);fR(-1,-17,2,6,I[2]);
 fR(-7,-10,14,2,'#2a3a4a');fR(-1,-10,3,2,I[3]);
 fP([-9,-17,-3,-18,-3,-14,-8,-14],I[2]);for(let k=0;k<3;k++)fP([-8+k*2,-14,-7+k*2,-9-k%2*2,-6+k*2,-14],I[3]);
 fR(-3,-27,8,9,I[1]);fR(-3,-27,8,2,I[3]);fR(-4,-24,1,5,I[0]);fR(0,-24,6,2,'#08141f');fR(1,-24,4,1,'#9ff');fR(5,-23,1,4,I[0]);fR(1,-20,3,1,I[0]);
 fP([-3,-27,-6,-35,0,-28],I[3]);fP([0,-28,1,-37,3,-28],I[4]);fP([3,-28,8,-34,6,-26],I[3]);
 fP([5,-22,13,-20,13,-10,9,-3,5,-9],'#1e3248');fP([6,-21,12,-19,12,-10,9,-5,6,-10],I[2]);fP([6,-21,9,-20,9,-6,6,-10],I[3]);
 fR(8,-17,1,10,I[4]);fR(6,-13,6,1,I[4]);fC(9,-14,2.2,I[3]);fC(9,-14,1,I[4]);
 fg.restore()};
FX.frozen=(S,e,cxm,Y,f,sc,L)=>{AD(()=>{for(let i=0;i<5;i++){const lf=((time*.5+i*.2+S.ph)%1);cx.fillStyle='rgba(190,235,255,'+Math.sin(lf*Math.PI)*.45+')';cx.fillRect(cxm+Math.sin(i*2+time)*8*sc,Y+(e.h-2-lf*8)*sc,2,1)}});L.push([cxm+f*8*sc,Y+8*sc,36])};

// --- Storm Archer ---
FP.archer=(S,e)=>{const A=['#1e1e34','#3a3a5a','#5a5a8a','#8a8ac0'],ey='#ffee55',pull=S.w*6;
 legs(S,-9,5,2.8,A[0],A[1],'#14142a');
 fg.save();fg.translate(0,S.bob);fg.translate(0,-9);fg.rotate(S.w*-.06);fg.translate(0,9);
 fP([-4,-17,-9,-6,-7,-2,-5,-6,-3,-3,-2,-8],A[0]);
 fR(-7,-20,3,10,'#5a3a22');fR(-7,-20,3,1,'#8a6a42');fR(-6,-24,1,5,'#ddd');fR(-4,-23,1,4,'#ffe36a');fR(-5,-25,2,1,'#ffe36a');
 fP([-5,-9,-5,-17,0,-18,5,-17,5,-9],A[1]);fP([-5,-9,-5,-17,0,-18,-1,-9],A[0]);fR(-5,-10,10,1,'#6a4a2a');fL(-4,-17,4,-10,1.4,'#6a4a2a');fR(1,-12,2,2,'#d9a441');
 fP([-5,-18,-4,-26,1,-28,6,-24,6,-18],A[2]);fP([-5,-18,-4,-26,1,-28,0,-18],A[1]);fP([1,-28,6,-24,6,-22,2,-24],A[3]);
 fR(1,-24,5,5,'#0e0e1a');fR(2,-23,3,1,ey);fR(5,-23,1,1,'#fff');
 const nk=7-pull;fL(-1,-15,nk,-14,2.4,A[1]);fR(nk-1.5,-15.5,3,3,A[3]);
 fg.strokeStyle='#8a5a2a';fg.lineWidth=2;fg.beginPath();fg.arc(4,-14,10,-1.15,1.15);fg.stroke();fg.strokeStyle='#c8924a';fg.lineWidth=.8;fg.beginPath();fg.arc(4,-14,10,-1.15,1.15);fg.stroke();
 fg.strokeStyle='#eee';fg.lineWidth=.8;fg.beginPath();fg.moveTo(8.2,-23);fg.lineTo(nk,-14);fg.lineTo(8.2,-5);fg.stroke();
 fL(3,-15,11,-14,2.6,A[2]);fR(10,-15.5,3,3,A[3]);
 if(S.w>0){fL(nk,-14,17,-14,1.1,'#ddd');fP([17,-16.5,22,-14,17,-11.5],'#ffee55');fR(nk,-15,3,1,'#ffee55')}
 fg.restore()};
FX.archer=(S,e,cxm,Y,f,sc,L)=>{if(S.w>0){const ax=cxm+f*18*sc,ay=Y+(e.h-23)*sc;orb(ax,ay,14+S.w*12,'rgba(255,240,90,'+(.5+.4*S.w)+')');L.push([ax,ay,50+S.w*40]);
 AD(()=>{cx.strokeStyle='rgba(255,250,150,.9)';cx.lineWidth=1;for(let i=0;i<2;i++){const x=cxm+f*(8+Math.random()*14)*sc;cx.beginPath();cx.moveTo(x,ay-6);cx.lineTo(x+(Math.random()-.5)*6,ay);cx.lineTo(x+(Math.random()-.5)*6,ay+6);cx.stroke()}})}
 L.push([cxm+f*3*sc,Y+4*sc,22])};

// --- Gale Wisp (flying, drawn around the hitbox centre) ---
FP.wisp=(S,e)=>{const t=time*3+S.ph,cy=-7,pu=1+Math.sin(time*9+S.ph)*.12+S.w*.6,fl=Math.sin(time*22+S.ph)*2.5;
 let g=fg.createRadialGradient(0,cy,0,0,cy,13*pu);g.addColorStop(0,'rgba(255,255,230,.95)');g.addColorStop(.35,'rgba(255,240,120,.6)');g.addColorStop(1,'rgba(255,210,60,0)');fg.fillStyle=g;fg.beginPath();fg.arc(0,cy,13*pu,0,6.283);fg.fill();
 fg.lineCap='round';
 for(const s of[-1,1])for(let k=0;k<3;k++){fg.strokeStyle='rgba(255,255,'+(220-k*30)+','+(.85-k*.2)+')';fg.lineWidth=1.6-k*.3;fg.beginPath();fg.moveTo(s*3,cy-1+k);fg.quadraticCurveTo(s*(10+k*3),cy-9-k*2+fl,s*(15+k*2),cy-1+k*3+fl*.4);fg.stroke()}
 for(let k=0;k<3;k++){const a=t+k*2.09;fg.strokeStyle='rgba(255,255,255,.6)';fg.lineWidth=1;fg.beginPath();fg.arc(0,cy,7+k,a,a+1.2);fg.stroke()}
 fC(0,cy,4.2,'#fffbe0');fR(-2,cy-1.5,1.5,2.5,S.w?'#e03a1a':'#c88a1a');fR(1,cy-1.5,1.5,2.5,S.w?'#e03a1a':'#c88a1a');fR(-1,cy+2,2,1,'#fff6c0')};
FX.wisp=(S,e,cxm,Y,f,sc,L)=>{const cy=Y+e.h/2;orb(cxm,cy,26+S.w*20,'rgba(255,235,120,'+(.45+.3*S.w)+')');L.push([cxm,cy,70+S.w*40]);
 AD(()=>{for(let i=0;i<6;i++){const lf=((time*1.4+i*.17+S.ph)%1);cx.fillStyle='rgba(255,250,200,'+(1-lf)*.7+')';cx.fillRect(cxm-f*lf*20+Math.sin(i*4+time*6)*2,cy+Math.sin(i*2.7+lf*5)*5,1.5,1.5)}})};

// --- Shade ---
FP.shade=(S,e)=>{const t=time;
 for(let i=0;i<6;i++){const x=-7+i*2.8,w=Math.sin(t*3+i*1.3+S.ph)*2;fP([x-1.6,-10,x+1.6,-10,x+w,-1-(i%2)*3],i%2?'#1a0f2a':'#2a1a3a')}
 fg.save();fg.translate(0,S.bob);
 fP([-7,-9,-6,-21,0,-26,6,-21,7,-9],'#2a1a3a');fP([-7,-9,-6,-21,-2,-24,-3,-9],'#1a1028');fP([2,-24,6,-21,7,-9,4,-9],'#3e2a5a');fR(-7,-9,14,1,'#4a3a6a');fR(0,-18,1,8,'#1a1028');
 fP([-4,-25,0,-30,5,-24,4,-17,-3,-17],'#14091f');fP([0,-30,5,-24,5,-22,1,-27],'#3e2a5a');
 const ec=S.w?'#ff6a8a':'#fff',eh=S.w?4:3;fR(-1,-23,2,eh,ec);fR(2.5,-23,2,eh,ec);fR(-1,-23+eh,2,1,'#a08ae0');fR(2.5,-23+eh,2,1,'#a08ae0');
 const reach=9+Math.sin(t*2+S.ph)+S.w*3+S.a*5,up=-S.w*8+S.a*6;
 fL(3,-18,3+reach,-13+up,1.8,'#2a1a3a');for(let c=-1;c<=1;c++)fL(3+reach,-13+up,3+reach+3,-13+up+c*2,.8,'#c8b8ff');
 fL(-3,-18,-8,-11+up*.5,1.8,'#1a1028');
 fg.restore()};
FX.shade=(S,e,cxm,Y,f,sc,L)=>{AD(()=>{for(let i=0;i<6;i++){const lf=((time*.6+i*.19+S.ph)%1);cx.fillStyle='rgba(150,110,230,'+Math.sin(lf*Math.PI)*.5+')';cx.fillRect(cxm+Math.sin(i*3.1+time*2)*7*sc,Y+(e.h-lf*e.h*1.1)*sc,2,2)}});
 L.push([cxm,Y+9*sc,S.w?70:34])};

// --- Hollow Knight ---
FP.hknight=(S,e)=>{const D=['#14141e','#2a2a3a','#4a4a62','#7a7a9a'],V='#b48aff',vp=.5+.5*Math.sin(time*4);
 legs(S,-12,8.5,4.8,D[0],D[1],'#0e0e16');
 fg.save();fg.translate(0,S.bob);fg.translate(0,-12);fg.rotate(S.w*-.08+S.a*.14);fg.translate(0,12);
 fP([-9,-24,-14,-8,-10,-1,-6,-6,-4,-11],'#190a2a');fP([-9,-24,-14,-8,-12,-8,-7,-12],'#2a1440');
 fP([-9,-12,-10,-23,-5,-26,6,-26,11,-23,10,-12],D[1]);fP([-9,-12,-10,-23,-5,-26,-3,-12],D[0]);fR(-5,-26,11,1,D[3]);
 fP([-3,-23,4,-23,5,-15,-2,-15],'#0a0612');fC(1,-19,2+vp,'rgba(180,138,255,.9)');fC(1,-19,1,'#fff');fR(-3,-23,1,8,D[2]);fR(4,-23,1,8,D[2]);
 fR(-9,-13,19,2,'#1a1424');fR(0,-13,3,2,V);fP([-9,-12,10,-12,9,-6,2,-8,-6,-6],D[0]);
 fP([-5,-26,-12,-27,-12,-21,-5,-21],D[2]);fP([-12,-27,-13,-33,-9,-27],D[3]);fP([5,-27,12,-27,12,-21,5,-21],D[2]);fP([11,-27,14,-33,9,-27],D[3]);
 fR(-4,-37,10,10,D[1]);fR(-4,-37,10,2,D[3]);fR(-5,-33,1,5,D[0]);fR(6,-33,1,5,D[0]);fR(0,-33,6,2,'#08040e');fR(1,-33,4,1,V);fR(1,-30,1,3,D[0]);fR(3,-30,1,3,D[0]);
 fR(2,-37,1,5,D[0]);fP([-4,-37,1,-43,6,-37],D[2]);fP([0,-43,3,-43,1,-37],D[3]);
 const a=poseA(S,1.15,-2.3,.8),ex=5+Math.cos(a)*9,ey=-22+Math.sin(a)*9;fL(5,-22,ex,ey,4.4,D[2]);fR(ex-2,ey-2,4,4,D[3]);
 fg.save();fg.translate(ex,ey);fg.rotate(a-.7);fR(-4,-1.5,6,4,'#1a1424');fR(1,-4,3,9,D[3]);fP([4,-3,26,-3,34,0,26,3,4,3],'#8a7aaf');fP([4,-3,26,-3,34,0,12,0],'#b8a8dc');fR(6,0,22,1,V);fR(10,-1,1,3,V);fR(16,-1,1,3,V);fR(22,-1,1,3,V);fg.restore();
 fg.restore()};
FX.hknight=(S,e,cxm,Y,f,sc,L)=>{const vx=cxm+f*1*sc,vy=Y+(e.h-19-12*0)*sc*.0+e.h*sc*.3;orb(cxm,Y+e.h*sc*.4,30+S.w*20,'rgba(170,120,255,'+(.4+.3*S.w)+')');L.push([cxm,Y+e.h*sc*.4,90]);
 AD(()=>{for(let i=0;i<6;i++){const a=time*1.2+i*1.05+S.ph,r=12+Math.sin(time*2+i)*3;cx.fillStyle='rgba(190,150,255,'+(.4+.4*Math.sin(time*3+i))+')';cx.fillRect(cxm+Math.cos(a)*r*sc,Y+e.h*sc*.45+Math.sin(a)*r*.7*sc,1.5,1.5)}})};

// --- main entry: draws every non-boss enemy ---
function drawFoe(e,X,Y,lights){
 const d=e.def||LEGD,id=d.id||'cave',S=foeS(e),f=e.face||1,sc=e.w/(d.w||14),cxm=X+e.w/2,feet=Y+e.h;
 if(!S.fly){cx.fillStyle='rgba(0,0,0,.4)';cx.beginPath();cx.ellipse(cxm,feet,e.w*.62,2,0,0,6.283);cx.fill()}
 if(e.el){AD(()=>{cx.save();cx.translate(cxm,feet);cx.scale(1,.3);glow(0,0,26+Math.sin(time*4)*3,'rgba(255,200,80,.5)');cx.restore()})}
 fg.clearRect(0,0,FW,FHH);fg.save();fg.translate(OXs,OYs);fg.scale(f*sc,sc);(FP[id]||FP.cave)(S,e);fg.restore();
 fg.globalCompositeOperation='source-atop';
 if(S.stg){fg.fillStyle='rgba(255,255,255,.85)';fg.fillRect(0,0,FW,FHH)}
 else if(S.brk){fg.fillStyle='rgba(255,215,90,'+(.28+.14*Math.sin(time*18))+')';fg.fillRect(0,0,FW,FHH)}
 else if(S.w>0){fg.fillStyle='rgba(255,40,40,'+(.1+.3*S.w*(.5+.5*Math.sin(time*(14+S.w*24))))+')';fg.fillRect(0,0,FW,FHH)}
 fg.globalCompositeOperation='source-over';
 og.clearRect(0,0,FW,FHH);
 if(!NOOUT[id]){for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1]])og.drawImage(FOS,dx,dy);
  og.globalCompositeOperation='source-in';og.fillStyle=e.el?'#ffd36b':'#0b0710';og.fillRect(0,0,FW,FHH);og.globalCompositeOperation='source-over'}
 og.drawImage(FOS,0,0);
 cx.save();if(id==='shade')cx.globalAlpha=.78;cx.drawImage(FOO,Math.round(cxm-OXs),Math.round(feet-OYs));cx.restore();
 if(FX[id])FX[id](S,e,cxm,Y,f,sc,lights);
 if(e.el)lights.push([cxm,Y+e.h/2,46]);
 if(e.st==='attack'&&d.k!=='ranged'&&!S.fly){foeSlash(e,S,d,id,cxm,Y,f,sc,lights)}
 if(false){const p=S.a,ang=f>0?-1.3+p*2.6:Math.PI+1.3-p*2.6,col=d.c[2],r=(id==='hknight'?40:30)*sc;
  cx.save();cx.translate(cxm,Y+e.h*.5);lights.push([cxm+f*18,Y+e.h*.5,80]);
  cx.lineCap='butt';cx.strokeStyle=col;cx.globalAlpha=.35;cx.lineWidth=11;cx.beginPath();if(f>0)cx.arc(0,0,r,ang-1.3,ang);else cx.arc(0,0,r,ang,ang+1.3);cx.stroke();
  cx.globalAlpha=.85;cx.lineWidth=6;cx.stroke();cx.globalAlpha=1;cx.strokeStyle='#fff';cx.lineWidth=2;cx.stroke();
  cx.fillStyle='#fff';cx.fillRect(Math.cos(ang)*r-1,Math.sin(ang)*r-1,3,3);cx.restore()}
 if(e.st==='windup')enemyTele(e.def?e:{def:LEGD,t:e.t,tw:.55,w:e.w,h:e.h,face:f,el:e.el},X,Y);
 if(e.hp<e.max||e.el){const bw=Math.max(e.w+4,18),bx=Math.round(cxm-bw/2),by=Y-10,r=clamp(e.hp/e.max,0,1);
  FR(bx-1,by-1,bw+2,5,'#000');FR(bx,by,bw,2,'#2a0a0a');FR(bx,by,bw*r,2,e.el?'#ffd36b':'#e23a3a');FR(bx,by,bw*r,1,e.el?'#fff0b0':'#ff8a8a');
  FR(bx,by+2,bw,1,'#1a1208');FR(bx,by+2,bw*clamp((e.post||0)/(e.pmax||30),0,1),1,'#fb3');
  if(e.el){PL([cxm-4,by-2,cxm-4,by-6,cxm-2,by-4,cxm,by-7,cxm+2,by-4,cxm+4,by-6,cxm+4,by-2],'#ffd36b')}}
 if(S.brk){cx.fillStyle='#ffe08a';for(let k=0;k<3;k++){const a=time*6+k*2.09;cx.fillRect(cxm+Math.cos(a)*9-1.5,Y-14+Math.sin(a)*3,3,3)}
  cx.font='bold 7px Georgia';cx.textAlign='center';cx.fillStyle='#000';cx.fillText('BREAK',cxm+1,Y-17);cx.fillStyle='#ffe08a';cx.fillText('BREAK',cxm,Y-18);cx.textAlign='left'}}

function enchSheet(w){if(!w||!w.ench||!w.ench.length)return '';return '<br><small>'+w.ench.map(b=>'<span style="color:'+qcol(b.q)+'">\u2726 '+EPB[b.k].n+': '+EPB[b.k].f(b.v)+'</span>').join('<br>')+'</small>'}
