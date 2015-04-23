/*
    Screlo - Checker
    ==========
    Cet objet est associé à un document unique (ie il faut créer un checker par document à vérifier). 
    Il peut être généré de plusieurs façons :
        1. new Checker() : calcul automatique au chargement du document.
        2. new Checker(id) : requête ajax où id est l'identifiant numérique du document ou une url.     
        3. new Checker(notifications) : où notifications est un array contenant des notifications. Dans ce cas les attributs root et context ne sont pas définis et les tests ne sont pas exécutés. C'est cette construction qui est utilisée pour afficher des notifications depuis le cache (localStorage).
    La méthode checker.ready(callback) permet d'appeler une fonction quand le checker a terminé le chargement des sources et l'exécution des tests. Linstance de Checker est passé en unique paramètre du callback. Les deux méthodes suivantes peuvent alors être appelées :
        * La méthode checker.show() permet l'affichage dans l'élément ciblé par le sélecteur checker.target
        * La méthode checker.toCache() permet l'enregistrement du checker dans le localStorage.
    Deux méthodes checker.setLoading() et checker.unsetLoading() affichent/masquent l'indicateur de progression dans l'élément checker.target. NOTE: pas implémenté pour la relecture de la ToC où un seul indicateur s'affiche pour tous les checkers de la page.
*/

var tests = require("./tests-revues.js"),
    Notification = require("./Notification.js"),
    utils = require("./utils.js"),
    globals = require("./globals.js");

function Checker (arg) {
    this.isDisplayedDocument = (typeof arg === "undefined");
    this.id = arg || globals.page;
    this.isReady = false;
    this.notifications = [];
    this.target = "#screlo-notifications";
    this.context = { classes: {} };
    this.sources = [];
    this.numberOfTests = 0;
    this.exceptions = [];
    
    // Si arg est un Array, il s'agit de notifications à charger (généralement depuis le cache). On ne procède alors à aucun test.
    if (typeof arg === "object" && arg.numberOfTests !== "undefined" && utils.isNumber(arg.numberOfTests) && arg.notifications && typeof arg.notifications === "object") {
        this.numberOfTests = arg.numberOfTests || 0;
        this.exceptions = arg.exceptions || [];
        this.pushNotifications(arg.notifications);
        return;
    }         
    
    // Sinon on lance les tests
    // 1. On charge le document
    var that = this;
    Loader.load(this.id, function (mainCheckerSource) {
        // 2. On récupère le contexte qui déterminera les tests à exécuter
        var classes = mainCheckerSource.bodyClasses;
        that.setContext(classes);
        // 3. On charge les sources supplémentaires nécessaires à ce Checker
        var sourceId,
            source;
        for (var i = 0; i < tests.length; i++) {
            thisTest = tests[i];
            if (thisTest.condition(that.context)) {
                sourceId = that.getSourceId(thisTest);
                source = Loader.load(sourceId);
                that.addSource(source);
            }
        }
        // 4. Quand les sources sont toutes chargées on exécute les tests
        Loader.onSourcesReady(that.sources, function (infos) {
            that.process (function () {
                // Et voilà !
                that.isReady = true;
            });
        });
    });  
}

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

Checker.prototype.addSource = function (source) {
    if (!source) { return false; }
    this.sources.push(source);
    return true;
};

Checker.prototype.setContext = function (classes) {       
    for ( var i=0; i < classes.length; i++ ) {
        this.context.classes[classes[i]] = true;
    }
    this.context.isMotscles = $("body").hasClass("indexes") && $("body").is("[class*='motscles']");
    this.context.paper = globals.paper;
};

Checker.prototype.getSourceId = function (test) {
    var site = utils.getUrl("site");
    if (test.source && typeof test.source === "function") {
        return test.source(site, this.id);
    } else if (test.source && typeof test.source === "string") {
        return test.source;
    }
    return this.id || globals.page;
};

