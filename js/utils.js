// ─── Utility Functions ────────────────────────────────────────────────────────

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
  10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
  10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics',
};

function getGenreNames(ids = []) {
  return ids.slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean).join(' · ');
}
function formatRuntime(mins) {
  if (!mins) return '';
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
function formatYear(dateStr) {
  return dateStr ? new Date(dateStr).getFullYear() : '';
}
function formatRating(v) {
  return v ? v.toFixed(1) : 'N/A';
}
function getTitle(item) {
  return item.title || item.name || 'Unknown';
}
function getDate(item) {
  return item.release_date || item.first_air_date || '';
}
function getType(item) {
  return item.media_type || (item.title ? 'movie' : 'tv');
}

// Skeleton loader HTML
function skeletonRow(count = 7) {
  return Array.from({ length: count }, () =>
    `<div class="card-skeleton"></div>`
  ).join('');
}

// Toast notifications
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}

// Star rating visual
function renderStars(rating) {
  const filled = Math.round(rating / 2);
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < filled ? 'filled' : ''}">★</span>`
  ).join('');
}

// Scroll row helpers
function initScrollRow(rowEl) {
  if (!rowEl) return;
  const track = rowEl.querySelector('.row-track');
  const prevBtn = rowEl.querySelector('.scroll-btn.prev');
  const nextBtn = rowEl.querySelector('.scroll-btn.next');
  if (!track) return;
  const scroll = (dir) => track.scrollBy({ left: dir * 900, behavior: 'smooth' });
  if (prevBtn) prevBtn.onclick = () => scroll(-1);
  if (nextBtn) nextBtn.onclick = () => scroll(1);
  track.addEventListener('scroll', () => {
    if (prevBtn) prevBtn.style.opacity = track.scrollLeft > 0 ? '1' : '0';
    if (nextBtn) nextBtn.style.opacity = (track.scrollLeft + track.clientWidth < track.scrollWidth - 10) ? '1' : '0';
  });
}

// Watchlist (localStorage)
function getWatchlist() {
  return JSON.parse(localStorage.getItem('cs_watchlist') || '[]');
}
function addToWatchlist(item) {
  const wl = getWatchlist();
  if (!wl.find(i => i.id === item.id)) {
    wl.unshift(item);
    localStorage.setItem('cs_watchlist', JSON.stringify(wl));
    showToast(`Added "${getTitle(item)}" to watchlist`, 'success');
  } else {
    showToast('Already in watchlist', 'info');
  }
}
function removeFromWatchlist(id) {
  const wl = getWatchlist().filter(i => i.id !== id);
  localStorage.setItem('cs_watchlist', JSON.stringify(wl));
}
function isInWatchlist(id) {
  return getWatchlist().some(i => i.id === id);
}
