import http from 'node:http';
import {handle} from '../worker/index.js';
const testTime=process.env.WORKSHOP_QA_TIME?Date.parse(process.env.WORKSHOP_QA_TIME):null;
http.createServer(async(req,res)=>{try{const response=handle(new Request('http://localhost'+req.url),testTime??Date.now());res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500);res.end(String(e));}}).listen(Number(process.env.PORT||8877),'127.0.0.1',()=>console.log('Local preview ready; QA clock: '+(testTime!==null)));
