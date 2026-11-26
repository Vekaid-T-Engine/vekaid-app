from pathlib import Path
from html.parser import HTMLParser
root=Path(__file__).resolve().parents[1]
class Check(HTMLParser):
    def __init__(self):
        super().__init__(); self.h1=0; self.ids=set()
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='h1': self.h1+=1
        if 'id' in a:
            assert a['id'] not in self.ids, a['id']
            self.ids.add(a['id'])
        if tag=='img': assert 'alt' in a
        if tag=='script': assert a.get('src','').startswith('assets/')
        assert not any(k.startswith('on') for k in a)
        if tag in ('a','link','script'):
            url=a.get('href',a.get('src','')).split('?')[0]
            if url and not url.startswith(('#','https:','tel:','mailto:')):
                assert (root/url).is_file(),url
for name in ['index','carte','maison','galerie','contact','cadeaux','reservation']:
    html=(root/(name+'.html')).read_text()
    assert 'noindex,nofollow' in html and "form-action 'none'" in html
    p=Check(); p.feed(html); assert p.h1==1,name
    assert '<style>' not in html and '<template' not in html
print('7 pages: headings, IDs, links, alt, CSP and external scripts verified')

import json,re
photos=json.loads(re.search(r'const PHOTO_DATA=(\[.*?\]);',(root/'assets/content.js').read_text()).group(1))
assert len(photos)==16
assert set(map(int,re.findall(r'data-enlarge="(\d+)"',(root/'galerie.html').read_text())))==set(range(16))
assert 'name="time" required disabled' in (root/'reservation.html').read_text()
print('16 photo references and safe initial booking state verified')
