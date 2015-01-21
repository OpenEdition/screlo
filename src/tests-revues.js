// ############### TESTS REVUES.ORG ###############

var utils = require("./utils"),
    latinize = utils.latinize,
    urlEstValide = utils.urlEstValide,
    isValidIsbn = utils.isValidIsbn,
    getPText = utils.getPText;
// TODO : $ = require("plugins.js")($); // Ou alors dans main


module.exports = function (contexte) {
    return [

        {
            name: "Absence d'auteur",
            id: 1,
            condition: contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations,
            action: function (notif, root) {

                var champAuteur = $('#docAuthor', root);

                if(champAuteur.length === 0){
                    notif.activate();
                }

                return notif;
            }
        },

        {
            name: "Absence du facsimilé",
            id: 2,
            type: "print",
            condition: contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations && contexte.localStorage.papier,
            action: function (notif, root) {

                if($('#wDownload.facsimile', root).length === 0){
                    notif.activate();
                }

                return notif;
            }
        },

        {
            name: "Erreur de pagination",
            id: 3,
            type: "print",
            condition: contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations && contexte.localStorage.papier,
            action: function (notif, root) {

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
            name: "Pas de date de publication électronique (numéro)",
            id: 4,
            condition: contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations,
            action: function (notif, root) {

                // FIXME: ce test ne fonctionne que si la page est affichée en français > à passer au niveau du numéro
                var refElectro = $('#quotation > h3:last', root).next('p').text();

                if (refElectro.match(/mis en ligne le ,/)) {
                    notif.activate();
                }

                return notif;

            }
        },

        {	
            name: "Absence de référence de l'oeuvre commentée",
            id: 5,
            condition: contexte.classes.textes && (contexte.classes.compterendu || contexte.classes.notedelecture),
            action: function (notif, root) {

                if ($("#docReference", root).length === 0) {
                    notif.activate();
                }

                return notif;

            }
        },

        {
            name: "Utilisation de police(s) non Unicode",
            id: 6,
            label: "Police",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            label: "Retour à la ligne",
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

                $('.texte:header br, h1#docTitle br', root).each( function() {
                    notif.addMarker(this).activate();
                });

                return notif;

            }
        },

        {
            name: "Titre d'illustration mal placé",
            id: 8,
            label: "Titre mal placé",
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            label: "Légende mal placée",
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

                $('.creditillustration + .legendeillustration, div.textIcon + .legendeillustration', root).each( function() {
                    notif.addMarker(this).activate();
                });

                return notif;

            }
        },

        {
            name: "Caractère minuscule en début de paragraphe",
            id: 10,
            label: "Minuscule",
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

                $('#text > .text > *:not(.textandnotes), #text > .text > .textandnotes > *, #text > .text > *:header', root).not('.citation,.paragraphesansretrait, blockquote, .sidenotes, ol, ul, li, table, table *').each( function() {

                    var firstChar = getPText($(this)).charAt(0);

                    if (latinize(firstChar).match(/^[a-z]/)) {
                        notif.addMarker(this).activate();
                    }

                });

                return notif;

            }
        },

        {
            name: "Citation stylée en Normal",
            id: 11,
            label: "Citation",
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

                $('#text > .text > *:not(.textandnotes), #text > .text > .textandnotes > *', root).not('.citation, .epigraphe, blockquote, .sidenotes, ol, ul, li, :header').each( function() {

                    var string = getPText($(this));

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
            type: "warning",
            label: "Liste",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
                    var string = getPText($(this)),
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
                            ( alphaCollection[i].symbol === "A" && !alphaCollection[i-1] && alphaCollection[i+1].symbol === "B" ) ||
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
            label: "Style inconnu",
            condition: contexte.classes.textes,
            action: function (notif, root) {

                var textWhitelist = "p.remerciements, p.texte, p.paragraphesansretrait, p.creditillustration, p.crditsillustration, p.epigraphe, p.citation, p.citationbis, p.citationter, p.titreillustration, p.legendeillustration, p.question, p.reponse, p.separateur, p.encadre";

                $('#text > .text p', root).each( function() {
                    if (!$(this).is(textWhitelist)) {
                        notif.addMarker(this, "Style inconnu : " + $(this).attr("class")).activate();
                    }
                });

                return notif;

            }
        },

        {
            name: "Incohérence dans la numérotation des notes",
            id: 14,
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            label: "Style inconnu",
            condition: contexte.classes.textes,
            action: function (notif, root) {

                $("#notes p:not(.notesbaspage):not(.notebaspage)", root).each( function() {
                    notif.addMarker(this, "Style inconnu : " + $(this).attr("class")).activate();
                });

                return notif;

            }			
        },

        {
            name: "Intertitre dans une liste",
            id: 16,
            condition: contexte.classes.textes,
            action: function (notif, root) {

                $("#content ol :header, #content ul :header, #content li:header", root).each( function() {
                    notif.addMarker(this).activate();
                });

                return notif;

            }			
        },

        {
            name: "Ponctuation à la fin du titre ou d'un intertitre",
            id: 17,
            type: "warning",
            label: "Ponctuation",
            labelPos: "after",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

                if ($('#docTitle .footnotecall', root).length !== 0) {
                    notif.activate();
                }

                return notif;

            }
        },

        {
            name: "Titre d'illustration stylé en légende",
            id: 20,
            type: "warning",
            label: "Titre plutôt que légende",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            label: "Champ d'index",
            condition: contexte.classes.textes,
            action: function (notif, root) {

                $("a:contains('Error: Reference source not found'), a[href^='#id']", root).each( function() {
                    notif.addMarker(this).activate();
                });

                return notif;

            }			
        },

        {
            name: "Remerciement en note 1",
            id: 22,
            label: "Remerciement",
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            name: "Composition des mots-cles", // TODO: à passer en nouvelle architecture
            id: 23,
            type: "warning",
            labelPos: "after",
            condition: contexte.isMotscles || (contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations),
            action: function (notif, root) {

                function testerMotsCles($collection, notif) {

                    $collection.each( function() {
                        var latinAlphanum = /[\u0030-\u0039\u0040-\u005A\u0061-\u007A\u00C0-\u00FF\u0100-\u017F\u0180-\u024F]/,
                            motCle = $(this).text().trim(),
                            alertes = [];

                        // Premier caractère invalide
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
                            notif.addMarker(this, alertes.join(' | ')).activate();
                        }
                    });

                    return notif;
                }

                if (contexte.isMotscles) {
                    notif = testerMotsCles($('#pageBody .entries ul li', root), notif);
                } else if (contexte.classes.textes) {
                    notif = testerMotsCles($('#entries .index a', root), notif);
                }

                return notif;
            }
        },

        {
            name: "Hierarchie du plan incohérente",
            id: 24,
            type: "warning",
            label: "Hierarchie",
            labelPos: "after",
            condition: contexte.classes.textes,
            action: function (notif, root) {
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
            type: "warning",
            label: "Doublon",
            labelPos: "after",
            condition: contexte.isMotscles,
            action: function (notif, root) {
                var arr = {},
                    text = "",
                    err = 0;

                $('#pageBody .entries ul li', root).each( function (index) {
                    text = latinize($(this).text()).replace(/[\s;–—-]+/g, '').toLowerCase();
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
            type: "warning",
            label: "Format",
            labelPos: "after",
            condition: contexte.classes.indexes || (contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations),
            action: function (notif, root) {
                var text = "";

                $('span.familyName', root).each( function () {
                    text = latinize($(this).text().trim());
                    if (text === text.toUpperCase() || text.match(/[&!?)(*\/]/)) {

                        if (!contexte.classes.textes || $(this).is('#docAuthor *, #docTranslator *')) {
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
            type: "warning",
            label: "Nom seul",
            labelPos: "after",
            condition: contexte.classes.indexes || (contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations),
            action: function (notif, root) {

                var err = 0;

                $('span.familyName', root).each( function () {
                    if ($(this).text().trim() === $(this).parent().text().trim()) {

                        if (!contexte.classes.textes || $(this).is('#docAuthor *, #docTranslator *')) {
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
            labelPos: "after",
            condition: contexte.classes.textes,
            action: function (notif, root) {

                $("img[src$='.wmf'], .image_error", root).each( function () {
                    notif.addMarker(this).activate();
                });

                return notif;

            }			
        },

        {
            name: "Intertitre sur plusieurs paragraphes",
            id: 29,
            type: "warning",
            label: "Double intertitre",
            labelPos: "after",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            condition: contexte.classes.textes,
            action: function (notif, root) {

                var symbolsRegex = 	/[]/g,
                    match = $("#docBody", root).text().match(symbolsRegex);

                if (match) {
                    if (root === document) {
                        $('#docBody', root).highlightRegex(symbolsRegex, {
                            tagType:   'span',
                            className: 'symbolalert'
                        });
                        $("body").addClass("hasMarqueur");
                    }

                    // TODO: utiliser le même type de marqueur qu'habituellement
                    notif.count = match.length;
                    notif.activate();
                }

                return notif;

            }
        },

        {
            name: "Vérifier le stylage du résumé et des mots-clés",
            id: 31,
            type: "warning",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            condition: contexte.classes.numero && contexte.localStorage.papier,
            type: "print",
            action: function (notif, root) {

                if ($("#publiInformation img", root).length === 0) {
                    notif.activate();
                }

                return notif;
            }			
        },

        {
            name: "Pas de texte dans le document",
            id: 33,
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            type: "warning",
            label: "Wikipedia",
            labelPos: "after",
            condition: contexte.classes.textes,
            action: function (notif, root) {

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
            type: "warning",
            label: "Lien à vérifier",
            labelPos: "after",
            condition: contexte.classes.textes,
            action: function (notif, root) {
                var url = "";

                $("#main p a[href]:not(.footnotecall, .FootnoteSymbol, [href^=mailto])", root).each( function () {
                    url = $(this).attr("href");
                    if (!urlEstValide(url)) { 
                        notif.addMarker(this).activate();
                    }
                });

                return notif;

            }			
        },

        {
            name: "ISBN invalide",
            id: 37,
            labelPos: "after",
            condition: contexte.classes.numero,
            action: function (notif, root) {

                var element = $("#publiISBN").eq(0), 
                    isbn;

                if (element.length !== 0) {
                    isbn = element.text().replace("ISBN", "");
                    if ( !isValidIsbn(isbn) ) {
                        notif.addMarker(element.get(0)).activate();
                    }
                }

                return notif;
            }			
        }//,

    ]; 
};