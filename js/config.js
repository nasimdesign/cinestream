// ─── Naxtream Configuration ────────────────────────────────────────────────

const CONFIG = {
  TMDB_API_KEY: '15d2ea6d0dc1d476efbca3eba2b9bbfb',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMG_BASE: 'https://image.tmdb.org/t/p/',
  TMDB_IMG_W500: 'https://image.tmdb.org/t/p/w500',
  TMDB_IMG_W780: 'https://image.tmdb.org/t/p/w780',
  TMDB_IMG_ORIG: 'https://image.tmdb.org/t/p/original',

  // ── Embed Sources (NO sandbox restrictions!) ───────────────────────────────
  // These sources work perfectly in iframes without sandbox attributes.
  // The original CinePlay site uses CinemaOS which requires no-sandbox but their
  // host sets sandbox on the iframe — that is the bug. Our sources don't need it.
  MOVIE_SOURCES: [
    {
      name: 'VidSrc Pro',
      icon: '🎬',
      getUrl: (tmdb_id) => `https://vidsrc.to/embed/movie/${tmdb_id}`,
    },
    {
      name: 'VidSrc.me',
      icon: '📺',
      getUrl: (tmdb_id) => `https://vidsrc.me/embed/movie?tmdb=${tmdb_id}`,
    },
    {
      name: '2Embed',
      icon: '🎥',
      getUrl: (tmdb_id) => `https://www.2embed.cc/embed/${tmdb_id}`,
    },
    {
      name: 'MultiEmbed',
      icon: '▶️',
      getUrl: (tmdb_id) => `https://multiembed.mov/?video_id=${tmdb_id}&tmdb=1`,
    },
  ],

  TV_SOURCES: [
    {
      name: 'VidSrc Pro',
      icon: '🎬',
      getUrl: (tmdb_id, s, e) => `https://vidsrc.to/embed/tv/${tmdb_id}/${s}/${e}`,
    },
    {
      name: 'VidSrc.me',
      icon: '📺',
      getUrl: (tmdb_id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${tmdb_id}&season=${s}&episode=${e}`,
    },
    {
      name: '2Embed',
      icon: '🎥',
      getUrl: (tmdb_id, s, e) => `https://www.2embed.cc/embedtv/${tmdb_id}&s=${s}&e=${e}`,
    },
  ],
};

function hasApiKey() {
  return true;
}
