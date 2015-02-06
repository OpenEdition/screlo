// ################ GLOBALS & CONFIGURATION ###############


var globals = {},
    pkg = require("../package.json"), // TODO: faire ça avec Grunt histoire de pas importer tout le package.json dans le script final
    utils = require("./utils.js"); 


globals.version = pkg.version;

// NOTE: Valeur à modifier quand l'architecture de l'objet Notification change. Permet d'éviter les incompatibilités avec les objets obsolètes qui peuvent se trouver dans localStorage.
globals.schema =  "15.1.2";

globals.appUrls = {
    
    // FIXME: faire un parametre stylesheet de grunt
    /* @ifdef DEV */
    stylesheat: "http://localhost/screlo/screlo.css",
    /* @endif */

    /* @ifndef DEV */
    stylesheat: "https://rawgit.com/thomas-fab/screlo/master/css/screlo.css", // jshint ignore:line
    /* @endif */

    update: "https://github.com/thomas-fab/screlo/raw/master/js/screlo.user.js"
};


globals.nomCourt = (function () {

    var host = window.location.host,
        p = location.pathname.replace(/\/(\d+)\//,'');

    if (host.indexOf("formations.lodel.org") > -1 || host.indexOf("lodel.revues.org") > -1 || host.indexOf("devel.revues.org") > -1) {
        return p.substr(0, p.indexOf('/'));
    } else {
        return host.substr(0, host.indexOf('.'));
    }
    
})();



globals.cacheIsValid = (function () {

    var nomCourt = globals.nomCourt,
        cacheSchema = utils.cache.get(nomCourt, "schema");
    
    return cacheSchema === globals.schema;
    
})();


// NOTE: Supprimer le localStorage quand il est basé sur un ancien schéma.
if (!globals.cacheIsValid) {
    var nomCourt = globals.nomCourt;
    
    utils.cache.clear(nomCourt);
    utils.cache.set(nomCourt, "schema", globals.schema);
}


globals.paper = (function () {

    var value = utils.cache.get(globals.nomCourt, "paper");
    
    if (typeof value !== "boolean") {
        value = true;
        utils.cache.set(globals.nomCourt, "paper", value);
    }
    
    return value;

})();



globals.isNumero = (function () {
    return $("body").hasClass("numero") && $('ul.summary li.textes .title').length > 0;
})();


globals.toc = globals.isNumero ? utils.getToc() : false;


module.exports = globals;