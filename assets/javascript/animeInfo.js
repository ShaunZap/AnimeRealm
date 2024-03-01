
infoContainer = document.getElementById("info-container");

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(()=>{
        document.getElementById('splash-screen').classList.toggle('fade');
    }, 2000)
    getNav();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type');
    displayInfo(id, type);
 });
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
    console.log(data);
    console.log('id:', id);
    console.log('type:', type);
    console.log('data:', data);

    if (!data.data || !data.data.attributes) {
        console.error('Invalid data format:', data);
        return;
    }
    
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
    const ageRating = infoResult.ageRating +" , "+ infoResult.ageRatingGuide;

    infoContainer.innerHTML = `
    <div class="info-image">
     <img src="${infoResult.posterImage.large}" alt="Animeimage">
    </div>
    <div class="info-content">
        <div class="animan-title">${animanTitle}</div>
        <div class="animan-content">
            <div class="animan-score">Score: ${PopularityScore} (Popularity)</div>
            <div class="animan-rank">Rank: ${rank} (Critique)</div>
            <div class="japanese-name">Japanese Name: ${japaneseName}</div>
            <div>Age Rating: ${ageRating}</div>
            <div class="animan-episodeCount">Episodes: ${episodeCount}</div>
            <div class="animan-episodeLength">Episode Duration: ${episodeLength}</div>
            <div class="animan-start-year">Start Date: ${startDate}</div>
            <div class="animan-end-year">End Date: ${endDate}</div>
            <div class="animan-type">Type: ${animanType}</div>
            <div class="animan-status">Status: ${status}</div>
            <a class="animan-trailer" href="${trailer}" target="_blank">Watch trailer</a>
        </div>
    </div>  
   `
   synopsisContainer = document.getElementById("synopsis-container");
   synopsisContainer.innerHTML = `
   <div class="synopsis-title">Synopsis</div>
   <div class="synopsis">${synopsis}</div>
   `;

   const episodeListLink = data.data.relationships.episodes.links.related;
//    console.log(episodeListLink);
   getEpisodeList(episodeListLink)
}

let currentPage = 1;
let currentNextLink, currentPrevLink;

async function getEpisodeList(link) {
    const response = await fetch(`${link}`);
    const data = await response.json();
    currentNextLink = data.links.next;
    currentPrevLink = data.links.prev;

    const animeAccordian = document.getElementById('anime-accordian');
    animeAccordian.innerHTML = " ";
    data.data.forEach((episode) => {
        const episodeInfo = episode.attributes;
        const episodeTitle = episodeInfo.canonicalTitle || episodeInfo.titles.en_us || episodeInfo.titles.en_jp;
        const episodeSummary = episodeInfo.description;
        const episodeNumber = episodeInfo.number;
        console.log(episodeInfo)
        animeAccordian.innerHTML += `
        <div class="accordion-item ">
        <h2 class="accordion-header" id="flush-heading${episodeNumber}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${episodeNumber}" aria-expanded="false" aria-controls="flush-collapse${episodeNumber}">
             Episode ${episodeNumber} : ${episodeTitle}
            </button>
        </h2>
        <div id="flush-collapse${episodeNumber}" class="accordion-collapse collapse" aria-labelledby="flush-heading${episodeNumber}" data-bs-parent="#anime-accordian">
            <div class="accordion-body">${episodeSummary}</div>
        </div>
    </div>
      `;
    });
    const pagination = document.getElementById("pagination-container");
    pagination.innerHTML = `
        <button id="previous" onclick="previous()"><<</button>
            <div id="count">Page: ${currentPage}</div>
        <button id="next" onclick="next()">>></button>
    `;
}

function next() {
    if (currentNextLink) {
        currentPage++;
        getEpisodeList(currentNextLink);
    } else {
        const next = document.getElementById('next')
        next.style.opacity = 0.4;
        next.disabled = true;
    }
}

function previous() {
    if (currentPrevLink) {
        currentPage--;
        getEpisodeList(currentPrevLink);
    } else {
        const previous = document.getElementById('previous')
        previous.style.opacity = 0.4;
        previous.disabled = true;
    }
}
