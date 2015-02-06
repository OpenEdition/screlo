Screlo
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

### Forcer les mises à jour

Les mises à jour sont automatiques sous Firefox mais pas sous Chrome (bug #4). Pour forcer la mise à jour, utiliser le bouton "Informations" > "OK" puis accepter la réinstallation du script. 

### Vérifications

La liste complète des tests effectués par Screlo est disponible dans le menu "Informations".

## Développement

1. Cloner le projet
2. Installer Node.js : http://nodejs.org/
3. Installer Grunt : `$ npm install -g grunt-cli` 
4. Installer les dépendances de développement dans le répertoire du projet : `$ npm install`
5. Lancer grunt afin de monitorer les changements : `$ grunt`

Pour réinstaller automatiquement l'userscript dans le navigateur : `$ grunt --userpath="C:\path_to_your_firefox_profile\gm_scripts\screlo"`