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
 const upgradeOld=w=>{if(w&&w.kind==='frostbite'&&w.unique){w.kind='icescythe';w.name=WN.icescythe;w.dmg=Math.max(w.dmg|0,WK.icescythe.bd)}};
 const _ugi=setInterval(()=>{try{if(typeof inv!=='undefined'){inv.forEach(upgradeOld);if(P&&P.weapon)upgradeOld(P.weapon)}}catch(e){}},1500);

 // ---- Passives ----
 const lsPct=w=>.01+.0075*((w&&w.rar)|0);                      // Common 1% ... Legendary 4% of max HP per hit
 const PASS={
  sword:['Balanced','Each hit restores 2 stamina and calms 4 posture'],
  dagger:['Flurry','Hits within 1.5s of each other stack +8% damage (max 5 stacks, +32%)'],
  greatsword:['Cleave','Hits also strike nearby enemies for 40% damage'],
  spear:['Pierce','Thrusts pierce through every enemy in a line'],
  hammer:['Crushing','+50% posture damage'],
  scimitar:['Twin Strike','20% chance to strike again for 50% damage'],
  katana:['Precision','15% chance to crit (x2 damage)'],
  axe:['Sunder','+30% damage to enemies below 50% HP'],
  icescythe:['Shatter','Strikes chill and slow. Chilled foes take +25% damage; the 3rd chill SHATTERS them: 150% burst damage, 70% to nearby foes, bosses lose heavy posture.'],
  scythe:['Soul Harvest',w=>'Lifesteal: heal '+(Math.round(lsPct(w)*1000)/10)+'% of max HP per hit']};
 const passTxt=w=>{const p=w&&PASS[w.kind];if(!p)return'';return p[0]+': '+(typeof p[1]==='function'?p[1](w):p[1])};
 window.weaponPassive=passTxt;

 // extra damage that never kills Poke by itself (he is only finished by the Enuma Elish parry)
 const extra=(o,v)=>{if(o.tpoke)o.hp=Math.max(2,o.hp-v);else o.hp-=v};
 function proc(e,d){const k=P.weapon.kind,mx=e.x+(e.w||14)/2,my=e.y+(e.h||22)/2;
  if(k==='sword'){P.stam=Math.min(maxStam(),P.stam+2);P.post=Math.max(0,P.post-4);burst(P.x+6,P.y+4,2,'#9fe')}
  else if(k==='dagger'){P.dgS=(time-(P.dgT||-9)<1.5)?Math.min(5,(P.dgS||0)+1):1;P.dgT=time;if(P.dgS>1){extra(e,d*.08*(P.dgS-1));if(P.dgS>=3)float(e.x,e.y-26,'FLURRY x'+P.dgS,'#9ef');burst(mx,my,3+P.dgS,'#cfe')}}
  else if(k==='greatsword'){for(const o of enemies){if(o===e||o.dead||o.boss||o.tdummy||o.tpoke)continue;if(Math.hypot(o.x-e.x,o.y-e.y)<46){o.hp=Math.max(1,o.hp-d*.4);burst(o.x+7,o.y+8,5,'#fa6');float(o.x,o.y-10,'CLEAVE','#fa6')}}}
  else if(k==='hammer'){if(!e.tpoke&&!e.tdummy)e.post=(e.post||0)+14*WK.hammer.pd*.5;float(e.x,e.y-24,'CRUSH','#ccd');burst(mx,my,4,'#bbb')}
  else if(k==='scimitar'){if(Math.random()<.2){extra(e,d*.5);float(e.x,e.y-24,'TWIN','#fd8');burst(mx,my,6,'#fd8')}}
  else if(k==='katana'){if(Math.random()<.15){extra(e,d);float(e.x,e.y-24,'CRIT x2','#ffb347');burst(mx,my,8,'#fff')}}
  else if(k==='axe'){if(e.hp>0&&e.hp<e.max*.5){extra(e,d*.3);float(e.x,e.y-24,'SUNDER','#f88')}}
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

 // ---- show passives on the HUD and the character sheet ----
 const _hud7=hud;hud=function(){_hud7();const w=document.getElementById('hWpn');if(w&&P&&P.weapon){const p=PASS[P.weapon.kind];if(p&&w.textContent.indexOf('✦ '+p[0])<0)w.textContent+=' · ✦ '+p[0]}};
 const _ds7=drawSheet;
 drawSheet=function(){_ds7();const hrs=sheet.querySelectorAll('hr');
  if(hrs[2]&&P&&P.weapon)hrs[2].insertAdjacentHTML('beforebegin','<div style="color:#9fe;font-size:12px;margin-top:6px">✦ '+passTxt(P.weapon)+'</div>');
  sheet.querySelectorAll('[data-e]').forEach(b=>{const it=inv[+b.dataset.e],row=b.closest('.row');if(it&&row&&row.firstElementChild)row.firstElementChild.insertAdjacentHTML('beforeend','<br><small style="color:#9fe">✦ '+passTxt(it)+'</small>')})};
})();