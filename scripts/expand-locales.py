import json, re, pathlib, html, sys
import argostranslate.package as pkg
import argostranslate.translate as tr
from bs4 import BeautifulSoup
root=pathlib.Path('.')
js=(root/'v23-core.js').read_text()
page=(root/'index.html').read_text()
rows=json.loads(re.search(r'const localeRows=(\[[\s\S]*?\]);',js)[1])
keys=json.loads(re.search(r'const extraKeys=(\[[\s\S]*?\]);',js)[1])
lessons=json.loads(re.search(r'const academyLessons=(\[[\s\S]*?\]);',js)[1])
source=set(x[0] for x in rows)|set(keys)
# Static authored HTML and literal markup only; never read device storage or user inputs.
for markup in [page,*re.findall(r'<(?:button|p|small|strong|label|h[1-6]|span|div|section)\b[^>]*>[^<>$]{2,500}</[^>]+>',js+page)]:
    soup=BeautifulSoup(markup,'html.parser')
    for el in soup(['script','style','code','pre','svg','textarea']): el.decompose()
    for s in soup.stripped_strings:
        if 2<=len(s)<=500 and re.search(r'[A-Za-zÀ-ÿ]{2}',s) and not re.search(r'[{}$<>]|https?://',s): source.add(' '.join(s.split()))
    for el in soup.find_all(True):
        for a in ('placeholder','aria-label','title'):
            s=el.get(a)
            if isinstance(s,str) and s.strip() and not re.search(r'[{}$<>]',s): source.add(' '.join(s.split()))
# Explicit literal messages from runtime templates, with reviewed overrides retained by client.
for s in re.findall(r"""(?<=['"])[A-Za-zÀ-ÿ][^'"\\<>$\n{}]{3,350}(?=['"])""",js+page):
    if re.search(r'[àâäéèêëîïôöùûüçœ]|\b(?:une|des|les|dans|pour|avec|aucun|sur|est|pas|ton|tes|vos)\b',s,re.I) and not re.search(r'[=;{}]|https?://',s): source.add(' '.join(s.split()))
# Expand authored source inventory using explicit regression keys and JS AST strings exported by Node.
source.update(json.loads((root/'localization-required.json').read_text()))
extra=root/'localization-inventory.json'
if extra.exists(): source.update(json.loads(extra.read_text()))
# Reuse unchanged translations and lessons; never translate user storage.
selected=sys.argv[1]
previous=json.loads((root/'locales'/ (selected+'.json')).read_text())
source={s for s in source if isinstance(s,str) and 1<=len(s)<=5000}
pkg.update_package_index()
available=pkg.get_available_packages()
def install(a,b):
    if any(p.from_code==a and p.to_code==b for p in pkg.get_installed_packages()): return True
    p=next((p for p in available if p.from_code==a and p.to_code==b),None)
    if not p:return False
    pkg.install_from_path(p.download());return True
def translator(a,b):
    langs={x.code:x for x in tr.get_installed_languages()}
    return langs[a].get_translation(langs[b])
targets={'es':'es','it':'it','pt':'pt','de':'de','zh-Hans':'zh','en':'en','ja':'ja','ko':'ko','ar':'ar','ru':'ru','hi':'hi','tr':'tr','vi':'vi','nl':'nl','id':'id'}
selected=sys.argv[1] if len(sys.argv)>1 else 'es'
target=targets[selected]
if not install('fr',target):
    if not (install('fr','en') and install('en',target)): raise RuntimeError('No translation route for '+selected)
engine=translator('fr',target)
unresolved=[]
def translate(s):
    try:
        out=engine.translate(s).strip()
        if out: return out
        reason='empty'
    except Exception as e:
        reason=type(e).__name__
    unresolved.append({'key':s,'reason':reason})
    return None
dest=root/'locales';dest.mkdir(exist_ok=True)
data={'locale':selected,'machineTranslated':True,'ui':dict(previous['ui']),'lessons':previous['lessons']}
for s in sorted(source):
    if s not in data['ui'] or data['ui'][s]==s:
        out=translate(s)
        if out: data['ui'][s]=out
        else: data['ui'].pop(s,None)
data['unresolved']=unresolved
(dest/(selected+'.json')).write_text(json.dumps(data,ensure_ascii=False),encoding='utf8')
print(selected,len(data['ui']),len(data['lessons']),'unresolved',len(unresolved))
