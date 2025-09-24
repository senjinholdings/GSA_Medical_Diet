const CACHE_NAME = 'dir_testsite001yobi-v3';
const urlsToCache = [
  './',
  './styles.css',
  './app.js',
  './images/injection-MV.webp',
  './images/favicon.png',
  './images/ranking_header_banner.webp'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// フェッチ時にキャッシュから返す
self.addEventListener('fetch', event => {
  const reqUrl = new URL(event.request.url);
  // このディレクトリ配下のみを扱う（スコープ外は素通し）
  if (!self.registration.scope || !reqUrl.href.startsWith(self.registration.scope)) {
    return; // 他ディレクトリ/ドメインは何もしない
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(networkRes => {
        // 同ディレクトリ配下のみキャッシュ
        if (reqUrl.href.startsWith(self.registration.scope) && /\.(webp|jpg|png|css|js)$/.test(reqUrl.pathname)) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkRes;
      });
    })
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});