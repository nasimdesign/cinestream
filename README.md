# 🎬 CineStream

A free, open-source movie & TV streaming site with a premium dark UI. Built to fix the **"Iframe Sandbox Detected"** error from the original CinePlay site.

## 🚀 Live Demo
> Deploy via GitHub Pages — see setup below.

## ✨ Features
- 🎥 **Watch Movies & TV Shows** — powered by VidSrc, 2Embed & more (no sandbox errors!)
- 🔍 **Search** — find anything with live search
- 📺 **TV Show Support** — browse seasons and episodes
- ⭐ **Watchlist** — save titles locally
- 🌑 **Premium Dark UI** — glassmorphism, smooth animations, Netflix-style rows
- 📱 **Fully Responsive** — works on mobile, tablet, desktop
- 🔄 **Multiple Servers** — switch sources if one doesn't work

## 🛠 Setup

### 1. Get a Free TMDB API Key
1. Go to [themoviedb.org](https://www.themoviedb.org) and create a free account
2. Visit [Settings → API](https://www.themoviedb.org/settings/api)
3. Copy your **API Key (v3 auth)**

### 2. Open the site
Open `index.html` in your browser. On first visit, paste your TMDB API key in the setup screen.

### 3. Deploy to GitHub Pages
```bash
git clone https://github.com/YOUR_USERNAME/cinestream
cd cinestream
# Enable GitHub Pages from repo Settings → Pages → Deploy from branch (main, / root)
```

## 🔧 Why the Original Site Breaks

The original CinePlay site uses **CinemaOS Player** embedded in an `<iframe>` with `sandbox` restrictions. The sandbox attribute blocks scripts, popups, and same-origin access — all things the player needs.

**Their error:**
> *Iframe Sandbox Detected — This embed's iframe has sandbox restrictions that block CinemaOS Player from functioning correctly.*

**Our fix:** We use **VidSrc.to** and **2Embed.cc** — these players work perfectly inside iframes with just `allowfullscreen` and `allow="autoplay; fullscreen"`. No sandbox attribute needed.

## 📁 Project Structure
```
cinestream/
├── index.html      # Homepage with hero + content rows
├── watch.html      # Watch page with player + info
├── search.html     # Search & browse page
├── css/
│   └── style.css   # Complete design system
└── js/
    ├── api.js      # TMDB API wrapper + embed sources
    └── utils.js    # Utilities, watchlist, helpers
```

## 🎬 Video Sources Used
| Source | Movie | TV |
|--------|-------|-----|
| VidSrc Pro | `vidsrc.to/embed/movie/{id}` | `vidsrc.to/embed/tv/{id}/{s}/{e}` |
| VidSrc.me  | `vidsrc.me/embed/movie?tmdb={id}` | `vidsrc.me/embed/tv?tmdb={id}&season={s}&episode={e}` |
| 2Embed     | `2embed.cc/embed/{id}` | `2embed.cc/embedtv/{id}&s={s}&e={e}` |
| MultiEmbed | `multiembed.mov/?video_id={id}&tmdb=1` | — |

## ⚠️ Disclaimer
This project is for **educational and personal use only**. We do not host any video content. All streams are sourced from third-party embed providers. Movie metadata is provided by [TMDB](https://www.themoviedb.org).

## 📜 License
MIT — free to use, modify, and distribute.
