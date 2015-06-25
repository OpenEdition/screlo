// ==UserScript==
// @name        screlo
// @description Script de relecture pour Lodel
// @namespace   http://revues.org/
// @include     /https?:\/\/(?!(www|lodel|devel))[a-z0-9-]+\.revues.org\/+(?!(\/*lodel))/
// @include     /https?:\/\/(((lodel|devel)\.revues)|formations\.lodel)\.org\/+[0-9]{2}\/+[a-z0-9-]+\/+(?!(\/*lodel))/
// @version     15.6.4
// @updateURL	https://github.com/brrd/screlo/raw/master/dist/screlo.user.js
// @grant       none
// ==/UserScript==

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        that.addSource(mainCheckerSource);
        if (mainCheckerSource.isError) {
            that.isReady = true;
            return;
        }
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
        if (!res || !(res instanceof Notification)) { // Si le test ne renvoit pas une notification alors il est ignoré et l'utilisateur en est averti. Permet de notifier des anomalies en renvoyant false, par exemple quand un élément n'est pas trouvé dans la page alors qu'il devrait y être.
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

},{"./Notification.js":4,"./globals.js":7,"./tests-revues.js":10,"./utils.js":12}],2:[function(require,module,exports){
/*
    Screlo - Loader
    ==========
    Gère l'import des documents dans lesquels sont effectués les tests.
    Loader a notamment pour fonction d'éviter de charger deux fois la même source.
*/

var Source = require("./Source.js");

// TODO: ici Loader est volontairement attaché au contexte global. Il faudrait placer dans un namespace 'screlo'.
Loader = {
    sources: {},
    handledSources: {},
    getSource: function (id) {
        var res = id.constructor === Source ? id : this.sources[id];
        return res;
    },
    // Same as above with an array of sources
    getSources: function (urls) {
        var that = this,
            mapFunc = (function () {
                return that.getSource;
            })();
        return urls.map(mapFunc);
    },
    load: function (id, callback) {
        // handledSources stocke les identifiants des sources qui ont été traitées pour éviter la redondance
        if (this.handledSources[id]) {
            return false;
        }
        this.handledSources[id] = true;
        new Source(id, callback);
        return this.sources[id];
    },
    pushSource: function (source) {
        this.sources[source.id] = source;
    },
    infos: function (sourcesArray) {
        var res = {
                all: sourcesArray,
                ready: [],
                error: [],
                success: [],
                allReady: undefined
            },
            thisSource;
        for (var i=0; i<sourcesArray.length; i++) {
            thisSource = sourcesArray[i];
            if (thisSource.isReady) {
                res.ready.push(thisSource);
            } else {
                continue;
            }
            if (thisSource.isError) {
                res.error.push(thisSource);
            }
            if (thisSource.isSuccess) {
                res.success.push(thisSource);
            }
        }
        res.allReady = (res.ready.length === res.all.length);
        return res;
    },
    onSourcesReady: function (sourcesArray, callback) {
        var that = this,
            checkIfReady = function () {
                var infos = that.infos(sourcesArray),
                    flag = infos.allReady;
                if (flag) {
                    callback(infos);
                    return;
                } else {
                    setTimeout(checkIfReady, 1000);
                }
            };
        checkIfReady();
    }
};

module.exports = Loader;

},{"./Source.js":5}],3:[function(require,module,exports){
/*
    Screlo - Marker
    ==========
    Objet pour représenter les marqueurs insérés dans la page.
*/

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
    var $span = $('<span class="screlo-marker"></span>').addClass(this.type).attr("data-screlo-marker-text", this.label).attr("data-screlo-marker-id", this.id);
    if (!this.valid) {
        return;
    }
    if (this.labelPos !== "after") {
        $span.prependTo(this.element);
    } else {
        $span.appendTo(this.element);    
    }
    $("body").addClass("screlo-has-marker"); // TODO: body.screlo-hasmarker
};

module.exports = Marker;
},{}],4:[function(require,module,exports){
/*
    Screlo - Notification
    ==========
    Cet objet est passé en paramètre pour chaque test, avec des propriétés héritées de la définition du test. On peut alors utiliser les méthodes suivantes :
    * Notification.addMarker(element) permet d'ajouter un Marker à "element". Le Marker prend les propriétés de la Notification.
    * Notification.addMarkersFromRegex(element, $parent) ajoute un Marker à chaque string qui correspond à "regex" dans l'élément $parent.
    * Notification.activate(?flag) permet d'activer la Notification (elle sera affichée). Il est nécessaire d'activer la Notification (même quand elle possède des Markers). On peut faire : Notification.addMarker(element).activate(). La parametre flag est optionnel, c'est un bool qui détermine l'activation.
*/

var Marker = require("./Marker.js"),
    globals = require("./globals.js");

function Notification (test, root) {
    this.id = typeof test.id === 'number' ? test.id : 0;
    this.name = typeof test.name === 'string' ? test.name : '';
    this.type = typeof test.type === 'string' ? test.type : 'danger';
    this.label = typeof test.label === 'string' ? test.label : test.name;
    this.labelPos = typeof test.labelPos === 'string' ? test.labelPos : "before";
    this.markers = [];
    this.count = test.count || 0; // NOTE: always use count instead of markers.length
    this.active = false;
    this.infoExists = globals.infos[this.id] ? true : false;
    this.root = root instanceof jQuery ? root.get(0) : root;
    this.isCurrentLocation = this.root ? $.contains(document, this.root) : false;
}

Notification.prototype.getHtml = function () {
    // TODO: revoir les css (noms de classes de l'ensemble)
    var count = this.count > 0 ? " <span class='count'>" + this.count + "</span>" : "",
        cycle = this.isCurrentLocation && this.count > 0 ? "<a data-screlo-button='cycle'>Rechercher dans le document</a>" : "",
        info = this.infoExists ? "<a data-screlo-button='info'>Aide</a>" : "",
        ignore = "<a data-screlo-button='ignore'>Ignorer</a>",
        actions = cycle || info ? "<div class='screlo-notification-actions'>" + cycle + info + "</div>" : "", // TODO: ajouter ignore
        html = "<li class='screlo-notification " + this.type + "' data-screlo-id='" + this.id + "'>" + this.name + count + actions + "</li>";
    return html;
};

Notification.prototype.addMarker = function (element) {
    if (this.isCurrentLocation) {
        this.markers.push(
            new Marker ({
                id: this.id,
                element: element,
                label: this.label,
                type: this.type,
                labelPos: this.labelPos
            })
        );
    }
    this.count++;
    return this;
};

Notification.prototype.countMatches = function (regex, $parent) {
    if (!regex || !$parent) {
        console.error("Notification.prototype.countMatches: erreur d'arguments");
        return false;
    }
    var match = $parent.text().match(regex);
    if (match && match.length > 0) {
        this.count = match.length;
    }
};

Notification.prototype.addMarkersFromRegex = function (regex, $parent) {
    $parent = $parent || this.root;
    $parent = !($parent instanceof jQuery) ? $($parent) : $parent;
    if (!$parent) {
        console.error("Notification.root n'existe pas");
        return false;
    }
    // En cas d'exécution Ajax seul le nombre d'erreurs nous intéresse
    if (!this.isCurrentLocation) {
        this.countMatches(regex, $parent);
        return this;
    }
    var _this = this;
    $parent.highlightRegex(regex, {
        tagType:   'span',
        className: 'screlo-regexmarker'
    });
    $("span.screlo-regexmarker").each( function() {
        _this.addMarker(this);
    });
    return this;
};

// Exporter une version plus légère de l'objet pour le localStorage
Notification.prototype.export = function () {
    return  {
        id: this.id,
        name: this.name,
        type: this.type,
        count: this.count
    };
};

Notification.prototype.activate = function (flag) {
    this.active = flag !== undefined ? flag : true;
    return this;
};

module.exports = Notification;

},{"./Marker.js":3,"./globals.js":7}],5:[function(require,module,exports){
/*
    Screlo - Source
    ==========
    Représente une source chargée avant l'exécution des tests.
    Le HTML chargé est contenu dans source.root. C'est cet élément qui sera passé en argument 'root' lors de l'exécution de chaque test pour lequel test.source === source.id.
*/

var globals = require("./globals.js");

function Source (id, callback) {
    callback = typeof callback === "function" ? callback : undefined;
    var split = id.split(/\s+/);
    this.id = id; // TODO: il faudrait normaliser les id pour éviter les doublons
    this.url = split[0];
    this.isCurrentLocation = this.url === globals.page;
    this.selector = split.length === 2 ? split[1] : "#main";
    this.bodyClasses = this.root = this.bodyClasses = null;
    this.isReady = this.isSuccess = this.isError = false;
    Loader.pushSource(this); // La source est référencée dans le Loader dès maintenant pour qu'on puisse la tester dans la suite du traitement asynchrone
    if (this.isCurrentLocation) {
        this.bodyClasses = document.body.className.split(/\s+/);
        this.root = $(this.selector).get(0);
        this.isReady = this.isSuccess = true;
        if (callback) {
            callback(this);
        }
    } else {
        this.load(callback);
    }
}

Source.prototype.load = function (callback) {
    var that = this,
        url = this.url;
    $.ajax({
        url: url,
        timeout: 20000,
        success: function(data) {
            var body, bodyClasses, container, root;
            if (data && data.match(/\n.*(<body.*)\n/i) !== null) {
                body = data.match(/\n.*(<body.*)\n/i)[1].replace("body", "div");
                bodyClasses = $(body).get(0).className.split(/\s+/);
                container = $("<div>" + data + "</div>").find(that.selector);
                root = container.get(0);
            }
            if (root) {
                that.root = root;
                that.bodyClasses = bodyClasses;
                that.isSuccess = true;
            } else {
                that.isError = true;
            }
        },
        error: function() {
            that.isError = true;
        },
        complete: function() {
            that.isReady = true;
            if (callback) {
                callback(that);
            }
        }
    });
};

module.exports = Source;

},{"./globals.js":7}],6:[function(require,module,exports){
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
        $("[data-screlo-button='ajax']").hide();
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

cmd.askForLogin = function () {
    var gotoLogin = confirm("Il est nécessaire d'être connecté à Lodel pour utiliser les outils de relecture. Souhaitez-vous vous connecter ?");
    if (gotoLogin) {
        utils.cache.set(globals.nomCourt, "active", true);
        location.href = utils.getUrl("site") + "lodel/edition/login.php?url_retour=" + location.pathname;
    }
};

cmd.toggleCache = function (id) {
    var currentState = utils.cache.get(globals.nomCourt, id),
        toggleState = !currentState;
    utils.cache.set(globals.nomCourt, id, toggleState);
    location.reload();
};

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
},{"./Checker.js":1,"./globals.js":7,"./tests-revues.js":10,"./utils.js":12}],7:[function(require,module,exports){
/*
    Screlo - globals
    ==========
    Contient des constantes prédéfinies ou calculées utilisées dans les autres modules.
*/

var globals = {},
    utils = require("./utils.js"),
    tests = require("./tests-revues.js"); 

globals.version = "15.6.4";

globals.schema =  "15.4.0d"; // NOTE: Valeur à incrémenter quand l'architecture des informations stockées dans le cache change. Permet d'éviter les incompatibilités avec les objets obsolètes qui peuvent se trouver dans localStorage.

globals.appUrls = {
    base: "https://rawgit.com/brrd/screlo/master/",
    stylesheet: "https://rawgit.com/brrd/screlo/master/" + "dist/screlo.css",
    update: "https://github.com/brrd/screlo/raw/master/dist/screlo.user.js",
    homepage: "https://github.com/brrd/screlo",
    doc: "https://github.com/brrd/screlo" + "/tree/master/docs"
};

globals.nomCourt = (function () {
    var host = window.location.host,
        p = location.pathname.replace(/\/(\d+)\//,'');
    if (host.indexOf("formations.lodel.org") > -1 || host.indexOf("lodel.revues.org") > -1 || host.indexOf("devel.revues.org") > -1) {
        return p.substr(0, p.indexOf('/'));
    } else {
        return host.substr(0, host.indexOf('.'));
    }
})();

globals.page = (function () {
    var url = location.pathname,
        match = url.match(/(\d+)$/g);
    return match ? match[0] : url;
})();

globals.hash = window.location.hash.substring(1);

globals.admin = ($('#lodel-container').length !== 0);

globals.cacheIsValid = (function () {
    var nomCourt = globals.nomCourt,
        cacheSchema = utils.cache.get(nomCourt, "schema");
    return cacheSchema === globals.schema;
})();

// Supprimer le localStorage quand il est basé sur un ancien schéma.
if (!globals.cacheIsValid) {
    var nomCourt = globals.nomCourt;
    utils.cache.clear(nomCourt);
    utils.cache.set(nomCourt, "schema", globals.schema);
}

// TODO: factoriser active/paper
globals.active = (function () {
    var value = utils.cache.get(globals.nomCourt, "active");
    if (typeof value !== "boolean") {
        value = true;
        utils.cache.set(globals.nomCourt, "active", value);
    }
    return value;
})() && globals.admin; // Pas actif si on n'est pas connecté à Lodel.

if (globals.active) {
    $("body").addClass("screlo-active"); // TODO: harmoniser l'ajout de classes
}

globals.paper = (function () {
    var value = utils.cache.get(globals.nomCourt, "paper");
    if (typeof value !== "boolean") {
        value = true;
        utils.cache.set(globals.nomCourt, "paper", value);
    }
    return value;
})();

globals.isPublication = (function () {
    return $("body").hasClass("publications") && $('ul.summary li.textes .title').length > 0;
})();

globals.toc = globals.isPublication ? utils.getToc() : false;

globals.infos = (function () {
    
    function getInfo (test) {
        var typeInfos = {
            danger: "Cette notification signale une erreur critique concernant la composition du document. Cette erreur peut entraver le traitement et la mise en valeur des contenus sur la plateforme, il est donc fortement recommandé de la corriger.",
            warning: "Cette notification est un avertissement concernant certains aspects de la composition du document qui peuvent peut-être être améliorés.",
            print: "Cette notification concerne les contenus qui existent également en version imprimée. Il est conseillé de corriger ces erreurs afin d'améliorer la citabilité et le référencement de ces contenus."
        },
            type = test.type || "danger",
            links,
            info = "";
        if (!test.description) {
            return false;
        }
        if (test.name) {
            info += "<h1 class='" + type + "'> Test #" + test.id + " - " + test.name + "</h1>";
        }
        info += "<p class='screlo-typeinfos screlo-" + type + "'>" + typeInfos[type] + "</p>";
        info += "<p>" + test.description + "</p>\n";
        if (test.links && test.links.length >= 2) {
            links = test.links;
            info += "<div class='infolinks'>\n<h2>À lire dans la documentation</h2>\n<ul>\n";
            for (var j=0; j<links.length; j=j+2) {
                if (links[j] && links[j+1]) {
                    info += "<li><a href='" + links[j+1] + "' target='_blank'>" + links[j] + "</a></li>\n";
                }
            }
            info += "</ul></div>";
        }
        return info;
    }
    
    var infos = [],
        thisId,
        thisInfo;
    
    for (var i=0; i<tests.length; i++) {
        if (tests[i].id && tests[i].description) {
            thisId = tests[i].id;
            thisInfo = getInfo(tests[i]);
            infos[thisId] = thisInfo;
        }
    }
    return infos;
})();

module.exports = globals;
},{"./tests-revues.js":10,"./utils.js":12}],8:[function(require,module,exports){
/*
    SCRELO - Script de relecture pour Lodel
    Thomas Brouard - OpenEdition
*/
if (!window.jQuery) {
    console.error("Screlo requires jQuery");
} else {
    $( function () {
        // Vendor
        require("./vendor/highlightRegex.js");
        require("./vendor/picoModal.js");

        var globals = require("./globals.js"),
            ui = require("./ui.js"),
            screloPlus = require("./screlo-plus.js"); // TODO: uniquement si userscript (grunt preprocess)

        ui.init();
        if (!globals.active) {
            return false;
        }
        screloPlus.init(); // TODO: uniquement si userscript (grunt preprocess)
        $("body").attr("data-screlo-version", globals.version);
        console.info("Screlo v." + globals.version + " loaded"); // TODO: preciser quelle version (user ou remote)
    });
}
},{"./globals.js":7,"./screlo-plus.js":9,"./ui.js":11,"./vendor/highlightRegex.js":13,"./vendor/picoModal.js":14}],9:[function(require,module,exports){
/*
    ScreloPlus
    ==========
    Améliorations diverses de la Lodelia et outils supplémentaires.
    Fonctions indépendantes disponibles uniquement dans l'userscript.
*/

var screloPlus = { nav: {} };

// Fixer le menu de navigation pour boucler sur tous les éléments
function fixNav () {
    function addNav(dirClass, url) {
        $('.navEntities').append($('<a></a>').addClass(dirClass + " corrected").attr('href', url));
        screloPlus.nav[dirClass] = url;
    }
    if ($('.navEntities .goContents').length !== 0) {
        var tocUrl = screloPlus.nav.goContents = $('.navEntities .goContents').attr('href'),
            result =  $("<div></div>").load( tocUrl + " #main", function() {
                var idPage = location.pathname.match(/(\d+)$/g)[0],
                    toc = $(this).find('ul.summary li:not(.fichiers) a:first-child').map( function() {
                        return $(this).attr('href');
                    }).get(),
                    i = $.inArray(idPage, toc); // FIXME: ne fonctionne pas pour les articles contenus dans des rubriques annuelles car a.goContents renvoit vers la rubrique ancetre et non la rubrique annuelle parente.
                if (i !== -1) {
                    $('.navEntities a.goPrev, .navEntities a.goNext').remove();
                    if (i !== 0) {
                        addNav('goPrev', toc[i-1]);
                    }
                    if (i+1 !== toc.length) {
                        addNav('goNext', toc[i+1]);
                    }
                    $('<span></span>').css({'float': 'left', 'margin': '2px 5px'}).text(Number(i+1) + '/' + Number(toc.length)).prependTo('.navEntities');
                    // Sélectionner une entrée au hasard (pour les sondages)
                    screloPlus.nav.randomPage = toc[Math.floor(Math.random()*toc.length)];
                }
            });
    }
}

// Liens vers la source sur TOC de la publication
function sourceDepuisToc () {
    $('ul.summary li:not(.fichiers) .title').each( function() {
        var id = $(this).children('a').eq(0).attr('href'),
            href ='lodel/edition/index.php?do=download&type=source&id=' + id;
        if (id !== undefined) {
            $(this).append('<a href="' + href + '"> Ⓦ</a>');
        }
    });
}

// Raccourcis clavier
function setHotkeys () {
    function hideBox () {
        $('#screlo-plus-goto').val('');
        $('#screlo-plus').hide();
    }
    $(document).keydown(function(e) {
        var slashChar = 111,
            starChar = 106,
            minusChar = 109,
            plusChar = 107,
            escChar = 27;
        if (document.activeElement === null || document.activeElement === document.body) {
            if (e.which === starChar && screloPlus.nav.goPrev) {
                e.preventDefault();
                location.href = screloPlus.nav.goPrev;
            } else if (e.which === minusChar && screloPlus.nav.goNext) {
                e.preventDefault();
                location.href = screloPlus.nav.goNext;
            } else if (e.which === slashChar && screloPlus.nav.goContents) {
                e.preventDefault();
                location.href = screloPlus.nav.goContents;
            } else if (e.which === plusChar && screloPlus.nav.randomPage) {
                e.preventDefault();
                location.href = screloPlus.nav.randomPage;
            } else if (e.which >= 97 && e.which <= 105) {
                $('#screlo-plus').show();
                $('#screlo-plus-goto').focus();
            }
        } else if (document.activeElement === $('#screlo-plus-goto').get(0) && e.which === escChar) {
            $('#screlo-plus-goto').blur();
            hideBox();
        }
    });
    $('#screlo-plus-goto').blur( function () {
        hideBox();
    });
}

function addBox () {
    var box = "<div id='screlo-plus' style='display:none'><form id='screlo-plus-goto-form'><input id='screlo-plus-goto' type='text' data-screlo-action='go' placeholder='▶'/></form></div>";
    $(box).appendTo("body");
    $( "#screlo-plus-goto-form" ).submit(function( event ) {
        event.preventDefault();
        var idAcces = $('input#screlo-plus-goto').val();
        if (typeof idAcces === 'string') {
            window.location.href = idAcces;
        }
    });
}

function init () {
    addBox();
    fixNav();
    setHotkeys();
    sourceDepuisToc();
}

module.exports = { init: init };

},{}],10:[function(require,module,exports){
/*
    Screlo - tests-revues
    ==========
    Définition des tests pour les revues.
    Les attributs disponibles sont :
        * name: (string) Nom du test affiché dans la Notification.
        * id: (string) Identifiant numérique unique du test.
        * description: (string) Message d'aide.
        * links: (array) Tableau contenant les liens vers la documentation de la maison des revues de la forme : ["Texte du lien 1", "URL 1", "Texte du lien 2", "URL 2", etc.]
        * type: (string) Le type de la Notification qui sera retournée ("danger", "warning", "print", "success").
        * label: (string) Nom du test affiché par les Marker générés par le test.
        * labelPos: (string) Position du Marker par rapport à l'élément cible ("before", "after").
        * source: (string ou function) l'url de la source des tests, qui est soit une string, soit une function(urlDuSite, idDuChecker) qui renvoit une string. Il est possible (et recommandé) de préciser un sélecteur à la fin de l'url, séparé par une espace, de la forme : "http://exemple.revues.org/lodel/edition/index.php?do=view&id=123 #mon-selecteur". Le sélecteur par défaut est "#main".
        Remarque importante : deux sources avec la même url mais deux sélecteurs différents produiront deux requêtes, il faut donc veiller à toujours employer le même sélecteur pour chaque url afin d'éviter les requêtes inutiles, quitte à utiliser un même sélecteur de plus haut niveau dans le DOM pour tous les tests. Par exemple pour l'espace d'édition on utilisera TOUJOURS "#lodel-container".
        * condition: (function(context)) Détermine l'exécution (ou non) du test en fonction du contexte. Retourne un booléen.
        * action: (function(notif, root)) La fonction qui exécute le test. Retourne notif quand le test s'est correctement passé ou false pour notifier l'utilisateur d'une anomalie (par exemple des éléments qui n'ont pas été retrouvés dans la maquette alors qu'il auraient dû).
            * Le paramètre 'notif' est une Notification vierge qui doit être modifiée en cas de test positif puis retournée par la fonction.
            * Le paramètre 'root' est l'élément du DOM qui sert de contexte au test. On utilise TOUJOURS $(selecteur, root) dans le corps de la fonction action(). Par défaut root = $("#main").
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
            var flag = $('#docAuthor', root).length === 0;
            return notif.activate(flag);
        }
    },
    {
        name: "Absence du fac-similé",
        id: 2,
        description: "Aucun fac-similé n'est associé à ce document. Il est fortement recommandé de joindre aux documents un fac-similé PDF issu de la version imprimée lorsque c'est possible.",
        links: ["Fac-similés PDF issus de la version papier", "http://maisondesrevues.org/612"],
        type: "print",
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations; },
        action: function (notif, context, root) {
            var flag = $('#wDownload.facsimile, #text > .text.facsimile > a', root).length === 0;
            return notif.activate(flag);
        }
    },
    {
        name: "Erreur de pagination",
        id: 3,
        description: "La pagination de la version papier est absente des métadonnées ou n'est pas correctement stylée. Si le document existe en version imprimée il est fortement recommandé d'en préciser la pagination au format attendu.",
        links: ["Pagination", "http://maisondesrevues.org/86"],
        type: "print",
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations; },
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
        // TODO: Checker aussi le format de la date + étendre aux deux types de dates + étendre aux textes
        name: "Absence de la date de publication électronique",
        id: 4,
        description: "Ce numéro n'a pas de date de publication électronique. Il est indispensable d'ajouter cette information dans le formulaire d'édition des métadonnées du numéro.",
        links: ["Dates de publication", "http://maisondesrevues.org/84"],
        source: function (site, id) { return site + "lodel/edition/index.php?do=view&id=" + id + " #lodel-container";},
        condition: function(context) { return context.classes.numero; },
        action: function (notif, context, root) {
            var $element = $("input#datepubli", root);
            if ($element.length === 0) {
                return false;
            }
            var flag = $element.val().trim() === "";
            return notif.activate(flag);
        }
    },
    {
        name: "Absence de référence de l'œuvre commentée",
        id: 5,
        description: "Il est conseillé de mentionner la référence des œuvres commentées dans les comptes rendus et les notes de lecture en utilisant la métadonnée appropriée.",
        links: ["Stylage des œuvres commentées", "http://maisondesrevues.org/88"],
        condition: function(context) { return context.classes.textes && (context.classes.compterendu || context.classes.notedelecture); },
        action: function (notif, context, root) {
            var flag = $("#docReference", root).length === 0;
            return notif.activate(flag);
        }
    },
    {
        // NOTE: test obsolète (Lodel 0.9)
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
            var el = $('[style*="Symbol"], [style*="symbol"], [style*="Wingdings"], [style*="wingdings"], [style*="Webdings"], [style*="webdings"]', root);
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
        // NOTE: Test "Listes mal formatées" amelioré pour éviter les faux positifs sur les initiales de noms propres. Ne matchent que les intiales de la forme /^[A-Z]\.\s/ qui s'inscrivent dans une suite qui commence par "A.", "B.", etc. ou "A:", B:"...
        // TODO: Ce test est une vraie usine à gaz patchée et repatchée qu'il faudrait réécrire un jour.
        name: "Listes mal formatées",
        id: 12,
        description: "Ce document des paragraphes qui sont peut-être des citations et qui doivent être vérifiés.",
        links: ["Stylage des listes", "http://maisondesrevues.org/91"],
        type: "warning",
        label: "Liste",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {

            function listInfos (string) {
                var ulTest = string.match(/^([•●∙◊–—>-])\s/),
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

            function onlyKeepSiblings (e) {

                function getIndex(el) {
                    var $el = $(el);

                    if ($el.parent(".text").length !== 0) {
                        return $el.index();
                    } else {
                        return $el.parents(".text > *").eq(0).index();
                    }
                }

                var res = [],
                    currentIndex,
                    prevIndex;

                for (var i=1; i<e.length; i++) {
                    currentIndex = getIndex(e[i]);
                    prevIndex = getIndex(e[i-1]);

                    if (currentIndex === prevIndex + 1) {
                        if (i === 1) {
                            res.push(e[0]);
                        }
                        res.push(e[i]);
                    }
                }
                return res;
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
            err = onlyKeepSiblings(err);
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
            $("ol :header, ul :header, li:header", root).each( function() {
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
                var text = $(this).text().trim();
                if( text.match(/[\.:;=]$/) && !($(this).is('#docSubtitle') && text.match(/p\.$/)) ) { // Ne pas matcher le "p." des pages à la fin du sous-titre.
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
            var $element = $('#docTitle, #docTitle *', root);
            if ($element.length === 0) {
                return false;
            }
            $element.each( function() {
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
            var flag = $('#docTitle .footnotecall', root).length !== 0;
            return notif.activate(flag);
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
        name: "Vérifier les doublons d'index",
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
        name: "Format de nom d'auteur",
        id: 26,
        description: "Certains noms d'auteurs ne respectent pas le format attendu ou contiennent des caractères inconnus. Les noms doivent être composés en bas de casse avec capitale initale.",
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
            return notif.activate(notif.count > 0);
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
                return !$(e).text().match(/(Index|Índice|Indice|Personnes citées|Géographique|Thématique)/);
            }).length,
                nbResumes = $("#abstract .tabContent", root).length,
                flag = nbMots !== 0 && nbResumes !== 0 && nbMots !== nbResumes;
            return notif.activate(flag);
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
        condition: function(context) { return context.classes.numero; },
        type: "print",
        action: function (notif, context, root) {
            var flag = $("#publiInformation img", root).length === 0;
            return notif.activate(flag);
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
                text = element.text().trim(),
                flag = element.length === 0 || text === "";
            return notif.activate(flag);
        }
    },
    {
        name: "Document sans titre",
        id: 34,
        description: "Le titre du document est obligatoire. L'absence de titre peut être dû à une erreur du stylage du document. Vérifiez que vous avez bien respecté l'ordre des métadonnées et que le document est bien enregistré au format .doc (le format .docx n'est pas supporté par Lodel et son utilisation peut être à l'origine d'une erreur d'interprétation de la métadonnée “Titre”).",
        links: ["L'ordre des métadonnées", "http://maisondesrevues.org/108"],
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {
            var $element = $("#docTitle", root),
                text,
                flag;
            if ($element.length === 0) {
                return false;
            }
            text = $element.text().trim();
            flag = text === "" || text === "Document sans titre";
            return notif.activate(flag);
        }
    },
    {
        name: "Lien(s) caché(s) vers Wikipedia",
        id: 35,
        description: "Ce document contient un ou plusieurs liens vers Wikipédia qui sont “cachés” derrière du texte. La présence de tels liens est parfois due à des copier-coller depuis Wikipédia. Vérifiez que leur présence est volontaire.",
        type: "warning",
        label: "Wikipedia",
        labelPos: "after",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {
            $("a[href*='wikipedia']", root).each( function () {
                // Ne pas compter les notes marginales pour éviter les doublons.
                if ($(this).parents(".sidenotes").length !== 0) {
                    return; // continue
                }
                if ($(this).text().trim() !== decodeURIComponent($(this).attr("href").trim())) {
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
            $("p a[href]:not(.footnotecall, .FootnoteSymbol, [href^=mailto])", root).each( function () {
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
            var element = $("#publiISBN", root).eq(0),
                isbn;
            if (element.length !== 0) {
                isbn = element.text().replace("ISBN", "");
                if ( !utils.isValidIsbn(isbn) ) {
                    notif.addMarker(element.get(0)).activate();
                }
            }
            return notif;
        }
    },
    {
        name: "Absence de la métadonnée de langue",
        id: 38,
        description: "La langue de ce document ou de cette publication n'est pas correctement définie dans les métadonnées. Dans le cas d'une publication, la langue doit être sélectionnée dans le formulaire d'édition des métadonnées. Dans le cas d'un document, il faut styler la métadonnée “Langue” dans le document source.",
        links: [
            "Composition de la métadonnée “Langue”", "http://maisondesrevues.org/85",
            "Ordre des métadonnées", "http://maisondesrevues.org/108"
        ],
        source: function (site, id) { return site + "lodel/edition/index.php?do=view&id=" + id + " #lodel-container";},
        condition: function(context) { return context.classes.numero || context.classes.textes; },
        action: function (notif, context, root) {
            var $element = $("select#langue", root);
            if ($element.length === 0) { // TODO: ça va bloquer quand on va passer au nouveau ME
                return false;
            }
            return notif.activate($element.eq(0).val().trim() === "");
        }
    },
    {
        name: "Fac-similé non PDF",
        id: 39,
        type: "danger",
        description: "Le fichier attaché en tant que fac-similé n'est pas un document PDF. Le fac-similé doit obligatoirement être au format PDF.",
        links: [
            "Fac-similés PDF issus de la version papier", "http://maisondesrevues.org/612"
        ],
        source: function (site, id) { return site + "lodel/edition/index.php?do=view&id=" + id + " #lodel-container";},
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations; },
        action: function (notif, context, root) {
            var $element = $("label[for='alterfichier'] ~ .oneItem > .imageKeepDelete > strong:eq(0)", root),
                fileName = $element.length === 0 ? $element.eq(0).text() : undefined,
                flag = $element.length > 0 && typeof fileName === "string" && /\.pdf$/i.test(fileName) === false;
            return notif.activate(flag);
        }
    },
    {
        name: "Absence de la numérotation",
        id: 40,
        description: "La numérotation du numéro n'est pas définie. Il faut compléter cette métadonnée dans le formulaire d'édition du numéro.",
        condition: function(context) { return context.classes.numero; },
        action: function (notif, context, root) {
            var flag = $('#publiTitle .number', root).length === 0;
            return notif.activate(flag);
        }
    },
    {
        name: "Vérifier le type du document (éditorial)",
        id: 41,
        type: "warning",
        description: "Le type du document n'est peut-être pas correct. L'introduction ou l'avant-propos d'un numéro doivent être importés en tant qu'“éditorial”.",
        links: [
            "Les types de documents", "http://maisondesrevues.org/700",
            "Modifier le type d'un document", "https://maisondesrevues.org/700#tocto1n4"
        ],
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations && !context.classes.editorial; },
        action: function (notif, context, root) {
            var regex = /((e|é)ditorial|avant[- ]?propos|introducti(on|f|ve)|pr(e|é)sentation)/i,
                str = $("#docTitle", root).text() + " " + $("#docSubtitle", root).text() + "" + $("#docAltertitle", root).text(),
                flag = regex.test(str);
            return notif.activate(flag);
        }
    },
    {
        name: "Vérifier le type du document (chronique)",
        id: 42,
        type: "warning",
        description: "Le type du document n'est peut-être pas correct. Le type “chronique” est généralement utilisé pour les hommages, bibliographies, etc.",
        links: [
            "Les types de documents", "http://maisondesrevues.org/700",
            "Modifier le type d'un document", "https://maisondesrevues.org/700#tocto1n4"
        ],
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations && !context.classes.chronique; },
        action: function (notif, context, root) {
            var regex = /bibliographie|hommage|conclusion/i,
                str = $("#docTitle", root).text() + " " + $("#docSubtitle", root).text() + "" + $("#docAltertitle", root).text(),
                flag = regex.test(str);
            return notif.activate(flag);
        }
    },
    {
        name: "Vérifier le type du document (compte rendu)",
        id: 43,
        type: "warning",
        description: "Ce document présente une œuvre commentée, il s'agit donc probalement d'un compte rendu ou d'une note de lecture. Le cas échéant il faut lui appliquer le type adéquat.",
        links: [
            "Les types de documents", "http://maisondesrevues.org/700",
            "Modifier le type d'un document", "https://maisondesrevues.org/700#tocto1n4",
            "Fichiers particuliers : notes de lecture et comptes rendus d’ouvrages", "https://maisondesrevues.org/88"
        ],
        condition: function(context) { return context.classes.textes && !context.classes.actualite && !context.classes.informations && !context.classes.notedelecture && !context.classes.compterendu; },
        action: function (notif, context, root) {
            var flag = $("#docReference", root).length !== 0;
            return notif.activate(flag);
        }
    },
    {
        name: "Lien hypertexte dans le titre ou dans un intertitre",
        id: 44,
        type: "danger",
        description: "Des liens hypertextes se trouvent dans le titre et/ou les intertitres du document. Ces liens peuvent créer des interférences avec Lodel et nuire à la consultation du document. Le titre et les intertitres ne doivent donc pas contenir de liens hypertextes.",
        links: [
            "Gestion des liens hypertextes dans Word", "http://maisondesrevues.org/96",
            "Le titre d’un document n’est pas cliquable dans le sommaire", "https://maisondesrevues.org/113"
        ],
        label: "Lien hypertexte",
        labelPos: "after",
        condition: function(context) { return context.classes.textes; },
        action: function (notif, context, root) {
            $(".texte:header a:not([href^='#']), h1#docTitle a", root).each( function() {
                notif.addMarker(this).activate();
            });
            return notif;
        }
    }//,
];

},{"./utils.js":12}],11:[function(require,module,exports){
/*
    Screlo - ui
    ==========
    Injection des CSS, création des éléments du DOM de l'UI et des event handlers, lancement du Checker de la page affichée (root === document).
*/

var ui = {},
    cmd = require("./commands.js"),
    globals = require("./globals.js"),
    utils = require("./utils.js"),
    Loader = require("./Loader.js"),
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
                   "<a data-screlo-button='about' title='A propos'>A propos</a>",
                   "<a data-screlo-button='update' title='Mise à jour disponible' href='" + globals.appUrls.update + "'>Mise à jour disponible</a>",
                   "<a data-screlo-button='switch' title='Activer/désactiver l’outil de relecture'>Activer/désactiver l'outil de relecture</a>"],
        squel = "<div id='screlo-main'><ul id='screlo-notifications'></ul><ul id='screlo-infos'></ul><div id='screlo-toolbar'>" + buttons.join('\n') + "</div></div><div id='screlo-loading' ></div>";
    $(squel).appendTo("body");
}

function manageEvents () {
    $( "[data-screlo-button='switch']" ).click(function( event ) {
        event.preventDefault();
        if (!globals.admin) {
            cmd.askForLogin();
            return;
        }
        cmd.toggleCache("active");
    });
    if (!globals.active) {
        return false;
    }
    $( "[data-screlo-button='about']" ).click(function( event ) {
        event.preventDefault();
        cmd.about();
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
    $( "[data-screlo-button='papier']" ).click(function( event ) {
        event.preventDefault();
        cmd.toggleCache("paper");
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
        $("<li id='screlo-infocache' class='screlo-info'>Les notifications affichées dans la table des matières ont été chargées à partir du cache du navigateur. <a href='#'>Mettre à jour.</a></li>").appendTo("#screlo-infos");
    }
}

function checkThisPage () {
    var chkr = new Checker();
    chkr.setLoading();
    chkr.ready( function (chkr) {
        chkr.toCache().unsetLoading().show();     
    });
}

// Bookmarklet debugger (version light)
function debugStylage () {  
    // On recherche les P et SPAN vides (sauf COinS !)
    $('p, span:not(.Z3988)').not('#screlo-main *').not('.screlo-marker').each(function() {
        // Elements vides
        var strEmpty = ($(this).get(0).tagName == 'P') ? 'paragraphe vide' : '\u00A0';
        if (($(this).text().match(/^(nbsp|\s)*$/g) !== null) && ($(this).has('img').length === 0)) // FIXME: fonctionne pas bien sur les <p> car span.paranumber fait que le text est jamais vide
            $(this).text(strEmpty).addClass('screlo-fixme');
        // Mises en forme locales
        if ($(this).attr('style') !== undefined)
            $(this).attr('title', $(this).attr('style')).addClass('screlo-todo');
    });
}

function checkForUpdate () {
    var updateScript = globals.appUrls.base + "dist/screlo-update.js";
    $.getScript(updateScript);
}

ui.init = function () {
    manageCss();
    manageDom();
    manageEvents();
    if (!globals.active) {
        return false;
    }
    manageToc();
    checkThisPage();    
    debugStylage();
    checkForUpdate();
};

module.exports = ui;
},{"./Checker.js":1,"./Loader.js":2,"./commands.js":6,"./globals.js":7,"./utils.js":12}],12:[function(require,module,exports){
/*
    Screlo - utils
    ==========
    Fonctions utilitaires utilisées dans plusieurs modules et/ou dans les tests.
*/

var utils = {};

utils.isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

// TODO: il faudrait calculer ça une bonne fois pour toutes
utils.getUrl = function (quoi) {
    var h = location.href,
        p = location.pathname,
        a = p.replace(/[^/]+$/g, ''),
        b = p.match(/(\d+)$/g),
        parent = $("#breadcrumb #crumbs a:last").attr('href');
    if (quoi === "doc") {
        h = window.location.protocol + '//' + window.location.host + a + 'lodel/edition/index.php?do=download&type=source&id=' + b;
    } else if (quoi === "otx") {
        h = window.location.protocol + '//' + window.location.host + a + 'lodel/edition/oochargement.php?identity=' + b + '&idparent=' + parent + '&reload=1';
    } else if (quoi === "editer") {
        h = window.location.protocol + '//' + window.location.host + a + 'lodel/edition/index.php?do=view&id=' + b;
    } else if (quoi === "site") {
        h = window.location.protocol + '//' + window.location.host + a;
    } else if (typeof quoi === 'string') {
        h = window.location.protocol + '//' + window.location.host + a + quoi;   
    }
    return h;
};

// Suppression des accents pour trouver les doublons de mots-clés
// http://stackoverflow.com/questions/990904/javascript-remove-accents-in-strings#answer-9667752
utils.latinize = function (str) {
    var latin_map = {"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x","’":"'","–":"-","—":"-"};
    return str.replace(/[^A-Za-z0-9\[\] ]/g, function(a){return latin_map[a]||a;});
};

// Fonction générique pour tester les URL absolues (https://gist.github.com/dperini/729294)
utils.isValidUrl = function (url) {
    var regex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
    return regex.test(url) && url.trim().substr(-1).match(/[).,\]]/) ===  null;
};

// Fonction générique pour tester les ISBN (http://pastebin.com/j9kfEUHt)
utils.isValidIsbn = function (isbn) {
    var sum = 0,
        i;
    isbn = String(isbn).replace(/[^\dX]/gi, '');
    if(isbn.length == 10) {
        if(isbn[9].toUpperCase() == 'X') {
            isbn[9] = 10;
        }
        for(i = 0; i < isbn.length; i++) {
            sum += ((10-i) * parseInt(isbn[i]));
        }
        return (sum % 11 === 0);
    } else if(isbn.length === 13) {
        for (i = 0; i < isbn.length; i++) {
            if(i % 2 === 0) {
                sum += parseInt(isbn[i]);
            } else {
                sum += parseInt(isbn[i]) * 3;
            }
        }
        return (sum % 10 === 0);
    } else {
        return false;
    }
};

// Récupérer le texte des paragraphes
utils.getPText = function ($p) {
    var clone = $p.clone();
    clone.find('span.paranumber, span.screlo-marker').remove();
    return String(clone.text()).trim();
};

// Récupérer la toc (retourne un tableau d'objets à deux attributs .id et .$element)
utils.getToc = function () {
    var urls = [],
        tocElements = $('ul.summary li.textes .title'), // TODO: selecteur egalement utilise dans globals.isPublication. Il faudrait que tous ces sélecteurs soient définis dans globals pour une adaptation plus simple à Books par la suite.
        toc = [];
    tocElements.each( function() {
        var obj = {},
            id = $(this).children('a').eq(0).attr('href');
        if (id !== undefined) {
            obj.id = id;
        }
        obj.$element = $(this);
        toc.push(obj);
    });
    return toc;
};

// localStorage
utils.cache = {};

utils.cache.get = function (nomCourt, id) {
    if (!id || !nomCourt) {
        return false;
    }
    var key = "screlo-" + nomCourt + "-" + id;
    return JSON.parse(localStorage.getItem(key));
};

utils.cache.set = function (nomCourt, id, value) {
    if (!id || !nomCourt) {
        return false;
    }
    var key = "screlo-" + nomCourt + "-" + id;
    localStorage.setItem(key, JSON.stringify(value));
};

utils.cache.clear = function (nomCourt) {
    var regex = new RegExp("^screlo-" + nomCourt + "-");
    Object.keys(localStorage).forEach( function(key) {
        if (regex.test(key) || key === nomCourt) {
            localStorage.removeItem(key);
        }
    });
};

module.exports = utils;

},{}],13:[function(require,module,exports){
/*
 * jQuery Highlight Regex Plugin v0.1.2
 *
 * Based on highlight v3 by Johann Burkard
 * http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
 *
 * (c) 2009-13 Jacob Rothstein
 * MIT license
 */

;(function( $ ) {



  var normalize = function( node ) {
    if ( ! ( node && node.childNodes )) return

    var children     = $.makeArray( node.childNodes )
    ,   prevTextNode = null

    $.each( children, function( i, child ) {
      if ( child.nodeType === 3 ) {
        if ( child.nodeValue === "" ) {

          node.removeChild( child )

        } else if ( prevTextNode !== null ) {

          prevTextNode.nodeValue += child.nodeValue;
          node.removeChild( child )

        } else {

          prevTextNode = child

        }
      } else {
        prevTextNode = null

        if ( child.childNodes ) {
          normalize( child )
        }
      }
    })
  }




  $.fn.highlightRegex = function( regex, options ) {

    if ( typeof regex === 'object' && !(regex.constructor.name == 'RegExp' || regex instanceof RegExp ) ) {
      options = regex
      regex = undefined
    }

    if ( typeof options === 'undefined' ) options = {}

    options.className = options.className || 'highlight'
    options.tagType   = options.tagType   || 'span'
    options.attrs     = options.attrs     || {}

    if ( typeof regex === 'undefined' || regex.source === '' ) {

      $( this ).find( options.tagType + '.' + options.className ).each( function() {

        $( this ).replaceWith( $( this ).text() )

        normalize( $( this ).parent().get( 0 ))

      })

    } else {

      $( this ).each( function() {

        var elt = $( this ).get( 0 )

        normalize( elt )

        $.each( $.makeArray( elt.childNodes ), function( i, searchnode ) {

          var spannode, middlebit, middleclone, pos, match, parent

          normalize( searchnode )

          if ( searchnode.nodeType == 3 ) {
            
            // don't re-highlight the same node over and over
            if ( $(searchnode).parent(options.tagType + '.' + options.className).length ) {
                return;
            }

            while ( searchnode.data &&
                    ( pos = searchnode.data.search( regex )) >= 0 ) {

              match = searchnode.data.slice( pos ).match( regex )[ 0 ]

              if ( match.length > 0 ) {

                spannode = document.createElement( options.tagType )
                spannode.className = options.className
                $(spannode).attr(options.attrs)

                parent      = searchnode.parentNode
                middlebit   = searchnode.splitText( pos )
                searchnode  = middlebit.splitText( match.length )
                middleclone = middlebit.cloneNode( true )

                spannode.appendChild( middleclone )
                parent.replaceChild( spannode, middlebit )

              } else break
            }

          } else {

            $( searchnode ).highlightRegex( regex, options )

          }
        })
      })
    }

    return $( this )
  }
})( jQuery );

},{}],14:[function(require,module,exports){
/**
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * A self-contained modal library
 */
(function(window, document) {
    "use strict";

    /** Returns whether a value is a dom node */
    function isNode(value) {
        if ( typeof Node === "object" ) {
            return value instanceof Node;
        }
        else {
            return value &&
                typeof value === "object" &&
                typeof value.nodeType === "number";
        }
    }

    /** Returns whether a value is a string */
    function isString(value) {
        return typeof value === "string";
    }

    /**
     * Generates observable objects that can be watched and triggered
     */
    function observable() {
        var callbacks = [];
        return {
            watch: callbacks.push.bind(callbacks),
            trigger: function( modal ) {

                var unprevented = true;
                var event = {
                    preventDefault: function preventDefault () {
                        unprevented = false;
                    }
                };

                for (var i = 0; i < callbacks.length; i++) {
                    callbacks[i](modal, event);
                }

                return unprevented;
            }
        };
    }


    /**
     * A small interface for creating and managing a dom element
     */
    function Elem( elem ) {
        this.elem = elem;
    }

    /**
     * Creates a new div
     */
    Elem.div = function ( parent ) {
        var elem = document.createElement('div');
        (parent || document.body).appendChild(elem);
        return new Elem(elem);
    };

    Elem.prototype = {

        /** Creates a child of this node */
        child: function () {
            return Elem.div(this.elem);
        },

        /** Applies a set of styles to an element */
        stylize: function(styles) {
            styles = styles || {};

            if ( typeof styles.opacity !== "undefined" ) {
                styles.filter =
                    "alpha(opacity=" + (styles.opacity * 100) + ")";
            }

            for (var prop in styles) {
                if (styles.hasOwnProperty(prop)) {
                    this.elem.style[prop] = styles[prop];
                }
            }

            return this;
        },

        /** Adds a class name */
        clazz: function (clazz) {
            this.elem.className += " " + clazz;
            return this;
        },

        /** Sets the HTML */
        html: function (content) {
            if ( isNode(content) ) {
                this.elem.appendChild( content );
            }
            else {
                this.elem.innerHTML = content;
            }
            return this;
        },

        /** Adds a click handler to this element */
        onClick: function(callback) {
            this.elem.addEventListener('click', callback);
            return this;
        },

        /** Removes this element from the DOM */
        destroy: function() {
            document.body.removeChild(this.elem);
        },

        /** Hides this element */
        hide: function() {
            this.elem.style.display = "none";
        },

        /** Shows this element */
        show: function() {
            this.elem.style.display = "block";
        },

        /** Sets an attribute on this element */
        attr: function ( name, value ) {
            this.elem.setAttribute(name, value);
            return this;
        },

        /** Executes a callback on all the ancestors of an element */
        anyAncestor: function ( predicate ) {
            var elem = this.elem;
            while ( elem ) {
                if ( predicate( new Elem(elem) ) ) {
                    return true;
                }
                else {
                    elem = elem.parentNode;
                }
            }
            return false;
        }
    };


    /** Generates the grey-out effect */
    function buildOverlay( getOption, close ) {
        return Elem.div()
            .clazz("pico-overlay")
            .clazz( getOption("overlayClass", "") )
            .stylize({
                display: "block",
                position: "fixed",
                top: "0px",
                left: "0px",
                height: "100%",
                width: "100%",
                zIndex: 10000
            })
            .stylize(getOption('overlayStyles', {
                opacity: 0.5,
                background: "#000"
            }))
            .onClick(function () {
                if ( getOption('overlayClose', true) ) {
                    close();
                }
            });
    }

    /** Builds the content of a modal */
    function buildModal( getOption, close ) {
        var width = getOption('width', 'auto');
        if ( typeof width === "number" ) {
            width = "" + width + "px";
        }

        var elem = Elem.div()
            .clazz("pico-content")
            .clazz( getOption("modalClass", "") )
            .stylize({
                display: 'block',
                position: 'fixed',
                zIndex: 10001,
                left: "50%",
                top: "50px",
                width: width,
                '-ms-transform': 'translateX(-50%)',
                '-moz-transform': 'translateX(-50%)',
                '-webkit-transform': 'translateX(-50%)',
                '-o-transform': 'translateX(-50%)',
                'transform': 'translateX(-50%)'
            })
            .stylize(getOption('modalStyles', {
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "5px"
            }))
            .html( getOption('content') )
            .attr("role", "dialog")
            .onClick(function (event) {
                var isCloseClick = new Elem(event.target)
                    .anyAncestor(function (elem) {
                        return /\bpico-close\b/.test(elem.elem.className);
                    });
                if ( isCloseClick ) {
                    close();
                }
            });

        return elem;
    }

    /** Builds the close button */
    function buildClose ( elem, getOption ) {
        if ( getOption('closeButton', true) ) {
            return elem.child()
                .html( getOption('closeHtml', "&#xD7;") )
                .clazz("pico-close")
                .clazz( getOption("closeClass") )
                .stylize( getOption('closeStyles', {
                    borderRadius: "2px",
                    cursor: "pointer",
                    height: "15px",
                    width: "15px",
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    fontSize: "16px",
                    textAlign: "center",
                    lineHeight: "15px",
                    background: "#CCC"
                }) );
        }
    }

    /** Builds a method that calls a method and returns an element */
    function buildElemAccessor( builder ) {
        return function () {
            return builder().elem;
        };
    }


    /**
     * Displays a modal
     */
    function picoModal(options) {

        if ( isString(options) || isNode(options) ) {
            options = { content: options };
        }

        var afterCreateEvent = observable();
        var beforeShowEvent = observable();
        var afterShowEvent = observable();
        var beforeCloseEvent = observable();
        var afterCloseEvent = observable();

        /**
         * Returns a named option if it has been explicitly defined. Otherwise,
         * it returns the given default value
         */
        function getOption ( opt, defaultValue ) {
            var value = options[opt];
            if ( typeof value === "function" ) {
                value = value( defaultValue );
            }
            return value === undefined ? defaultValue : value;
        }

        /** Hides this modal */
        function forceClose () {
            shadowElem().hide();
            modalElem().hide();
            afterCloseEvent.trigger(iface);
        }

        /** Gracefully hides this modal */
        function close () {
            if ( beforeCloseEvent.trigger(iface) ) {
                forceClose();
            }
        }

        /** Wraps a method so it returns the modal interface */
        function returnIface ( callback ) {
            return function () {
                callback.apply(this, arguments);
                return iface;
            };
        }


        // The constructed dom nodes
        var built;

        /** Builds a method that calls a method and returns an element */
        function build ( name ) {
            if ( !built ) {
                var modal = buildModal(getOption, close);
                built = {
                    modal: modal,
                    overlay: buildOverlay(getOption, close),
                    close: buildClose(modal, getOption)
                };
                afterCreateEvent.trigger(iface);
            }
            return built[name];
        }

        var modalElem = build.bind(window, 'modal');
        var shadowElem = build.bind(window, 'overlay');
        var closeElem = build.bind(window, 'close');


        var iface = {

            /** Returns the wrapping modal element */
            modalElem: buildElemAccessor(modalElem),

            /** Returns the close button element */
            closeElem: buildElemAccessor(closeElem),

            /** Returns the overlay element */
            overlayElem: buildElemAccessor(shadowElem),

            /** Shows this modal */
            show: function () {
                if ( beforeShowEvent.trigger(iface) ) {
                    shadowElem().show();
                    closeElem();
                    modalElem().show();
                    afterShowEvent.trigger(iface);
                }
                return this;
            },

            /** Hides this modal */
            close: returnIface(close),

            /**
             * Force closes this modal. This will not call beforeClose
             * events and will just immediately hide the modal
             */
            forceClose: returnIface(forceClose),

            /** Destroys this modal */
            destroy: function () {
                modalElem = modalElem().destroy();
                shadowElem = shadowElem().destroy();
                closeElem = undefined;
            },

            /**
             * Updates the options for this modal. This will only let you
             * change options that are re-evaluted regularly, such as
             * `overlayClose`.
             */
            options: function ( opts ) {
                options = opts;
            },

            /** Executes after the DOM nodes are created */
            afterCreate: returnIface(afterCreateEvent.watch),

            /** Executes a callback before this modal is closed */
            beforeShow: returnIface(beforeShowEvent.watch),

            /** Executes a callback after this modal is shown */
            afterShow: returnIface(afterShowEvent.watch),

            /** Executes a callback before this modal is closed */
            beforeClose: returnIface(beforeCloseEvent.watch),

            /** Executes a callback after this modal is closed */
            afterClose: returnIface(afterCloseEvent.watch)
        };

        return iface;
    }

    if ( typeof window.define === "function" && window.define.amd ) {
        window.define(function () {
            return picoModal;
        });
    }
    else {
        window.picoModal = picoModal;
    }

}(window, document));

},{}]},{},[8]);
