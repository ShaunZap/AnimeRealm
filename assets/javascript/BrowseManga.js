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

 const cardContainer = document.getElementById("results-container");          
 const animeButtonContainer = document.createElement('div');
 const animeButtonContainer2 = document.createElement('div');
 animeButtonContainer.id = "animeContainer";
 animeButtonContainer2.id = "animeContainer2";

 document.body.appendChild(animeButtonContainer)
document.body.insertBefore(animeButtonContainer2, cardContainer);

 cardContainer.innerHTML = `<img src="../assets/images/allanime.jpg" alt="Manga" class="d-block" style="width:100%; opacity:0.7">`

 document.getElementById("submit").addEventListener("click", function(){
    searchQuery = document.getElementById("search").value;
    offset = 0;
    console.log(searchQuery);
    if(searchQuery == "")
        console.log("Does not exist");
    else
    getResults(searchQuery, offset);
 })
 document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchQuery = document.getElementById("search").value;
        offset = 0;
        console.log(searchQuery);
        if(searchQuery == "")
        console.log("Not Found");
        else
        getResults(searchQuery, offset);
    }
});
 async function getResults(searchInput, page){
    const response = await fetch(`https://kitsu.io/api/edge/manga?filter[text]=${searchInput}&page[offset]=${page}`);
    const searchData = await response.json();
    console.log(searchData, searchInput, page);
    searchpage = searchInput;

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
    document.getElementById('gintoki-image').style.width = '60px';
    animeButtonContainer.innerHTML = `
    <button class="previous" onclick="prevPage()">Previous</button>
    <div id="count">Page ${count} </div>
    <button class="next" onclick="nextPage()">Next</button>
`
    animeButtonContainer2.innerHTML = `
    <button class="previous" onclick="prevPage()">Previous</button>
    <div id="count">Page ${count} </div>
    <button class="next" onclick="nextPage()">Next</button>
`
    }   
 }

 function nextPage(){
    console.log("next");
    if(offset < totalOffsetValue){
       offset = offset+10;
       count++;
        getResults(searchpage, offset)
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
        getResults(searchpage, offset)
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