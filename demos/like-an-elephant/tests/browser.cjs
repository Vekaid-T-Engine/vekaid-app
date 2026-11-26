const {chromium,webkit}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=process.cwd(), prefix='/vekaid-app/demos/like-an-elephant/';
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),p=path.resolve(root,'.'+u.pathname.replace(/^\/vekaid-app/,''));if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404);return res.end()}res.setHeader('Content-Type',({'.js':'application/javascript','.css':'text/css','.html':'text/html'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p))});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));try{for(const [name,engine] of [['Chromium',chromium],['WebKit',webkit]]){const browser=await engine.launch();try{for(const width of [320,390,430,1440]){const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'no-preference'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
// Deterministic stand-in image response, not a verification of remote photographs.
await p.route('https://www.restaurantlikeanelephant.fr/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#999"/></svg>'}));
const url='http://127.0.0.1:'+server.address().port+prefix;
await p.goto(url+'preview-3.4.html');await p.waitForFunction(()=>document.documentElement.dataset.runtime==='ready');
await p.waitForFunction(()=>Array.from(document.querySelectorAll('.slide img')).every(i=>i.complete&&i.naturalWidth>0));
assert.equal(await p.locator('#slide-count').textContent(),'01 / 03');
await p.locator('#next').click();await p.waitForFunction(()=>document.querySelector('#slide-count').textContent==='02 / 03');
assert.equal(await p.locator('#hero-caption').textContent(),await p.locator('.slide.active figcaption').textContent());
await p.locator('#prev').click();await p.waitForFunction(()=>document.querySelector('#slide-count').textContent==='01 / 03');
await p.locator('#pause').click();await p.waitForFunction(()=>document.querySelector('#slide-count').textContent==='02 / 03',{},{timeout:10000});
const geo=await p.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect(),a=rect('.hero'),b=rect('.hero-photos'),c=rect('.slide.active'),d=rect('.hero-caption'),e=rect('.hero-controls');return {width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,hero:a.width,photo:b.width,slide:c.width,caption:d.width,controls:e.width}});assert(geo.overflow<=1,JSON.stringify(geo));assert(Math.abs(geo.photo-geo.slide)<=1,JSON.stringify(geo));if(width<=850)assert(Math.abs(geo.photo-geo.hero)<=1,JSON.stringify(geo));assert.deepEqual(errors,[]);console.log(name,width,'carousel click, autoplay, caption and width OK');await p.close()}}finally{await browser.close()}}}finally{server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
