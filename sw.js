const CACHE_NAME = "yasinappv210987";
const urlsToCache = [
  "/",
  "/yasin.html",
  "/yasin.js",
  "/yasina.js",
  "/asset/data/yasin_data.json",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/index.html",
  "/yasinb.js",
  "https://fonts.googleapis.com/css2?family=Amiri&family=Noto+Naskh+Arabic&family=Roboto&family=Scheherazade&family=Lateef&family=Almarai:wght@300;400;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
  "/asset/data/ad_dhuha_data.json",
  "/asset/data/al_adiyat_data.json",
  "/asset/data/al_alaq_data.json",
  "/asset/data/al_asr_data.json",
  "/asset/data/al_a_la_data.json",
  "/asset/data/al_balad_data.json",
  "/asset/data/al_bayyinah_data.json",
  "/asset/data/al_fajr_data.json",
  "/asset/data/al_falaq_data.json",
  "/asset/data/al_fatihah_data.json",
  "/asset/data/al_fiil_data.json",
  "/asset/data/al_ghasyiyah_data.json",
  "/asset/data/al_humazah_data.json",
  "/asset/data/al_ikhlas_data.json",
  "/asset/data/al_infitar_data.json",
  "/asset/data/al_insyirah_data.json",
  "/asset/data/al_kafirun_data.json",
  "/asset/data/al_kautsar_data.json",
  "/asset/data/al_lahab_data.json",
  "/asset/data/al_maun_data.json",
  "/asset/data/al_qadr_data.json",
  "/asset/data/al_qari_ah_data.json",
  "/asset/data/al_quraisy_data.json",
  "/asset/data/al_zalzalah_data.json",
  "/asset/data/an_nasr_data.json",
  "/asset/data/an_nas_data.json",
  "/asset/data/asy_syams_data.json",
  "/asset/data/ath_thariq_data.json",
  "/asset/data/at_takatsur_data.json",
  "/asset/data/at_tin_data.json",
  "/asset/data/yasin_data.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("Failed to cache:", error);
      });
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
