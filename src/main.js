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
        screloPlus.init(); // TODO: uniquement si userscript (grunt preprocess)
        console.info("Screlo v." + globals.version + " loaded"); // TODO: preciser quelle version (user ou remote)
    });
}