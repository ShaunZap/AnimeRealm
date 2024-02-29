document.addEventListener('DOMContentLoaded', function () {
    getNav();
 });
 function getNav(){
 
    fetch('../../pages/animeNav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar').innerHTML = html;
    });
 }

let currentPage = 1;
let totalPageNumber;
let searchpage;
let tempGenre;

const cardContainer = document.getElementById("results-container");     
const animeButtonContainer = document.createElement('div');
const animeButtonContainer2 = document.createElement('div');
animeButtonContainer.id = "animeContainer";
animeButtonContainer2.id = "animeContainer2";

document.body.appendChild(animeButtonContainer)   
document.body.insertBefore(animeButtonContainer2, cardContainer);

cardContainer.innerHTML = `<img src="../assets/images/allanime.jpg" alt="Anime"  style="width:100%; opacity:0.7">`

 document.getElementById("submit").addEventListener("click", function(){
    document.getElementById('genre').value = "null";
    sendData();
 })
 document.getElementById('search').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('genre').value = "null";
        sendData();
    }
});
document.getElementById('genre').addEventListener('change', function() {
    document.getElementById("search").value = " ";
    sendDataByGenre();
});
function sendData(){
    const searchQuery = document.getElementById("search").value;
    currentPage = 1;
    console.log(searchQuery);
    if(searchQuery == "")
    console.log("Not Found");
    else
    getResults(searchQuery, currentPage, "null");
}
function sendDataByGenre(){
    const genre = document.getElementById('genre').value;
    currentPage = 1;
    console.log(genre);
    if(genre == "null")
    console.log("Not Selected");
    else
    getResults("", currentPage, genre);
}
 async function getResults(searchInput, page, genre){
    let response;
    tempGenre = genre;
    if(searchInput != '' && genre == 'null'){
        response = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${searchInput}&page[number]=${page}`);
    }
    else if(searchInput == '' && genre != 'null'){
        response = await fetch(`https://kitsu.io/api/edge/anime?filter[genres]=${genre}&page[number]=${page}`);
    }
    const searchData = await response.json();
    console.log(searchData, searchInput, page, genre);
    searchpage = searchInput;
    
    //to get the last page number
    const url = searchData.links.last;
    const params = new URLSearchParams(url);
    const TempPageNumber = params.get("page[number]");
    totalPageNumber = TempPageNumber;
    console.log(totalPageNumber)
    
    if(searchData.meta.count == 0){
        cardContainer.innerHTML = `<img src="../assets/images/notFoundAnime.jpg" alt="Not Found"  style="width:100%; opacity:0.7">`;
        animeButtonContainer.innerHTML = " ";
        animeButtonContainer2.innerHTML = " ";
    }else{
        cardContainer.innerHTML = "";
        let cards = generateCards(searchData);
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
    document.getElementById('gintoki-image').style.width = '60px';

    const buttonContent = `
    <button class="previous" onclick="prevPage()">Previous</button>
    <div id="count">Page ${currentPage} </div>
    <button class="next" onclick="nextPage()">Next</button>
    `
    animeButtonContainer.innerHTML = buttonContent;
    animeButtonContainer2.innerHTML = buttonContent;
    }   
 }
 function nextPage(){
    console.log("next");
    if(currentPage < totalPageNumber){
        currentPage++;
        getResults(searchpage, currentPage, tempGenre)
    }
    else{
        console.log("over")
        const next = document.querySelectorAll(".next");
        next.forEach(element => {
            element.disabled = true;
            element.style.opacity = 0.2;
        });
    }
 }
 function prevPage(){
    console.log("prev");
    if(currentPage > 1){
        currentPage--;
        getResults(searchpage, currentPage, tempGenre)
    }
    else{
        console.log("over")
        const prev = document.querySelectorAll(".previous");
        prev.forEach(element => {
            element.disabled = true;
            element.style.opacity = 0.2;
        });
    }
 }