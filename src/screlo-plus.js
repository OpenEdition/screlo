/*
    ScreloPlus
    ==========
    Améliorations diverses de la Lodelia et outils supplémentaires. 
    Fonctions indépendantes disponibles uniquement dans l'userscript.
*/

var screloPlus = { nav: {} };

// Fixer le menu de navigation pour boucler sur tous les éléments
function fixNav () {
    function addNav(dirClass, url) {
        $('.navEntities').append($('<a></a>').addClass(dirClass + " corrected").attr('href', url));
        screloPlus.nav[dirClass] = url;
    }
    if ($('.navEntities .goContents').length !== 0) {
        var tocUrl = screloPlus.nav.goContents = $('.navEntities .goContents').attr('href'),
            result =  $("<div></div>").load( tocUrl + " #main", function() {
                var idPage = location.pathname.match(/(\d+)$/g)[0],
                    toc = $(this).find('ul.summary li:not(.fichiers) a:first-child').map( function() {
                        return $(this).attr('href');
                    }).get(),
                    i = $.inArray(idPage, toc); // FIXME: ne fonctionne pas pour les articles contenus dans des rubriques annuelles car a.goContents renvoit vers la rubrique ancetre et non la rubrique annuelle parente.
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
function sourceDepuisToc () {
    $('ul.summary li:not(.fichiers) .title').each( function() {
        var id = $(this).children('a').eq(0).attr('href'),
            href ='lodel/edition/index.php?do=download&type=source&id=' + id;
        if (id !== undefined) {
            $(this).append('<a href="' + href + '"> Ⓦ</a>');
        }
    });    
}

// Raccourcis clavier
function setHotkeys () {
    function hideBox () {
        $('#screlo-plus-goto').val('');
        $('#screlo-plus').hide();
    }
    $(document).keydown(function(e) {
        var slashChar = 111,
            starChar = 106,
            minusChar = 109,
            escChar = 27;
        if (document.activeElement === null || document.activeElement === document.body) {
            if (e.which === starChar && screloPlus.nav.goPrev) {
                e.preventDefault();
                location.href = screloPlus.nav.goPrev;
            } else if (e.which === minusChar && screloPlus.nav.goNext) {
                e.preventDefault();
                location.href = screloPlus.nav.goNext;
            } else if (e.which === slashChar && screloPlus.nav.goContents) {
                e.preventDefault();
                location.href = screloPlus.nav.goContents;
            } else if (e.which >= 97 && e.which <= 105) {
                $('#screlo-plus').show();
                $('#screlo-plus-goto').focus();
            }
        } else if (document.activeElement === $('#screlo-plus-goto').get(0) && e.which === escChar) {
            $('#screlo-plus-goto').blur();
            hideBox();
        }
    });
    $('#screlo-plus-goto').blur( function () {
        hideBox();
    });
}

function addBox () {
    var box = "<div id='screlo-plus' style='display:none'><form id='screlo-plus-goto-form'><input id='screlo-plus-goto' type='text' data-screlo-action='go' placeholder='▶'/></form></div>";
    $(box).appendTo("body");
    $( "#screlo-plus-goto-form" ).submit(function( event ) {
        event.preventDefault();
        var idAcces = $('input#screlo-plus-goto').val();
        if (typeof idAcces === 'string') {
            window.location.href = idAcces;
        }
    });
}

function init () {
    addBox();
    fixNav();
    setHotkeys();
    sourceDepuisToc();
}

module.exports = { init: init };