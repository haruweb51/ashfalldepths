'use strict';
// ===== Ashfall Depths: Extras (customizer · armor · campfire safe zone · weapon/enemy/boss visuals) =====
(()=>{const st=document.createElement('style');st.textContent=`
.sw{display:inline-block;width:26px;height:26px;border:1px solid #000;outline:1px solid var(--edge);flex:none}
.cz{display:grid;grid-template-columns:230px 1fr;gap:22px;text-align:left}.cz canvas{width:210px;height:260px;image-rendering:pixelated;background:radial-gradient(#3a2a4a,#0d0914);border:2px solid var(--edge);display:block}
.opt{display:flex;align-items:center;gap:6px;margin:5px 0;font-size:13px}.opt>b{width:92px;color:#a8957a;letter-spacing:1px;font-weight:400;font-size:11px;text-transform:uppercase}
.opt .v{min-width:92px;text-align:center}.opt button{padding:3px 9px;margin:0}.dots{display:flex;gap:4px;flex-wrap:wrap}.dots i{width:17px;height:17px;border:1px solid #000;outline:1px solid #3a2a14;cursor:pointer}.dots i.on{outline:2px solid var(--gold);box-shadow:0 0 8px var(--gold)}
#menuHero{display:block;margin:0 auto 4px;width:120px;height:150px;image-rendering:pixelated}
@media(max-width:700px){.cz{grid-template-columns:1fr}}`;document.head.appendChild(st)})();
const ca=(c,a)=>{if(c[0]==='#'&&c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];return c+a};
const shade=(h,a)=>{const n=parseInt(h.slice(1),16),f=c=>Math.max(0,Math.min(255,Math.round(c+(a<0?c*a:(255-c)*a))));return'#'+[n>>16,n>>8&255,n&255].map(f).map(v=>v.toString(16).padStart(2,'0')).join('')};
// ---------- appearance data ----------
const LO={skin:['#f6d5b8','#e8b88f','#d19a6e','#b57a52','#8d5a3b','#6b4129','#4a2c1c','#b9b4c4'],
 hair:['Bald','Short','Spiky','Long','Ponytail','Mohawk','Topknot','Braids'],
 hairC:['#17121a','#4a2e1e','#7a4a26','#d8b858','#c8501e','#e8e8f0','#a8b0c0','#3a6ad8','#d8508a','#3aa05a','#8a4ac8','#ff7a2a'],
 beard:['None','Stubble','Short','Long'],eyes:['#5cf','#4aaa4a','#7a4a2a','#c8a02a','#e83a3a','#a05ae0','#e8e8f0','#2a2a3a'],
 face:['None','Scar','War paint','Eye patch','Tattoo','Freckles'],build:['Slim','Average','Broad'],
 cloth:['#a8283a','#d8641e','#d9a441','#2f7a44','#2a8a8a','#3a6ac8','#6a3ab0','#8a2a6a','#5a5a68','#d8d0b8','#1c1822','#e8e8f0'],
 cape:['None','Short','Long','Tattered','Hooded'],
 aura:[{n:'None'},{n:'Embers',c:['255,140,40','255,220,120']},{n:'Frost',c:['120,200,255','230,250,255']},{n:'Storm',c:['255,240,90','255,255,200']},{n:'Void',c:['160,80,255','230,190,255']},{n:'Verdant',c:['90,230,120','210,255,200']},{n:'Gilded',c:['255,200,70','255,245,190']}]};
const LKEY='ashfall_look_v1',LDEF={skin:1,hair:1,hairC:1,beard:0,eyes:0,face:0,build:1,tunic:5,cape:2,capeC:0,aura:0};
let LOOK=(()=>{try{return Object.assign({},LDEF,JSON.parse(localStorage.getItem(LKEY)))}catch(e){return Object.assign({},LDEF)}})();
const saveLook=()=>{try{localStorage.setItem(LKEY,JSON.stringify(LOOK))}catch(e){}};
// ---------- armor sets (separate from accessories) ----------
const ASET=[
 {n:"Wanderer's Rags",rar:0,p:120,def:.04,wt:0,c:['#6a5a48','#8a7a62','#c9b48a'],fx:{stam:8},bn:{stam:10}},
 {n:"Hunter's Leather",rar:0,p:280,def:.07,wt:0,c:['#6b4a2a','#9a6a3a','#d9a441'],fx:{spd:6},bn:{spd:8,dodge:.1}},
 {n:'Ironbound',rar:1,p:650,def:.12,wt:3,c:['#7a8296','#b4bcd0','#e8f0ff'],fx:{post:16},bn:{post:20,pdmg:.1}},
 {n:'Emberplate',rar:2,p:1300,def:.16,wt:3,c:['#7a2a1a','#d8581a','#ffb04a'],fx:{hp:30,dmg:.04},bn:{dmg:.08,hp:20}},
 {n:'Frostguard',rar:3,p:2400,def:.20,wt:4,c:['#4a7aa0','#9ad0f0','#e8ffff'],fx:{post:20,hp:20},bn:{parry:.03,post:20}},
 {n:'Stormweave',rar:3,p:2400,def:.16,wt:0,c:['#4a4a8a','#e0d84a','#fff8a0'],fx:{spd:10,atkc:.1},bn:{atkc:.15,spd:8,jump:.03}},
 {n:'Hollowforged',rar:4,p:0,def:.26,wt:5,c:['#2a1a3a','#7a4ac8','#e0b0ff'],fx:{hp:40,dmg:.08},bn:{dmg:.1,hp:40,regen:.2}}];
const ASL=['helm','chest','hands','legs'],ASN={helm:'Helm',chest:'Cuirass',hands:'Gauntlets',legs:'Greaves'},ASM={helm:.8,chest:1.6,hands:.6,legs:1};
const ARMS=[];ASET.forEach((s,i)=>ASL.forEach(sl=>ARMS.push({id:i+'_'+sl,set:i,slot:sl,name:s.n+' '+ASN[sl],rar:s.rar,def:+(s.def*ASM[sl]/4).toFixed(3),wt:+(s.wt*ASM[sl]/4).toFixed(2),price:Math.round(s.p*ASM[sl]/4)})));
const ARMB={};ARMS.forEach(a=>ARMB[a.id]=a);
let armOwned=[],armEq={};
const armSet=()=>{const s=ASL.map(sl=>armEq[sl]?ARMB[armEq[sl]].set:-1);return s[0]>=0&&s.every(v=>v===s[0])?s[0]:-1};
const armDef=()=>Math.min(.6,ASL.reduce((d,sl)=>d+(armEq[sl]?ARMB[armEq[sl]].def:0),0));
const _rc=recalc;recalc=function(){_rc();for(const sl of ASL){const a=ARMB[armEq[sl]];if(!a)continue;const s=ASET[a.set];S.spd-=a.wt*3;for(const k in s.fx)S[k]+=s.fx[k]*ASM[sl]/4}
 const bs=armSet();if(bs>=0)for(const k in ASET[bs].bn)S[k]+=ASET[bs].bn[k];S.def=armDef();S.spd=S.spd||0;S.dodge=Math.min(S.dodge,.5);S.atkc=Math.min(S.atkc,.5);S.jump=Math.min(S.jump,.15);
 S.hp=Math.round(S.hp);if(typeof P!=='undefined'&&P){P.hp=Math.min(P.hp,maxHp());P.stam=Math.min(P.stam,maxStam())}};
const _hp=hurtPlayer;hurtPlayer=function(dmg,pd,from,br){if(inSafe())return'dodge';const d=1-(S.def||0);return _hp(dmg*d,pd*(1-(S.def||0)*.5),from,br)};
// ---------- armor drops, shop, sheet ----------
function giveArmor(lo,hi,msg){const pool=ARMS.filter(a=>a.set>=lo&&a.set<=hi&&!armOwned.includes(a.id));if(!pool.length){gold+=60;return'+60 gold'}
 const a=pool[Math.random()*pool.length|0];armOwned.push(a.id);return a.name}
const _oc=openChest;openChest=function(c){const had=opened[c.k];_oc(c);if(had)return;const T_=[[.18,0,1],[.32,0,2],[.5,1,4],[.5,1,4],[1,5,6]][c.type]||[.2,0,1];
 if(Math.random()<T_[0]){const n=giveArmor(T_[1],T_[2]);const t=document.getElementById('toast');t.textContent+=' \u00b7 '+n}};
