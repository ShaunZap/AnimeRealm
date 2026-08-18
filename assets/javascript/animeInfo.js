document.addEventListener('DOMContentLoaded', function () {
    if (!requireAuth()) return;
    setTimeout(() => {
        document.getElementById('splash-screen').classList.toggle('fade');
    }, 2000);
    loadNav('nav.html', 'animeInfo.html');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type');
    displayInfo(id, type);
});

let currentPage = 1;
let currentNextLink = null;
let currentPrevLink = null;

async function displayInfo(id, type) {
    if (!id || !type) return;
    currentPage = 1;
    currentNextLink = null;
    currentPrevLink = null;

    showLoading('info-container');

    let data;
    try {
        data = await kitsu(`${type}/${id}`);
    } catch (err) {
        showError('info-container', () => displayInfo(id, type));
        return;
    }

    const infoResult = data.data.attributes;
    const animanTitle = titleOf(infoResult);
    const PopularityScore = infoResult.popularityRank;
    const rank = infoResult.ratingRank;
    const japaneseName = infoResult.titles.en_jp;
    const episodeCount = infoResult.episodeCount;
    const episodeLength = infoResult.episodeLength;
    const startDate = infoResult.startDate;
    const endDate = infoResult.endDate;
    const status = infoResult.status;
    const synopsis = infoResult.description || infoResult.synopsis;
    const ageRating = infoResult.ageRating ? infoResult.ageRating + ' , ' + (infoResult.ageRatingGuide || '') : 'N/A';
    const trailerId = infoResult.youtubeVideoId;

    const infoContainer = document.getElementById("info-container");
    infoContainer.innerHTML = `
    <div class="info-image">
     <img src="${infoResult.posterImage.large}" alt="${animanTitle} poster">
    </div>
    <div class="info-content">
        <div class="animan-title">${animanTitle}</div>
        <div class="animan-content">
            <div class="animan-score">Score: ${PopularityScore} (Popularity)</div>
            <div class="animan-rank">Rank: ${rank} (Critique)</div>
            <div class="japanese-name">Japanese Name: ${japaneseName}</div>
            <div>Age Rating: ${ageRating}</div>
            <div class="animan-episodeCount">Episodes: ${episodeCount || 'N/A'}</div>
            <div class="animan-episodeLength">Episode Duration: ${episodeLength || 'N/A'}</div>
            <div class="animan-start-year">Start Date: ${startDate || 'N/A'}</div>
            <div class="animan-end-year">End Date: ${endDate || 'N/A'}</div>
            <div class="animan-type">Type: ${type}</div>
            <div class="animan-status">Status: ${status}</div>
            ${trailerId ? `<a class="animan-trailer" href="https://www.youtube.com/watch?v=${trailerId}" target="_blank" rel="noopener">Watch trailer</a>` : ''}
            <button class="animan-trailer" id="watchlist-toggle">Add to Watchlist</button>
        </div>
    </div>
   `;

    const synopsisContainer = document.getElementById("synopsis-container");
    synopsisContainer.innerHTML = `
   <div class="synopsis-title">Synopsis</div>
   <div class="synopsis">${synopsis || 'No synopsis available.'}</div>
   `;

    setupWatchlistToggle(id, type, animanTitle, infoResult.posterImage.small);
    setupTrailerEmbed(trailerId);
    loadCharacters(id, type);
    setupProgress(id, type, animanTitle, infoResult.posterImage.small, episodeCount);
    setupReviews(id, type);
    loadRelated(id, type, data.data.relationships);

    const episodeListLink = data.data.relationships && data.data.relationships.episodes
        ? data.data.relationships.episodes.links.related
        : null;
    if (episodeListLink) {
        getEpisodeList(episodeListLink);
    } else {
        document.getElementById("episodeList-container").innerHTML = '';
    }
}

function setupTrailerEmbed(trailerId) {
    const trailerContainer = document.getElementById('trailer-container');
    if (!trailerContainer) return;
    if (!trailerId) {
        trailerContainer.style.display = 'none';
        return;
    }
    trailerContainer.innerHTML = `
    <div class="synopsis-title">Trailer</div>
    <div class="trailer-embed">
        <iframe src="https://www.youtube.com/embed/${trailerId}" title="Trailer"
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
    </div>
    `;
}

