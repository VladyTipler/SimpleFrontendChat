<template>
    <div class="modal" @click="handleBackdropClick">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Настройки</h3>
                <button class="close-modal" @click="$emit('close')">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-body">
                <!-- API Settings -->
                <div class="settings-section">
                    <h4 class="section-title">
                        <i class="fas fa-plug"></i>
                        API Настройки
                    </h4>

                    <div class="form-group">
                        <label for="webhookUrl">Webhook URL</label>
                        <input
                            type="url"
                            id="webhookUrl"
                            v-model="localSettings.webhookUrl"
                            placeholder="https://your-api-endpoint.com/chat"
                            required
                        >
                        <small class="form-help">URL вашего API endpoint для отправки сообщений</small>
                    </div>

                    <div class="form-group">
                        <label for="apiKey">API Key (опционально)</label>
                        <input
                            type="password"
                            id="apiKey"
                            v-model="localSettings.apiKey"
                            placeholder="Введите API ключ"
                        >
                        <small class="form-help">API ключ для авторизации запросов</small>
                    </div>

                    <div class="form-group">
                        <label for="modelName">Модель</label>
                        <select id="modelName" v-model="localSettings.modelName">
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="claude-3-opus">Claude 3 Opus</option>
                            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                            <option value="claude-3-haiku">Claude 3 Haiku</option>
                            <option value="gemini-pro">Gemini Pro</option>
                        </select>
                    </div>
                </div>

                <!-- Generation Settings -->
                <div class="settings-section">
                    <h4 class="section-title">
                        <i class="fas fa-brain"></i>
                        Параметры генерации
                    </h4>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                v-model="localSettings.enableStreaming"
                            >
                            <span class="checkmark"></span>
                            Включить потоковую передачу
                        </label>
                        <small class="form-help">Получать ответы в реальном времени</small>
                    </div>

                    <div class="form-group">
                        <label for="maxTokens">Максимум токенов</label>
                        <input
                            type="number"
                            id="maxTokens"
                            v-model.number="localSettings.maxTokens"
                            min="1"
                            max="8192"
                        >
                        <small class="form-help">Максимальное количество токенов в ответе</small>
                    </div>

                    <div class="form-group">
                        <label for="temperature">Температура</label>
                        <input
                            type="range"
                            id="temperature"
                            v-model.number="localSettings.temperature"
                            min="0"
                            max="2"
                            step="0.1"
                        >
                        <span class="temperature-value">{{ localSettings.temperature }}</span>
                        <small class="form-help">Контролирует креативность ответов (0 - точность, 2 - креативность)</small>
                    </div>
                </div>

                <!-- PWA Settings -->
                <div class="settings-section">
                    <h4 class="section-title">
                        <i class="fas fa-mobile-alt"></i>
                        Настройки приложения
                    </h4>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                v-model="localSettings.enableNotifications"
                                :disabled="!notificationsSupported"
                            >
                            <span class="checkmark"></span>
                            Включить уведомления
                            <i
                                v-if="!notificationsSupported"
                                class="fas fa-exclamation-triangle"
                                title="Уведомления не поддерживаются в данном браузере"
                            ></i>
                        </label>
                        <small class="form-help">
                            Получать уведомления о новых сообщениях когда приложение в фоне
                            <span v-if="!notificationsSupported" class="text-warning">(не поддерживается)</span>
                        </small>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                v-model="localSettings.enableAutoSave"
                            >
                            <span class="checkmark"></span>
                            Автосохранение чатов
                        </label>
                        <small class="form-help">Автоматически сохранять чаты в локальном хранилище</small>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input
                                type="checkbox"
                                v-model="localSettings.enableOfflineMode"
                            >
                            <span class="checkmark"></span>
                            Офлайн режим
                        </label>
                        <small class="form-help">Сохранять сообщения для отправки при восстановлении соединения</small>
                    </div>

                    <div class="form-group">
                        <label for="theme">Тема</label>
                        <select id="theme" v-model="localSettings.theme">
                            <option value="auto">Автоматически</option>
                            <option value="light">Светлая</option>
                            <option value="dark">Темная</option>
                        </select>
                        <small class="form-help">Выберите тему интерфейса</small>
                    </div>
                </div>

                <!-- PWA Info -->
                <div v-if="showPWAInfo" class="settings-section">
                    <h4 class="section-title">
                        <i class="fas fa-info-circle"></i>
                        Информация о приложении
                    </h4>

                    <div class="pwa-info">
                        <div class="pwa-status-item">
                            <span class="status-label">Статус:</span>
                            <span class="status-value" :class="pwaStatus.class">
                                <i :class="pwaStatus.icon"></i>
                                {{ pwaStatus.text }}
                            </span>
                        </div>

                        <div class="pwa-status-item">
                            <span class="status-label">Соединение:</span>
                            <span class="status-value" :class="isOnline ? 'online' : 'offline'">
                                <i :class="isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash'"></i>
                                {{ isOnline ? 'Онлайн' : 'Офлайн' }}
                            </span>
                        </div>

                        <div class="pwa-status-item">
                            <span class="status-label">Уведомления:</span>
                            <span class="status-value" :class="notificationStatus.class">
                                <i :class="notificationStatus.icon"></i>
                                {{ notificationStatus.text }}
                            </span>
                        </div>

                        <div class="pwa-status-item">
                            <span class="status-label">Версия:</span>
                            <span class="status-value">1.0.0</span>
                        </div>
                    </div>

                    <div class="pwa-actions">
                        <button
                            v-if="isInstallable && !isInstalled"
                            class="pwa-action-btn"
                            @click="installApp"
                        >
                            <i class="fas fa-download"></i>
                            Установить приложение
                        </button>

                        <button
                            v-if="updateAvailable"
                            class="pwa-action-btn"
                            @click="updateApp"
                        >
                            <i class="fas fa-sync-alt"></i>
                            Обновить приложение
                        </button>

                        <button
                            class="pwa-action-btn secondary"
                            @click="clearCache"
                        >
                            <i class="fas fa-trash"></i>
                            Очистить кэш
                        </button>

                        <button
                            v-if="!localSettings.enableNotifications && notificationsSupported"
                            class="pwa-action-btn secondary"
                            @click="requestNotifications"
                        >
                            <i class="fas fa-bell"></i>
                            Разрешить уведомления
                        </button>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn-secondary" @click="$emit('close')">Отмена</button>
                <button class="btn-primary" @click="handleSave">Сохранить</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { usePWA } from '../composables/usePWA'