const _fb=finishBoss;finishBoss=function(B){_fb(B);const i=ARENAS.findIndex(a=>a.id===B.id);const n=giveArmor(Math.min(6,i+3),Math.min(6,i+3));const t=document.getElementById('toast');t.textContent+=' \u00b7 '+n+' (armor)'};
const armTxt=a=>{const s=ASET[a.set],o=['Def '+Math.round(a.def*1000)/10+'%'];if(a.wt)o.push('Weight -'+Math.round(a.wt*3)+' speed');for(const k in s.fx){const v=s.fx[k]*ASM[a.slot]/4;o.push(FXN[k]+' +'+(PCT[k]?Math.round(v*100)+'%':Math.round(v)))}return o.join(' \u00b7 ')};
const armRow=(a,b)=>`<div class="row"><span style="display:flex;gap:10px;align-items:center"><i class="sw" style="background:linear-gradient(135deg,${ASET[a.set].c[1]},${ASET[a.set].c[0]})"></i><span><b style="color:${RAR[a.rar][1]}">${a.name}</b><br><small>${armTxt(a)}</small></span></span><span>${b}</span></div>`;
function armHTML(shop){const bs=armSet();let h=`<hr><b>ARMOR</b> <small>(separate from accessories) \u00b7 Defense ${Math.round(armDef()*100)}%</small>`;
 if(bs>=0)h+=`<div style="color:#9fe;font-size:12px">\u2726 Full ${ASET[bs].n} set: ${fxText(ASET[bs].bn)}</div>`;
 for(const sl of ASL){const a=ARMB[armEq[sl]];h+=a?armRow(a,`<button data-au="${sl}">Unequip</button>`):`<div class="row"><span><b>${ASN[sl]}</b> <small>empty</small></span></div>`}
 const own=armOwned.map(i=>ARMB[i]).filter(a=>a&&armEq[a.slot]!==a.id);if(own.length)h+='<div style="color:#a8957a;font-size:11px;letter-spacing:2px;margin-top:8px">IN PACK</div>';
 own.forEach(a=>h+=armRow(a,`<button data-aq="${a.id}">Equip</button>`));
 if(shop){h+='<div style="color:#a8957a;font-size:11px;letter-spacing:2px;margin-top:8px">ARMOR FOR SALE</div>';ARMS.filter(a=>a.price&&!armOwned.includes(a.id)).sort((a,b)=>a.price-b.price).forEach(a=>h+=armRow(a,`<small style="color:#ffd36b">${a.price}g</small> <button data-ab="${a.id}" ${gold<a.price?'disabled':''}>Buy</button>`))}
 return h}
function armBind(){const rd=()=>{recalc();save();sfx.loot();shopOpen?drawShop():drawSheet()};
 sheet.querySelectorAll('[data-au]').forEach(b=>b.onclick=()=>{delete armEq[b.dataset.au];rd()});
 sheet.querySelectorAll('[data-aq]').forEach(b=>b.onclick=()=>{const a=ARMB[b.dataset.aq];armEq[a.slot]=a.id;rd()});
 sheet.querySelectorAll('[data-ab]').forEach(b=>b.onclick=()=>{const a=ARMB[b.dataset.ab];if(gold<a.price||armOwned.includes(a.id))return;gold-=a.price;armOwned.push(a.id);rd()})}
const _ds=drawShop;drawShop=function(){_ds();sheet.insertAdjacentHTML('beforeend',armHTML(true));armBind()};
const _dh=drawSheet;drawSheet=function(){_dh();sheet.insertAdjacentHTML('beforeend',armHTML(false));armBind()};
// ---------- hero renderer (used in game, menu and customizer) ----------
function drawHero(g,L,A,s){const r=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)},pl=(p,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.fill()};
 const sk=LO.skin[L.skin],sk2=shade(sk,-.2),hc=LO.hairC[L.hairC],tc=s.dodge?'#9cf':s.gb?'#b66':LO.cloth[L.tunic],cc=LO.cloth[L.capeC],pc=shade(tc,-.4),tx=[2,1,0][L.build],tw=[8,10,12][L.build],lg=s.lg||0,sw=s.sw||0,t=s.t||0;
 const AS=k=>A&&A[k]>=0?ASET[A[k]]:null,AH=AS('helm'),AC=AS('chest'),AG=AS('hands'),AL=AS('legs'),hi=A?{helm:A.helm,chest:A.chest,hands:A.hands,legs:A.legs}:{};
 g.save();if(s.f<0){g.translate(12,0);g.scale(-1,1)}
 // cape
 if(L.cape){const len=[0,11,21,19,23][L.cape],c2=shade(cc,-.35);
  pl([4,6,9,6,7,6+len*.6,3,6+len,-2-sw*.6,6+len,-5-sw,6+len-2,-3-sw*.6,6+len*.5],cc);pl([4,7,8,7,6,6+len*.55,2,6+len-1,-2-sw*.5,6+len-1],c2);
  if(L.cape===3){for(let i=0;i<4;i++)r(-4-sw+i*2.5,6+len-2,1.2,2.5,'#00000055')}
  r(3,6,6,1.5,shade(cc,.2))}
 // legs
 const pcol=pc,boot=shade(pc,-.3);for(const d of[-1,1]){const x=d<0?2+lg:7-lg;
  if(AL){r(x,15,3,7,AL.c[0]);r(x,15,3,1,AL.c[1]);r(x,18,3,1,AL.c[1]);r(x,20,4,2,shade(AL.c[0],-.35));r(x+(d>0?1:0),20,3,1,AL.c[1]);if(hi.legs>=3)r(x+1,16,1,2,AL.c[2])}
  else{r(x,15,3,4,pcol);r(x-.5,19,4,3,boot);r(x-.5,19,4,1,shade(boot,.25))}}
 // torso
 r(tx,8,tw,8,tc);r(tx,8,tw,1,shade(tc,.25));r(tx,14,tw,2,'#3a2a1a');r(5.5,14,2,2,'#d9a441');r(tx,15.5,tw,.5,shade(tc,-.3));r(tx,9,1,6,shade(tc,-.18));
 if(AC){const m=AC.c[0],tr=AC.c[1],gl=AC.c[2];r(tx,7,tw,9,hi.chest===0?shade(m,-.1):m);r(tx,7,tw,1,tr);r(tx,15,tw,1,tr);r(tx+1,8,2,6,shade(m,.18));r(tx+tw-2,8,1,7,shade(m,-.3));
  if(hi.chest===0){r(tx+2,7,2,9,tr);r(tx+tw-4,7,2,9,tr)}else if(hi.chest===1){for(let i=0;i<4;i++)r(tx+3,9+i*1.5,tw-6,.5,shade(m,-.35))}
  else if(hi.chest===2){for(let i=0;i<3;i++)for(let j=0;j<3;j++)r(tx+2+j*(tw-4)/3,9+i*2.5,1,1,tr)}
  if(hi.chest>=3){r(5,9,2,3,shade(m,-.4));r(5.5,10,1,1,gl);if(hi.chest>=6)r(5,12,2,.8,gl)}
  const pa=hi.chest>=2?4:3;for(const x of[tx-2,tx+tw-pa+2]){r(x,6,pa,3,m);r(x,6,pa,1,tr);r(x,8,pa,1,shade(m,-.4))}
  if(hi.chest===3){pl([tx-2,6,tx-3,2,tx+1,6],tr);pl([tx+tw+2,6,tx+tw+3,2,tx+tw-1,6],tr)}
  else if(hi.chest===4){pl([tx-2,6,tx-2,1,tx,6],gl);pl([tx+tw+2,6,tx+tw+2,1,tx+tw,6],gl);pl([tx+tw-1,6,tx+tw+1,0,tx+tw+1,6],tr)}
  else if(hi.chest===5){pl([tx-2,7,tx-5,4,tx,6],tr);pl([tx+tw+2,7,tx+tw+5,4,tx+tw,6],tr)}
  else if(hi.chest===6){pl([tx-2,6,tx-4,0,tx+1,6],tr);pl([tx+tw+2,6,tx+tw+4,0,tx+tw-1,6],tr);r(tx,12,tw,1,'rgba(224,176,255,'+(.4+.4*Math.sin(t*4))+')')}}
 // front arm (weapon is drawn by the game)
 r(tx+tw-3,9,3,5,AG?AG.c[0]:tc);r(tx+tw-3,9,3,1,AG?AG.c[1]:shade(tc,.2));r(tx+tw-2,13,3,2,AG?AG.c[1]:sk);if(AG){r(tx+tw-3,11,4,1,AG.c[1]);if(hi.hands>=3)r(tx+tw-2,10,1,1,AG.c[2])}
 // head
 r(2,0,8,8,sk);r(2,7,8,1,sk2);r(1.5,2,1,3,sk2);const hs=AH&&hi.helm>=2;
 if(!hs){const hx=L.hair;
  if(hx===1||hx===4||hx===7||hx===6||hx===3||hx===2||hx===5){r(2,-1,8,3,hc);r(2,0,2,5,hc)}
  if(hx===2){for(let i=0;i<4;i++)pl([2+i*2,-1,3+i*2,-5-(i%2)*2,4+i*2,-1],hc)}
  if(hx===3){r(-1,0,4,12,hc);r(-1,10,4,2,shade(hc,-.3))}
  if(hx===4){r(1,0,2,3,hc);r(-4-sw*.4,1,5,3,hc);r(-5-sw*.6,3,3,5,shade(hc,-.2))}
  if(hx===5){r(5,-4,3,5,hc);r(4,-1,5,2,hc);r(2,2,2,5,shade(hc,-.2)==hc?hc:hc)}
  if(hx===6){r(4,-5,4,4,hc);r(5,-3,2,1,shade(hc,-.4));r(2,-1,8,2,hc)}
  if(hx===7){r(1,1,2,8,hc);r(1,3,1,1,shade(hc,.4));r(1,6,1,1,shade(hc,.4));r(-1,2,2,9,shade(hc,-.2))}
  if(hx&&hx!==5&&hx!==6)r(2,-1,8,1,shade(hc,.25))}
 if(L.beard===1)r(3,5,6,3,'rgba(0,0,0,.22)');else if(L.beard===2){r(3,5,7,4,hc);r(5,4,4,1,hc);r(6,6,2,1,sk2)}else if(L.beard===3){r(3,5,7,5,hc);r(4,9,5,5,hc);r(5,13,3,2,shade(hc,-.2))}
 if(L.cape===4&&!AH){r(1,-2,10,3,cc);r(0,-1,2,10,cc);r(0,-1,2,10,shade(cc,-.2));r(2,0,3,2,'#00000044')}
 if(AH){const m=AH.c[0],tr=AH.c[1],gl=AH.c[2],i=hi.helm;
  if(i===0){r(1,-2,10,5,m);r(1,-2,10,1,tr);r(0,2,3,7,m);r(2,3,1,3,'#0006')}
  else if(i===1){r(1,-2,10,4,m);r(0,2,12,1,tr);pl([9,-2,11,-7,10,-1],gl)}
  else{r(1,-3,10,8,m);r(1,-3,10,1,tr);r(1,4,10,1,tr);r(5,-3,1.5,8,tr);r(6,3,4,1.5,'#07050c');r(6.3,3.2,3.4,.9,i>=3?gl:'#8a94ac');r(1,4,2,5,shade(m,-.2));
   if(i===3){pl([1,-3,-3,-10,3,-3],tr);pl([11,-3,14,-10,9,-3],tr)}
   if(i===4){pl([2,-3,3,-10,5,-3],gl);pl([5,-3,7,-12,9,-3],tr);pl([8,-3,10,-9,11,-3],gl)}
   if(i===5){pl([1,-1,-5,-7,-2,0],tr);pl([11,-1,17,-7,14,0],tr);pl([1,0,-4,-2,0,2],gl)}
   if(i===6){for(let k=0;k<4;k++)pl([1.5+k*2.4,-3,2.7+k*2.4,-8-(k%2)*3,3.9+k*2.4,-3],tr);r(6,3,2,2,gl);r(9,3,1.5,2,gl)}}}
 else if(s.eqHead)r(2,-2,8,1.5,'#d9a441');
 if(!hs){const ec=LO.eyes[L.eyes];r(7,3,3,2.5,'#fff');r(8,3,2,2.5,ec);r(8.5,3.5,1,1.5,'#0a0710');r(4,3.5,2,2,'#e8e8f0');r(4.7,3.5,1.3,2,ec);r(7,2,3,1,shade(hc,-.1));r(4,2,2,1,shade(hc,-.1));
  r(7,6.5,2.5,.8,'#7a3a3a');
  if(L.face===1){r(8,1,1,6,'#a02a3a');r(7,3,3,1,'#a02a3a88')}else if(L.face===2){r(3,4,7,1,'#d83a2a');r(4,6,5,1,'#f0f0f0');r(5,2,1,2,'#d83a2a')}
  else if(L.face===3){r(6,2,4,4,'#0c0a10');r(2,3,9,1,'#0c0a10')}else if(L.face===4){r(4,5,1,3,'#3a6a9a');r(6,6,2,1,'#3a6a9a');r(8,5,1,2,'#3a6a9a')}else if(L.face===5){for(const[a,b]of[[3,5],[5,6],[8,5],[9,6],[6,4]])r(a,b,.9,.9,'#a05a2a')}}
 g.restore()}
