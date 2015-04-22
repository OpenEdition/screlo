/*
    Screlo - globals
    ==========
    Contient des constantes prédéfinies ou calculées utilisées dans les autres modules.
*/

var globals = {},
    utils = require("./utils.js"),
    tests = require("./tests-revues.js"); 

globals.version = "/* @echo VERSION */";

globals.schema =  "15.4.0c"; // NOTE: Valeur à incrémenter quand l'architecture des informations stockées dans le cache change. Permet d'éviter les incompatibilités avec les objets obsolètes qui peuvent se trouver dans localStorage.

globals.appUrls = {
    base: "/* @echo CDN */",
    stylesheet: "/* @echo CDN */" + "dist/screlo.css",
    update: "/* @echo UPDATE */",
    homepage: "/* @echo HOMEPAGE */",
    doc: "/* @echo HOMEPAGE */" + "/tree/master/docs"
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

globals.page = (function () {
    var url = location.pathname,
        match = url.match(/(\d+)$/g);
    return match ? match[0] : url;
})();

globals.hash = window.location.hash.substring(1);

globals.admin = ($('#lodel-container').length !== 0);

globals.cacheIsValid = (function () {
    var nomCourt = globals.nomCourt,
        cacheSchema = utils.cache.get(nomCourt, "schema");
    return cacheSchema === globals.schema;
})();

// Supprimer le localStorage quand il est basé sur un ancien schéma.
if (!globals.cacheIsValid) {
    var nomCourt = globals.nomCourt;
    utils.cache.clear(nomCourt);
    utils.cache.set(nomCourt, "schema", globals.schema);
}

// TODO: factoriser active/paper
globals.active = (function () {
    var value = utils.cache.get(globals.nomCourt, "active");
    if (typeof value !== "boolean") {
        value = true;
        utils.cache.set(globals.nomCourt, "active", value);
    }
    return value;
})() && globals.admin; // Pas actif si on n'est pas connecté à Lodel.

if (globals.active) {
    $("body").addClass("screlo-active"); // TODO: harmoniser l'ajout de classes
}

globals.paper = (function () {
    var value = utils.cache.get(globals.nomCourt, "paper");
    if (typeof value !== "boolean") {
        value = true;
        utils.cache.set(globals.nomCourt, "paper", value);
    }
    return value;
})();

globals.isPublication = (function () {
    return $("body").hasClass("publications") && $('ul.summary li.textes .title').length > 0;
})();

globals.toc = globals.isPublication ? utils.getToc() : false;

globals.infos = (function () {
    
    function getInfo (test) {
        var typeInfos = {
            danger: "Cette notification signale une erreur critique concernant la composition du document. Cette erreur peut entraver le traitement et la mise en valeur des contenus sur la plateforme, il est donc fortement recommandé de la corriger.",
            warning: "Cette notification est un avertissement concernant certains aspects de la composition du document qui peuvent peut-être être améliorés.",
            print: "Cette notification concerne les contenus qui existent également en version imprimée. Il est conseillé de corriger ces erreurs afin d'améliorer la citabilité et le référencement de ces contenus."
        },
            type = test.type || "danger",
            links,
            info = "";
        if (!test.description) {
            return false;
        }
        if (test.name) {
            info += "<h1 class='" + type + "'> Test #" + test.id + " - " + test.name + "</h1>";
        }
        info += "<p class='screlo-typeinfos screlo-" + type + "'>" + typeInfos[type] + "</p>";
        info += "<p>" + test.description + "</p>\n";
        if (test.links && test.links.length >= 2) {
            links = test.links;
            info += "<div class='infolinks'>\n<h2>À lire dans la documentation</h2>\n<ul>\n";
            for (var j=0; j<links.length; j=j+2) {
                if (links[j] && links[j+1]) {
                    info += "<li><a href='" + links[j+1] + "' target='_blank'>" + links[j] + "</a></li>\n";
                }
            }
            info += "</ul></div>";
        }
        return info;
    }
    
    var infos = [],
        thisId,
        thisInfo;
    
    for (var i=0; i<tests.length; i++) {
        if (tests[i].id && tests[i].description) {
            thisId = tests[i].id;
            thisInfo = getInfo(tests[i]);
            infos[thisId] = thisInfo;
        }
    }
    return infos;
})();

module.exports = globals;