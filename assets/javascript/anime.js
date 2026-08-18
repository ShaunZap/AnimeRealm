document.addEventListener('DOMContentLoaded', function () {
    if (!requireAuth()) return;
    loadNav('nav.html', 'anime.html');
    getTopAnime();
    getTrendingAnime();
    getUpcomingAnime();
    loadContinueWatching();
});

document.querySelectorAll('.carousel-button').forEach(button => {
    button.addEventListener('click', function () {
        openInfo(this.getAttribute('animanid'), this.getAttribute('animantype'));
    });
});

async function getTopAnime() {
    const container = document.getElementById("top-anime-card-container");
    renderCards(container, 'anime?sort=popularityRank&page[limit]=8', getTopAnime);
}

async function getUpcomingAnime() {
    const container = document.getElementById("upcoming-card-container");
    renderCards(container, 'anime?filter[status]=current&page[limit]=8', getUpcomingAnime);
}

async function getTrendingAnime() {
    const container = document.getElementById("trending-card-container");
    renderCards(container, 'anime?sort=-userCount&page[limit]=8', getTrendingAnime);
}

async function loadContinueWatching() {
    const container = document.getElementById("continue-watching-container");
    const heading = document.getElementById("continue-watching-heading");
    const hideSection = () => {
        if (heading) heading.style.display = 'none';
        if (container) container.style.display = 'none';
    };
    if (!container) return;
    try {
        const response = await apiFetch('/api/progress');
        if (response.status === 401) {
            logout();
            return;
        }
        if (!response.ok) {
            hideSection();
            return;
        }
        const progress = await response.json();
        if (!progress.length) {
            hideSection();
            return;
        }
        const cards = progress.map(item => {
            const pct = item.total > 0 ? Math.round((item.current / item.total) * 100) : 0;
            return `
            <div class="card watch-card" data-id="${item.kitsuId}" data-type="${item.type}">
                <img src="${item.thumbnail || ''}" alt="${item.title}" class="card-image" loading="lazy"/>
                <div class="card-title">${item.title}</div>
                <div class="progress-track">
                    <div class="progress-fill" style="width:${pct}%"></div>
                </div>
                <div class="card-content"><span>${item.current}/${item.total}</span><span>${pct}%</span></div>
            </div>`;
        });
        container.innerHTML = cards.join('');
        container.querySelectorAll('.watch-card').forEach(card => {
            card.addEventListener('click', () => openInfo(card.dataset.id, card.dataset.type));
        });
    } catch (err) {
        hideSection();
    }
}

async function renderCards(container, query, retryFn) {
    container.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        container.appendChild(createSkeleton());
    }
    let data;
    try {
        data = await kitsu(query);
    } catch (err) {
        container.innerHTML = '';
        showErrorState(container, retryFn);
        return;
    }
    container.innerHTML = '';
    generateCards(data).forEach(card => {
        container.appendChild(card);
        card.addEventListener('click', () => {
            openQuickView(card.getAttribute('animanid'), card.getAttribute('animantype'));
        });
    });
}

function createSkeleton() {
    const div = document.createElement('div');
    div.className = 'card skeleton-card';
    div.innerHTML = '<div class="skeleton-image"></div><div class="skeleton-line"></div>';
    return div;
}

function showErrorState(container, retryFn) {
    const div = document.createElement('div');
    div.className = 'error-state';
    div.innerHTML = `<p>Could not load content.</p><button class="retry-btn">Retry</button>`;
    div.querySelector('.retry-btn').addEventListener('click', retryFn);
    container.appendChild(div);
}