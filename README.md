Screlo - Script de relecture pour Lodel
======

## Installation

**Attention ! Les ressources sont actuellement récupérées via http://rawgit.com version dev/testing. Ne pas utiliser en production en l'état, sinon risque de blacklisting.**

Étape 1 : installer un plugin permettant d'installer des scripts utilisateur sur le navigateur :

- **Pour Firefox :** GreaseMonkey https://addons.mozilla.org/fr/firefox/addon/greasemonkey/
- **Pour Chrome :** Tampermonkey https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=fr

Étape 2 : ouvrir l'URL https://github.com/brrd/screlo/raw/master/dist/screlo.user.js avec le navigateur.

Étape 3 : accepter l'installation du script.

## Utilisation

Le script s’exécute automatiquement au chargement de la page quand les scripts utilisateur sont activés.

Pour rétablir un affichage normal de la page, désactiver les scripts utilisateur et recharger la page.

### Forcer les mises à jour

Les mises à jour sont automatiques sous Firefox mais pas sous Chrome (bug #4). Pour forcer la mise à jour, utiliser le bouton "A propos" > "Mise à jour" puis accepter la réinstallation du script. 

### Documentation

La liste complète des tests effectués par Screlo et des messages d'aide est disponible dans le dossier `doc` : https://github.com/brrd/screlo/raw/master/doc/ (document généré automatiquement d'après le code source).

## Développement

1. Cloner le projet
2. Installer Grunt : `$ npm install -g grunt-cli` 
3. Installer les dépendances de développement dans le répertoire du projet : `$ npm install`
4. `$ grunt` pour la génération du projet (voir les options ci-dessous)

### Options Grunt

* Réinstaller automatiquement l'userscript dans le navigateur : `$ grunt --userpath="C:\path_to_your_firefox_profile\gm_scripts\screlo"` où `--userpath` est le répertoire où copier `screlo.user.js`.
* Copier les ressources sur `localhost` (utile pour contourner les *local files security policy* du navigateur) : `$ grunt --www="C:\path_to_www" --subfolder="screlo_dir_in_www"` où `--www` est le chemin de www sur le disque local et `--subfolder` le dossier où copier les ressources.
* Utiliser les urls de la branche `develop` : `$ grunt --develop`

**Remarque :** les chemins vers les répertoires passés en argument ne doivent **pas** se terminer par `/` ou `\`.

### Autres tâches

* Générer la liste des tests et des informations dans `docs/` à partir de `src/tests-revues.js` : `$ grunt buildinfos`