function heroDraw(X,Y,f,run,lg,sw){const A={};for(const sl of ASL)A[sl]=armEq[sl]?ARMB[armEq[sl]].set:-1;
 cx.save();cx.translate(X,Y);if(P.blocking){}drawHero(cx,LOOK,A,{f,lg,sw,t:time,dodge:P.dodge>0,gb:P.guardBroken>0,eqHead:eq&&eq.head});cx.restore();heroFx(X,Y,run)}
function heroFx(X,Y,run){const au=LO.aura[LOOK.aura];if(P.dodge>0)for(let i=0;i<2;i++)parts.push({x:P.x+6,y:P.y+11,vx:(Math.random()-.5)*30,vy:(Math.random()-.5)*30,l:.3,c:'#bdf'});
 if(run&&Math.random()<.25)parts.push({x:P.x+6-P.face*3,y:P.y+22,vx:-P.face*20,vy:-18,l:.25,c:'#8a7a6a'});
 if(!au.c)return;if(Math.random()<.35)parts.push({x:P.x+Math.random()*12,y:P.y+4+Math.random()*16,vx:(Math.random()-.5)*14,vy:-28-Math.random()*24,l:.5+Math.random()*.4,c:'rgb('+au.c[Math.random()<.5?0:1]+')'});
 AD(()=>glow(X+6,Y+11,34+Math.sin(time*3)*4,'rgba('+au.c[0]+',.16)'))}
// ---------- weapon art ----------
const RARC=['#aab4c0','#6fdc6f','#5a9aff','#c06aff','#ffb040'],rc=()=>RARC[(P&&P.weapon&&P.weapon.rar)|0],rn=()=>(P&&P.weapon&&P.weapon.rar)|0;
const grip=(a,b,c='#3a2418')=>{FR(a,-1.5,b-a,3,c);for(let x=a+1;x<b;x+=2)FR(x,-1.5,1,3,'#6a4a2a')};
const gemW=(x,y,r=1.6)=>{FR(x-r-.5,y-r-.5,r*2+1,r*2+1,'#000');FR(x-r,y-r,r*2,r*2,rc());FR(x-r,y-r,1,1,'#fff')};
const guardW=(x,h,c1='#d9a441',c2='#8a6a1a')=>{FR(x,-h,3,h*2,c2);FR(x,-h,3,1.5,c1);FR(x,h-1,3,1,'#0006');FR(x+.5,-h-1,2,1,c1);FR(x+.5,h,2,1,c1)};
function blade(x0,x1,hw,tip,hi='#e8f0ff',lo='#8a9ab8',edge='#fff'){PL([x0,0,x0,-hw,x1,-hw*.85,tip,0],hi);PL([x0,0,x0,hw,x1,hw*.85,tip,0],lo);FR(x0,-.5,tip-x0-2,1,'#fff');FR(x0,-hw,x1-x0,.8,edge);FR(x0,hw-.7,x1-x0,.7,'#0004');
 if(rn()>=2)AD(()=>{glow((x0+tip)/2,0,(tip-x0)*.7,ca(rc(),'55'))});if(rn()>=3)for(let i=0;i<3;i++)FR(x0+4+i*(tip-x0)/4,-.4,1.2,.8,'rgba(255,255,255,'+(.5+.5*Math.sin(time*5+i))+')')}
const wglint=(x0,x1)=>{const k=((time*1.6)%1.6)/1.6*(x1-x0)+x0;if(k<x1)AD(()=>{FR(k,-3,2,6,'rgba(255,255,255,.35)')})};
const spark=(c,n=.25)=>{if(Math.random()<n&&P)parts.push({x:P.x+6+Math.cos(P.aim||0)*28+(Math.random()-.5)*10,y:P.y+11+Math.sin(P.aim||0)*28+(Math.random()-.5)*10,vx:(Math.random()-.5)*30,vy:-20-Math.random()*30,l:.5,c})};
Object.assign(WK.sword,{draw(){grip(0,5);gemW(-1,0,1.7);guardW(5,5);blade(8,26,2.7,32);FR(10,-1,13,.8,'#7a8aa8');FR(10,.3,13,.6,'#4a5a78');wglint(9,30)}});
Object.assign(WK.dagger,{draw(){grip(1,5,'#2a2a1a');FR(0,-1.5,1.5,3,'#d9a441');guardW(5,3.5,'#cfe','#6a8a8a');blade(7,16,1.7,21,'#d8f4ff','#7aa0b0','#cfe');FR(8,-.4,7,.8,'#3a7a6a');wglint(8,20)}});
Object.assign(WK.greatsword,{draw(){grip(-2,6,'#2a1a14');gemW(-3,0,2);guardW(6,7,'#d9a441','#7a5a18');gemW(7.5,0,1.7);blade(9,33,4,42,'#dfe8ff','#7e8fb4');FR(11,-1,22,2,'#5a6a8a');FR(11,-.5,22,.8,'#2a3450');
  for(let i=0;i<4;i++)FR(14+i*5,-2.6,1.6,1.2,rn()>=3?rc():'#3a4a6a');wglint(10,40)}});
