// ################ SCRELO CORE ###############

var xprt = {},
    version = require("./config.js").version,
    improveLodel = require("./lodel.js").improveLodel,
    getTests = require("./tests-revues.js"),
    reqUi = require("./ui.js"), // TODO: Ouh c'est vilain ce nom
    addCss = reqUi.addCss,
    ui = reqUi.ui,
    utils = require ("./utils.js"),
    retournerUrl = utils.retournerUrl,
    nomCourt = utils.nomCourt;
    


// Objet Notification
function Notification (test, root) {

    this.id = typeof test.id === 'number' ? test.id : 0;
    this.name = typeof test.name === 'string' ? test.name : '';
    this.help = typeof test.help === 'string' ? test.help : '';
    this.type = typeof test.type === 'string' ? test.type : 'danger';
    this.label = typeof test.label === 'string' ? test.label : test.name;
    this.labelPos = typeof test.labelPos === 'string' ? test.labelPos : "before";
    this.count = 0;
    this.markers = [];
    this.active = false;

    // Debug
    this.root = root;
    this.version = Notification.prototype.version;

}

// TODO: remplacer une config "schema" qui englobe Notification et Marker
Notification.prototype.version = "15.1.1+b"; // NOTE: Valeur à modifier quand l'architecture de l'objet Notification change. Permet d'éviter les incompatibilités avec les objets obsolètes qui peuvent se trouver dans localStorage.

Notification.prototype.getName = function () {

    var html = this.name;

    if (this.count > 0) {
        html = html + " <span>" + this.count + "</span>";
    }

    return html;
};

Notification.prototype.addMarker = function (element, label) {
    label = label !== undefined ? label : this.label;

    this.markers.push(
        new Marker ({
            element: element,
            label: label,
            type: this.type,
            pos: this.labelPos
        })
    );

    this.count++;

    return this;
};

Notification.prototype.activate = function () {
    this.active = true;
    return this;
};




// Objet Marker
function Marker (options) {

    this.id = typeof options.id === 'number' ? options.id : 0;
    this.label = typeof options.label === 'string' ? options.label : "";
    this.type = typeof options.type === 'string' ? options.type : 'danger';
    this.labelPos = typeof options.labelPos === 'string' ? options.labelPos : "before";
    this.element = options.element;
    this.valid = this.element && this.element.nodeType === 1 && this.label !== "";

    if (!this.valid) {
        console.log("Erreur à la création du Marker : paramètres invalides.");
    }

}

Marker.prototype.inject = function () {

    var $span = $('<span class="screlo-marqueur"></span>').addClass(this.type).attr("data-screlo-marqueur-text", this.label).attr("data-screlo-marqueur-id", this.id);

    if (!this.valid) {
        return;
    }

    if (this.labelPos !== "after") {
        $span.prependTo(this.element);
    } else {
        $span.appendTo(this.element);    
    }
    $("body").addClass("hasMarqueur");

};




// Determiner le contexte d'execution
function getContexte (importClasses) {

    var contexte = { "classes" : {} };

    for ( var i=0; i < importClasses.length; i++ ) {
        contexte.classes[importClasses[i]] = true;
    }

    if (contexte.classes.numero) {
        var urls = [],                
            tocElements = $('ul.summary li.textes .title');

        contexte.toc = [];

        tocElements.each( function() {
            var obj = {},
                id = $(this).children('a').eq(0).attr('href');
            if (id !== undefined) {
                obj.id = id;
            }
            obj.$element = $(this);
            contexte.toc.push(obj);
        });
    }

    contexte.admin = ($('#lodel-container').length !== 0);
    contexte.isMotscles = $("body").hasClass("indexes") && $("body").is("[class*='motscles']");
    contexte.idPage = location.pathname.match(/(\d+)$/g);
    contexte.nomCourt = nomCourt();
    contexte.localStorage = JSON.parse(localStorage.getItem(contexte.nomCourt));
    contexte.localStorage = contexte.localStorage ? contexte.localStorage : {};

    if (contexte.localStorage.papier !== false) {
        contexte.localStorage.papier = true;
    }

    if (!contexte.localStorage.erreurs) {
        contexte.localStorage.erreurs = {};
    }

    return contexte;

}




