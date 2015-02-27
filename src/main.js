if (!window.jQuery) {
    console.error("Screlo requires jQuery");
} else {
    $( function () {
        // Vendor
        require("./vendor/highlightRegex.js");
        require("./vendor/picoModal.js");

        var globals = require("./globals.js"), // TODO: Il faudrait peut-être que ce soit vraiment global ? Genre SCRELO
            ui = require("./ui.js"),
            improveLodel = require("./lodel.js");

        ui.init();
        improveLodel();         
        console.info("Screlo v." + globals.version + " loaded");
    });
}