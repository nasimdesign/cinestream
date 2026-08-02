// ─── API & Data Sources ───────────────────────────────────────────────────────
// NetMirror uses: api2.imdb4.shop (TMDB-compatible aggregator)
// We use: TMDB directly + imdb4.shop as fallback search

const TMDB = {
  BASE: 'https://api.themoviedb.org/3',
  IMG: 'https://image.tmdb.org/t/p',
  get key() { return '15d2ea6d0dc1d476efbca3eba2b9bbfb'; },
  async fetch(endpoint, params = {}) {
    const key = this.key;
    const lang = 'en-US';
    
    const makeUrl = (base) => {
      const u = new URL(`${base}${endpoint}`);
      u.searchParams.set('api_key', key);
      u.searchParams.set('language', lang);
      Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
      return u.toString();
    };

    const primaryUrl = makeUrl('https://api.themoviedb.org/3');
    const backupUrl = makeUrl('https://api.tmdb.org/3');

    // Helper for timeout
    const fetchWithTimeout = async (url, options = {}, timeoutMs = 2500) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (error) {
        clearTimeout(id);
        throw error;
      }
    };

    // 1) Try Primary TMDB Domain (api.themoviedb.org) - 2.5s timeout
    try {
      const res = await fetchWithTimeout(primaryUrl, {}, 2500);
      if (!res.ok) throw new Error(`Primary status ${res.status}`);
      return await res.json();
    } catch (e1) {
      console.warn("Primary TMDB domain failed/timed out, trying backup domain...", e1);
      
      // 2) Try Backup TMDB Domain (api.tmdb.org) - 2.5s timeout
      try {
        const res = await fetchWithTimeout(backupUrl, {}, 2500);
        if (!res.ok) throw new Error(`Backup status ${res.status}`);
        return await res.json();
      } catch (e2) {
        console.warn("Backup TMDB domain failed/timed out, trying CORS proxy fallback...", e2);
        
        // 3) Try a highly reliable fallback: allorigins.win - 3.5s timeout
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(primaryUrl)}`;
          const res = await fetchWithTimeout(proxyUrl, {}, 3500);
          if (!res.ok) throw new Error(`AllOrigins status ${res.status}`);
          return await res.json();
        } catch (e3) {
          console.warn("AllOrigins proxy failed/timed out, trying backup proxy...", e3);
          
          // 4) Try another public proxy: codetabs CORS proxy (cors-anywhere alternative)
          try {
            const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(primaryUrl)}`;
            const res = await fetchWithTimeout(proxyUrl, {}, 3500);
            if (!res.ok) throw new Error(`Codetabs status ${res.status}`);
            return await res.json();
          } catch (e4) {
            console.error("All TMDB API and proxy routes failed. Loading high-quality mock data...", e4);
            return getMockData(endpoint);
          }
        }
      }
    }
  },
  poster(path, size='w342') { return path ? `${this.IMG}/${size}${path}` : 'https://via.placeholder.com/342x513/141414/ffffff?text=Naxtream'; },
  backdrop(path, size='original') { return path ? `${this.IMG}/${size}${path}` : ''; },
  trending:       (type='all', period='week') => TMDB.fetch(`/trending/${type}/${period}`),
  popularMovies:  (p=1) => TMDB.fetch('/movie/popular',  {page:p}),
  topRatedMovies: (p=1) => TMDB.fetch('/movie/top_rated', {page:p}),
  nowPlaying:     (p=1) => TMDB.fetch('/movie/now_playing',{page:p}),
  upcoming:       (p=1) => TMDB.fetch('/movie/upcoming',  {page:p}),
  popularTV:      (p=1) => TMDB.fetch('/tv/popular',      {page:p}),
  topRatedTV:     (p=1) => TMDB.fetch('/tv/top_rated',    {page:p}),
  airingTV:       (p=1) => TMDB.fetch('/tv/on_the_air',   {page:p}),
  movieDetails:   (id)  => TMDB.fetch(`/movie/${id}`, {append_to_response:'credits,videos,similar,keywords'}),
  tvDetails:      (id)  => TMDB.fetch(`/tv/${id}`,    {append_to_response:'credits,videos,similar,keywords'}),
  tvSeason:       (id,s)=> TMDB.fetch(`/tv/${id}/season/${s}`),
  searchMulti:    (q,p=1) => TMDB.fetch('/search/multi', {query:q, page:p}),
  searchMovies:   (q,p=1) => TMDB.fetch('/search/movie', {query:q, page:p}),
  searchTV:       (q,p=1) => TMDB.fetch('/search/tv',    {query:q, page:p}),
  discoverMovies: (params={}) => TMDB.fetch('/discover/movie', params),
  discoverTV:     (params={}) => TMDB.fetch('/discover/tv',    params),
};

