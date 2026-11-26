const test=require('node:test');
const assert=require('node:assert/strict');
const {analyze}=require('../code-intelligence.js');
test('Python directory enumeration',()=>{const x=analyze("import os\n\nfor file in os.listdir('.'):\n    print(file)");assert.equal(x.language,'Python');assert.equal(x.lines.length,3);assert.equal(x.recognized,3);assert.match(x.lines[1].explanation,/répertoire/);});
test('JavaScript output',()=>{const x=analyze('const x = 1;\nconsole.log(x)');assert.equal(x.language,'JavaScript');assert.equal(x.recognized,2)});
test('flags destructive and network patterns without execution',()=>{const x=analyze("os.remove('file')\nrequests.get('https://example.org')");assert.ok(x.warnings.length>=2)});
test('unknown syntax and manual language',()=>{assert.equal(analyze('???').recognized,0);assert.equal(analyze('???','Bash').language,'Bash')});
test('untrusted HTML is retained as text and never executed',()=>{const x=analyze('<script>throw Error("not executed")</script>');assert.equal(x.lines[0].text,'<script>throw Error("not executed")</script>')});
test('rejects empty and oversized input',()=>{assert.throws(()=>analyze(' '));assert.throws(()=>analyze('a'.repeat(20001)))});
test('English output',()=>{assert.match(analyze('print(1)','Python','en').lines[0].explanation,/Displays/)});

test('all sixteen locales cover every code explanation and interface label',()=>{const {data,translate}=require('../code-locales.js');const langs=['fr','en','de','zh-Hans','es','it','pt','ja','ko','ar','ru','hi','tr','vi','nl','id'];assert.deepEqual(Object.keys(data).sort(),langs.sort());assert.equal(data.fr.length,35);for(const lang of langs){assert.equal(data[lang].length,data.fr.length);assert.ok(data[lang].every(x=>typeof x==='string'&&x.trim()));for(let i=0;i<data.fr.length;i++)assert.equal(translate(data.fr[i],data.en[i],lang),data[lang][i]);const x=analyze("import os\nprint(1)\n???\nos.remove('file')",'Python',lang);assert.equal(x.recognized,2);assert.equal(x.lines[0].explanation,data[lang][0]);assert.equal(x.lines[2].explanation,data[lang][18]);assert.ok(x.warnings.includes(data[lang][13]));assert.equal(x.lines[3].text,"os.remove('file')");}});
