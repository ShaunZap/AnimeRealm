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
 const carouselButtons = document.querySelectorAll('.carousel-button');
 carouselButtons.forEach(button => {
     button.addEventListener('click', function(){
         const aniManId = this.getAttribute('animanid');
         const aniManType = this.getAttribute('animantype');
         const url = `../../pages/animeInfo.html?id=${aniManId}&type=${aniManType}`;
         console.log('Opening URL:', url);
         window.open(url, '_blank');
     });
 });
 
 async function getTopAnime(){
    const topResponse = await fetch(`https://kitsu.io/api/edge/anime?sort=popularityRank&page[limit]=8`);
    const topData = await topResponse.json();
    console.log(topData);
    let cards = generateCards(topData);
    let cardContainer = document.getElementById("top-anime-card-container");
    cards.forEach(card => {
        cardContainer.appendChild(card);

        card.addEventListener('click', () => {
            const aniManId = card.getAttribute('animanid');
            const aniManType = card.getAttribute('animantype');
            console.log('Clicked card with animanid:', aniManId, aniManType);
            const url = `../../pages/animeInfo.html?id=${aniManId}&type=${aniManType}`;
            console.log('Opening URL:', url);
            window.open(url, '_blank');
        });
    });
 }
 async function getUpcomingAnime(){
    const topResponse = await fetch(`https://kitsu.io/api/edge/anime?filter[status]=current&page[limit]=8`);
    const topData = await topResponse.json();
    console.log(topData);
    let cards = generateCards(topData);
    let cardContainer = document.getElementById("upcoming-card-container");
    cards.forEach(card => {
        cardContainer.appendChild(card);

        card.addEventListener('click', () => {
            const aniManId = card.getAttribute('animanid');
            const aniManType = card.getAttribute('animantype');
            console.log('Clicked card with animanid:', aniManId, aniManType);
            const url = `../../pages/animeInfo.html?id=${aniManId}&type=${aniManType}`;
            console.log('Opening URL:', url);
            window.open(url, '_blank');
        });
    });
 }
