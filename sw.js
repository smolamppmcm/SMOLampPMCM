const CACHE_NAME = 'smolamp-pwa-v1.10CA';

// Instalação: força o worker a assumir o controle imediatamente
self.addEventListener('install', event => {
    self.skipWaiting();
});

// Ativação: limpa caches antigos caso a versão mude no futuro
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptação de requisições: Estratégia Network-First
// Tenta buscar da rede sempre para garantir a versão mais nova. Se falhar (offline), usa o cache.
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
