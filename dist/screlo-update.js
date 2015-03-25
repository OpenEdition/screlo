/*
    Screlo - Update script
*/
var latest = "15.3.1",
    current = document.body.getAttribute('data-screlo-version');
if (current && current != latest) {
    document.body.className += " screlo-update";
}