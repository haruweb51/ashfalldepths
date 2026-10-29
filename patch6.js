// ===== patch6.js — TALENTS + ASHFALL VILLAGE (villagers & quests) =====
// Load AFTER patch5.js. Everything here wraps existing functions; nothing in the older files is edited.
//
// TALENTS: a hand is stored at the Talent Shrine (spawn village) for every 3rd level you have reached (by level count,
// so it works however you gained levels: kills, quests, tutorial rewards...). A hand = up to 3 random talents whose stat
// requirements you meet; pick 1. Skip a hand -> next hand lets you pick 2, skip again -> 3 (capped by the cards in the hand).
// If no talent matches your stats the hand still exists, you may only skip it (for the extra pick) or leave it stored.
(function(){
const NAMES={str:'STR',agi:'AGI',fort:'FORT'};
const TAL=[
 {id:'emerg',n:'Emergency Reserves',req:{fort:5,str:10},d:'Below 50% HP, deal 20% more damage.'},
 {id:'steady',n:'Steady Footing',req:{agi:10},d:'Dodges cost 40% less stamina.'},
 {id:'flash',n:'Perfect Flash',req:{str:15,fort:10},d:'Above 95% HP, deal 25% more damage.'},
 {id:'ghost',n:'Ghost',req:{agi:25},maj:1,d:'Dodging makes you invulnerable and unseen by enemies for 3s (15s cooldown). Bosses still track you, but cannot hurt you.'},
 {id:'bulldoze',n:'Bulldozer',req:{str:15},maj:1,d:'+20% posture damage, and +50% damage against posture-broken or staggered enemies.'},
 {id:'exo',n:'Exoskeleton',req:{fort:15},d:'+30 max posture.'},
 {id:'charm',n:'Charismatic Cast',req:{agi:5},d:'Debuff spells are 10% more effective.'},
 {id:'reinf',n:'Reinforced Armor',req:{fort:20},maj:1,d:'Take 20% less damage.'},
 {id:'runner',n:'Conditioned Runner',req:{agi:20,fort:5},maj:1,d:'Dodging heals 10 HP per second for 5s (10s cooldown).'},
 {id:'risky',n:'Risky Moves',req:{agi:20},maj:1,d:'After a successful dodge, the next attack that would hit you within 3s is evaded entirely (5s cooldown).'},
 {id:'berserk',n:'Berserk',req:{str:20,fort:5},maj:1,d:'The lower your HP, the harder you hit: up to double damage near death.'},
 {id:'sharp',n:'Sharp Edge',req:{str:3},d:'+6% damage.'},
 {id:'thick',n:'Thick Skin',req:{fort:3},d:'+20 max HP.'},
 {id:'feet',n:'Light Feet',req:{agi:3},d:'+12 movement speed.'},
 {id:'wind',n:'Second Wind',req:{agi:5},d:'Stamina regenerates 15% faster.'},
 {id:'study',n:'Quick Study',req:{},d:'+10% XP from kills.'},
 {id:'scav',n:'Scavenger',req:{},d:'+15% gold from kills.'},
 {id:'guard',n:'Guard Discipline',req:{fort:10},d:'Blocking costs 25% less stamina.'},
 {id:'eye',n:'Keen Eye',req:{agi:10,str:5},d:'Your parry window is 0.04s longer.'},
 {id:'thirst',n:'Bloodthirst',req:{str:10,fort:5},d:'Killing an enemy restores 5% of your max HP.'},
 {id:'slip',n:'Slipstream Strike',req:{agi:12},d:'For 3s after dodging, deal 15% more damage.'},
 {id:'vet',n:'Veteran',req:{str:10,agi:10,fort:10},d:'+8% damage and 8% less damage taken.'}
];
const byId={};TAL.forEach(t=>byId[t.id]=t);
const KEY=()=>SAVEKEY+'_tal';
const tHas=id=>!!(P&&P.tal&&P.tal.indexOf(id)>=0);
const rnd=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
let talOpen=false,skipArm=false,vOpen=false,vCur=null,TT=null;

// =====================================================================
//  VILLAGE WORLD: a wide flat, protected plateau around spawn
// =====================================================================
const HALF=42,RAMP=16,SHR_DX=240;      // flat half-width (tiles), slope-out width, talent shrine offset (px)
let VIL=null;
function buildVillage(){
 const c0=W>>1;let sy=0;while(sy<H&&!tiles[sy*W+c0])sy++;
 for(let x=c0-HALF-RAMP;x<=c0+HALF+RAMP;x++){if(x<2||x>=W-2)continue;
  let so=0;while(so<H&&!tiles[so*W+x])so++;
  const d=Math.abs(x-c0);let tg=sy;if(d>HALF){const k=(d-HALF)/RAMP,sm=k*k*(3-2*k);tg=Math.round(sy*(1-sm)+so*sm)}
  if(tg<so){for(let y=tg;y<so;y++)tiles[y*W+x]=2}else if(tg>so){for(let y=so;y<tg;y++)tiles[y*W+x]=0}
  tiles[tg*W+x]=1;
  for(let y=tg+1;y<=tg+8;y++){const v=tiles[y*W+x];if(d<=HALF){if(v===0||v===5||v===6)tiles[y*W+x]=y<tg+6?2:3}else if(v===0&&y<=tg+5)tiles[y*W+x]=2;else if(v===1)tiles[y*W+x]=2}
  for(let y=Math.max(0,tg-34);y<tg;y++)tiles[y*W+x]=0}
 VIL={t:tiles,x0:c0-HALF,x1:c0+HALF,y0:sy,y1:sy+8,gy:sy*T,cxp:c0*T+6}}
const _gen=gen;gen=function(){const r=_gen.apply(this,arguments);try{buildVillage()}catch(e){console.error('village',e)}return r};
const villageLocked=(tx,ty)=>!!(VIL&&tiles===VIL.t&&!window.TUTON&&tx>=VIL.x0&&tx<=VIL.x1&&ty>=VIL.y0&&ty<=VIL.y1);
const _st=setTile;setTile=function(tx,ty,v){if(villageLocked(tx,ty))return;return _st.apply(this,arguments)};
const _mn=mine;mine=function(){let t0=0,tx=-1,ty=-1;
 if(P){const wx=mouse.x+cam.x,wy=mouse.y+cam.y;tx=wx/T|0;ty=wy/T|0;
  if(tx>0&&ty>=0&&tx<W&&ty<H&&tiles[ty*W+tx]){if(villageLocked(tx,ty)){if(Math.hypot(wx-(P.x+6),wy-(P.y+11))<=T*5)toast('The village ground will not break');return}t0=tiles[ty*W+tx]}}
 _mn.apply(this,arguments);
 if(t0&&P&&tx>0&&tiles[ty*W+tx]===0)vqEv('mine')};

// =====================================================================
//  VILLAGERS + THEIR QUESTS
// =====================================================================
// quest ev: parry | kill | elite | mine | dodge | layer | chest | boss.  s: 0 offered, 1 active, 2 ready, 3 done
const VILS=[
 {id:'mira',name:'Mira',title:'Herbalist',home:-208,rng:12,spd:12,kind:'herb',pal:{skin:'#e6bc94',hair:'#7a3a1a',c1:'#3f7a4a',c2:'#2c5a36',c3:'#8ad07a',boots:'#4a2e1a'},
  q:{t:'Moonpetal Tincture',ev:'parry',n:12,d:'Land 12 parries.',rw:'Refill your elixirs \u00b7 300 gold \u00b7 an accessory',
   give(o){const m=ELX_MAX||6;P.el=Math.max(P.el|0,m);o.push('elixirs refilled');gold+=300;o.push('+300g');acc(0,2,o,150)}},
  say:{offer:'The Moonpetal only blooms for those who keep their nerve. Parry twelve blows for me \u2014 steady hands make the finest brews.',act:'Twelve parries, dear. Raise your guard just as the blow lands.',rdy:'Twelve! Your hands know the rhythm now. Here \u2014 my finest brew and a little something extra.',done:'The petals glow brighter ever since you visited.'}},
 {id:'brannoc',name:'Brannoc',title:'Village Smith',home:-302,rng:0,spd:0,kind:'smith',pal:{skin:'#d9a07a',hair:'#5a2a14',c1:'#5a3a24',c2:'#3a2414',c3:'#c9c9d6',boots:'#2a1a12'},
  q:{t:'A Proper Blade',ev:'kill',n:25,d:'Slay 25 enemies.',rw:'An Epic weapon forged by Brannoc \u00b7 120 XP',
   give(o){if(inv.length<20){const w=rollWeapon(Math.max(1,P.lvl+2),3);w.name="Brannoc's "+w.name;inv.push(w);o.push(w.name)}else{gold+=250;o.push('+250g (pack full)')}gainXp(120)}},
  say:{offer:'A blade is only as good as the arm swinging it. Cut down twenty-five of those cave-crawlers and I\u2019ll forge you something proper.',act:'Twenty-five, mind. I can hear the anvil getting impatient.',rdy:'Twenty-five! Hah! Hold out your hand \u2014 this one\u2019s still warm.',done:'Every spark from this forge remembers your name.'}},
 {id:'tolliver',name:'Old Tolliver',title:'Retired Miner',home:-443,rng:18,spd:10,kind:'miner',pal:{skin:'#c99a78',hair:'#b9b9c4',c1:'#6a5a3a',c2:'#4a3e28',c3:'#d4a020',boots:'#2a2018'},
  q:{t:'Hollow Hands',ev:'mine',n:50,d:'Break 50 blocks.',rw:'700 gold \u00b7 40 echoes \u00b7 a Rare+ accessory',
   give(o){gold+=700;o.push('+700g');meta.echoes+=40;saveMeta();o.push('+40 echoes');acc(2,3,o,200)}},
  say:{offer:'My pick\u2019s gone dull but my heart hasn\u2019t. Break fifty blocks down there for me \u2014 I do miss the sound of stone giving way.',act:'Fifty blocks, lad. Swing from the shoulder, not the wrist.',rdy:'Ha! I can hear the dust from here. Take this \u2014 I\u2019ve no use for it in this old age.',done:'Mind the deep dark. It remembers every swing.'}},
 {id:'veyra',name:'Sister Veyra',title:'Pilgrim of the Chapel',home:-558,rng:10,spd:9,kind:'pilgrim',pal:{skin:'#f0d2b4',hair:'#e8e0c8',c1:'#e8e0d0',c2:'#b8b0a0',c3:'#d9a441',boots:'#8a7a5a'},
  q:{t:'Dance With Death',ev:'dodge',n:30,d:'Evade 30 attacks with a dodge.',rw:'A talent hand \u00b7 200 XP',
   give(o){P.thands=(P.thands|0)+1;o.push('+1 talent hand');gainXp(200)}},
  say:{offer:'Grace is a dance with death. Slip thirty blows with a well-timed dodge, and the Hollow itself will bless your step.',act:'Do not run from the blow \u2014 move through it. Thirty times.',rdy:'You move like prayer. Take this blessing \u2014 the shrine will answer.',done:'Walk lightly, wanderer. The dark listens.'}},
 {id:'dorn',name:'Dorn',title:'Hunter',home:498,rng:12,spd:13,kind:'hunter',pal:{skin:'#d4a07a',hair:'#3a2a1a',c1:'#3a5a3a',c2:'#26402a',c3:'#8a6a3a',boots:'#3a2a1a'},
  q:{t:'The Alpha Pack',ev:'elite',n:6,d:'Slay 6 elite enemies.',rw:'3 attribute points \u00b7 50 echoes',
   give(o){P.pts+=3;o.push('+3 attribute points');meta.echoes+=50;saveMeta();o.push('+50 echoes')}},
  say:{offer:'Elite beasts are thinning the herds \u2014 the ones with the burning eyes. Put six of them down and the Depths will quiet.',act:'Six of the burning-eyed ones. Watch their windups.',rdy:'Six! The wild breathes easier. You\u2019ve earned this.',done:'The trail\u2019s clear for now. Stay sharp.'}},
 {id:'lysa',name:'Lysa',title:'Cartographer',home:454,rng:10,spd:9,kind:'scholar',pal:{skin:'#e8c4a0',hair:'#2a1a3a',c1:'#6a3aa0',c2:'#4a2478',c3:'#ffd36b',boots:'#2a1a30'},
  q:{t:'Charting the Depths',ev:'layer',n:3,d:'Descend into the Tempest Depths.',rw:'+1 life \u00b7 100 echoes \u00b7 400 XP',
   give(o){if(P.lives<MAXL){P.lives++;o.push('+1 life')}else{gold+=150;o.push('+150g (lives full)')}meta.echoes+=100;saveMeta();o.push('+100 echoes');gainXp(400)}},
  say:{offer:'My charts end at the Tempest. Descend to the Tempest Depths and tell me what the storm is hiding.',act:'The Tempest lies beyond Ember and Glacial. Keep to the gates.',rdy:'You saw it! Oh, I must redraw everything. Here \u2014 for your trouble.',done:'The map grows. Every line, thanks to you.'}},
 {id:'pip',name:'Pip',title:'Treasure Hunter (age 9)',home:603,rng:22,spd:26,kind:'child',pal:{skin:'#eec6a0',hair:'#c2562a',c1:'#d84a4a',c2:'#a02a2a',c3:'#ffd36b',boots:'#5a3a1a'},
  q:{t:'Shiny Things',ev:'chest',n:6,d:'Smash open 6 chests.',rw:'An Epic+ accessory \u00b7 300 gold',
   give(o){gold+=300;o.push('+300g');acc(3,4,o,200)}},
  say:{offer:'I heard chests are FULL of treasure! Smash open six and I\u2019ll split the shiny stuff with you. Promise!',act:'Six chests! Look for the ones glowing in the dark!',rdy:'You really did it! Here, I saved the best shiny for you!',done:'When I grow up I\u2019m going to be just like you!'}},
 {id:'maren',name:'Elder Maren',title:'Village Elder',home:392,rng:10,spd:7,kind:'elder',gate:4,pal:{skin:'#d9b090',hair:'#f0f0f0',c1:'#4a5a8a',c2:'#2e3a64',c3:'#d9a441',boots:'#3a2a1a'},
  q:{t:'The Weight of the Crown',ev:'boss',boss:'tempest',n:1,d:'Defeat the Tempest Dragon.',rw:'The Legendary Gale Odachi \u00b7 2 talent hands \u00b7 150 echoes',
   give(o){if(window.giveGaleOdachi)window.giveGaleOdachi(o);else{gold+=500;o.push('+500g')}P.thands=(P.thands|0)+2;o.push('+2 talent hands');meta.echoes+=150;saveMeta();o.push('+150 echoes')}},
  say:{offer:'The Hollow King\u2019s shadow grows long over Ashfall. The Tempest Dragon rules the storm-wracked deep \u2014 slay it, and this village will call you its champion.',act:'The Tempest Dragon, wanderer. Prove the Depths can be answered.',rdy:'The storm is silenced! Take this \u2014 it was my father\u2019s. And heed me: the Hollow King is just a key. The Deity is unstable, and feels empty.',done:'Remember: the Hollow King is only a key. The Deity is unstable, and feels empty. Ashfall endures because of you.',lock:'Earn the village\u2019s trust first. Help four of my people, then return to me.'}}
];
const VBY={};VILS.forEach(v=>VBY[v.id]=v);
function acc(lo,hi,o,fb){const pool=ACC.filter(a=>!accOwned.includes(a.id)&&a.rar>=lo&&a.rar<=hi);if(pool.length){const a=pool[Math.random()*pool.length|0];accOwned.push(a.id);o.push(a.name)}else{gold+=fb;o.push('+'+fb+'g bonus')}}
const vq=id=>{if(!P.vq)P.vq={};return P.vq[id]||(P.vq[id]={s:0,p:0})};
const vHelped=()=>VILS.filter(v=>v.id!=='maren'&&vq(v.id).s===3).length;
const vLocked=v=>v.gate&&vHelped()<v.gate&&vq(v.id).s===0;
function vqEv(t,x){if(!P||!P.vq)return;
 for(const v of VILS){const s=P.vq[v.id];if(!s||s.s!==1)continue;const q=v.q;let add=0;
  if(q.ev===t){if(t==='layer'){if(x>s.p)s.p=Math.min(x,q.n)}else if(t==='boss'){if(!q.boss||q.boss===x)s.p=q.n}else add=1}
  else if(q.ev==='elite'&&t==='kill'&&x&&x.el)add=1;
  else if(q.ev==='kill'&&t==='kill')add=1;
  if(add)s.p=Math.min(q.n,s.p+add);
  if(s.p>=q.n){s.s=2;toast('\u2726 '+v.name+': quest complete \u2014 return to them (E)');try{sfx.level()}catch(e){}save();if(vOpen&&vCur===v)renderVil()}}}
const _qe=qEv;qEv=function(t,x){_qe.apply(this,arguments);vqEv(t,x)};
function vAccept(v){const s=vq(v.id);s.s=1;s.p=0;const q=v.q;
 if(q.ev==='layer')s.p=Math.min(q.n,P.maxLy|0);
 if(q.ev==='boss'&&(q.boss?bossDead[q.boss]:Object.keys(bossDead||{}).some(k=>bossDead[k])))s.p=q.n;
 if(s.p>=q.n)s.s=2;try{sfx.loot()}catch(e){}save()}
function vClaim(v){const s=vq(v.id);if(s.s!==2)return;const o=[];v.q.give(o);s.s=3;
 try{sfx.loot();sfx.level()}catch(e){}toast('\u2726 '+v.name+': '+o.join(' \u00b7 '));save()}

// =====================================================================
//  VILLAGE ART
// =====================================================================
const shrX=()=>VIL.cxp+SHR_DX;
const nearTalShrine=()=>!!(P&&!P.dead&&VIL&&tiles===VIL.t&&!window.TUTON&&Math.abs(P.x+6-shrX())<34&&Math.abs(P.y+22-VIL.gy)<30);

// ---- a villager sprite; g = any 2d context, X = centre, Y = feet ----
function drawPerson(g,v,X,Y,t,st){
 const r=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
 const P_=v.pal,k=v.kind,f=st.f||1,sd=v.sd||1,kid=k==='child';
 const LH=kid?5:8,TH=kid?6:9,HH=kid?8:7,TW=kid?8:10,HW=kid?8:8;
 const wk=st.walk?Math.sin(st.ph):0,br=Math.sin(t*2+sd)>0?0:1;
 const long=k==='herb'||k==='pilgrim'||k==='elder'||k==='scholar';
 r(X-7,Y-1,14,2,'rgba(0,0,0,.32)');
 // legs
 if(!long){const la=Math.max(0,wk)*2,lb=Math.max(0,-wk)*2;r(X-4,Y-LH,3,LH-la,P_.c2);r(X+1,Y-LH,3,LH-lb,P_.c2);r(X-4,Y-2-la,3,2,P_.boots);r(X+1,Y-2-lb,3,2,P_.boots)}
 else{r(X-3,Y-2,2,2,P_.boots);r(X+1,Y-2,2,2,P_.boots)}
 const ty=Y-LH-TH+br;
 // back items
 if(k==='hunter'){PL([X-6,ty,X-8-f*2,ty+14,X+6,ty+14,X+6,ty],'#26402a');r(X-f*6-1,ty-2,2,16,'#6a4a2a');r(X-f*6-3,ty-1,1,14,'#c9b98a')}
 if(k==='miner'){r(X-f*6-1,ty-4,2,18,'#6a4a2a');r(X-f*6-5,ty-5,10,2,'#9a9aa8');r(X-f*6-6,ty-4,2,2,'#9a9aa8')}
 // body
 if(long){const ln=k==='elder'?3:1;PL([X-TW/2,ty,X+TW/2,ty,X+TW/2+2+ln,Y-1,X-TW/2-2-ln,Y-1],P_.c1);PL([X+1,ty,X+TW/2,ty,X+TW/2+2+ln,Y-1,X+2,Y-1],P_.c2);r(X-TW/2-2-ln,Y-2,TW+4+2*ln,2,P_.c3)}
 else{r(X-TW/2,ty,TW,TH,P_.c1);r(X+1,ty,TW/2-1,TH,P_.c2);r(X-TW/2,ty+TH-2,TW,1,P_.c3)}
 // arms
 const sw=st.hammer!=null?st.hammer:wk*1.5;
 r(X-TW/2-2,ty+1+(st.walk?-sw:0),2,TH-2,P_.c2);r(X+TW/2,ty+1+(st.walk?sw:0),2,TH-2,P_.c1);
 r(X-TW/2-2,ty+TH-2,2,2,P_.skin);r(X+TW/2,ty+TH-2,2,2,P_.skin);
 // head
 const hy=ty-HH+(k==='elder'?1:0),hx=X-HW/2+(k==='elder'?f:0);
 r(hx,hy,HW,HH,P_.skin);r(hx+HW-2,hy+2,2,HH-2,'rgba(0,0,0,.12)');
 const blink=(t*.9+sd)%4>3.85;
 const ex=X+f*1.5;if(blink){r(ex-2,hy+HH*.5,2,1,'#2a1a10');r(ex+1,hy+HH*.5,2,1,'#2a1a10')}else{r(ex-2,hy+HH*.5-1,1,2,'#1a1018');r(ex+1,hy+HH*.5-1,1,2,'#1a1018')}
 if(k!=='child')r(ex-1,hy+HH-2,3,1,'rgba(120,50,40,.6)');
 // kind specifics
 if(k==='smith'){r(hx,hy-1,HW,2,'#8a2a2a');r(hx-1,hy+HH-3,HW+2,4,P_.hair);r(hx+1,hy+HH-1,HW-2,3,P_.hair);r(X-4,ty+1,8,TH+LH-2,'#4a2e18');r(X-3,ty-1,1,3,'#3a2414');r(X+2,ty-1,1,3,'#3a2414');
  const hm=st.hammer||0,hxp=X+f*(TW/2+2);r(hxp,ty-2-hm*2,2,8,'#6a4a2a');r(hxp-2,ty-4-hm*2,6,3,'#8a8a98')}
 if(k==='herb'){PL([hx-2,hy+HH,hx+HW/2,hy-4,hx+HW+2,hy+HH],P_.c2);PL([hx,hy+HH-1,hx+HW/2,hy-2,hx+HW,hy+HH-1],P_.c1);r(hx+1,hy+2,HW-2,HH-2,P_.skin);r(ex-2,hy+HH*.5-1,1,2,'#1a1018');r(ex+1,hy+HH*.5-1,1,2,'#1a1018');
  r(X-f*8-3,ty+3,7,5,'#8a5a2a');r(X-f*8-3,ty+2,7,1,'#6a3a1a');r(X-f*8-2,ty+0,2,3,'#e85a8a');r(X-f*8+1,ty,2,3,'#7ae0ff')}
 if(k==='miner'){r(hx-1,hy-3,HW+2,4,P_.c3);r(hx+1,hy-5,HW-2,2,P_.c3);r(X+f*3-1,hy-3,3,3,'#fff6c0');r(hx,hy+HH-3,HW,4,P_.hair);r(hx+2,hy+HH-5,3,1,'rgba(0,0,0,.25)');r(hx+1,hy+2,2,1,'rgba(0,0,0,.25)')}
 if(k==='pilgrim'){PL([hx-2,hy+HH+1,hx+HW/2,hy-4,hx+HW+2,hy+HH+1],P_.c1);PL([hx,hy+HH,hx+HW/2,hy-2,hx+HW,hy+HH],P_.c2);r(hx+1,hy+2,HW-2,HH-2,P_.skin);r(ex-2,hy+HH*.5-1,1,2,'#1a1018');r(ex+1,hy+HH*.5-1,1,2,'#1a1018');
  const sx=X+f*(TW/2+3);r(sx,ty-12,1,TH+LH+12,'#b8a070');r(sx-2,ty-14,5,2,P_.c3);if(g.globalCompositeOperation!==undefined){const p=.5+.5*Math.sin(t*3);r(sx-1,ty-17,3,3,'rgba(160,255,240,'+(.6+.4*p)+')')}}
 if(k==='hunter'){r(hx-1,hy-2,HW+2,4,'#4a3a22');r(hx+1,hy-4,HW-2,3,'#5a4a2a');r(hx+HW-1,hy-8,2,6,'#d84a4a');r(hx,hy+HH-2,HW,2,'rgba(40,30,20,.5)');r(hx,hy+2,HW,1,P_.hair)}
 if(k==='scholar'){PL([hx-3,hy+1,hx+HW/2,hy-12,hx+HW+3,hy+1],P_.c2);r(hx-4,hy,HW+8,2,P_.c1);r(hx+HW/2-1,hy-9,2,2,P_.c3);r(hx+HW-1,hy+1,2,HH+2,P_.hair);r(ex-3,hy+HH*.5-1,3,3,'rgba(200,230,255,.85)');r(ex+1,hy+HH*.5-1,3,3,'rgba(200,230,255,.85)');
  r(X+f*(TW/2+1),ty+2,2,9,'#d8c8a0');r(X+f*(TW/2+1),ty+2,2,1,P_.c3)}
 if(k==='child'){r(hx-1,hy-2,HW+2,4,P_.hair);r(hx+2,hy-4,3,3,P_.hair);r(hx,hy+HH-1,HW,2,P_.c1);r(X+f*4,ty+3,2,2,'#ffd36b')}
 if(k==='elder'){r(hx-1,hy+1,2,HH-2,P_.hair);r(hx+HW-1,hy+1,2,HH-2,P_.hair);r(hx,hy-1,HW,2,P_.hair);r(hx-1,hy+HH-3,HW+2,3,P_.hair);r(hx+1,hy+HH,HW-2,TH-1,P_.hair);r(hx+1,hy+HH+TH-3,HW-2,2,'#d8d8e0');r(ex-2,hy+HH*.5-2,2,1,P_.hair);r(ex+1,hy+HH*.5-2,2,1,P_.hair);
  const sx=X+f*(TW/2+4);r(sx,ty-14,2,TH+LH+14,'#6a4a2a');r(sx-2,ty-16,6,3,P_.c3);r(sx-1,ty-12,4,5,'rgba(255,214,120,.85)')}
}

function drawVillage(ox,oy,L){
 if(!VIL||tiles!==VIL.t||!P||window.TUTON)return;
 const w=cv.width,gy=Math.round(VIL.gy-oy),t=time,cxw=VIL.cxp;
 if(cxw-ox<-820||cxw-ox>w+820||gy<-260||gy>cv.height+160)return;
 const sx=dx=>Math.round(cxw+dx-ox);
 const glw=(x,y,r,col)=>{cx.save();cx.globalCompositeOperation='lighter';glow(x,y,r,col);cx.restore()};
 const roof=(X,top,wd,rh,c1,c2,ov)=>{for(let y=0;y<rh;y+=3){const k=y/rh,lx=Math.round(X-ov+k*(wd/2+ov)),rx=Math.round(X+wd+ov-k*(wd/2+ov)),a=(y/3|0)%2;
   FR(lx,top-y-3,rx-lx,3,a?c1:c2);FR(lx,top-y-1,rx-lx,1,'rgba(0,0,0,.24)');for(let x=lx+(a?2:0);x<rx-1;x+=4)FR(x,top-y-3,1,2,'rgba(0,0,0,.14)')}
  FR(Math.round(X-ov),top,wd+2*ov,2,'rgba(0,0,0,.45)');FR(Math.round(X+wd/2-1),top-rh-2,2,3,c2)};
 const win=(x,y,ww,hh,seed,o)=>{o=o||{};x=Math.round(x);y=Math.round(y);FR(x-1,y-1,ww+2,hh+2,o.frame||'#2a1c12');
  const fl=.82+.18*Math.sin(t*3.1+seed*7);FR(x,y,ww,hh,'rgba(255,200,100,'+fl+')');FR(x,y+(hh*.55|0),ww,Math.ceil(hh*.45),'rgba(255,150,60,'+(fl*.85)+')');
  FR(x+(ww>>1),y,1,hh,'#2a1c12');FR(x,y+(hh>>1),ww,1,'#2a1c12');
  if(o.shut){FR(x-3,y-1,3,hh+2,o.shut);FR(x+ww,y-1,3,hh+2,o.shut);FR(x-2,y+1,1,hh-2,'rgba(0,0,0,.25)');FR(x+ww+1,y+1,1,hh-2,'rgba(0,0,0,.25)')}
  if(o.box){FR(x-2,y+hh+1,ww+4,3,'#4a2e18');for(let i=0;i<ww+2;i+=2)FR(x-1+i,y+hh-1+(i%3?1:0),1,2,['#e85a8a','#f5d04a','#fff','#b05ae8'][((i>>1)+seed)%4])}
  glw(x+ww/2,y+hh/2,o.big?34:22,'rgba(255,170,70,.30)');L.push([x+ww/2,y+hh/2,54])};
 const door=(x,y,ww,hh,c)=>{x=Math.round(x);y=Math.round(y);FR(x-1,y-1,ww+2,hh+1,'#1a100a');FR(x,y,ww,hh,c);FR(x,y+(hh>>1),ww,1,'rgba(0,0,0,.25)');FR(x+1,y+1,1,hh-2,'rgba(255,255,255,.1)');FR(x+ww-3,y+(hh>>1),2,2,'#d9a441');PL([x-1,y,x+ww/2,y-3,x+ww+1,y],'#1a100a')};
 const smoke=(x,y,seed)=>{for(let i=0;i<4;i++){const ph=(t*.22+seed*.37+i*.25)%1,a=.34*(1-ph),sz=2+ph*4|0;FR(Math.round(x+Math.sin(ph*5+seed+i)*3+ph*7),Math.round(y-ph*30),sz,sz,'rgba(190,190,205,'+a+')')}};
 const lantern=(x,y,seed)=>{x=Math.round(x);y=Math.round(y);const fl=.8+.2*Math.sin(t*7+seed);FR(x,y-5,1,5,'#2a2438');FR(x-2,y,5,6,'#2a2438');FR(x-1,y+1,3,4,'rgba(255,215,130,'+fl+')');glw(x,y+3,28,'rgba(255,190,90,.34)');L.push([x,y+3,70])};
 const barrel=(x,y)=>{x=Math.round(x);FR(x,y-11,9,11,'#5a3a1e');FR(x+1,y-12,7,1,'#6a4a2a');FR(x,y-8,9,1,'#2a1a10');FR(x,y-3,9,1,'#2a1a10');FR(x+1,y-10,1,9,'rgba(255,255,255,.12)')};
 const crate=(x,y,s)=>{x=Math.round(x);FR(x,y-s,s,s,'#6a4a2a');FR(x,y-s,s,1,'#8a6a3a');FR(x,y-1,s,1,'#3a2414');FR(x,y-s,1,s,'#3a2414');FR(x+s-1,y-s,1,s,'#3a2414');FR(x+2,y-s+2,s-4,1,'#3a2414')};
 const post=(x,h,c)=>FR(Math.round(x),gy-h,2,h,c||'#3a2a1a');
 const pine=(dx,h,sh,seed)=>{const X=sx(dx);if(X<-40||X>w+40)return;const sw=Math.sin(t*.8+seed)*1;FR(X-2,gy-14,4,14,'#2e2014');
  for(let i=0;i<5;i++){const y=gy-12-i*(h/6),ww=Math.max(5,(22-i*4)*sh);PL([X-ww+sw*i*.3,y,X+sw*i*.5,y-h/4,X+ww+sw*i*.3,y],i%2?'#1c3a2c':'#244a34');PL([X+sw*i*.5,y-h/4,X+ww+sw*i*.3,y,X+3,y],'rgba(0,0,0,.2)')}};
 const oak=(dx,sc,seed)=>{const X=sx(dx);if(X<-50||X>w+50)return;const sw=Math.sin(t*.7+seed);FR(X-3,gy-22*sc,6,22*sc,'#3a2a1a');FR(X-1,gy-22*sc,2,22*sc,'#4a3822');
  for(const[cx_,cy,r_,c] of [[0,-30,14,'#2a5a38'],[-10,-24,10,'#245030'],[10,-24,10,'#245030'],[0,-40,10,'#33683f'],[-6,-34,8,'#2e603a']]){const rr=r_*sc;FR(X+cx_*sc-rr+sw,gy+cy*sc-rr*.7,rr*2,rr*1.4,c);FR(X+cx_*sc-rr*.7+sw,gy+cy*sc-rr,rr*1.4,rr*2,c)}
  FR(X-12*sc+sw,gy-44*sc,6,2,'rgba(255,255,255,.07)')};
 const fence=(d0,d1)=>{for(let d=d0;d<=d1;d+=8){const X=sx(d);if(X<-10||X>w+10)continue;FR(X,gy-13,2,13,'#4a3420');FR(X+1,gy-13,1,13,'#5a4428')}
  const a=sx(d0),b=sx(d1);FR(a,gy-10,b-a+2,2,'#5a4428');FR(a,gy-5,b-a+2,2,'#5a4428')};
 const bunting=(d0,d1,sag)=>{const a=sx(d0),b=sx(d1);if(b<-20||a>w+20)return;const n=Math.max(2,Math.round((b-a)/9));
  for(let i=0;i<=n;i++){const u=i/n,X=Math.round(a+(b-a)*u),Y=Math.round(gy-58+Math.sin(u*Math.PI)*sag);FR(X,Y,1,1,'#6a5a46');if(i%1===0&&i<n){PL([X+1,Y,X+7,Y,X+4,Y+6+Math.sin(t*2+i)*.8],['#d84a4a','#f5d04a','#4a8ad8','#6ad87a','#b05ae8'][i%5])}}};

 // ---- far-back layer: road, trees ----
 pine(-338,52,1.0,1);pine(-468,60,1.1,2);pine(-600,50,1,3);oak(-505,1.0,4);pine(332,56,1.1,5);pine(445,64,1.2,6);oak(505,1.05,7);pine(642,58,1.1,8);oak(-640,1.1,9);pine(-250,48,.9,10);pine(255,50,.9,11);
 // road
 {const a0=Math.max(-668,-cxw+ox),a1=Math.min(668,-cxw+ox+w);for(let d=Math.floor(a0/4)*4;d<a1;d+=4){if(Math.abs(d)<168)continue;const X=sx(d),q=rnd(d*.37);FR(X,gy,4,4,q>.7?'#7a6650':'#6a5844');if(q>.5)FR(X+1,gy,2,1,'#8a7660');if(q<.2)FR(X,gy+3,3,1,'#4a3c2c')}FR(sx(Math.max(-668,a0)),gy+3,sx(Math.min(668,a1))-sx(Math.max(-668,a0)),1,'rgba(0,0,0,.25)')}

 // ===== WEST =====
 {// Herbalist's cottage (Mira)
  const X=sx(-285);if(X>-120&&X<w+80){const wd=56,h=36;FR(X-1,gy-5,wd+2,5,'#4a4658');for(let i=0;i<wd;i+=6)FR(X+i,gy-5,1,5,'rgba(0,0,0,.25)');
   FR(X,gy-h,wd,h-5,'#7a6a52');FR(X,gy-h,wd,3,'#3a2616');FR(X,gy-7,wd,2,'#3a2616');FR(X,gy-h,2,h-5,'#3a2616');FR(X+wd-2,gy-h,2,h-5,'#3a2616');FR(X+wd-4,gy-h+3,4,h-10,'rgba(0,0,0,.2)');
   PL([X+2,gy-h+3,X+14,gy-7,X+12,gy-7,X+2,gy-h+7],'#3a2616');
   roof(X,gy-h,wd,24,'#8a7a3a','#6e6030',6);for(let i=0;i<8;i++)FR(X-6+i*8+((i*3)%4),gy-h+1,1,3+(i%3),'#8a7a3a');
   door(X+wd/2-5,gy-18,10,18,'#4a2e18');win(X+7,gy-26,8,9,1,{shut:'#2e5a3a',box:1});win(X+wd-15,gy-26,8,9,2,{shut:'#2e5a3a',box:1});
   smoke(X+wd-12,gy-h-18,1);
   // herb bundles + hanging sign
   for(let i=0;i<4;i++){const hx=X+4+i*3;FR(hx,gy-h+4,1,2,'#3a2616');FR(hx-1,gy-h+6,3,5,['#4a8a4a','#8ab04a','#6a9a5a','#b0a04a'][i])}
   FR(X-12,gy-34,12,1,'#3a2616');FR(X-12,gy-34,1,12,'#3a2616');FR(X-11,gy-26+Math.sin(t*1.6)*.7,10,8,'#5a3c20');FR(X-9,gy-24+Math.sin(t*1.6)*.7,6,1,'#7ae07a');FR(X-8,gy-22+Math.sin(t*1.6)*.7,4,1,'#7ae07a');
   // garden: glowing moonpetals
   for(let i=0;i<7;i++){const gx=X+wd+4+i*5,p=.5+.5*Math.sin(t*2+i*1.7);FR(gx,gy-4,1,4,'#2a5a3a');FR(gx-1,gy-7,3,3,'rgba(120,200,255,'+(.7+.3*p)+')');FR(gx,gy-8,1,1,'#fff');glw(gx,gy-6,12,'rgba(100,180,255,'+(.22*p+.1)+')')}
  }}
 {// Smithy (Brannoc)
  const X=sx(-400);if(X>-140&&X<w+80){const wd=80,h=42;FR(X,gy-h,wd,h,'#55505f');for(let y=0;y<h;y+=6)for(let x=((y/6)%2)*5;x<wd;x+=10)FR(X+x,gy-h+y,9,5,(x+y)%3?'#5f5a6b':'#4c4756');FR(X,gy-h,wd,3,'rgba(0,0,0,.3)');FR(X+wd-4,gy-h,4,h,'rgba(0,0,0,.2)');
   FR(X+6,gy-30,38,30,'#14101a');FR(X+4,gy-32,42,3,'#3a2a1a');FR(X+4,gy-32,3,32,'#3a2a1a');FR(X+43,gy-32,3,32,'#3a2a1a');
   const fl=.8+.2*Math.sin(t*9)+.1*Math.sin(t*23);FR(X+12,gy-14,18,14,'#3a2e3a');FR(X+14,gy-12,14,10,'#1a0e0a');FR(X+15,gy-10,12,8,'rgba(255,120,30,'+fl+')');FR(X+17,gy-9,8,6,'rgba(255,200,80,'+fl+')');
   glw(X+21,gy-8,56,'rgba(255,120,40,'+(.35*fl)+')');glw(X+21,gy-12,90,'rgba(255,100,30,.16)');L.push([X+21,gy-10,130]);
   // anvil
   FR(X+34,gy-9,10,3,'#3a3a46');FR(X+35,gy-12,8,3,'#5a5a68');FR(X+43,gy-12,3,2,'#5a5a68');FR(X+37,gy-6,4,6,'#2e2e38');
   // spark
   for(let i=0;i<5;i++){const ph=(t*1.3+i*.2)%1;FR(X+38+Math.sin(i*5+t)*6,gy-13-ph*20,1,1,'rgba(255,'+(180-ph*120|0)+',60,'+(1-ph)+')')}
   roof(X-2,gy-h,wd+4,18,'#3a3a4e','#2e2e40',4);FR(X+wd-22,gy-h-28,10,30,'#46404c');FR(X+wd-22,gy-h-28,10,3,'#2e2a34');smoke(X+wd-17,gy-h-28,2);
   for(let i=0;i<3;i++){const ph=(t*.9+i*.33)%1;FR(X+wd-17+Math.sin(i+t*3)*2,gy-h-30-ph*14,1,1,'rgba(255,170,60,'+(1-ph)+')')}
   // rack + tools + barrel
   FR(X+52,gy-26,24,2,'#3a2a1a');for(let i=0;i<4;i++){FR(X+55+i*5,gy-25,2,14,'#9a9aa8');FR(X+54+i*5,gy-13,4,2,'#5a3a1a')}
   FR(X+52,gy-8,2,8,'#3a2a1a');FR(X+74,gy-8,2,8,'#3a2a1a');barrel(X+61,gy);FR(X+62,gy-12,7,1,'rgba(90,160,255,.6)');
   FR(X+wd-2,gy-36,2,2,'#111');FR(X+8,gy-h+5,26,7,'#5a3c20');FR(X+8,gy-h+5,26,1,'#7a5430');FR(X+11,gy-h+7,2,3,'#c8c8d4');FR(X+14,gy-h+7,8,1,'#c8c8d4');FR(X+16,gy-h+8,2,3,'#c8c8d4');lantern(X+4,gy-h+14,3)}}
 {// Miner's hut (Tolliver) + cart
  const X=sx(-540);if(X>-140&&X<w+100){const wd=54,h=30;FR(X,gy-h,wd,h,'#5a4630');for(let y=0;y<h;y+=5)FR(X,gy-h+y,wd,1,'rgba(0,0,0,.28)');for(let x=4;x<wd;x+=9)FR(X+x,gy-h,1,h,'rgba(0,0,0,.16)');FR(X+wd-4,gy-h,4,h,'rgba(0,0,0,.22)');
   PL([X-5,gy-h,X+wd+5,gy-h-14,X+wd+5,gy-h+2,X-5,gy-h+2],'#46404a');for(let i=0;i<wd+10;i+=5)FR(X-5+i,gy-h-((i/(wd+10))*14|0),1,3,'rgba(0,0,0,.25)');FR(X-5,gy-h+1,wd+10,2,'rgba(0,0,0,.4)');
   door(X+10,gy-19,10,19,'#3a2616');win(X+30,gy-22,10,9,3,{shut:'#4a3a28'});
   // crossed picks
   FR(X+12,gy-28,10,1,'#8a8a98');FR(X+14,gy-30,1,6,'#6a4a2a');FR(X+19,gy-30,1,6,'#6a4a2a');
   lantern(X+wd-2,gy-30,4);crate(X+wd+2,gy,10);crate(X+wd+12,gy,8);
   // ore pile + cart + rail
   FR(X-24,gy-2,22,2,'#2a2a34');for(let i=0;i<5;i++)FR(X-22+i*5,gy-3,2,3,'#4a3a2a');
   const cxp=X-30;FR(cxp,gy-11,18,8,'#5a5a68');FR(cxp,gy-11,18,2,'#7a7a88');FR(cxp+1,gy-9,16,1,'#3a3a46');FR(cxp+3,gy-4,4,4,'#222');FR(cxp+11,gy-4,4,4,'#222');
   for(let i=0;i<5;i++){const p=.5+.5*Math.sin(t*3+i*1.9);FR(cxp+2+i*3,gy-14-(i%2),3,4,'rgb('+(90+p*60|0)+','+(200+p*50|0)+',255)');glw(cxp+3+i*3,gy-12,12,'rgba(90,220,255,'+(.15+.2*p)+')')}}}
 {// Chapel (Veyra)
  const X=sx(-625);if(X>-120&&X<w+80){const wd=48,h=40;FR(X,gy-h,wd,h,'#7a788a');for(let y=0;y<h;y+=6)for(let x=((y/6)%2)*4;x<wd;x+=8)FR(X+x,gy-h+y,7,5,(x+y)%3?'#868498':'#6e6c7e');FR(X+wd-4,gy-h,4,h,'rgba(0,0,0,.2)');
   roof(X,gy-h,wd,16,'#4a5a8a','#3a4a78',4);
   // steeple
   const tx=X+wd-20;FR(tx,gy-h-34,16,36,'#7a788a');FR(tx+12,gy-h-34,4,36,'rgba(0,0,0,.2)');PL([tx-3,gy-h-34,tx+8,gy-h-62,tx+19,gy-h-34],'#4a5a8a');PL([tx+8,gy-h-62,tx+19,gy-h-34,tx+9,gy-h-34],'rgba(0,0,0,.25)');FR(tx+7,gy-h-68,2,8,'#d9a441');FR(tx+4,gy-h-65,8,2,'#d9a441');
   FR(tx+4,gy-h-26,8,10,'#14101a');FR(tx+6,gy-h-22+Math.sin(t*2)*1.5,4,5,'#d9a441');
   const g1=.7+.3*Math.sin(t*1.7);FR(X+6,gy-34,12,12,'#2a2438');FR(X+7,gy-33,10,10,'rgba(120,230,220,'+g1+')');FR(X+11,gy-33,2,10,'#2a2438');FR(X+7,gy-28,10,2,'#2a2438');glw(X+12,gy-28,30,'rgba(100,220,220,'+(.28*g1)+')');L.push([X+12,gy-28,60]);
   door(X+13,gy-18,12,18,'#3a2c4a');FR(X+10,gy-3,18,3,'#6a6880');FR(X+8,gy-1,22,1,'#5a5870');
   // candles
   for(let i=0;i<3;i++){const fl=.7+.3*Math.sin(t*8+i);FR(X-8+i*3,gy-6,2,6,'#e8e0c8');FR(X-8+i*3,gy-8,2,2,'rgba(255,200,90,'+fl+')');glw(X-7+i*3,gy-8,10,'rgba(255,190,80,.3)')}}}

 // ===== EAST =====
 {// Elder's hall (Maren)
  const X=sx(285);if(X>-130&&X<w+90){const wd=86,h=46;FR(X-1,gy-9,wd+2,9,'#55505f');for(let x=0;x<wd;x+=7)FR(X+x,gy-9,1,9,'rgba(0,0,0,.22)');
   FR(X,gy-h,wd,h-9,'#8a7456');FR(X,gy-h,wd,3,'#3a2616');FR(X,gy-9,wd,2,'#3a2616');for(let x=0;x<=wd-2;x+=14)FR(X+x,gy-h,2,h-9,'#3a2616');FR(X+wd-5,gy-h+3,5,h-12,'rgba(0,0,0,.2)');
   roof(X,gy-h,wd,26,'#6a2a30','#561e26',8);
   for(const gx of[X-8,X+wd+6]){PL([gx,gy-h+2,gx+2,gy-h-6,gx+4,gy-h+2],'#d9a441')}
   FR(X+12,gy-h-24,9,22,'#46404c');FR(X+wd-22,gy-h-24,9,22,'#46404c');smoke(X+16,gy-h-24,3);smoke(X+wd-18,gy-h-24,4);
   door(X+wd/2-9,gy-26,18,26,'#3a2412');FR(X+wd/2-9,gy-20,18,1,'#6a6a78');FR(X+wd/2-9,gy-12,18,1,'#6a6a78');FR(X+wd/2,gy-26,1,26,'#1a100a');
   win(X+10,gy-32,9,10,5,{shut:'#6a2a30',big:1});win(X+wd-19,gy-32,9,10,6,{shut:'#6a2a30',big:1});
   for(const bx of[X+28,X+wd-32]){const sw=Math.sin(t*1.3+bx)*1;PL([bx-5,gy-44,bx+5,gy-44,bx+4+sw,gy-20,bx+sw,gy-14,bx-4+sw,gy-20],'#9a1a2a');FR(bx-5,gy-45,10,2,'#d9a441');FR(bx-1,gy-36,2,6,'#d9a441');FR(bx-3,gy-33,6,2,'#d9a441')}
   for(const bx of[X+wd/2-18,X+wd/2+16]){FR(bx,gy-11,2,11,'#3a2a1a');FR(bx-2,gy-14,6,3,'#5a5a68');const fl=.7+.3*Math.sin(t*11+bx);PL([bx-1,gy-14,bx+1,gy-22-fl*3,bx+3,gy-14],'rgba(255,150,40,'+fl+')');glw(bx+1,gy-18,30,'rgba(255,140,40,.3)');L.push([bx+1,gy-18,80])}}}
 {// Library tower (Lysa)
  const X=sx(430);if(X>-100&&X<w+100){const wd=48,h=64;FR(X+6,gy-h,36,h,'#6e6c80');for(let y=0;y<h;y+=6)for(let x=((y/6)%2)*4;x<36;x+=8)FR(X+6+x,gy-h+y,7,5,(x+y)%3?'#7a788c':'#626076');FR(X+38,gy-h,4,h,'rgba(0,0,0,.2)');FR(X,gy-24,wd,24,'#6e6c80');for(let y=0;y<24;y+=6)for(let x=((y/6)%2)*4;x<wd;x+=8)FR(X+x,gy-24+y,7,5,(x+y)%3?'#7a788c':'#626076');
   roof(X-2,gy-24,wd+4,10,'#3a4a7a','#2e3c66',3);PL([X+2,gy-h,X+24,gy-h-38,X+46,gy-h],'#3a4a7a');PL([X+24,gy-h-38,X+46,gy-h,X+26,gy-h],'rgba(0,0,0,.28)');FR(X+23,gy-h-46,2,10,'#d9a441');const sp=.6+.4*Math.sin(t*3);FR(X+21,gy-h-48,6,2,'rgba(255,230,140,'+sp+')');glw(X+24,gy-h-46,22,'rgba(255,220,120,'+(.3*sp)+')');
   for(let i=0;i<3;i++)win(X+20,gy-h+8+i*17,7,9,7+i,{frame:'#2a2a3a',big:1});
   FR(X+2,gy-h+2,12,2,'#5a5a6a');FR(X+6,gy-h-6,2,6,'#c9b98a');FR(X+4,gy-h-9,8,3,'#8a7a5a');FR(X+11,gy-h-12,6,2,'#c9b98a');
   door(X+18,gy-17,12,17,'#4a3020');FR(X-12,gy-8,10,8,'#6a2a2a');FR(X-12,gy-8,10,1,'#9a4a4a');FR(X-10,gy-14,8,6,'#2a4a6a');FR(X-10,gy-14,8,1,'#4a7a9a');FR(X-9,gy-19,6,5,'#5a3a6a');
   FR(X+wd-2,gy-30,2,16,'#3a2a1a');FR(X+wd-9,gy-32,12,2,'#3a2a1a');FR(X+wd-8,gy-30+Math.sin(t*1.5)*.6,9,8,'#5a3c20');FR(X+wd-6,gy-28+Math.sin(t*1.5)*.6,5,4,'#e8dcb8')}}
 {// Hunter's lodge (Dorn) + campfire
  const X=sx(520);if(X>-120&&X<w+100){const wd=62,h=34;FR(X,gy-h,wd,h,'#6a4a2a');for(let y=0;y<h;y+=5){FR(X,gy-h+y,wd,4,y%10?'#74522e':'#664626');FR(X,gy-h+y+4,wd,1,'rgba(0,0,0,.35)');FR(X-2,gy-h+y,3,4,'#8a6a3a');FR(X+wd-1,gy-h+y,3,4,'#8a6a3a')}FR(X+wd-4,gy-h,4,h,'rgba(0,0,0,.2)');
   roof(X,gy-h,wd,20,'#3a5a3a','#2e4a30',6);for(let i=0;i<10;i++)FR(X-6+i*7,gy-h-4+(i*5%6),3,2,'#4a7a3a');
   door(X+wd/2-6,gy-20,12,20,'#3a2616');PL([X+wd/2-10,gy-24,X+wd/2-5,gy-30,X+wd/2-5,gy-26],'#d8d0b8');PL([X+wd/2+10,gy-24,X+wd/2+5,gy-30,X+wd/2+5,gy-26],'#d8d0b8');FR(X+wd/2-5,gy-26,10,3,'#8a7a5a');
   win(X+6,gy-24,8,9,9,{shut:'#3a5a3a'});FR(X+wd-20,gy-28,16,20,'#a88a62');FR(X+wd-20,gy-28,16,1,'#6a4a2a');FR(X+wd-20,gy-9,16,1,'#6a4a2a');FR(X+wd-12,gy-24,3,12,'rgba(0,0,0,.15)');
   const fx=X-20,fl=.75+.25*Math.sin(t*10)+.1*Math.sin(t*17);for(let i=0;i<6;i++)FR(fx-6+i*2,gy-3-(i%2),2,3,'#4a4a56');FR(fx-5,gy-5,10,2,'#3a2414');PL([fx-4,gy-4,fx,gy-16-fl*4,fx+4,gy-4],'rgba(255,120,30,'+fl+')');PL([fx-2,gy-4,fx,gy-11-fl*2,fx+2,gy-4],'rgba(255,220,100,'+fl+')');glw(fx,gy-8,48,'rgba(255,130,40,'+(.3*fl)+')');L.push([fx,gy-8,110]);
   for(let i=0;i<3;i++){const ph=(t*.8+i*.33)%1;FR(fx+Math.sin(i*4+t*2)*5,gy-18-ph*22,1,1,'rgba(255,190,80,'+(1-ph)+')')}FR(fx-12,gy-14,1,14,'#3a2a1a');FR(fx+12,gy-14,1,14,'#3a2a1a');FR(fx-12,gy-14,25,1,'#3a2a1a');FR(fx-2,gy-13,4,5,'#8a8a98');lantern(X+wd+2,gy-24,5)}}
 {// Pip's corner: hay, crates, toy sword
  const X=sx(575);if(X>-80&&X<w+120){for(let i=0;i<2;i++){FR(X+i*16,gy-10,14,10,'#c8a84a');FR(X+i*16,gy-10,14,2,'#e0c060');for(let j=0;j<4;j++)FR(X+i*16+2+j*3,gy-8+(j%2),1,7,'rgba(120,90,20,.4)')}crate(X+34,gy,10);crate(X+46,gy,8);FR(X+38,gy-24,1,12,'#9a9aa8');FR(X+36,gy-13,5,1,'#6a4a2a');
   FR(X+54,gy-3,6,3,'#fff');FR(X+55,gy-6,4,3,'#fff');FR(X+58,gy-6,1,1,'#d84a4a');FR(X+59,gy-5,2,1,'#f5a030')}}

 // ===== wells, fountain, lamps, bunting, props =====
 {const X=sx(190);if(X>-60&&X<w+60){FR(X-16,gy-6,32,6,'#7a788a');FR(X-16,gy-6,32,1,'#9a98aa');FR(X-12,gy-10,24,4,'#6a687a');FR(X-9,gy-10,18,2,'rgba(100,200,255,.85)');FR(X-2,gy-24,4,16,'#8a889a');FR(X-6,gy-26,12,3,'#9a98aa');
   for(let i=0;i<8;i++){const ph=(t*1.2+i*.125)%1,a=(i-3.5)*2.2;FR(X+a*ph*1.6,gy-26+ph*ph*18-ph*8,1,2,'rgba(160,230,255,'+(1-ph*.6)+')')}glw(X,gy-14,34,'rgba(90,200,255,.22)')}}
 for(const d of[-176,-322,-492,-594,266,372,482,590]){const X=sx(d);if(X<-30||X>w+30)continue;FR(X-1,gy-36,2,36,'#3a3550');FR(X-5,gy-3,10,3,'#2e2a3c');FR(X-3,gy-36,6,2,'#4e4868');lantern(X,gy-36,d)}
 bunting(-176,-322,5);bunting(266,372,5);bunting(372,482,6);bunting(-322,-492,6);bunting(482,590,5);
 // gate arches
 for(const sgn of[-1,1]){const A=sx(sgn*640),B=sx(sgn*668);if(Math.max(A,B)<-20||Math.min(A,B)>w+20)continue;
  for(const px of[A,B]){FR(px-4,gy-58,8,58,'#6e6c80');FR(px-4,gy-58,2,58,'rgba(255,255,255,.1)');FR(px+2,gy-58,2,58,'rgba(0,0,0,.25)');FR(px-6,gy-60,12,4,'#8a889a');FR(px-5,gy-4,10,4,'#5a586a')}
  const lo=Math.min(A,B)-4,wd=Math.abs(A-B)+8;FR(lo,gy-64,wd,5,'#5a3c20');FR(lo,gy-64,wd,1,'#7a5430');FR(lo,gy-60,wd,1,'#2a1a10');
  const sw=Math.sin(t*1.4+sgn)*.8;FR(Math.min(A,B),gy-58,1,6,'#3a2a1a');FR(Math.max(A,B),gy-58,1,6,'#3a2a1a');FR(Math.min(A,B)+1,gy-52+sw,wd-10,10,'#5a3c20');FR(Math.min(A,B)+1,gy-52+sw,wd-10,1,'#7a5430');
  cx.save();cx.textAlign='center';cx.font='bold 6px Georgia';cx.fillStyle='#f0e2c4';cx.fillText('ASHFALL',(A+B)/2,gy-44+sw);cx.restore();
  lantern(Math.min(A,B)-2,gy-56,sgn*9);lantern(Math.max(A,B)+2,gy-56,sgn*7)}
 // barrels / crates scattered
 for(const[d,k] of[[-250,0],[-455,1],[320,0],[400,1],[-505,0],[560,0]]){const X=sx(d);if(X<-20||X>w+20)continue;if(k)crate(X,gy,9);else{barrel(X,gy);barrel(X+10,gy)}}
 // ---- villagers ----
 const dt=Math.min(.1,Math.max(0,t-(drawVillage.lt==null?t:drawVillage.lt)));drawVillage.lt=t;
 const pdx=P.x+6-cxw;
 for(const v of VILS){
  if(v.x==null){v.x=v.home;v.tgt=v.home;v.wait=1+rnd(v.home)*3;v.f=1;v.ph=0;v.sd=rnd(v.home*.7)*9;v.walk=0}
  const near=Math.abs(pdx-v.x)<64&&Math.abs(P.y+22-VIL.gy)<36;
  if(near){v.f=pdx<v.x?-1:1;v.walk=0}
  else if(v.wait>0){v.wait-=dt;v.walk=0}
  else if(v.rng>0){const dd=v.tgt-v.x;if(Math.abs(dd)<1.5){v.wait=2+rnd(t+v.home)*4;v.tgt=v.home+(rnd(t*3+v.home)*2-1)*v.rng;v.walk=0}else{v.f=dd>0?1:-1;v.x+=v.f*v.spd*dt;v.walk=1;v.ph+=dt*9}}
  const X=sx(v.x),Y=gy,st={f:v.f,walk:v.walk,ph:v.ph};
  if(X<-40||X>w+40)continue;
  if(v.kind==='smith')st.hammer=Math.max(0,Math.sin(t*3.4))*3;
  if(v.kind==='child'&&v.walk)st.ph+=0;
  const hop=v.kind==='child'&&v.walk?-Math.abs(Math.sin(v.ph))*2:0;
  drawPerson(cx,v,X,Y+hop,t,st);
  if(v.kind==='miner')glw(X+v.f*3,Y-25,18,'rgba(255,240,170,.35)');
  if(v.kind==='pilgrim')glw(X+v.f*8,Y-26,16,'rgba(150,255,240,.25)');
  if(v.kind==='elder')glw(X+v.f*8,Y-30,18,'rgba(255,210,120,.3)');
  if(v.kind==='smith'&&st.hammer>2.8)for(let i=0;i<4;i++)FR(X+v.f*12+i*v.f*2,Y-11-i,1,1,'#ffd070');
  // quest marker
  const s=vq(v.id),lk=vLocked(v),bob=Math.sin(t*3+v.sd)*2;let mk=null,mc;
  if(s.s===0&&!lk){mk='!';mc='#ffd36b'}else if(s.s===0&&lk){mk='\u2026';mc='#7a7a8a'}else if(s.s===1){mk='\u2026';mc='#8ac8ff'}else if(s.s===2){mk='?';mc='#8fe58f'}
  const top=Y-(v.kind==='scholar'?40:v.kind==='child'?26:v.kind==='pilgrim'||v.kind==='elder'?36:32);
  if(mk){cx.save();cx.textAlign='center';cx.shadowColor=mc;cx.shadowBlur=8;cx.fillStyle=mc;cx.font='bold 14px Georgia';cx.fillText(mk,X,top+bob);cx.restore()}
  if(near&&!vOpen&&!talOpen){cx.save();cx.textAlign='center';cx.font='bold 8px Georgia';cx.shadowColor='#000';cx.shadowBlur=3;cx.fillStyle='#f0e2c4';cx.fillText(v.name,X,top-12);cx.font='7px Georgia';cx.fillStyle='#a8957a';cx.fillText(v.title,X,top-5);cx.fillStyle='#ffd36b';cx.font='bold 8px Georgia';cx.fillText('[E] Talk',X,top+7);cx.restore()}}
 // ---- Talent Shrine ----
 {const X=Math.round(shrX()-ox);
  if(X>-90&&X<w+90){const near=nearTalShrine(),pend=P.thands|0,pu=.5+.5*Math.sin(t*2.4),c=pend>0?'110,240,225':'120,130,150',fy=Math.sin(t*2)*2.5;
   FR(X-18,gy-3,36,3,'#2e2640');FR(X-14,gy-6,28,3,'#40365a');FR(X-10,gy-9,20,3,'#544a74');
   FR(X-4,gy-26,8,17,'#6a5e86');FR(X-1,gy-25,2,15,'rgba('+c+',.6)');FR(X-9,gy-29,18,3,'#8a7ea6');FR(X-6,gy-32,12,3,'#6a5e86');
   glw(X,gy-46+fy,34+pu*10,'rgba('+c+','+(pend>0?.34+.2*pu:.12)+')');
   const cw=Math.max(1.5,10*Math.abs(Math.cos(t*1.3)));
   FR(X-cw,gy-56+fy,cw*2,16,'rgb('+c+')');FR(X-cw+1,gy-55+fy,Math.max(0,cw*2-2),14,'rgba(10,20,30,.55)');FR(X-1,gy-52+fy,2,8,'rgba(255,255,255,.8)');FR(X-4,gy-49+fy,8,2,'rgba(255,255,255,.8)');
   if(pend>0)for(let i=0;i<5;i++){const lf=(t*.45+i*.2)%1;FR(X+Math.sin(i*4+t)*11,gy-12-lf*44,1.6,1.6,'rgba('+c+','+(1-lf)+')')}
   L.push([X,gy-46,pend>0?110:70]);
   cx.save();cx.textAlign='center';cx.font='bold 8px Georgia';cx.shadowColor='rgb('+c+')';cx.shadowBlur=5;cx.fillStyle='rgba(255,255,255,.85)';cx.fillText('\u2726 TALENT SHRINE \u2726',X,gy-70);
   if(near){cx.fillStyle='#ffd36b';cx.shadowBlur=0;cx.fillText(pend>0?'[E] Talents ('+pend+' hand'+(pend>1?'s':'')+')':'[E] No hands waiting',X,gy-61)}
   cx.restore()}}
 // ---- foreground: flowers, tufts, fireflies ----
 {const a0=Math.max(-670,-cxw+ox),a1=Math.min(670,-cxw+ox+w);for(let d=Math.floor(a0/7)*7;d<a1;d+=7){const q=rnd(d*.91),X=sx(d);if(q<.42||Math.abs(d)<168)continue;const sw=Math.sin(t*1.8+d*.3)*1;
   FR(X+sw*.5,gy-3,1,3,'#3a7a44');FR(X+2+sw,gy-5,1,5,'#46904e');FR(X+4,gy-2,1,2,'#2e6a3a');
   if(q>.86){const fc=['#e85a8a','#f5d04a','#fff','#8ac8ff','#b05ae8'][(rnd(d)*5)|0];FR(X+2+sw,gy-7,2,2,fc);FR(X+3+sw,gy-8,1,1,'#fff')}}}
 for(let i=0;i<26;i++){const px=sx(-660+((i*113)%1320)+Math.sin(t*.4+i)*16),py=gy-14-((i*37)%56)+Math.cos(t*.6+i*2)*9;if(px<-6||px>w+6)continue;const a=.4+.6*Math.max(0,Math.sin(t*2.1+i*1.3));FR(px,py,2,2,'rgba(210,255,140,'+a+')');glw(px+1,py+1,9,'rgba(190,255,120,'+(.22*a)+')')}
}
const _dsp=drawSpawn;drawSpawn=function(ox,oy,L){_dsp.apply(this,arguments);try{drawVillage(ox,oy,L)}catch(e){if(!window.__verr){window.__verr=1;console.error('village draw',e)}}};
const nearVillager=()=>{if(!P||P.dead||!VIL||tiles!==VIL.t||window.TUTON)return null;const pdx=P.x+6-VIL.cxp;if(Math.abs(P.y+22-VIL.gy)>36)return null;let b=null,bd=34;for(const v of VILS){if(v.x==null)continue;const d=Math.abs(pdx-v.x);if(d<bd){bd=d;b=v}}return b};

// =====================================================================
//  PLAYER STATE + PERSISTENCE
// =====================================================================
const _np=newPlayer;newPlayer=function(){const p=_np.apply(this,arguments);p.tal=[];p.thands=0;p.tgr=0;p.tskip=0;p.thand=null;p.tpk=0;p.vq={};return p};
const _sv=save;save=function(){_sv.apply(this,arguments);try{if(P&&P.tal)localStorage.setItem(KEY(),JSON.stringify({t:P.tal,n:P.thands|0,g:P.tgr|0,s:P.tskip|0,h:P.thand,k:P.tpk|0,q:P.vq}))}catch(e){}};
const _ld=load;load=function(){const ok=_ld.apply(this,arguments);
 if(ok&&P){let d=null;try{d=JSON.parse(localStorage.getItem(KEY())||'null')}catch(e){}
  const lv3=Math.floor(P.lvl/3);P.tal=[];P.thands=0;P.tgr=0;P.tskip=0;P.thand=null;P.tpk=0;P.vq={};
  if(d){P.tal=(d.t||[]).filter(id=>byId[id]);P.thands=d.n|0;P.tskip=d.s|0;P.thand=Array.isArray(d.h)?d.h.filter(id=>byId[id]):null;P.tpk=d.k|0;P.vq=d.q&&typeof d.q==='object'?d.q:{};
   if(d.g==null){P.tgr=lv3;P.thands+=Math.max(0,lv3-P.tal.length-P.thands-P.tskip)}else P.tgr=d.g|0}
  else{P.tgr=lv3;P.thands=lv3}  // old save: hands you would already have earned
  recalc();P.hp=maxHp();P.stam=maxStam()}
 return ok};

// =====================================================================
//  TALENT EFFECTS
// =====================================================================
const _rc=recalc;recalc=function(){_rc();if(typeof P==='undefined'||!P||!P.tal)return;
 if(tHas('exo'))S.post+=30;
 if(tHas('thick'))S.hp+=20;
 if(tHas('feet'))S.spd+=12;
 if(tHas('wind'))S.regen=(S.regen||0)+.15;
 if(tHas('eye'))S.parry=(S.parry||0)+.04;
 if(tHas('sharp'))S.dmg+=.06;
 if(tHas('vet'))S.dmg+=.08;
 if(tHas('bulldoze'))S.pdmg+=.2;
 if(tHas('steady'))S.dodge=1-(1-S.dodge)*.6;
 if(tHas('reinf'))S.def=1-(1-(S.def||0))*.8;
 if(tHas('vet'))S.def=1-(1-(S.def||0))*.92};

const _dm=window.dmgMult;window.dmgMult=function(){let m=_dm?_dm():1;if(!P||!P.tal||!P.tal.length)return m;
 const r=clamp(P.hp/Math.max(1,maxHp()),0,1);
 if(tHas('emerg')&&r<.5)m*=1.2;
 if(tHas('flash')&&r>.95)m*=1.25;
 if(tHas('berserk'))m*=1+(1-r);
 if(tHas('slip')&&P.tSlip>0)m*=1.15;
 if(tHas('bulldoze')&&TT&&(TT.st==='broken'||TT.st==='stagger'))m*=1.5;
 return m};
const _he=hitEnemy;hitEnemy=function(e){const pv=TT,was=!!(e&&!e.dead&&!e.boss);TT=e;let r;try{r=_he.apply(this,arguments)}finally{TT=pv}
 if(was&&e.dead&&P&&tHas('thirst')){const h=Math.round(maxHp()*.05);P.hp=Math.min(maxHp(),P.hp+h);float(P.x,P.y-14,'+'+h,'#7f7')}return r};
const _hb=hitBoss;hitBoss=function(B){const pv=TT;TT=B;try{return _hb.apply(this,arguments)}finally{TT=pv}};

const _td=tryDodge;tryDodge=function(){const was=P?P.dodge:0;const r=_td.apply(this,arguments);if(P&&was<=0&&P.dodge>0){P.vdc=0;if(P.tal)onDodge()}return r};
function onDodge(){
 if(tHas('slip'))P.tSlip=3;
 if(tHas('ghost')&&(P.gCd||0)<=0){P.gCd=15;P.gT=3;P.inv=Math.max(P.inv,3);float(P.x,P.y-18,'GHOST','#bdf');burst(P.x+6,P.y+11,14,'#bdf')}
 if(tHas('runner')&&(P.rCd||0)<=0){P.rCd=10;P.rT=5;float(P.x,P.y-18,'REGEN','#9f9')}}
const modal=on=>{paused=!!on;sheetOpen=!!on};  // sheetOpen also hides the game's PAUSED overlay
let hnToast=0;
const _up=updPlayer;updPlayer=function(dt){_up.apply(this,arguments);if(!P||!P.tal)return;
 // hands are granted by LEVEL COUNT, so any source of levels (kills, quests, tutorial reward...) counts
 const owed=Math.floor(P.lvl/3)-(P.tgr|0);if(owed>0){P.tgr=Math.floor(P.lvl/3);P.thands=(P.thands|0)+owed;save();hnToast=1.2}
 if(hnToast>0){hnToast-=dt;if(hnToast<=0)toast('\u2726 A talent hand awaits at the Talent Shrine (spawn village)')}
 for(const k of['gCd','rCd','rmCd','rmWard','tSlip'])if(P[k]>0)P[k]=Math.max(0,P[k]-dt);
 if(P.rT>0){P.rT-=dt;if(!P.dead)P.hp=Math.min(maxHp(),P.hp+10*dt)}
 if(P.gT>0){P.gT-=dt;P.inv=Math.max(P.inv,.02);for(const e of enemies)if(!e.boss&&!e.dead&&e.st==='chase'){e.st='idle';e.vx=0}}};
const _hd=heroDraw;heroDraw=function(){if(P&&P.gT>0){cx.save();cx.globalAlpha=.2;try{return _hd.apply(this,arguments)}finally{cx.restore()}}return _hd.apply(this,arguments)};

const _hp=hurtPlayer;hurtPlayer=function(dmg,pd,from,br){
 if(P&&P.inv>0&&P.dodge>0&&!P.vdc){P.vdc=1;vqEv('dodge')}   // villager quest: a dodge that evaded an attack
 if(!P||!P.tal||!P.tal.length)return _hp.apply(this,arguments);
 if(P.inv>0){
  if(P.dodge>0&&tHas('risky')&&(P.rmCd||0)<=0){P.rmCd=5;P.rmWard=3;float(P.x,P.y-16,'READ THE MOVE','#fd8')}
  return _hp.apply(this,arguments)}
 if(P.rmWard>0&&!(P.blocking&&P.guardBroken<=0)){P.rmWard=0;float(P.x,P.y-8,'evaded','#fd8');burst(P.x+6,P.y+10,8,'#fd8');return 'dodge'}
 const s0=P.stam,r=_hp.apply(this,arguments);
 if(r==='block'&&tHas('guard')&&P.guardBroken<=0)P.stam=Math.min(s0,P.stam+(s0-P.stam)*.25);
 return r};

// Charismatic Cast: patch.js keeps its spell list private but exposes it as window.SPD_, so wrap each debuff spell's fn in place
if(window.SPD_)for(const sp of window.SPD_)if(sp.t==='debuff'){const f=sp.fn;sp.fn=function(){
 if(!tHas('charm'))return f.apply(this,arguments);
 const snap=new Map();for(const e of enemies)snap.set(e,{weak:e.weak||0,frail:e.frail||0,slow:e.slow||0,post:e.post||0,st:e.st,t:e.t});
 const r=f.apply(this,arguments);
 for(const e of enemies){const o=snap.get(e);if(!o)continue;
  for(const k of['weak','frail','slow'])if((e[k]||0)>o[k])e[k]=o[k]+(e[k]-o[k])*1.1;
  if(e.post>o.post)e.post=o.post+(e.post-o.post)*1.1;
  if(!e.boss&&e.st==='stagger'&&o.st!=='stagger')e.t*=1.1}
 return r}}

const _gx=gainXp;gainXp=function(n){if(P&&tHas('study'))n=n*1.1;return _gx.call(this,n)};
const _dl=dropLoot;dropLoot=function(e){const g0=gold,r=_dl.apply(this,arguments);if(tHas('scav')&&gold>g0)gold+=Math.round((gold-g0)*.15);return r};

// =====================================================================
//  UI: talent cards + villager dialogue
// =====================================================================
const css=document.createElement('style');css.textContent=`
#talP,#vilP{z-index:30}
#talP{max-width:900px}
#talP .cards{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin:14px 0 8px}
.tcard{width:230px;padding:22px 14px 14px;background:linear-gradient(#2a2036,#17111f);border:2px solid var(--edge);cursor:pointer;text-align:center;position:relative;transition:transform .12s,box-shadow .12s,border-color .12s}
.tcard:hover{border-color:var(--gold);box-shadow:0 0 18px #ff9a3a66;transform:translateY(-4px)}
.tcard.maj{border-color:#b8742e;background:linear-gradient(#3a2418,#1a1018)}
.tcard .tk{position:absolute;top:6px;left:10px;font-size:11px;color:#8a7c68}
.tcard .tt{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#9fe}
.tcard.maj .tt{color:#ffb05a}
.tcard .tn{font-size:19px;color:var(--gold);letter-spacing:2px;margin:8px 0 4px;text-shadow:0 0 10px #ff7a1a88}
.tcard .td{font-size:13px;line-height:1.5;color:#d8ccb4;margin:10px 0}
.tcard .tr{font-size:11px;color:#9a8c78;font-style:italic}
#talP .tsk{color:#c8b48c;font-size:12px;margin-top:4px;line-height:1.5}
#talP .none{margin:18px auto;max-width:460px;padding:16px;border:1px dashed #5a4a3a;color:#c8b48c;font-style:italic;line-height:1.6}
#vilP{width:min(560px,94vw);text-align:left}
#vilP .vp-top{display:flex;gap:18px;align-items:center}
#vilP canvas{width:84px;height:108px;image-rendering:pixelated;background:radial-gradient(#3a2a4a,#120d1a);border:2px solid var(--edge);box-shadow:inset 0 0 14px #000;flex:none}
#vilP h1{font-size:26px;letter-spacing:4px;margin:0}
#vilP h2{margin:2px 0 0;font-size:12px}
#vilP .say{font-style:italic;font-size:15px;line-height:1.6;color:#e8dcc8;margin:14px 2px;padding-left:12px;border-left:3px solid var(--edge)}
#vilP .qbox{background:#ffffff08;border-left:3px solid var(--gold);padding:10px 12px;margin:10px 0}
#vilP .qbox b{color:var(--gold);letter-spacing:2px}
#vilP .qbox small{display:block;color:#9fe;margin-top:6px;line-height:1.5}
#vilP .btns{text-align:center;margin-top:8px}`;
document.head.appendChild(css);
const talP=document.createElement('div');talP.id='talP';talP.className='panel hidden';document.body.appendChild(talP);
const vilP=document.createElement('div');vilP.id='vilP';vilP.className='panel hidden';document.body.appendChild(vilP);
[talP,vilP].forEach(p=>['mousedown','mouseup','contextmenu'].forEach(ev=>p.addEventListener(ev,e=>e.stopPropagation())));

// ---- talent hands ----
function reqTxt(t){const k=Object.keys(t.req||{});return k.length?'Requires '+k.map(x=>t.req[x]+' '+NAMES[x]).join(' \u00b7 '):'No requirement'}
function eligible(){return TAL.filter(t=>P.tal.indexOf(t.id)<0&&Object.keys(t.req||{}).every(k=>P.at[k]>=t.req[k]))}
function rollHand(){const a=eligible();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,3).map(t=>t.id)}
function renderTal(){
 const hand=P.thand||[],picks=P.tpk,nx=Math.min(3,(P.tskip|0)+2);
 const cards=hand.map((id,i)=>{const t=byId[id];return `<div class="tcard${t.maj?' maj':''}" data-i="${i}"><span class="tk">${i+1}</span><div class="tt">${t.maj?'Major':'Minor'} talent</div><div class="tn">${t.n}</div><div class="td">${t.d}</div><div class="tr">${reqTxt(t)}</div></div>`}).join('');
 const head=hand.length?`Choose ${picks} talent${picks>1?'s':''}`:'Nothing to choose';
 talP.innerHTML=`<div class="rune">&#10022;</div><h1>TALENT</h1><h2>${head}${P.thands>1?' \u00b7 '+P.thands+' hands waiting':''}</h2>`
  +(hand.length?`<div class="cards">${cards}</div>`:`<div class="none">None of the talents match your current stats. Raise your attributes (Tab) and come back, or skip this hand to pick ${nx} from your next one.</div>`)
  +`<button id="talLater">Close</button><button id="talSkip">${skipArm?'Confirm skip':'Skip hand'}</button><div class="tsk">Skipping this hand lets you pick ${nx} from your next hand.</div>`+(hand.length?'<div><small>Press 1 \u00b7 2 \u00b7 3 to choose \u00b7 Esc to close</small></div>':'');
 talP.querySelectorAll('.tcard').forEach(c=>c.onclick=()=>pick(+c.dataset.i));
 talP.querySelector('#talLater').onclick=closeTal;talP.querySelector('#talSkip').onclick=skipHand}
function openTal(){
 if(!P||P.dead||talOpen||vOpen)return;
 if(!(P.thands>0)){toast('No talent hands waiting \u2014 next one at level '+(Math.floor(P.lvl/3)*3+3));return}
 if(!P.thand||!P.thand.length){const h=rollHand();P.thand=h.length?h:null;P.tpk=Math.min(1+(P.tskip|0),h.length)}
 skipArm=false;talOpen=true;modal(1);renderTal();talP.classList.remove('hidden')}
function closeTal(){talOpen=false;skipArm=false;talP.classList.add('hidden');modal(0);save()}
function skipHand(){
 if(!skipArm){skipArm=true;renderTal();return}
 P.thands=Math.max(0,P.thands-1);P.tskip=(P.tskip|0)+1;P.thand=null;P.tpk=0;skipArm=false;save();
 talOpen=false;talP.classList.add('hidden');modal(0);toast('Hand skipped \u00b7 next hand: pick '+Math.min(3,P.tskip+1))}
function pick(i){const id=P.thand&&P.thand[i];if(!id)return;skipArm=false;
 const m0=maxHp();P.tal.push(id);P.thand.splice(i,1);P.tpk--;recalc();const m1=maxHp();if(m1>m0)P.hp+=m1-m0;
 try{sfx.level()}catch(e){}toast('Talent: '+byId[id].n);
 if(P.tpk<=0||!P.thand.length){P.thands=Math.max(0,P.thands-1);P.tskip=0;P.thand=null;P.tpk=0;save();
  talOpen=false;talP.classList.add('hidden');modal(0);if(P.thands>0)setTimeout(()=>{if(P&&P.thands>0)toast('Another hand is waiting \u2014 press E at the shrine')},600);return}
 save();renderTal()}

// ---- villager dialogue ----
function paintPortrait(v){const c=vilP.querySelector('#vpPort');if(!c)return;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,c.width,c.height);
 g.save();g.scale(3,3);drawPerson(g,v,14,34,time,{f:1,walk:0,ph:0});g.restore()}