async function loadCharacters(id, type) {
    const container = document.getElementById('characters-container');
    if (!container) return;
    try {
        const data = await kitsu(`${type}/${id}/characters`);
        const list = (data.data || []).filter(item => item.relationships && item.relationships.character);
        if (!list.length) {
            container.style.display = 'none';
            return;
        }
        const cards = await Promise.all(list.slice(0, 12).map(async item => {
            const charLink = item.relationships.character.links.related;
            const charData = await kitsu(charLink.replace('https://kitsu.io/api/edge/', ''));
            const char = charData.data.attributes;
            return `
            <div class="character-card">
                <img src="${(char.image && char.image.original) || ''}" alt="${char.name}" loading="lazy">
                <div class="character-name">${char.name}</div>
            </div>`;
        }));
        container.innerHTML = `<div class="synopsis-title">Characters</div><div class="characters-grid">${cards.join('')}</div>`;
    } catch (err) {
        container.style.display = 'none';
    }
}

async function loadRelated(id, type, relationships) {
    const container = document.getElementById('related-container');
    if (!container) return;
    container.innerHTML = '<div class="loading-spinner"></div>';
    let genreName = null;
    try {
        if (relationships && relationships.genres) {
            const genreData = await kitsu(relationships.genres.links.related.replace('https://kitsu.io/api/edge/', ''));
            const genres = genreData.data || [];
            if (genres.length) {
                const english = genres.map(g => g.attributes.name);
                genreName = english[0];
            }
        }
        if (!genreName) {
            container.style.display = 'none';
            return;
        }
        const data = await kitsu(type, `filter[genres]=${encodeURIComponent(genreName)}&page[limit]=8`);
        const related = (data.data || []).filter(item => String(item.id) !== String(id));
        if (!related.length) {
            container.style.display = 'none';
            return;
        }
        container.innerHTML = `<div class="synopsis-title">Related Titles</div>`;
        const grid = document.createElement('div');
        grid.className = 'cards-grid';
        generateCards({ data: related.slice(0, 6) }).forEach(card => {
            grid.appendChild(card);
            card.addEventListener('click', () => {
                openInfo(card.getAttribute('animanid'), card.getAttribute('animantype'));
            });
        });
        container.appendChild(grid);
    } catch (err) {
        container.style.display = 'none';
    }
}

