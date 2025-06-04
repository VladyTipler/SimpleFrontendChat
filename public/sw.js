const CACHE_NAME = 'ai-chat-v1'
const STATIC_CACHE_NAME = 'ai-chat-static-v1'
const DYNAMIC_CACHE_NAME = 'ai-chat-dynamic-v1'

// Статические ресурсы для кэширования
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // Добавьте сюда пути к вашим статическим ресурсам
]

// Внешние ресурсы
const EXTERNAL_RESOURCES = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css'
]

// Установка Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Installing...')

    event.waitUntil(
        Promise.all([
            // Кэшируем статические ресурсы
            caches.open(STATIC_CACHE_NAME).then(cache => {
                return cache.addAll(STATIC_ASSETS)
            }),
            // Кэшируем внешние ресурсы
            caches.open(STATIC_CACHE_NAME).then(cache => {
                return cache.addAll(EXTERNAL_RESOURCES)
            })
        ]).then(() => {
            console.log('[SW] Installation complete')
            // Принудительно активируем новый SW
            return self.skipWaiting()
        })
    )
})

// Активация Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activating...')

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Удаляем старые кэши
                    if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName)
                        return caches.delete(cacheName)
                    }
                })
            )
        }).then(() => {
            console.log('[SW] Activation complete')
            // Захватываем управление всеми открытыми вкладками
            return self.clients.claim()
        })
    )
})

// Обработка запросов
self.addEventListener('fetch', event => {
    const { request } = event
    const url = new URL(request.url)

    // Пропускаем non-HTTP запросы
    if (!request.url.startsWith('http')) {
        return
    }

    // Пропускаем WebSocket соединения
    if (request.url.includes('ws://') || request.url.includes('wss://')) {
        return
    }

    // Для API запросов используем Network First стратегию
    if (isApiRequest(request)) {
        event.respondWith(networkFirst(request))
        return
    }

    // Для статических ресурсов используем Cache First стратегию
    if (isStaticAsset(request)) {
        event.respondWith(cacheFirst(request))
        return
    }

    // Для HTML страниц используем Network First с Fallback
    if (isNavigationRequest(request)) {
        event.respondWith(networkFirstWithFallback(request))
        return
    }

    // Для остальных запросов используем Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request))
})

// Стратегии кэширования

// Cache First - сначала проверяем кэш, потом сеть
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
        return cachedResponse
    }

    try {
        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE_NAME)
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    } catch (error) {
        console.log('[SW] Cache First failed:', error)
        throw error
    }
}

// Network First - сначала сеть, потом кэш
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME)
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', error)
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
            return cachedResponse
        }
        throw error
    }
}

// Network First с Fallback на офлайн страницу
async function networkFirstWithFallback(request) {
    try {
        const networkResponse = await fetch(request)
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME)
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    } catch (error) {
        console.log('[SW] Network failed for navigation, trying cache:', error)
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
            return cachedResponse
        }

        // Возвращаем основную страницу как fallback
        const fallbackResponse = await caches.match('/')
        if (fallbackResponse) {
            return fallbackResponse
        }

        throw error
    }
}

// Stale While Revalidate - возвращаем из кэша, обновляем в фоне
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME)
    const cachedResponse = await cache.match(request)

    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone())
        }
        return networkResponse
    }).catch(error => {
        console.log('[SW] Stale while revalidate failed:', error)
    })

    return cachedResponse || fetchPromise
}

// Утилиты для определения типа запроса

function isApiRequest(request) {
    // Определяем API запросы по URL или заголовкам
    return request.url.includes('/api/') ||
        request.headers.get('content-type')?.includes('application/json')
}

function isStaticAsset(request) {
    const url = new URL(request.url)
    return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/)
}

function isNavigationRequest(request) {
    return request.mode === 'navigate' ||
        (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
}

// Обработка сообщений от главного потока
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME })
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                )
            }).then(() => {
                event.ports[0].postMessage({ success: true })
            })
        )
    }
})

// Уведомления
self.addEventListener('notificationclick', event => {
    event.notification.close()

    const urlToOpen = event.notification.data?.url || '/'

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Ищем уже открытое окно
            for (const client of clientList) {
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus()
                }
            }

            // Открываем новое окно
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen)
            }
        })
    )
})

// Push уведомления
self.addEventListener('push', event => {
    if (!event.data) return

    const data = event.data.json()
    const options = {
        body: data.body || 'Новое сообщение от AI Assistant',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Открыть',
                icon: '/icons/icon-72x72.png'
            },
            {
                action: 'close',
                title: 'Закрыть'
            }
        ]
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'AI Chat Assistant', options)
    )
})
