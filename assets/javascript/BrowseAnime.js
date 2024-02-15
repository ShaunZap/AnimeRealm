document.addEventListener('DOMContentLoaded', function () {
    getNav();
 });
 function getNav(){
 
    fetch('../../animeNav.html')
    .then(response => response.text())
    .then(html => {
        // console.log('success');
        document.getElementById('navbar').innerHTML = html;
    });
 }