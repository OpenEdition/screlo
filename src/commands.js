/*
    Screlo - commands
    ==========
    Contient les fonctions utilisées par les event handlers de ui.js.
*/

var utils = require("./utils.js"),
	globals = require("./globals.js"),
    Checker = require("./Checker.js"),
    tests = require("./tests-revues.js"),
    cmd = {};

cmd.about = function () {
    var msg = '<h1>Script de relecture pour Lodel</h1>\n' +
        '<p>Version ' + globals.version + ' (<a href="' + globals.appUrls.homepage + '">' + globals.appUrls.homepage + '</a>)</p>\n\n' +
        '<p>' +
        '<a target="_blank" href="' + globals.appUrls.homepage + '">Page du projet</a><br>\n' +
        '<a target="_blank" href="' + globals.appUrls.doc + '">Documentation en ligne</a><br>\n' +
        '<a href="' + globals.appUrls.update + '">Mettre à jour</a>\n' +
        '</p>';
    picoModal({
        content: msg,
        width: 400,
        closeStyles: "",
        modalStyles: ""
    }).afterClose(function (modal) { 
        modal.destroy(); 
    }).show();
};

cmd.ajax = function () {
    
    function ajaxStart () {      
        $("#screlo-notifications #screlo-infocache").remove();
        $(".screlo-ajax-notifications").empty();
        $("body").addClass("loading");
        $("#screlo-infocache").remove();   
    }
    
    function isDone (count) {
        return (count === toc.length);
    }
    
    function ajaxEnd () {
        $("body").removeClass("loading");
        $(".complete").removeClass("complete");
    }
    
    function doChecker (id) {
        var chkr = new Checker(id);
        chkr.target = "ul#relecture" + id;   
        chkr.ready( function (_this) {
            _this.toCache().show();
            doneCheckers++;
            if (isDone(doneCheckers)) {
                ajaxEnd();
            }
        });   
    }

    var toc = globals.toc,
        doneCheckers = 0,
        id;  
    if (!globals.isPublication) {
        console.log("Impossible d'utiliser la relecture ajax sur cette page.");
        return;
    }
    ajaxStart();
    for ( var i=0; i<toc.length; i++ ) {
        id = toc[i].id;
        doChecker(id);
    }
};

cmd.clear = function () {
    var msg = 'Vider le cache de Screlo pour le site "' + globals.nomCourt + '" ?',
        user = false;
    user = confirm(msg);
    if (user) {
        utils.cache.clear(globals.nomCourt);
        location.reload();
    }
};

cmd.cycle = function (id) {
    var winPos = $(window).scrollTop(),
        maxScroll = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) - window.innerHeight,
        selector = id ? ".screlo-marker[data-screlo-marker-id='" + id + "']" : ".screlo-marker",
        marqueurs = $(selector).map(function() {
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
};

cmd.toggleCache = function (id) {
    var currentState = utils.cache.get(globals.nomCourt, id),
        toggleState = !currentState;
    utils.cache.set(globals.nomCourt, id, toggleState);
    location.reload();
}

cmd.showInfo = function ($clickElement) { 
    // TODO: à recoder (sélecteurs divers, css)   
    var id = $clickElement.parents("[data-screlo-id]").eq(0).attr("data-screlo-id"),
        info;
    if (!id && id !== 0) {
        return false;
    }
    $clickElement.parents(".screlo-notification-actions").addClass("active");
    id = parseInt(id);
    info = globals.infos[id];
    picoModal({
        content: info,
        width: 600,
        closeStyles: "",
        modalStyles: ""
    }).afterClose(function (modal) { 
        modal.destroy(); 
        $(".screlo-notification-actions.active").removeClass("active");
    }).show();
};

module.exports = cmd;