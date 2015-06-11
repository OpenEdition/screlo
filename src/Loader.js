/*
    Screlo - Loader
    ==========
    Gère l'import des documents dans lesquels sont effectués les tests.
    Loader a notamment pour fonction d'éviter de charger deux fois la même source.
*/

var Source = require("./Source.js");

// TODO: ici Loader est volontairement attaché au contexte global. Il faudrait placer dans un namespace 'screlo'.
Loader = {
    sources: {},
    handledSources: {},
    getSource: function (id) {
        var res = id.constructor === Source ? id : this.sources[id];
        return res;
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
        // handledSources stocke les identifiants des sources qui ont été traitées pour éviter la redondance
        if (this.handledSources[id]) {
            return false;
        }
        this.handledSources[id] = true;
        new Source(id, callback);
        return this.sources[id];
    },
    pushSource: function (source) {
        this.sources[source.id] = source;
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
