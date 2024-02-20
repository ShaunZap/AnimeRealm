document.addEventListener('DOMContentLoaded', function () {
    getNav();
    getTopManga();
    getUpcomingManga();
 });
 function getNav(){
 
    fetch('../../pages/mangaNav.html')
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
         const url = `../../pages/mangaInfo.html?id=${aniManId}&type=${aniManType}`;
         console.log('Opening URL:', url);
         window.open(url, '_blank');
     });
 });
 
 async function getTopManga(){
    const topResponse = await fetch(`https://kitsu.io/api/edge/manga?sort=popularityRank&page[limit]=8`);
    const topData = await topResponse.json();
    console.log(topData);
    let cards = generateCards(topData);
    let cardContainer = document.getElementById("top-manga-card-container");
    cards.forEach(card => {
        cardContainer.appendChild(card);
        
        card.addEventListener('click', () => {
            const aniManId = card.getAttribute('animanid');
            const aniManType = card.getAttribute('animantype');
            console.log('Clicked card with animanid:', aniManId, aniManType);
            const url = `../../pages/mangaInfo.html?id=${aniManId}&type=${aniManType}`;
            console.log('Opening URL:', url);
            window.open(url, '_blank');
        });
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

        card.addEventListener('click', () => {
            const aniManId = card.getAttribute('animanid');
            const aniManType = card.getAttribute('animantype');
            console.log('Clicked card with animanid:', aniManId, aniManType);
            const url = `../../pages/mangaInfo.html?id=${aniManId}&type=${aniManType}`;
            console.log('Opening URL:', url);
            window.open(url, '_blank');
        });
    });
 }