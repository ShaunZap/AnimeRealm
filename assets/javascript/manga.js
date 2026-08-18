document.addEventListener('DOMContentLoaded', function () {
    if (!requireAuth()) return;
    loadNav('nav.html', 'manga.html');
    getTopManga();
    getUpcomingManga();
});

document.querySelectorAll('.carousel-button').forEach(button => {
    button.addEventListener('click', function () {
        openInfo(this.getAttribute('animanid'), this.getAttribute('animantype'));
    });
});

async function getTopManga() {
    const container = document.getElementById("top-manga-card-container");
    renderCards(container, 'manga?sort=popularityRank&page[limit]=8', getTopManga);
}

async function getUpcomingManga() {
    const container = document.getElementById("upcoming-card-container");
    renderCards(container, 'manga?filter[status]=upcoming&page[limit]=8', getUpcomingManga);
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