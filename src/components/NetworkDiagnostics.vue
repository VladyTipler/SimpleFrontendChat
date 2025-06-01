<!-- src/components/NetworkDiagnostics.vue -->
<template>
    <div class="network-diagnostics" v-if="show">
        <div class="diagnostics-modal">
            <div class="diagnostics-header">
                <h3>🔧 Диагностика сети</h3>
                <button @click="closeDiagnostics" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="diagnostics-content">
                <div class="diagnostic-item">
                    <strong>Устройство:</strong>
                    <span :class="deviceType.class">{{ deviceType.text }}</span>
                </div>

                <div class="diagnostic-item">
                    <strong>Протокол:</strong>
                    <span :class="protocolInfo.class">{{ protocolInfo.text }}</span>
                </div>

                <div class="diagnostic-item">
                    <strong>Webhook URL:</strong>
                    <span :class="webhookInfo.class">{{ webhookInfo.text }}</span>
                </div>

                <div class="diagnostic-item">
                    <strong>Статус сети:</strong>
                    <span :class="networkStatus.class">{{ networkStatus.text }}</span>
                </div>

                <div class="diagnostic-item">
                    <strong>Подключение:</strong>
                    <span :class="connectionInfo.class">{{ connectionInfo.text }}</span>
                </div>

                <div class="test-section">
                    <div class="test-buttons">
                        <button
                            @click="testConnection"
                            :disabled="testing"
                            class="test-btn"
                        >
                            <i :class="testing ? 'fas fa-spinner fa-spin' : 'fas fa-wifi'"></i>
                            {{ testing ? 'Тестирование...' : 'Тест подключения' }}
                        </button>

                        <button
                            @click="testFullAPI"
                            :disabled="testing"
                            class="test-btn api-test"
                        >
                            <i :class="testing ? 'fas fa-spinner fa-spin' : 'fas fa-robot'"></i>
                            {{ testing ? 'Тестирование API...' : 'Тест API' }}
                        </button>
                    </div>

                    <div v-if="testResult" class="test-result" :class="testResult.class">
                        <pre>{{ testResult.message }}</pre>
                    </div>
                </div>

                <div class="recommendations">
                    <h4>💡 Рекомендации:</h4>
                    <ul>
                        <li v-for="rec in recommendations" :key="rec">{{ rec }}</li>
                    </ul>
                </div>

                <!-- Advanced section -->
                <details class="advanced-section">
                    <summary>🔬 Расширенная диагностика</summary>
                    <div class="advanced-content">
                        <div class="diagnostic-item">
                            <strong>User Agent:</strong>
                            <span class="code-text">{{ navigator.userAgent }}</span>
                        </div>
                        <div class="diagnostic-item">
                            <strong>Поддержка fetch:</strong>
                            <span :class="fetchSupport ? 'success' : 'error'">
                                {{ fetchSupport ? '✅ Поддерживается' : '❌ Не поддерживается' }}
                            </span>
                        </div>
                        <div class="diagnostic-item">
                            <strong>Cookies включены:</strong>
                            <span :class="cookiesEnabled ? 'success' : 'warning'">
                                {{ cookiesEnabled ? '✅ Включены' : '⚠️ Отключены' }}
                            </span>
                        </div>
                    </div>
                </details>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    webhookUrl: String,
    show: Boolean
})

const emit = defineEmits(['close'])

const testing = ref(false)
const testResult = ref(null)

// Advanced diagnostics
const fetchSupport = computed(() => typeof fetch !== 'undefined')
const cookiesEnabled = computed(() => navigator.cookieEnabled)

// Device detection
const deviceType = computed(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    return {
        text: isMobile ? '📱 Мобильное устройство' : '💻 Десктоп',
        class: isMobile ? 'mobile' : 'desktop'
    }
})

