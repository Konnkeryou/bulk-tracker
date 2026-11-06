// Offline-first: precache the app shell, serve cache-first, refresh in the background.
// Bump VERSION whenever files change so phones pick up the update.

const VERSION = 'bulk-v1';
const SHELL = [
  './', './index.html', './styles.css', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './src/app.js', './src/store.js', './src/state-schema.js',
  './src/core/dates.js', './src/core/stats.js', './src/core/trend.js', './src/core/e1rm.js', './src/core/plates.js',
  './src/core/calories.js', './src/core/swaps.js', './src/core/nutrition.js', './src/core/csv.js', './src/core/review.js', './src/core/ops.js',
  './src/data/foods.js', './src/data/recipes.js', './src/data/exercises.js', './src/data/templates.js',
  './src/ui/dom.js', './src/ui/chart.js', './src/ui/selectors.js',
  './src/ui/views/today.js', './src/ui/views/train.js', './src/ui/views/food.js', './src/ui/views/body.js',
  './src/ui/views/review.js', './src/ui/views/more.js', './src/ui/views/plates-ui.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(event.request, { ignoreSearch: true });
      const network = fetch(event.request)
        .then((res) => {
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
