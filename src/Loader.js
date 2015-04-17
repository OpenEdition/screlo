/*
    Loader
    ==========
    Gère l'import des documents dans lesquels sont effectués les tests.
*/

var Source = require("./Source.js");

// TODO: ici Loader est volontairement attaché au contexte global. Il faudrait placer dans un namespace 'screlo'.
Loader = {
    sources: {},
    getSource: function (id) {
        return id.constructor === Source ? id : this.sources[id];
    },
    // Same as above with an array of sources
    getSources: function (urls) {
        var that = this,
            mapFunc = (function () {
                return that.getSource;
            })();
        return urls.map(mapFunc);
    },
    load: function (id, callback) {
        if (this.sources[id]) {
            return false;
        }
        this.sources[id] = true; // NOTE: valeur temporaire pour bloquer les requêtes suivantes avec le même id. Si on attend la construction de Source plusieurs requêtes ont le temps de passer.
        var source = new Source(id, callback);
        this.sources[id] = source; // TODO: il faudrait normaliser les id pour éviter les doublons
        return source;
    },
    infos: function (sourcesArray) {
        var res = {
                all: sourcesArray,
                ready: [],
                error: [],
                success: [],
                allReady: undefined
            },
            thisSource;
        for (var i=0; i<sourcesArray.length; i++) {
            thisSource = sourcesArray[i];
            if (thisSource.isReady) {
                res.ready.push(thisSource);
            } else {
                continue;
            }
            if (thisSource.isError) {
                res.error.push(thisSource);
            }
            if (thisSource.isSuccess) {
                res.success.push(thisSource);
            }
        }
        res.allReady = (res.ready.length === res.all.length);
        return res;
    },
    onSourcesReady: function (sourcesArray, callback) {
        var that = this,
            checkIfReady = function () {
                var infos = that.infos(sourcesArray),
                    flag = infos.allReady;
                if (flag) {
                    callback(infos);
                    return;
                } else {    
                    setTimeout(checkIfReady, 1000);
                }
            };
        checkIfReady();
    }
};

module.exports = Loader;