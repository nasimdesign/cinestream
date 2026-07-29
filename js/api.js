const TMDB = {
  BASE: 'https://api.themoviedb.org/3',
  IMG: 'https://image.tmdb.org/t/p',
  get key() { return localStorage.getItem('cs_api_key') || ''; },
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
  trending: (type='all', period='week') => TMDB.fetch(`/trending/${type}/${period}`),
  popularMovies: (p=1) => TMDB.fetch('/movie/popular',{page:p}),
  topRatedMovies: (p=1) => TMDB.fetch('/movie/top_rated',{page:p}),
  nowPlaying: (p=1) => TMDB.fetch('/movie/now_playing',{page:p}),
  upcoming: (p=1) => TMDB.fetch('/movie/upcoming',{page:p}),
  popularTV: (p=1) => TMDB.fetch('/tv/popular',{page:p}),
  topRatedTV: (p=1) => TMDB.fetch('/tv/top_rated',{page:p}),
  movieDetails: (id) => TMDB.fetch(`/movie/${id}`,{append_to_response:'credits,videos,similar'}),
  tvDetails: (id) => TMDB.fetch(`/tv/${id}`,{append_to_response:'credits,videos,similar'}),
  tvSeason: (id,s) => TMDB.fetch(`/tv/${id}/season/${s}`),
  searchMulti: (q,p=1) => TMDB.fetch('/search/multi',{query:q,page:p}),
};

const SOURCES = {
  movie: [
    { name:'VidSrc Pro', url:(id)=>`https://vidsrc.to/embed/movie/${id}` },
    { name:'VidSrc.me',  url:(id)=>`https://vidsrc.me/embed/movie?tmdb=${id}` },
    { name:'2Embed',     url:(id)=>`https://www.2embed.cc/embed/${id}` },
    { name:'MultiEmbed', url:(id)=>`https://multiembed.mov/?video_id=${id}&tmdb=1` },
  ],
  tv: [
    { name:'VidSrc Pro', url:(id,s,e)=>`https://vidsrc.to/embed/tv/${id}/${s}/${e}` },
    { name:'VidSrc.me',  url:(id,s,e)=>`https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
    { name:'2Embed',     url:(id,s,e)=>`https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}` },
  ],
};
