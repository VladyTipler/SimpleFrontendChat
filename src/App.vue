<template>
    <div class="app-container">
        <!-- Floating Sidebar Toggle for Desktop -->
        <button
            class="sidebar-toggle-desktop"
            :class="{ visible: showDesktopToggle }"
            @click="openSidebar"
        >
            <i class="fas fa-bars"></i>
        </button>

        <!-- Sidebar -->
        <Sidebar
            :is-open="sidebarOpen"
            :is-collapsed="sidebarCollapsed"
            :chats="chats"
            :current-chat-id="currentChatId"
            @close="closeSidebar"
            @toggle-mobile="toggleSidebarMobile"
            @new-chat="createNewChat"
            @switch-chat="switchChat"
            @delete-chat="deleteChat"
            @open-settings="openSettings"
        />

        <!-- Main content -->
        <div class="main-content">
            <ChatContainer
                :current-chat="currentChat"
                :uploaded-files="uploadedFiles"
                :is-typing="isTyping"
                :artifacts-open="artifactsOpen"
                @send-message="sendMessage"
                @clear-chat="clearCurrentChat"
                @file-upload="handleFileUpload"
                @remove-file="removeFile"
                @open-artifact="openArtifact"
                @copy-artifact="copyArtifact"
                @playground-artifact="openArtifactInPlayground"
                @preview-artifact="openArtifactInPreview"
                @toggle-sidebar="toggleSidebarMobile"
            />

            <!-- Artifacts Panel -->
            <ArtifactsPanel
                v-if="artifactsOpen"
                :artifact="currentArtifact"
                :is-fullscreen="artifactsFullscreen"
                @close="closeArtifacts"
                @toggle-fullscreen="toggleFullscreen"
            />
        </div>

        <!-- Settings Modal -->
        <SettingsModal
            v-if="settingsOpen"
            :settings="settings"
            @close="closeSettings"
            @save="saveSettings"
        />

        <!-- PWA Install Prompt -->
        <PWAInstallPrompt
            ref="pwaPrompt"
            @install="handlePWAInstall"
            @update="handlePWAUpdate"
            @dismiss="handlePWADismiss"
        />

        <!-- Toast notifications -->
        <ToastContainer :toasts="toasts" @remove="removeToast" />

        <!-- Resize overlay -->
        <div
            class="resize-overlay"
            :class="{ active: isResizing }"
        ></div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStorage, useWindowSize } from '@vueuse/core'
import Sidebar from './components/Sidebar.vue'
import ChatContainer from './components/ChatContainer.vue'
import ArtifactsPanel from './components/ArtifactsPanel.vue'
import SettingsModal from './components/SettingsModal.vue'
import ToastContainer from './components/ToastContainer.vue'
import PWAInstallPrompt from './components/PwaInstallPrompt.vue'
import { useChatStore } from './composables/useChatStore'
import { useArtifacts } from './composables/useArtifacts'
import { useToasts } from './composables/useToasts'
import { useApi } from './composables/useApi'
import { usePWA } from './composables/usePWA'

// Window size
const { width } = useWindowSize()

// PWA
const {
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    initializePWA,
    showNotification,
    requestNotificationPermission
} = usePWA()

// Store composables
const {
    chats,
    currentChatId,
    currentChat,
    createNewChat,
    switchChat,
    deleteChat,
    clearCurrentChat,
    addMessageToChat,
    loadChats,
    saveChats
} = useChatStore()

const {
    currentArtifact,
    artifactsOpen,
    artifactsFullscreen,
    openArtifact,
    closeArtifacts,
    toggleFullscreen,
    copyArtifact,
    openArtifactInPlayground,
    openArtifactInPreview
} = useArtifacts()

const { toasts, showToast, removeToast } = useToasts()
const { sendToAPI } = useApi()

// Sidebar state
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const showDesktopToggle = computed(() =>
    width.value > 768 && sidebarCollapsed.value
)

// UI state
const isTyping = ref(false)
const isResizing = ref(false)
const uploadedFiles = ref([])
const settingsOpen = ref(false)

// PWA refs
const pwaPrompt = ref(null)

