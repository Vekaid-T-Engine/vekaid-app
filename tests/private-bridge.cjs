const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({window: {}, URL, Uint8Array, TextDecoder});
for (const file of ['live-locales.js','live-intelligence.js']) vm.runInContext(fs.readFileSync(file,'utf8'),context);
const api=context.window.VEKAID_LIVE;
const endpoint=api.bridgeURL('https://pc.tailnet.ts.net/v1/snapshot');
assert.equal(endpoint,'https://pc.tailnet.ts.net/v1/snapshot');
for (const bad of ['http://pc.tailnet.ts.net','https://pc.tailnet.ts.net/wrong','https://pc.tailnet.ts.net/?token=test']) assert.throws(()=>api.bridgeURL(bad));
assert.doesNotThrow(()=>api.rememberSnapshot(()=>{throw Error('Storage blocked')},{},'k'));
assert.equal(api.retryDelay(1),3000);
assert.equal(api.retryDelay(40),60000);
(async()=>{
 const request=async response=>{context.fetch=async (_url,options)=>{
   assert.equal(options.credentials,'omit');
   assert.equal(options.redirect,'error');
   assert.equal(options.headers.Authorization,'Bearer test-placeholder');
   return response;
 };return api.fetchSnapshot(endpoint,'test-placeholder')};
 for (const [status, code] of [[401,'auth'],[403,'origin'],[503,'snapshot']]){
   await assert.rejects(request({ok:false,status}),error=>error.code===code);
 }
 const response={ok:true,headers:{get:()=> '2'},body:null,arrayBuffer:async()=>Uint8Array.from([123,125]).buffer};
 assert.equal(JSON.stringify(await request(response)),'{}');
 await assert.rejects(request({...response,headers:{get:()=>null}}),error=>error.code==='snapshot');
 await assert.rejects(request({...response,headers:{get:()=> '65537'}}),error=>error.code==='snapshot');
 console.log('Private bridge client checks passed');
})().catch(error=>{console.error(error);process.exitCode=1});
