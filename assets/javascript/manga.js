document.addEventListener('DOMContentLoaded', function () {
    getNav();
    getTopManga();
    getUpcomingManga();
 });
 function getNav(){
 
    fetch('../../mangaNav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar').innerHTML = html;
    });
 }
 async function getTopManga(){
    const topResponse = await fetch(`https://kitsu.io/api/edge/manga?sort=popularityRank&page[limit]=8`);
    const topData = await topResponse.json();
    console.log(topData);
    let cards = generateCards(topData);
    let cardContainer = document.getElementById("top-manga-card-container");
    cards.forEach(card => {
        cardContainer.appendChild(card);
    });
 }
 async function getUpcomingManga(){
    const topResponse = await fetch(`https://kitsu.io/api/edge/manga?filter[status]=upcoming&page[limit]=8`);
    const topData = await topResponse.json();
    console.log(topData);
    let cards = generateCards(topData);
    let cardContainer = document.getElementById("upcoming-card-container");
    cards.forEach(card => {
        cardContainer.appendChild(card);
    });
 }