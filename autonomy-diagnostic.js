(function (root) {
  'use strict';

  const kinds = ['review', 'plan', 'code', 'test', 'research'];

  function inspect(engine, snapshot, source, now = Date.now()) {
    const observed = Date.parse(snapshot?.observed_at);
    const age = now - observed;
    const recent = Number.isFinite(age) && age >= 0 && age < 120000;
    const routes = Object.fromEntries(kinds.map(kind => [kind, engine.route(kind, [], now)]));
    return {
      observedAt: Number.isFinite(observed) ? new Date(observed).toISOString() : null,
      source: ['saved', 'local', 'private'].includes(source) ? source : null,
      recent,
      metricCount: recent ? Object.keys(snapshot.hardware).length : 0,
      eligibleAgents: [...new Set(Object.values(routes).flat())]
    };
  }

  const api = Object.freeze({inspect});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.VEKAID_AUTONOMY_DIAGNOSTIC = api;
})(typeof window !== 'undefined' ? window : globalThis);
