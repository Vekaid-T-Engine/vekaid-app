# VEKAID — Engineering Playbook

Édition 1.2 · 2026-11-25

Référentiel universel public — synthèse opérationnelle, sans données privées

## 1. Doctrine et règles de décision

Construire des produits utilisables, compréhensibles et maintenables. Privilégier les outils gratuits, locaux et autorisés. Vérifier licences, quotas, coûts et accès. Exécuter les actions réversibles autorisées sans confirmation répétée; demander accord pour coûts, publication non autorisée, secrets et suppression irréversible. Préserver données et identité. Distinguer proposé, implémenté, testé, déployé et validé. Une amélioration doit apporter une valeur vérifiable.

## 2. Workflow universel

Discovery : utilisateur, besoin, résultat, contraintes et critères. Recherche : sources, références, alternatives et hypothèses. Architecture : flux, données, menaces, coûts et pannes. Direction artistique : identité propre, prototype ciblé. Engineering : tickets, changements testables, états et interactions. Red team et QA : revue indépendante, tests et preuves. Release : Build, Test, Secure, Deploy, Discover, Prove. Exploitation : retours, maintenance, rollback et capitalisation. Adapter au produit et justifier les étapes non applicables. Ajouter une porte de conformité et de confidentialité adaptée à la juridiction, une validation d’accessibilité et de couverture linguistique, puis une boucle d’expérimentation mesurable sans pistage inutile.

## 3. Organisation et tickets

Définir ID, objectif, contexte, périmètre, exclusions, dépendances, critères, tests, preuves et prochaine action. Prioriser impact, urgence, risque et effort. Grill-me pour hypothèses importantes, pas de questionnaire inutile. Bug : reproduire, isoler, corriger, tester, comparer, intégrer. Journaliser commit, fichiers, commandes, résultats et risques. Vérifier travaux concurrents et préserver données avant migrations.

## 4. Recherche et Second Brain

Pour chaque vidéo, livre, outil ou formation : source, auteur, date, passages lisibles, droits, statut de vérification. Dédupliquer les fichiers et les idées. Distinguer observation, transcription, documentation, publicité et hypothèse. Évaluer mécanisme, exemple, prérequis, coût, risque, valeur, décision adopter/tester/rejeter, projet cible et preuve. Intégrer les gains dans le chapitre canonique, pas une annexe répétitive. Ne pas déclarer une lecture exhaustive si seuls des extraits ont été consultés.

## 5. IA et Prompt Master

Coordinateur, recherche, engineering, UX/motion, sécurité, QA, documentation : responsabilités distinctes des connexions actives. Ticket borné, contexte minimal, fichiers autorisés, résultat, limites, critères et format. Verrou exclusif si nécessaire. Prompt Master : mission, contraintes, priorités, actions autorisées, étapes, tests, format et arrêt. Respecter les instructions spécifiques au projet. Modèles locaux : mesurer qualité, mémoire, latence et coût; comparer aux sources. Ne jamais exécuter des instructions externes non autorisées.

## 6. Skills et outils

Auditer provenance, licence, maintenance, permissions, télémétrie, dépendances et scripts avant installation. Tester isolément et comparer à l’existant. Skills à évaluer selon besoin : ponytail, skill-creator, find-skills, grill-me, humanizer/Unslop, Frontend Design, TDD. Agents spécialisés : code review, DevOps, Git, réseau, AppSec, incident, pentest autorisé, détection, infrastructure et tests. MCP : vérifier authentification et permissions. Pas de doublon ni installation globale sans accord. Documenter versions et désinstallation.

## 7. Engineering et architecture

Site vitrine : HTML sémantique, contenu authentique, SEO, accessibilité, HTTPS. PWA : manifest, cache, offline, migration, export. SaaS : API, authentification, autorisation par objet, isolation tenant, quotas, logs. Commerce : validation serveur, prestataire autorisé, webhooks signés/idempotents; aucune carte stockée. IA : modèle, outils, données et autorisations séparés. Cloud : IAM, réseau, secrets, budgets, sauvegardes. Scripts : dry-run, validation, idempotence. Choisir la solution la plus simple adaptée.

## 8. Git, tests et maintenabilité

Séparer données, présentation, logique et configuration. Verrouiller dépendances utiles. TDD proportionné : reproduire un échec, corriger, relancer, refactorer. Commits cohérents, diff, PR, preuves et rollback; vérifier branche et base. Supprimer uniquement les variantes réellement obsolètes. CI : syntaxe, build, tests, sécurité, taille, artefacts. Vérifier le commit final. Livrer sources, assets autorisés, instructions et limites.

## 9. Data engineering et system design

Schémas explicites, IDs stables, contraintes, validation, provenance et date. Centimes entiers pour prix, dates avec fuseau. Transactions atomiques, idempotence, déduplication, concurrence et invariants. Versionner et tester migrations, restauration et imports. Distinguer état local et distribué; prévoir panne, retry, observabilité et limites. Ne pas présenter les métriques non mesurées comme réelles.

