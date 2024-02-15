
function generateCards(data){
  return data.data.map(cardElement => {
    const attributes = cardElement.attributes;
    const animeTitle = attributes.titles.en || attributes.titles.en_us;
    const episodeOrStatus = attributes.episodeCount ? `Episode: ${attributes.episodeCount}` : `Status: ${attributes.status}`;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${attributes.posterImage.small}" alt="" class="card-image"/>
      <div class="card-title">${animeTitle}</div>
      <div class="card-content">
        <div class="rating">Rating: ${attributes.popularityRank}</div>
        <div class="episodeOrStaus">${episodeOrStatus}</div>
      </div>
    `;
    return card;
  });
}