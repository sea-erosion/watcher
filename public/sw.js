// カクヨムリーダーのService Worker
//
// 方針:
//  - 実際の小説データはIndexedDBに保存されるため、ここでキャッシュするのは
//    「サイトを動かすためのアプリ本体(HTML/JS/CSS/アイコン)」だけ。
//  - Next.jsのビルド成果物はファイル名にハッシュが付くため、ビルド時の
//    ファイル一覧を事前キャッシュするのではなく、アクセスされた同一オリジンの
//    GETリクエストを都度キャッシュに保存していく方式(ランタイムキャッシュ)を採る。
//  - そのため「一度オンラインで開いたページ」はオフラインでも再表示できる。
//    まだ一度も開いていないページ(例: 一度も開いていない話)はオフラインでは
//    表示できず、代わりにオフライン案内ページを表示する。

const CACHE_VERSION = "v2";
const CACHE_NAME = `kkm-reader-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

// インストール時に最低限のアプリシェルを先読みしておく。
// /read は話数ごとにページが分かれていた以前の構成と異なり、
// どの話番号でも1つの静的ページ(?num=クエリパラメータで出し分け)で
// 表示できるため、これをキャッシュしておくだけで全話オフライン対応になる。
const PRECACHE_URLS = [
  "/",
  "/work",
  "/read",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // GET以外(POSTなど)や他オリジンへのリクエストはそのまま素通しする
  if (request.method !== "GET" || new URL(request.url).origin !== location.origin) {
    return;
  }

  // ページ遷移(ナビゲーション): ネットワーク優先、失敗したらキャッシュ→アプリシェル→オフライン案内の順に代替
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  // それ以外(JS/CSS/画像/データ取得など): stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirstNavigate(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      // クエリパラメータ(例: /read?num=5)はキャッシュキーから除いて保存する。
      // /read は話数によらず同じ静的ページなので、1つ保存しておけば
      // どの話番号でもこのキャッシュがヒットするようにするため。
      cache.put(stripSearch(request), response.clone());
    }
    return response;
  } catch (err) {
    // 1. まずクエリ込みの完全一致を試す
    const cached = await cache.match(request);
    if (cached) return cached;

    // 2. クエリを無視して一致を試す(/read?num=5 → /read のキャッシュを使う)
    const cachedIgnoringSearch = await cache.match(request, { ignoreSearch: true });
    if (cachedIgnoringSearch) return cachedIgnoringSearch;

    // 3. このページ自体は未訪問だが、アプリ本体("/")がキャッシュ済みなら
    //    それを返してクライアント側ルーティングに任せる
    const shell = await cache.match("/");
    if (shell) return shell;

    return cache.match(OFFLINE_URL);
  }
}

function stripSearch(request) {
  const url = new URL(request.url);
  if (!url.search) return request;
  url.search = "";
  return url.toString();
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await networkFetch) || Response.error();
}