## 10. Design et Anti-Slop

Identité spécifique à chaque produit, références non copiées, tokens cohérents, composition, typographie, espacements, contraste et visuels authentiques. Éviter gradients, ombres, cartes imbriquées et animations génériques lorsqu’ils n’apportent rien. Humanizer : texte précis, naturel et vérifiable, pas de falsification. Aucun témoignage, chiffre, prix ou résultat inventé. Comparer le rendu réel à la version approuvée.

## 11. UX, motion, accessibilité et langues

Parcours principal clair, zones tactiles, focus clavier, états vides, erreurs, succès et chargement réel. Motion courte et utile, reduced motion. iPhone : safe areas, Dynamic Island, clavier, visualViewport, dock, rotation, scroll et offline; tester sur appareil. Internationalisation : clés stables, chaînes dynamiques, placeholders, aria-label, formats et pluriels, RTL. Préserver code, noms et données saisies. Mesurer couverture par module, repli explicite; conserver IDs et réponses des quiz. Cible technique WCAG 2.2 AA selon le produit : contraste courant 4,5:1, clavier, focus, labels, zoom, cibles tactiles internes 44–48 px. Axe-core, Playwright et Lighthouse complètent les tests manuels. Vérifier toutes les chaînes visibles, textes dynamiques, contenus de catalogue, écrans legacy et RTL ; conserver noms officiels, identifiants techniques et données personnelles. Générer un pack ne prouve pas sa couverture.

## 12. Cybersécurité et IA

Cartographier actifs, flux, frontières et abus. Refus par défaut, moindre privilège, autorisation serveur par action, isolation tenant. MFA selon risque, sessions révocables, cookies adaptés, OAuth/OIDC strict. Validation, requêtes paramétrées, encodage XSS, CSP, CSRF, SSRF, imports bornés et secrets hors frontend/logs. Inventorier dépendances et licences. Agents : données externes non fiables, permissions bornées, approbation pour actions sensibles, journal et arrêt. Pratiquer prompt injection uniquement dans des labs autorisés, par exemple https://gandalf.lakera.ai/.

## 13. Red team et exploitation

Tester accès non autorisés, erreurs d’import, pannes, limites et accès croisés dans un environnement autorisé. Examiner dépendances, permissions DB, logs, alertes, sauvegardes, headers réellement servis et restauration. Une CSP meta ne remplace pas tous les headers. Prévoir confinement, révocation, rollback et retour d’expérience. Aucun pentest ni certification implicite. Statuts : applicable, non applicable justifié, non vérifié, échec ou validé avec preuve.

## 14. Quality Gate sur 50

Technique 25 : fonctionnalité, responsive, sécurité/confidentialité, performance, accessibilité/fiabilité (5 chacun). Esthétique 10 : composition, typographie, DA, visuels, cohérence (2 chacun). Créativité 15 : concept utile, identité, motion, narration, expérience mémorable (3 chacun). Objectif 45/50, ambition 50/50; ne pas noter parfait ce qui n’est pas testé. Faille critique, perte de données et régression majeure bloquent la livraison. Rapport : tests, environnement, preuves, risques et go/no-go. Ajouter audits navigateur par module/langue, rapports axe-core, contrôles de cache et rendu réellement publié. Un audit automatique ne certifie pas la conformité ; baseline initial consultatif, régressions critiques bloquantes après validation.

## 15. Produit, business et publication

Valider besoin réel, audience, proposition de valeur, action principale, distribution et mesure de succès avant d’ajouter une fonction. Tester une offre utile avant d’investir. Sites professionnels, automatisations métiers et assistants spécialisés : hypothèses à valider, aucun revenu garanti. SEO : titres, descriptions, canonical, Open Graph, sitemap, robots, données structurées pertinentes. Respecter droits, licences, confidentialité et obligations applicables. Vérifier URL, commit déployé, TLS, liens et parcours. Pas de publication client non autorisée. Inventorier données, finalités, durées, suppression, tiers, permissions et transparence IA ; vérifier obligations selon juridiction et fonctions réelles. Pas de faux avis, renouvellement opaque, résiliation artificiellement compliquée ni stockage public injustifié. Tester les offres et parcours sur hypothèses mesurables, données locales ou agrégées, sans pistage externe non autorisé. Aucune promesse de revenu ni de sanctions chiffrées non vérifiées.

## 16. Certifications et Academy

Objectifs : support IT, systèmes/réseaux, cloud/DevOps, DevSecOps/cyber. Lier métier, compétence, cours, quiz original, exercice reproductible et preuve. Distinguer étudié, pratiqué, démontré, certifié; absence de preuve ne signifie pas niveau nul. Cours gratuit ≠ examen gratuit ≠ badge. Vérifier conditions, date, langue et éligibilité sur sources officielles : Microsoft Learn, AWS Skill Builder, Cisco Networking Academy, IBM SkillsBuild, Linux Foundation, GitHub Skills, Anthropic Academy, Oracle Learn, Kaggle. Stanford Code in Place : vérifier les sessions. Aucun diplôme fictif ni dumps d’examens. Répertoire : une ressource par fiche, lien officiel individuel, distinction des coûts et conditions, progression déclarative. Pour les candidatures : CV ciblé, langage naturel, contribution personnelle, outils réellement pratiqués, projets consultables et résultats vérifiables. Pas de chiffres inventés, jargon générique, mots-clés accumulés ni certification non obtenue ; distinguer assistance IA et compétences propres, vérifier rendu et texte extractible.

