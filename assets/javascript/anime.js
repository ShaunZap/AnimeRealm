document.addEventListener('DOMContentLoaded', function () {
    getNav();
    getTopAnime();
 });
 function getNav(){
 
    fetch('../../animeNav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar').innerHTML = html;
    });
 }

 async function getTopAnime(){
    const topResponse = await fetch(`https://kitsu.io/api/edge/anime?sort=popularityRank`);
    const topData = await topResponse.json();
    console.log(topData);
    let cards = generateCards(topData);
    let cardContainer = document.getElementById("top-anime-card-container");
    cards.forEach(card => {
        cardContainer.appendChild(card);
    });
 }