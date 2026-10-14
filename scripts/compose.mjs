import fs from 'node:fs';
import {GAMES,RELEASES} from '../src/games.js';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const page=read('src/page.html').replace('/*CSS*/',()=>read('src/style.css')).replace('/*JS*/',()=>read('src/app.js'));
const assets=JSON.parse(read('src/hero-assets.json'));
fs.writeFileSync(new URL('../worker/index.js',import.meta.url),`const PAGE=${JSON.stringify(page)};\nconst GAMES=${JSON.stringify(GAMES)};\nconst RELEASES=${JSON.stringify(RELEASES)};\nconst ASSETS=${JSON.stringify(assets)};\n`+read('src/server.js'));
