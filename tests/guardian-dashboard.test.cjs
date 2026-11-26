const test=require('node:test'),assert=require('node:assert/strict');const {locales,normalize}=require('../guardian-dashboard.js');
const run={id:123,head_branch:'main',head_sha:'abcdef123456789',updated_at:'2026-11-26T08:00:00Z',event:'schedule',status:'completed',conclusion:'success'};
test('sixteen complete locale packs',()=>{assert.equal(Object.keys(locales).length,16);for(const pack of Object.values(locales)){assert.equal(pack.length,24);assert.ok(pack.every(x=>x.trim()))}});
test('real statuses and branch distinction',()=>{const rows=normalize({workflow_runs:[run,{...run,id:124,head_branch:'feature',event:'pull_request',conclusion:'failure'},{...run,id:125,status:'in_progress',conclusion:null},{...run,id:126,conclusion:'cancelled'}]});assert.deepEqual(rows.map(x=>x.status),[5,6,7,8]);assert.equal(rows[0].main,true);assert.equal(rows[1].main,false)});
test('reject malformed payload and invalid entries',()=>{assert.throws(()=>normalize({}));assert.deepEqual(normalize({workflow_runs:[{...run,id:'bad'},{...run,updated_at:'bad'}]}),[])});
test('unknown conclusion never passes',()=>assert.equal(normalize({workflow_runs:[{...run,conclusion:'unknown'}]})[0].status,10));