function renderVil(){const v=vCur,s=vq(v.id),q=v.q,lk=vLocked(v);
 let say,body='',btn='';
 if(lk){say=v.say.lock;body=`<div class="qbox"><b>LOCKED</b><small>Villagers helped: ${vHelped()} / ${v.gate}</small></div>`;btn='<button id="vClose">Close</button>'}
 else if(s.s===0){say=v.say.offer;body=`<div class="qbox"><b>${q.t.toUpperCase()}</b><br>${q.d}<small>Reward: ${q.rw}</small></div>`;btn='<button id="vAcc">Accept quest</button><button id="vClose">Not now</button>'}
 else if(s.s===1){say=v.say.act;const pc=Math.round(s.p/q.n*100);body=`<div class="qbox"><b>${q.t.toUpperCase()}</b><br>${q.d} \u2014 ${s.p} / ${q.n}<div class="qbar" style="margin-top:6px"><i style="width:${pc}%;background:var(--gold)"></i></div><small>Reward: ${q.rw}</small></div>`;btn='<button id="vClose">Close</button>'}
 else if(s.s===2){say=v.say.rdy;body=`<div class="qbox" style="border-left-color:#8fe58f"><b style="color:#8fe58f">${q.t.toUpperCase()} \u2014 COMPLETE</b><small>Reward: ${q.rw}</small></div>`;btn='<button id="vTurn" style="border-color:#8fe58f;color:#8fe58f">Turn in</button>'}
 else{say=v.say.done;body='<div class="qbox" style="border-left-color:#555"><b style="color:#8a8a8a">QUEST COMPLETE</b></div>';btn='<button id="vClose">Close</button>'}
 vilP.innerHTML=`<div class="vp-top"><canvas id="vpPort" width="84" height="108"></canvas><div><h1>${v.name.toUpperCase()}</h1><h2>${v.title}</h2></div></div><div class="say">\u201c${say}\u201d</div>${body}<div class="btns">${btn}</div>`;
 paintPortrait(v);const $q=id=>vilP.querySelector(id);
 if($q('#vClose'))$q('#vClose').onclick=closeVil;
 if($q('#vAcc'))$q('#vAcc').onclick=()=>{vAccept(v);renderVil()};
 if($q('#vTurn'))$q('#vTurn').onclick=()=>{vClaim(v);renderVil()}}