Object.assign(WK.spear,{draw(){FR(-8,-1,36,2,'#7a5a32');FR(-8,-1,36,.8,'#a8844a');for(let x=-4;x<22;x+=5)FR(x,-1.4,1.2,2.8,'#4a3018');FR(20,-2,3,4,'#d9a441');PL([22,0,26,-3,22,-2],'#c33');PL([22,0,26,3,22,2],'#a22');PL([26,-1.5,30,-5,40,0,30,5,26,1.5],'#dfe8f0');PL([26,0,30,-5,40,0],'#fff');FR(27,-.5,10,1,'#8a9ab8');gemW(26,0,1.2);if(rn()>=2)AD(()=>glow(36,0,14,ca(rc(),'88')));wglint(26,40)}});
Object.assign(WK.hammer,{draw(){FR(-2,-1.2,24,2.4,'#6a4a2a');for(let x=0;x<20;x+=4)FR(x,-1.4,1.2,2.8,'#3a2418');FR(-3,-2,2,4,'#d9a441');FR(19,-8,14,16,'#2a2e3a');FR(20,-7,12,14,'#555a68');FR(20,-7,12,3,'#9aa0b4');FR(20,4,12,3,'#3a3e4a');FR(19,-1.2,14,2.4,'#7a7f90');
  for(const[a,b]of[[21,-6],[30,-6],[21,5],[30,5]])FR(a,b,1.4,1.4,'#cfd4e0');FR(33,-5,2,10,'#aab');gemW(26,0,2);if(rn()>=2)AD(()=>glow(26,0,22,ca(rc(),'66')))}});
Object.assign(WK.scimitar,{draw(){grip(0,5,'#3a1a1a');gemW(-1,0,1.5);guardW(5,4.5,'#d9a441','#8a2a2a');const g=cx.createLinearGradient(8,-8,28,4);g.addColorStop(0,'#fff');g.addColorStop(.5,'#cfe4ff');g.addColorStop(1,'#7a8cb0');cx.fillStyle=g;cx.beginPath();cx.moveTo(8,-1.5);cx.quadraticCurveTo(22,-10,30,3);cx.quadraticCurveTo(19,-3,8,1.5);cx.fill();
  cx.strokeStyle='#fff';cx.lineWidth=.8;cx.beginPath();cx.moveTo(9,-1.5);cx.quadraticCurveTo(22,-9.5,29.5,2.5);cx.stroke();cx.strokeStyle='#d9a441';cx.lineWidth=.7;cx.beginPath();cx.moveTo(10,0);cx.quadraticCurveTo(20,-4,27,2);cx.stroke();if(rn()>=2)AD(()=>glow(20,-3,16,ca(rc(),'66')))}});
Object.assign(WK.katana,{draw(){FR(-2,-1.4,10,2.8,'#15121a');for(let x=-1;x<8;x+=2.4)PL([x,-1.4,x+1.2,0,x,1.4,x-1.2,0],'#a02a2a');FR(-3,-1.6,1.5,3.2,'#d9a441');cx.fillStyle='#d9a441';cx.beginPath();cx.ellipse(8.5,0,1.6,4.6,0,0,7);cx.fill();cx.fillStyle='#3a2a1a';cx.beginPath();cx.ellipse(8.5,0,.7,3.2,0,0,7);cx.fill();
  PL([10,-1.3,30,-1.1,36,0,30,1.3,10,1.3],'#eef4ff');PL([10,.2,30,.2,36,0,30,1.3,10,1.3],'#9aaace');cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=.6;cx.beginPath();for(let x=11;x<33;x+=1)cx.lineTo(x,.5+Math.sin(x*.9)*.4);cx.stroke();FR(10,-1.3,24,.6,'#fff');if(rn()>=2)AD(()=>glow(22,0,18,ca(rc(),'66')));wglint(10,35)}});
Object.assign(WK.axe,{draw(){FR(-3,-1.2,26,2.4,'#6a4a2a');FR(-3,-1.2,26,.8,'#8a6a3a');for(const x of[0,6])FR(x,-1.6,1.5,3.2,'#2a1a10');FR(-4,-2,2,4,'#d9a441');PL([16,-1,17,-5,22,-12,28,-9,31,0,28,9,22,12,17,5,16,1],'#2a2e3a');
  const g=cx.createLinearGradient(18,-10,30,10);g.addColorStop(0,'#e8eefc');g.addColorStop(1,'#6a7488');cx.fillStyle=g;cx.beginPath();cx.moveTo(17,-1);cx.lineTo(22,-11);cx.quadraticCurveTo(31,-3,30,0);cx.quadraticCurveTo(31,3,22,11);cx.lineTo(17,1);cx.fill();cx.strokeStyle='#fff';cx.lineWidth=1.1;cx.beginPath();cx.moveTo(22,-11);cx.quadraticCurveTo(31,-3,30,0);cx.quadraticCurveTo(31,3,22,11);cx.stroke();
  PL([16,-1,12,-5,15,-1],'#8a90a0');PL([16,1,12,5,15,1],'#8a90a0');gemW(20,0,1.4);if(rn()>=2)AD(()=>glow(25,0,20,ca(rc(),'66')))}});
// boss weapons
Object.assign(WK.infernal,{draw(){FR(-4,-2,9,4,'#1a0a08');gemW(-5,0,2);PL([5,-10,9,-10,9,10,5,10,3,0],'#8a2a1a');PL([5,-10,9,-10,9,-8,5,-8],'#ff9a2a');
  PL([9,-5,16,-8,24,-6,30,-11,38,-6,48,0,38,6,30,11,24,6,16,8,9,5],'#2a0e0a');PL([10,-3,24,-4,36,-4,46,0,36,4,24,4,10,3],'#5a1a10');
  cx.strokeStyle='#ff9a2a';cx.lineWidth=1;cx.beginPath();cx.moveTo(10,0);for(let x=11;x<46;x+=3)cx.lineTo(x,Math.sin(x*1.3+time*10)*1.6);cx.stroke();FR(12,-.6,32,1.2,'#ffe08a');
  for(let k=0;k<6;k++){const fy=Math.sin(time*14+k*2)*2.5;PL([13+k*6,-6,16+k*6,-13+fy,19+k*6,-6],'#ff5a1a');PL([14+k*6,-6,16+k*6,-10+fy,18+k*6,-6],'#ffd06a');PL([13+k*6,6,16+k*6,13-fy,19+k*6,6],'#ff5a1a')}
  AD(()=>{glow(26,0,46,'rgba(255,90,20,.35)');glow(44,0,18,'rgba(255,200,80,.5)')});spark('#ff8a2a',.5)}});
Object.assign(WK.frostbite,{draw(){FR(-1,-1.5,7,3,'#2a4a6a');PL([4,-7,9,0,4,7,2,0],'#6ac0f0');PL([4,-7,9,0,2,0],'#cfeeff');
  PL([9,-3.5,22,-6,32,-3,42,0,32,3,22,6,9,3.5],'#8ad4ff');PL([9,0,22,0,42,0,32,3,22,6,9,3.5],'#4a9ad0');PL([10,-.5,40,0,10,.5],'#fff');
  for(const[a,b,c]of[[14,-4,-12],[22,-5,-13],[30,-3,-9]])PL([a,b,a+3,c,a+6,b],'#dff6ff');for(const[a,b,c]of[[16,4,11],[26,4,12],[34,2,8]])PL([a,b,a+3,c,a+6,b],'#a8e4ff');
  AD(()=>{glow(26,0,40,'rgba(120,210,255,.35)');for(let i=0;i<4;i++)FR(12+((time*20+i*9)%30),-2+Math.sin(time*4+i)*5,1.5,1.5,'rgba(255,255,255,.8)')});spark('#cff',.5)}});
Object.assign(WK.stormpiercer,{draw(){FR(-10,-1.2,44,2.4,'#222c58');FR(-10,-1.2,44,.8,'#4a5a9a');for(const x of[-2,8,18])FR(x,-2.2,3,4.4,'#d9a441');gemW(-11,0,1.8);PL([32,-6,42,-3,37,0,50,0,35,7,40,1,31,3],'#ffd820');PL([34,-2,42,-1,38,1],'#fff');
  cx.strokeStyle='#fff6a0';cx.lineWidth=1;for(let k=0;k<3;k++){cx.beginPath();let x=-8+k*6,y=0;cx.moveTo(x,y);for(let i=0;i<7;i++){x+=7;y=(Math.random()-.5)*7;cx.lineTo(x,y)}cx.stroke()}
  AD(()=>{glow(44,0,28,'rgba(255,240,100,.6)');glow(20,0,36,'rgba(255,230,80,.22)')});spark('#ffe',.6)}});
