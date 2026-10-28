// Ashfall Depths account server — no dependencies. Run: node server.js
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,ROOT=__dirname,DBF=path.join(ROOT,'accounts.json');
let db={users:{},tokens:{}};try{db=JSON.parse(fs.readFileSync(DBF,'utf8'))}catch(e){}
let wt=null;
const persist=()=>{clearTimeout(wt);wt=setTimeout(()=>fs.writeFile(DBF+'.tmp',JSON.stringify(db),e=>{if(!e)fs.rename(DBF+'.tmp',DBF,()=>{})}),200)};
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
const hashPw=(pw,salt)=>crypto.scryptSync(pw,salt,64).toString('hex');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.json':'application/json'};
const fails={};
const limited=ip=>{const f=(fails[ip]||[]).filter(t=>Date.now()-t<6e5);fails[ip]=f;return f.length>=10};
const send=(res,c,o)=>{res.writeHead(c,{'Content-Type':'application/json'});res.end(JSON.stringify(o))};
const body=req=>new Promise((ok,no)=>{let b='',n=0;req.on('data',d=>{n+=d.length;if(n>2e6){no(new Error('big'));req.destroy()}else b+=d});req.on('end',()=>{try{ok(JSON.parse(b||'{}'))}catch(e){no(e)}});req.on('error',no)});
const userOf=req=>{const m=/^Bearer (\w+)$/.exec(req.headers.authorization||'');const t=m&&db.tokens[sha(m[1])];return t&&db.users[t]?t:null};
const newToken=u=>{const t=crypto.randomBytes(32).toString('hex');db.tokens[sha(t)]=u;return t};
const okName=u=>typeof u==='string'&&/^[a-z0-9_]{3,20}$/.test(u);
const okData=d=>d&&typeof d==='object'&&!Array.isArray(d)&&Object.keys(d).every(k=>k.startsWith('ashfall_')&&typeof d[k]==='string');

async function api(req,res,url){
  const ip=req.socket.remoteAddress;
  try{
    if(req.method==='POST'&&url==='/api/register'){
      const{username,password,data}=await body(req);const u=String(username||'').toLowerCase();
      if(!okName(u))return send(res,400,{error:'Username must be 3-20 letters, numbers or _'});
      if(typeof password!=='string'||password.length<6||password.length>64)return send(res,400,{error:'Password must be 6-64 characters'});
      if(db.users[u])return send(res,409,{error:'That username is taken'});
      const salt=crypto.randomBytes(16).toString('hex');
      db.users[u]={salt,hash:hashPw(password,salt),data:okData(data)?data:{},updated:Date.now()};
      const token=newToken(u);persist();return send(res,200,{token,username:u,data:db.users[u].data});
    }
    if(req.method==='POST'&&url==='/api/login'){
      if(limited(ip))return send(res,429,{error:'Too many attempts — try again in a few minutes'});
      const{username,password}=await body(req);const u=String(username||'').toLowerCase(),r=db.users[u];
      let good=false;
      if(r&&typeof password==='string'&&password.length<=64){const a=Buffer.from(hashPw(password,r.salt),'hex'),b=Buffer.from(r.hash,'hex');good=crypto.timingSafeEqual(a,b)}
      else hashPw('x','y'); // keep timing similar
      if(!good){(fails[ip]=fails[ip]||[]).push(Date.now());return send(res,401,{error:'Wrong username or password'})}
      const token=newToken(u);persist();return send(res,200,{token,username:u,data:r.data});
    }
    if(url==='/api/save'){
      const u=userOf(req);if(!u)return send(res,401,{error:'Session expired'});
      if(req.method==='GET')return send(res,200,{username:u,data:db.users[u].data});
      if(req.method==='PUT'){const{data}=await body(req);if(!okData(data))return send(res,400,{error:'Bad data'});db.users[u].data=data;db.users[u].updated=Date.now();persist();return send(res,200,{ok:1})}
    }
    if(req.method==='POST'&&url==='/api/logout'){const m=/^Bearer (\w+)$/.exec(req.headers.authorization||'');if(m){delete db.tokens[sha(m[1])];persist()}return send(res,200,{ok:1})}
    send(res,404,{error:'Not found'});
  }catch(e){send(res,400,{error:'Bad request'})}
}

http.createServer((req,res)=>{
  const url=decodeURIComponent(req.url.split('?')[0]);
  if(url.startsWith('/api/'))return api(req,res,url);
  let f=path.normalize(path.join(ROOT,url==='/'?'index.html':url));
  const base=path.basename(f);
  if(!f.startsWith(ROOT+path.sep)||base==='server.js'||base.startsWith('accounts.json')||!MIME[path.extname(f)]){res.writeHead(404);return res.end('Not found')}
  fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)],'Cache-Control':'no-cache'});res.end(d)});
}).listen(PORT,()=>console.log('Ashfall Depths running at http://localhost:'+PORT));