import { useToasts } from '../composables/useToasts'

const props = defineProps({
    settings: Object
})

const emit = defineEmits(['close', 'save'])

const { showToast } = useToasts()
const {
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    installApp: pwaInstallApp,
    updateServiceWorker,
    clearCache: pwaClearCache,
    requestNotificationPermission
} = usePWA()

const localSettings = ref({
    webhookUrl: '',
    apiKey: '',
    modelName: 'gpt-4',
    enableStreaming: false,
    maxTokens: 2048,
    temperature: 0.7,
    enableNotifications: false,
    enableAutoSave: true,
    enableOfflineMode: true,
    theme: 'auto'
})

const showPWAInfo = ref(true)

// Computed properties
const notificationsSupported = computed(() => {
    return 'Notification' in window
})

const pwaStatus = computed(() => {
    if (isInstalled.value) {
        return {
            text: 'Установлено',
            class: 'installed',
            icon: 'fas fa-check-circle'
        }
    } else if (isInstallable.value) {
        return {
            text: 'Готово к установке',
            class: 'installable',
            icon: 'fas fa-download'
        }
    } else {
        return {
            text: 'Веб-версия',
            class: 'web',
            icon: 'fas fa-globe'
        }
    }
})

const notificationStatus = computed(() => {
    if (!notificationsSupported.value) {
        return {
            text: 'Не поддерживается',
            class: 'not-supported',
            icon: 'fas fa-times-circle'
        }
    }

    const permission = Notification.permission
    if (permission === 'granted') {
        return {
            text: 'Разрешены',
            class: 'granted',
            icon: 'fas fa-check-circle'
        }
    } else if (permission === 'denied') {
        return {
            text: 'Запрещены',
            class: 'denied',
            icon: 'fas fa-times-circle'
        }
    } else {
        return {
            text: 'Не запрошены',
            class: 'default',
            icon: 'fas fa-question-circle'
        }
    }
})

// Methods
const handleSave = () => {
    emit('save', localSettings.value)
}

const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
        emit('close')
    }
}

const installApp = async () => {
    try {
        await pwaInstallApp()
    } catch (error) {
        showToast('Ошибка при установке приложения', 'error')
    }
}

const updateApp = () => {
    updateServiceWorker()
}

const clearCache = async () => {
    try {
        await pwaClearCache()
    } catch (error) {
        showToast('Ошибка при очистке кэша', 'error')
    }
}

const requestNotifications = async () => {
    try {
        const granted = await requestNotificationPermission()
        if (granted) {
            localSettings.value.enableNotifications = true
        }
    } catch (error) {
        showToast('Ошибка при запросе разрешений', 'error')
    }
}

