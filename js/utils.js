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
  if (typeof updateLibraryCount === 'function') updateLibraryCount();
}
function removeFromWatchlist(id) {
  const wl = getWatchlist().filter(i => i.id !== id);
  localStorage.setItem('cs_watchlist', JSON.stringify(wl));
  if (typeof updateLibraryCount === 'function') updateLibraryCount();
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
  if (typeof updateLibraryCount === 'function') updateLibraryCount();
}
function removeFromLiked(id) {
  const liked = getLiked().filter(i => i.id !== id);
  localStorage.setItem('cs_liked', JSON.stringify(liked));
  if (typeof updateLibraryCount === 'function') updateLibraryCount();
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

// ─── Global My Library Drawer (Watchlist + Liked on every page) ──────────────
function initLibraryDrawer() {
  // Inject CSS
  if (!document.getElementById('libraryDrawerStyle')) {
    const s = document.createElement('style');
    s.id = 'libraryDrawerStyle';
    s.textContent = `
      .lib-fab {
        position: fixed; bottom: 28px; right: 28px; z-index: 9000;
        background: linear-gradient(135deg,#E50914,#b81d24);
        color: #fff; border: none; border-radius: 50px;
        padding: 12px 22px; font-size: .9rem; font-weight: 700;
        cursor: pointer; display: flex; align-items: center; gap: 8px;
        box-shadow: 0 4px 24px rgba(229,9,20,.45);
        transition: transform .2s, box-shadow .2s;
      }
      .lib-fab:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(229,9,20,.55); }
      .lib-fab .lib-count {
        background: rgba(255,255,255,.25); border-radius: 50px;
        min-width: 20px; height: 20px; font-size: .75rem;
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0 6px;
      }
      .lib-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,.7);
        z-index: 9100; opacity: 0; pointer-events: none;
        transition: opacity .3s;
      }
      .lib-overlay.open { opacity: 1; pointer-events: all; }
      .lib-drawer {
        position: fixed; top: 0; right: -420px; bottom: 0; width: 420px; max-width: 96vw;
        background: #0e1220; border-left: 1px solid rgba(255,255,255,.07);
        z-index: 9200; overflow-y: auto; transition: right .35s cubic-bezier(.4,0,.2,1);
        padding: 0 0 40px;
      }
      .lib-drawer.open { right: 0; }
      .lib-drawer-header {
        position: sticky; top: 0; background: #0e1220;
        border-bottom: 1px solid rgba(255,255,255,.08);
        padding: 18px 20px; display: flex; align-items: center; justify-content: space-between;
        z-index: 1;
      }
      .lib-drawer-title { font-size: 1.1rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }
      .lib-drawer-close {
        background: none; border: none; color: rgba(255,255,255,.6);
        font-size: 1.5rem; cursor: pointer; width: 36px; height: 36px;
        display: flex; align-items: center; justify-content: center; border-radius: 50%;
        transition: background .2s;
      }
      .lib-drawer-close:hover { background: rgba(255,255,255,.1); color: #fff; }
      .lib-tabs { display: flex; gap: 4px; padding: 14px 20px 8px; }
      .lib-tab {
        flex: 1; padding: 8px 0; border: none; border-radius: 8px; cursor: pointer;
        font-size: .85rem; font-weight: 600; transition: all .2s;
        background: rgba(255,255,255,.07); color: rgba(255,255,255,.5);
      }
      .lib-tab.active { background: #E50914; color: #fff; }
      .lib-section { display: none; padding: 8px 16px; }
      .lib-section.active { display: block; }
      .lib-empty {
        text-align: center; padding: 48px 20px; color: rgba(255,255,255,.35); font-size: .95rem;
      }
      .lib-empty svg { margin-bottom: 12px; opacity: .3; }
      .lib-item {
        display: flex; align-items: center; gap: 12px;
        padding: 10px 4px; border-bottom: 1px solid rgba(255,255,255,.06);
        cursor: pointer; transition: background .15s; border-radius: 8px;
      }
      .lib-item:hover { background: rgba(255,255,255,.05); }
      .lib-item img {
        width: 52px; height: 78px; object-fit: cover; border-radius: 6px; flex-shrink: 0;
      }
      .lib-item-info { flex: 1; min-width: 0; }
      .lib-item-title { font-size: .9rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .lib-item-meta { font-size: .78rem; color: rgba(255,255,255,.4); margin-top: 3px; }
      .lib-item-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
      .lib-play-btn {
        background: #E50914; color: #fff; border: none; border-radius: 6px;
        padding: 5px 12px; font-size: .78rem; font-weight: 700; cursor: pointer; transition: background .2s;
      }
      .lib-play-btn:hover { background: #f50; }
      .lib-remove-btn {
        background: rgba(255,255,255,.08); color: rgba(255,255,255,.5); border: none; border-radius: 6px;
        padding: 5px 12px; font-size: .78rem; cursor: pointer; transition: background .2s;
      }
      .lib-remove-btn:hover { background: rgba(229,9,20,.2); color: #ff6b6b; }
    `;
    document.head.appendChild(s);
  }

  // FAB button
  if (!document.getElementById('libFab')) {
    const fab = document.createElement('button');
    fab.id = 'libFab';
    fab.className = 'lib-fab';
    fab.onclick = openLibraryDrawer;
    fab.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
      </svg>
      My Library
      <span class="lib-count" id="libCount">0</span>`;
    document.body.appendChild(fab);
  }

  // Overlay
  if (!document.getElementById('libOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'libOverlay';
    overlay.className = 'lib-overlay';
    overlay.onclick = closeLibraryDrawer;
    document.body.appendChild(overlay);
  }

  // Drawer
  if (!document.getElementById('libDrawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'libDrawer';
    drawer.className = 'lib-drawer';
    drawer.innerHTML = `
      <div class="lib-drawer-header">
        <div class="lib-drawer-title">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          </svg>
          My Library
        </div>
        <button class="lib-drawer-close" onclick="closeLibraryDrawer()">×</button>
      </div>
      <div class="lib-tabs">
        <button class="lib-tab active" id="libTabWatchlist" onclick="switchLibTab('watchlist')">
          📋 My List
        </button>
        <button class="lib-tab" id="libTabLiked" onclick="switchLibTab('liked')">
          ❤️ Liked
        </button>
      </div>
      <div class="lib-section active" id="libSectionWatchlist"></div>
      <div class="lib-section" id="libSectionLiked"></div>
    `;
    document.body.appendChild(drawer);
  }

  updateLibraryCount();
}

function updateLibraryCount() {
  const count = getWatchlist().length + getLiked().length;
  const el = document.getElementById('libCount');
  if (el) el.textContent = count;
}

function openLibraryDrawer() {
  renderLibrarySections();
  document.getElementById('libOverlay').classList.add('open');
  document.getElementById('libDrawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLibraryDrawer() {
  document.getElementById('libOverlay').classList.remove('open');
  document.getElementById('libDrawer').classList.remove('open');
  document.body.style.overflow = '';
}

function switchLibTab(tab) {
  document.getElementById('libTabWatchlist').classList.toggle('active', tab === 'watchlist');
  document.getElementById('libTabLiked').classList.toggle('active', tab === 'liked');
  document.getElementById('libSectionWatchlist').classList.toggle('active', tab === 'watchlist');
  document.getElementById('libSectionLiked').classList.toggle('active', tab === 'liked');
}

function renderLibrarySections() {
  const wl = getWatchlist();
  const liked = getLiked();

  const itemHTML = (item, isWatchlist) => {
    const type = item.media_type || (item.title ? 'movie' : 'tv');
    const title = item.title || item.name || 'Unknown';
    const poster = item.poster_path
      ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
      : `https://via.placeholder.com/52x78/141929/7c6bf0?text=${encodeURIComponent(title[0]||'?')}`;
    const year = (item.release_date || item.first_air_date || '').slice(0,4);
    const removeFunc = isWatchlist ? `removeFromWatchlist(${item.id}); renderLibrarySections(); updateLibraryCount(); if(typeof refreshWatchlistRows==='function')refreshWatchlistRows();` : `removeFromLiked(${item.id}); renderLibrarySections(); updateLibraryCount(); if(typeof refreshWatchlistRows==='function')refreshWatchlistRows();`;
    return `<div class="lib-item" onclick="closeLibraryDrawer(); openInfoModal(${item.id},'${type}')">
      <img src="${poster}" alt="${title}" loading="lazy"/>
      <div class="lib-item-info">
        <div class="lib-item-title">${title}</div>
        <div class="lib-item-meta">${type === 'tv' ? 'TV Show' : 'Movie'}${year ? ' · ' + year : ''}</div>
      </div>
      <div class="lib-item-actions">
        <button class="lib-play-btn" onclick="event.stopPropagation(); closeLibraryDrawer(); location.href='watch.html?id=${item.id}&type=${type}'">▶ Play</button>
        <button class="lib-remove-btn" onclick="event.stopPropagation(); ${removeFunc} showToast('Removed','info')">Remove</button>
      </div>
    </div>`;
  };

  const wlEl = document.getElementById('libSectionWatchlist');
  wlEl.innerHTML = wl.length
    ? wl.map(i => itemHTML(i, true)).join('')
    : `<div class="lib-empty"><svg viewBox="0 0 24 24" fill="white" width="40" height="40"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg><br>Your list is empty.<br><small>Add movies or shows to watch later.</small></div>`;

  const likedEl = document.getElementById('libSectionLiked');
  likedEl.innerHTML = liked.length
    ? liked.map(i => itemHTML(i, false)).join('')
    : `<div class="lib-empty"><svg viewBox="0 0 24 24" fill="white" width="40" height="40"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg><br>No liked titles yet.<br><small>Heart a movie or show to save it here.</small></div>`;

  updateLibraryCount();
}

// Auto-init once DOM is ready
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLibraryDrawer);
  } else {
    initLibraryDrawer();
  }
})();
