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
  // Remove existing toasts first to prevent stacking overlays
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { 
    toast.classList.remove('show'); 
    setTimeout(() => toast.remove(), 400); 
  }, 2500);
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
    showToast(`Added "${getTitle(item)}" to My List`, 'success');
  } else {
    showToast('Already in My List', 'info');
  }
}
function removeFromWatchlist(id) {
  const wl = getWatchlist().filter(i => i.id !== id);
  localStorage.setItem('cs_watchlist', JSON.stringify(wl));
}
function isInWatchlist(id) {
  return getWatchlist().some(i => i.id === id);
}

// Liked Movies (localStorage)
function getLiked() {
  return JSON.parse(localStorage.getItem('cs_liked') || '[]');
}
function addToLiked(item) {
  const liked = getLiked();
  if (!liked.find(i => i.id === item.id)) {
    liked.unshift(item);
    localStorage.setItem('cs_liked', JSON.stringify(liked));
    showToast(`Liked "${getTitle(item)}"`, 'success');
  } else {
    showToast('Already liked', 'info');
  }
}
function removeFromLiked(id) {
  const liked = getLiked().filter(i => i.id !== id);
  localStorage.setItem('cs_liked', JSON.stringify(liked));
}
function isLiked(id) {
  return getLiked().some(i => i.id === id);
}

// ─── Shared Card Builder ─────────────────────────────────────────────────────
function cardHTML(item, forcedType) {
  const type = forcedType || item.media_type || (item.title ? 'movie' : 'tv');
  if (type === 'person') return '';
  const title = item.title || item.name || '';
  const year = (item.release_date || item.first_air_date || '').slice(0,4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
    : `https://via.placeholder.com/160x240/141414/ffffff?text=${encodeURIComponent(title)}`;
  
  return `
  <div class="movie-card" onclick="openInfoModal(${item.id}, '${type}')">
    <div class="card-poster">
      <img src="${poster}" alt="${title}" loading="lazy"/>
      <div class="card-rating">&#9733; ${rating}</div>
      <div class="card-type-badge">${type==='tv'?'TV':'Film'}</div>
      <div class="card-overlay">
        <div class="card-play-btn" onclick="event.stopPropagation(); location.href='watch.html?id=${item.id}&type=${type}'" title="Play Now">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div class="card-year">${year}</div>
    </div>
  </div>`;
}

// ─── Netflix-style Details Modal ──────────────────────────────────────────────
let activeModalItem = null;

async function openInfoModal(id, type) {
  let modal = document.getElementById('infoModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'infoModal';
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="closeInfoModal()">&times;</button>
        <div class="modal-hero" id="modalHero">
          <div class="modal-hero-bg" id="modalHeroBg"></div>
          <div class="modal-hero-content">
            <h2 id="modalTitle">Loading...</h2>
            <div class="modal-hero-btns">
              <button class="btn-play-modal" id="modalPlayBtn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z"/></svg> Play
              </button>
              <button class="btn-list-modal" id="modalListBtn">
                + My List
              </button>
              <button class="btn-like-modal" id="modalLikeBtn" title="Like Movie">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-body">
          <div class="modal-meta">
            <span class="modal-match" id="modalMatch">98% Match</span>
            <span class="modal-year" id="modalYear"></span>
            <span class="modal-badge">HD</span>
            <span class="modal-rating" id="modalRating"></span>
          </div>
          <p class="modal-overview" id="modalOverview"></p>
          <div class="modal-genres" id="modalGenres"></div>
          <div class="modal-similar-section">
            <h3>Similar Titles</h3>
            <div class="modal-similar-grid" id="modalSimilarGrid"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeInfoModal();
    });
  }

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  document.getElementById('modalTitle').textContent = 'Loading...';
  document.getElementById('modalHeroBg').style.backgroundImage = '';
  document.getElementById('modalOverview').textContent = '';
  document.getElementById('modalGenres').innerHTML = '';
  document.getElementById('modalSimilarGrid').innerHTML = Array(4).fill('<div class="card-skeleton"></div>').join('');
  document.getElementById('modalYear').textContent = '';
  document.getElementById('modalRating').textContent = '';

  try {
    const d = type === 'tv' ? await TMDB.tvDetails(id) : await TMDB.movieDetails(id);
    activeModalItem = d;
    activeModalItem.media_type = type;
    
    const title = d.title || d.name || '';
    const backdrop = d.backdrop_path ? `https://image.tmdb.org/t/p/original${d.backdrop_path}` : '';
    const year = (d.release_date || d.first_air_date || '').slice(0, 4);
    const rating = d.vote_average ? `★ ${d.vote_average.toFixed(1)}` : 'N/A';
    const genres = (d.genres || []).map(g => `<span class="genre-tag">${g.name}</span>`).join('');
    
    // Dynamic Netflix Match Score
    const scoreVal = d.vote_average ? Math.round(d.vote_average * 10) : 75;
    const matchPercent = Math.min(99, Math.max(65, scoreVal + (id % 15) - 7));
    
    document.getElementById('modalTitle').textContent = title;
    if (backdrop) {
      document.getElementById('modalHeroBg').style.backgroundImage = `url(${backdrop})`;
    }
    document.getElementById('modalOverview').textContent = d.overview || 'No description available.';
    document.getElementById('modalYear').textContent = year;
    document.getElementById('modalRating').textContent = rating;
    document.getElementById('modalGenres').innerHTML = genres;
    document.getElementById('modalMatch').textContent = `${matchPercent}% Match`;
    
    document.getElementById('modalPlayBtn').onclick = () => {
      closeInfoModal();
      location.href = `watch.html?id=${id}&type=${type}`;
    };
    
    updateModalButtonsState();
    
    let similarItems = [];
    if (d.similar && d.similar.results) {
      similarItems = d.similar.results.slice(0, 6);
    }
    if (similarItems.length > 0) {
      document.getElementById('modalSimilarGrid').innerHTML = similarItems.map(item => cardHTML(item)).join('');
    } else {
      document.getElementById('modalSimilarGrid').innerHTML = '<p style="color:var(--muted);grid-column:1/-1;text-align:center">No similar titles found.</p>';
    }
  } catch (err) {
    console.error(err);
    document.getElementById('modalTitle').textContent = 'Error loading details';
  }
}

function closeInfoModal() {
  const modal = document.getElementById('infoModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function updateModalButtonsState() {
  if (!activeModalItem) return;
  const listBtn = document.getElementById('modalListBtn');
  const likeBtn = document.getElementById('modalLikeBtn');
  
  const inWL = isInWatchlist(activeModalItem.id);
  const isL = isLiked(activeModalItem.id);
  
  listBtn.innerHTML = inWL ? `✓ In My List` : `+ My List`;
  listBtn.onclick = () => {
    if (inWL) {
      removeFromWatchlist(activeModalItem.id);
      showToast(`Removed from My List`, 'info');
    } else {
      addToWatchlist(activeModalItem);
    }
    updateModalButtonsState();
    if (typeof refreshWatchlistRows === 'function') refreshWatchlistRows();
  };
  
  likeBtn.className = `btn-like-modal ${isL ? 'liked' : ''}`;
  likeBtn.onclick = () => {
    if (isL) {
      removeFromLiked(activeModalItem.id);
      showToast(`Removed from Liked`, 'info');
    } else {
      addToLiked(activeModalItem);
    }
    updateModalButtonsState();
    if (typeof refreshWatchlistRows === 'function') refreshWatchlistRows();
  };
}