// Settings
const settings = useStorage('aiChatSettings', {
    webhookUrl: '',
    apiKey: '',
    modelName: 'gpt-4',
    enableStreaming: false,
    maxTokens: 2048,
    temperature: 0.7,
    enableNotifications: false
})

// Sidebar methods
const openSidebar = () => {
    if (width.value <= 768) {
        sidebarOpen.value = true
    } else {
        sidebarCollapsed.value = false
    }
}

const closeSidebar = () => {
    if (width.value <= 768) {
        sidebarOpen.value = false
    } else {
        sidebarCollapsed.value = true
    }
}

const toggleSidebarMobile = () => {
    sidebarOpen.value = !sidebarOpen.value
}

// Message handling
const sendMessage = async (content, files) => {
    if (!content.trim() && files.length === 0) return

    if (!settings.value.webhookUrl) {
        showToast('Пожалуйста, настройте Webhook URL в настройках', 'error')
        openSettings()
        return
    }

    const message = {
        id: generateId(),
        type: 'user',
        content: content || '',
        files: [...files],
        timestamp: new Date()
    }

    addMessageToChat(message)
    uploadedFiles.value = []

    isTyping.value = true

    try {
        const response = await sendToAPI(currentChat.value.messages, settings.value, currentChatId.value)
        isTyping.value = false

        if (response?.content) {
            const assistantMessage = {
                id: generateId(),
                type: 'assistant',
                content: response.content,
                timestamp: new Date()
            }

            addMessageToChat(assistantMessage)

            // Show notification if app is in background and notifications are enabled
            if (settings.value.enableNotifications && document.hidden && isInstalled.value) {
                showNotification('AI Assistant', {
                    body: 'Получен новый ответ от ассистента',
                    icon: '/icons/icon-192x192.png',
                    tag: 'new-message',
                    requireInteraction: false
                })
            }
        }
    } catch (error) {
        isTyping.value = false
        showToast('Ошибка при отправке сообщения: ' + error.message, 'error')
    }
}

// File handling
const handleFileUpload = (files) => {
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            showToast(`Файл "${file.name}" слишком большой (максимум 10MB)`, 'warning')
            return
        }

        uploadedFiles.value.push({
            file,
            name: file.name,
            type: file.type,
            size: file.size,
            id: generateId()
        })
    })
}

const removeFile = (index) => {
    uploadedFiles.value.splice(index, 1)
}

// Settings
const openSettings = () => {
    settingsOpen.value = true
}

const closeSettings = () => {
    settingsOpen.value = false
}

const saveSettings = async (newSettings) => {
    const oldSettings = { ...settings.value }
    settings.value = { ...settings.value, ...newSettings }
    settingsOpen.value = false
    showToast('Настройки сохранены', 'success')

    // Request notification permission if enabled
    if (newSettings.enableNotifications && !oldSettings.enableNotifications) {
        const granted = await requestNotificationPermission()
        if (!granted) {
            settings.value.enableNotifications = false
        }
    }
}

// PWA event handlers
const handlePWAInstall = () => {
    console.log('[App] PWA installed successfully')
    showToast('Приложение установлено! Теперь вы можете использовать его как обычное приложение.', 'success')
}

const handlePWAUpdate = () => {
    console.log('[App] PWA updated successfully')
    showToast('Приложение обновлено до последней версии', 'success')
}

const handlePWADismiss = (type) => {
    console.log('[App] PWA prompt dismissed:', type)
}

// Handle PWA shortcuts
const handlePWAActions = () => {
    window.addEventListener('pwa-action', (event) => {
        const { action } = event.detail

        switch (action) {
            case 'new-chat':
                createNewChat()
                showToast('Создан новый чат', 'success')
                break
            case 'settings':
                openSettings()
                break
            default:
                console.log('[App] Unknown PWA action:', action)
        }
    })
}

// Utility
const generateId = () => {
    return Math.random().toString(36).substr(2, 9)
}

