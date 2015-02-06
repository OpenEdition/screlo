/*
    Marker
*/


var globals = require("./globals.js");


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


module.exports = Marker;