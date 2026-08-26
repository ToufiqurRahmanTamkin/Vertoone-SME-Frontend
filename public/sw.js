const VERSION = 'v1';
const SHELL_CACHE = `vertoone-shell-${VERSION}`;
const ASSET_CACHE = `vertoone-assets-${VERSION}`;
const IMAGE_CACHE = `vertoone-images-${VERSION}`;
const FONT_CACHE = `vertoone-fonts-${VERSION}`;

const OFFLINE_URL = '/offline.html';
const APP_SHELL_URL = '/index.html';

const SHELL_URLS = [OFFLINE_URL, '/manifest.json', '/brand-logo.png'];

const CURRENT_CACHES = [SHELL_CACHE, ASSET_CACHE, IMAGE_CACHE, FONT_CACHE];

const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];

const IMAGE_EXTENSIONS = /\.(?:png|jpe?g|gif|webp|avif|svg|ico)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => undefined)
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !CURRENT_CACHES.includes(key)).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const putInCache = async (cacheName, request, response) => {
  if (!response || !response.ok || response.type === 'opaque') return response;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  return response;
};

const cacheFirst = async (cacheName, request) => {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request)
      .then((response) => putInCache(cacheName, request, response))
      .catch(() => undefined);
    return cached;
  }
  const response = await fetch(request);
  return putInCache(cacheName, request, response);
};

const staleWhileRevalidate = async (cacheName, request) => {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then((response) => putInCache(cacheName, request, response))
    .catch(() => undefined);
  return cached || network || fetch(request);
};

const handleNavigation = async (request) => {
  try {
    const response = await fetch(request);
    await putInCache(SHELL_CACHE, APP_SHELL_URL, response);
    return response;
  } catch (error) {
    const cachedShell = await caches.match(APP_SHELL_URL);
    if (cachedShell) return cachedShell;
    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;
    throw error;
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  if (FONT_ORIGINS.includes(url.origin)) {
    event.respondWith(cacheFirst(FONT_CACHE, request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(ASSET_CACHE, request));
    return;
  }

  if (IMAGE_EXTENSIONS.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(IMAGE_CACHE, request));
    return;
  }

  if (url.pathname === '/manifest.json') {
    event.respondWith(staleWhileRevalidate(SHELL_CACHE, request));
  }
});
