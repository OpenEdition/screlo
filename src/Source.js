var globals = require("./globals.js");

function Source (id, callback) {
    callback = typeof callback === "function" ? callback : undefined;
    var isSelf,
        split = id.split(/\s+/);
    this.id = id;
    this.url = split[0];
    this.selector = split.length === 2 ? split[1] : "#main";
    isSelf = this.url === globals.page;
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
        url = this.url;
    $.ajax({
        url: url,
        timeout: 20000,
        success: function(data) {
            if (data && data.match(/\n.*(<body.*)\n/i) !== null) {
                var body = data.match(/\n.*(<body.*)\n/i)[1].replace("body", "div"),
                    bodyClasses = $(body).get(0).className.split(/\s+/),
                    container = $("<div>" + data + "</div>").find(that.selector);
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