// Protocol info
const protocolInfo = computed(() => {
    const isHttps = window.location.protocol === 'https:'
    return {
        text: isHttps ? '🔒 HTTPS (безопасно)' : '🔓 HTTP',
        class: isHttps ? 'secure' : 'insecure'
    }
})

// Webhook info
const webhookInfo = computed(() => {
    if (!props.webhookUrl) {
        return {
            text: '❌ Не настроен',
            class: 'error'
        }
    }

    const isHttps = props.webhookUrl.startsWith('https://')
    const isLocalhost = props.webhookUrl.includes('localhost') || props.webhookUrl.includes('127.0.0.1')

    if (isLocalhost) {
        return {
            text: '🏠 Localhost',
            class: 'localhost'
        }
    }

    return {
        text: isHttps ? '🔒 HTTPS' : '🔓 HTTP',
        class: isHttps ? 'secure' : 'insecure'
    }
})

// Network status
const networkStatus = computed(() => {
    if (!navigator.onLine) {
        return {
            text: '❌ Оффлайн',
            class: 'error'
        }
    }

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (connection) {
        return {
            text: `✅ Онлайн (${connection.effectiveType || 'неизвестно'})`,
            class: 'success'
        }
    }

    return {
        text: '✅ Онлайн',
        class: 'success'
    }
})

// Connection info
const connectionInfo = computed(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (!connection) {
        return {
            text: 'Информация недоступна',
            class: 'unknown'
        }
    }

    const speed = connection.downlink ? `${connection.downlink} Mbps` : 'неизвестно'
    return {
        text: `${connection.type || 'неизвестно'} (${speed})`,
        class: connection.downlink > 1 ? 'good' : 'slow'
    }
})

// Recommendations
const recommendations = computed(() => {
    const recs = []
    const isMobile = deviceType.value.class === 'mobile'
    const isHttps = window.location.protocol === 'https:'
    const webhookIsHttps = props.webhookUrl?.startsWith('https://')

    if (isMobile) {
        recs.push('На мобильных устройствах проверьте стабильность интернет-соединения')
        recs.push('Убедитесь что сервер доступен из мобильных сетей')
        recs.push('Попробуйте отключить/включить WiFi или мобильные данные')
    }

    if (isHttps && !webhookIsHttps && props.webhookUrl) {
        recs.push('⚠️ Используйте HTTPS для webhook URL (смешанный контент блокируется)')
    }

    if (!props.webhookUrl) {
        recs.push('Настройте webhook URL в настройках')
    }

    if (props.webhookUrl?.includes('localhost')) {
        recs.push('Localhost может быть недоступен с мобильных устройств')
    }

    recs.push('Убедитесь что на сервере настроены CORS заголовки')
    recs.push('Проверьте что API endpoint отвечает на POST запросы')

    return recs
})

const testConnection = async () => {
    if (!props.webhookUrl) {
        testResult.value = {
            message: 'Webhook URL не настроен',
            class: 'error'
        }
        return
    }

    testing.value = true
    testResult.value = null

    try {
        const startTime = Date.now()

        const response = await fetch(props.webhookUrl, {
            method: 'HEAD',
            mode: 'cors'
        })

        const duration = Date.now() - startTime

        if (response.ok) {
            testResult.value = {
                message: `✅ Соединение успешно (${duration}ms)\nStatus: ${response.status}\nHeaders: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`,
                class: 'success'
            }
        } else {
            testResult.value = {
                message: `⚠️ Сервер отвечает с ошибкой: ${response.status}\nStatus Text: ${response.statusText}`,
                class: 'warning'
            }
        }
    } catch (error) {
        testResult.value = {
            message: `❌ Ошибка подключения:\n${error.name}: ${error.message}`,
            class: 'error'
        }
    } finally {
        testing.value = false
    }
}

