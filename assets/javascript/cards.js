
function generateCards(data){
    return data.data.map(cardElement => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
        <img src="${cardElement.attributes.posterImage.small}" alt="" class="card-image"/>
        <div class="card-title">${cardElement.attributes.titles.en}</div>
        <div class="content">
          <div class="rating">Rating: ${cardElement.attributes.popularityRank}</div>
          <div class="episodeCount">${cardElement.attributes.episodeCount}</div>
        </div>
        `;
        return card;
    });
}