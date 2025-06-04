import { ref, onMounted } from 'vue'
import { useToasts } from './useToasts'

export function usePWA() {
    const { showToast } = useToasts()

    const isOnline = ref(navigator.onLine)
    const isInstallable = ref(false)
    const isInstalled = ref(false)
    const updateAvailable = ref(false)
    const swRegistration = ref(null)
    const deferredPrompt = ref(null)

    // Проверяем, установлено ли приложение
    const checkIfInstalled = () => {
        // Проверяем display-mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            isInstalled.value = true
            return
        }

        // Проверяем navigator.standalone для iOS
        if (window.navigator.standalone === true) {
            isInstalled.value = true
            return
        }

        // Проверяем document.referrer для некоторых браузеров
        if (document.referrer.includes('android-app://')) {
            isInstalled.value = true
            return
        }

        isInstalled.value = false
    }

    // Регистрируем Service Worker
    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                })

                swRegistration.value = registration

                console.log('[PWA] Service Worker registered:', registration)

                // Проверяем обновления
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            updateAvailable.value = true
                            showToast('Доступно обновление приложения', 'info')
                        }
                    })
                })

                // Слушаем сообщения от Service Worker
                navigator.serviceWorker.addEventListener('message', event => {
                    if (event.data.type === 'CACHE_UPDATED') {
                        showToast('Кэш приложения обновлен', 'success')
                    }
                })

                return registration
            } catch (error) {
                console.error('[PWA] Service Worker registration failed:', error)
                throw error
            }
        }
    }

    // Обновляем Service Worker
    const updateServiceWorker = () => {
        if (swRegistration.value && swRegistration.value.waiting) {
            swRegistration.value.waiting.postMessage({ type: 'SKIP_WAITING' })
            updateAvailable.value = false
            showToast('Приложение обновляется...', 'info')

            // Перезагружаем страницу после обновления
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload()
            })
        }
    }

    // Устанавливаем приложение
    const installApp = async () => {
        if (!deferredPrompt.value) {
            showToast('Установка недоступна в данном браузере', 'warning')
            return false
        }

        try {
            // Показываем диалог установки
            deferredPrompt.value.prompt()

            // Ждем ответа пользователя
            const { outcome } = await deferredPrompt.value.userChoice

            if (outcome === 'accepted') {
                showToast('Приложение успешно установлено!', 'success')
                isInstallable.value = false
                isInstalled.value = true
            } else {
                showToast('Установка отменена', 'info')
            }

            deferredPrompt.value = null
            return outcome === 'accepted'
        } catch (error) {
            console.error('[PWA] Installation failed:', error)
            showToast('Ошибка при установке приложения', 'error')
            return false
        }
    }

    // Показываем уведомление
    const showNotification = async (title, options = {}) => {
        if (!('Notification' in window)) {
            console.warn('[PWA] Notifications not supported')
            return false
        }

        let permission = Notification.permission

        if (permission === 'default') {
            permission = await Notification.requestPermission()
        }

        if (permission === 'granted') {
            const defaultOptions = {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                vibrate: [200, 100, 200],
                ...options
            }

            if (swRegistration.value) {
                // Показываем через Service Worker
                return swRegistration.value.showNotification(title, defaultOptions)
            } else {
                // Показываем напрямую
                return new Notification(title, defaultOptions)
            }
        }

        return false
    }

    // Запрашиваем разрешение на уведомления
    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            showToast('Уведомления не поддерживаются в данном браузере', 'warning')
            return false
        }

        const permission = await Notification.requestPermission()

        if (permission === 'granted') {
            showToast('Разрешение на уведомления получено', 'success')
            return true
        } else {
            showToast('Разрешение на уведомления отклонено', 'warning')
            return false
        }
    }

    // Очищаем кэш
    const clearCache = async () => {
        if (swRegistration.value) {
            const messageChannel = new MessageChannel()

            return new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        showToast('Кэш очищен', 'success')
                        resolve(true)
                    } else {
                        showToast('Ошибка при очистке кэша', 'error')
                        resolve(false)
                    }
                }

                swRegistration.value.active.postMessage(
                    { type: 'CLEAR_CACHE' },
                    [messageChannel.port2]
                )
            })
        }
    }

    // Получаем информацию о приложении
    const getAppInfo = () => {
        return {
            isOnline: isOnline.value,
            isInstallable: isInstallable.value,
            isInstalled: isInstalled.value,
            updateAvailable: updateAvailable.value,
            swRegistration: swRegistration.value,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            language: navigator.language,
            languages: navigator.languages,
            onLine: navigator.onLine,
            storage: {
                localStorage: !!window.localStorage,
                sessionStorage: !!window.sessionStorage,
                indexedDB: !!window.indexedDB
            },
            apis: {
                serviceWorker: 'serviceWorker' in navigator,
                notifications: 'Notification' in window,
                geolocation: 'geolocation' in navigator,
                camera: 'mediaDevices' in navigator,
                battery: 'getBattery' in navigator
            }
        }
    }

    // Инициализация
    const initializePWA = async () => {
        // Проверяем статус установки
        checkIfInstalled()

        // Регистрируем Service Worker
        try {
            await registerServiceWorker()
        } catch (error) {
            console.error('[PWA] Failed to register service worker:', error)
        }

        // Слушаем изменения сетевого статуса
        window.addEventListener('online', () => {
            isOnline.value = true
            showToast('Соединение восстановлено', 'success')
        })

        window.addEventListener('offline', () => {
            isOnline.value = false
            showToast('Нет соединения с интернетом', 'warning')
        })

        // Слушаем событие установки
        window.addEventListener('beforeinstallprompt', (e) => {
            // Предотвращаем автоматический показ диалога
            e.preventDefault()
            deferredPrompt.value = e
            isInstallable.value = true

            // Показываем уведомление о возможности установки
            setTimeout(() => {
                if (!isInstalled.value) {
                    showToast('Приложение можно установить на устройство', 'info')
                }
            }, 5000)
        })

        // Слушаем событие успешной установки
        window.addEventListener('appinstalled', () => {
            isInstalled.value = true
            isInstallable.value = false
            deferredPrompt.value = null
            showToast('Приложение установлено!', 'success')
        })

        console.log('[PWA] Initialization complete')
    }

    return {
        // Состояние
        isOnline,
        isInstallable,
        isInstalled,
        updateAvailable,
        swRegistration,

        // Методы
        installApp,
        updateServiceWorker,
        showNotification,
        requestNotificationPermission,
        clearCache,
        getAppInfo,
        initializePWA
    }
}
