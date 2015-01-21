// ################ SCRELO UI ###############


var xprt = {},
    config = require("./config.js"),
    appUrls = config.appUrls,
    screloVersion = config.version,
    utils = require("./utils.js"),
    retournerUrl = utils.retournerUrl;




// Injection d'une feuille de style
function addCss () {
    $('head').append('<link rel="stylesheet" href="' + appUrls.stylesheat + '" type="text/css" />');
}




// Ui
// TODO: a séparer, c'est moche
function ui (contexte, relireToc) {
    
    var papier = contexte.localStorage.papier === true ? "" : " class='off'",
        buttons = ["<a data-screlo-button='edit' title='Editer' href='" + retournerUrl('editer') + "'>Editer</a>",
                   "<a data-screlo-button='download' title='Récupérer la source' href='" + retournerUrl('doc') + "'>Récupérer la source</a>",
                   "<a data-screlo-button='upload' title='Recharger la source' href='" + retournerUrl('otx') + "'>Recharger la source</a>",
                   "<a data-screlo-button='ajax' title='Relecture du numéro'>Relecture du numéro</a>",
                   "<a data-screlo-button='clear' title='Vider le cache pour ce site'>Vider le cache pour ce site</a>",
                   "<a data-screlo-button='cycle' title='Aller au marqueur suivant'>Aller au marqueur suivant</a>",
                   "<a data-screlo-button='papier' title='Revue papier'" + papier + ">Revue papier</a>",
                   "<a data-screlo-button='info' title='Informations'>Informations</a>",
                   "<span></span>",
                   "<a data-screlo-button='gocontents' class='hidden' title='Parent'>Parent</a>",
                   "<a data-screlo-button='goprev' class='hidden' title='Précédent'>Précédent</a>",
                   "<a data-screlo-button='gonext' class='hidden' title='Suivant'>Suivant</a>",
                   "<form id='form-acces-rapide'><input id='acces-rapide' type='text' data-screlo-action='go' placeholder='▶'/></form>"],
        squel = "<div id='screlo-main'><ul id='screlo-infos'></ul><ul id='screlo-tests'></ul><div id='screlo-toolbar'>" + buttons.join('\n') + "</div></div><div id='screlo-loading' ></div>";
    
    $(squel).appendTo("body");

    // Preparer a la relecture Ajax en ajoutant les conteneurs et afficher les erreurs en cache si elles existent
    if (contexte.classes.publications && contexte.toc) {
        var id = "",
            lsErreurs,
            $target,
            lsExists = false,
            $element,
            $prev;

        for (var i=0; i<contexte.toc.length; i++ ) {

            id = contexte.toc[i].id;
            $element = contexte.toc[i].$element;

            // NOTE: manip indispensable pour séparer les résultats en cas d'alias. Le markup de la maquette ne permet pas de faire mieux.
            if ($element.nextUntil(".title", ".altertitle").length !== 0) {
                $prev = $element.nextUntil(".title", ".altertitle").last();
            } else if ($element.nextUntil(".title", ".subtitle").length !== 0) {
                $prev = $element.nextUntil(".title", ".subtitle").last();
            } else {
                $prev = $element;
            }

            $target = $("<ul class='screlo-relecture' id='relecture" + id + "'></ul>").insertAfter($prev);
            lsErreurs = contexte.localStorage.erreurs[id];

            if (lsErreurs) {
                afficherErreurs(lsErreurs, $target);
                lsExists = true;
            }
        }

        if (lsExists) {
            $("<li id='screlo-infocache'>Erreurs chargées à partir du cache de Screlo. <a href='#'>Mettre à jour.</a></li>").appendTo("#screlo-tests");
        }

        // Fix de maquette : certaines publications ont un style height inline sur #main
        if ( $('#main[style*="height"]').length ) {
            var expectedHeight = $("#main").css("height");
            $("#main").css({"height": "auto", "min-height": expectedHeight});
        }
    }

    // Fonctions
    $( "[data-screlo-button='info']" ).click(function( event ) {
        event.preventDefault();
        var msg = 'Screlo version ' + screloVersion + '\n\nScrelo effectue les tests suivants :\n' + listerTests(tests).join('\n') + '\n\nUne mise à jour de Screlo est peut-être disponible. Forcer la mise à jour ?',
            user = false;
        user = confirm(msg);
        if (user) {
            window.location.href = appUrls.update;
        }
    });

    $( "[data-screlo-button='ajax']" ).click(function( event ) {
        event.preventDefault();
        relireToc(contexte);
    });

    // TODO: à revoir (doublon ci-dessus + .live() pas très performant : préférer {display: none} + .click())
    // NOTE: avec un jquery recent il faudrait utiliser .on()
    $("#screlo-infocache").live("click", function ( event ) {
        event.preventDefault();
        relireToc(contexte);
    });

    $( "[data-screlo-button='clear']" ).click(function( event ) {
        event.preventDefault();
        var msg = 'Vider le cache de Screlo pour le site "' + contexte.nomCourt + '" ?',
            user = false;
        user = confirm(msg);
        if (user) {
            localStorage.removeItem(contexte.nomCourt);
            location.reload();
        }
    });

    $( "[data-screlo-button='cycle']" ).click(function( event ) {
        event.preventDefault();
        cycle();
    });

    $( "[data-screlo-button='papier']" ).click(function( event ) {
        event.preventDefault();
        var ls = contexte.localStorage,
            toggle = !contexte.localStorage.papier;
        ls.papier = toggle;
        localStorage.setItem(contexte.nomCourt, JSON.stringify(ls));
        location.reload();
    });

    $( "#form-acces-rapide" ).submit(function( event ) {
        event.preventDefault();
        var idAcces = $('input#acces-rapide').val();
        if (typeof idAcces === 'string') {
            window.location.href = retournerUrl(idAcces);
        }
    });
    
}




// Faire défiler les marqueurs un par un
function cycle () {
    
    var winPos = $(window).scrollTop(),
        maxScroll = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) - window.innerHeight,
        marqueurs = $(".screlo-marqueur, .symbolalert").map(function() {
            return $(this).offset().top;
        }).get();

    for (var i=0; i<marqueurs.length+1; i++) {
        if (i === marqueurs.length || winPos >= maxScroll) {
            $(window).scrollTop(marqueurs[0]);
        } else if (marqueurs[i] > winPos + 10) {
            $(window).scrollTop(marqueurs[i]);
            break;
        }
    }
}


xprt.addCss = addCss;
xprt.ui = ui;

module.exports = xprt;