(()=>{'use strict';
const audit=Object.freeze({date:'2026-11-28',run:'46116826789',urls:23,pass:58,warn:10,fail:0});
function open({layer,locale}){const fr=locale==='fr',t=(a,b)=>fr?a:b;
const b=layer('Security Center',t('Audits et preuves de sécurité','Security audits and evidence'),'<section id="security-evidence" class="v23-section"></section>');
const root=b.querySelector('#security-evidence');
function add(tag,value,parent=root,cls){const n=document.createElement(tag);n.textContent=value;if(cls)n.className=cls;parent.append(n);return n}
add('h3',t('Dernier scan documenté','Last documented scan'));
add('p',audit.date+' · OWASP ZAP · '+audit.urls+' URL');
const group=add('div','',root,'v23-group');
for(const [label,value] of [[t('Contrôles réussis','Passed rules'),audit.pass],[t('Avertissements','Warnings'),audit.warn],[t('Règles FAIL','Failed rules'),audit.fail]]){const row=add('div','',group,'v23-row');add('strong',label,row);add('small',String(value),row)}
add('p',t('Scan passif sur copie locale. Aucun pentest actif validé. Les avertissements ne sont pas des vulnérabilités confirmées.','Passive scan of local copy. No validated active pentest. Warnings are not confirmed vulnerabilities.'),root,'v23-note');
add('p',t('Bandit : erreur interne lors du premier scan. Résultat non valide.','Bandit: internal error on first scan. Result invalid.'),root,'v23-note');
for(const [label,url] of [[t('Rapport original','Original report'),'https://github.com/Vekaid-T-Engine/vekaid-app/actions/runs/'+audit.run],[t('Historique des analyses','Scan history'),'https://github.com/Vekaid-T-Engine/vekaid-app/actions'],[t('Suivi des corrections','Remediation tracking'),'https://github.com/Vekaid-T-Engine/vekaid-app/pull/95']]){const a=add('a',label,root,'v23-btn');a.href=url;a.target='_blank';a.rel='noopener noreferrer'}
add('h3',t('Points à vérifier','Review items'));for(const s of ['CSP','Anti-clickjacking','X-Content-Type-Options','Permissions-Policy','Cache','Private IP disclosure'])add('p',s);
add('p',t('Historique GitHub accessible par les liens. Aucun scan lancé depuis cette interface.','GitHub history available through links. This interface does not launch scans.'),root,'v23-note');
}
window.VEKAID_SECURITY=Object.freeze({open});
})();