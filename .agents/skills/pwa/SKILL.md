---
name: pwa
description: Use when the user asks to make a site installable, turn it into a PWA, add a service worker, add a web app manifest, enable "add to home screen", or support offline. Also use when adding favicon/app icons, iOS home-screen support (apple-mobile-web-app meta tags), or verifying PWA installability.
license: MIT
authors: "SpinSpire Team"
---

# PWA Installability

Make a web app installable and iOS-friendly with a minimal service worker. Default posture is **network-only** (no caching) unless the app needs offline — pick a strategy deliberately, never by default.

## When to Use

- "Make it installable / a PWA"
- "Add a service worker" / "add a web manifest" / "add to home screen"
- "Works offline?" or "works on iPhone?"

## The Three Pillars

1. **HTTPS** — required for service workers (localhost exempt in dev).
2. **Web app manifest** — name, icons, start_url, display → makes it installable.
3. **Service worker** — background script; active SW + valid manifest unlocks the install prompt.

## Quick Reference

| Asset | Where it goes | Notes |
|-------|---------------|-------|
| `manifest.webmanifest` | site root (`static/` for SvelteKit) | name, short_name, start_url, scope, display `standalone`, theme/background color, icons 192+512 + maskable |
| `favicon-32/48/64.png` | root | browser tab icons; also `apple-touch-icon.png` 180px for iOS |
| `icon-192.png`, `icon-512.png` | root | required by Chrome for install |
| `icon-maskable-512.png` | root | full-bleed background, content in center 80% safe zone |
| `sw.js` | root (`static/` for SvelteKit) | register from client code; served at site root for correct scope |
| `offline.html` (optional) | root | fallback for failed navigations if offline support is wanted |

## Service Worker

### Default: network-only (no caching)

```js
self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
	event.respondWith(fetch(event.request));
});
```

This makes the app installable and always-fresh. Use for apps where data lives server-side / in a spreadsheet and serving stale data is wrong.

### Offline fallback (add only if offline support is requested)

```js
const CACHE = 'capstone-v1';

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE).then((c) => c.addAll(['/', '/offline.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png']))
	);
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	const url = new URL(event.request.url);
	if (event.request.mode === 'navigate') {
		event.respondWith(fetch(event.request).catch(() => caches.match('/offline.html')));
		return;
	}
	if (url.origin === location.origin && ['css', 'js', 'svg', 'png', 'jpg', 'woff2'].some((ext) => url.pathname.endsWith('.' + ext))) {
		event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => { const clone = res.clone(); caches.open(CACHE).then((c) => c.put(event.request, clone)); return res; })));
		return;
	}
	event.respondWith(fetch(event.request));
});
```

## Caching strategy decision table

| Strategy | Behavior | Use for |
|----------|----------|---------|
| **Network only** | Always hit network, never cache | Auth, live/volatile data, spreadsheets, anything where stale is wrong. **Default.** |
| **Cache first** | Serve from cache, update in background | Static assets: css/js, fonts, images |
| **Network first** | Try network, fall back to cache | HTML pages, API reads where offline read > error |
| **Stale while revalidate** | Serve stale instantly, refresh cache | Semi-static content, lists |

When caching, version the cache name and delete old caches in `activate`. Never cache `POST` or auth'd API responses.

## Registration (client side)

Register on mount, not at parse time, so it never delays first paint:

```js
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('SW registration failed', err));
}
```

In SvelteKit, put this in `+layout.svelte` `onMount`. The SW must be at the site root (`/sw.js`) — `static/sw.js` ships there via adapter-static.

## Manifest

```json
{
  "name": "Capstone — Construction business operations",
  "short_name": "Capstone",
  "description": "One-line description.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#faf9f6",
  "theme_color": "#1f2933",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Link it in the HTML head: `<link rel="manifest" href="/manifest.webmanifest" />`.

## Icons from source images

- Source should be square (e.g. 768×768). Crop/resize with ImageMagick:
  ```bash
  magick src.png -resize 192x192 icon-192.png
  magick src.png -resize 512x512 icon-512.png
  magick -size 512x512 xc:"#1f2933" \( src.png -resize 60% +repage \) -gravity center -composite icon-maskable-512.png
  ```
- Maskable icons need a full-bleed background with the logo at ~60% inside the center safe zone.

## iOS support (Safari / Add to Home Screen)

iOS ignores `theme_color` and needs legacy meta tags:

```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="AppName" />
<meta name="theme-color" content="#1f2933" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
```

Caveats:
- iOS has no `beforeinstallprompt` — users install via **Share → Add to Home Screen**.
- iOS may evict service workers after ~7 days of inactivity (Intelligent Tracking Prevention) — expect re-registration on next visit.

## Pre-ship audit

1. `bun run check` (or project typecheck) and build pass.
2. Start dev server, then verify with agent-browser:
   - manifest + SW reachable: `curl -s -o /dev/null -w "%{http_code}" localhost:5173/manifest.webmanifest` → 200
   - all icon assets return 200 (favicon-32/48/64, apple-touch-icon, icon-192/512, icon-maskable-512, sw.js)
   - SW registered + active:
     ```
     agent-browser eval "navigator.serviceWorker.getRegistration().then(r => ({ scope: r?.scope, active: r?.active?.state }))"
     ```
   - links present in head: `rel=icon`, `rel=apple-touch-icon`, `rel=manifest`, `meta[name=theme-color]`
3. Production requires HTTPS (Cloudflare Pages et al. provide it). Local dev on `http://localhost` is exempt for SW registration.
4. Optional: run Lighthouse PWA audit in Chrome DevTools.

## Common Mistakes

- **Registering SW in `<head>` or at module top-level** — delays first paint; use onMount.
- **Caching auth'd or volatile API responses** — serves stale or broken data. Keep those network-only.
- **SW not at root** — `/sw.js` only controls the scope beneath it; a SW in `/js/sw.js` won't control `/`.
- **Skipping maskable icon** — Android adaptive icons will crop the logo without one.
- **Cache name never versioned / old caches never deleted** — disk fills and stale assets linger.
- **Forgetting iOS meta tags** — app opens in Safari tab instead of standalone, wrong status bar.