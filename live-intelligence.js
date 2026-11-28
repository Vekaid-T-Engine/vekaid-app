(()=>{'use strict';
 function validate(v,now=Date.now()){
 if(!v||typeof v.observed_at!=='string'||v.format!=='vekaid.live.v1'||!Number.isFinite(Date.parse(v.observed_at))||Date.parse(v.observed_at)>now+60000||!Array.isArray(v.providers)||v.providers.length>5)throw Error('Invalid snapshot');
 const providers=['claude','codex','chatgpt-images','ollama','wangp'];const seen=new Set();const rows=v.providers.map(p=>{if(!p||!providers.includes(p.id)||seen.has(p.id)||!['unknown','process-present','process-absent','limited','available','busy'].includes(p.state))throw Error('Invalid provider');seen.add(p.id);const q=p.used_percent;if(q!=null&&(!Number.isFinite(q)||q<0||q>100))throw Error('Invalid percentage');return {id:p.id,state:p.state,used_percent:q??null,reset_at:typeof p.reset_at==='string'&&Number.isFinite(Date.parse(p.reset_at))?p.reset_at:null}});
 const h=v.hardware||{},hardware={};for(const k of ['cpu_percent','ram_percent','gpu_percent','gpu_temperature_c','vram_percent','storage_percent'])if(Number.isFinite(h[k])&&h[k]>=0&&h[k]<= (k==='gpu_temperature_c'?150:100))hardware[k]=h[k];for(const [k,part,total,invert] of [['vram_percent','vram_used_mib','vram_total_mib',false],['storage_percent','storage_free_bytes','storage_total_bytes',true]]){const a=h[part],b=h[total];if(Number.isFinite(a)&&Number.isFinite(b)&&b>0&&b<=Number.MAX_SAFE_INTEGER&&a>=0&&a<=b)hardware[k]=Math.round(1000*(invert?1-a/b:a/b))/10}return {format:v.format,observed_at:v.observed_at,providers:rows,hardware};
 }

const {languages,labels}=window.VEKAID_LIVE_LOCALES;
function translate(a,b,locale){const row=labels.find(x=>x[0]===a);return row?.[languages.indexOf(locale)]||b||a}
function isStale(snapshot,now=Date.now()){return !snapshot||now-Date.parse(snapshot.observed_at)>=120000}
function acceptSnapshot(previous,input,now=Date.now()){const next=validate(input,now);if(previous&&Date.parse(next.observed_at)<Date.parse(previous.observed_at))throw Error('Older snapshot');return next}

function bridgeURL(raw){const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password||u.port||!u.hostname.endsWith('.ts.net')||u.pathname!=='/'||u.search||u.hash)throw Error('Private HTTPS address required');return u.origin+'/v1/snapshot'}
async function fetchSnapshot(endpoint,token,signal){const r=await fetch(endpoint,{headers:{Authorization:'Bearer '+token},cache:'no-store',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal});if(!r.ok)throw Error('Bridge unavailable');const reader=r.body?.getReader();if(!reader)throw Error('Missing body');let size=0;const chunks=[];try{for(;;){const x=await reader.read();if(x.done)break;size+=x.value.byteLength;if(size>65536)throw Error('Size');chunks.push(x.value)}}finally{await reader.cancel().catch(()=>{})}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes))}
const importedMissionStates = Object.freeze({"queued":["En attente","Queued"],"approved":["Approuvée","Approved"],"running":["En cours","Running"],"completed":["Terminée","Completed"],"failed":["En échec","Failed"],"expired":["Expirée","Expired"],"interrupted":["Interrompue","Interrupted"]});
let sessionPairing=null;
function liveIntelligence({locale,layer,$}){
 const t=(a,b)=>translate(a,b,locale);
 const body=layer('Live Intelligence',t('Supervision locale · aucune donnée inventée','Local monitoring · no invented data'),'<div id="live-monitor"></div>');
 const root=$('#live-monitor',body),key='vekaid.live.snapshot.v1',providers=['claude','codex','chatgpt-images','ollama','wangp'];
 const make=(tag,txt,parent,cls)=>{const n=document.createElement(tag);n.textContent=txt;if(cls)n.className=cls;parent.append(n);return n};
 const button=(txt,parent,fn)=>{const n=make('button',txt,parent,'v23-btn');n.type='button';n.onclick=fn;return n};
 let snapshot=null,wasStale=true,revision=0,bridge=null,requestController=null,source='saved';
 try{snapshot=validate(JSON.parse(localStorage.getItem(key)))}catch{}
 const status=make('section','',root,'live-card live-status');status.setAttribute('role','status');
 const connection=make('section','',root,'live-card');make('h3',t('Connexion privée','Private connection'),connection);make('p',t('Lecture seule · aucune commande distante','Read only · no remote command'),connection,'live-muted');
 const addrLabel=make('label',t('Adresse HTTPS du PC','PC HTTPS address'),connection,'live-label');const address=make('input','',addrLabel);address.type='url';address.autocomplete='off';address.placeholder='https://…ts.net';make('p',t('Utilise l’adresse HTTPS réelle fournie par Tailscale Serve et le jeton privé du pont Windows. Le PC doit être allumé.','Use the actual HTTPS address from Tailscale Serve and the private Windows bridge token. The PC must be on.'),connection,'live-muted');
 const tokenLabel=make('label',t('Jeton de connexion','Connection token'),connection,'live-label');const secret=make('input','',tokenLabel);secret.type='password';secret.autocomplete='off';secret.spellcheck=false;
 const linkStatus=make('p','',connection,'live-feedback');linkStatus.setAttribute('role','status');
 const connect=button(t('Connecter','Connect'),connection,()=>{let endpoint;try{endpoint=bridgeURL(address.value.trim());if(!/^[A-Za-z0-9_-]{32,256}$/.test(secret.value.trim()))throw Error('token')}catch{linkStatus.textContent=t('Adresse ou jeton invalide','Invalid address or token');return}stopBridge();bridge={endpoint,token:secret.value.trim(),next:0};sessionPairing={endpoint,token:secret.value.trim()};secret.value='';connect.disabled=true;disconnect.disabled=false;poll()});
 const disconnect=button(t('Déconnecter','Disconnect'),connection,()=>{stopBridge();linkStatus.textContent=''});disconnect.disabled=true;
 function stopBridge(forget=true){if(forget)sessionPairing=null;bridge=null;requestController?.abort();requestController=null;connect.disabled=false;disconnect.disabled=true}
 async function poll(){const current=bridge;if(!current||requestController||!root.isConnected)return;const controller=new AbortController();requestController=controller;current.next=Date.now()+15000;const timeout=setTimeout(()=>controller.abort(),8000);if(!snapshot)linkStatus.textContent=t('Connexion en cours…','Connecting…');try{const raw=await fetchSnapshot(current.endpoint,current.token,controller.signal);if(bridge!==current||!root.isConnected)return;const next=acceptSnapshot(snapshot,raw);localStorage.setItem(key,JSON.stringify(next));snapshot=next;source='private';render();linkStatus.textContent=t('Dernier relevé reçu','Last snapshot received')}catch{if(bridge===current)linkStatus.textContent=t('Connexion indisponible · dernier relevé conservé','Connection unavailable · last snapshot retained')}finally{clearTimeout(timeout);if(requestController===controller)requestController=null}}
 const agents=make('section','',root,'live-card');make('h3',t('IA / Agents','AI / Agents'),agents);
 const rows=make('div','',agents,'live-providers');
 const routing=make('p','',agents,'live-muted');
 const hardware=make('section','',root,'live-card');make('h3',t('Matériel','Hardware'),hardware);
 const metrics=make('div','',hardware,'live-metrics');
 const imports=make('section','',root,'live-card');
 const label=make('label',t('Importer un rapport JSON local','Import local JSON report'),imports,'live-label');
 const input=make('input','',label,'live-file');input.type='file';input.accept='.json,application/json';input.id='live-report-file';
 const feedback=make('p','',imports,'live-feedback');feedback.setAttribute('role','status');
 const clear=button(t('Effacer le rapport local','Clear local report'),imports,()=>{revision++;try{localStorage.removeItem(key)}catch{feedback.textContent=t('Rapport refusé. Dernière observation conservée.','Report rejected. Previous observation retained.');return}stopBridge();linkStatus.textContent='';snapshot=null;source='local';input.value='';feedback.textContent='';render()});
 const deck=make('section','',root,'live-card');make('h3','Command Deck',deck);
 make('p',t('Brouillon uniquement · aucune commande envoyée','Draft only · no command sent'),deck,'live-muted');
 const prepare=button(t('Préparer un diagnostic','Prepare a diagnostic'),deck,()=>{if(!draft.hidden){draft.querySelector('textarea').focus();return}draft.hidden=false;prepare.setAttribute('aria-expanded','true');draft.querySelector('textarea').focus()});
 prepare.setAttribute('aria-expanded','false');prepare.setAttribute('aria-controls','live-draft');
 const draft=make('div','',deck,'live-draft');draft.id='live-draft';draft.hidden=true;
 const field=make('label',t('Demander un nouveau relevé Windows','Request a new Windows snapshot'),draft,'live-label');
 const request=make('textarea','',field);request.readOnly=true;request.rows=2;request.value=t('Demander un nouveau relevé Windows','Request a new Windows snapshot');
 button(t('Copier la demande locale','Copy local request'),draft,async()=>{try{await navigator.clipboard.writeText(request.value)}catch{request.focus();request.select()}});
 make('p',t('Lecture seule · aucune commande distante','Read only · no remote command'),root,'live-muted');
 function render(){
 const stale=isStale(snapshot);wasStale=stale;
 status.textContent=snapshot?t('Dernière observation : ','Last observation: ')+new Date(snapshot.observed_at).toLocaleString(locale)+(stale?t(' · périmée',' · stale'):(source==='private'?t(' · récente, connexion privée',' · recent, private connection'):source==='saved'?t(' · relevé enregistré',' · saved snapshot'):t(' · récente, import local',' · recent, local import'))):t('Aucune source connectée','No source connected');
 const engine=window.VEKAID_AUTONOMY;
 const diagnostic=engine&&window.VEKAID_AUTONOMY_DIAGNOSTIC?.inspect(engine,snapshot,source);
 routing.hidden=!diagnostic?.observedAt;
 routing.textContent=diagnostic&&diagnostic.eligibleAgents.length===0
   ? t('Aucun agent vérifié pour une mission','No agents verified for mission routing') : '';
 rows.replaceChildren();metrics.replaceChildren();
 for(const id of providers){const row=make('div','',rows,'live-provider');make('strong',({'claude':'Claude Code','codex':'Codex','chatgpt-images':'ChatGPT Images','ollama':'Ollama','wangp':'WanGP'})[id],row);const p=snapshot?.providers.find(x=>x.id===id),states={'unknown':t('Inconnu','Unknown'),'process-present':t('Processus détecté, activité inconnue','Process detected, activity unknown'),'process-absent':t('Processus non détecté','Process not detected'),'limited':t('Limité','Limited'),'available':t('Disponible selon la source','Available according to source'),'busy':t('Occupé selon la source','Busy according to source')};make('small',stale?t('État actuel inconnu','Current state unknown'):states[p?.state||'unknown'],row);if(p?.used_percent!=null)make('small',t('Dernière utilisation : ','Last usage: ')+p.used_percent+'%',row);if(p?.reset_at)make('small',t('Renouvellement annoncé : ','Reported reset: ')+new Date(p.reset_at).toLocaleString(locale),row)}
 for(const [k,name] of Object.entries({cpu_percent:'CPU',ram_percent:'RAM',gpu_percent:'GPU',gpu_temperature_c:t('Température GPU','GPU temperature'),vram_percent:'VRAM',storage_percent:t('Stockage','Storage')})){const card=make('div','',metrics,'live-metric');make('small',name,card);make('strong',(snapshot?.hardware[k]??'—')+(snapshot?.hardware[k]!=null?(k==='gpu_temperature_c'?' °C':' %'):''),card);if(stale&&snapshot)make('small',t(' (ancien)',' (stale)'),card)}
 clear.disabled=!snapshot;
 }
 input.onchange=async()=>{const ticket=++revision;const file=input.files[0];if(!file)return;try{if(file.size>65536)throw Error('Size');const raw=await file.text();if(ticket!==revision||!root.isConnected)return;const incoming=JSON.parse(raw);if(incoming?.format==='vekaid.diagnostic.mission.v1'){const mission=window.VEKAID_AUTONOMY_DIAGNOSTIC.readMissionStatus(incoming);feedback.textContent=t('Mission importée','Imported mission')+' · '+mission.id+' · '+t(...importedMissionStates[mission.state]);return}const next=acceptSnapshot(snapshot,incoming);localStorage.setItem(key,JSON.stringify(next));snapshot=next;source='local';feedback.textContent='';render()}catch{if(ticket===revision&&root.isConnected)feedback.textContent=t('Rapport refusé. Dernière observation conservée.','Report rejected. Previous observation retained.')}finally{if(ticket===revision)input.value=''}};
 render();if(sessionPairing){bridge={...sessionPairing,next:0};address.value=new URL(bridge.endpoint).origin;connect.disabled=true;disconnect.disabled=false;poll()}const timer=setInterval(()=>{if(!root.isConnected){stopBridge(false);clearInterval(timer);return}if(isStale(snapshot)!==wasStale)render();if(bridge&&Date.now()>=bridge.next)poll()},1000);
}
window.VEKAID_LIVE=Object.freeze({open:liveIntelligence,validate,isStale,acceptSnapshot,bridgeURL,fetchSnapshot,translate,languages:Object.freeze(languages.slice())});
})();
