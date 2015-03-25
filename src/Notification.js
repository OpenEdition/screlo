/*
    Screlo - Notification
    ==========
    Cet objet est passé en paramètre pour chaque test, avec des propriétés héritées de la définition du test. On peut alors utiliser les méthodes suivantes :
    * Notification.addMarker(element) permet d'ajouter un Marker à "element". Le Marker prend les propriétés de la Notification.
    * Notification.addMarkersFromRegex(element, $parent) ajoute un Marker à chaque string qui correspond à "regex" dans l'élément $parent.
    * Notification.activate() permet d'activer la Notification (elle sera affichée). Il est nécessaire d'activer la Notification (même quand elle possède des Markers). On peut faire : Notification.addMarker(element).activate()
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
    this.root = root;
}

Notification.prototype.getHtml = function () {
    // TODO: revoir les css (noms de classes de l'ensemble)
    var count = this.count > 0 ? " <span class='count'>" + this.count + "</span>" : "",
        cycle = this.root === document && this.count > 0 ? "<a data-screlo-button='cycle'>Rechercher dans le document</a>" : "",
        info = this.infoExists ? "<a data-screlo-button='info'>Aide</a>" : "",
        ignore = "<a data-screlo-button='ignore'>Ignorer</a>",
        actions = cycle || info ? "<div class='screlo-notification-actions'>" + cycle + info + "</div>" : "", // TODO: ajouter ignore
        html = "<li class='screlo-notification " + this.type + "' data-screlo-id='" + this.id + "'>" + this.name + count + actions + "</li>";
    return html;
};

Notification.prototype.addMarker = function (element) {
    if (this.root === document) {
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
    $parent = $parent || $(this.root);
    // En cas d'exécution Ajax seul le nombre d'erreurs nous intéresse
    if (this.root !== document) {
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

Notification.prototype.activate = function () {
    this.active = true;
    return this;
};

module.exports = Notification;