(function(root){'use strict';
const locales=typeof module!=='undefined'&&module.exports?require('./code-locales.js'):root.VEKAID_CODE_LOCALES;
const rules=[
[/^\s*(?:import\s+\w+|from\s+\S+\s+import\s+)/,'Importe des modules pour réutiliser leurs fonctionnalités.','Imports modules to reuse their functionality.'],
[/^\s*(?:const|let|var)\s+\w+/,'Déclare une variable ou une constante.','Declares a variable or constant.'],
[/^\s*(?:def|function)\s+\w+/,'Définit une fonction réutilisable ; son corps ne s’exécute que lorsqu’elle est appelée.','Defines a reusable function; its body runs when called.'],
[/^\s*(?:for|foreach|while)\b/i,'Répète des instructions selon une collection ou une condition.','Repeats instructions over a collection or condition.'],
[/^\s*(?:if|elif|else|switch)\b/,'Choisit un chemin selon une condition.','Chooses a path depending on a condition.'],
[/^\s*return\b/,'Renvoie un résultat et quitte la fonction.','Returns a result and exits the function.'],
[/\b(?:print|console\.log|Write-Host|echo)\s*\(?/i,'Affiche une information dans la sortie du programme.','Displays information in the program output.'],
[/\bos\.listdir\s*\(/,'Demande la liste des entrées d’un répertoire.','Requests the entries of a directory.'],
[/\b(?:fetch|requests\.(?:get|post)|Invoke-WebRequest|curl)\b/i,'Peut envoyer une requête réseau ; vérifier la destination et les données transmises.','May send a network request; check its destination and transmitted data.'],
[/^\s*(?:\$?\w+)\s*=(?!=)/,'Affecte une valeur à une variable.','Assigns a value to a variable.'],
[/^\s*(?:SELECT|INSERT|UPDATE|DELETE)\b/i,'Instruction SQL possible : consulte ou modifie des données selon la commande.','Possible SQL statement: reads or changes data depending on the command.'],
[/^\s*<\/?[a-z][^>]*>/i,'Balise de structure HTML ou XML.','HTML or XML structural tag.']
];
const risks=[
[/\b(?:eval|exec|Invoke-Expression|iex)\s*\(/i,'Exécution dynamique possible : ne jamais lancer une entrée inconnue.','Possible dynamic execution: never run untrusted input.'],
[/\b(?:rm\s+-[^\n]*r|Remove-Item|os\.remove|shutil\.rmtree|DROP\s+TABLE)\b/i,'Suppression possible de fichiers ou de données.','Possible deletion of files or data.'],
[/\b(?:subprocess\.|os\.system|child_process|Start-Process|sudo)\b/i,'Lancement de processus ou commande système possible.','Possible process launch or system command.'],
[/\b(?:fetch\s*\(|requests\.|curl\s|Invoke-WebRequest|socket\.)/i,'Communication réseau possible.','Possible network communication.'],
[/\b(?:api[_-]?key|password|secret|token)\s*[:=]\s*["'][^"']+/i,'Secret potentiel : ne pas partager cet extrait sans le masquer.','Potential secret: redact before sharing.']
];
function analyze(input,language='auto',locale='fr'){
const code=String(input||'');if(!code.trim()||code.length>20000)throw Error('Input length');const pick=(a,b)=>locales.translate(a,b,locale);
const candidates=[['Python',/^\s*(?:def\s+\w+\(|from\s+\S+\s+import\s+|import\s+\w+)|\bprint\s*\(/m],['JavaScript',/\b(?:const|let|function)\s+\w+|console\.log|=>/],['PowerShell',/\b(?:Get-Item|Get-ChildItem|Write-Host|Invoke-WebRequest|Remove-Item)\b|\$\w+\s*=/i],['Bash',/^#!.*(?:bash|\/sh)|^\s*(?:echo\s|fi\s*$|sudo\s)/m],['SQL',/\bSELECT\b[\s\S]*\bFROM\b|\bCREATE\s+TABLE\b/i],['HTML',/<(?:html|div|body|p|script)\b/i]];
const matches=candidates.filter(([,re])=>re.test(code));const detected=language==='auto'?(matches.length===1?matches[0][0]:pick('Indéterminé ou mixte','Unknown or mixed')):language;
const lines=code.split(/\r?\n/).map((text,i)=>{if(!text.trim())return null;const found=rules.filter(([re])=>re.test(text));return {number:i+1,text,recognized:found.length>0,explanation:found.length?found.map(r=>pick(r[1],r[2])).join(' '):pick('Instruction non reconnue par les règles locales.','Instruction not recognized by local rules.')}}).filter(Boolean);
return {language:detected,lines,warnings:risks.filter(([re])=>re.test(code)).map(r=>pick(r[1],r[2])),recognized:lines.filter(l=>l.recognized).length};
}
function mount(host){const locale=localStorage.getItem('vekaid.locale')||'fr',t=(a,b)=>locales.translate(a,b,locale);
const el=(tag,text,parent=host)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n};
const box=el('section','');box.className='vek-code-intel';el('h3','Code Intelligence',box);el('p',t('Analyse locale par règles, sans IA ni exécution. Les résultats sont partiels et ne prouvent pas que le code est sûr.','Local rule-based analysis, no AI or execution. Results are partial and do not prove code is safe.'),box);
const label=el('label',t('Code à comprendre','Code to understand'),box);const input=el('textarea','',label);input.maxLength=20000;input.rows=8;input.dir='ltr';input.setAttribute('data-vek-user-content','');input.spellcheck=false;
const langLabel=el('label',t('Langage','Language'),box);const select=el('select','',langLabel);for(const v of ['auto','Python','JavaScript','PowerShell','Bash','SQL','HTML']){const o=el('option',v==='auto'?t('Automatique','Automatic'):v,select);o.value=v}
const button=el('button',t('Analyser le code','Analyze code'),box);button.type='button';const output=el('section','',box);output.setAttribute('aria-live','polite');input.addEventListener('input',()=>{output.replaceChildren()});button.onclick=()=>{output.replaceChildren();if(!input.value.trim()){el('p',t('Colle un extrait de code.','Paste a code snippet.'),output);return}const r=analyze(input.value,select.value,locale);el('h4',t('Langage : ','Language: ')+r.language,output);el('p',r.recognized+'/'+r.lines.length+t(' lignes reconnues par les règles.',' lines recognized by rules.'),output);el('h4',t('Points de vigilance','Risk indicators'),output);if(!r.warnings.length)el('p',t('Aucun motif connu repéré ; cela ne garantit pas la sécurité.','No known pattern found; this does not guarantee safety.'),output);for(const w of r.warnings)el('p',w,output);el('h4',t('Explication ligne par ligne','Line-by-line explanation'),output);for(const l of r.lines){const row=el('div','',output);row.className='vek-code-line';const pre=el('pre',l.number+' · '+l.text,row);pre.dir='ltr';pre.setAttribute('data-vek-user-content','');el('p',l.explanation,row)}};
const copy=el('button',t('Copier une demande pour ChatGPT','Copy request for ChatGPT'),box);copy.type='button';copy.onclick=async()=>{if(!input.value.trim())return;const prompt=t('Explique ce code pour un débutant, ligne par ligne, avec glossaire, risques et exercice. Ne l’exécute pas.','Explain this code for a beginner, line by line, with glossary, risks and exercise. Do not execute it.')+'\n\n'+input.value;try{await navigator.clipboard.writeText(prompt);el('p',t('Demande copiée. Vérifie les secrets avant de la partager.','Request copied. Check for secrets before sharing.'),output)}catch{el('p',t('Copie indisponible.','Clipboard unavailable.'),output)}};
}
const api={analyze,mount,translate:locales.translate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.VEKAID_CODE=api;
})(typeof window!=='undefined'?window:globalThis);