Object.assign(WK.voidfang,{draw(){for(const a of[-.26,.26]){cx.save();cx.rotate(a);FR(-1,-1.5,7,3,'#12081c');FR(5,-5,2.5,10,'#7a3ac0');gemW(-2,0,1.4);const g=cx.createLinearGradient(7,-4,30,2);g.addColorStop(0,'#5a2a90');g.addColorStop(1,'#0c0614');cx.fillStyle=g;cx.beginPath();cx.moveTo(7,-3.5);cx.quadraticCurveTo(22,-10,32,2);cx.quadraticCurveTo(19,-1,7,1.5);cx.fill();
  cx.strokeStyle='#e0b0ff';cx.lineWidth=.9;cx.beginPath();cx.moveTo(8,-3.2);cx.quadraticCurveTo(22,-9.5,31.5,2);cx.stroke();FR(9,0,16,.8,'#c8f');PL([28,-2,31,3,26,0],'#fff');cx.restore()}
  AD(()=>{glow(20,0,34,'rgba(160,80,255,.38)');for(let i=0;i<5;i++){const q=time*3+i*1.25;FR(18+Math.cos(q)*14,Math.sin(q)*9,1.6,1.6,'rgba(230,190,255,.9)')}});spark('#c8f',.5)}});
// ---------- player slash ----------
function slashFx(X,Y,WD,sa,a){cx.save();cx.translate(X+6,Y+11);const R=WD.reach,col=WD.col,rcL=rn()>=2?rc():null,k=Math.sin(a*Math.PI);
 AD(()=>{const g=cx.createRadialGradient(0,0,R*.35,0,0,R*1.12);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.7,col[1]);g.addColorStop(1,'rgba(255,255,255,'+(.8*k)+')');cx.fillStyle=g;cx.beginPath();cx.arc(0,0,R*1.1,sa-1.25,sa);cx.arc(0,0,R*.5,sa,sa-1.25,true);cx.closePath();cx.globalAlpha=.9*k;cx.fill()});
 for(let q=0;q<3;q++){cx.strokeStyle=col[q];cx.lineWidth=4.5-q*1.5;cx.beginPath();cx.arc(0,0,R*(1.02-q*.05),sa-1.1+q*.1,sa);cx.stroke()}
 cx.strokeStyle='#fff';cx.lineWidth=1.2;cx.beginPath();cx.arc(0,0,R*1.1,sa-.7,sa);cx.stroke();if(rcL){cx.strokeStyle=rcL;cx.lineWidth=1;cx.beginPath();cx.arc(0,0,R*1.15,sa-1,sa-.1);cx.stroke()}
 for(let i=0;i<5;i++){const an=sa-i*.2-.05,rr=R*(1.05+((i*37)%5)*.04);cx.fillStyle=i%2?'#fff':col[1];cx.fillRect(Math.cos(an)*rr-1,Math.sin(an)*rr-1,2,2)}cx.restore()}
// ---------- enemy attack visuals ----------
function foeSlash(e,S_,d,id,cxm,Y,f,sc,lights){const p=S_.a,ang=f>0?-1.35+p*2.7:Math.PI+1.35-p*2.7,col=d.c[2],R=(id==='hknight'?44:32)*sc,k=Math.sin(Math.min(1,p)*Math.PI),y0=Y+e.h*.5;
 cx.save();cx.translate(cxm,y0);lights.push([cxm+f*18,y0,90]);
 AD(()=>{const g=cx.createRadialGradient(0,0,R*.3,0,0,R*1.15);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.75,ca(col,'88'));g.addColorStop(1,'#fff');cx.fillStyle=g;cx.globalAlpha=.75*k+.1;cx.beginPath();if(f>0){cx.arc(0,0,R*1.12,ang-1.5,ang);cx.arc(0,0,R*.45,ang,ang-1.5,true)}else{cx.arc(0,0,R*1.12,ang,ang+1.5);cx.arc(0,0,R*.45,ang+1.5,ang,true)}cx.fill()});
 cx.lineCap='round';for(let q=0;q<3;q++){cx.globalAlpha=[.3,.75,1][q];cx.strokeStyle=q<2?col:'#fff';cx.lineWidth=[10,5,1.8][q];cx.beginPath();if(f>0)cx.arc(0,0,R,ang-1.4,ang);else cx.arc(0,0,R,ang,ang+1.4);cx.stroke()}
 cx.globalAlpha=1;for(let i=0;i<6;i++){const an=ang-(f>0?1:-1)*i*.22,rr=R*(1+.08*Math.sin(i*5+time*30));cx.fillStyle=i%2?'#fff':col;cx.fillRect(Math.cos(an)*rr-1,Math.sin(an)*rr-1,2.4,2.4)}
 cx.restore();if(p>.5&&p<.75){for(let i=0;i<3;i++)parts.push({x:e.x+e.w/2+f*(R*.8),y:e.y+e.h,vx:f*(30+Math.random()*70),vy:-30-Math.random()*40,l:.35,c:col})}
 AD(()=>{cx.save();cx.translate(cxm,Y+e.h);cx.scale(1,.25);glow(f*R*.7,0,R*.7*k+4,ca(col,'66'));cx.restore()})}
const _df=drawFoe;drawFoe=function(e,X,Y,lights){_df(e,X,Y,lights);const d=e.def;if(!d||e.dead)return;const cxm=X+e.w/2,y=Y+e.h*.4,col=d.c[2];
 if(d.k==='ranged'&&(e.st==='windup'||e.st==='attack')){const p=e.st==='windup'?clamp(1-e.t/(e.tw||d.wu),0,1):1,r=2+p*6,hx=cxm+e.face*10;AD(()=>{glow(hx,y,r*3.2,ca(col,'aa'));cx.fillStyle='#fff';cx.beginPath();cx.arc(hx,y,r*.5,0,7);cx.fill();cx.strokeStyle=col;cx.lineWidth=1;for(let i=0;i<3;i++){const a=time*9+i*2.1;cx.beginPath();cx.arc(hx+Math.cos(a)*r*1.4,y+Math.sin(a)*r*1.4,1,0,7);cx.stroke()}});lights.push([hx,y,40+p*40])}
 if(e.st==='windup'){const p=clamp(1-e.t/(e.tw||d.wu),0,1);AD(()=>{cx.save();cx.translate(cxm,Y+e.h);cx.scale(1,.25);cx.strokeStyle='rgba(255,70,50,'+(.3+.6*p)+')';cx.lineWidth=3;cx.beginPath();cx.arc(0,0,16+p*16,0,7);cx.stroke();for(let i=0;i<6;i++){const a=i*1.047+time*2;cx.fillStyle='rgba(255,170,90,'+p+')';cx.fillRect(Math.cos(a)*(16+p*16)-1.5,Math.sin(a)*(16+p*16)-4,3,8)}cx.restore();glow(cxm,Y+e.h*.5,10+p*22,'rgba(255,60,40,'+(.12+.25*p)+')')})}};
enemyTele=function(e,X,Y){const d=e.def,p=Math.max(0,Math.min(1,1-e.t/(e.tw||d.wu))),ecx=X+e.w/2,ecy=Y+e.h/2,f=e.face,feet=Y+e.h,pu=.5+.5*Math.sin(time*(14+p*22));
 if(d.k==='ranged')aimLines(ecx,ecy-3,e.el?3:1,.25,190,p);
 else if(d.k==='fly'){const a=Math.atan2((e.ty||P.y)-(e.y+7),(e.tx||P.x)-(e.x+7));cx.save();cx.translate(ecx,ecy);cx.rotate(a);const g=cx.createLinearGradient(0,0,140,0);g.addColorStop(0,'rgba(255,60,40,'+(.1+.3*p)+')');g.addColorStop(1,'rgba(255,60,40,0)');cx.fillStyle=g;cx.fillRect(0,-8,140,16);cx.strokeStyle='rgba(255,90,60,'+(.5+.4*pu)+')';cx.lineWidth=1.2;cx.setLineDash([6,5]);cx.lineDashOffset=-time*40;cx.strokeRect(0,-8,140,16);cx.setLineDash([]);for(let i=0;i<4;i++){const x=20+i*30+(time*60%30);PL([x,-5,x+8,0,x,5],'rgba(255,200,120,'+(.2+.5*p)+')')}cx.restore()}
 else{cx.save();cx.translate(ecx,feet-12);const R=44,g=cx.createRadialGradient(0,0,4,0,0,R);g.addColorStop(0,'rgba(255,40,30,0)');g.addColorStop(1,'rgba(255,50,40,'+(.18+.38*p)+')');cx.fillStyle=g;cx.beginPath();cx.moveTo(0,0);if(f>0)cx.arc(0,0,R,-1.15,1.15);else cx.arc(0,0,R,Math.PI-1.15,Math.PI+1.15);cx.closePath();cx.fill();
  cx.strokeStyle='rgba(255,'+(100+pu*120|0)+',80,'+(.5+.5*p)+')';cx.lineWidth=1.6;cx.stroke();cx.beginPath();if(f>0)cx.arc(0,0,R*p,-1.15,1.15);else cx.arc(0,0,R*p,Math.PI-1.15,Math.PI+1.15);cx.lineWidth=2.4;cx.strokeStyle='#fff';cx.stroke();cx.restore()}
 cue(ecx,ecy,40,p,e.t);bang(ecx,Y-2,e.el?'ELITE':'')};
