// smegmacord: servidor sem dependências (só Node 18+). Chat, presença e sinalização das calls.
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000,DB=path.join(__dirname,'data.json'),CH=['geral','memes','jogos','papo-livre'];
let msgs={};try{msgs=JSON.parse(fs.readFileSync(DB,'utf8'))}catch(e){}
let t=null;const save=()=>{clearTimeout(t);t=setTimeout(()=>fs.writeFile(DB,JSON.stringify(msgs),()=>{}),1000)};
const clients=new Map();
const send=(c,o)=>{try{c.res.write('data: '+JSON.stringify(o)+'\n\n')}catch(e){}};
const peersOf=r=>{const a=[];for(const [id,c] of clients)if(c.rooms.has(r))a.push({peer:id,presence:c.pres[r]||{}});return a};
const bc=r=>{const p=peersOf(r);for(const c of clients.values())if(c.rooms.has(r))send(c,{t:'peers',room:r,peers:p})};
const snap=ch=>(msgs[ch]||[]).slice(-80).reverse();
const ok=s=>typeof s==='string'&&/^[a-z0-9][a-z0-9_.-]{0,47}$/.test(s);
function api(j,c,id){const r=j.room;
 switch(j.op){
 case 'join':if(ok(r)){c.rooms.add(r);bc(r)}break;
 case 'leave':if(r&&c.rooms.delete(r)){delete c.pres[r];bc(r)}break;
 case 'presence':if(c.rooms.has(r)&&j.patch&&typeof j.patch==='object'){const p=c.pres[r]=c.pres[r]||{};
  for(const k in j.patch){if(!/^[A-Za-z_]\w{0,31}$/.test(k))continue;const v=j.patch[k];
   if(v===null)delete p[k];else if(typeof v==='string')p[k]=v.slice(0,40);else if(typeof v==='number'||typeof v==='boolean')p[k]=v}
  bc(r)}break;
 case 'emit':if(c.rooms.has(r)&&ok(j.topic)){const o={t:'msg',room:r,topic:j.topic,data:j.data,from:id};
  for(const [i,x] of clients)if(i!==id&&x.rooms.has(r))send(x,o)}break;
 case 'sub':if(CH.includes(j.channel)){c.sub=j.channel;send(c,{t:'chat',channel:j.channel,docs:snap(j.channel)})}break;
 case 'add':if(CH.includes(j.channel)&&j.doc){const d={name:String(j.doc.name||'?').slice(0,20),text:String(j.doc.text||'').slice(0,2000),ts:Date.now()};
  if(!d.text.trim())break;const a=msgs[j.channel]=msgs[j.channel]||[];a.push(d);if(a.length>300)a.splice(0,a.length-300);save();
  for(const x of clients.values())if(x.sub===j.channel)send(x,{t:'chat',channel:j.channel,docs:snap(j.channel)})}break;
 default:throw new Error('op')}}
http.createServer((req,res)=>{const u=new URL(req.url,'http://x');
 if(u.pathname==='/events'){const id=(u.searchParams.get('peer')||'').slice(0,24);
  if(!/^[a-z0-9]+$/.test(id)){res.writeHead(400);return res.end()}
  res.writeHead(200,{'content-type':'text/event-stream','cache-control':'no-cache','x-accel-buffering':'no'});res.write(':ok\n\n');
  const c={res,rooms:new Set(['']),pres:{},sub:null};clients.set(id,c);bc('');
  const ping=setInterval(()=>res.write(':\n\n'),20000);
  req.on('close',()=>{clearInterval(ping);if(clients.get(id)===c)clients.delete(id);for(const r of c.rooms)bc(r)});return}
 if(u.pathname==='/api'&&req.method==='POST'){let b='';
  req.on('data',d=>{b+=d;if(b.length>16000)req.destroy()});
  req.on('end',()=>{let j;try{j=JSON.parse(b)}catch(e){res.writeHead(400);return res.end()}
   const c=clients.get(j.peer);if(!c){res.writeHead(409);return res.end()}
   try{api(j,c,j.peer)}catch(e){res.writeHead(400);return res.end()}res.writeHead(200);res.end('ok')});return}
 if(u.pathname==='/'){fs.readFile(path.join(__dirname,'public','index.html'),(e,d)=>{
  if(e){res.writeHead(500);return res.end()}res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(d)});return}
 const T={'/manifest.webmanifest':'application/manifest+json','/icon-192.png':'image/png','/icon-512.png':'image/png','/sw.js':'text/javascript'};
 if(T[u.pathname]){fs.readFile(path.join(__dirname,'public',u.pathname),(e,d)=>{if(e){res.writeHead(404);return res.end()}res.writeHead(200,{'content-type':T[u.pathname]});res.end(d)});return}
 res.writeHead(404);res.end()}).listen(PORT,()=>console.log('smegmacord em http://localhost:'+PORT));
