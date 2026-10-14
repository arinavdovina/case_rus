import assert from 'node:assert/strict';
import {handle} from '../worker/index.js';
import worker from '../worker/index.js';
import {GAMES,RELEASES} from '../src/games.js';
const req=path=>new Request('https://workshop.test'+path);
for(let d=0;d<3;d++){
 const t=Date.parse(RELEASES[d]);
 for(const [clock,count] of [[t-1,d*3],[t,(d+1)*3]]){
  const r=handle(req('/api/state?day=3&now=9999999999999'),clock);assert.equal(r.headers.get('Cache-Control'),'no-store');
  const s=await r.json();assert.equal(s.games.length,count);
  for(const g of GAMES){const r=handle(req('/api/games/'+g.id+'?unlock=1'),clock);assert.equal(r.status,g.day<=count/3?200:403);}
 }
 assert.equal(new Date(t).getUTCHours(),10);
}
const html=await handle(req('/'),Date.parse(RELEASES[0])-1).text();for(const g of GAMES)assert.ok(!html.includes(g.steps[0].q),'future payload leaked in HTML');
assert.equal(GAMES.length,9);assert.equal(new Set(GAMES.map(g=>g.id)).size,9);
const types=new Set(['choice','multi','input','tokens','parts','order','table','reflect']);
for(const g of GAMES){assert.ok(g.steps.length>=5);for(const s of g.steps){assert.ok(types.has(s.type));assert.ok(s.q&&s.why);if(s.type==='choice')assert.ok(s.answer>=0&&s.answer<s.options.length);if(s.type==='multi')assert.ok(s.answer.every(a=>a>=0&&a<s.options.length));if(s.type==='parts')assert.equal(s.segments.length,s.answer.length);}}
assert.equal(handle(req('/api/games/unknown'),Date.now()).status,404);
assert.equal(handle(new Request('https://workshop.test/api/state',{method:'POST'}),Date.now()).status,405);
assert.equal(typeof worker.fetch,'function');
console.log('PASS: all 6 release boundaries, 54 direct game gates, no client answer leakage, 9 game schemas, request validation');
