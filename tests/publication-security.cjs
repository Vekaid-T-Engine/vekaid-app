const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const csp = html.match(/http-equiv=["']Content-Security-Policy["']\s+content=[""]([^"]+)"/i);
assert.ok(csp, 'CSP missing');
for (const directive of ["object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-src 'none'"]) assert.ok(csp[1].split(';').map(x=>x.trim()).includes(directive), 'Missing '+directive);
assert.ok(!csp[1].includes("'unsafe-eval'"), 'Unsafe eval in CSP');
assert.match(html, /name="referrer"\s+content="no-referrer"/i);
const skip = new Set(['.git','node_modules']);
function scan(dir) {
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,e.name);
    if(e.isDirectory()){if(!skip.has(e.name))scan(p);continue;}
    if(!e.isFile())continue;
    assert.ok(!/\.(?:map|pem|p12|pfx|key)$/i.test(e.name), 'Sensitive publication file: '+path.relative(root,p));
    assert.ok(!/^\.env(?:$|\.(?!example$|sample$))/i.test(e.name), 'Environment file: '+path.relative(root,p));
    if(!/\.(?:html|js|mjs|cjs|json|css|ya?ml|md|txt|py)$/i.test(e.name))continue;
    const s=fs.readFileSync(p,'utf8');
    const patterns=[/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, /gh[pousr]_[A-Za-z0-9]{36,}/, /github_pat_[A-Za-z0-9_]{40,}/, /sk-(?:proj-)?[A-Za-z0-9_-]{32,}/];
    for(const pattern of patterns)assert.ok(!pattern.test(s),'Potential credential in '+path.relative(root,p));
  }
}
scan(root);
console.log('Publication security baseline passed (not a penetration test).');
