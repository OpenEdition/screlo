// ################ GLOBALS & CONFIGURATION ###############


var globals = {},
    utils = require("./utils.js"),
    tests = require("./tests-revues.js"); 


globals.version = "/* @echo VERSION */";

// NOTE: Valeur à modifier quand l'architecture de l'objet Notification change. Permet d'éviter les incompatibilités avec les objets obsolètes qui peuvent se trouver dans localStorage.
globals.schema =  "15.2.3";

globals.appUrls = {
    stylesheet: "/* @echo STYLESHEET */",
    update: "https://github.com/thomas-fab/screlo/raw/master/js/screlo.user.js",
    fancybox: "http://static.devel.revues.org/js/fancybox/jquery.fancybox-1.3.1.js"
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


globals.infos = (function () {
    var infos = [],
        thisId,
        thisInfo;
    
    for (var i=0; i<tests.length; i++) {
        if (tests[i].id && tests[i].description) {
            thisId = tests[i].id;
            thisInfo = utils.getInfo(tests[i]);
            infos[thisId] = thisInfo;
        }
    }
    
    return infos;
})();


module.exports = globals;