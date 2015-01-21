if (!window.jQuery) {

    console.log("Erreur : Screlo nécessite jQuery");

} else {

    $( function () {
        
        var run = require("./core.js").run;
        
        $ = jQuery = require("./jquery-plugins.js")(jQuery);
        
        run();
        
    });

}