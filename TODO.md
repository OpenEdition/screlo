Todo
======

## Idees d'ajouts
	
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