// ─── High Quality Fallback Mock Data ─────────────────────────────────────────
function getMockData(endpoint) {
  const movies = [
    {
      id: 1368337,
      title: "The Odyssey",
      backdrop_path: "/tYuC9kUwqhpDQ3pv1kLMqyMF1Jw.jpg",
      poster_path: "/xOi97tZ20k85n3u35G7Fz9m0M1F.jpg",
      overview: "Odysseus, the legendary King of Ithaca, goes on a 10-year journey to return home after the Trojan War.",
      vote_average: 7.8,
      release_date: "2026-03-01",
      genre_ids: [12, 14, 28]
    },
    {
      id: 507086,
      title: "Jurassic World Rebirth",
      backdrop_path: "/oHGl2Zsn7Kr75OGTUrCrCg27tnt.jpg",
      poster_path: "/13gDsnHkR71333r728bUo7B6W5o.jpg",
      overview: "A new era of dinosaurs begins in this action-packed sequel as a team secures DNA samples from ancient giants.",
      vote_average: 6.9,
      release_date: "2025-07-02",
      genre_ids: [28, 12, 878]
    },
    {
      id: 939243,
      title: "Sonic the Hedgehog 3",
      backdrop_path: "/zOpe067juVi4j6jgq5h1N5Mv9t8.jpg",
      poster_path: "/d8r02o5tHwU31535n35m3U8b5oW.jpg",
      overview: "Sonic, Knuckles, and Tails reunite to face a powerful new adversary, Shadow, a mysterious villain with powers.",
      vote_average: 7.8,
      release_date: "2024-12-20",
      genre_ids: [28, 12, 16, 35]
    },
    {
      id: 1022789,
      title: "Inside Out 2",
      backdrop_path: "/stKG8383zqrLQ5C2S241g8b5oW.jpg",
      poster_path: "/vpnVM1BwPFW45vBgvcl88Ua50t8.jpg",
      overview: "Teenager Riley's mind undergoes a sudden demolition to make room for new Emotions, including Anxiety.",
      vote_average: 7.6,
      release_date: "2024-06-11",
      genre_ids: [16, 35, 12, 10751]
    },
    {
      id: 76600,
      title: "Avatar: The Way of Water",
      backdrop_path: "/v16ww6jRlHO4v0p5Af0n1NsW6M5.jpg",
      poster_path: "/t6HI23eTVjMIvFTPt2JbxwJp62g.jpg",
      overview: "Jake Sully lives with his newfound family formed on the extrasolar moon Pandora in a battle to protect them.",
      vote_average: 7.6,
      release_date: "2022-12-14",
      genre_ids: [878, 12, 28]
    }
  ];

  const tv = [
    {
      id: 83867,
      name: "Wednesday",
      backdrop_path: "/iHthv0p5Af0n1NsW6M5.jpg",
      poster_path: "/hlkw08j9PB56z16265ve.jpg",
      overview: "Wednesday Addams' misadventures as a student at Nevermore Academy, solving mysteries and managing relationships.",
      vote_average: 8.5,
      first_air_date: "2022-11-23",
      genre_ids: [10765, 9648, 35]
    },
    {
      id: 66732,
      name: "Stranger Things",
      backdrop_path: "/56v2g2g4g4g4g4g4.jpg",
      poster_path: "/x2LSR25A93tih1d2z4321g8b5oW.jpg",
      overview: "When a young boy vanishes, a town uncovers a mystery involving secret experiments, terrifying supernatural forces and a strange little girl.",
      vote_average: 8.6,
      first_air_date: "2016-07-15",
      genre_ids: [10765, 9648, 18]
    }
  ];

  // Return tv list for tv endpoints, otherwise movie list
  if (endpoint.includes('/tv/') || endpoint.includes('type=tv')) {
    return { results: tv, page: 1, total_pages: 1 };
  }
  
  // For details, return the specific mock item matching ID
  if (endpoint.match(/\/(movie|tv)\/\d+/)) {
    const id = parseInt(endpoint.split('/').pop());
    const all = [...movies, ...tv];
    const found = all.find(item => item.id === id);
    if (found) {
      return {
        ...found,
        genres: found.genre_ids.map(gid => ({ name: GENRE_MAP[gid] || 'Genre' })),
        credits: { cast: [] },
        similar: { results: all.filter(item => item.id !== id) }
      };
    }
  }

  return { results: movies, page: 1, total_pages: 1 };
}

// ─── NetMirror / imdb4.shop Search API ───────────────────────────────────────
// This is the same API NetMirror uses: returns TMDB-compatible results
const IMDB4 = {
  BASE: 'https://api2.imdb4.shop/api',
  encodeQuery: (q) => encodeURIComponent(q.trim()).replace(/%20/g, '+').replace(/%2F/g, '--slash--'),
  async search(query, page = 0) {
    try {
      const q = IMDB4.encodeQuery(query);
      const res = await fetch(`${IMDB4.BASE}/search2/${q}?page=${page}`);
      const data = await res.json();
      return data.results || [];
    } catch(e) { return []; }
  }
};

// ─── Embed Sources (Verified & Active High-Availability Players) ────────────
const SOURCES = {
  movie: [
    { name: 'VidSrc Pro',  url: (id) => `https://vidsrc.to/embed/movie/${id}` },
    { name: 'VidSrc.me',   url: (id) => `https://vidsrcme.ru/embed/movie?tmdb=${id}` },
    { name: 'VidSrc.pm',   url: (id) => `https://vidsrc.pm/embed/movie/${id}` },
    { name: 'AutoEmbed',   url: (id) => `https://autoembed.co/movie/tmdb/${id}` },
    { name: 'VidLink',     url: (id) => `https://vidlink.pro/movie/${id}` },
    { name: '2Embed',      url: (id) => `https://www.2embed.cc/embed/${id}` },
    { name: 'AnyEmbed',    url: (id) => `https://anyembed.xyz/embed/tmdb-movie-${id}` },
  ],
  tv: [
    { name: 'VidSrc Pro',  url: (id,s,e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { name: 'VidSrc.me',   url: (id,s,e) => `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { name: 'VidSrc.pm',   url: (id,s,e) => `https://vidsrc.pm/embed/tv/${id}/${s}/${e}` },
    { name: 'AutoEmbed',   url: (id,s,e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
    { name: 'VidLink',     url: (id,s,e) => `https://vidlink.pro/tv/${id}/${s}/${e}` },
    { name: '2Embed',      url: (id,s,e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
    { name: 'AnyEmbed',    url: (id,s,e) => `https://anyembed.xyz/embed/tmdb-tv-${id}-${s}-${e}` },
  ],
};
