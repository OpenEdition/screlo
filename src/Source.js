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
