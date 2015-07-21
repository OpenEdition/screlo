<!-- Attention : cette page est générée automatiquement à partir du code source de Screlo. Ne pas la modifier ici. -->

# Tests Revues

## Test #1 - Absence d’auteur

Type : danger

Aucun auteur n’est associé à ce document. Ce type de document doit normalement être associé à un auteur grâce à la métadonnée “Auteur”.

**À lire dans la documentation**

* [Utilisation de la métadonnée auteur](http://maisondesrevues.org/80)


## Test #2 - Absence du fac-similé

Type : print

Aucun fac-similé n’est associé à ce document. Il est fortement recommandé de joindre aux documents un fac-similé PDF issu de la version imprimée lorsque c’est possible.

**À lire dans la documentation**

* [Fac-similés PDF issus de la version papier](http://maisondesrevues.org/612)


## Test #3 - Erreur de pagination

Type : print

La pagination de la version papier est absente des métadonnées ou n’est pas correctement stylée. Si le document existe en version imprimée il est fortement recommandé d’en préciser la pagination au format attendu.

**À lire dans la documentation**

* [Pagination](http://maisondesrevues.org/86)


## Test #4 - Absence de la date de publication électronique

Type : danger

Ce numéro n’a pas de date de publication électronique. Il est indispensable d’ajouter cette information dans le formulaire d’édition des métadonnées du numéro.

**À lire dans la documentation**

* [Dates de publication](http://maisondesrevues.org/84)


## Test #5 - Absence de référence de l’œuvre commentée

Type : danger

Il est conseillé de mentionner la référence des œuvres commentées dans les comptes rendus et les notes de lecture en utilisant la métadonnée appropriée.

**À lire dans la documentation**

* [Stylage des œuvres commentées](http://maisondesrevues.org/88)


## Test #6 - Utilisation de police(s) non Unicode

Type : danger

Ce document contient des polices non Unicode qui ne sont pas compatibles avec un affichage sur Internet. Il est nécessaire d’utiliser des polices respectant la norme Unicode dans ce document.

**À lire dans la documentation**

* [Des caractères spéciaux sont mal affichés](http://maisondesrevues.org/120)
* [Outils pour l’encodage et la conversion en Unicode](http://maisondesrevues.org/199)


## Test #7 - Retour à la ligne dans le titre ou dans un intertitre

Type : warning

Des retours chariot (ou sauts de ligne forcés) sont utilisés dans le titre et/ou les intertitres de ce document. Les titres et intertitres doivent constituer un seul paragraphe sans retour à la ligne.

**À lire dans la documentation**

* [Stylage du titre](http://maisondesrevues.org/79)
* [Stylage des intertitres](http://maisondesrevues.org/90)


## Test #8 - Titre d’illustration mal placé

Type : warning

Ce document contient des titres d’illustrations placés après les éléments qu’ils décrivent. Le titre d’une illustration doit toujours être placé avant celle-ci.

**À lire dans la documentation**

* [Stylage des illustrations](http://maisondesrevues.org/98)


## Test #9 - Légende d’illustration mal placée

Type : warning

Ce document contient des légendes d’illustrations mal positionnées. La légende d’une illustration doit toujours être placée après celle-ci.

**À lire dans la documentation**

* [Stylage des illustrations](http://maisondesrevues.org/98)


## Test #10 - Caractère minuscule en début de paragraphe

Type : warning

Ce document contient des paragraphes dont le premier caractère est un caractère en minuscule. Il peut s’agir d’une liste à puces ou d’une citation mal stylées ou d’un paragraphe involontairement fractionné (par exemple si le document source a été obtenu à partir de l’export d’un document PDF).

**À lire dans la documentation**

* [Stylage des listes à puces](http://maisondesrevues.org/91)
* [Stylage des citations](http://maisondesrevues.org/92)


## Test #11 - Mauvais style de citation

Type : warning

Ce document contient des paragraphes qui sont peut-être des citations stylées en texte “Normal” et qui doivent être vérifiés.

**À lire dans la documentation**

* [Stylage des citations](http://maisondesrevues.org/92)


## Test #12 - Listes mal formatées

Type : warning

Ce document contient des paragraphes qui sont peut-être des citations et qui doivent être vérifiés.

**À lire dans la documentation**

* [Stylage des listes](http://maisondesrevues.org/91)


## Test #13 - Styles inconnus utilisés

Type : danger

Ce document utilise des styles qui ne sont pas reconnus par Lodel.

**À lire dans la documentation**

* [Style du document non reconnu par Lodel](http://maisondesrevues.org/110)
* [Intertitres non reconnus par Lodel](http://maisondesrevues.org/337)
* [Comment supprimer un style du document](maisondesrevues.org/172)


## Test #14 - Incohérence dans la numérotation des notes

Type : warning

La numérotation des notes de bas de page du document ne suit pas un ordre logique. Ce problème peut provenir de l’insertion d’un appel de note ailleurs que dans le corps de texte (métadonnées, remerciements, note de la rédaction, note de l’auteur, etc.), ce qui n’est pas supporté par Lodel, ou d’une mauvaise numérotation dans le document source

**À lire dans la documentation**

* [Rétablir la numérotation des notes de bas de page](http://maisondesrevues.org/143)


## Test #15 - Mauvais style de note

Type : danger

Les notes de bas de page de ce document utilisent un style inconnu. Les notes de bas de pages doivent toutes être stylées en “Note de bas de page”.


## Test #16 - Intertitre dans une liste

Type : danger

Un ou plusieurs intertitres du document sont contenus dans une liste. Cela est souvent dû à une correction automatique de Word lors de l’insertion d’intertitres numérotés. Il faut désactiver la mise en forme “Liste” sur les intertitres concernés.


## Test #17 - Ponctuation à la fin du titre ou d’un intertitre

Type : warning

Un ou plusieurs intertitres du document se terminent par un signe de ponctuation, ce qui n’est typographiquement correct.


## Test #18 - Mises en formes locales sur le titre

Type : warning

Le titre de ce document contient des mises en forme locales. Il faut vérifier que la présence de toutes ces mises en forme est volontaire (petites capitales, italiques, etc.).

**À lire dans la documentation**

* [Traitement des documents et mises en forme locales](http://maisondesrevues.org/77)


## Test #19 - Appel de note dans le titre

Type : warning

Le titre du document contient un ou plusieurs appels de notes, or il est incorrect d’insérer des appels de notes hors du corps de texte. Cette note peut généralement être remplacée par une autre métadonnée (“Remerciements”, “Note de l’auteur”, “Note de la rédaction”, etc.).


## Test #20 - Titre d’illustration stylé en légende

Type : warning

Certaines légendes d’illustrations contenues dans le document pourraient être transformées en titres d’illustration (titre commançant par : "Figure 1...", "Image 1...", etc.). Remarque : contrairement à la légende, le titre d’une illustration se place avant l’illustration.

**À lire dans la documentation**

* [Titres, légendes et crédits des illustrations et des tableaux](http://maisondesrevues.org/98)


## Test #21 - Champs d’index Word

Type : danger

Le document source contient des signets ou des champs d’index Word qui doivent être nettoyés.


## Test #22 - Remerciement en note 1

Type : warning

La première note de bas de page semble contenir des remerciements. Dans certains cas, il est plus pertinent d'utiliser le style “Remerciements” pour styler cette information. Le paragraphe de remerciements doit être placé au début du corps texte.

**À lire dans la documentation**

* [Ordre des métadonnées](http://maisondesrevues.org/108)


## Test #23 - Composition des index

Type : warning

Les entrées d’index signalées ne sont peut-être pas correctement composés.

**À lire dans la documentation**

* [Règles de stylage des index](http://maisondesrevues.org/83)


## Test #24 - Hiérarchie du plan incohérente

Type : warning

Les intertitres du document ne se suivent pas hiérarchiquement. Par exemple, il n’est pas correct d’utiliser un intertitre de deuxième niveau (“Titre 2”) qui n’aurait pas pour parent un intertitre de premier niveau (“Titre 1”) qui le précède dans le document.

**À lire dans la documentation**

* [Stylage des intertitres](http://maisondesrevues.org/90)


## Test #25 - Vérifier les doublons d’index

Type : warning

Certaines entrées d’index sont peut-être des doublons. 

**À lire dans la documentation**

* [Les doublons dans les index](http://maisondesrevues.org/83)
* [Règles de stylage des index](http://maisondesrevues.org/221)


## Test #26 - Format de nom d’auteur

Type : warning

Certains noms d’auteurs ne respectent pas le format attendu ou contiennent des caractères inconnus. Les noms doivent être composés en bas de casse avec capitale initale.

**À lire dans la documentation**

* [Stylage des noms d’auteurs](http://maisondesrevues.org/80)
* [Règles de stylage des index](http://maisondesrevues.org/221)


## Test #27 - Auteur sans prénom

Type : warning

Certains noms d’auteurs n’ont pas de prénom. Le prénom des auteurs doit être mentionné.

**À lire dans la documentation**

* [Stylage des noms d’auteurs](http://maisondesrevues.org/80)
* [Règles de stylage des index](http://maisondesrevues.org/221)


## Test #28 - Format d’image non supporté

Type : danger

Certaines images du document ne sont pas enregistrées dans un format supporté par Lodel.

**À lire dans la documentation**

* [Les formats d’images supportés par Lodel](http://maisondesrevues.org/214)
* [Changer la résolution, la taille, le format des images](http://maisondesrevues.org/155)
* [Figures et graphiques enregistrées dans Word](http://maisondesrevues.org/97)
* [Taille des images](http://maisondesrevues.org/213)


## Test #29 - Intertitre sur plusieurs paragraphes

Type : warning

Un ou plusieurs intertitres contiennent des sauts de lignes manuels (ou retours chariots). Les intertitres doivent être présentés en un seul bloc.


## Test #30 - Caractères Symbol

Type : danger

Ce document utilise un ou plusieurs caractères de la police “Symbol”. Cette police, généralement introduite par Microsoft Word, ne respecte pas la norme Unicode et n’est donc pas compatible avec un affichage sur Internet. Il est nécessaire d’utiliser des polices Unicode dans les documents importés dans Lodel.

**À lire dans la documentation**

* [Des caractères spéciaux sont mal affichés](http://maisondesrevues.org/120)
* [Outils pour l’encodage et la conversion en Unicode](http://maisondesrevues.org/199)


## Test #31 - Vérifier le stylage du résumé et des mots-clés

Type : warning

Cette notification s’affiche quand le nombre d’index linguistiques utilisés dans le document n’est pas cohérent avec le nombre de traductions du résumé. Vérifiez que tous les résumés et tous les index stylés apparaissent bien sur la page. En cas d’erreur, corrigez le stylage de ces métadonnées dans le document.


## Test #32 - Numéro sans couverture

Type : print

Cette notification s’affiche pour les revues qui disposent d’une version imprimée. Aucun couverture n’est associée au numéro. Il est conseillé d’ajouter une couverture aux numéros quand c’est possible.

**À lire dans la documentation**

* [Images des couvertures issues de l’édition papier](http://maisondesrevues.org/512)
* [Attacher une couverture](http://maisondesrevues.org/621)


## Test #33 - Pas de texte dans le document

Type : danger

Le document ne contient pas de texte. Tous les documents doivent impérativement contenir du texte. Un document qui ne contiendrait des résumés n’est pas valide : pour afficher plusieurs traductions d’un même texte, utilisez les alias de traduction.

**À lire dans la documentation**

* [La gestion des articles et de leur traduction](http://maisondesrevues.org/581)


## Test #34 - Document sans titre

Type : danger

Le titre du document est obligatoire. L’absence de titre peut être dû à une erreur du stylage du document. Vérifiez que vous avez bien respecté l’ordre des métadonnées et que le document est bien enregistré au format .doc (le format .docx n’est pas supporté par Lodel et son utilisation peut être à l’origine d’une erreur d’interprétation de la métadonnée “Titre”).

**À lire dans la documentation**

* [L’ordre des métadonnées](http://maisondesrevues.org/108)


## Test #35 - Lien(s) caché(s) vers Wikipedia

Type : warning

Ce document contient un ou plusieurs liens vers Wikipédia qui sont “cachés” derrière du texte. La présence de tels liens est parfois due à des copier-coller depuis Wikipédia. Vérifiez que leur présence est volontaire.


## Test #36 - Lien(s) à vérifier

Type : warning

Ce document contient un ou plusieurs liens qui semblent incorrects et qui doivent être vérifiés. Vérifiez notamment que les URL ne contiennent pas de marques de ponctuation indésirables (point final, virgule, etc.).


## Test #37 - ISBN invalide

Type : danger

L’ISBN de ce numéro n’est pas valide et doit être vérifié. Remarque : il ne faut pas confondre ISBN (associé à un livre ou un numéro de revue) et ISSN (associé à une l’intégralité d’une collection). L’ISSN ne doit pas être indiqué au niveau du numéro. Un numéro de revue ne possède pas nécessairement d’ISBN, auquel cas rien ne doit être renseigné dans le formulaire d’édition du numéro.


## Test #38 - Absence de la métadonnée de langue

Type : danger

La langue de ce document ou de cette publication n’est pas correctement définie dans les métadonnées. Dans le cas d’une publication, la langue doit être sélectionnée dans le formulaire d’édition des métadonnées. Dans le cas d’un document, il faut styler la métadonnée “Langue” dans le document source.

**À lire dans la documentation**

* [Composition de la métadonnée “Langue”](http://maisondesrevues.org/85)
* [Ordre des métadonnées](http://maisondesrevues.org/108)


## Test #39 - Fac-similé non PDF

Type : danger

Le fichier attaché en tant que fac-similé n’est pas un document PDF. Le fac-similé doit obligatoirement être au format PDF.

**À lire dans la documentation**

* [Fac-similés PDF issus de la version papier](http://maisondesrevues.org/612)


## Test #40 - Absence de la numérotation

Type : danger

La numérotation du numéro n’est pas définie. Il faut compléter cette métadonnée dans le formulaire d’édition du numéro.


## Test #41 - Vérifier le type du document (éditorial)

Type : warning

Le type du document n’est peut-être pas correct. L’introduction ou l’avant-propos d’un numéro doivent être importés en tant qu’“éditorial”.

**À lire dans la documentation**

* [Les types de documents](http://maisondesrevues.org/700)
* [Modifier le type d’un document](https://maisondesrevues.org/700#tocto1n4)


## Test #42 - Vérifier le type du document (chronique)

Type : warning

Le type du document n’est peut-être pas correct. Le type “chronique” est généralement utilisé pour les hommages, bibliographies, etc.

**À lire dans la documentation**

* [Les types de documents](http://maisondesrevues.org/700)
* [Modifier le type d’un document](https://maisondesrevues.org/700#tocto1n4)


## Test #43 - Vérifier le type du document (compte rendu)

Type : warning

Ce document présente une œuvre commentée, il s’agit donc probalement d’un compte rendu ou d’une note de lecture. Le cas échéant il faut lui appliquer le type adéquat.

**À lire dans la documentation**

* [Les types de documents](http://maisondesrevues.org/700)
* [Modifier le type d’un document](https://maisondesrevues.org/700#tocto1n4)
* [Fichiers particuliers : notes de lecture et comptes rendus d’ouvrages](https://maisondesrevues.org/88)


## Test #44 - Lien hypertexte dans le titre ou dans un intertitre

Type : danger

Des liens hypertextes se trouvent dans le titre et/ou les intertitres du document. Ces liens peuvent créer des interférences avec Lodel et nuire à la consultation du document. Le titre et les intertitres ne doivent donc pas contenir de liens hypertextes.

**À lire dans la documentation**

* [Gestion des liens hypertextes dans Word](http://maisondesrevues.org/96)
* [Le titre d’un document n’est pas cliquable dans le sommaire](https://maisondesrevues.org/113)


## Test #45 - Titre de section redondant

Type : warning

Les titres des sections “Bibliographie” et “Annexe” sont ajoutés automatiquement par Lodel, ils ne doivent donc pas être présents dans le texte du document source. Vérifiez que ces titres n’apparaissent pas en double dans le document.


## Test #46 - Sous-partie vide

Type : danger

Le sommaire du numéro contient une ou plusieurs sous-parties dont le titre est vide et/ou qui ne contiennent aucun document, ce qui correspond à une arborescence incorrecte.

