const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export function handle(request,now){
const url=new URL(request.url);
if(request.method!=='GET'&&request.method!=='HEAD')return new Response('Method not allowed',{status:405});
if(url.pathname==='/api/state')return json({serverNow:now,releases:RELEASES,games:GAMES.filter(g=>now>=Date.parse(RELEASES[g.day-1])).map(({steps,build,skills,...metadata})=>metadata)});
if(url.pathname.startsWith('/api/games/')){const g=GAMES.find(g=>'/api/games/'+g.id===url.pathname);if(!g)return json({error:'Игра не найдена'},404);if(now<Date.parse(RELEASES[g.day-1]))return json({error:'Эта игра ещё не открылась. Дождитесь 13:00 МСК в день открытия.',opensAt:RELEASES[g.day-1]},403);return json(g);}
if(url.pathname.startsWith('/assets/')){const data=ASSETS[url.pathname];if(!data)return new Response('Not found',{status:404});const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));return new Response(bytes,{headers:{'Content-Type':'image/webp','Cache-Control':'public, max-age=86400'}});}
if(url.pathname==='/'||url.pathname==='/index.html')return new Response(PAGE,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
return new Response('Not found',{status:404});
}
export default {fetch(request){return handle(request,Date.now());}};
