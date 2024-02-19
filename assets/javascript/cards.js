
function generateCards(data){
  return data.data.map(cardElement => {
    const attributes = cardElement.attributes;
    const animeTitle = attributes.titles.en || attributes.titles.en_us || attributes.titles.en_jp;
    const episodeOrStatus = attributes.episodeCount ? `Episode: ${attributes.episodeCount}` : `Status: ${attributes.status}`;
    const thumbnail = attributes.posterImage.small || attributes.coverImage.small;
    const animeMangaId = cardElement.id;
    const animeMangaType = cardElement.type;
    console.log(animeMangaId, animeMangaType);
    
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("animanid", animeMangaId);
    card.setAttribute("animantype", animeMangaType);
    card.innerHTML = `
      <img src="${thumbnail}" alt="" class="card-image"/>
      <div class="card-title">${animeTitle}</div>
      <div class="card-content">
        <div class="rating">Rank: ${attributes.popularityRank}</div>
        <div class="episodeOrStaus">${episodeOrStatus}</div>
      </div>
    `;
    return card;
  });
}