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
7. Retour à la ligne dans le titre ou dans un intertitre
8. Titre d'illustration mal placé
9. Légende d'illustration mal placée
10. Paragraphe qui commence par une minuscule
11. Citation stylée en Normal
12. Listes mal formatées
13. Styles inconnus utilisés
14. Incohérence dans la numérotation des notes
15. Arborescences interdites
16. Ponctuation à la fin du titre ou d'un intertitre
17. Mises en formes locales sur le titre
18. Appel de note dans le titre
19. Titre d'illustration en légende
20. Présence de champs d'index Word
21. Remerciement en note 1
22. Composition des mots-cles
23. Hierarchie du plan incohérente
24. Doublons de mots-cles
25. Format de nom d'auteur : capitales, caractères interdits
26. Auteur sans prénom
27. Format d'image non supporté (WMF)
28. Intertitre sur plusieurs paragraphes
29. Caractères Symbol

La liste complète des tests effectués est disponible dans le menu "Informations".