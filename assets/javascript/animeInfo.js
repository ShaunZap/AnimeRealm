document.addEventListener('DOMContentLoaded', function () {
    getNav();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type');
    displayInfo(id, type);
 });
 infoContainer = document.getElementById("info-container");
 function getNav(){
 
    fetch('../../pages/animeNav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar').innerHTML = html;
    });
}
async function displayInfo(id, type) {
    const response = await fetch(`https://kitsu.io/api/edge/${type}/${id}`);
    const data = await response.json();
    console.log(id, type);
    
    const infoResult = data.data.attributes;
    const animanTitle = infoResult.titles.en || infoResult.titles.en_us || infoResult.titles.en_jp;
    const PopularityScore = infoResult.popularityRank;
    const rank = infoResult.ratingRank;
    const japaneseName = infoResult.titles.en_jp;
    const episodeCount = infoResult.episodeCount;
    const episodeLength = infoResult.episodeLength;
    const startDate = infoResult.startDate;
    const endDate = infoResult.endDate;
    const status = infoResult.status;
    const animanType = type;
    const trailer = `https://www.youtube.com/watch?v=${infoResult.youtubeVideoId}`
    const synopsis = infoResult.description || infoResult.synopsis;

    infoContainer.innerHTML = `
    <div class="info-image">
     <img src="${infoResult.posterImage.large}" alt="Animeimage">
    </div>
    <div class="info-content">
        <div class="animan-title">${animanTitle}</div>
        <div class="animan-content">
            <div class="animan-score">Score: ${PopularityScore}</div>
            <div class="animan-rank">Rank: ${rank}</div>
            <div class="japanese-name">Japanese Name: ${japaneseName}</div>
            <div class="animan-episodeCount">Episodes: ${episodeCount}</div>
            <div class="animan-episodeLength">Episode Duration: ${episodeLength}</div>
            <div class="animan-start-year">Start Date: ${startDate}</div>
            <div class="animan-end-year">End Date: ${endDate}</div>
            <div class="animan-type">Type: ${animanType}</div>
            <div class="animan-status">Status: ${status}</div>
            <a class="animan-trailer" href="${trailer}" target="_blank">Watch ${animanTitle} Trailer</a>
        </div>
    </div>
    <div class="synopsis-container">
        <div class="synopsis-title">Synopsis</div>
        <div class="synopsis">${synopsis}</div>
   `
}
