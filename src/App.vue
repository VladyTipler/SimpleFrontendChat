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
                :artifacts-fullscreen="artifactsFullscreen"
                @send-message="sendMessage"
                @file-upload="handleFileUpload"
                @remove-file="removeFile"
                @open-artifact="openArtifact"
                @copy-artifact="copyArtifact"
                @playground-artifact="openArtifactInPlayground"
                @preview-artifact="openArtifactInPreview"
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

        <!-- Toast notifications -->
        <ToastContainer :toasts="toasts" @remove="removeToast" />

        <!-- Theme Switcher -->
        <div class="theme-switcher-container">
            <ThemeSwitcher />
        </div>

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
import ThemeSwitcher from './components/ThemeSwitcher.vue'
import { useChatStore } from './composables/useChatStore'
import { useArtifacts } from './composables/useArtifacts'
import { useToasts } from './composables/useToasts'
import { useApi } from './composables/useApi'

// Window size
const { width } = useWindowSize()

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

// Settings
const settings = useStorage('aiChatSettings', {
    webhookUrl: '',
    apiKey: '',
    modelName: 'gpt-4',
    enableStreaming: false,
    maxTokens: 2048,
    temperature: 0.7
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

const saveSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }
    settingsOpen.value = false
    showToast('Настройки сохранены', 'success')
}

// Utility
const generateId = () => {
    return Math.random().toString(36).substr(2, 9)
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

// Initialize
onMounted(() => {
    loadChats()
    if (chats.value.size === 0) {
        createNewChat()
    }
})
</script>

<style lang="scss" scoped>
.main-content {
    flex: 1;
    display: flex;
    background: $bg-page;
    overflow: hidden;
    transition: margin-right $transition-normal;
    min-width: 0;
    position: relative;
}

.theme-switcher-container {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 1000;

    @media (max-width: $breakpoint-mobile) {
        top: 12px;
        right: 12px;
    }
}
</style>
