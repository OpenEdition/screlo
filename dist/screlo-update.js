/*
    Screlo - Update script
*/
var latest = "17.12.0",
    current = document.body.getAttribute('data-screlo-version');
if (current && current != latest) {
    document.body.className += " screlo-update";
}