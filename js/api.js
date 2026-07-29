// ─── API & Data Sources ───────────────────────────────────────────────────────
// NetMirror uses: api2.imdb4.shop (TMDB-compatible aggregator)
// We use: TMDB directly + imdb4.shop as fallback search

const TMDB = {
  BASE: 'https://api.themoviedb.org/3',
  IMG: 'https://image.tmdb.org/t/p',
  get key() { return '15d2ea6d0dc1d476efbca3eba2b9bbfb'; },
  async fetch(endpoint, params = {}) {
    const url = new URL(`${this.BASE}${endpoint}`);
    url.searchParams.set('api_key', this.key);
    url.searchParams.set('language', 'en-US');
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  },
  poster(path, size='w342') { return path ? `${this.IMG}/${size}${path}` : 'assets/no-poster.svg'; },
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

// ─── Embed Sources (NO sandbox restrictions!) ─────────────────────────────────
// These all work in iframes without sandbox attributes
// The original CinePlay site has sandbox on the iframe — that breaks CinemaOS Player
// Our sources don't need sandbox at all
const SOURCES = {
  movie: [
    { name: 'VidSrc Pro',  url: (id) => `https://vidsrc.to/embed/movie/${id}` },
    { name: 'VidSrc.me',   url: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}` },
    { name: 'AutoEmbed',   url: (id) => `https://autoembed.co/movie/tmdb/${id}` },
    { name: 'VidLink',     url: (id) => `https://vidlink.pro/movie/${id}` },
    { name: '2Embed',      url: (id) => `https://www.2embed.cc/embed/${id}` },
    { name: 'EmbedSu',     url: (id) => `https://embed.su/embed/movie/${id}` },
    { name: 'MultiEmbed',  url: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1` },
  ],
  tv: [
    { name: 'VidSrc Pro',  url: (id,s,e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { name: 'VidSrc.me',   url: (id,s,e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { name: 'AutoEmbed',   url: (id,s,e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}` },
    { name: 'VidLink',     url: (id,s,e) => `https://vidlink.pro/tv/${id}/${s}/${e}` },
    { name: '2Embed',      url: (id,s,e) => `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
    { name: 'EmbedSu',     url: (id,s,e) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
  ],
};
