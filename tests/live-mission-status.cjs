const assert = require('node:assert/strict');
const {readMissionStatus} = require('../autonomy-diagnostic');
const record = {format:'vekaid.diagnostic.mission.v1', id:'diag-1', state:'completed',
  result:{raw:'private'}, token:'private', available:true};
assert.deepEqual(readMissionStatus(record), {id:'diag-1', state:'completed'});
for (const malformed of [{...record, id:'<script>'},{...record, state:'available'},
  {...record, format:'vekaid.live.v1'},null]) {
  assert.throws(() => readMissionStatus(malformed), /Invalid diagnostic mission status/);
}
console.log('Read-only mission import regression checks passed');
