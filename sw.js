
/*
  PWA: RECONOCIMIENTO DE IMÁGENES

  1. Memoria caché: guarda los archivos de la aplicación.
  2. API CACHE: guarda las respuestas de los recursos
     del modelo de Teachable Machine cuando es posible.
*/

const CACHE_APP = "pwa-reconocimiento-ale-v2";
const CACHE_API = "pwa-reconocimiento-api-v1";

const ARCHIVOS_APP = [
  "./",
  "./index.html",
  "./reconocimiento.html",
  "./estilos.css",
  "./app.js",
  "./manifest.json",
  "./logo.png"
];

const URL_MODELO =
  "https://teachablemachine.withgoogle.com/models/MaCKnC-v3/";

/* INSTALACIÓN: guardar archivos de la aplicación */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_APP)
      .then((cache) => cache.addAll(ARCHIVOS_APP))
      .then(() => self.skipWaiting())
  );
});

/* ACTIVACIÓN: eliminar cachés antiguas de este proyecto */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) =>
            nombre.startsWith("pwa-reconocimiento-") &&
            nombre !== CACHE_APP &&
            nombre !== CACHE_API
          )
          .map((nombre) => caches.delete(nombre))
      )
    ).then(() => self.clients.claim())
  );
});

/* PETICIONES: caché de archivos y recursos del modelo */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* 1. MEMORIA CACHÉ: archivos del mismo sitio */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((guardada) => {
        if (guardada) {
          console.info("[MEMORIA CACHÉ] Archivo recuperado:", url.href);
          return guardada;
        }

        return fetch(request);
      })
    );
    return;
  }

  /* 2. API CACHE: recursos del modelo de Teachable Machine */
  if (url.href.startsWith(URL_MODELO)) {
    event.respondWith(
      caches.open(CACHE_API).then(async (cache) => {
        const guardada = await cache.match(request);

        if (guardada) {
          console.info("[API CACHE] Respuesta recuperada:", url.href);
          return guardada;
        }

        try {
          const respuesta = await fetch(request);

          if (respuesta.ok && respuesta.type !== "opaque") {
            await cache.put(request, respuesta.clone());
            console.info("[API CACHE] Respuesta guardada:", url.href);
          }

          return respuesta;
        } catch (error) {
          const respaldo = await cache.match(request);

          if (respaldo) {
            console.info("[API CACHE] Usando respuesta guardada:", url.href);
            return respaldo;
          }

          throw error;
        }
      })
    );
  }
});
