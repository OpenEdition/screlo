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

## Forcer les mises à jour

Les mises à jour sont automatiques sous Firefox mais pas sous Chrome (bug #4). Pour forcer la mise à jour, utiliser le bouton "Informations" > "OK" puis accepter la réinstallation du script. 

## Vérifications

Screlo effectue les tests suivants :

1. Absence d'auteur
2. Absence de facsimilé
3. Erreur de pagination
4. Pas de date de publication électronique (numéro)
5. Compterendu/notedelecture sans référence
6. Utilisation de police(s) non Unicode
7. Retour à la ligne dans le titre
8. Retour à la ligne dans les intertitres
9. Titres d'illustrations mal placés
10. Paragraphes qui commencent par une minuscule
11. Listes mal formatées
12. Styles inconnus utilisés
13. Incohérence dans la numérotation des notes
14. Arborescences interdites
15. Ponctuation à la fin des intertitres
16. Mises en formes locales sur le titre
17. Appel de note dans le titre
18. Titre d'illustration en légende
19. Présence de champs d'index Word
20. Remerciement en note 1
21. Composition des mots-cles
22. Hierarchie du plan incohérente
23. Doublons de mots-cles
24. Format de nom d'auteur : capitales, caractères interdits
25. Auteur sans prénom

La liste complète des tests effectués est disponible dans le menu "Informations".