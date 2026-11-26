const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const targets=['index.html','demos/cosy-corner/index.html',...['index','carte','maison','galerie','contact','cadeaux','reservation'].map(n=>'demos/like-an-elephant/'+n+'.html')];
const report=[];
for(const file of targets){
 const html=fs.readFileSync(path.join(root,file),'utf8').replace(/data:[^"'\s)]+/g,'DATA');
 const tags=html.match(/<meta\b[^>]*>/gi)||[];
 const csp=tags.find(t=>/content-security-policy/i.test(t));
 const viewport=tags.find(t=>/name=["']viewport["']/i.test(t));
 assert.ok(viewport,file+' missing viewport');
 assert.ok(!/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:[,"'\s]|$)/i.test(viewport),file+' disables zoom');
 assert.ok(/<html\b[^>]*\blang=/i.test(html),file+' missing language');
 const external=[...new Set([...html.matchAll(/(?:src|href)=["']https?:\/\/([^/"'?#]+)/gi)].map(m=>m[1]))].sort();
 const warnings=[];
 if(!csp)warnings.push('CSP absent: review resource inventory before enforcing');
 else if(/unsafe-inline/i.test(csp))warnings.push('CSP permits inline code');
 if(!/<main\b/i.test(html))warnings.push('Review main landmark');
 for(const a of html.match(/<a\b[^>]*>/gi)||[])if(/target=["']_blank["']/i.test(a)&&!/rel=["'][^"']*\b(?:noopener|noreferrer)\b/i.test(a))warnings.push('Review external link isolation');
 report.push({file,external,warnings});
}
console.log(JSON.stringify({scope:'Static evidence only; browser tests and vendor approval remain required',pages:report},null,2));
