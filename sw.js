const CACHE_NAME = 'mimi-roulette-v3'; // ★更新するたびにここを v4, v5... と変えるのが作法
const urlsToCache = [
  './',
  './index.html',
  './src/songs.json',
  './src/icon.png'
];

// インストール処理
self.addEventListener('install', (event) => {
  // 新しいSW即時発動させる
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate時の処理（古いキャッシュの削除）
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 即座にページをコントロールする
  return self.clients.claim();
});

// フェッチ処理（ここが重要：ネットワーク優先にする）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワークから成功したら、キャッシュを更新してそのレスポンスを返す
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // 成功したレスポンスをクローンしてキャッシュに入れる
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // オフラインなどでネットワーク失敗したらキャッシュを返す
        return caches.match(event.request);
      })
  );
});