async function getEpisodeList(link) {
    let data;
    try {
        const response = await fetch(link);
        if (!response.ok) throw new Error('episodes request failed');
        data = await response.json();
    } catch (err) {
        showError('anime-accordian', () => getEpisodeList(link));
        return;
    }
    currentNextLink = data.links.next || null;
    currentPrevLink = data.links.prev || null;

    const animeAccordian = document.getElementById('anime-accordian');
    animeAccordian.innerHTML = " ";
    (data.data || []).forEach((episode) => {
        const episodeInfo = episode.attributes;
        const episodeTitle = episodeInfo.canonicalTitle || episodeInfo.titles.en_us || episodeInfo.titles.en_jp || 'Episode';
        const episodeSummary = episodeInfo.description || 'No summary available.';
        const episodeNumber = episodeInfo.number;
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
        <button id="previous" onclick="previous()"><</button>
            <div id="count">Page: ${currentPage}</div>
        <button id="next" onclick="next()">></button>
    `;
}

function next() {
    if (currentNextLink) {
        currentPage++;
        getEpisodeList(currentNextLink);
    } else {
        const nextBtn = document.getElementById('next');
        if (nextBtn) {
            nextBtn.style.opacity = 0.4;
            nextBtn.disabled = true;
        }
    }
}

function previous() {
    if (currentPrevLink) {
        currentPage--;
        getEpisodeList(currentPrevLink);
    } else {
        const prevBtn = document.getElementById('previous');
        if (prevBtn) {
            prevBtn.style.opacity = 0.4;
            prevBtn.disabled = true;
        }
    }
}

async function setupWatchlistToggle(id, type, title, thumbnail) {
    const btn = document.getElementById('watchlist-toggle');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        try {
            const response = await apiFetch('/api/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, title, thumbnail })
            });
            if (response.ok) {
                showToast('Added to watchlist', 'success');
            } else if (response.status === 401) {
                logout();
            } else {
                showToast('Could not update watchlist', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    });
}

function showLoading(id) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="loading-spinner"></div>';
}

function showError(id, retryFn) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div class="error-state"><p>Something went wrong while loading.</p><button class="retry-btn">Retry</button></div>`;
    const btn = el.querySelector('.retry-btn');
    if (btn) btn.addEventListener('click', retryFn);
}

let currentProgress = 0;

async function setupProgress(id, type, title, thumbnail, total) {
    const container = document.getElementById('progress-container');
    if (!container) return;
    try {
        const response = await apiFetch('/api/progress');
        if (response.status === 401) {
            logout();
            return;
        }
        const items = await response.json();
        const existing = items.find(item => item.kitsuId === id && item.type === type);
        currentProgress = existing ? existing.current : 0;
    } catch (err) {
        currentProgress = 0;
    }
    const safeTotal = total || 0;
    renderProgress(container, currentProgress, safeTotal, id, type, title, thumbnail);
}

function renderProgress(container, current, total, id, type, title, thumbnail) {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    container.innerHTML = `
    <div class="synopsis-title">Track Progress</div>
    <div class="progress-controls">
        <div class="progress-track">
            <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <div class="progress-info"><span>${current}${total ? ' / ' + total : ''} episodes</span><span>${pct}%</span></div>
        <div class="progress-actions">
            <button class="progress-btn" id="minus-episode">-1</button>
            <button class="progress-btn" id="plus-episode">+1</button>
            <button class="progress-btn" id="save-progress">Save</button>
        </div>
    </div>`;

    const plus = document.getElementById('plus-episode');
    const minus = document.getElementById('minus-episode');
    const save = document.getElementById('save-progress');

    plus.addEventListener('click', () => {
        current = total > 0 ? Math.min(current + 1, total) : current + 1;
        renderProgress(container, current, total, id, type, title, thumbnail);
    });
    minus.addEventListener('click', () => {
        current = Math.max(0, current - 1);
        renderProgress(container, current, total, id, type, title, thumbnail);
    });
    save.addEventListener('click', async () => {
        try {
            const response = await apiFetch('/api/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, title, thumbnail, current, total })
            });
            if (response.ok) {
                showToast('Progress saved', 'success');
            } else if (response.status === 401) {
                logout();
            } else {
                showToast('Could not save progress', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    });
}

async function setupReviews(id, type) {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    container.innerHTML = '<div class="loading-spinner"></div>';
    let reviews = [];
    try {
        const response = await fetch(`/api/reviews?id=${id}&type=${type}`);
        if (response.ok) {
            reviews = await response.json();
        }
    } catch (err) {
        reviews = [];
    }

    const form = `
    <div class="review-form">
        <h3>Leave a Review</h3>
        <div class="rating-input">
            <label for="review-rating">Rating (1-10):</label>
            <input type="number" id="review-rating" min="1" max="10" value="7">
        </div>
        <textarea id="review-comment" placeholder="Share your thoughts..." rows="3"></textarea>
        <button class="progress-btn" id="submit-review">Submit Review</button>
    </div>`;

    const list = reviews.length
        ? `<div class="reviews-list">${reviews.map(r => `
            <div class="review-item">
                <div class="review-top">
                    <span class="review-author">${r.username}</span>
                    <span class="review-rating">${r.rating}/10</span>
                </div>
                <div class="review-comment">${r.comment || 'No comment.'}</div>
            </div>`).join('')}</div>`
        : `<div class="no-reviews">No reviews yet. Be the first!</div>`;

    container.innerHTML = `
    <div class="synopsis-title">Reviews</div>
    <div class="reviews-body">
        ${form}
        ${list}
    </div>`;

    const submit = document.getElementById('submit-review');
    if (submit) {
        submit.addEventListener('click', async () => {
            const rating = parseInt(document.getElementById('review-rating').value, 10);
            const comment = document.getElementById('review-comment').value.trim();
            if (!rating || rating < 1 || rating > 10) {
                showToast('Rating must be between 1 and 10', 'warn');
                return;
            }
            try {
                const response = await apiFetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, type, rating, comment })
                });
                if (response.ok) {
                    showToast('Review submitted', 'success');
                    setupReviews(id, type);
                } else if (response.status === 401) {
                    logout();
                } else {
                    showToast('Could not submit review', 'error');
                }
            } catch (err) {
                showToast('Network error', 'error');
            }
        });
    }
}