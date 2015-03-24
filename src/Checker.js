/*
    Screlo - Checker
    ==========
    Cet objet est associé à un document unique (ie il faut créer un Checker par document à vérifier). 
    Il peut être généré de plusieurs façons :
        1. new Checker() : calcul automatique au chargement du document.
        2. new Checker(id) : requête ajax où id est l'identifiant numérique du document. Utiliser la méthode .ready(callback) pour afficher le Checker après l'initialisation.
        3. new Checker(notifications) : où notifications est un Array contenant des Notification (notamment tirées du localStorage). Dans ce cas les attributs root et context ne sont pas définis.    
    La méthode this.show() permet l'affichage dans l'élément ciblé par le sélecteur this.target.
    La méthode this.toCache() permet l'enregistrement dans le localStorage.
*/

var tests = require("./tests-revues.js"),
    Notification = require("./Notification.js"),
    utils = require("./utils.js"),
    globals = require("./globals.js");

function Checker (arg) {
    this.isReady = false;
    this.notifications = [];
    this.target = "#screlo-notifications";
    this.context = { classes: [] };
    this.idPage = location.pathname.match(/(\d+)$/g);
    this.numberOfTests = 0;
    
    // Trouver root et context
    if (utils.isNumber(arg)) {
        this.initFromAjax(arg);
    } else if (typeof arg === "object" && arg.numberOfTests !== "undefined" && utils.isNumber(arg.numberOfTests) && arg.notifications && typeof arg.notifications === "object") {
        this.numberOfTests = arg.numberOfTests;
        this.pushNotifications(arg.notifications);
    } else if (typeof arg === "undefined") {
        this.initFromPage();
    } else {
        console.error("Bad parameters in Checker's constructor");
    }
}

Checker.prototype.initFromPage = function () {
    var classes = document.body.className.split(/\s+/);
    this.root = document;
    this.setContext(classes);
    this.process();
};

Checker.prototype.initFromAjax = function (id) {
    function ajaxFail(id) {      
        var failMessage = new Notification({
            name: "Impossible de charger ce document",
            type: "screlo-exception"
        });
        this.notifications.push(failMessage);
    }
    var url =  utils.getUrl("site") + id,
        chkr = this;
    this.idPage = id;
    // NOTE: Comme Lodel utilise une vieille version de jquery (1.4) on ne peut pas utiliser $.get().done().fail().always(). On utilise donc $.ajax()
    $.ajax({
        url: url,
        timeout: 20000,
        success: function(data) {
            if (data && data.match(/\n.*(<body.*)\n/i) !== null) {
                var body = data.match(/\n.*(<body.*)\n/i)[1].replace("body", "div"),
                    classes = $(body).get(0).className.split(/\s+/),
                    container = $("<div></div>").append($(data).find("#main"));                
                chkr.root = container;
                chkr.setContext(classes);
                chkr.process();
            } else {
                ajaxFail();
            }
        },
        error: function() {
            ajaxFail();
        },
        complete: function() {
            chkr.isReady = true;
        }                
    });
};

Checker.prototype.ready = function (callback) {   
    var chkr = this,
        interval = setInterval(function () {
            if (chkr.isReady) {
                callback(chkr);
                clearInterval(interval);
            }
        }, 1000);
};

Checker.prototype.pushNotifications = function (notif) {
    // Récursif si tableau
    if (notif.constructor === Array) {
        for (var i=0; i < notif.length; i++) {
            this.pushNotifications(notif[i]);
        }
    } else {
        // Convertir en Notification les objets tirés du localStorage
        if (!(notif instanceof Notification)) {
            notif = new Notification(notif);
        }
        this.notifications.push(notif);
    }
};

Checker.prototype.setContext = function (classes) {       
    for ( var i=0; i < classes.length; i++ ) {
        this.context.classes[classes[i]] = true;
    }
    this.context.admin = ($('#lodel-container').length !== 0);
    this.context.isMotscles = $("body").hasClass("indexes") && $("body").is("[class*='motscles']");
    this.context.paper = globals.paper;
};

// Applique les tests
Checker.prototype.process = function () {
    function injectMarker(marker) {
        marker.inject();
    }
    var thisTest,
        notif,
        res;
    this.numberOfTests = 0;
    if (!(this.root && this.context)) {
        console.log("Erreur lors du process(): attributs manquants dans Checker");
        return;
    }
    for (var i = 0; i < tests.length; i++) {
        thisTest = tests[i];
        if (thisTest.condition(this.context)) {
            notif = new Notification(thisTest, this.root);
            res = thisTest.action(notif, this.context, this.root);
            if (res.active) {
                if (res.markers.length > 0) {
                    res.markers.forEach( injectMarker );
                }
                this.notifications.push(res);
            }
            this.numberOfTests++;
        }
    }
};

// Ordonner this.notifications.
Checker.prototype.sortNotifications = function () {
    this.notifications.sort( function (a, b) {
        var ordre = ['screlo-exception','danger','warning','print','succes'],
            typeA = ordre.indexOf(a.type),
            typeB = ordre.indexOf(b.type);
        if (typeA > typeB) { return 1; }
        if (typeA < typeB) { return -1; }
        return 0;
    });
};

Checker.prototype.show = function () {
    // Filter les notifications qui seront affichées. N'affecte pas this.notifications.
    function filterNotifications (notifications) {
        function filterPrint (notifications) {
            var res = [];
            for (var i=0; i<notifications.length; i++) {
                if (notifications[i].type !== "print") {
                    res.push(notifications[i]);
                }
            }
            return res;
        }
        var notificationsToShow = globals.paper ? notifications : filterPrint(notifications);
        if (notificationsToShow.length === 0 && that.numberOfTests > 0 && (that.context.classes.textes || that.root !== document)) {
            var successMessage = new Notification({
                name: 'Aucune erreur détectée <span class="count">' + that.numberOfTests + ' tests</span>',
                type: "succes"
            });
            notificationsToShow.push(successMessage);
        }
        return notificationsToShow;
    }
    if (!this.target || (this.target && $(this.target).length === 0)) {
        console.log("Erreur: 'target' n'est pas défini ou n'existe pas.");
        return;
    }
    if (!this.notifications || this.notifications && this.notifications.length === 0) {
        return;
    }
    this.sortNotifications();
    var that = this,
        notifs = filterNotifications(this.notifications),
        notif;
    for (var i=0; i < notifs.length; i++) {
        notif = notifs[i];
        $(notif.getHtml()).appendTo(this.target);
    }
};

Checker.prototype.toCache = function () {
    var nomCourt = globals.nomCourt,
        id = this.idPage,
        value = {};
        value.numberOfTests = this.numberOfTests;
        value.notifications = this.notifications.map(function (notification) {
            return notification.export();
        });
    utils.cache.set(nomCourt, id, value);  
    return this;
};

module.exports = Checker;