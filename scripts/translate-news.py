import json,sys,pathlib
import argostranslate.package as pkg
import argostranslate.translate as tr
code=sys.argv[1]
target='zh' if code=='zh-Hans' else code
data=json.loads(pathlib.Path('daily-briefing.json').read_text())
pkg.update_package_index()
available=pkg.get_available_packages()
def install(a,b):
    p=next((p for p in available if p.from_code==a and p.to_code==b),None)
    if not p:return False
    pkg.install_from_path(p.download());return True
if not install('fr',target):
    assert install('fr','en') and install('en',target)
langs={x.code:x for x in tr.get_installed_languages()}
engine=langs['fr'].get_translation(langs[target])
def translate(s):
    out=engine.translate(s).strip()
    assert out and len(out)<=6000
    return out
rows=[]
for x in data['items']:
    old=x.get('translations',{}).get(code,{})
    row={k:old.get(k) or translate(x[k]) for k in ('title','summary','category')}
    row['sections']=[{k:translate(s[k]) for k in ('heading','body')} for s in x.get('sections',[])]
    rows.append(row)
pathlib.Path('news-'+code+'.json').write_text(json.dumps({'generatedAt':data['generatedAt'],'rows':rows},ensure_ascii=False))