// Handle app visibility changes
const handleVisibilityChange = () => {
    if (document.hidden) {
        // App went to background
        console.log('[App] App went to background')
    } else {
        // App came to foreground
        console.log('[App] App came to foreground')

        // Clear any notifications
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                if (registration.getNotifications) {
                    registration.getNotifications({ tag: 'new-message' }).then(notifications => {
                        notifications.forEach(notification => notification.close())
                    })
                }
            })
        }
    }
}

// Handle online/offline status
const handleConnectionChange = () => {
    if (isOnline.value) {
        showToast('Соединение восстановлено', 'success')

        // Sync any pending data when back online
        if (currentChat.value && currentChat.value.messages.length > 0) {
            saveChats()
        }
    } else {
        showToast('Приложение работает в офлайн режиме', 'warning')
    }
}

// Watch for window resize
watch(width, (newWidth) => {
    if (newWidth <= 768) {
        if (sidebarCollapsed.value) {
            sidebarCollapsed.value = false
            sidebarOpen.value = false
        }
    } else {
        if (sidebarOpen.value) {
            sidebarOpen.value = false
        }
    }
})

// Watch for online status changes
watch(isOnline, handleConnectionChange)

// Initialize
onMounted(async () => {
    // Initialize PWA
    await initializePWA()

    // Load chats
    loadChats()
    if (chats.value.size === 0) {
        createNewChat()
    }

    // Setup PWA action handlers
    handlePWAActions()

    // Handle app visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Show welcome notification for installed app
    if (isInstalled.value && isOnline.value) {
        setTimeout(() => {
            showToast('Добро пожаловать в AI Chat Assistant!', 'success')
        }, 1000)
    }

    // Setup keyboard shortcuts for installed app
    if (isInstalled.value) {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + N for new chat
            if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
                event.preventDefault()
                createNewChat()
            }

            // Ctrl/Cmd + , for settings
            if ((event.ctrlKey || event.metaKey) && event.key === ',') {
                event.preventDefault()
                openSettings()
            }

            // Escape to close modals
            if (event.key === 'Escape') {
                if (settingsOpen.value) {
                    closeSettings()
                } else if (artifactsOpen.value) {
                    closeArtifacts()
                }
            }
        })
    }

    // Show install prompt for eligible users
    if (isInstallable.value && !isInstalled.value) {
        setTimeout(() => {
            if (pwaPrompt.value) {
                pwaPrompt.value.showInstallPrompt()
            }
        }, 30000) // Show after 30 seconds
    }
})
</script>

<style lang="scss" scoped>
.app-container {
    // PWA specific styles - ТОЛЬКО для standalone режима
    @media (display-mode: standalone) {
        // Добавляем padding только в standalone режиме
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        padding-left: env(safe-area-inset-left);
        padding-right: env(safe-area-inset-right);

        // Предотвращаем overscroll только в PWA
        overscroll-behavior: none;

        // Улучшаем touch interactions только в PWA
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
        touch-action: manipulation;
    }

    // Для iOS PWA - используем правильную высоту
    @supports (-webkit-touch-callout: none) {
        @media (display-mode: standalone) {
            height: 100vh;
            height: -webkit-fill-available;
        }
    }
}

// Улучшенные touch targets ТОЛЬКО для PWA
@media (display-mode: standalone) {
    .sidebar-toggle-desktop,
    .sidebar-toggle-mobile,
    .clear-chat-btn,
    .send-btn,
    .file-btn {
        min-height: 44px;
        min-width: 44px;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    }

    // Улучшенный скроллинг для iOS PWA
    .chat-messages,
    .sidebar-content {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
    }

    // Предотвращаем pull-to-refresh только в PWA
    body {
        overscroll-behavior-y: none;
    }
}

// Удаляем проблемные глобальные стили для мобильных браузеров
.pwa-loading {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: $bg-page;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;

    .loading-content {
        text-align: center;

        .loading-icon {
            width: 64px;
            height: 64px;
            background: $color-primary;
            border-radius: $radius-lg;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto $space-lg;
            font-size: 28px;
            color: white;
            animation: pulse 2s infinite;
        }

        h3 {
            color: $text-primary;
            margin-bottom: $space-sm;
        }

        p {
            color: $text-secondary;
            font-size: 14px;
        }
    }
}
</style>
