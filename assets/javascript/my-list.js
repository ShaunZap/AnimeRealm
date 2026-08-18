document.addEventListener('DOMContentLoaded', function () {
    if (!requireAuth()) return;
    loadNav('nav.html', 'my-list.html');
    loadWatchlist();
});

async function loadWatchlist() {
    const container = document.getElementById('watchlist-container');
    let response;
    try {
        response = await apiFetch('/api/watchlist');
        if (response.status === 401) {
            logout();
            return;
        }
        if (!response.ok) throw new Error('failed');
    } catch (err) {
        showErrorState(container, loadWatchlist);
        return;
    }
    const items = await response.json();
    if (!items.length) {
        container.innerHTML = `
        <div class="empty-state">
            <p>Your watchlist is empty.</p>
            <a class="empty-link" href="BrowseAnime.html">Browse Anime</a>
            <a class="empty-link" href="BrowseManga.html">Browse Manga</a>
        </div>`;
        return;
    }

    const animes = items.filter(i => i.type === 'anime');
    const mangas = items.filter(i => i.type === 'manga');

    let html = '';
    if (animes.length) {
        html += `<div class="section-heading">Anime</div><div class="cards-grid">${renderRows(animes)}</div>`;
    }
    if (mangas.length) {
        html += `<div class="section-heading">Manga</div><div class="cards-grid">${renderRows(mangas)}</div>`;
    }
    container.innerHTML = html;

    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const { id, type } = btn.dataset;
            try {
                const res = await apiFetch(`/api/watchlist?id=${id}&type=${type}`, { method: 'DELETE' });
                if (res.ok) {
                    showToast('Removed from watchlist', 'success');
                    loadWatchlist();
                } else {
                    showToast('Could not remove item', 'error');
                }
            } catch (err) {
                showToast('Network error', 'error');
            }
        });
    });

    container.querySelectorAll('.list-card').forEach(card => {
        card.addEventListener('click', () => openInfo(card.dataset.id, card.dataset.type));
    });
}

function renderRows(items) {
    return items.map(item => `
    <div class="card list-card" data-id="${item.kitsuId}" data-type="${item.type}" role="button" tabindex="0">
        <img src="${item.thumbnail || ''}" alt="${item.title}" class="card-image" loading="lazy"/>
        <div class="card-title">${item.title}</div>
        <button class="remove-btn" data-id="${item.kitsuId}" data-type="${item.type}">Remove</button>
    </div>`).join('');
}

function showErrorState(container, retryFn) {
    container.innerHTML = `<div class="error-state"><p>Could not load your list.</p><button class="retry-btn">Retry</button></div>`;
    container.querySelector('.retry-btn').addEventListener('click', retryFn);
}