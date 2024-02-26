document.addEventListener('DOMContentLoaded', function () {
    getNav();
 });
 function getNav(){
 
    fetch('../../pages/mangaNav.html')
    .then(response => response.text())
    .then(html => {
        document.getElementById('navbar').innerHTML = html;
    });
 }

 let offset = 0;
 let count = 1;
 let totalOffsetValue;
 let searchpage; 
 let tempGenre;


 const cardContainer = document.getElementById("results-container");          
 const animeButtonContainer = document.createElement('div');
 const animeButtonContainer2 = document.createElement('div');
 animeButtonContainer.id = "animeContainer";
 animeButtonContainer2.id = "animeContainer2";

 document.body.appendChild(animeButtonContainer)
document.body.insertBefore(animeButtonContainer2, cardContainer);

 cardContainer.innerHTML = `<img src="../assets/images/allanime.jpg" alt="Manga" class="d-block" style="width:100%; opacity:0.7">`

 document.getElementById("submit").addEventListener("click", function(){
    sendData();
 })
 document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendData();
    }
});
document.getElementById('genre').addEventListener('change', function() {
    sendData();
});

function sendData(){
   const searchQuery = document.getElementById("search").value;
   const genre = document.getElementById('genre').value; 
    count = 1;
    offset = 0;
    console.log(searchQuery);
    if(searchQuery == "" && genre == "null")
    console.log("Not Found");
    else
    getResults(searchQuery, offset, genre);
}
 async function getResults(searchInput, offset, genre){
    let response;
    if(searchInput != '' && genre == 'null'){
        response = await fetch(`https://kitsu.io/api/edge/manga?filter[text]=${searchInput}&page[offset]=${offset}`);
    }
    else if(searchInput == '' && genre != 'null'){
        offset = offset+10;
        response = await fetch(`https://kitsu.io/api/edge/manga?filter[genres]=${genre}&page[offset]=${offset}`);
    }
    else if(searchInput != '' && genre != 'null'){
        offset = offset+10;
        response = await fetch(`https://kitsu.io/api/edge/manga?filter[text]=${searchInput}&page[offset]=${offset}`);
    }
    const searchData = await response.json();
    console.log(searchData, searchInput, offset);
    searchpage = searchInput;
    tempGenre = genre;

    //to get the last page number
    const url = searchData.links.last;
    console.log(url)
    const params = new URLSearchParams(url);
    console.log(params)
    const TempPageNumber = params.get("page[offset]");
    totalOffsetValue = TempPageNumber;
    console.log(totalOffsetValue)

    if(searchData.meta.count == 0){
        cardContainer.innerHTML = `<img src="../assets/images/notFoundManga.jpg" alt="Not Found"  style="width:100%; opacity:0.7">`;
        animeButtonContainer.innerHTML = " ";
    }else{
        cardContainer.innerHTML = "";
        let cards = generateCards(searchData);
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
    let buttonContent = `
    <button class="previous" onclick="prevPage()">Previous</button>
    <div id="count">Page ${count} </div>
    <button class="next" onclick="nextPage()">Next</button>
    `
    
    document.getElementById('gintoki-image').style.width = '60px';
    animeButtonContainer.innerHTML = buttonContent
    animeButtonContainer2.innerHTML = buttonContent
    }   
 }

 function nextPage(){
    console.log("next");
    if(offset < totalOffsetValue){
       offset = offset+10;
       count++;
        getResults(searchpage, offset, tempGenre)
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
    if(offset > 0){
        offset = offset-10;
       count--;
        getResults(searchpage, offset, tempGenre)
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