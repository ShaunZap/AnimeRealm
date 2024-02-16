document.addEventListener('DOMContentLoaded', function () {
    getNav();
 });
 function getNav(){
 
    fetch('../../mangaNav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar').innerHTML = html;
    });
 }

 let cardContainer = document.getElementById("results-container");          
 cardContainer.innerHTML = `<img src="assets/images/allanime.jpg" alt="Manga" class="d-block" style="width:100%; opacity:0.7">`

 document.getElementById("submit").addEventListener("click", function(){
    searchQuery = document.getElementById("search").value;
    console.log(searchQuery);
    if(searchQuery == "")
        console.log("Does not exist");
    else
    getResults(searchQuery);
 })
 async function getResults(searchInput){
    const response = await fetch(`https://kitsu.io/api/edge/manga?filter[text]=${searchInput}`);
    const searchData = await response.json();
    console.log(searchData);
    if(searchData.meta.count == 0){
        cardContainer.innerHTML = `<img src="assets/images/notFoundManga.jpg" alt="Not Found"  style="width:100%; opacity:0.7">`;
    }else{
        cardContainer.innerHTML = "";
        let cards = generateCards(searchData);
        cards.forEach(card => {
        cardContainer.appendChild(card);
    });
    }   
 }