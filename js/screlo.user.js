// ==UserScript==
// @name        screlo-dev
// @namespace   http://revues.org/
// @include     /^http://lodel\.revues\.org/[0-9]{2}/*/
// @include     /^http://formations\.lodel\.org/[0-9]{2}/*/
// @include     http://*.revues.org/*
// @version     14.09.8
// @downloadURL	https://raw.githubusercontent.com/thomas-fab/screlo/master/js/screlo.js
// @updateURL	https://raw.githubusercontent.com/thomas-fab/screlo/master/js/screlo.js
// @grant       none
// ==/UserScript==

if (!window.jQuery) { 
    console.log("Erreur : Screlo nécessite jQuery");
} else {
	$( document ).ready( function(){

        // ################ ECRIRE L'URL DES RESSOURCES ICI ###############
        
        var appUrls = {
            "root": "https://raw.githubusercontent.com/thomas-fab/screlo/master/",
            "stylesheat": "https://rawgit.com/thomas-fab/screlo/master/css/screlo.css",
            "update": 'https://rawgit.com/thomas-fab/screlo/master/js/screlo.user.js'
        };
        
        // ################ PLUGINS JQUERY (eviter ajax) ###############
        
        /*
        * jQuery Highlight Regex Plugin v0.1.2 (https://github.com/jbr/jQuery.highlightRegex)
        * (c) 2009-13 Jacob Rothstein - MIT license
        */!function(a){var b=function(c){if(c&&c.childNodes){var d=a.makeArray(c.childNodes),e=null;a.each(d,function(a,d){3===d.nodeType?""===d.nodeValue?c.removeChild(d):null!==e?(e.nodeValue+=d.nodeValue,c.removeChild(d)):e=d:(e=null,d.childNodes&&b(d))})}};a.fn.highlightRegex=function(c,d){return"object"==typeof c&&"RegExp"!==c.constructor.name&&(d=c,c=void 0),"undefined"==typeof d&&(d={}),d.className=d.className||"highlight",d.tagType=d.tagType||"span",d.attrs=d.attrs||{},"undefined"==typeof c||""===c.source?a(this).find(d.tagType+"."+d.className).each(function(){a(this).replaceWith(a(this).text()),b(a(this).parent().get(0))}):a(this).each(function(){var e=a(this).get(0);b(e),a.each(a.makeArray(e.childNodes),function(e,f){var g,h,i,j,k,l;if(b(f),3==f.nodeType){if(a(f).parent(d.tagType+"."+d.className).length)return;for(;f.data&&(j=f.data.search(c))>=0&&(k=f.data.slice(j).match(c)[0],k.length>0);)g=document.createElement(d.tagType),g.className=d.className,a(g).attr(d.attrs),l=f.parentNode,h=f.splitText(j),f=h.splitText(k.length),i=h.cloneNode(!0),g.appendChild(i),l.replaceChild(g,h)}else a(f).highlightRegex(c,d)})}),a(this)}}(jQuery);

        // ################ FONCTIONS UTILITAIRES ###############
        
        // Objet "Erreur"
        function Erreur(message, type) {
            this.type = typeof type !== 'undefined' ? type : 'danger';
            this.message = message;
        }
        
        // Determiner le contexte d'execution
        function setContexte(classes) {
            var contexte = [];
            contexte.classes = [];
            classes.forEach( function(val) {
                contexte.classes[val] = true;
            });
            contexte.admin = ($('#lodel-container').length !== 0);
            contexte.isMotscles = $("body").hasClass("indexes") && $("body").is("[class*='motscles']");
            contexte.idPage = location.pathname.match(/(\d+)$/g);
            return contexte;
        }
        
        // Generer des URL
        function retournerUrl(quoi) {
            var h = location.href,
                p = location.pathname,
                a = p.replace(/[^/]+$/g, ''),
                b = p.match(/(\d+)$/g),
                parent = $("#breadcrumb #crumbs a:last").attr('href');
            if (quoi === "doc") {
                h = 'http://' + window.location.host + a + 'lodel/edition/index.php?do=download&type=source&id=' + b;
            } else if (quoi === "otx") {
                h = 'http://' + window.location.host + a + 'lodel/edition/oochargement.php?identity=' + b + '&idparent=' + parent + '&reload=1';
            } else if (quoi === "editer") {
                // http://lodel.revues.org/10/corela/lodel/edition/index.php?do=view&id=1504
                h = 'http://' + window.location.host + a + 'lodel/edition/index.php?do=view&id=' + b;   
            } else if (typeof quoi === 'string') {
                h = 'http://' + window.location.host + a + quoi;   
            }

            return h;   
        }
        
        // Suppression des accents pour trouver les doublons de mots-clés
        // http://stackoverflow.com/questions/990904/javascript-remove-accents-in-strings#answer-9667752
        function latinize (str) {
            var latin_map = {"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x","’":"'","–":"-","—":"-"};
            return str.replace(/[^A-Za-z0-9\[\] ]/g, function(a){return latin_map[a]||a;});
        }

        // Fonction générique pour tester les mots cles
        function testerMotsCles($collection) {
            var ok = true;

            $collection.each( function() {
                var latinAlphanum = /[\u0030-\u0039\u0040-\u005A\u0061-\u007A\u00C0-\u00FF\u0100-\u017F\u0180-\u024F]/,
                    motCle = $(this).text(),
                    alertes = [];

                // Premier caractère invalide
                if (!motCle.substr(0,1).match(latinAlphanum)) {
                    alertes.push('Initiale');   
                }

                // Point final
                if (motCle.slice(-1) === '.') {
                    alertes.push('Point final');   
                }

                // Mauvais séparateurs
                if (motCle.match(/[\-/;–—][\u0030-\u0039\u0040-\u005A\u0061-\u007A\u00C0-\u00FF\u0100-\u017F\u0180-\u024F \s]*[\-/;–—]/) && motCle.length > 20 ) {
                    alertes.push('Vérifier les séparateurs');   
                }

                if (alertes.length !== 0){
                    ok = false;
                    ajouterMarqueur(this, alertes.join(' | '), 'warning', true);
                }
            });
            return ok;
        }

        // Récupérer le texte des paragraphes
        function getPText($p) {
            var clone = $p.clone();
            clone.find('span.paranumber').remove();
            clone.find('span.screlo-marqueur').remove();
            return String(clone.text()).trim();
        }
        
        // Liste des tests
        function listerTests(tests) {
            var liste = [];
            for (var i=0; i<tests.length; i++) {
                liste.push(String(i+1) + '. ' + tests[i].nom);
            }
            return liste;
        }

        // ############### OUTILS & AMELIORATIONS D'INTERFACE ###############
        
        // Bookmarklet debugger (version light)
        function debugStylage() {
            // On recherche les P et SPAN vides (sauf COinS !)
            $('p,span:not(.Z3988)').not('#relecture_box *').each(function() {

                // Elements vides
                var strEmpty = ($(this).get(0).tagName == 'P') ? 'paragraphe vide' : '\u00A0';
                if (($(this).text().match(/^(nbsp|\s)*$/g) !== null) && ($(this).has('img').length === 0)) // FIXME: fonctionne pas bien sur les <p> car span.paranumber fait que le text est jamais vide
                    $(this).text(strEmpty).addClass('FIXME');

                // Mises en forme locales
                if ($(this).attr('style') !== undefined)
                    $(this).attr('title', $(this).attr('style')).addClass('TODO');
            });
        }
        
        // Fixer le menu de navigation pour boucler sur tous les éléments
        function fixNav() {
            function addNav(dirClass, url) {
                $('.navEntities').append($('<a></a>').addClass(dirClass).attr('href', url).css('border','2px green solid'));
            }

            if ($('.navEntities .goContents').length !== 0) {

                var tocUrl = $('.navEntities .goContents').attr('href'),
                    result =  $("<div></div>").load( tocUrl + " #main", function() {
                        var toc = $(this).find('ul.summary li a').map( function() {
                            return $(this).attr('href');
                        }).get(),
                            i = $.inArray(contexte.idPage[0], toc);

                        if (i !== -1) {
                            $('.navEntities a.goPrev, .navEntities a.goNext').remove();
                            if (i !== 0) {
                                addNav('goPrev', toc[i-1]);
                            } 
                            if (i+1 !== toc.length) {
                                addNav('goNext', toc[i+1]);
                            }
                            $('<span></span>').css({'float': 'left', 'margin': '2px 5px'}).text(Number(i+1) + '/' + Number(toc.length)).prependTo('.navEntities');
                        }
                    }); 
            }
        }

        // Liens vers la source sur TOC de la publication
        function sourceDepuisToc() {
            $('ul.summary .title').each( function() {
                var id = $(this).children('a').eq(0).attr('href'),
                    href ='lodel/edition/index.php?do=download&type=source&id=' + id;
                if (id !== undefined) {
                    $(this).append('<a href="' + href + '"> Ⓦ</a>');
                }
            });   
        }
        
        // ############### UI SCRELO & TESTS ###############
        
        // Injection d'une feuille de style
        function addCss() {
            $('head').append('<link rel="stylesheet" href="' + appUrls.stylesheat + '" type="text/css" />');
        }
        
        // Creer l'UI principale
        function setRelectureBox() {
            $('<div id="relecture_box"><ul id="liste_erreurs"></ul></div>').appendTo('body');

            // Inspecteur de classes 
            $('<div id="class_inspector"></div>').appendTo('#relecture_box');
            $('#text p').hover( function() {
                var cl = $( this ).attr("class");
                $('#class_inspector').text(cl);
            }, function() {
                $('#class_inspector').text('');
            });

            // Boutons
			var relecture_buttons = $('<div id="relecture_buttons"><form id="acces_rapide"><input type="text" id="id_acces"></input><input type="submit" value="go"/></form></div>');
			if (contexte.idPage) {
				$('<a title="Editer" href="' + retournerUrl('editer') + '"><img src="' + appUrls.root + 'css/edit.png" alt="Editer" /></a><a title="Document source" href="' + retournerUrl('doc') + '"><img src="' + appUrls.root + 'css/docsource.png" alt ="Document source"/></a><a title="Recharger" href="' + retournerUrl('otx') + '"><img src="' + appUrls.root + 'css/upload.png" alt="Recharger" /></a>').appendTo(relecture_buttons);
			}
            $('<a title="Version" href="#" id="version_popup"><img src="' + appUrls.root + 'css/about.png" alt ="Version"/></a>').appendTo(relecture_buttons);
			relecture_buttons.appendTo("#relecture_box");

            // Fonctions
            $( "#version_popup" ).click(function( event ) {
                event.preventDefault();
                var msg = 'Screlo version ' + GM_info.script.version + '\n\nScrelo effectue les tests suivants :\n' + listerTests(tests).join('\n') + '\n\nUne mise à jour de Screlo est peut-être disponible. Forcer la mise à jour ?',
                    mettreAJour = false;
                mettreAJour = confirm(msg);
                if (mettreAJour) {
                    window.location.href = appUrls.update;
                }
            });

            $( "#acces_rapide" ).submit(function( event ) {
                event.preventDefault();
                var idAcces = $('input#id_acces').val();
                if (typeof idAcces === 'string') {
                    window.location.href = retournerUrl(idAcces);
                }
            });
        }

        // Ajouter marqueur (signaler les erreurs dans le texte)
        function ajouterMarqueur(element, message, type, after) {
            type = typeof type !== 'undefined' ? type : 'danger';

            if (element.nodeType === 1 && message){
                var span = $('<span class="screlo-marqueur"></span>').addClass(type).text(message);
                if (!after) {
                    span.prependTo(element);
                } else {
                    span.appendTo(element);    
                }
            } else {
                console.log('Erreur de parametre de ajouterMarqueur()');
            }
        }
        
        // Effectuer les tests
        function relire(tests) {
            var condition,
                res,
                erreurs = [];
            for (var i = 0; i < tests.length; i++) {
                condition = tests[i].condition;
                if (condition) {
                    res = tests[i].action();
                    if (res instanceof Erreur) {
                        erreurs.push(res);
                    }
                }
            }
            return erreurs;
        }

        // Afficher les erreurs
        function afficherErreurs(erreurs) {
            var danger = 0,
                warning = 0,
                msg = '';
            for (var i = 0; i < erreurs.length; i++) {
                var li = $('<li class="erreur ' + erreurs[i].type + '">' + erreurs[i].message + '</li>');
                if (erreurs[i].type === "danger") {
                    li.prependTo('#relecture_box ul#liste_erreurs');
                    danger++;
                } else {
                    li.appendTo('#relecture_box ul#liste_erreurs');
                    warning++;
                }
            }
            if (danger) {
                msg += '<span class="count danger">' + danger + ' erreur(s)</span>';
            }
            if (danger && warning) {
                msg += ', ';
            }
            if (warning) {
                msg += '<span class="count warning">' + warning + ' avertissement(s) </span>';
            }
            $('<p>' + msg + '</p>').prependTo('#relecture_box');
        }
	
        // ############### DECLARATION DES TESTS ###############
        
        var contexte = setContexte(document.body.className.split(/\s+/));

		var tests = [
			{
				nom: "Absence d'auteur",
                condition : contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations,
				action : function () {
					var champAuteur = $('#docAuthor');
					if(champAuteur.length === 0){
						return new Erreur('Pas d\'auteur',  'danger');
					}
				}
			},
			{
                nom: "Absence de facsimilé",
                condition : contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations,
				action : function () {
					if($('#wDownload.facsimile').length === 0){
						return new Erreur('Pas de facsimile',  'warning');
					}
				}
			},
			{
                nom: "Erreur de pagination",
                condition : contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations,
				action : function () {
					if($('#docPagination').length === 0){
						return new Erreur('Pas de pagination',  'warning');
					} else if(!/^p\. [0-9-]*$/i.test($('#docPagination').text())) {
						return new Erreur('Mauvais format de pagination',  'danger');
					}
				}
			},
			{
                nom: "Pas de date de publication électronique (numéro)",
                condition : contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations,
				action : function () {
					// FIXME: ce test ne fonctionne que si la page est affichée en français
					var refElectro = $('#quotation > h3:last').next('p').text();
					if (refElectro.match(/mis en ligne le ,/)) {
						return new Erreur('Pas de date de publication électronique',  'danger');
					}
				}
			},			
			{	
                nom: "Compterendu/notedelecture sans référence",
                condition : contexte.classes.textes && (contexte.classes.compterendu || contexte.classes.notedelecture),
				action : function () {
					if ($("#docReference").length === 0) {
						return new Erreur('Pas de référence de l\'oeuvre',  'danger');
					}
				}
			},
			{
                nom: "Utilisation de police(s) non Unicode",
                condition : contexte.classes.textes,
				action : function () {
					var el = $('#content [style*="Symbol"], #content [style*="symbol"], #content [style*="Wingdings"], #content [style*="wingdings"], #content [style*="Webdings"], #content [style*="webdings"]');
					if (el.length !== 0) {						
						el.each(function() {
                            ajouterMarqueur(this, "Police");
						});
						return new Erreur('Police non Unicode utilisée (' + el.length + ')');
					}
				}
			},
			{
                nom: "Retour à la ligne dans le titre ou dans un intertitre",
                condition : contexte.classes.textes,
				action : function () {
                    var compteur = 0;
                    
                    $('.texte:header br, h1#docTitle br').each( function() {
                        compteur++;
                        ajouterMarqueur(this.parentNode, "Retour à la ligne", "warning");
					});
                    
                    if(compteur > 0) {
                        return new Erreur('Retour à la ligne dans le titre ou dans un intertitre (' + compteur + ')');
                    }
				}
			},
			{
                nom: "Titre d'illustration mal placé",
                condition : contexte.classes.textes,
				action : function () {
					var compteur = 0;
                    
					$('table + .titreillustration, img + .titreillustration, div.textIcon + .titreillustration').each( function() {
						if($(this).next('table, img, div.textIcon').length === 0) { // titreillus apres illus = erreur, sauf si suivi d'illus
							compteur++;
                            ajouterMarqueur(this, "Repositionner ce titre");
						}
					});
					
					if(compteur > 0) {
						return new Erreur('Titre après illustration (' + compteur + ')');
					}
				}
			},
            {
                nom: "Légende d'illustration mal placée",
                condition : contexte.classes.textes,
                action : function () {
                    var compteur = 0;

                    $('.creditillustration + .legendeillustration, div.textIcon + .legendeillustration').each( function() {
                            compteur++;
                            ajouterMarqueur(this, "Repositionner cette légende");
                    });

                    if(compteur > 0) {
                        return new Erreur('Position légende illustration (' + compteur + ')');
                    }
                }
            },
			{
                nom: "Paragraphe qui commence par une minuscule",
                condition : contexte.classes.textes,
				action : function () {
					var compteur = 0;
					
                    $('#text > .text > *:not(.textandnotes), #text > .text > .textandnotes > *, #text > .text > *:header').not('.citation,.paragraphesansretrait, blockquote, .sidenotes, ol, ul, li').each( function() {
						var firstChar = getPText($(this)).charAt(0);
						if (latinize(firstChar).match(/^[a-z]/)) {
                            ajouterMarqueur(this, "Minuscule", "warning");
							compteur++;
						}
					});
					
					if(compteur > 0) {
						return new Erreur('Caractère minuscule en début de paragraphe (' + compteur + ')', 'warning');
					}
				}
			},
            {
                nom: "Citation stylée en Normal",
                condition : contexte.classes.textes,
				action : function () {
					var compteur = 0;
					
                    $('#text > .text > *:not(.textandnotes), #text > .text > .textandnotes > *').not('.citation, .epigraphe, blockquote, .sidenotes, ol, ul, li, :header').each( function() {
						var string = getPText($(this));
                        if (string.charAt(0).match(/[«"“]/) && string.slice(-20).match(/[”"»]/)) {
                            ajouterMarqueur(this, "Citation ?", "warning");
							compteur++;
						}
					});
					
					if(compteur > 0) {
                        return new Erreur('Citation stylée en Normal (' + compteur + ')', 'warning');
					}
				}
			},
            {
                nom: "Listes mal formatées",
                condition : contexte.classes.textes,
                action : function () {
                    var compteur = 0;

                    $('#text > .text > p, #text > .text > .textandnotes > p').each( function() {
                        var string = getPText($(this));
                        if (string.match(/^[•∙◊–—>-]/) || string.slice(1,2).match(/[\/.):–—-]/)) {
                            ajouterMarqueur(this, "Liste", "warning");
                            compteur++;
                        }
                    });

                    if(compteur > 0) {
                        return new Erreur('Listes manquantes (' + compteur + ')', 'warning');
                    }
                }
            },
			{
                nom: "Styles inconnus utilisés",
                condition : contexte.classes.textes,
				action : function () {
                    var textWhitelist = "p.remerciements, p.texte, p.paragraphesansretrait, p.creditillustration, p.epigraphe, p.citation, p.citationbis, p.citationter, p.titreillustration, p.legendeillustration, p.question, p.reponse, p.separateur, p.encadre";
					var compteur = 0;
					$('#text > .text p').each( function() {
						if (!$(this).is(textWhitelist)) {
                            ajouterMarqueur(this, 'Style inconnu : ' + $(this).attr('class'));
							compteur++;
						}
					});
					
					if(compteur > 0) {
						return new Erreur('Styles inconnus utilisés (' + compteur + ')');
					}
				}
			},
			{
                nom: "Incohérence dans la numérotation des notes",
                condition : contexte.classes.textes,
				action : function () {
					var e = false,
						debut = 0;
					$('#notes > p > a[id^=ftn]').each( function(index) {
						if (index === 0) {
							debut = parseInt($(this).text());
						} else {
							if (parseInt($(this).text()) !== index + debut) {
								e = true;
								return false;
							}
						}
					});
					if (e) {
						return new Erreur('Incohérence dans la numérotation des notes', 'warning');
					}
				}
			},
			{
                nom: "Arborescences interdites",
                condition : contexte.classes.textes,
				action : function () {
					var compteur = 0,
						blackList = 'ol :header, ul :header, li:header'; 
					
					$("#content").find(blackList).each( function() {
						compteur++;
                        ajouterMarqueur(this, "Arborescence interdite");
					});
					
					if(compteur > 0) {
						return new Erreur('Arborescence interdite (' + compteur + ')');
					}
				}			
			},
			{
                nom: "Ponctuation à la fin du titre ou d'un intertitre",
                condition : contexte.classes.textes,
				action : function () {
					var compteur = 0;
					
                    $('.texte:header, h1#docTitle').each( function() {
						if( $(this).text().trim().match(/[\.:;=]$/) ) {
							compteur++;
                            ajouterMarqueur(this, "Ponctuation", "danger", true);
						}
					});
					
					if(compteur > 0) {
                        return new Erreur('Ponctuation à la fin du titre ou d\'un intertitre (' + compteur + ')');
					}
				}			
			},
			{
                nom: "Mises en formes locales sur le titre",
                condition : contexte.classes.textes,
				action : function () {
					if ($('#docTitle[style], #docTitle [style]').length !== 0) {
						return new Erreur('Mises en formes locales sur le titre', 'danger');
					}
				}			
			},
			{
                nom: "Appel de note dans le titre",
                condition : contexte.classes.textes,
				action : function () {
					if ($('#docTitle .footnotecall').length !== 0) {
						return new Erreur('Appel de note dans le titre', 'warning');
					}
				}			
			},
			{
                nom: "Titre d'illustration en légende",
                condition : contexte.classes.textes,
				action : function () {
					var compteur = 0;
					
					$('.legendeillustration').each( function() {
						if( $(this).text().match(/^(fig|tabl)/i) ) {
							compteur++;
                            ajouterMarqueur(this, "Titre plutôt que légende", "warning");
						}
					});
					
					if(compteur > 0) {
						return new Erreur('Titre d\'illustration stylé en légende (' + compteur + ')', 'warning');
					}
				}			
			},
            {
                nom: "Présence de champs d'index Word",
                condition : contexte.classes.textes,
                action : function () {
                    var compteur = 0;

                    $("a:contains('Error: Reference source not found'), a[href^='#id']").each( function() {
                            compteur++;
                            ajouterMarqueur(this, "Champ d'index", "danger");
                    });

                    if(compteur > 0) {
                        return new Erreur('Champ d\'index Word (' + compteur + ')', 'danger');
                    }
                }			
            },
            {
                nom: "Remerciement en note 1",
                condition : contexte.classes.textes,
                action : function () {
                    var str = $("#notes .notesbaspage:first").text(),
                        merci = [/merci/i, /thank/i]; // TODO: compléter

                    for (var i=0; i<merci.length; i++) { 
                        if (str.match(merci[i])) {
                            return new Erreur('Remerciement en note', 'warning');
                        }
                    }
                }			
            },
            {
                nom: "Composition des mots-cles",
                condition : contexte.isMotscles || (contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations),
                action : function () {
                    var res;
                    if (contexte.isMotscles) {
                        res = testerMotsCles($('#pageBody .entries ul li'));
                    } else if (contexte.classes.textes) {
                        res = testerMotsCles($('#entries .index a'));
                    }
                    
                    if (!res) {
                        return new Erreur('Vérifier les mots clés', 'warning');
                    }
                }			
            },
            {
                nom: "Hierarchie du plan incohérente",
                condition : contexte.classes.textes,
                action : function () {
                    var precedent = 0,
                        compteur = 0;
                    
                    $('#toc div').each( function () {
                        var niveau = Number($(this).attr('class').slice(-1));
                        if (niveau > precedent + 1 || (precedent === 0 && niveau != 1)) {
                            compteur++;
                            ajouterMarqueur(this, "Hierarchie", "warning", true);
                        }
                        precedent = niveau;
                    });

                    if(compteur > 0) {
                        return new Erreur('Incohérence du plan (' + compteur + ')', 'warning');
                    }
                }			
            },
            {
                nom: "Doublons de mots-cles",
                condition : contexte.isMotscles,
                action : function () {
                    var arr = {},
                        text = "",
                        err = 0;
                    $('#pageBody .entries ul li').each( function (index) {
                        text = latinize($(this).text()).replace(/[\s;–—-]+/g, '').toLowerCase();
                        if (arr[text]) {
                            arr[text].push(index);
                        } else {
                            arr[text] = [index];
                        }
                    });
					
					$.each(arr, function (key, eqs) {
						if ($.isArray(eqs) && eqs.length > 1) {
							for (var i=0; i < eqs.length; i++) {
								ajouterMarqueur($('#pageBody .entries ul li').eq(eqs[i])[0], "Doublon  ?", "warning", true);
							}
							err++;
						}
					});
					
                    if (err !== 0) {
                        return new Erreur('Vérifier les doublons (' + err + ')', 'warning');
                    }
                }			
            },
            {
                nom: "Format de nom d'auteur : capitales, caractères interdits",
                condition : contexte.classes.indexes || (contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations) || contexte.classes.publications,
                action : function () {
                    var text = "",
                        err = 0;
                    $('span.familyName').each( function () {
                        text = latinize($(this).text().trim());
                        if (text === text.toUpperCase() || text.match(/[&!?)(*\/]/)) {
                            ajouterMarqueur(this, "Format", "warning", true);
                            if (!contexte.classes.textes || $(this).is('#docAuthor *, #docTranslator *')) {
								err++;
							}
                        }
                    });
					
                    if (err !== 0) {
                        return new Erreur('Format de nom d\'auteur : capitales, caractères interdits  (' + err + ')', 'warning');
                    }
                }			
            },
            {
                nom: "Auteur sans prénom",
                condition : contexte.classes.indexes || (contexte.classes.textes && !contexte.classes.actualite && !contexte.classes.informations) || contexte.classes.publications,
                action : function () {
                    var err = 0;
                    $('span.familyName').each( function () {
                        if ($(this).text().trim() === $(this).parent().text().trim()) {
                            ajouterMarqueur(this, "Nom seul", "warning", true);
							if (!contexte.classes.textes || $(this).is('#docAuthor *, #docTranslator *')) {
								err++;
							}
                        }
                    });
					
                    if (err !== 0) {
                        return new Erreur('Auteur sans prénom (' + err + ')', 'warning');
                    }
                }			
            },
            {
                nom: "Format d'image non supporté (WMF)",
                condition : contexte.classes.textes,
                action : function () {
                    var err = 0;
                    $( "img[src$='.wmf']" ).each( function () {
                            ajouterMarqueur(this, "Format d'image inconnu", "danger", true);
                            err++;
                    });
					
                    if (err !== 0) {
                        return new Erreur('Format d\'image non supporté (' + err + ')', 'danger');
                    }
                }			
            },
            {
                nom: "Intertitre sur plusieurs paragraphes",
                condition : contexte.classes.textes,
                action : function () {
                    var err = 0;
                    $( ".texte:header + .texte:header" ).each( function () {
                        if ($(this).prev('.texte:header')[0].nodeName === this.nodeName) {
                            ajouterMarqueur(this, "Double intertitre", "danger", true);
                            err++;   
                        }
                    });
					
                    if (err !== 0) {
                        return new Erreur('Intertitre sur plusieurs paragraphes (' + err + ')', 'danger');
                    }
                }			
            },
            {
                nom: "Caractères Symbol",
                condition : contexte.classes.textes,
                action : function () {
                    var symbolsRegex = 	/[]/g,
                        err = $('#docBody').highlightRegex(symbolsRegex, {
                            tagType:   'span',
                            className: 'symbolalert'
                        }).find('span.symbolalert').length;
                    
                    if (err > 0) {
                        return new Erreur('Caractères Symbol (' + err + ')', 'danger');
                    }   
                }
            },
            {
                nom: "Erreurs d'import du résumé et des mots-clés",
                condition : contexte.classes.textes,
                action : function () {
                    var nbMots = $("#entries .index h3").filter( function(i,e) {
                        return !$(e).text().match(/(Index|Índice|Indice)/);
                    }).length,
                        nbResumes = $("#abstract .tabContent").length;
                    
                    if (nbMots !== 0 && nbResumes !== 0 && nbMots !== nbResumes) {
                        return new Erreur('Vérifier le stylage du résumé et des mots-clés', 'warning');   
                    }
                }			
            },
            {
                nom: "Numéro sans couverture",
                condition : contexte.classes.numero,
                action : function () {
                    if ($("#publiInformation img").length === 0) {
                        return new Erreur('Numéro sans couverture', 'warning');      
                    }
                }			
            }//,
		];
        
        // ############### TIRE LA CHEVILLETTE ET LA BOBINETTE CHERRA ! ###############
        
        sourceDepuisToc();
		addCss();
        fixNav();
		setRelectureBox();
		afficherErreurs(relire(tests));
		debugStylage();
        
        console.log('Script ' + GM_info.script.name + '.js version ' + GM_info.script.version + ' chargé.');
	
	});
}