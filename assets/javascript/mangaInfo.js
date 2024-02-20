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

 infoContainer = document.getElementById("info-container");

 function getNav(){
 
    fetch('../../pages/mangaNav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar').innerHTML = html;
    });
 }

 async function displayInfo(id, type) {
    //Using Kitsu Api to get the manga based ont he type and the id
    const response = await fetch(`https://kitsu.io/api/edge/${type}/${id}`);
    const data = await response.json();
    console.log(id, type);
    console.log(data);
    
    //storing each property from the object for more readability
    const infoResult = data.data.attributes;
    const animanTitle = infoResult.titles.en || infoResult.titles.en_us || infoResult.titles.en_jp;
    const PopularityScore = infoResult.popularityRank;
    const rank = infoResult.ratingRank;
    const japaneseName = infoResult.titles.en_jp;
    const startDate = infoResult.startDate;
    const endDate = infoResult.endDate;
    const status = infoResult.status;
    const animanType = type;
    const synopsis = infoResult.description || infoResult.synopsis;
    const serializations = infoResult.serialization;
    const averageRating = infoResult.averageRating;
    const ageRating = infoResult.ageRating;

    //using jikan api to get the author using the animanTitle
    //since kitsu doesnt provide it 
    const response2 = await fetch(`https://api.jikan.moe/v4/manga?q=${animanTitle}&limit=1`);
    const data2 = await response2.json();
    console.log(data2);
    const authors = data2.data[0].authors;
    if (authors && authors.length > 0) {
        console.log(authors[0].name);
    } else {
        console.log("No authors found.");
    }
    const animanAuthors = authors[0].name;
    
    infoContainer.innerHTML = `
    <div class="info-image">
     <img src="${infoResult.posterImage.large}" alt="Animeimage">
    </div>
    <div class="info-content">
        <div class="animan-title">${animanTitle}</div>
        <div class="animan-content">
            <div class="animan-score">Score: ${PopularityScore} (Polularity)</div>
            <div class="animan-rank">Rank: ${rank} (Critique)</div>
            <div>Japanese Name: ${japaneseName}</div>
            <div>Avg Rating: ${averageRating}</div>
            <div>Age Rating: ${ageRating}</div>
            <div>Start Date: ${startDate}</div>
            <div>End Date: ${endDate}</div>
            <div>Authors: ${animanAuthors}</div>
            <div>Publisher: ${serializations}</div>
            <div>Type: ${animanType}</div>
            <div>Status: ${status}</div>
        </div>
    </div>  
   `
   synopsisContainer = document.getElementById("synopsis-container");
   synopsisContainer.innerHTML = `
   <div class="synopsis-title">Synopsis</div>
   <div class="synopsis">${synopsis}</div>
   `;
}