// Effectuer les tests
function relire(tests, root) {

    function injectMarker(marker) {
        marker.inject();
    }

    var thisTest,
        notif,
        res,
        notifs = [],
        nbTests = 0;

    root = typeof root !== undefined ? root : document;

    for (var i = 0; i < tests.length; i++) {

        thisTest = tests[i];

        if (thisTest.condition) {

            notif = new Notification(thisTest, root);
            res = thisTest.action(notif, root);

            if (res.active) {

                if (res.markers.length > 0) {
                    res.markers.forEach( injectMarker );
                }

                notifs.push(res);
            }

            nbTests++;
        }
    }

    if (notifs[0] === undefined && nbTests > 0 && (contexte.classes.textes || root !== document)) {

        var successMessage = new Notification({
            name: 'Aucune erreur détectée <span>' + nbTests + ' tests</span>',
            type: "succes"
        });

        notifs.push(successMessage);
    }

    return notifs;
}




// Afficher les erreurs
// TODO: renommer en notif
function afficherErreurs(erreurs, target) {

    // TODO: revoir ici pour notifications + n'afficher les marqueurs que si notif.root === document.
    erreurs.sort(function (a, b) {
        var ordre = ['screlo-exception','danger','warning','print','succes'],
            typeA = ordre.indexOf(a.type),
            typeB = ordre.indexOf(b.type),
            err;

        if (typeA > typeB)
            return 1;
        if (typeA < typeB)
            return -1;
        return 0;
    });

    for (var i = 0; i < erreurs.length; i++) {

        err = erreurs[i];

        if (err.version === Notification.prototype.version) {

            if (!(err instanceof Notification)) { // TODO: ça arrive quand ça sort du localStorage, mais je pense qu'il faudrait faire ça dès le moment où le localStorage est transformé en objet => genre une fonction getLS()
                err = new Notification(err);
            }

            $('<li class="erreur ' + err.type + '">' + err.getName() + '</li>').appendTo(target);
        }
    }
}




// Afficher un message screlo-exception
// FIXME: obsolete
function afficherScreloException (message, target) {
    var erreur = new Erreur(message, "screlo-exception"),
        erreurs = [erreur];

    afficherErreurs(erreurs, target);
}




// Relecture Ajax
function relectureAjax(id, callback, total) {

    var url =  retournerUrl("site") + id;

    // NOTE: comme Lodel utilise une vieille version de jquery (1.4) on ne peut pas utiliser $.get().done().fail().always(). On utilise donc $.ajax()       
    $.ajax({
        url: url,
        timeout: 20000,
        success: function(data) {
            if (data && data.match(/\n.*(<body.*)\n/i) !== null) {
                var root = data.match(/\n.*(<body.*)\n/i)[1].replace("body", "div"),
                    classes = $(root).get(0).className.split(/\s+/),
                    contexte = getContexte(classes), 
                    container = $("<div></div>");
                container.append($(data).find("#main"));

                var tests = getTests(contexte),
                    erreurs = relire(tests, container);

                afficherErreurs(erreurs, "ul#relecture" + id);
                cacherErreurs(id, erreurs);
            } else {
                erreurAjax(id);                        
            }
        },
        error: function() {
            erreurAjax(id);
        },
        complete: function() {
            $("ul#relecture" + id).addClass("complete");

            if (callback && typeof(callback) === "function" && total) {
                callback(total);
            }
        }                
    });

    function erreurAjax(id) {
        afficherScreloException("Impossible de charger ce document", "ul#relecture" + id);
    }
}




function relireToc(contexte) {

    if (contexte.classes.numero && contexte.toc.length !== 0) {

        $("#screlo-tests #screlo-infocache").remove();
        $(".screlo-relecture").empty();
        $("body").addClass("loading");

        var total = contexte.toc.length;

        for (var i = 0; i < total; i++) {
            relectureAjax(contexte.toc[i].id, relireTocProgression, total);
        }
    } else {
        alert("Impossible d'exécuter cette fonction (relireToc).");
    }               
}




function relireTocProgression(total) {
    if (total === $(".screlo-relecture.complete").length) {
        $("body").removeClass("loading");
        $(".complete").removeClass("complete");
    }
}




// Cacher les Erreurs dans le ls pour limiter les requetes
// TODO: dans le core ?
function cacherErreurs (contexte, erreurs) {
    var id = contexte.idPage;
    contexte.localStorage.erreurs[id] = erreurs;
    localStorage.setItem(contexte.nomCourt, JSON.stringify(contexte.localStorage));
}




function run () {

    var contexte = getContexte(document.body.className.split(/\s+/)),
        tests = getTests(contexte),
        erreurs = relire(tests, document);

    addCss();
    ui(contexte, relireToc);
    afficherErreurs(erreurs, "#screlo-tests");
    cacherErreurs(contexte, erreurs);
    improveLodel();

    console.log('Screlo.js version ' + version + ' est chargé !');
    
}

xprt.relireToc = relireToc;
xprt.run = run;

module.exports = xprt;
