// Account layer: logs in, mirrors every "ashfall_*" localStorage key to the server, then starts the game.
(()=>{
const PFX='ashfall_',TK='af_token',UK='af_user';
const LS=localStorage,_set=Storage.prototype.setItem,_rem=Storage.prototype.removeItem;
const $=id=>document.getElementById(id);
const gameKeys=()=>{const a=[];for(let i=0;i<LS.length;i++){const k=LS.key(i);if(k&&k.startsWith(PFX))a.push(k)}return a};
const snapshot=()=>{const o={};gameKeys().forEach(k=>o[k]=LS.getItem(k));return o};
const clearGame=()=>gameKeys().forEach(k=>_rem.call(LS,k));
const applyData=d=>{clearGame();Object.keys(d||{}).forEach(k=>{if(k.startsWith(PFX))_set.call(LS,k,d[k])})};
let token=LS.getItem(TK),mode='login',dirty=false,timer=null,inflight=false,syncing=false;

const api=async(method,url,obj,keep)=>{
  const r=await fetch(url,{method,keepalive:!!keep,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:obj?JSON.stringify(obj):undefined});
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok){const e=new Error(j.error||'Server error');e.status=r.status;throw e}return j;
};
const status=(t,c)=>{const s=$('acSt');s.textContent=t;s.className=c||''};

async function push(keep){
  if(!syncing||!token||!dirty||inflight)return;
  dirty=false;inflight=true;status('saving…','busy');
  try{await api('PUT','/api/save',{data:snapshot()},keep);status('✓ saved')}
  catch(e){dirty=true;if(e.status===401){status('session expired','err');token=null;_rem.call(LS,TK)}else status('offline — retrying','err');setTimeout(()=>push(),8000)}
  inflight=false;if(dirty&&!timer)queue();
}
function queue(){dirty=true;if(!syncing)return;clearTimeout(timer);timer=setTimeout(()=>{timer=null;push()},1500)}
Storage.prototype.setItem=function(k,v){_set.call(this,k,v);if(this===LS&&String(k).startsWith(PFX))queue()};
Storage.prototype.removeItem=function(k){_rem.call(this,k);if(this===LS&&String(k).startsWith(PFX))queue()};
addEventListener('pagehide',()=>{clearTimeout(timer);timer=null;push(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);timer=null;push(true)}});

function loadGame(){
  const files=['game.js','extras.js','patch.js','patch2.js','patch3.js','patch4.js','patch5.js'];
  let i=0;(function next(){if(i>=files.length)return;const s=document.createElement('script');s.src=files[i++];s.onload=next;s.onerror=()=>{$('auErr').textContent='Failed to load '+s.src;$('auth').classList.remove('hidden')};document.body.appendChild(s)})();
}
function enter(name,data){
  const bak=snapshot();if(Object.keys(bak).length&&Object.keys(data||{}).length)try{_set.call(LS,'af_backup',JSON.stringify(bak))}catch(e){}
  applyData(data);syncing=true;dirty=false;
  $('auth').classList.add('hidden');$('acName').textContent='👤 '+name;$('acct').classList.remove('hidden');status('✓ saved');
  loadGame();
}
function showAuth(m,msg){
  mode=m||mode;const reg=mode==='register';$('auShow').checked=false;$('auPass').type='password';
  $('auTitle').textContent=reg?'Create your account':'Sign in to your account';
  $('auGo').textContent=reg?'Create Account':'Log In';
  $('auSwap').textContent=reg?'I already have an account':'Create a new account';
  $('auPass').autocomplete=reg?'new-password':'current-password';
  $('auImpW').classList.toggle('hidden',!(reg&&gameKeys().length));
  $('auErr').textContent=msg||'';$('auth').classList.remove('hidden');
}
async function submit(){
  const u=$('auUser').value.trim(),p=$('auPass').value;
  if(!u||!p)return showAuth(mode,'Enter a username and password');
  $('auGo').disabled=true;$('auErr').textContent='';
  try{
    const reg=mode==='register';
    const body={username:u,password:p};
    if(reg){if(p.length<6)throw new Error('Password must be at least 6 characters');if($('auImp').checked&&gameKeys().length)body.data=snapshot()}
    const r=await api('POST',reg?'/api/register':'/api/login',body);
    token=r.token;_set.call(LS,TK,token);_set.call(LS,UK,r.username);$('auPass').value='';$('auShow').checked=false;$('auPass').type='password';
    enter(r.username,r.data);
  }catch(e){$('auErr').textContent=e.status?e.message:'Cannot reach the server — is it running?'}
  $('auGo').disabled=false;
}
async function logout(){
  clearTimeout(timer);timer=null;await push();
  try{await api('POST','/api/logout')}catch(e){}
  clearGame();_rem.call(LS,TK);_rem.call(LS,UK);location.reload();
}
$('auShow').onchange=()=>{$('auPass').type=$('auShow').checked?'text':'password'};
$('auGo').onclick=submit;
$('auSwap').onclick=()=>showAuth(mode==='login'?'register':'login');
$('auPass').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')submit()});
$('auUser').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$('auPass').focus()});
['keyup','keypress'].forEach(t=>{$('auUser').addEventListener(t,e=>e.stopPropagation());$('auPass').addEventListener(t,e=>e.stopPropagation())});
$('acOut').onclick=()=>{if(confirm('Log out? Your progress is saved to your account.'))logout()};

(async()=>{
  if(token){
    try{const r=await api('GET','/api/save');enter(r.username,r.data);return}
    catch(e){if(e.status===401){token=null;_rem.call(LS,TK)}else{showAuth('login','Cannot reach the server — is it running?');return}}
  }
  showAuth('login');
})();
})();