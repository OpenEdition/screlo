if (!window.jQuery) {

    console.error("Screlo requires jQuery");

} else {

    $( function () {

        var globals = require("./globals.js"), // TODO: pourquoi ? Il faudrait peut-être que ce soit vraiment global ? Genre SCRELO
            ui = require("./ui.js"),
            improveLodel = require("./lodel.js");
        
        $ = jQuery = require("./jquery-plugins.js")(jQuery);
        
        // TODO: utiliser bower
        require("./picomodal.js");  

        ui.init();
        
        improveLodel(); 
        
        console.info("Screlo v." + globals.version + " loaded");

    });

}