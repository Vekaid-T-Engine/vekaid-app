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

  const missionStates = new Set(["queued","approved","running","completed","failed","expired","interrupted"]);

  function readMissionStatus(value) {
    if (value?.format !== 'vekaid.diagnostic.mission.v1' ||
        typeof value.id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(value.id) ||
        !missionStates.has(value.state)) {
      throw Error('Invalid diagnostic mission status');
    }
    return {id: value.id, state: value.state};
  }

  const api = Object.freeze({inspect, readMissionStatus});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.VEKAID_AUTONOMY_DIAGNOSTIC = api;
})(typeof window !== 'undefined' ? window : globalThis);
