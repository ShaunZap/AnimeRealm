function generateCards(data) {
  return data.data.map(cardElement => {
    const attributes = cardElement.attributes;
    const animeTitle = titleOf(attributes);

    const episodeOrStatus = attributes.episodeCount ? `Episode: ${attributes.episodeCount}` : `Status: ${attributes.status}`;
    const thumbnail = attributes.posterImage.small || attributes.coverImage.small;
    const animeMangaId = cardElement.id;
    const animeMangaType = cardElement.type;

    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("animanid", animeMangaId);
    card.setAttribute("animantype", animeMangaType);
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.innerHTML = `
      <img src="${thumbnail}" alt="" class="card-image" loading="lazy"/>
      <div class="card-title">${animeTitle}</div>
      <div class="card-content">
        <div class="rating">Rank: ${attributes.popularityRank}</div>
        <div class="episodeOrStaus">${episodeOrStatus}</div>
      </div>
      <button class="watchlist-add-btn" data-id="${animeMangaId}" data-type="${animeMangaType}" data-title="${animeTitle}" data-thumb="${thumbnail}">Add to List</button>
    `;

    card.querySelector('.watchlist-add-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const btn = e.currentTarget;
      const { id, type, title, thumb } = btn.dataset;
      try {
        const response = await apiFetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, type, title, thumbnail: thumb })
        });
        if (response.ok) {
          btn.textContent = 'Added';
          btn.disabled = true;
          showToast('Added to watchlist', 'success');
        } else if (response.status === 401) {
          logout();
        } else {
          showToast('Could not add to watchlist', 'error');
        }
      } catch (err) {
        showToast('Network error', 'error');
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        openInfo(card.getAttribute('animanid'), card.getAttribute('animantype'));
      }
    });

    return card;
  });
}