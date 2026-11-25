(()=>{'use strict';
 function validate(v,now=Date.now()){
 if(!v||typeof v.observed_at!=='string'||v.format!=='vekaid.live.v1'||!Number.isFinite(Date.parse(v.observed_at))||Date.parse(v.observed_at)>now+60000||!Array.isArray(v.providers)||v.providers.length>5)throw Error('Invalid snapshot');
 const providers=['claude','codex','chatgpt-images','ollama','wangp'];const seen=new Set();const rows=v.providers.map(p=>{if(!p||!providers.includes(p.id)||seen.has(p.id)||!['unknown','process-present','process-absent','limited','available','busy'].includes(p.state))throw Error('Invalid provider');seen.add(p.id);const q=p.used_percent;if(q!=null&&(!Number.isFinite(q)||q<0||q>100))throw Error('Invalid percentage');return {id:p.id,state:p.state,used_percent:q??null,reset_at:typeof p.reset_at==='string'&&Number.isFinite(Date.parse(p.reset_at))?p.reset_at:null}});
 const h=v.hardware||{},hardware={};for(const k of ['cpu_percent','ram_percent','gpu_percent','gpu_temperature_c'])if(Number.isFinite(h[k])&&h[k]>=0&&h[k]<= (k==='gpu_temperature_c'?150:100))hardware[k]=h[k];return {format:v.format,observed_at:v.observed_at,providers:rows,hardware};
 }

function isStale(snapshot,now=Date.now()){return !snapshot||now-Date.parse(snapshot.observed_at)>=120000}
function liveIntelligence({locale,layer,$}){
 const fr=locale==='fr',t=(a,b)=>fr?a:b;
 const body=layer('Live Intelligence',t('Supervision locale · aucune donnée inventée','Local monitoring · no invented data'),'<div id="live-monitor" class="v23-group"></div>');
 const root=$('#live-monitor',body),key='vekaid.live.snapshot.v1',providers=['claude','codex','chatgpt-images','ollama','wangp'];
 const make=(tag,txt,parent)=>{const n=document.createElement(tag);n.textContent=txt;parent.append(n);return n};
 let snapshot=null;
 try{snapshot=validate(JSON.parse(localStorage.getItem(key)))}catch{}
 function render(){
 root.replaceChildren();const stale=isStale(snapshot);
 make('p',snapshot?t('Dernière observation : ','Last observation: ')+new Date(snapshot.observed_at).toLocaleString(locale)+(stale?t(' · périmée',' · stale'):t(' · récente, import local',' · recent, local import')):t('Aucune source connectée','No source connected'),root);
 for(const id of providers){const row=make('div','',root);row.className='v23-row';make('strong',({'claude':'Claude Code','codex':'Codex','chatgpt-images':'ChatGPT Images','ollama':'Ollama','wangp':'WanGP'})[id],row);const p=snapshot?.providers.find(x=>x.id===id),states={'unknown':t('Inconnu','Unknown'),'process-present':t('Processus détecté, activité inconnue','Process detected, activity unknown'),'process-absent':t('Processus non détecté','Process not detected'),'limited':t('Limité','Limited'),'available':t('Disponible selon la source','Available according to source'),'busy':t('Occupé selon la source','Busy according to source')};make('small',stale?t('État actuel inconnu','Current state unknown'):states[p?.state||'unknown'],row);if(p?.used_percent!=null)make('small',t('Dernière utilisation : ','Last usage: ')+p.used_percent+'%',row);if(p?.reset_at)make('small',t('Renouvellement annoncé : ','Reported reset: ')+new Date(p.reset_at).toLocaleString(locale),row)}
 for(const [k,label] of Object.entries({cpu_percent:'CPU',ram_percent:'RAM',gpu_percent:'GPU',gpu_temperature_c:t('Température GPU','GPU temperature')})){make('p',label+': '+(snapshot?.hardware[k]??'—')+(snapshot?.hardware[k]!=null?(k==='gpu_temperature_c'?' °C':' %'):'')+(stale&&snapshot?t(' (ancien)',' (stale)'):''),root)}
 const label=make('label',t('Importer un rapport JSON local','Import local JSON report'),root),input=make('input','',label);input.type='file';input.accept='.json,application/json';input.onchange=async()=>{try{const file=input.files[0];if(!file||file.size>65536)throw Error('Size');const next=validate(JSON.parse(await file.text()));if(snapshot&&Date.parse(next.observed_at)<Date.parse(snapshot.observed_at))throw Error('Older snapshot');localStorage.setItem(key,JSON.stringify(next));snapshot=next;render()}catch{make('p',t('Rapport refusé. Dernière observation conservée.','Report rejected. Previous observation retained.'),root)}};
 const clear=make('button',t('Effacer le rapport local','Clear local report'),root);clear.className='v23-btn';clear.onclick=()=>{localStorage.removeItem(key);snapshot=null;render()};make('p',t('Import local uniquement. Aucun accès aux comptes ni connexion PC automatique dans cette version.','Local import only. No account access or automatic PC connection in this version.'),root);
 }
 render();let wasStale=isStale(snapshot);const timer=setInterval(()=>{if(!root.isConnected){clearInterval(timer);return}const stale=isStale(snapshot);if(stale!==wasStale){wasStale=stale;const active=document.activeElement;const controls=[...root.querySelectorAll('input,button')];const index=controls.indexOf(active);render();if(index>=0)root.querySelectorAll('input,button')[index]?.focus()}},1000);
}
window.VEKAID_LIVE=Object.freeze({open:liveIntelligence,validate,isStale});
})();
