ScReLo
======

## Installation

Étape 1 : installer un plugin permettant d'installer des scripts utilisateur sur le navigateur :

- **Pour Firefox :** GreaseMonkey https://addons.mozilla.org/fr/firefox/addon/greasemonkey/
- **Pour Chrome :** Tampermonkey https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=fr

Étape 2 : ouvrir l'URL https://github.com/thomas-fab/screlo/raw/master/js/screlo.user.js avec le navigateur.

Étape 3 : accepter l'installation du script.

## Utilisation

Le script s’exécute automatiquement au chargement de la page quand les scripts utilisateur sont activés.

Pour rétablir un affichage normal de la page, désactiver les scripts utilisateur et recharger la page.

## Forcer les mises à jour

Normalement les mises à jour sont automatiques. Pour forcer une mise à jour, utiliser le bouton "Version". 

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
* arborescences interdites (type ul > h1) = à compléter
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
* acces rapide par l'id
* version + forcer la mise à jour