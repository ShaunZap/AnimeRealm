const TOKEN_KEY = 'token';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function requireAuth() {
    if (!getToken()) {
        window.location.href = '/';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    fetch('/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/';
}

function apiFetch(url, options = {}) {
    const headers = options.headers || {};
    if (getToken()) {
        headers['Authorization'] = `Bearer ${getToken()}`;
    }
    return fetch(url, { ...options, headers });
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'notification';
        toast.className = 'notification';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `notification ${type} show`;
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

const kitsuCache = {};

async function kitsu(path, queryString = '') {
    const key = `${path}?${queryString}`;
    if (kitsuCache[key]) {
        return kitsuCache[key];
    }
    try {
        const response = await fetch(`https://kitsu.io/api/edge/${path}${queryString ? `?${queryString}` : ''}`);
        if (!response.ok) {
            throw new Error(`Kitsu request failed: ${response.status}`);
        }
        const data = await response.json();
        kitsuCache[key] = data;
        return data;
    } catch (err) {
        console.error('Kitsu error:', err);
        throw err;
    }
}

function loadNav(navFile, activePage) {
    return fetch(navFile)
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar').innerHTML = html;

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    logout();
                });
            }

            if (activePage) {
                document.querySelectorAll('#navbar .nav-link, #navbar .dropdown-item, #navbar .nav-icon-link').forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href.split('/').pop() === activePage) {
                        link.classList.add('active');
                        const dropdown = link.closest('.dropdown');
                        if (dropdown) {
                            dropdown.classList.add('dropdown-active');
                        }
                    }
                });
            }

            setupCommonUI();
        });
}

function openInfo(id, type) {
    const base = type === 'manga' ? 'mangaInfo.html' : 'animeInfo.html';
    window.open(`../../pages/${base}?id=${id}&type=${type}`, '_blank');
}

let quickModal = null;

async function openQuickView(id, type) {
    if (!quickModal) {
        quickModal = document.createElement('div');
        quickModal.className = 'modal fade quick-modal';
        quickModal.id = 'quick-view-modal';
        quickModal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="quick-title"></h5>
                    <button type="button" class="btn-close quick-close" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="quick-body"></div>
                </div>
                <div class="modal-footer">
                    <button class="progress-btn" id="quick-watchlist">Add to Watchlist</button>
                    <button class="progress-btn quick-details">Full Details</button>
                </div>
            </div>
        </div>`;
        document.body.appendChild(quickModal);
        quickModal.querySelector('.quick-close').addEventListener('click', () => {
            bootstrap.Modal.getInstance(quickModal)?.hide();
        });
        quickModal.addEventListener('click', (e) => {
            if (e.target === quickModal) {
                bootstrap.Modal.getInstance(quickModal)?.hide();
            }
        });
    }

    const modal = bootstrap.Modal.getOrCreateInstance(quickModal);
    quickModal.querySelector('.quick-body').innerHTML = '<div class="loading-spinner"></div>';
    quickModal.querySelector('#quick-title').textContent = '';
    modal.show();

    try {
        const data = await kitsu(`${type}/${id}`);
        const attrs = data.data.attributes;
        const title = titleOf(attrs);
        const synopsis = (attrs.description || attrs.synopsis || 'No synopsis available.').slice(0, 400);
        const synopsisFull = attrs.description || attrs.synopsis || '';
        quickModal.querySelector('#quick-title').textContent = title;
        quickModal.querySelector('.quick-body').innerHTML = `
        <div class="quick-layout">
            <div class="quick-poster">
                <img src="${attrs.posterImage.large}" alt="${title}">
            </div>
            <div class="quick-info">
                <div class="quick-score">Score: ${attrs.popularityRank || 'N/A'} (Popularity)</div>
                <div class="quick-synopsis">${synopsis}${synopsisFull.length > 400 ? '...' : ''}</div>
            </div>
        </div>`;

        const wlBtn = quickModal.querySelector('#quick-watchlist');
        wlBtn.onclick = async () => {
            try {
                const response = await apiFetch('/api/watchlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, type, title, thumbnail: attrs.posterImage.small })
                });
                if (response.ok) {
                    wlBtn.textContent = 'Added';
                    wlBtn.disabled = true;
                    showToast('Added to watchlist', 'success');
                } else if (response.status === 401) {
                    logout();
                } else {
                    showToast('Could not add to watchlist', 'error');
                }
            } catch (err) {
                showToast('Network error', 'error');
            }
        };

        quickModal.querySelector('.quick-details').onclick = () => {
            modal.hide();
            openInfo(id, type);
        };
    } catch (err) {
        quickModal.querySelector('.quick-body').innerHTML = '<div class="error-state"><p>Could not load preview.</p></div>';
    }
}

function titleOf(attributes) {
    return attributes.titles && (
        attributes.titles.en ||
        attributes.titles.en_us ||
        attributes.titles.en_jp ||
        attributes.titles.en_kr ||
        attributes.titles.en_cn
    ) || attributes.canonicalTitle || 'Untitled';
}

function isLightTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light';
}

function toggleTheme() {
    if (isLightTheme()) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.removeItem('theme');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    themeToggle.innerHTML = isLightTheme()
        ? '<i class="bi bi-sun"></i>'
        : '<i class="bi bi-moon-stars"></i>';
    themeToggle.setAttribute('aria-label', isLightTheme() ? 'Switch to dark theme' : 'Switch to light theme');
}

function setupCommonUI() {
    let scrollTopBtn = document.getElementById('scroll-top-btn');
    if (!scrollTopBtn) {
        scrollTopBtn = document.createElement('button');
        scrollTopBtn.id = 'scroll-top-btn';
        scrollTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
        scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
        scrollTopBtn.style.display = 'none';
        document.body.appendChild(scrollTopBtn);
    }
    window.addEventListener('scroll', () => {
        scrollTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'btn-icon';
        themeToggle.setAttribute('aria-label', 'Toggle light/dark theme');
        const nav = document.querySelector('#navbar .navbar-collapse');
        if (nav) {
            nav.appendChild(themeToggle);
        } else {
            document.body.appendChild(themeToggle);
        }
    }
    themeToggle.addEventListener('click', toggleTheme);
    updateThemeIcon();
}

(function applyTheme() {
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
})();