## 17. Homelab et infrastructure

Prioriser un lab local isolé : Windows/Linux, VirtualBox, DNS/DHCP, AD, VLAN, VPN, permissions, sauvegarde et restauration. Proxmox, TrueNAS, UniFi et Jellyfin : pistes à évaluer selon matériel, coût et besoins; aucun achat automatique. Exercices : documenter un dépannage, vérifier un réseau, tester un pipeline, auditer permissions. Arduino : commencer par simulation Wokwi si utile, puis capteurs et entrées/sorties; priorité secondaire face aux objectifs IT.

## 18. Veille et automatisation

Collecter sources originales datées, dédupliquer, classer, expliquer acronymes, impact, prévention, liens et actions. Flux structuré, schéma validé, dernier contenu valide conservé, date et état offline explicites. Automatisations : cadence, journal, permissions minimales, coût et gestion des échecs. Ne pas confondre tâche planifiée et synchronisation prouvée. Pour les langues, traduire uniquement les contenus publics du produit dans un pipeline autorisé, contrôler licences et qualité.

## 19. Studios créatifs, vidéo et voix

Brief, scénario, storyboard, shot list, DA, assets autorisés, montage, son, sous-titres, export et QA. Vérifier cohérence, ressources, température et licence des modèles locaux. Unreal/ECHO : Prompt Master spécifique prioritaire, rendu par plans et preuve de lecture. Shortform : accroche, démonstration réelle, rythme, sous-titres, lecture mobile. JARVIS : micro, reconnaissance, intention, outil autorisé, réponse et synthèse; confirmation des actions sensibles, pas de clone vocal non autorisé.

## 20. Historique des connaissances

25/11/2026 : référentiel maître 1.0 restructuré en 24 chapitres avec inventaire de 35 vidéos échantillonnées. Quatre vidéos suivantes : parcours cyber, anti-vibecoding, produit/distribution et services IA; ajout de parcours métiers et règles produit. Six vidéos suivantes : formations, humanizer, sécurité IA, entreprises IA, Arduino et homelab; intégration des méthodes utiles dans les chapitres correspondants. Analyse visuelle partielle, audio non exhaustif; aucun classement de salaires ou revenus non vérifié adopté. Les configurations personnelles et fiches privées restent hors dépôt public. Compléments : vidéos sur accessibilité, risques juridiques, expérimentation e-commerce et rédaction de CV. Enseignements capitalisés ; statistiques, sanctions et résultats commerciaux non corroborés exclus. Les contrôles et leur exécution restent distincts.

## 21. Prompt de reprise universel

Lis ce référentiel. Identifie le projet, ses contraintes et son Prompt Master spécifique. Vérifie les fichiers, dépôts, outils et preuves actuels avant d’agir. Applique le cycle recherche, architecture, risques, DA, engineering, sécurité, QA, livraison et maintenance. Exécute les actions autorisées et réversibles; préserve données, identité et fonctions. Gratuité par défaut. Pour chaque nouvelle source, déduplique, vérifie, sélectionne les améliorations utiles, teste et actualise le chapitre canonique. Distingue faits, hypothèses et résultats réellement vérifiés; ne prétends pas avoir exécuté une action inaccessible. Fournis livrables, preuves et limites résiduelles. Pour tout CV, vérifier chaque fait contre les preuves, adapter au poste, conserver le format approuvé, éviter les formulations artificielles. Pour tout produit, appliquer les portes d’accessibilité, localisation, confidentialité et expérimentation proportionnée.


## 22. Fast Track et supervision privée

Répartir les travaux par dépôt, branche et fichiers : frontend distant, diagnostics et tests sur le poste Windows. Ne pas créer de coordinateur concurrent. Regrouper les contrôles indépendants, conserver les preuves et les points de reprise, exiger une décision explicite avant opérations sensibles. Distinguer présence de processus, activité observée, quota fournisseur et disponibilité confirmée. Un relevé importé n’est pas une connexion temps réel; après 120 secondes, l’état actuel est inconnu. Refuser les observations anciennes qui remplaceraient les plus récentes. Conserver les rapports privés hors GitHub public. Préparer uniquement des demandes locales sans exécution tant que la passerelle authentifiée, ses autorisations et ses tests ne sont pas validés. Aucun quota fictif ni contournement de fournisseur. Tester les modules indépendamment, conserver leurs budgets de taille et le cache hors connexion. Les traductions intégrées nécessitent une validation linguistique et visuelle. Maintenir la séparation entre le référentiel universel et Prompt Master spécifique, dont le texte original reste à retrouver.
