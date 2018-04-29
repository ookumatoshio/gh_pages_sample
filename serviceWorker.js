var cacheName = "tempConverterShell";

var filesToCache = ["/", "/index.html", "/script/app.js", "/styles/app.css"];

// install(SWがブラウザ環境にインストール時)
self.addEventListener("install", function(event) {
  console.log("service worker installing");

  // waitUntil()は、SWのイベントを延命するためのメソッド
  // 中にPromiseの処理があっても、その処理が完了するまではwaitUntilは終わらない
  // キャッシュ中にインストールが完了するのを防ぐ
  event.waitUntil(
    // "tempConverterShell"のキャッシュをオープンする
    caches.open(cacheName).then(function(cache) {
      console.log("service worker caching app shell");
      // ウェブアプリの基本的な構成要素である「アップシェル」をキャッシュする
      return cache.addAll(filesToCache);
    })
  );
});

// activate(SWが起動時)
self.addEventListener("activate", function(event) {
  console.log("service worker activating");

  event.waitUntil(
    // キャッシュのアップデート
    caches.keys().then(function(keyList) {
      return Promise.all(
        keyList.map(function(key) {
          // 古いキャッシュを削除する
          if (key !== cacheName) {
            console.log("service worker removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  // その他の処理
  // 最初のロード時にページを制御する（呼ばなくても２回目以降にページは制御される）
  return self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  console.log("service worker fetching", event.request.url);

  event.requestWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.response);
    })
  );
});
