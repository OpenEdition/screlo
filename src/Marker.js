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