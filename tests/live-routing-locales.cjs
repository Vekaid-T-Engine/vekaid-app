const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({window: {}});
for (const name of ['live-locales.js', 'live-intelligence.js']) {
  vm.runInContext(fs.readFileSync(name, 'utf8'), context);
}
const {labels, languages} = context.window.VEKAID_LIVE_LOCALES;
const row = labels.find(entry => entry[0] === 'Aucun agent vérifié pour une mission');
assert.equal(row.length, languages.length);
for (const [index, locale] of languages.entries()) {
  const label = context.window.VEKAID_LIVE.translate(row[0], row[1], locale);
  assert.equal(label, row[index]);
  assert.ok(label.trim());
  if (locale !== 'en') assert.notEqual(label, row[1]);
}
console.log('Mission routing labels verified for all 16 locales');
