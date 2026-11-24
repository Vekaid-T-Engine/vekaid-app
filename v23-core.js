(()=>{'use strict';const V='23.12.0',DB='vekaid-v23';let db;const $=(s,r=document)=>r.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const uid=()=>crypto.randomUUID?.()||Date.now()+'-'+Math.random();
function openDB(){return new Promise((ok,no)=>{const r=indexedDB.open(DB,2);r.onupgradeneeded=()=>{for(const n of ['meta','tickets','skills','releases'])if(!r.result.objectStoreNames.contains(n))r.result.createObjectStore(n,{keyPath:'id'})};r.onsuccess=()=>{db=r.result;ok()};r.onerror=()=>no(r.error)})}
function all(s){return new Promise((ok,no)=>{const r=db.transaction(s).objectStore(s).getAll();r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}function put(s,v){return new Promise((ok,no)=>{const r=db.transaction(s,'readwrite').objectStore(s).put(v);r.onsuccess=()=>ok(v);r.onerror=()=>no(r.error)})}
function enhanceVekForm(form,{requiredName,readyText='Prêt',errorText='Champ requis'}={}){
  if(!form)return;
  const field=requiredName?form.elements[requiredName]:null;
  if(field){
    const wrap=field.closest('.v23-field');
    let feedback=document.createElement('small');
    feedback.className='v23-inline-feedback';
    wrap?.append(feedback);
    const assess=(showError=false)=>{
      const ok=String(field.value||'').trim().length>0;
      wrap?.classList.toggle('is-valid',ok);
      wrap?.classList.toggle('is-invalid',!ok&&showError);
      feedback.textContent=ok?readyText:(showError?errorText:'');
      return ok;
    };
    field.addEventListener('input',()=>assess(false));
    field.addEventListener('blur',()=>assess(true));
    form.__vekValidate=()=>assess(true);
  }
}
function submitState(form,label){
  const btn=form?.querySelector('button[type="submit"],button:not([type])');
  if(!btn)return()=>{};
  const original=btn.textContent;
  btn.disabled=true;btn.classList.add('is-busy');btn.textContent=label;
  return(success=true)=>{btn.classList.remove('is-busy');btn.classList.toggle('is-success',success);btn.textContent=success?'Enregistré ✓':original;};
}
function layer(title,sub,html){$('.v23-layer')?.remove();const l=document.createElement('div');l.className='v23-layer';l.innerHTML='<section class="v23-panel"><div class="v23-head"><div><h2>'+esc(title)+'</h2><p>'+esc(sub||'')+'</p></div><button class="v23-close">×</button></div><div class="v23-body">'+html+'</div></section>';l.onclick=e=>{if(e.target===l)l.remove()};$('.v23-close',l).onclick=()=>l.remove();document.body.append(l);return $('.v23-body',l)}
async function today(){const t=await all('tickets'),s=await all('skills'),active=t.filter(x=>x.status!=='done');const b=layer("Aujourd’hui",'Une priorité, sa raison et la prochaine action.',`
<section class="v23-section"><p class="v23-section-title">Priorité</p><div class="v23-group"><div class="v23-row"><strong>${esc(active[0]?.title||'Définir la prochaine mission')}</strong><small>${esc(active[0]?.outcome||'Crée une mission structurée dans Work.')}</small></div></div></section>
<section class="v23-section"><p class="v23-section-title">État</p><div class="v23-group"><div class="v23-metric"><span><i class="v23-status-dot"></i>Missions actives</span><strong>${active.length}</strong></div><div class="v23-metric"><span>Terminées</span><strong>${t.filter(x=>x.status==='done').length}</strong></div><div class="v23-metric"><span>Preuves de compétences</span><strong>${s.length}</strong></div></div></section>
<div class="v23-actions"><button class="v23-btn primary" id="go-work">Ouvrir Work</button><button class="v23-btn" id="go-search">Rechercher dans VEKAID</button></div>`);$('#go-work',b).onclick=work;$('#go-search',b).onclick=palette}
async function work(){const t=await all('tickets');const b=layer('Work','Missions structurées comme des tickets techniques','<div class="v23-actions"><button class="v23-btn primary" id="newt">Nouvelle mission</button><button class="v23-btn" id="studio23">Ouvrir Studio</button><button class="v23-btn" id="release23">Vérifier la release</button><button class="v23-btn" id="oldm">Missions V22</button></div><section class="v23-section"><p class="v23-section-title">Missions V23</p><div class="v23-group" id="tl"></div></section><div id="tf"></div>');$('#oldm',b).onclick=()=>{b.closest('.v23-layer').remove();window.tab?.('missions')};$('#newt',b).onclick=()=>form(b,{});$('#studio23',b).onclick=studio;$('#release23',b).onclick=releaseCenter;const root=$('#tl',b);if(!t.length)root.innerHTML='<p class="v23-muted">Aucune mission V23 pour le moment.</p>';t.sort((a,z)=>String(z.createdAt).localeCompare(String(a.createdAt))).forEach(x=>{const r=document.createElement('button');r.className='v23-row';r.innerHTML='<strong>'+esc(x.title)+'</strong><small>'+esc(x.outcome||x.context||'Sans résultat attendu')+' · '+(x.status==='done'?'terminée':'active')+'</small>';r.onclick=()=>form(b,x);root.append(r)})}
function form(b,t){$('#tf',b).innerHTML=`<form id="f23" novalidate>
<section class="v23-form-chunk"><p class="v23-section-title">Définir la mission</p><div class="v23-field"><label>Titre</label><input name="title" value="${esc(t.title||'')}" autocomplete="off"><span class="v23-field-hint">Un titre court et actionnable.</span></div><div class="v23-field"><label>Contexte</label><textarea name="context">${esc(t.context||'')}</textarea></div><div class="v23-field"><label>Résultat attendu</label><textarea name="outcome">${esc(t.outcome||'')}</textarea></div></section>
<section class="v23-form-chunk"><p class="v23-section-title">Encadrer l’exécution</p><div class="v23-field"><label>Contraintes</label><textarea name="constraints">${esc(t.constraints||'')}</textarea></div><div class="v23-field"><label>Critères d’acceptation</label><textarea name="acceptance">${esc(t.acceptance||'')}</textarea></div><div class="v23-field"><label>Tests</label><textarea name="tests">${esc(t.tests||'')}</textarea></div></section>
<section class="v23-form-chunk"><p class="v23-section-title">Fermer la boucle</p><div class="v23-field"><label>Preuve / résultat</label><textarea name="proof">${esc(t.proof||'')}</textarea></div></section>
<div class="v23-actions"><button type="submit" class="v23-btn primary">Enregistrer la mission</button>${t.id?'<button type="button" class="v23-btn" id="done23">'+(t.status==='done'?'Réouvrir':'Terminer')+'</button>':''}</div></form>`;enhanceVekForm($('#f23',b),{requiredName:'title',readyText:'Titre prêt',errorText:'Ajoute un titre avant d’enregistrer'});$('#f23',b).onsubmit=async e=>{e.preventDefault();if(e.currentTarget.__vekValidate&&!e.currentTarget.__vekValidate())return;const done=submitState(e.currentTarget,'Enregistrement…');const f=new FormData(e.currentTarget),o={...t,id:t.id||uid(),title:String(f.get('title')).trim(),context:String(f.get('context')).trim(),outcome:String(f.get('outcome')).trim(),constraints:String(f.get('constraints')).trim(),acceptance:String(f.get('acceptance')).trim(),tests:String(f.get('tests')).trim(),proof:String(f.get('proof')).trim(),status:t.status||'todo',createdAt:t.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};try{await put('tickets',o);done(true);setTimeout(work,480)}catch(err){done(false)}};$('#done23',b)?.addEventListener('click',async()=>{await put('tickets',{...t,status:t.status==='done'?'todo':'done',updatedAt:new Date().toISOString()});work()})}
const skills=['Git','JavaScript','Sécurité','DevOps','Linux','Réseaux','Python','Active Directory','Docker','Cloud'];
async function learn(){const p=await all('skills');const b=layer('Learn','Compétences fondées sur des preuves, pas sur une auto-certification','<section class="v23-section"><p class="v23-section-title">Compétences suivies</p><div class="v23-group" id="sl"></div></section><div class="v23-note">Ici, une compétence sans preuve enregistrée n’est pas notée à zéro : elle est simplement non documentée dans VEKAID.</div><div id="se"></div>');for(const s of skills){const items=p.filter(x=>x.skill===s),n=items.length,r=document.createElement('button');r.className='v23-row';const status=n?((n===1?'1 preuve enregistrée':n+' preuves enregistrées')+'<div class="v23-progress"><i style="width:'+Math.min(100,n*25)+'%"></i></div>'):'Aucune preuve enregistrée';r.innerHTML='<strong>'+esc(s)+'</strong><small>'+status+'</small>';r.onclick=()=>proofForm(b,s,items);$('#sl',b).append(r)}}
function proofForm(b,s,items){$('#se',b).innerHTML=`<form id="pf" novalidate><section class="v23-form-chunk"><p class="v23-section-title">Documenter la preuve</p><div class="v23-field"><label>Type</label><select name="source"><option>Lab reproductible</option><option>Git / PR</option><option>Test</option><option>Projet</option><option>Explication technique</option></select></div><div class="v23-field"><label>Ce que la preuve démontre</label><textarea name="proof"></textarea><span class="v23-field-hint">Décris un résultat observable, pas une auto-évaluation.</span></div><div class="v23-field"><label>Référence</label><input name="ref" placeholder="URL, commit, fichier ou note"></div></section><button type="submit" class="v23-btn primary">Enregistrer la preuve</button></form><div class="v23-list">${items.length?items.map(x=>'<div class="v23-card"><b>'+esc(x.source)+'</b><small>'+esc(x.proof)+'</small></div>').join(''):'<div class="v23-empty">Aucune preuve enregistrée pour cette compétence. Cela ne signifie pas que ton niveau est nul : VEKAID n’a simplement encore aucune preuve documentée ici.<button type="button" class="v23-btn" data-focus-proof>Ajouter une première preuve</button></div>'}</div>`;enhanceVekForm($('#pf',b),{requiredName:'proof',readyText:'Preuve suffisamment décrite',errorText:'Décris ce que cette preuve démontre'});b.querySelector('[data-focus-proof]')?.addEventListener('click',()=>{const el=b.querySelector('#pf textarea[name="proof"]');el?.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>el?.focus(),260)});$('#pf',b).onsubmit=async e=>{e.preventDefault();if(e.currentTarget.__vekValidate&&!e.currentTarget.__vekValidate())return;const done=submitState(e.currentTarget,'Enregistrement…');const f=new FormData(e.currentTarget);try{await put('skills',{id:uid(),skill:s,source:String(f.get('source')),proof:String(f.get('proof')).trim(),ref:String(f.get('ref')).trim(),createdAt:new Date().toISOString()});done(true);setTimeout(learn,480)}catch(err){done(false)}}}

function studio(){const b=layer('Studio','Image, vidéo et voix réunis sans mélanger les workflows',`
<section class="v23-section"><p class="v23-section-title">Création visuelle & média</p><div class="v23-group">
<button class="v23-row" data-studio="imagestudio"><strong>Image Studio</strong><small>Briefs, références, variantes, retouche et QA visuel</small></button>
<button class="v23-row" data-studio="video"><strong>AI Video Factory</strong><small>Préparation et traitement technique vidéo</small></button>
<button class="v23-row" data-studio="shortform"><strong>Shortform Studio</strong><small>Script, storyboard, direction créative</small></button>
<button class="v23-row" data-studio="voice"><strong>Voix & audio</strong><small>Voix, narration et assets sonores</small></button>
</div></section>`);
b.querySelectorAll('[data-studio]').forEach(x=>x.onclick=()=>{b.closest('.v23-layer').remove();window.tab?.('projects');setTimeout(()=>{const q=document.getElementById('projectSearch');if(q){q.value=x.dataset.studio==='imagestudio'?'Image Studio':x.dataset.studio==='video'?'AI Video Factory':x.dataset.studio==='shortform'?'Shortform Studio':'voix';q.dispatchEvent(new Event('input',{bubbles:true}))}},120)})}
const releaseChecks=[
['build','Build et tests','Le projet démarre, les fonctions critiques sont testées et les échecs connus sont documentés.'],
['security','Sécurité','Aucun secret exposé, imports validés, dépendances et permissions revues.'],
['deploy','Déploiement','La version publique correspond au commit attendu et fonctionne sur mobile.'],
['title','Title + meta description','Titre utile et description claire pour chaque page publique importante.'],
['canonical','Canonical + Open Graph','URL canonique et aperçu social cohérent.'],
['robots','robots.txt','Les pages publiques sont indexables comme prévu et les pages privées ne le sont pas.'],
['sitemap','sitemap.xml','Les pages publiques importantes figurent dans le sitemap.'],
['headings','Structure H1/H2','Hiérarchie claire et un H1 principal par page.'],
['accessibility','Accessibilité mobile','Navigation tactile, contrastes, labels et focus vérifiés.'],
['performance','Performance','Images/JS raisonnables, chargement et interactions vérifiés.'],
['links','Liens cassés','Les liens externes et internes critiques ont été contrôlés.'],
['schema','Données structurées','Schema.org ajouté seulement lorsqu’il apporte une valeur réelle.'],
['search-console','Google Search Console','Propriété et indexation vérifiées manuellement si pertinent.'],
['proof','Preuves de livraison','Commit, URL, captures ou résultats de tests enregistrés.']
];
async function releaseCenter(){const existing=await all('releases'),state=Object.fromEntries(existing.map(x=>[x.id,x]));const b=layer('Release & Discover','Build → Test → Secure → Deploy → Discover → Prove','<section class="v23-section"><p class="v23-section-title">Checklist de livraison</p><div class="v23-group" id="rel23"></div></section><p class="v23-muted">Search Console et les comptes externes ne sont jamais marqués comme vérifiés sans action réelle de ta part.</p>');const root=$('#rel23',b);for(const [id,title,desc] of releaseChecks){const row=document.createElement('button');row.className='v23-row';const status=state[id]?.status||'todo';row.innerHTML='<strong>'+(status==='done'?'✓ ':'')+esc(title)+'</strong><small>'+esc(desc)+'</small>';row.onclick=async()=>{await put('releases',{id,title,status:status==='done'?'todo':'done',updatedAt:new Date().toISOString()});releaseCenter()};root.append(row)}}
function intel(){const b=layer('Intel','Accès aux modules d’intelligence existants','<section class="v23-section"><p class="v23-section-title">Sources et systèmes</p><div class="v23-group"><button class="v23-row" data-x="claude"><strong>Claude</strong><small>Sessions observées</small></button><button class="v23-row" data-x="agents"><strong>Agents</strong><small>Rôles et orchestration</small></button><button class="v23-row" data-x="security"><strong>Sécurité</strong><small>Diagnostic et contrôles</small></button><button class="v23-row" data-x="github"><strong>GitHub</strong><small>État du dépôt</small></button></div></section>');b.querySelectorAll('[data-x]').forEach(x=>x.onclick=()=>{b.closest('.v23-layer').remove();window.tab?.(x.dataset.x)})}
async function you(){const t=await all('tickets'),s=await all('skills'),reg=await navigator.serviceWorker?.getRegistration?.('./').catch(()=>null),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;const b=layer('You','Santé de l’application, données locales et continuité',`<div class="v23-grid"><article class="v23-card"><span class="v23-k">VERSION</span><b>V${V}</b><small>Schema IndexedDB 2</small></article><article class="v23-card"><span class="v23-k">PWA</span><b>${standalone?'Installée':'Navigateur'}</b><small>Service worker : ${reg?'actif':'à vérifier'}</small></article><article class="v23-card"><span class="v23-k">DONNÉES</span><b>${t.length} missions</b><small>${s.length} preuves</small></article><article class="v23-card"><span class="v23-k">RÉSEAU</span><b>${navigator.onLine?'En ligne':'Hors ligne'}</b><small>cache PWA disponible</small></article><article class="v23-card wide"><div class="v23-actions"><button class="v23-btn primary" id="exp23">Exporter backup</button><button class="v23-btn" id="pal23">Command Palette</button></div></article></div><section class="v23-privacy"><h3>Confidentialité & données</h3><p>VEKAID n’a actuellement aucun compte utilisateur ni connexion sociale. Les données V23 restent dans le stockage local de ce navigateur tant que tu ne les exportes pas toi-même.</p><div class="v23-privacy-grid"><div class="v23-privacy-item"><strong>Aucun login artificiel</strong><small>Apple/Google ne seront ajoutés que si un vrai système de comptes devient nécessaire.</small></div><div class="v23-privacy-item"><strong>Aucun secret dans le frontend</strong><small>Clés API, mots de passe et tokens ne doivent jamais être enregistrés dans l’app publique.</small></div></div></section>`);$('#exp23',b).onclick=backup;$('#pal23',b).onclick=palette}
async function backup(){const payload={format:'vekaid.backup.v23',version:V,at:new Date().toISOString(),tickets:await all('tickets'),skills:await all('skills'),legacy:{atlas:localStorage.getItem('vekaid.atlas.v5.offline'),intel:localStorage.getItem('vekaid.intel.v1')}};const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.href=u;a.download='vekaid-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function palette(){const b=layer('Search VEKAID','Recherche et commandes locales','<input class="v23-search" id="q23" placeholder="Mission, skill, projet…"><div class="v23-list" id="r23"></div>'),q=$('#q23',b),r=$('#r23',b),cmd=[['Aujourd’hui','today',today],['Nouvelle mission','work',work],['Skills & preuves','learn',learn],['Studio image & média','work',studio],['Release & Discover','work',releaseCenter],['Agents','intel',()=>{b.closest('.v23-layer').remove();window.tab?.('agents')}],['Projets','work',()=>{b.closest('.v23-layer').remove();window.tab?.('projects')}],['Sécurité','intel',()=>{b.closest('.v23-layer').remove();window.tab?.('security')}]];const draw=()=>{const v=q.value.toLowerCase();r.innerHTML='';cmd.filter(x=>x[0].toLowerCase().includes(v)||x[1].includes(v)).forEach(x=>{const z=document.createElement('button');z.className='v23-row';z.innerHTML='<strong>'+x[0]+'</strong><small>'+x[1]+'</small>';z.onclick=x[2];r.append(z)})};q.oninput=draw;draw();q.focus()}
let vekaidLaunchLast=0,vekaidHiddenAt=0;
function buildLaunchIdent(){
  document.getElementById('vekaidLaunch')?.remove();
  const el=document.createElement('div');
  el.id='vekaidLaunch';el.className='vekaid-launch';el.setAttribute('aria-hidden','true');
  el.innerHTML='<div class="vekaid-launch__stage"><div class="vekaid-launch__radar"><div class="vekaid-launch__ring"></div><div class="vekaid-launch__ring r2"></div><div class="vekaid-launch__sweep"></div></div><div class="vekaid-launch__halo"></div><svg class="vekaid-launch__v" viewBox="0 0 160 160" aria-hidden="true"><path class="left" d="M34 34 L80 128"></path><path class="right" d="M126 34 L80 128"></path></svg><div class="vekaid-launch__brand">VEKAID</div></div>';
  document.body.append(el);
  return el;
}
function playLaunchIdent(force=false,reuseExisting=false){
  const now=Date.now();
  if(!force && now-vekaidLaunchLast<900)return;
  vekaidLaunchLast=now;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let el=reuseExisting?document.getElementById('vekaidLaunch'):null;
  if(!el){document.body.classList.remove('vekaid-ready');document.body.classList.add('vekaid-entering');el=buildLaunchIdent();}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    setTimeout(()=>{document.body.classList.remove('vekaid-entering');document.body.classList.add('vekaid-ready');requestAnimationFrame(()=>el.classList.add('is-done'));setTimeout(()=>el.remove(),reduce?180:820)},reduce?120:1260);
  }));
}
function installLaunchLifecycle(){
  playLaunchIdent(true,true);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){vekaidHiddenAt=Date.now();return;}
    if(Date.now()-vekaidHiddenAt>500)playLaunchIdent(true,false);
  });
  window.addEventListener('pageshow',e=>{if(e.persisted)playLaunchIdent(true,false)});
}
function mount(){if($('.v23-dock'))return;const icons={
today:'<svg class="v23-icon" viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M9 20v-6h6v6"/></svg>',
work:'<svg class="v23-icon" viewBox="0 0 24 24"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M9 6V4h6v2M4 11h16"/></svg>',
learn:'<svg class="v23-icon" viewBox="0 0 24 24"><path d="m3 8 9-4 9 4-9 4z"/><path d="M6 10.5V15c3 2 9 2 12 0v-4.5"/></svg>',
intel:'<svg class="v23-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
you:'<svg class="v23-icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></svg>'
};const n=document.createElement('nav');n.className='v23-dock';[['today','Aujourd’hui',today],['work','Work',work],['learn','Learn',learn],['intel','Intel',intel],['you','You',you]].forEach(([i,l,f])=>{const b=document.createElement('button');b.innerHTML=icons[i]+l;b.onclick=()=>{n.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');f()};n.append(b)});document.body.append(n)}
async function init(){installLaunchLifecycle();try{await openDB();await put('meta',{id:'app',appVersion:V,schemaVersion:1,updatedAt:new Date().toISOString()})}catch(e){console.warn('V23 DB unavailable',e)}mount();document.documentElement.dataset.vekaidVersion=V}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init()})();