/* ============================================================
   sw.js — RRC 讲解器 Service Worker（v6 块 5）
   必须放在仓库根目录：scope 由脚本路径决定，assets/sw.js 只能管 /assets/。
   策略：install 预缓存核心壳（页面+引擎，内容 JS 首次访问后进运行时缓存）；
   fetch 只拦同 origin GET，cache-first + 网络回填 + 失败兜底缓存；
   版本化 CACHE 名 + skipWaiting + clients.claim——更新发版改 CACHE 号即全量换血。
   注册侧三重约束（index/app/interview 尾部）：仅 https: 注册——本地 http/file
   与全部测试面零影响；GitHub Pages 是 HTTPS 满足要求。
   ============================================================ */
var CACHE = 'rrc-v8';
var CORE = [
  'index.html', 'app.html', 'interview.html', 'dict.html', 'anim.html', 'timer-net.html',
  'variables-map.html', 'log-detective.html', 'meas-sandbox.html', 'search.html', 'manual.html',
  'assets/site.css', 'assets/engine.js', 'assets/player.js', 'assets/interview.js',
  'assets/flowanim.js', 'assets/flowanim2.js', 'manifest.json', 'assets/icon-192.png', 'assets/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (ca) { return ca.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (resp) {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          var clone = resp.clone();
          caches.open(CACHE).then(function (ca) { ca.put(req, clone); });
        }
        return resp;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
