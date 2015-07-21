# Todo

Pistes de développement et idées de nouveaux tests pour screlo.

## Numero

* Signaler l'utilisation d'une "Note de la rédaction" à la place de l'"Introduction de la publication"
* Vérifier le lien "Commander ce numéro"
* Signaler les documents en double dans le sommaire

## Typographie des documents

* Signaler les paragraphes (ou notes de bas de page) qui commencent par un retour chariot
* Signaler les appel de notes dans des `<sup>` qui provoquent des doubles exposants. Exemple : `<sup><a id="bodyftn19" class="footnotecall" href="#ftn19">19</a></sup>`
* Signaler les titres (ou autres éléments : description d'auteur, intertitre...) contenus dans des `<sup>` (problème fréquent avec le stylage dans Word). Éventuellement insérer la coloration des balise exposant dans le debugger.
* Vérifier la typographie dans le document : insécables avant la ponctuation double, utilisation de trois points au lieu des points de suspension, apostrophes/guillemets droits, etc.
* Signaler les liens hypertexte inactifs
* Vérifier la capitale initiale du titre/sous-titre/intertitre (test à appliquer aux publications également)
* Signaler les titres/sous-titres/intertitres en capitales intégrales
* Signaler les titres/sous-titres/intertitres intégralement en gras, en italiques, etc.

## Métadonnées du document

* Si le parent est "Comptes-rendus" ou "Note de lecture", signaler quand le document est d'un autre type
* Signaler les codes de langue stylés en description auteur (erreur de stylage relativement fréquente)

## Stylage du document

* Signaler quand le texte se termine par un intertitre (exemple : "Références bibliographiques")
* Signaler quand la légende d'illustration commence par "source" ou "credit" etc. : c'est que c'est un crédit. Il y a probablement d'autres variantes.
* Signaler quand un séparateur est précédé ou suivi par un paragraphe de type autre que "Normal"
* Signaler quand du texte (autre que *, - etc.) est stylé en "Séparateur"
* Signaler les liens cachés, càd les liens dont l'url n'est pas explicite (recommandation)
* Signaler les images dans les intertitres
* Signaler les images stylées en  "Légende illustration" et "Crédits illustration" (erreur fréquente) (en fait il faudrait plutôt énumérer les styles autorisés pour les images)
* Signaler les images d'accroche et/ou illustrations insérées en .tif
* Signaler l'absence d'image ou de tableau lorsque le style "Titre illustration" est utilisé.
* Vérifier que les styles "Question" et "Réponse" sont utilisés conjointement
* Signaler les URL qui contiennent un zwsp (https://fr.wikipedia.org/wiki/Espace_sans_chasse)
* Signaler la présence de note dans le titre de l'illustration (il s'agit probablement d'un crédit ou d'une légende)

## Index

* Vérifier la présence de capitale initiale pour les personnes
* Signaler les noms composés
* Signaler les noms d'auteurs comprenant la chaîne "et" (erreur fréquente)
* Signaler les auteurs dont le nom de famille est "(dir)"
* Signaler les mots-clés "Mots clés :" ou "Keywords:" etc. (qui précèdent souvent la liste des mots clés)

## Bugs et améliorations des tests

* Plusieurs tests reposent sur des tests de mots. Ils sont généralement effectués en français et parfois en anglais. Il est possible d'étendre ces tests à d'autres langues.
* Signaler les appels de notes hors du texte (plutôt qu'uniquement dans le titre)
* Test "Citations" : on peut éliminer la plupart des faux positifs en 1) testant également les guillemets fermants, 2) testant également la présence d'autres guillemets ouvrants dans le paragraphe, 3) ne testant que les p.texte
* Ajouter des marqueurs au test "Incohérence dans la numérotation des notes"
* Les tests #10 (Caractère minuscule en début de paragraphe)   et #12 (Listes mal formatées) provoquent parfois une redondance. Exemple : http://lodel.revues.org/10/anglophonia/211
* Test #10 (Caractère minuscule en début de paragraphe) : ne pas signaler les liens hypertextes.
* Bug test "Retour à la ligne dans le titre ou dans un intertitre" : le marker n'est pas affiché car ajouté dans le `<br>`
* Bug Test #36 "Lien(s) à vérifier" : le lien dans le "Pour citer" est signalé comme à vérifier, ici par exemple : http://ema.revues.org/811
* Test #12 (Listes mal formatées) : vérifier également la chaîne `<br>-` utilisée parfois  en combinaison avec le style "Paragraphe sans retrait" par les revues pour simuler des listes à puces
* Bug Test #42 "Vérifier le type du document (chronique)" : la chaîne "Éléments bibliographiques" ne matche pas.
* On peut améliorer le Test #39 (Fac-similé non PDF) en vérifiant le MIME type indiqué par le header de la requête plutôt que l'extension. Cela permettrait théoriquement de détecter les docs chargés avec une extension pdf.
