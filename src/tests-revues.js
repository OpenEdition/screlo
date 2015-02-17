// ############### TESTS REVUES.ORG ###############

/*
    Chaque test est un objet de la forme suivante :
    
    {
        name: (string) Nom du test affiché dans la Notification.
        id: (string) Identifiant numérique unique du test.
        description: (string) Message d'aide.
        links: (array) Tableau contenant les liens vers la documentation de la maison des revues de la forme : ["Texte du lien 1", "URL 1", "Texte du lien 2", "URL 2", etc.]
        type: (string) Le type de la Notification qui sera retournée ("danger", "warning", "print", "success").
        label: (string) Nom du test affiché par les Marker générés par le test.
        labelPos: (string) Position du Marker par rapport à l'élément cible ("before", "after").
        condition: (function(context)) Détermine l'exécution (ou non) du test en fonction du contexte. Retourne un booléen.
        action: (function(notif, root)) La fonction qui exécute le test. Retourne notif.
            Le paramètre notif est une Notification vierge qui doit être modifiée en cas de test positif puis retournée par la fonction. 
            Le paramètre root est l'élément du DOM qui sert de contexte au test. On utilise $(selecteur, root) dans la fonction action().
    }
*/


var utils = require("./utils.js");


module.exports = [

    {
        name: "Absence d'auteur",
        id: 1,
        description: "Aucun auteur n'est associé à ce document. Ce type de document doit normalement être associé à un auteur grace à la métadonnée <em>Auteur</em>.",
        links: ["Utilisation de la métadonnée auteur", "http://maisondesrevues.org/80"],
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations; },
        action: function (notif, context, root) {

            var champAuteur = $('#docAuthor', root);

            if(champAuteur.length === 0){
                notif.activate();
            }

            return notif;
        }
    },

    {
        name: "Absence du fac-similé",
        id: 2,
        description: "Aucun fac-similé n'est associé à ce document. Il est fortement recommandé de joindre aux documents un fac-similé PDF issu de la version imprimée lorsque c'est possible.",
        links: ["Fac-similés PDF issus de la version papier", "http://maisondesrevues.org/612"],
        type: "print",
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations && context.paper; },
        action: function (notif, context, root) {

            if($('#wDownload.facsimile', root).length === 0){
                notif.activate();
            }

            return notif;
        }
    },

    {
        name: "Erreur de pagination",
        id: 3,
        description: "La pagination de la version papier est absente des métadonnées ou n'est pas correctement stylée. Si le document existe en version imprimée il est fortement recommandé d'en préciser la pagination au format attendu.",
        links: ["Pagination", "http://maisondesrevues.org/86"],
        type: "print",
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations && context.paper; },
        action: function (notif, context, root) {

            if($('#docPagination', root).length === 0){

                notif.name = "Pas de pagination";
                notif.activate();

            } else if (!/^p\. [0-9-]*$/i.test($('#docPagination', root).text())) {

                notif.name = "Mauvais format de pagination";
                notif.activate();

            }

            return notif;
        }
    },

    {
        // FIXME: ce test ne fonctionne que si la page est affichée en français > à passer au niveau du numéro
        name: "Pas de date de publication électronique",
        id: 4,
        description: "La date de publication électronique est absente des métadonnées du numéro ou n'est pas correctement stylée. Il est impératif de renseigner cette métadonnée dans le formulaire d'édition du numéro ou de la rubrique.",
        links: ["Les dates de publication", "http://maisondesrevues.org/84"],
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations; },
        action: function (notif, context, root) {

            var refElectro = $('#quotation > h3:last', root).next('p').text();

            if (refElectro.match(/mis en ligne le ,/)) {
                notif.activate();
            }

            return notif;

        }
    },

    {	
        name: "Absence de référence de l'œuvre commentée",
        id: 5,
        description: "La date de publication électronique est absente des métadonnées du numéro ou n'est pas correctement stylée. Il est impératif de renseigner cette métadonnée dans le formulaire d'édition du numéro ou de la rubrique.",
        links: ["Stylage des œuvres commentées", "http://maisondesrevues.org/88"],
        condition: function(context) { return context.classes.textes && (context.classes.compterendu || context.classes.notedelecture); },
        action: function (notif, context, root) {

            if ($("#docReference", root).length === 0) {
                notif.activate();
            }

            return notif;

        }
    },

    {
        // NOTE: test obsolète (Lodel 0.9) à supprimer depuis OTX.
        name: "Utilisation de police(s) non Unicode",
        id: 6,
        description: "Ce document contient des polices non Unicode qui ne sont pas compatibles avec un affichage sur Internet. Il est nécessaire d'utiliser des polices respectant la norme Unicode dans ce document.",
        links: [
            "Des caractères spéciaux sont mal affichés", "http://maisondesrevues.org/120",
            "Outils pour l’encodage et la conversion en Unicode", "http://maisondesrevues.org/199"
        ],
        label: "Police",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            var el = $('#content [style*="Symbol"], #content [style*="symbol"], #content [style*="Wingdings"], #content [style*="wingdings"], #content [style*="Webdings"], #content [style*="webdings"]', root);

            el.each(function() {
                notif.addMarker(this).activate();
            });

            return notif;                        
        }
    },

    {
        name: "Retour à la ligne dans le titre ou dans un intertitre",
        id: 7,
        description: "Des retours chariot (ou sauts de ligne forcés) sont utilisés dans le titre et/ou les intertitres de ce document. Les titres et intertitres doivent constituer un seul paragraphe sans retour à la ligne.",
        links: [
            "Stylage du titre", "http://maisondesrevues.org/79",
            "Stylage des intertitres", "http://maisondesrevues.org/90"
        ],
        type: "warning",
        label: "Retour à la ligne",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $('.texte:header br, h1#docTitle br', root).each( function() {
                notif.addMarker(this).activate();
            });

            return notif;

        }
    },

    {
        name: "Titre d'illustration mal placé",
        id: 8,
        description: "Ce document contient des titres d'illustrations placés après les éléments qu'ils décrivent. Le titre d'une illustration doit toujours être placé avant celle-ci.",
        links: ["Stylage des illustrations", "http://maisondesrevues.org/98"],
        type: "warning",
        label: "Titre mal placé",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $('table + .titreillustration, img + .titreillustration, div.textIcon + .titreillustration', root).each( function() {

                if ($(this).next('table, img, div.textIcon').length === 0) { // titreillus apres illus = erreur, sauf si suivi d'illus
                    notif.addMarker(this).activate();
                }

            });

            return notif;

        }
    },

    {
        name: "Légende d'illustration mal placée",
        id: 9,
        description: "Ce document contient des légendes d'illustrations mal positionnées. La légende d'une illustration doit toujours être placé après celle-ci.",
        links: ["Stylage des illustrations", "http://maisondesrevues.org/98"],
        type: "warning",
        label: "Légende mal placée",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $('.creditillustration + .legendeillustration, div.textIcon + .legendeillustration', root).each( function() {
                notif.addMarker(this).activate();
            });

            return notif;

        }
    },

    {
        name: "Caractère minuscule en début de paragraphe",
        id: 10,
        description: "Ce document contient des paragraphes dont le premier caractère est un caractère en minuscule. Il peut s'agir d'une liste à puces ou d'une citation mal stylées ou d'un paragraphe involontairement fractionné (par exemple si le document source a été obtenu à partir de l'export d'un document PDF).",
        links: [
            "Stylage des listes à puces", "http://maisondesrevues.org/91",
            "Stylage des citations", "http://maisondesrevues.org/92"
        ],
        type: "warning",
        label: "Minuscule",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $('#text > .text > *:not(.textandnotes), #text > .text > .textandnotes > *, #text > .text > *:header', root).not('.citation,.paragraphesansretrait, blockquote, .sidenotes, ol, ul, li, table, table *').each( function() {

                var firstChar = utils.getPText($(this)).charAt(0);

                if (utils.latinize(firstChar).match(/^[a-z]/)) {
                    notif.addMarker(this).activate();
                }

            });

            return notif;

        }
    },

    {
        name: "Mauvais style de citation",
        id: 11,
        description: "Ce document des paragraphes qui sont peut-être des citations stylées en texte “Normal” et qui doivent être vérifiés.",
        links: ["Stylage des citations", "http://maisondesrevues.org/92"],
        type: "warning",
        label: "Citation",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $('#text > .text > *:not(.textandnotes), #text > .text > .textandnotes > *', root).not('.citation, .epigraphe, blockquote, .sidenotes, ol, ul, li, :header').each( function() {

                var string = utils.getPText($(this));

                if (string.charAt(0).match(/[«"“]/) && string.slice(-20).match(/[”"»]/)) {
                    notif.addMarker(this).activate();
                }
            });

            return notif;

        }
    },

    {
        name: "Listes mal formatées", // NOTE: Test "Listes mal formatées" amelioré pour éviter les faux positifs sur les initiales de noms propres. Ne matchent que les intiales de la forme /^[A-Z]\.\s/ qui s'inscrivent dans une suite qui commence par "A.", "B.", etc. ou "A:", B:"...
        id: 12,
        description: "Ce document des paragraphes qui sont peut-être des citations et qui doivent être vérifiés.",
        links: ["Stylage des listes", "http://maisondesrevues.org/91"],
        type: "warning",
        label: "Liste",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            function listInfos (string) {
                var ulTest = string.match(/^([•∙◊–—>-])\s/),
                    olTest = string.match(/^([0-9a-z]{1,3})[\/.):–—-]\s/i),
                    ALPHATest = string.match(/[A-Z][.:]\s/),
                    res = { 
                        "type": false,
                        "symbol": "",
                    };

                if (ulTest !== null) {
                    res.type = "ul";
                    res.symbol = ulTest[1];

                } else if (olTest !== null) {

                    if (ALPHATest !== null) {
                        res.type = "alpha";
                    } else {
                        res.type = "ol";
                    }                        
                    res.symbol = olTest[1];
                }
                return res;                          
            }

            function getLetter (start, dir) {
                var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                return alphabet[alphabet.indexOf(start) + dir];
            }

            var collection = $('#text > .text > p, #text > .text > .textandnotes > p', root).not(".titreillustration"),
                err = [],
                alphaCollection = {},
                i,
                prevLetter,
                lastRecordedLetter;

            collection.each( function(index) {
                var string = utils.getPText($(this)),
                    infos = listInfos(string);

                if (infos.type === "ul" | infos.type === "ol") {
                    err.push(this);
                } else if (infos.type === "alpha") {
                    alphaCollection[index] = { 
                        "symbol": infos.symbol, 
                        "element": this 
                    };
                }                            
            });

            for (i=0; i<collection.length; i++) {
                if (alphaCollection[i]) {
                    prevLetter = getLetter(alphaCollection[i].symbol, -1);
                    if (
                        ( alphaCollection[i].symbol === "A" && !alphaCollection[i-1] && alphaCollection[i+1] && alphaCollection[i+1].symbol === "B" ) ||
                        ( alphaCollection[i].symbol !== "A" && alphaCollection[i-1] && alphaCollection[i-1].symbol === prevLetter && lastRecordedLetter === prevLetter )
                    ) {
                        err.push(alphaCollection[i].element);
                        lastRecordedLetter = alphaCollection[i].symbol;
                    }
                }
            }

            for (i=0; i<err.length; i++) {
                notif.addMarker(err[i]).activate();
            }

            return notif;

        }
    },

    {
        name: "Styles inconnus utilisés",
        id: 13,
        description: "Ce document utilise des styles qui ne sont pas reconnus par Lodel.",
        links: [
            "Style du document non reconnu par Lodel", "http://maisondesrevues.org/110",
            "Intertitres non reconnus par Lodel", "http://maisondesrevues.org/337",
            "Comment supprimer un style du document", "maisondesrevues.org/172"
        ],
        label: "Style inconnu",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            var textWhitelist = "p.remerciements, p.texte, p.paragraphesansretrait, p.creditillustration, p.crditsillustration, p.epigraphe, p.citation, p.citationbis, p.citationter, p.titreillustration, p.legendeillustration, p.question, p.reponse, p.separateur, p.encadre";

            $('#text > .text p', root).each( function() {
                if (!$(this).is(textWhitelist)) {
                    notif.label = "Style inconnu : " + $(this).attr("class");
                    notif.addMarker(this).activate();
                }
            });

            return notif;

        }
    },

    {
        // TODO: faire un test Note hors du corps de texte qui surcharge celui-ci
        name: "Incohérence dans la numérotation des notes",
        id: 14,
        description: "La numérotation des notes de bas de page du document ne suit pas un ordre logique. Ce problème peut provenir de l'insertion d'un appel de note ailleurs que dans le corps de texte (métadonnées, remerciements, note de la rédaction, note de l'auteur, etc.), ce qui n'est pas supporté par Lodel, ou d'une mauvaise numérotation dans le document source",
        links: ["Rétablir la numérotation des notes de bas de page", "http://maisondesrevues.org/143"],
        type: "warning",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            var e = false,
                debut = 0;

            $('#notes > p > a[id^=ftn]', root).each( function(index) {
                if (index === 0) {
                    debut = parseInt($(this).text());
                } else {
                    if (parseInt($(this).text()) !== index + debut) {
                        notif.activate();
                        return false;
                    }
                }
            });

            return notif;
        }
    },

    {
        name: "Mauvais style de note",
        id: 15,
        description: "Les notes de bas de page de ce document utilisent un style inconnu. Les notes de bas de pages doivent toutes être stylées en “Note de bas de page”.",
        label: "Style inconnu",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $("#notes p:not(.notesbaspage):not(.notebaspage)", root).each( function() {
                notif.label = "Style inconnu : " + $(this).attr("class");
                notif.addMarker(this).activate();
            });

            return notif;

        }			
    },

    {
        name: "Intertitre dans une liste",
        id: 16,
        description: "Un ou plusieurs intertitres du document sont contenus dans une liste. Cela est souvent dû à une correction automatique de Word lors de l'insertion d'intertitres numérotés. Il faut désactiver la mise en forme “Liste” sur les intertitres concernés.",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $("#content ol :header, #content ul :header, #content li:header", root).each( function() {
                notif.addMarker(this).activate();
            });

            return notif;

        }			
    },

    {
        name: "Ponctuation à la fin du titre ou d'un intertitre",
        id: 17,
        description: "Un ou plusieurs intertitres du document se terminent par un signe de ponctuation, ce qui n'est typographiquement correct.",
        type: "warning",
        label: "Ponctuation",
        labelPos: "after",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $('.texte:header, #docTitle, #docSubtitle, #docAltertitle > div', root).each( function() {
                if( $(this).text().trim().match(/[\.:;=]$/) ) {
                    notif.addMarker(this).activate();
                }
            });

            return notif;

        }			
    },

    {
        name: "Mises en formes locales sur le titre",
        id: 18,
        description: "Le titre de ce document contient des mises en forme locales. Il faut vérifier que la présence de toutes ces mises en forme est volontaire (petites capitales, italiques, etc.).",
        links: ["Traitement des documents et mises en forme locales", "http://maisondesrevues.org/77"],
        type: "warning",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $('#docTitle, #docTitle *', root).each( function() {
                if ($(this).attr("style")) {
                    notif.activate();
                    return false;
                }
            });

            return notif;

        }			
    },

    {
        name: "Appel de note dans le titre",
        id: 19,
        description: "Le titre du document contient un ou plusieurs appels de notes, or il est incorrect d'inserer des appels de notes hors du corps de texte. Cette note peut généralement être remplacée par une autre métadonnée (Remerciements, Note de l'auteur, Note de la rédaction, etc.).",
        type: "warning",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            if ($('#docTitle .footnotecall', root).length !== 0) {
                notif.activate();
            }

            return notif;

        }
    },

    {
        name: "Titre d'illustration stylé en légende",
        id: 20,
        description: "Certaines légendes d'illustrations contenues dans le document pourraient être transformées en titres d'illustration (titre commançant par : \"Figure 1...\", \"Image 1...\", etc.). Remarque : contrairement à la légende, le titre d'une illustration se place avant l'illustration.",
        links: ["Titres, légendes et crédits des illustrations et des tableaux", "http://maisondesrevues.org/98"],
        type: "warning",
        label: "Titre plutôt que légende",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $('.legendeillustration', root).each( function() {
                if( $(this).text().match(/^(fig|tabl|illus|image|img|sch)/i) ) {
                    notif.addMarker(this).activate();
                }
            });

            return notif;

        }			
    },

    {
        name: "Champs d'index Word",
        id: 21,
        description: "Le document source contient des signets ou des champs d'index Word qui doivent être nettoyés.",
        label: "Champ d'index",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $("a:contains('Error: Reference source not found'), a[href^='#id']", root).each( function() {
                notif.addMarker(this).activate();
            });

            return notif;

        }			
    },

    {
        name: "Remerciement en note 1",
        id: 22,
        description: "La première note de bas de page semble contenir des remerciements. Dans certains cas, il est plus pertinent d'utiliser le style “Remerciements” pour styler cette information. Le paragraphe de remerciements doit être placé au début du corps texte.",
        links: ["Ordre des métadonnées", "http://maisondesrevues.org/108"],
        label: "Remerciement",
        type: "warning",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            var $el = $("#notes .notesbaspage:first", root),
                str = $el.text(),
                merci = /(merci|thank)/i; // TODO: compléter

            if (str.match(merci)) {
                notif.addMarker($el.get(0)).activate();
            }

            return notif;
        }			
    },

    {
        name: "Composition des index",
        id: 23,
        description: "Les entrées d'index signalées ne sont peut-être pas correctement composés.",
        links: ["Règles de stylage des index", "http://maisondesrevues.org/83"],
        type: "warning",
        labelPos: "after",
        condition: function(context) { return context.isMotscles || (context.classes.textes && !context.classes.actualite && !context.classes.informations); },
        action: function (notif, context, root) {

            function testerMotsCles($collection, notif) {

                $collection.each( function() {
                    var latinAlphanum = /[\u0030-\u0039\u0040-\u005A\u0061-\u007A\u00C0-\u00FF\u0100-\u017F\u0180-\u024F]/,
                        motCle = $(this).text().trim(),
                        alertes = [];

                    // Premier caractère invalide
                    // FIXME: ne fonctionne pas avec l'arabe
                    if (!motCle.substr(0,1).match(latinAlphanum)) {
                        alertes.push('Initiale');
                    }

                    // Point final
                    if (motCle.slice(-1) === '.') {
                        alertes.push('Point final');   
                    }

                    // Mauvais séparateurs
                    if (motCle.match(/[\-/;–—][\u0030-\u0039\u0040-\u005A\u0061-\u007A\u00C0-\u00FF\u0100-\u017F\u0180-\u024F \s]*[\-/;–—]/) && motCle.length > 20 ) {
                        alertes.push('Vérifier les séparateurs');   
                    }

                    if (alertes.length !== 0){
                        notif.label = alertes.join(' | ');
                        notif.addMarker(this).activate();
                    }
                });

                return notif;
            }

            if (context.isMotscles) {
                notif = testerMotsCles($('#pageBody .entries ul li', root), notif);
            } else if (context.classes.textes) {
                notif = testerMotsCles($('#entries .index a', root), notif);
            }

            return notif;
        }
    },

    {
        name: "Hierarchie du plan incohérente",
        description: "Les intertitres du document ne se suivent pas hiérarchiquement. Par exemple, il n'est pas correct d'utiliser un intertitre de deuxième niveau (“Titre 2”) qui n'aurait pas pour parent un intertitre de premier niveau (“Titre 1”) qui le précède dans le document.",
        links: ["Stylage des intertitres", "http://maisondesrevues.org/90"],
        id: 24,
        type: "warning",
        label: "Hierarchie",
        labelPos: "after",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {
            var precedent = 0;

            $('#toc div', root).each( function () {
                var niveau = Number($(this).attr('class').slice(-1));
                if (niveau > precedent + 1 || (precedent === 0 && niveau != 1)) {
                    notif.addMarker(this).activate();
                }
                precedent = niveau;
            });

            return notif;
        }			
    },

    {
        name: "Vérifier les doublons",
        id: 25,
        description: "Certaines entrées d'index sont peut-être des doublons. ",
        links: [
            "Les doublons dans les index", "http://maisondesrevues.org/83",
            "Règles de stylage des index", "http://maisondesrevues.org/221"
        ],
        type: "warning",
        label: "Doublon",
        labelPos: "after",
        condition: function(context) { return context.isMotscles; },
        action: function (notif, context, root) {
            var arr = {},
                text = "",
                err = 0;

            $('#pageBody .entries ul li', root).each( function (index) {
                text = utils.latinize($(this).text()).replace(/[\s;–—-]+/g, '').toLowerCase();
                if (arr[text]) {
                    arr[text].push(index);
                } else {
                    arr[text] = [index];
                }
            });

            $.each(arr, function (key, eqs) {
                var i,
                    el;

                if ($.isArray(eqs) && eqs.length > 1) {
                    for (i=0; i<eqs.length; i++) {
                        el = $('#pageBody .entries ul li', root).eq(eqs[i])[0];
                        notif.addMarker(el).activate();
                    }
                }
            });

            return notif;
        }			
    },

    {
        name: "Format de nom d'auteur : capitales, caractères interdits",
        id: 26,
        description: "Certains noms d'auteurs ne respectent pas le format attendu.",
        links: [
            "Stylage des noms d'auteurs", "http://maisondesrevues.org/80",
            "Règles de stylage des index", "http://maisondesrevues.org/221"
        ],
        type: "warning",
        label: "Format",
        labelPos: "after",
        condition: function(context) { return context.classes.indexes || (context.classes.textes && !context.classes.actualite && !context.classes.informations); },
        action: function (notif, context, root) {
            var text = "";

            $('span.familyName', root).each( function () {
                text = utils.latinize($(this).text().trim());
                if (text === text.toUpperCase() || text.match(/[&!?)(*\/]/)) {

                    if (!context.classes.textes || $(this).is('#docAuthor *, #docTranslator *')) {
                        notif.addMarker(this).activate();
                    }

                }
            });

            return notif;

        }			
    },

    {
        name: "Auteur sans prénom",
        id: 27,
        description: "Certains noms d'auteurs n'ont pas de prénom. Le prénom des auteurs doit être mentionné.",
        links: [
            "Stylage des noms d'auteurs", "http://maisondesrevues.org/80",
            "Règles de stylage des index", "http://maisondesrevues.org/221"
        ],
        type: "warning",
        label: "Nom seul",
        labelPos: "after",
        condition: function(context) { return context.classes.indexes || (context.classes.textes && !context.classes.actualite && !context.classes.informations); },
        action: function (notif, context, root) {

            var err = 0;

            $('span.familyName', root).each( function () {
                if ($(this).text().trim() === $(this).parent().text().trim()) {

                    if (!context.classes.textes || $(this).is('#docAuthor *, #docTranslator *')) {
                        notif.addMarker(this).activate();
                    }

                }
            });

            return notif;
        }			
    },

    {
        name: "Format d'image non supporté",
        id: 28,
        description: "Certaines images du document ne sont pas enregistrées dans un format supporté par Lodel.",
        links: [
            "Les formats d'images supportés par Lodel", "http://maisondesrevues.org/214",
            "Changer la résolution, la taille, le format des images", "http://maisondesrevues.org/155",
            "Figures et graphiques enregistrées dans Word", "http://maisondesrevues.org/97",
            "Taille des images", "http://maisondesrevues.org/213"
        ],
        labelPos: "after",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $("img[src$='.wmf'], .image_error", root).each( function () {
                notif.addMarker(this).activate();
            });

            return notif;

        }			
    },

    {
        name: "Intertitre sur plusieurs paragraphes",
        id: 29,
        description: "Un ou plusieurs intertitres contiennent des sauts de lignes manuels (ou retours chariots). Les intertitres doivent être présentés en un seul bloc.",
        type: "warning",
        label: "Double intertitre",
        labelPos: "after",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $(".texte:header + .texte:header", root).each( function () {

                if ($(this).prev('.texte:header')[0].nodeName === this.nodeName) {
                    notif.addMarker(this).activate();  
                }

            });

            return notif;

        }			
    },

    {
        name: "Caractères Symbol",
        id: 30,
        description: "Ce document utilise un ou plusieurs caractères de la police “Symbol”. Cette police, généralement introduite par Microsoft Word, ne respecte pas la norme Unicode et n'est donc pas compatible avec un affichage sur Internet. Il est nécessaire d'utiliser des polices Unicode dans les documents impoortés dans Lodel.",
        links: [
            "Des caractères spéciaux sont mal affichés", "http://maisondesrevues.org/120",
            "Outils pour l’encodage et la conversion en Unicode", "http://maisondesrevues.org/199"
        ],
        label: "Symbol",
        labelPos: "after",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            var symbolsRegex = 	/[]/g;
            
            notif.addMarkersFromRegex(symbolsRegex);

            if (notif.count > 0) {
                notif.activate();
            }

            return notif;

        }
    },

    {
        name: "Vérifier le stylage du résumé et des mots-clés",
        id: 31,
        description: "Cette notification s'affiche quand le nombre d'index linguistiques utilisés dans le document n'est pas cohérent avec le nombre de traductions du résumé. Vérifiez que tous les résumés et tous les index stylés apparaîssent bien sur la page. En cas d'erreur, corrigez le stylage de ces métadonnées dans le document.",
        type: "warning",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            var nbMots = $("#entries .index h3", root).filter( function(i,e) {
                return !$(e).text().match(/(Index|Índice|Indice)/);
            }).length,
                nbResumes = $("#abstract .tabContent", root).length;

            if (nbMots !== 0 && nbResumes !== 0 && nbMots !== nbResumes) {
                notif.activate(); 
            }

            return notif;
        }			
    },

    {
        name: "Numéro sans couverture",
        id: 32,
        description: "Cette notification s'affiche pour les revues qui disposent d'une version imprimée. Aucun couverture n'est associée au numéro. Il est conseillé d'ajouter une couverture aux numéros quand c'est possible.",
        links: [
            "Images des couvertures issues de l'édition papier", "http://maisondesrevues.org/512",
            "Attacher une couverture", "http://maisondesrevues.org/621"
        ],
        condition: function(context) { return context.classes.numero && context.paper; },
        type: "print",
        action: function (notif, context, root) {

            if ($("#publiInformation img", root).length === 0) {
                notif.activate();
            }

            return notif;
        }			
    },

    {
        name: "Pas de texte dans le document",
        id: 33,
        description: "Le document ne contient pas de texte. Tous les documents doivent impérativement contenir du texte. Un document qui ne contiendrait des résumés n'est pas valide : pour afficher plusieurs traductions d'un même texte, utilisez les alias de traduction.",
        links: ["La gestion des articles et de leur traduction", "http://maisondesrevues.org/581"],
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            var element = $("#docBody #text", root),
                text = element.text().trim();

            if (element.length === 0 || text === "") {
                notif.activate();
            }

            return notif;
        }
    },

    {
        name: "Document sans titre",
        id: 34,
        description: "Le titre du document est obligatoire. L'absence de titre peut être dû à une erreur du stylage du document. Vérifiez que vous avez bien respecté l'ordre des métadonnées et que le document est bien enregistré au format .doc (le format .docx n'est pas supporté par Lodel et son utilisation peut être à l'origine d'une erreur d'interprétation de la métadonnée “Titre”).",
        links: ["L'ordre des métadonnées", "http://maisondesrevues.org/108"],
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            var element = $("#docTitle", root),
                text = element.text().trim();

            if (element.length === 0 || text === "" || text === "Document sans titre") {
                notif.activate();
            }

            return notif;
        }			
    },

    {
        // FIXME: ne fonctionne pas avec Ajax
        name: "Lien(s) caché(s) vers Wikipedia",
        id: 35,
        description: "Ce document contient un ou plusieurs liens vers Wikipédia qui sont “cachés” derrière du texte. La présence de tels liens est parfois dûe à des copier-coller depuis Wikipédia. Vérifiez que leur présence est volontaire.",
        type: "warning",
        label: "Wikipedia",
        labelPos: "after",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            $("#content a[href*='wikipedia']", root).each( function () {
                if ($(this).text() !== $(this).attr("href")) {
                    notif.addMarker(this).activate();
                }
            });

            return notif;
        }			
    },

    {
        name: "Lien(s) à vérifier",
        id: 36,
        description: "Ce document contient un ou plusieurs liens qui semblent incorrects et qui doivent être vérifiés. Vérifiez notamment que les URL ne contiennent pas de marques de ponctuation indésirables (point final, virgule, etc.).",
        type: "warning",
        label: "Lien à vérifier",
        labelPos: "after",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {
            var url = "";

            $("#main p a[href]:not(.footnotecall, .FootnoteSymbol, [href^=mailto])", root).each( function () {
                url = $(this).attr("href");
                if (!utils.isValidUrl(url)) { 
                    notif.addMarker(this).activate();
                }
            });

            return notif;

        }			
    },

    {
        name: "ISBN invalide",
        id: 37,
        description: "L'ISBN de ce numéro n'est pas valide et doit être vérifié. Remarque : il ne faut pas confondre ISBN (associé à un livre ou un numéro de revue) et ISSN (associé à une l'intégralité d'une collection). L'ISSN ne doit pas être indiqué au niveau du numéro. Un numéro de revue ne possède pas nécessairement d'ISBN, auquel cas rien ne doit être renseigné dans le formulaire d'édition du numéro.",
        labelPos: "after",
        condition: function(context) { return context.classes.numero; },
        action: function (notif, context, root) {

            var element = $("#publiISBN").eq(0), 
                isbn;

            if (element.length !== 0) {
                isbn = element.text().replace("ISBN", "");
                if ( !utils.isValidIsbn(isbn) ) {
                    notif.addMarker(element.get(0)).activate();
                }
            }

            return notif;
        }			
    }//,

]; 