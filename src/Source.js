var globals = require("./globals.js");

function Source (id, callback) {
    callback = typeof callback === "function" ? callback : undefined;
    var isSelf = id === globals.page;
    this.id = id;
    this.bodyClasses = isSelf ? document.body.className.split(/\s+/) : undefined;
    this.root = isSelf ? document : undefined;
    this.isReady = isSelf;
    this.isSuccess = isSelf;
    this.isError = false;
    if (!isSelf) {
        this.load(callback);
    } else if (callback) {
        callback(this);
    }
}

Source.prototype.load = function (callback) {
    var that = this,
        url = this.id;
    $.ajax({
        url: url,
        timeout: 20000,
        success: function(data) {
            if (data && data.match(/\n.*(<body.*)\n/i) !== null) {
                var body = data.match(/\n.*(<body.*)\n/i)[1].replace("body", "div"),
                    bodyClasses = $(body).get(0).className.split(/\s+/),
                    container = $("<div></div>").append($(data).find("#main")); // TODO: ça va foirer car #main n'existe pas dans le backoffice. Il faut chercher #lodel-container               
                that.root = container.get(0);
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