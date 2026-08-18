const cardContainer = document.getElementById("results-container");
const filterBar = document.getElementById("filter-bar");
const PAGE_LIMIT = 12;
let currentPage = 1;
let totalPages = null;
let searchpage = '';
let tempGenre = 'null';
let tempSort = '';

document.addEventListener('DOMContentLoaded', function () {
    if (!requireAuth()) return;
    loadNav('nav.html', 'BrowseManga.html');
    setupSearchUI();
    loadRecentSearches();
});

function setupSearchUI() {
    document.getElementById("submit").addEventListener("click", function () {
        document.getElementById('genre').value = "null";
        saveRecentSearch(document.getElementById("search").value);
        sendData();
    });

    document.addEventListener('keypress', function (event) {
        if (event.key === 'Enter' && document.getElementById('search') === document.activeElement) {
            document.getElementById('genre').value = "null";
            saveRecentSearch(document.getElementById("search").value);
            sendData();
        }
    });

    const debouncedSearch = debounce(function () {
        const value = document.getElementById("search").value.trim();
        if (value.length > 1) {
            document.getElementById('genre').value = "null";
            sendData();
        }
    }, 500);
    document.getElementById('search').addEventListener('input', debouncedSearch);

    document.getElementById('genre').addEventListener('change', function () {
        document.getElementById("search").value = " ";
        sendDataByGenre();
    });

    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            tempSort = sortSelect.value;
            currentPage = 1;
            if (tempGenre !== 'null') {
                getResults('', currentPage, tempGenre);
            } else if (searchpage) {
                getResults(searchpage, currentPage, 'null');
            }
        });
    }

    document.getElementById('clear-filters').addEventListener('click', function () {
        document.getElementById("search").value = "";
        document.getElementById('genre').value = "null";
        document.getElementById('sort').value = "";
        tempSort = '';
        searchpage = '';
        currentPage = 1;
        totalPages = null;
        cardContainer.innerHTML = `<img src="../assets/images/allanime.jpg" alt="Manga" class="d-block" style="width:100%; opacity:0.7">`;
        updatePagination();
    });
}

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function saveRecentSearch(query) {
    if (!query || !query.trim()) return;
    let recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    recent = recent.filter(s => s.toLowerCase() !== query.trim().toLowerCase());
    recent.unshift(query.trim());
    recent = recent.slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
    loadRecentSearches();
}

function loadRecentSearches() {
    const container = document.getElementById('recent-searches');
    if (!container) return;
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    container.innerHTML = recent.map(s =>
        `<span class="recent-chip" role="button" tabindex="0">${s}</span>`
    ).join('');
    container.querySelectorAll('.recent-chip').forEach(chip => {
        const click = () => {
            document.getElementById("search").value = chip.textContent;
            document.getElementById('genre').value = "null";
            sendData();
        };
        chip.addEventListener('click', click);
        chip.addEventListener('keypress', e => { if (e.key === 'Enter') click(); });
    });
}

function sendData() {
    const searchQuery = document.getElementById("search").value.trim();
    currentPage = 1;
    if (searchQuery === "") {
        showToast('Enter a search term', 'warn');
        return;
    }
    getResults(searchQuery, currentPage, "null");
}

function sendDataByGenre() {
    const genre = document.getElementById('genre').value;
    currentPage = 1;
    if (genre === "null") return;
    getResults("", currentPage, genre);
}

function buildQuery(searchInput, genre) {
    const params = [];
    if (searchInput && genre === 'null') {
        params.push(`filter[text]=${encodeURIComponent(searchInput)}`);
    } else if (!searchInput && genre !== 'null') {
        params.push(`filter[genres]=${encodeURIComponent(genre)}`);
    } else if (searchInput && genre !== 'null') {
        params.push(`filter[text]=${encodeURIComponent(searchInput)}`);
    }
    if (tempSort) {
        params.push(`sort=${tempSort}`);
    }
    params.push(`page[offset]=${currentPage * PAGE_LIMIT}`);
    params.push(`page[limit]=${PAGE_LIMIT}`);
    return params.join('&');
}

async function getResults(searchInput, page, genre) {
    searchpage = searchInput;
    tempGenre = genre;
    showLoading();
    let searchData;
    try {
        searchData = await kitsu('manga', buildQuery(searchInput, genre));
    } catch (err) {
        showErrorState();
        return;
    }

    const resultCount = searchData.meta && searchData.meta.count;
    totalPages = resultCount ? Math.ceil(resultCount / PAGE_LIMIT) : null;

    if (resultCount === 0) {
        cardContainer.innerHTML = `<img src="../assets/images/notFoundManga.jpg" alt="Not Found"  style="width:100%; opacity:0.7">`;
    } else {
        cardContainer.innerHTML = "";
        generateCards(searchData).forEach(card => {
            cardContainer.appendChild(card);
            card.addEventListener('click', () => {
                openQuickView(card.getAttribute('animanid'), card.getAttribute('animantype'));
            });
        });
    }
    updatePagination();
}

function updatePagination() {
    const container = document.getElementById('animeContainer');
    const hasResults = cardContainer.querySelector('.card');
    if (!hasResults) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = `
    <button class="previous" onclick="prevPage()">Previous</button>
    <div id="count">Page ${currentPage}</div>
    <button class="next" onclick="nextPage()">Next</button>
    `;
    if (totalPages !== null && currentPage >= totalPages) {
        const next = container.querySelector('.next');
        next.disabled = true;
        next.style.opacity = 0.2;
    }
    if (currentPage <= 1) {
        const prev = container.querySelector('.previous');
        prev.disabled = true;
        prev.style.opacity = 0.2;
    }
}

function nextPage() {
    if (totalPages === null || currentPage < totalPages) {
        currentPage++;
        getResults(searchpage, currentPage, tempGenre);
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        getResults(searchpage, currentPage, tempGenre);
    }
}

function showLoading() {
    cardContainer.innerHTML = '<div class="loading-spinner"></div>';
}

function showErrorState() {
    cardContainer.innerHTML = `<div class="error-state"><p>Could not load results.</p><button class="retry-btn">Retry</button></div>`;
    cardContainer.querySelector('.retry-btn').addEventListener('click', () => {
        getResults(searchpage, currentPage, tempGenre);
    });
}