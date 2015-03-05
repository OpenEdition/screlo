// ################ SCRELO UI ###############


var ui = {},
    cmd = require("./commands.js"),
    globals = require("./globals.js"),
    utils = require("./utils.js"),
    Checker = require("./Checker.js");


function manageCss () {
    $('head').append('<link rel="stylesheet" href="' + globals.appUrls.stylesheet + '" type="text/css" />');
    
    // Fix de maquette : certaines publications ont un style height inline sur #main qui pose problème lors de l'ajout de notifications.
    if ( $('#main[style*="height"]').length ) {
        var expectedHeight = $("#main").css("height");
        $("#main").css({"height": "auto", "min-height": expectedHeight});
    }
}


function manageDom () {
    
    var papier = globals.paper === true ? "" : " class='off'",
        buttons = ["<a data-screlo-button='edit' title='Editer' href='" + utils.getUrl('editer') + "'>Editer</a>",
                   "<a data-screlo-button='download' title='Récupérer la source' href='" + utils.getUrl('doc') + "'>Récupérer la source</a>",
                   "<a data-screlo-button='upload' title='Recharger la source' href='" + utils.getUrl('otx') + "'>Recharger la source</a>",
                   "<a data-screlo-button='ajax' title='Relecture du numéro'>Relecture du numéro</a>",
                   "<a data-screlo-button='clear' title='Vider le cache pour ce site'>Vider le cache pour ce site</a>",
                   "<a data-screlo-button='cycle' title='Aller au marqueur suivant'>Aller au marqueur suivant</a>",
                   "<a data-screlo-button='papier' title='Revue papier'" + papier + ">Revue papier</a>",
                   "<a data-screlo-button='info' title='Informations'>Informations</a>",
                   "<span></span>",
                   "<a data-screlo-button='gocontents' class='hidden' title='Parent'>Parent</a>", // TODO: sortir du core
                   "<a data-screlo-button='goprev' class='hidden' title='Précédent'>Précédent</a>",
                   "<a data-screlo-button='gonext' class='hidden' title='Suivant'>Suivant</a>",
                   "<form id='form-screlo-goto'><input id='screlo-goto' type='text' data-screlo-action='go' placeholder='▶'/></form>"],
        squel = "<div id='screlo-main'><ul id='screlo-notifications'></ul><ul id='screlo-infos'></ul><div id='screlo-toolbar'>" + buttons.join('\n') + "</div></div><div id='screlo-loading' ></div>";

    $(squel).appendTo("body");
    
}


function manageEvents () {
    
    $( "[data-screlo-button='info']" ).click(function( event ) {
        event.preventDefault();
        cmd.info();
    });

    $( "[data-screlo-button='ajax']" ).click(function( event ) {
        event.preventDefault();
        cmd.ajax();
    });

    // TODO: à revoir (doublon ci-dessus + .live() pas très performant : préférer {display: none} + .click())
    // NOTE: avec un jquery recent il faudrait utiliser .on()
    $("#screlo-infocache").live("click", function ( event ) {
        event.preventDefault();
        cmd.ajax();
    });

    $( "[data-screlo-button='clear']" ).click(function( event ) {
        event.preventDefault();
        cmd.clear();
    });

    $( "[data-screlo-button='cycle']" ).click(function( event ) {
        event.preventDefault();
        cmd.cycle();
    });
    
    // TODO: séprarer du core de screlo
    $( "#form-screlo-goto" ).submit(function( event ) {
        event.preventDefault();
        cmd.quickAccess();
    });
    
    $( "[data-screlo-button='papier']" ).click(function( event ) {
        event.preventDefault();
        cmd.paper();
    });
    
    $(".screlo-notification [data-screlo-button='info']").live("click", function (event) {
        event.preventDefault();            
        cmd.showInfo($(this));
    });
    
    $(".screlo-notification [data-screlo-button='cycle']").live("click", function (event) {
        event.preventDefault(); 
        
        // TODO: harmoniser car pour "info" cette vérification est faite dans la commande. Il faudrait peut-être une fonction pour choper et tester l'id
        var id = $(this).parents("[data-screlo-id]").eq(0).attr("data-screlo-id");
        
        if (!id && id !== 0) {
            return false;
        }
        
        cmd.cycle(id);
    });
    
}


// Preparer a la relecture Ajax en ajoutant les conteneurs et afficher les erreurs en cache si elles existent
function manageToc () {
    
    function injectHtml (entry) {
        
        var id = entry.id,
            $element = entry.$element,
            $prev,
            $target;
        
        // NOTE: manip indispensable pour séparer les résultats en cas d'alias. Le markup de la maquette ne permet pas de faire mieux.
        if ($element.nextUntil(".title", ".description").length !== 0) {
            $prev = $element.nextUntil(".title", ".description").last();
        } else if ($element.nextUntil(".title", ".altertitle").length !== 0) {
            $prev = $element.nextUntil(".title", ".altertitle").last();
        } else if ($element.nextUntil(".title", ".subtitle").length !== 0) {
            $prev = $element.nextUntil(".title", ".subtitle").last();
        } else {
            $prev = $element;
        }

        $target = $("<ul class='screlo-ajax-notifications' id='relecture" + id + "'></ul>").insertAfter($prev);
        
        return $target;
        
    }
    
    
    function fromCache (entry, $target) {
        
        var cache = utils.cache.get(globals.nomCourt, entry.id),
            chkr;
        
        if (cache) {
            chkr = new Checker(cache);
            chkr.target = $target;
            chkr.show();
        }
        
        return cache !== null;
        
    }
    
    
    var toc = globals.toc,
        $target,
        somethingLoaded = false;
    
    if (!globals.isPublication) {
        return;
    }

    for (var i=0; i<toc.length; i++ ) {
        $target = injectHtml(toc[i]);
        somethingLoaded = fromCache(toc[i], $target);   
    }

    if (somethingLoaded) {
        $("<li id='screlo-infocache' class='screlo-info'>Notifications chargées à partir du cache du navigateur. <a href='#'>Mettre à jour.</a></li>").appendTo("#screlo-infos");
    }

}


function checkThisPage () {
    var chkr = new Checker();
    chkr.toCache().show();
}



ui.init = function () {

    manageCss();
    manageDom();
    manageEvents();
    manageToc();
    checkThisPage();    

};



module.exports = ui;