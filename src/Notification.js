/*
    Notification
*/

var Marker = require("./Marker.js");


function Notification (test) {

    this.id = typeof test.id === 'number' ? test.id : 0;
    this.name = typeof test.name === 'string' ? test.name : '';
    this.help = typeof test.help === 'string' ? test.help : '';
    this.type = typeof test.type === 'string' ? test.type : 'danger';
    this.label = typeof test.label === 'string' ? test.label : test.name;
    this.labelPos = typeof test.labelPos === 'string' ? test.labelPos : "before";
    this.count = 0;
    this.markers = [];
    this.active = false;

}


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


module.exports = Notification;