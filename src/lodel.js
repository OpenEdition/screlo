/*
    Screlo - lodel
    ==========
    Améliorations diverses de la Lodelia et outils supplémentaires.
*/

// Bookmarklet debugger (version light)
function debugStylage () {  
    // On recherche les P et SPAN vides (sauf COinS !)
    $('p, span:not(.Z3988)').not('#screlo-main *').not('.screlo-marker').each(function() {
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
function fixNav () {
    
    function addNav(dirClass, url) {
        $('.navEntities').append($('<a></a>').addClass(dirClass + " corrected").attr('href', url));
    }

    function navInToolbar(buttonId, url) {
        $("#screlo-toolbar a[data-screlo-button='" + buttonId + "']").attr("href", url).removeClass("hidden");
    }

    if ($('.navEntities .goContents').length !== 0) {
        var tocUrl = $('.navEntities .goContents').attr('href'),
            result =  $("<div></div>").load( tocUrl + " #main", function() {
                var idPage = location.pathname.match(/(\d+)$/g)[0],
                    toc = $(this).find('ul.summary li:not(.fichiers) a:first-child').map( function() {
                    return $(this).attr('href');
                }).get(),
                    i = $.inArray(idPage, toc);

                if (i !== -1) {
                    $('.navEntities a.goPrev, .navEntities a.goNext').remove();
                    if (i !== 0) {
                        addNav('goPrev', toc[i-1]);
                        navInToolbar("goprev", toc[i-1]);
                    } 
                    if (i+1 !== toc.length) {
                        addNav('goNext', toc[i+1]);
                        navInToolbar("gonext", toc[i+1]);
                    }
                    $('<span></span>').css({'float': 'left', 'margin': '2px 5px'}).text(Number(i+1) + '/' + Number(toc.length)).prependTo('.navEntities');
                }
            });
        navInToolbar("gocontents", tocUrl);
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

// Tout lancer d'un seul coup. C'est cette fonction qui est renvoyée par le module.
function improveLodel () {
    debugStylage();
    fixNav();
    sourceDepuisToc();
}

module.exports = improveLodel;