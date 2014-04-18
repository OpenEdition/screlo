ScReLo
======

## Installation

Étape 1 : installer le plugin GreaseMonkey sur votre navigateur

- **Pour Firefox :** https://addons.mozilla.org/fr/firefox/addon/greasemonkey/
- **Pour Chrome :** Tampermonkey ? A tester : https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=fr

Étape 2 : ouvrir l'URL https://github.com/thomas-fab/screlo/raw/master/js/screlo.user.js avec le navigateur.

Étape 3 : accepter l'installation du script.

Étape 4 : dans le Gestionnaire de modules complémentaires > User Scripts > double-cliquer sur le nom du script > activer les mises à jour automatiques.

## Utilisation

Le script s’exécute automatiquement au chargement de la page quand GreaseMonkey est activé.

## Forcer les mises à jour

Si une mise à jour ne s'applique pas tout de suite :

* vider le cache du navigateur
* réinstaller

## Fonctionnalités 

### Vérifications
    
* article sans auteur (ou absence de nom/prénom)
* article sans facsimile
* article sans pagination ou pagination au mauvais format
* article sans date de publication électronique
* compte rendu sans référence
* signalement des polices Symbol, Wingdings et webdings
* retour chariot dans le titre de l'article
* titreillustration après illustration
* paragraphes qui commencent par une minuscule
* styles de paragraphes inconnus (whitelist)
* numérotation des notes de bas de page
* arborescences interdites (type ul > h1)
* si legendeillustration ^= "Fig" alors c'est que c'est surement un titreillustration
* appel de note dans le titre
	   
    
### Autres (outils)
       
* ajouts de raccourcis vers l'espace d'edition
* coloration des liens hypertextes pour une meilleure identification pendant la relecture
* coloration du nom de famille de l'auteur
* mise en évidence des niveaux de titres
* referenceCopier
* exécution automatique du debugger
* inspecteur de classes des paragraphes (à améliorer) 
		
### Idees d'ajouts
	
* ajouter des tests de validation du contenu des metadonnes/elements (ex: auteur tout en cap = pas bien)
* titreillustration sans illus
* "Document sans titre"
* Auteur sans nom/prenom
* illus sans titre mais avec legendeillustration
* Pas de date de publication papier	
* controler la hierarchie des titres (ex: h2 sans h1)
* tester les mots clés (points, tirets, etc.)
* liens hypertextes dans les titres
* note de bas de page dans le resume
* lien vers le rechargement de l'article (recupere l'id parent)
* titre contenant la string "Annexe" ou "Bilbiographie" dans le bloc normal
* quand une mef locale acceptée par otx (genre bold) est présente sur tout un element display:block => c'est probablement un intertitre raté
* images en wmf, du type : p > img id="img-5.wmf" alt="Image 5.wmf" src="docannexe/image/776/img-5.wmf"
* paragraphes "Normal" qui commencent par /- / ou /[0-9]\./ ou /[0-9]\)/ => probablement des listes ratées
* description auteur entre parenthèses
* résumé qui commence par résumé (et autres trucs du genre)

## Todo
		
* ajouter les notes de lecture au test de reference biblio
* etendre les tests a d'autres vues quand c'est possible (index, table des matières...)
* completer la whitelist des styles
* etendre la Whitelist a d'autres elements que les p
* completer la blackList des arborescences
* ameliorer position titre illus/légende/crédits
* revoir le test : if ($('#notes p:not(".notesbaspage")')) => matche trop souvent ?
* FIXME: le test de la reference electro ne fonctionne que si la page est affichée en français
* FIXME: exclure les § sans retrait du test de la minuscule initiale
* FIXME: signalement impossible quand plusieurs erreurs sur un meme element => probleme avec ::before {content} => ajouter direct dans le DOM
* separer en plusieurs scripts (outils/relecture) ?