const testFullAPI = async () => {
    if (!props.webhookUrl) {
        testResult.value = {
            message: 'Webhook URL не настроен',
            class: 'error'
        }
        return
    }

    testing.value = true
    testResult.value = null

    try {
        const startTime = Date.now()

        const testPayload = {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: 'Тест подключения'
                }
            ],
            max_tokens: 10,
            temperature: 0.7,
            stream: false
        }

        const response = await fetch(props.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': navigator.userAgent
            },
            body: JSON.stringify(testPayload),
            cache: 'no-cache',
            credentials: 'omit',
            mode: 'cors'
        })

        const duration = Date.now() - startTime
        const responseText = await response.text()

        let result = `🔍 Полный тест API (${duration}ms)\n`
        result += `Status: ${response.status} ${response.statusText}\n`
        result += `Headers:\n${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\n`
        result += `Response Body:\n${responseText}\n`

        if (response.ok) {
            try {
                const data = JSON.parse(responseText)
                result += `✅ JSON парсинг успешен\n`
                result += `Response Structure: ${JSON.stringify(Object.keys(data), null, 2)}`

                testResult.value = {
                    message: result,
                    class: 'success'
                }
            } catch (jsonError) {
                result += `❌ Ошибка парсинга JSON: ${jsonError.message}`
                testResult.value = {
                    message: result,
                    class: 'warning'
                }
            }
        } else {
            testResult.value = {
                message: result,
                class: 'error'
            }
        }
    } catch (error) {
        testResult.value = {
            message: `❌ Ошибка API теста:\n${error.name}: ${error.message}`,
            class: 'error'
        }
    } finally {
        testing.value = false
    }
}

const closeDiagnostics = () => {
    emit('close')
}
</script>

<style lang="scss" scoped>
.network-diagnostics {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh; /* Use dynamic viewport height for mobile */
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999; /* Higher z-index */
    padding: $space-md;
    backdrop-filter: blur(4px);
}

.diagnostics-modal {
    background: $bg-main;
    border-radius: $radius-lg;
    box-shadow: $shadow-xl;
    width: 100%;
    max-width: 600px;
    max-height: 85vh;
    max-height: 85dvh; /* Use dynamic viewport height */
    overflow: hidden;
    position: relative;

    @media (max-width: $breakpoint-mobile) {
        max-height: 90vh;
        max-height: 90dvh;
        margin: 0;
        border-radius: $radius-md;
    }
}

.diagnostics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-lg;
    border-bottom: 1px solid $border-light;
    background: $bg-main;
    flex-shrink: 0;

    @media (max-width: $breakpoint-mobile) {
        padding: $space-md;
    }

    h3 {
        margin: 0;
        color: $text-primary;
        font-size: 18px;

        @media (max-width: $breakpoint-mobile) {
            font-size: 16px;
        }
    }
}

.close-btn {
    background: none;
    border: none;
    color: $text-tertiary;
    cursor: pointer;
    padding: $space-sm;
    border-radius: $radius-md;
    transition: all $transition-fast;
    font-size: 18px;
    min-width: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background: $bg-code;
        color: $text-primary;
    }
}

.diagnostics-content {
    padding: $space-lg;
    max-height: calc(85vh - 80px);
    max-height: calc(85dvh - 80px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    @media (max-width: $breakpoint-mobile) {
        padding: $space-md;
        max-height: calc(90vh - 60px);
        max-height: calc(90dvh - 60px);
    }
}

.diagnostic-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: $space-md;
    padding: $space-sm 0;
    border-bottom: 1px solid $border-light;
    gap: $space-md;

    &:last-child {
        border-bottom: none;
    }

    strong {
        color: $text-primary;
        min-width: 100px;
        flex-shrink: 0;
        font-size: 14px;

        @media (max-width: $breakpoint-mobile) {
            min-width: 80px;
            font-size: 13px;
        }
    }

    span {
        text-align: right;
        word-break: break-all;
        font-size: 14px;

        @media (max-width: $breakpoint-mobile) {
            font-size: 13px;
        }
    }
}

