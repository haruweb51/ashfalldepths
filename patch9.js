'use strict';
// ===== Ashfall Depths: Patch 9 (load AFTER patch8.js) =====
// The "wall" attack is removed from every boss that had it (Ember Tyrant, Glacial Devourer, Tempest Dragon,
// Hollow King, Nameless Deity). It is replaced by SHIFTING LANES: the whole arena floor is marked in alternating
// columns. Every telegraph is long and fully visible, but the safe columns FLIP between waves, so you must
// keep relocating on a beat. Waves: 2 (phase I) / 3 (phase II) / 4 (final fury). Columns are white-gold and
// zone-coloured so the two sets can be told apart.
(()=>{
const NAME='shiftlanes',SP=76,CW=38,GAP=1.0,WARN=1.5;
function laneSet(B,par){
 const a=B.ar,x0=(a.cx-a.hw+3)*T,x1=(a.cx+a.hw-3)*T,off=B.lo||0,col=par?'255,235,170':B.def.zc,dm=bdm(B);
 for(let x=x0+off+(par?SP/2:0);x<x1;x+=SP)zone(x,(a.fy-a.ht)*T,a.fy*T,CW,WARN,dm,col);
 shake=Math.max(shake,2);tone(par?700:420,par?420:240,.3,'sawtooth',.07)}
AT[NAME]={wu:1.1,act:5,rec:1.4,
 f(B){B.lq=0;B.lz=0;B.lp=0;B.lo=Math.floor(Math.random()*SP*.5)-SP*.25;B.qa=GAP;
  // wave 1 is placed the moment the wind-up ends; the first column set is already warned
  laneSet(B,0);B.lq=1},
 tk(B,dt){B.vx=0;const n=B.fury?4:B.ph===2?3:2;
  if(!B.lz){B.lz=1;B.t=GAP*(n-1)+WARN+.5}
  B.qa-=dt;
  if(B.lq<n&&B.qa<=0){B.qa=GAP;laneSet(B,B.lq%2);
   B.lq++}}};
HINT[NAME]='SAFE COLUMNS FLIP \u00b7 KEEP SHIFTING';
BSND[NAME]=(B,v)=>{v=v==null?1:v;noise(1.2,.2*v,300,2200,'bandpass',2);tone(90,50,1.2,'sawtooth',.12*v);[330,440,550].forEach((f,i)=>tone(f,f*1.3,.5,'triangle',.04*v,.3+i*.35))};

// strip 'wall' out of every boss move list (and keep it out when other patches rebuild the lists)
const fix=d=>{if(!d)return;for(const k of['a1','a2'])if(Array.isArray(d[k])){let had=false;d[k]=d[k].map(x=>x==='wall'?(had=true,NAME):x);d[k]=d[k].filter((x,i,a)=>x!==NAME||a.indexOf(x)===i)}};
const fixAll=()=>{for(const k in BD)fix(BD[k])};
fixAll();
// Shifting Lanes never stacks: no attack is chained into it, none is chained out of it,
// and the phase-II ambient pillars are held off while it is active.
const _ub9=updBoss;updBoss=function(B,dt){if(B&&B.def){fix(B.def);if(B.atk==='wall')B.atk=NAME}
 const live=B&&B.atk===NAME&&(B.st==='tele'||B.st==='act'||B.st==='rec');
 if(live){B.chain=99;B.az=Math.max(B.az||0,.5)}
 const r=_ub9(B,dt);
 if(B&&!B.dead&&B.atk===NAME&&B.st==='tele'&&B.chain>0&&B.chain<99&&B.def){   // it was just chained from another attack: pick something else
  const L=(B.ph===2?B.def.a2:B.def.a1).filter(k=>k!==NAME&&k!==B.lastA&&AT[k]);
  if(L.length){const k=L[Math.random()*L.length|0],m=B.fury?.55:B.ph===2?.68:1;B.lastA=k;B.atk=k;B.twu=B.t=AT[k].wu*m*.8}}
 return r};
const _fx9=updFx;updFx=function(dt){fixAll();return _fx9(dt)};
delete AT.wall;
})();