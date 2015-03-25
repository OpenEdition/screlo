/*
    Screlo - Update script
*/
var latest = "/* @echo VERSION */",
    current = document.body.getAttribute('data-screlo-version');
if (current && current != latest) {
    document.body.className += " screlo-update";
}