// Initialize local settings when props change
watch(() => props.settings, (newSettings) => {
    if (newSettings) {
        localSettings.value = { ...localSettings.value, ...newSettings }
    }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.modal {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.modal-content {
    background: $bg-main;
    border-radius: $radius-lg;
    box-shadow: $shadow-xl;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    animation: modalSlideIn $transition-normal ease-out;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-xl;
    border-bottom: 1px solid $border-light;

    h3 {
        font-size: 20px;
        font-weight: 600;
        color: $text-primary;
    }
}

.close-modal {
    background: none;
    border: none;
    color: $text-tertiary;
    cursor: pointer;
    font-size: 20px;
    padding: $space-sm;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &:hover {
        background: $bg-code;
        color: $text-primary;
    }
}

.modal-body {
    padding: 0;
    max-height: 60vh;
    overflow-y: auto;
}

.settings-section {
    padding: $space-xl;
    border-bottom: 1px solid $border-light;

    &:last-child {
        border-bottom: none;
    }
}

.section-title {
    display: flex;
    align-items: center;
    gap: $space-sm;
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $space-lg;

    i {
        color: $color-primary;
    }
}

.form-group {
    margin-bottom: $space-xl;

    &:last-child {
        margin-bottom: 0;
    }

    label {
        display: block;
        margin-bottom: $space-sm;
        font-weight: 500;
        color: $text-primary;
        font-size: 14px;
    }

    input[type="text"],
    input[type="url"],
    input[type="password"],
    input[type="number"],
    select {
        width: 100%;
        padding: $space-md;
        border: 1px solid $border-light;
        border-radius: $radius-md;
        font-size: 14px;
        transition: border-color $transition-fast;
        background: $bg-main;
        color: $text-primary;

        &:focus {
            outline: none;
            border-color: $color-primary;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        &:disabled {
            background: $bg-code;
            color: $text-muted;
            cursor: not-allowed;
        }
    }

    input[type="range"] {
        width: 100%;
        margin: $space-sm 0;
    }
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: $space-sm;
    cursor: pointer;
    font-weight: normal;

    input[type="checkbox"] {
        width: auto;
        margin: 0;

        &:disabled {
            cursor: not-allowed;
        }
    }

    .fa-exclamation-triangle {
        color: $color-warning;
        margin-left: $space-xs;
    }
}

.form-help {
    display: block;
    margin-top: $space-xs;
    font-size: 12px;
    color: $text-tertiary;
    line-height: 1.4;

    .text-warning {
        color: $color-warning;
    }
}

.temperature-value {
    display: inline-block;
    margin-left: $space-sm;
    font-weight: 500;
    color: $color-primary;
}

.pwa-info {
    background: $bg-code;
    border-radius: $radius-md;
    padding: $space-lg;
    margin-bottom: $space-lg;
}

.pwa-status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $space-sm;

    &:last-child {
        margin-bottom: 0;
    }
}

.status-label {
    font-weight: 500;
    color: $text-secondary;
}

.status-value {
    display: flex;
    align-items: center;
    gap: $space-xs;
    font-weight: 500;

    &.online { color: $color-success; }
    &.offline { color: $color-error; }
    &.installed { color: $color-success; }
    &.installable { color: $color-primary; }
    &.web { color: $text-secondary; }
    &.granted { color: $color-success; }
    &.denied { color: $color-error; }
    &.default { color: $color-warning; }
    &.not-supported { color: $text-muted; }
}

.pwa-actions {
    display: flex;
    flex-wrap: wrap;
    gap: $space-sm;
}

.pwa-action-btn {
    background: $color-primary;
    border: none;
    color: white;
    cursor: pointer;
    padding: $space-sm $space-md;
    border-radius: $radius-md;
    font-size: 13px;
    font-weight: 500;
    transition: all $transition-fast;
    display: flex;
    align-items: center;
    gap: $space-xs;

    &:hover {
        background: $color-primary-dark;
        transform: translateY(-1px);
    }

    &.secondary {
        background: $bg-main;
        border: 1px solid $border-light;
        color: $text-secondary;

        &:hover {
            background: $bg-code;
            color: $text-primary;
            transform: translateY(-1px);
        }
    }
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: $space-md;
    padding: $space-xl;
    border-top: 1px solid $border-light;
    background: $bg-code;
}

.btn-primary {
    background: $color-primary;
    border: none;
    color: white;
    cursor: pointer;
    padding: $space-md $space-xl;
    border-radius: $radius-md;
    font-size: 14px;
    font-weight: 500;
    transition: all $transition-fast;

    &:hover {
        background: $color-primary-dark;
        transform: translateY(-1px);
    }
}

.btn-secondary {
    background: $bg-main;
    border: 1px solid $border-light;
    color: $text-secondary;
    cursor: pointer;
    padding: $space-md $space-xl;
    border-radius: $radius-md;
    font-size: 14px;
    font-weight: 500;
    transition: all $transition-fast;

    &:hover {
        background: $bg-code;
        color: $text-primary;
    }
}
</style>