function drawProj(p,ox,oy,L){const X=p.x-ox,Y=p.y-oy,r=p.r+2,sp=Math.hypot(p.vx,p.vy)||1,nx=p.vx/sp,ny=p.vy/sp,c=p.col;
 AD(()=>{for(let k=1;k<9;k++){cx.globalAlpha=.5*(1-k/9);cx.fillStyle=c;const q=r*(1-k/12);cx.beginPath();cx.arc(X-nx*k*4.5+Math.sin(time*30+k)*.8,Y-ny*k*4.5,q,0,7);cx.fill()}cx.globalAlpha=1;glow(X,Y,r*5,ca(c,'99'));glow(X,Y,r*2.2,'rgba(255,255,255,.6)')});
 cx.save();cx.translate(X,Y);cx.rotate(time*7);PL([0,-r*1.5,r*.7,0,0,r*1.5,-r*.7,0],c);PL([0,-r*1.5,r*.7,0,0,0],'#fff9');cx.rotate(1.57);PL([0,-r*1.1,r*.5,0,0,r*1.1,-r*.5,0],'#fff5');cx.restore();
 cx.fillStyle='#fff';cx.beginPath();cx.arc(X,Y,r*.45,0,7);cx.fill();cx.strokeStyle='#000';cx.lineWidth=.6;cx.beginPath();cx.arc(X,Y,r*1.55,0,7);cx.stroke();
 if(Math.random()<.5)parts.push({x:p.x,y:p.y,vx:-p.vx*.1+(Math.random()-.5)*40,vy:(Math.random()-.5)*40,l:.3,c});L.push([X,Y,46])}
const _fx=drawFx;drawFx=function(ox,oy,lights){const pp=projs;projs=[];try{_fx(ox,oy,lights)}finally{projs=pp}for(const p of projs)drawProj(p,ox,oy,lights)};
// ---------- boss overlays ----------
function bossOver(B,k,p,ac,st){if(st==='dormant')return;const zc=B.def.zc||'255,120,40',t=time,w=B.w,h=B.h,p2=B.ph===2,bi=Math.max(0,ARENAS.findIndex(a=>a.id===B.id));
 AD(()=>{const g=cx.createRadialGradient(0,h*.5,h*.15,0,h*.5,h*1.05);g.addColorStop(0,'rgba('+zc+',0)');g.addColorStop(.7,'rgba('+zc+','+(.1+.06*Math.sin(t*3)+(p2?.12:0))+')');g.addColorStop(1,'rgba('+zc+',0)');cx.fillStyle=g;cx.fillRect(-w*1.3,-h*.6,w*2.6,h*2.3);
  if(st==='tele'||p>0)glow(0,h*.45,h*.8*Math.min(1,p+.2),'rgba(255,255,255,'+(.1+.3*p)+')')});
 const cc=['#ff8a2a','#aee8ff','#ffe84a','#c890ff'][bi%4];
 for(let i=-2;i<=2;i++){const x=i*w*.2,hh=10+(2-Math.abs(i))*5+(p2?5:0)+Math.sin(t*6+i)*(bi===0?3:1);if(bi===0)flame(x,-1,8,hh+8,i,['#c8300e','#ff8a1a','#ffe08a']);else PL([x-3,0,x,-hh,x+3,0],cc),PL([x-1,0,x,-hh,x+1,0],'#fff9')}
 AD(()=>{glow(0,-10,22,ca(cc,'66'))});
 for(let i=0;i<6;i++){const a=t*(p2?1.6:.9)+i*1.047,x=Math.cos(a)*w*.78,y=h*.5+Math.sin(a)*h*.4,z=Math.sin(a)>0;if(z||true){AD(()=>{PL([x,y-4,x+2.4,y,x,y+4,x-2.4,y],cc);glow(x,y,10,ca(cc,'88'))})}}
 AD(()=>{for(let i=0;i<14;i++){const lf=((t*(bi===1?.35:.6)+i*.0713*7)%1),xx=(Math.sin(i*12.9)*w*.7),yy=bi===1?-6+lf*(h+14):h-lf*(h+30);const a=Math.sin(lf*Math.PI);cx.fillStyle=bi===3?'rgba(200,140,255,'+a+')':bi===1?'rgba(235,250,255,'+a+')':bi===2?'rgba(255,250,150,'+a+')':'rgba(255,'+(120+i*8)+',40,'+a+')';cx.fillRect(xx+Math.sin(t*3+i)*4,yy,2,2)}});
 if(bi===2&&Math.random()<(p2?.18:.08)){cx.strokeStyle='#fff';cx.lineWidth=1.2;cx.beginPath();let x=(Math.random()-.5)*w,y=-4;cx.moveTo(x,y);for(let i=0;i<5;i++){x+=(Math.random()-.5)*14;y+=h*.22;cx.lineTo(x,y)}cx.stroke()}
 if(p2){AD(()=>{cx.strokeStyle='rgba('+zc+','+(.4+.3*Math.sin(t*9))+')';cx.lineWidth=1.5;cx.strokeRect(-w/2-2,-2,w+4,h+4)})}
 AD(()=>{cx.save();cx.translate(0,h);cx.scale(1,.2);glow(0,0,w*1.1,'rgba('+zc+',.35)');cx.restore()})}
for(const k of Object.keys(BS)){const o=BS[k];BS[k]=function(B,p,ac,st){o(B,p,ac,st);bossOver(B,k,p,ac,st)}}