Checker.prototype.process = function (callback) {
    var thisTest,
        sourceId,
        source,
        root,
        notif, 
        res,
        injectMarker = function (marker) {
            marker.inject();
        };
    if (!this.context) {
        console.error("Erreur lors de l'exécution des tests : le contexte n'est pas défini");
        return;
    }
    for (var i=0; i<tests.length; i++) {
        thisTest = tests[i];
        if (!thisTest.condition(this.context)) {
            continue;
        }
        sourceId = this.getSourceId(thisTest);
        source = Loader.getSource(sourceId);
        if (source.isError) {
            this.exceptions.push("Source " + sourceId);
            continue;
        } 
        root = source.root;
        notif = new Notification(thisTest, root);
        res = thisTest.action(notif, this.context, root); // NOTE: les deux derniers arguments sont déjà dans notif (je crois). Il serait mieux de ne pas les repasser encore.
        if (!res || !res instanceof Notification) { // Si le test ne renvoit pas une notification alors il est ignoré et l'utilisateur en est averti. Permet de notifier des anomalies en renvoyant false, par exemple quand un élément n'est pas trouvé dans la page alors qu'il devrait y être.
            this.exceptions.push("Test #" + notif.id);
            continue;
        }
        if (res.active) {
            if (res.markers.length > 0) {
                res.markers.forEach( injectMarker );
            }
            this.notifications.push(res);
        }
        this.numberOfTests++;
    }
    if (callback && typeof callback === "function") {
        callback();
    }
};

Checker.prototype.ready = function (callback) { 
    var that = this,
        checkIfReady = function () {
            if (that.isReady) {
                callback(that);
                return;
            } else {    
                setTimeout(checkIfReady, 1000);
            }
        };
    checkIfReady();
    return this;
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

// Filter les notifications qui seront affichées. N'affecte pas this.notifications.
Checker.prototype.filterNotifications = function () {
    function filterPrint (notifications) {
        var res = [];
        for (var i=0; i<notifications.length; i++) {
            if (notifications[i].type !== "print") {
                res.push(notifications[i]);
            }
        }
        return res;
    }
    var notifications = this.notifications, 
        notificationsToShow = globals.paper ? notifications : filterPrint(notifications);
    if (notificationsToShow.length === 0 && this.numberOfTests > 0 && (this.context.classes.textes || !this.isDisplayedDocument)) { // NOTE: On n'affiche pas le message de succès sur la table des matières pour éviter la confusion entre relecture des métadonnées de la publication et relecture de ses documents.
        var successMessage = new Notification({
            name: 'Aucune erreur détectée <span class="count">' + this.numberOfTests + ' tests</span>',
            type: "succes"
        });
        notificationsToShow.push(successMessage);
    }
    if (this.exceptions.length > 0) {
        var notifName = this.exceptions.length === 1 ? "Un test qui n'a pas pu aboutir a été ignoré <span class='count'>" + this.exceptions.length + " test</span>" : "Des tests qui n'ont pas pu aboutir ont été ignorés <span class='count'>" + this.exceptions.length + " tests</span>",
            errorMessage = new Notification({
                name: notifName,
                type: "screlo-exception"
            });
        notificationsToShow.push(errorMessage);
    }
    return notificationsToShow;
};

Checker.prototype.hasTarget = function () {
    if (!this.target || (this.target && $(this.target).length === 0)) {
        console.error("Erreur: 'target' n'est pas défini ou n'existe pas.");
        return false;
    }
    return true;
};

Checker.prototype.setLoading = function () {
    if (!this.hasTarget()) { return; }
    $(this.target).addClass("screlo-loading");
    return this;
};

Checker.prototype.unsetLoading = function () {
    if (!this.hasTarget()) { return; }
    $(this.target).removeClass("screlo-loading");
    return this;
};

Checker.prototype.show = function () {
    if (!this.hasTarget()) { return; }
    this.sortNotifications();
    var notifs = this.filterNotifications(),
        notif,
        $element;
    for (var i=0; i < notifs.length; i++) {
        notif = notifs[i];
        $element = $(notif.getHtml()).appendTo(this.target);
        if (notif.type === "screlo-exception") {
            $element.attr("title", "Anomalies rencontrées : " +  this.exceptions.join(", "));
        }
    }
    return this;
};

Checker.prototype.toCache = function () {
    var nomCourt = globals.nomCourt,
        id = this.id,
        value = {};
        value.numberOfTests = this.numberOfTests;
        value.exceptions = this.exceptions;
        value.notifications = this.notifications.map(function (notification) {
            return notification.export();
        });
    utils.cache.set(nomCourt, id, value);  
    return this;
};

module.exports = Checker;