function openVil(v){if(!v||vOpen||talOpen||!P||P.dead)return;vCur=v;vOpen=true;modal(1);renderVil();vilP.classList.remove('hidden')}
function closeVil(){vOpen=false;vilP.classList.add('hidden');modal(0);save()}

// capture-phase: the game never sees keys while a panel is up; E at the shrine / a villager opens them
addEventListener('keydown',e=>{
 if(talOpen){e.stopImmediatePropagation();e.preventDefault();
  if(e.code==='Digit1'||e.code==='Numpad1')pick(0);else if(e.code==='Digit2'||e.code==='Numpad2')pick(1);else if(e.code==='Digit3'||e.code==='Numpad3')pick(2);else if(e.code==='Escape')closeTal();return}
 if(vOpen){e.stopImmediatePropagation();e.preventDefault();if(e.code==='Escape')closeVil();return}
 if(e.code==='KeyE'&&!e.repeat&&P&&!paused){
  const v=nearVillager();if(v){e.stopImmediatePropagation();e.preventDefault();openVil(v);return}
  if(nearTalShrine()){e.stopImmediatePropagation();e.preventDefault();openTal()}}},true);

// ---- character sheet, HUD ----
const _ds=drawSheet;drawSheet=function(){_ds.apply(this,arguments);if(!P||!P.tal)return;
 let h='<hr><b>TALENTS</b> <small>(a hand every 3rd level \u00b7 claim at the Talent Shrine in the spawn village)</small>';
 h+=`<div><small>Hands waiting: ${P.thands|0}${P.tskip>0?' \u00b7 skip bonus: next hand picks '+Math.min(3,P.tskip+1):''}</small></div>`;
 if(!P.tal.length)h+='<div><small>None yet \u2014 reach level 3.</small></div>';
 P.tal.forEach(id=>{const t=byId[id];h+=`<div class="row"><span><b>${t.n}</b><br><small>${t.d}</small></span></div>`});
 sheet.insertAdjacentHTML('beforeend',h)};
const _hud=hud;hud=function(){_hud.apply(this,arguments);if(P&&P.thands>0){const el=$('hPts');if(el)el.textContent+=(el.textContent?' \u00b7 ':'')+'\u2606 talent hand at spawn shrine ('+P.thands+')'}};
let vqLast='';
const _uq=updQHud;updQHud=function(){_uq.apply(this,arguments);if(!P||!P.vq)return;const el=$('hQ');if(!el)return;
 const add=VILS.filter(v=>{const s=P.vq[v.id];return s&&(s.s===1||s.s===2)}).map(v=>{const s=P.vq[v.id];return s.s===2?'<div style="color:#8fe58f">\u2714 '+v.name+': '+v.q.t+' \u2014 turn in</div>':'<div style="color:#ffd36b">\u25c6 '+v.name+': '+v.q.d.replace(/\.$/,'')+' '+s.p+'/'+v.q.n+'</div>'}).join('');
 const full=(updQHud.s||'')+add;if(full!==vqLast){vqLast=full;el.innerHTML=full}};
window.TALENTS=TAL;window.__ashVillage={get VIL(){return VIL},VILS,openVil,openTal,vq,nearVillager};
})();