// ---------- boss attack sound fx (synthesized, layer-themed) ----------
const AC_=()=>{if(Audio_.mute)return null;try{Audio_.ac=Audio_.ac||new AudioContext();if(Audio_.ac.state==='suspended')Audio_.ac.resume();return Audio_.ac}catch(e){return null}};
function tone(f0,f1,d,type,v,dl){try{const a=AC_();if(!a)return;const t=a.currentTime+(dl||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sawtooth';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+d);g.gain.setValueAtTime(Math.max(.001,v),t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.03)}catch(e){}}
let NB=null;function noise(d,v,f0,f1,type,q,dl){try{const a=AC_();if(!a)return;if(!NB){NB=a.createBuffer(1,a.sampleRate,a.sampleRate);const c=NB.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=Math.random()*2-1}const t=a.currentTime+(dl||0),s=a.createBufferSource(),fl=a.createBiquadFilter(),g=a.createGain();s.buffer=NB;s.loop=true;fl.type=type||'bandpass';fl.Q.value=q||1;fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+d);g.gain.setValueAtTime(Math.max(.001,v),t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(fl);fl.connect(g);g.connect(a.destination);s.start(t);s.stop(t+d+.03)}catch(e){}}
const bIdx=B=>Math.max(0,ARENAS.findIndex(a=>a.id===B.id)),near=x=>clamp(1-Math.abs(x-(P.x+6))/800,.15,1);
const BSND={
 charge(B,v){const i=bIdx(B),b=[70,520,160,90][i];tone(b,b*(i===1?2:4),.7,['sawtooth','sine','square','sawtooth'][i],.07*v);noise(.7,.09*v,i===1?3000:300,i===1?7000:2400,i===2?'highpass':'bandpass',2);if(i===3)tone(b*1.5,b*5.2,.7,'sine',.05*v)},
 slam(B,v){tone(150,34,.55,'sine',.28*v);noise(.55,.24*v,900,60,'lowpass');tone(70,25,.8,'sawtooth',.12*v,.03)},
 sweep(B,v){noise(.32,.22*v,300,2800,'bandpass',2);tone(320,110,.28,'sawtooth',.08*v)},
 dash(B,v){noise(.55,.22*v,400,3600,'bandpass',1.5);tone(180,640,.45,'sawtooth',.09*v)},
 shoot(B,v){for(let k=0;k<3;k++)tone(1000-k*60,220,.16,'square',.07*v,k*.045);noise(.2,.07*v,3000,800,'highpass')},
 nova(B,v){tone(260,30,.8,'sawtooth',.2*v);noise(.7,.22*v,2500,150,'bandpass');[520,780,1040].forEach((f,i)=>tone(f,f*1.5,.5,'sine',.06*v,i*.05))},
 spiral(v){tone(1300,650,.06,'triangle',.045*v)},
 rumble(B,v){noise(1,.2*v,220,50,'lowpass',1);tone(60,35,1,'sawtooth',.1*v)},
 tele(B,v){tone(1100,160,.3,'sine',.12*v);noise(.3,.15*v,5000,400,'highpass')},
 clones(B,v){[220,277,330,415].forEach((f,i)=>tone(f*(1+i*.012),f*.5,1,'sawtooth',.06*v,i*.06));noise(.8,.1*v,800,3000,'bandpass',3)},
 zap(v){noise(.22,.24*v,5000,700,'highpass');tone(2200,180,.14,'square',.09*v);tone(90,40,.2,'sawtooth',.1*v,.02)},
 ice(v){noise(.3,.2*v,7000,1800,'highpass',3);[2600,3400,4200].forEach((f,i)=>tone(f,f*.6,.25,'triangle',.05*v,i*.03));tone(120,50,.25,'sine',.14*v)},
 fire(v){tone(110,40,.4,'sine',.22*v);noise(.45,.22*v,1800,200,'lowpass');noise(.3,.1*v,6000,2000,'highpass',1,.05)},
 thud(v){tone(120,38,.35,'sine',.2*v);noise(.3,.14*v,700,80,'lowpass')}};
BSND.pillars=BSND.icicles=BSND.wall=BSND.rumble;BSND.bolts=BSND.chain=(B,v)=>{noise(.5,.1*v,1500,300,'bandpass');tone(70,45,.5,'sawtooth',.07*v)};
let plast=0;const _ub=updBoss;updBoss=function(B,dt){const st=B.st,land=B.land,hit=B.hit,pl=projs.length;_ub(B,dt);if(B.dead||!P)return;const v=near(B.x+B.w/2);
 if(B.st!==st){if(B.st==='tele')BSND.charge(B,v);else if(B.st==='act'&&st==='tele'){const f=BSND[B.atk];if(f&&B.atk!=='spiral'&&B.atk!=='slam'&&B.atk!=='sweep')f(B,v)}else if(B.st==='broken')tone(900,200,.4,'triangle',.12*v)}
 if(land&&!B.land&&B.atk==='slam')BSND.slam(B,v);if(B.atk==='sweep'&&!hit&&B.hit)BSND.sweep(B,v);
 if(projs.length>pl&&B.atk==='spiral'&&time-plast>.08){plast=time;BSND.spiral(v)}};
let zlast=-9;function zoneSnd(z){if(time-zlast<.05||Math.abs(z.x-(P.x+6))>600)return;zlast=time;const v=near(z.x)*.9;
 if(z.col==='150,220,255')BSND.ice(v);else if(z.col==='255,255,120')BSND.zap(v);else if(z.col==='255,120,20')BSND.fire(v);else BSND.thud(v)}

// ---------- boss arena doors: seal when the fight starts, reopen on victory or death ----------
let DOOR={sd:-1};
const doorX=a=>a.cx-a.hw-2;
function setDoor(a,closed){const x=doorX(a);for(let y=a.fy-4;y<=a.fy-1;y++)tiles[y*W+x]=closed?7:0}
const bossWake=a=>{const B=enemies.find(e=>e.boss&&e.id===a.id);return !!B&&!B.dead&&B.st!=='dormant'};
function syncDoors(dt){if(DOOR.sd!==seed)DOOR={sd:seed};
 for(const a of ARENAS){const d=DOOR[a.id]||(DOOR[a.id]={c:false,p:0}),w=bossWake(a),x=doorX(a);
  if(w!==d.c){d.c=w;if(w){const px=(x+1)*T;if(P.x<px)P.x=px+1;shake=Math.max(shake,9);toast('The arena doors seal behind you \u2014 there is no escape');
    tone(90,28,.7,'sawtooth',.25);noise(.7,.28,1400,70,'lowpass');tone(1600,400,.25,'triangle',.07,.35);noise(.4,.12,5000,1500,'highpass',2,.3)}
   else{toast(bossDead[a.id]?'The arena doors grind open \u2014 victory!':'The arena doors grind open');tone(55,35,1,'sawtooth',.14);noise(.9,.16,500,90,'lowpass')}}
  if((tiles[(a.fy-2)*W+x]===7)!==d.c)setDoor(a,d.c);
  d.p=clamp(d.p+(d.c?1:-1)*dt*2.2,0,1)}}
function drawDoors(ox,oy,L){for(const a of ARENAS){const d=DOOR[a.id];if(!d||d.p<=0)continue;const X=Math.round(doorX(a)*T-ox),Y=Math.round((a.fy-4)*T-oy),hh=4*T,p=d.p<1?1-Math.pow(1-d.p,3):1,h=Math.round(hh*p),zc=BD[a.id].zc,t=time;
  if(X<-40||X>cv.width+40||Y<-100||Y>cv.height+100)continue;
  FR(X-2,Y-3,T+4,hh+3,'#0c0a12');FR(X,Y,T,h,'#1c1a26');
  for(let i=0;i<4;i++){const bx=X+1+i*4;FR(bx,Y,3,h,'#4a4a5c');FR(bx,Y,1,h,'#8a8aa0');FR(bx+2,Y,1,h,'#2a2a38');PL([bx,Y+h,bx+1.5,Y+h+4,bx+3,Y+h],'#9a9ab0')}
  for(const k of[.2,.55,.85])if(h>hh*k)FR(X-1,Y+Math.round(hh*k),T+2,3,'#2e2e3e'),FR(X-1,Y+Math.round(hh*k),T+2,1,'#7a7a90');
  FR(X-3,Y-5,T+6,5,'#3a3548');FR(X-3,Y-5,T+6,1,'#8a82a8');
  if(p>=1){const pu=.5+.5*Math.sin(t*4);AD(()=>{glow(X+8,Y+hh*.5,26+pu*8,'rgba('+zc+','+(.35+.2*pu)+')');cx.strokeStyle='rgba('+zc+','+(.6+.3*pu)+')';cx.lineWidth=1.2;cx.beginPath();cx.arc(X+8,Y+hh*.5,6,0,7);cx.stroke();cx.beginPath();cx.moveTo(X+8,Y+hh*.5-5);cx.lineTo(X+8,Y+hh*.5+5);cx.moveTo(X+3,Y+hh*.5);cx.lineTo(X+13,Y+hh*.5);cx.stroke()});L.push([X+8,Y+hh*.5,60])}}}
const _dgt=drawGates;drawGates=function(ox,oy,L){_dgt(ox,oy,L);drawDoors(ox,oy,L)};
// ---------- campfire safe zone ----------
const SAFE_R=205,inSafe=()=>!!(P&&spawn&&Math.abs(P.x+6-(spawn.x+6))<SAFE_R&&Math.abs(P.y-spawn.y)<120),campX=()=>spawn.x+6-52;
let wasSafe=false;
const _uf=updFx;updFx=function(dt){projs=projs.filter(p=>!(Math.abs(p.x-(spawn.x+6))<SAFE_R+10&&Math.abs(p.y-spawn.y)<160));if(P&&!P.dead)syncDoors(dt);const zw=zones.filter(z=>z.t>0);_uf(dt);for(const z of zw)if(z.t<=0)zoneSnd(z);if(!P||P.dead)return;const s=inSafe();
 if(s&&!wasSafe)toast('\u2740 Safe Zone \u2014 rest by the campfire');wasSafe=s;
 if(s){const near=Math.abs(P.x+6-campX())<80,hl=(near?11:4)*dt;P.hp=Math.min(maxHp(),P.hp+hl);P.stam=Math.min(maxStam(),P.stam+(near?30:12)*dt);P.post=Math.max(0,P.post-20*dt);P.ecd=Math.max(0,(P.ecd||0)-(near?3:1)*dt);
  if(P.hp<maxHp()&&Math.random()<(near?.35:.1))parts.push({x:P.x+Math.random()*12,y:P.y+20,vx:(Math.random()-.5)*10,vy:-40,l:.7,c:'#8f8'})}};
const _ue2=updE2;updE2=function(e,dt){if(!e.dead&&spawn&&Math.abs(e.x+7-(spawn.x+6))<SAFE_R+14&&Math.abs(e.y-spawn.y)<170){e.st='idle';e.vx=0;const nx=e.x+(e.x+7<spawn.x+6?-1:1)*150*dt;if(!boxSolid(nx,e.y,e.w,e.h))e.x=nx;return}_ue2(e,dt)};
const _ue=updEnemy;updEnemy=function(e,dt){if(!e.dead&&spawn&&Math.abs(e.x+7-(spawn.x+6))<SAFE_R+14&&Math.abs(e.y-spawn.y)<170){e.st='idle';e.vx=0;const nx=e.x+(e.x+7<spawn.x+6?-1:1)*150*dt;if(!boxSolid(nx,e.y,e.w,e.h))e.x=nx;return}_ue(e,dt)};
function drawCamp(ox,oy,L){if(!SPC||!spawn)return;const w=cv.width,fx=Math.round(campX()-ox),gy=Math.round(SPC.gy-oy),t=time;if(fx<-260||fx>w+260||gy<-200||gy>cv.height+160)return;
 // ward curtains marking the safe zone
 for(const s of[-1,1]){const x=Math.round(spawn.x+6+s*SAFE_R-ox);AD(()=>{const g=cx.createLinearGradient(0,gy-150,0,gy);g.addColorStop(0,'rgba(120,255,160,0)');g.addColorStop(1,'rgba(120,255,160,'+(.2+.1*Math.sin(t*2+s))+')');cx.fillStyle=g;cx.fillRect(x-3,gy-150,6,150);for(let i=0;i<5;i++){cx.fillStyle='rgba(200,255,220,'+(.3+.4*Math.sin(t*2+i))+')';cx.fillRect(x-1,gy-12-i*28-(t*8%28),2,6)}});FR(x-4,gy-6,8,6,'#3a3548');FR(x-3,gy-8,6,3,'#5a5478')}
 // cooking tripod + pot
 for(const[a,b]of[[-16,-6],[16,-6],[0,12]])PL([fx+a*.15-1,gy-30,fx+a*.15+1,gy-30,fx+a+2,gy-2,fx+a-1,gy-2],'#4a3018');FR(fx-2,gy-31,4,3,'#2a2430');
 // logs & stones
 FR(fx-44,gy-7,18,7,'#4a3018');FR(fx-44,gy-7,18,2,'#6a4a28');cx.fillStyle='#2a1a10';cx.beginPath();cx.ellipse(fx-26,gy-3.5,2,3.5,0,0,7);cx.fill();FR(fx-62,gy-5,10,5,'#7a2a2a');FR(fx-62,gy-5,10,1.5,'#a84040');FR(fx-52,gy-4,4,3,'#d8d0b8');
 for(let i=0;i<9;i++){const a=i/9*6.283,sx=fx+Math.cos(a)*15,sy=gy-1+Math.sin(a)*4.5;FR(sx-2.5,sy-2.5,5,4,i%2?'#5a566a':'#6a667a');FR(sx-2.5,sy-2.5,5,1.2,'#8a86a0');AD(()=>FR(sx-1,sy-1,2,1.5,'rgba(255,140,50,'+(.3+.3*Math.sin(t*5+i))+')'))}
 PL([fx-14,gy-3,fx-12,gy-6,fx+13,gy-1,fx+11,gy+1],'#3a2412');PL([fx+14,gy-3,fx+12,gy-6,fx-13,gy-1,fx-11,gy+1],'#4a2e18');AD(()=>{FR(fx-14,gy-4,4,2,'rgba(255,100,20,.8)');FR(fx+10,gy-4,4,2,'rgba(255,100,20,.8)')});
 PL([fx-9,gy-30,fx+9,gy-30,fx+7,gy-18,fx-7,gy-18],'#2a2430');FR(fx-10,gy-32,20,3,'#5a5468');FR(fx-7,gy-30,14,1,'#2a6a4a');
 // fire
 const fl=Math.sin(t*9)*3;flame(fx,gy-4,20,34+fl,0);flame(fx-6,gy-4,11,22-fl,1,['#d8500e','#ffb02a','#fff0a0']);flame(fx+6,gy-4,11,24+fl,2,['#d8500e','#ffb02a','#fff0a0']);
 AD(()=>{glow(fx,gy-12,95,'rgba(255,150,50,'+(.45+.1*Math.sin(t*13))+')');glow(fx,gy-2,40,'rgba(255,220,120,.4)');cx.save();cx.translate(fx,gy);cx.scale(1,.22);glow(0,0,130,'rgba(255,140,40,.4)');cx.restore();
  for(let i=0;i<14;i++){const lf=((t*.8+i*.137)%1),x=fx+Math.sin(i*5.3+t*2)*10*lf,y=gy-8-lf*70;cx.fillStyle='rgba(255,'+(160+i*6)+',70,'+(1-lf)+')';cx.fillRect(x,y,1.6,1.6)}});
 for(let i=0;i<5;i++){const lf=((t*.25+i*.2)%1),x=fx+Math.sin(i*2+t)*8+lf*12,y=gy-36-lf*60;cx.fillStyle='rgba(120,116,130,'+.28*(1-lf)+')';cx.beginPath();cx.arc(x,y,3+lf*8,0,7);cx.fill()}
 L.push([fx,gy-14,250]);
 cx.save();cx.textAlign='center';cx.shadowColor='#2f8';cx.shadowBlur=6;cx.fillStyle='#bfffd0';cx.font='bold 8px Georgia';cx.globalAlpha=.55+.35*Math.sin(t*2);cx.fillText('\u2740 SAFE ZONE \u00b7 HEARTHFIRE',fx,gy-72);cx.restore()}
const _dsp=drawSpawn;drawSpawn=function(ox,oy,L){_dsp(ox,oy,L);drawCamp(ox,oy,L)};
// ---------- customizer UI ----------
const OPTS=[['skin','Skin','sw',LO.skin],['hair','Hairstyle','ar',LO.hair],['hairC','Hair colour','sw',LO.hairC],['beard','Beard','ar',LO.beard],['eyes','Eyes','sw',LO.eyes],['face','Face mark','ar',LO.face],['build','Build','ar',LO.build],['tunic','Tunic','sw',LO.cloth],['cape','Cape','ar',LO.cape],['capeC','Cape colour','sw',LO.cloth],['aura','Aura','ar',LO.aura.map(a=>a.n)]];
let pvSet=-1,pvF=1,czOn=false;
function pvDraw(c,sc,f){const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,c.width,c.height);const au=LO.aura[LOOK.aura],t=performance.now()/1000;
 g.save();g.scale(sc,sc);g.translate(((c.width/sc)-12)/2,((c.height/sc)-22)/2+Math.sin(t*2)*.3);
 if(au.c){const gr=g.createRadialGradient(6,11,2,6,11,22);gr.addColorStop(0,'rgba('+au.c[0]+',.35)');gr.addColorStop(1,'rgba('+au.c[0]+',0)');g.fillStyle=gr;g.fillRect(-20,-20,52,62);for(let i=0;i<10;i++){const lf=((t*.5+i*.1)%1);g.fillStyle='rgba('+au.c[i%2]+','+(1-lf)+')';g.fillRect(2+Math.sin(i*7+t)*9+4,20-lf*26,.8,.8)}}
 g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(6,22.3,8,1.5,0,0,7);g.fill();
 const A={helm:pvSet,chest:pvSet,hands:pvSet,legs:pvSet};drawHero(g,LOOK,A,{f,lg:0,sw:Math.sin(t*2)*1.5+1,t,eqHead:false});
 const sx=f>0?9:3;g.save();g.translate(sx,14);g.rotate(f>0?-.9:Math.PI+.9);g.fillStyle='#3a2418';g.fillRect(-1,-.8,5,1.6);g.fillStyle='#d9a441';g.fillRect(4,-3,1.6,6);g.fillStyle='#e8f0ff';g.beginPath();g.moveTo(5.6,-1.4);g.lineTo(18,-1);g.lineTo(23,0);g.lineTo(18,1);g.lineTo(5.6,1.4);g.fill();g.fillStyle='#fff';g.fillRect(6,-.3,13,.6);g.restore();g.restore()}
let menuT=0;const mh=document.getElementById('menuHero');
(function loop(){requestAnimationFrame(loop);const m=document.getElementById('menu');if(mh&&!m.classList.contains('hidden')){pvF=Math.sin(performance.now()/2600)>0?1:-1;pvDraw(mh,5,pvF)}const cz=document.getElementById('czCv');if(cz&&czOn)pvDraw(cz,9,pvF)})();
function drawCust(){czOn=true;const rows=OPTS.map(([k,n,ty,list])=>{if(ty==='sw')return`<div class="opt"><b>${n}</b><div class="dots">${list.map((c,i)=>`<i data-k="${k}" data-i="${i}" class="${LOOK[k]===i?'on':''}" style="background:${c}"></i>`).join('')}</div></div>`;
  return`<div class="opt"><b>${n}</b><button data-k="${k}" data-d="-1">\u25c0</button><span class="v">${list[LOOK[k]]}</span><button data-k="${k}" data-d="1">\u25b6</button></div>`}).join('');
 sheet.innerHTML=`<h1>CHARACTER</h1><h2>Shape your wanderer</h2><div class="cz"><div><canvas id="czCv" width="210" height="260"></canvas><div style="margin-top:8px;text-align:center"><button id="czTurn">\u21c4 Turn</button><button id="czArm">Armor: ${pvSet<0?'None':ASET[pvSet].n}</button></div></div><div>${rows}</div></div><br><button id="czRnd">\u2684 Randomize</button><button id="czRst">Reset</button><button id="czDone">Done</button>`;
 sheet.querySelectorAll('i[data-k]').forEach(b=>b.onclick=()=>{LOOK[b.dataset.k]=+b.dataset.i;saveLook();drawCust()});
 sheet.querySelectorAll('button[data-k]').forEach(b=>b.onclick=()=>{const o=OPTS.find(x=>x[0]===b.dataset.k),n=o[3].length;LOOK[o[0]]=(LOOK[o[0]]+ +b.dataset.d+n)%n;saveLook();drawCust()});
 $m('czTurn').onclick=()=>{pvF=-pvF};$m('czArm').onclick=()=>{pvSet=pvSet>=ASET.length-1?-1:pvSet+1;drawCust()};
 $m('czRnd').onclick=()=>{for(const[k,,,l]of OPTS)LOOK[k]=Math.random()*l.length|0;saveLook();drawCust()};$m('czRst').onclick=()=>{LOOK=Object.assign({},LDEF);saveLook();drawCust()};
 $m('czDone').onclick=()=>{czOn=false;sheet.classList.add('hidden');$m('menu').classList.remove('hidden')}}
$m('btnLook').onclick=()=>{$m('menu').classList.add('hidden');sheet.classList.remove('hidden');drawCust()};