.code-text {
    font-family: $font-mono;
    font-size: 11px;
    background: $bg-code;
    padding: $space-xs;
    border-radius: $radius-sm;
    max-width: 250px;
    overflow-wrap: break-word;

    @media (max-width: $breakpoint-mobile) {
        max-width: 180px;
        font-size: 10px;
    }
}

.mobile { color: #f59e0b; }
.desktop { color: #10b981; }
.secure { color: #10b981; }
.insecure { color: #f59e0b; }
.error { color: #ef4444; }
.success { color: #10b981; }
.warning { color: #f59e0b; }
.localhost { color: #6366f1; }
.unknown { color: $text-muted; }
.good { color: #10b981; }
.slow { color: #f59e0b; }

.test-section {
    margin: $space-xl 0;
}

.test-buttons {
    display: flex;
    gap: $space-md;
    margin-bottom: $space-md;

    @media (max-width: $breakpoint-mobile) {
        flex-direction: column;
        gap: $space-sm;
    }
}

.test-btn {
    background: $color-primary;
    border: none;
    color: white;
    padding: $space-md $space-lg;
    border-radius: $radius-md;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all $transition-fast;
    display: inline-flex;
    align-items: center;
    gap: $space-sm;
    flex: 1;
    justify-content: center;
    min-height: 44px; /* Touch-friendly */

    @media (max-width: $breakpoint-mobile) {
        padding: $space-md;
        font-size: 13px;
    }

    &:hover:not(:disabled) {
        background: $color-primary-dark;
    }

    &:disabled {
        background: $text-muted;
        cursor: not-allowed;
    }

    &.api-test {
        background: #10b981;

        &:hover:not(:disabled) {
            background: #059669;
        }
    }
}

.test-result {
    margin-top: $space-md;
    padding: $space-md;
    border-radius: $radius-md;
    font-weight: 500;
    max-height: 200px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    @media (max-width: $breakpoint-mobile) {
        max-height: 150px;
        padding: $space-sm;
    }

    pre {
        white-space: pre-wrap;
        word-wrap: break-word;
        font-family: $font-mono;
        font-size: 12px;
        margin: 0;

        @media (max-width: $breakpoint-mobile) {
            font-size: 11px;
        }
    }

    &.success {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.2);
    }

    &.error {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.2);
    }

    &.warning {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.2);
    }
}

.recommendations {
    margin-top: $space-xl;

    h4 {
        color: $text-primary;
        margin-bottom: $space-md;
        font-size: 16px;

        @media (max-width: $breakpoint-mobile) {
            font-size: 14px;
        }
    }

    ul {
        margin: 0;
        padding-left: $space-lg;

        li {
            margin-bottom: $space-sm;
            color: $text-secondary;
            line-height: 1.5;
            font-size: 14px;

            @media (max-width: $breakpoint-mobile) {
                font-size: 13px;
            }
        }
    }
}

.advanced-section {
    margin-top: $space-xl;
    border: 1px solid $border-light;
    border-radius: $radius-md;
    overflow: hidden;

    summary {
        padding: $space-md;
        cursor: pointer;
        background: $bg-code;
        font-weight: 500;
        color: $text-primary;
        transition: background-color $transition-fast;
        font-size: 14px;

        @media (max-width: $breakpoint-mobile) {
            font-size: 13px;
        }

        &:hover {
            background: rgba(0, 0, 0, 0.05);
        }
    }
}

.advanced-content {
    padding: $space-md;
    border-top: 1px solid $border-light;
}

// Dark theme support
.dark-theme .advanced-section,
html[data-theme="dark"] .advanced-section {
    summary:hover {
        background: rgba(255, 255, 255, 0.05);
    }
}

@media (prefers-color-scheme: dark) {
    :root:not(.dark-theme):not([data-theme="light"]) {
        .advanced-section summary:hover {
            background: rgba(255, 255, 255, 0.05);
        }
    }
}
</style>
