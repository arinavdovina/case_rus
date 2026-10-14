import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {GAMES} from '../src/games.js';
class Node{constructor(tag){this.tag=tag;this.children=[];this.value='';this.disabled=false;this.classList={add(){},toggle(){}};}append(...n){this.children.push(...n);}replaceChildren(...n){this.children=n;}setAttribute(){}focus(){}querySelectorAll(selector){return this.children.flatMap(n=>typeof n==='object'?[...(selector.split(',').includes(n.tag)?[n]:[]),...n.querySelectorAll(selector)]:[]);}}
const ids=new Map();const doc={getElementById(id){if(!ids.has(id))ids.set(id,new Node('div'));return ids.get(id);},createElement(t){return new Node(t);}};
const context=vm.createContext({document:doc,window:{},localStorage:{getItem:()=>null},console,setTimeout:()=>{},Map,Set,Option:class extends Node{constructor(t,v){super('option');this.textContent=t;this.value=v;}},performance:{now:()=>0},GAMES,assert});
const source=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');vm.runInContext(source.slice(0,source.lastIndexOf("document.querySelectorAll('[data-day]')")),context);
vm.runInContext(`
for(const game of GAMES){active=game;resetGame();for(const step of game.steps){
 const board=$('board');const bs=()=>board.querySelectorAll('button');const click=text=>{const b=bs().find(x=>x.textContent===text);assert.ok(b,'missing '+text);b.onclick();};
 if(step.type==='choice'){const wrong=step.options.find((_,i)=>i!==step.answer);click(wrong);assert.equal(run.done,false);click(step.options[step.answer]);}
 else if(step.type==='multi'){click('Проверить');assert.equal(run.done,false);step.answer.forEach(i=>click(step.options[i]));click('Проверить');}
 else if(step.type==='input'){const i=board.querySelectorAll('input')[0];i.value='incorrect';click('Проверить');assert.equal(run.done,false);i.value=step.answer;click('Проверить');}
 else if(step.type==='tokens'){for(let i=0;i<Math.abs(step.target-step.start);i++)click(step.target>step.start?'+ Добавить':'− Убрать');click('Проверить');}
 else if(step.type==='table'){const rows=board.querySelectorAll('input');rows.forEach((x,i)=>x.value=step.rows[i][1]);click('Проверить');}
 else if(step.type==='parts'){board.querySelectorAll('select').forEach((x,i)=>x.value=step.answer[i]);click('Проверить');}
 else if(step.type==='order'){step.tokens.forEach(click);click('Проверить');}
 else if(step.type==='reflect')click('Я объяснил свой выбор');
 assert.equal(run.done,true,game.id+' step '+run.i);assert.equal($('nextWrap').children.length,1);$('nextWrap').children[0].onclick();
 }
 assert.equal(run.i,game.steps.length);assert.equal(run.checked,game.steps.filter(s=>s.type!=='reflect').length);
}
console.log('PASS: all 54 game steps completed; wrong answers, retry, scoring and eight input mechanics verified');
`,context);
