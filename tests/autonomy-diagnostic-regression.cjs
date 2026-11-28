const assert = require('node:assert/strict');
const engine = require('../autonomy-engine');
const {inspect} = require('../autonomy-diagnostic');

const now = Date.parse('2026-01-01T00:00:00Z');
const snapshot = {
  observed_at: new Date(now).toISOString(),
  hardware: {cpu_percent: 42},
  providers: [{id: 'codex', state: 'available', observed_at: new Date(now).toISOString()}]
};

for (const source of ['saved', 'local', 'private']) {
  assert.deepEqual(inspect(engine, snapshot, source, now), {
    observedAt: snapshot.observed_at, source, recent: true, metricCount: 1, eligibleAgents: []
  });
}
assert.deepEqual(inspect(engine, null, null, now), {
  observedAt: null, source: null, recent: false, metricCount: 0, eligibleAgents: []
});
assert.equal(inspect(engine, snapshot, 'saved', now + 120000).metricCount, 0);
assert.equal(inspect(engine, snapshot, 'forged', now - 1).recent, false);
assert.equal(inspect(engine, snapshot, 'forged', now).source, null);
const queued = engine.create('read-only', 'test');
const approved = engine.transition(queued, {type: 'approve', human: true}, now);
assert.throws(() => engine.transition(approved, {
  type: 'start', agent: 'codex', observations: inspect(engine, snapshot, 'private', now).eligibleAgents
}, now), /Agent not verified/);
console.log('Autonomy diagnostic regression checks passed');
