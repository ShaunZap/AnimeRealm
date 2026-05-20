document.addEventListener('DOMContentLoaded', function () {
    getNav();
    getTopAnime();
    getUpcomingAnime();

 });
function getNav(){
    fetch('../../pages/animeNav.html') // Use mangaNav.html for the manga pages
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar').innerHTML = html;
        
        // Attach event listener after the HTML is injected
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault(); 
                
                // Remove the JWT token from storage
                localStorage.removeItem('token'); 
                
                // Redirect to the default public login route
                window.location.href = '/'; 
            });
        }
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
