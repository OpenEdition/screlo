// USER COMMANDS



var utils = require("./utils.js"),
	globals = require("./globals.js"),
    Checker = require("./Checker.js"),
    cmd = {};


// TODO: ambiguite avec l'info de l'aide => à distinguer plus clairement
cmd.info = function () {

    var msg = 'Screlo version ' + globals.version + '\n\nScrelo effectue les tests suivants :\n' + listerTests(tests).join('\n') + '\n\nUne mise à jour de Screlo est peut-être disponible. Forcer la mise à jour ?',
        user = false;

    user = confirm(msg);

    if (user) {
        window.location.href = appUrls.update;
    }

};



cmd.ajax = function () {
    
    
    function ajaxStart () {
        
        $("#screlo-tests #screlo-infocache").remove();
        $(".screlo-relecture").empty();
        $("body").addClass("loading");
        
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
            console.log("_this", _this);
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
    
    if (!globals.isNumero) {
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



cmd.cycle = function () {

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

};



cmd.quickAccess = function () {

    var idAcces = $('input#acces-rapide').val();

    if (typeof idAcces === 'string') {
        window.location.href = utils.getUrl(idAcces);
    }

};



cmd.paper = function () {
    
    var currentState = utils.cache.get(globals.nomCourt, "paper"),
        toggleState = !currentState;
    
    utils.cache.set(globals.nomCourt, "paper", toggleState);
    location.reload();

};


cmd.showInfo = function ($clickElement) {
    
    var id = $clickElement.attr("data-screlo-id"),
        info;
    
    if (!id && id !== 0) {
        return false;
    }
    
    id = parseInt(id);
    info = globals.infos[id];
    
    picoModal({
        content: info,
        width: 600
    }).afterClose(function (modal) { modal.destroy(); }).show();
    
};

module.exports = cmd;