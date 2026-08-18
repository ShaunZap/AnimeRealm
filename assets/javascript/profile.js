document.addEventListener('DOMContentLoaded', function () {
    if (!requireAuth()) return;
    loadNav('nav.html', 'profile.html');
    loadProfile();
});

async function loadProfile() {
    let response;
    try {
        response = await apiFetch('/api/profile');
        if (response.status === 401) {
            logout();
            return;
        }
        if (!response.ok) throw new Error('failed');
    } catch (err) {
        showErrorState();
        return;
    }
    const profile = await response.json();

    document.getElementById('profile-card').innerHTML = `
    <div class="avatar">${profile.username.charAt(0).toUpperCase()}</div>
    <div class="profile-name">${profile.username}</div>
    <div class="profile-email">${profile.email}</div>
    <div class="stats-grid">
        <div class="stat"><div class="stat-value">${profile.stats.watchlistCount}</div><div class="stat-label">Watchlist</div></div>
        <div class="stat"><div class="stat-value">${profile.stats.progressCount}</div><div class="stat-label">Tracking</div></div>
        <div class="stat"><div class="stat-value">${profile.stats.reviewCount}</div><div class="stat-label">Reviews</div></div>
    </div>
    `;

    const reviews = profile.recentReviews;
    const reviewsContainer = document.getElementById('recent-reviews');
    if (!reviews.length) {
        reviewsContainer.innerHTML = `<div class="reviews-heading">Recent Reviews</div><div class="no-reviews">No reviews yet.</div>`;
        return;
    }
    reviewsContainer.innerHTML = `
    <div class="reviews-heading">Recent Reviews</div>
    <div class="reviews-list">
        ${reviews.map(r => `
        <div class="review-item">
            <div class="review-top">
                <span class="review-title">${r.title || `${r.kitsuId}`}</span>
                <span class="review-rating">${r.rating}/10</span>
            </div>
            <div class="review-comment">${r.comment || 'No comment.'}</div>
        </div>`).join('')}
    </div>`;
}

function showErrorState() {
    const card = document.getElementById('profile-card');
    card.innerHTML = `<div class="error-state"><p>Could not load your profile.</p><button class="retry-btn">Retry</button></div>`;
    card.querySelector('.retry-btn').addEventListener('click', loadProfile);
}