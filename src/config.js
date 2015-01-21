// ################ CONFIGURATION ###############

var xprt = {},
    pkg = require('../package.json');

xprt.version = pkg.version;

xprt.appUrls = {
    
    /* @ifdef DEV */
    stylesheat: "http://localhost/screlo/screlo.css",
    /* @endif */

    /* @ifndef DEV */
    stylesheat: "https://rawgit.com/thomas-fab/screlo/master/css/screlo.css",
    /* @endif */

    update: "https://github.com/thomas-fab/screlo/raw/master/js/screlo.user.js"
}

module.exports = xprt;