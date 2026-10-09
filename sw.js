const CACHE_NAME = "pwa-reconocimiento-ale-v1";

const ARCHIVOS = [
"./",
"./index.html",
"./reconocimiento.html",
"./estilos.css",
"./app.js",
"./manifest.json",
"./logo.png"
];

/* INSTALACIÓN */

self.addEventListener(
"install",
event => {

```
    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(ARCHIVOS);

            })

    );

    self.skipWaiting();

}
```

);

/* ACTIVACIÓN */

self.addEventListener(
"activate",
event => {

```
    event.waitUntil(

        caches.keys()
            .then(nombres => {

                return Promise.all(

                    nombres
                        .filter(nombre =>
                            nombre !== CACHE_NAME
                        )
                        .map(nombre =>
                            caches.delete(nombre)
                        )

                );

            })

    );

    self.clients.claim();

}
```

);

/* PETICIONES */

self.addEventListener(
"fetch",
event => {

```
    event.respondWith(

        caches.match(event.request)
            .then(respuesta => {

                return respuesta ||
                    fetch(event.request);

            })

    );

}
```

);
