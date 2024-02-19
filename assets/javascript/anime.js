document.addEventListener('DOMContentLoaded', function () {
    getNav();
    getTopAnime();
    getUpcomingAnime();
 });
 function getNav(){
 
    fetch('../../pages/animeNav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar').innerHTML = html;
    });
 }

 async function getTopAnime(){
    const topResponse = await fetch(`https://kitsu.io/api/edge/anime?sort=popularityRank&page[limit]=8`);
    const topData = await topResponse.json();
    console.log(topData);
    let cards = generateCards(topData);
    let cardContainer = document.getElementById("top-anime-card-container");
    cards.forEach(card => {
        cardContainer.appendChild(card);
    });
 }
 async function getUpcomingAnime(){
    const topResponse = await fetch(`https://kitsu.io/api/edge/anime?filter[status]=upcoming&page[limit]=8`);
    const topData = await topResponse.json();
    console.log(topData);
    let cards = generateCards(topData);
    let cardContainer = document.getElementById("upcoming-card-container");
    cards.forEach(card => {
        cardContainer.appendChild(card);
    });
 }