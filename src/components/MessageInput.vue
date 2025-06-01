<!-- src/components/MessageInput.vue -->
<template>
    <div class="input-container">
        <!-- File upload area -->
        <div v-if="uploadedFiles.length" class="file-upload-area">
            <div class="uploaded-files">
                <div
                    v-for="(file, index) in uploadedFiles"
                    :key="file.id"
                    class="uploaded-file"
                >
                    <i :class="`fas fa-${getFileIcon(file.type)} file-icon`"></i>
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">({{ formatFileSize(file.size) }})</span>
                    <button
                        class="remove-file"
                        @click="$emit('remove-file', index)"
                        title="Удалить файл"
                    >
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Input wrapper -->
        <div class="input-wrapper">
            <div class="input-actions">
                <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept="*/*"
                    style="display: none"
                    @change="handleFileUpload"
                >
                <button class="file-btn" @click="$refs.fileInput.click()">
                    <i class="fas fa-paperclip"></i>
                </button>
            </div>

            <textarea
                ref="messageInput"
                v-model="message"
                placeholder="Напишите сообщение..."
                rows="1"
                maxlength="10000"
                @keydown="handleKeyDown"
                @input="autoResize"
            ></textarea>

            <button
                class="send-btn"
                :disabled="!canSend"
                @click="sendMessage"
            >
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
    uploadedFiles: Array
})

const emit = defineEmits(['send', 'file-upload', 'remove-file'])

const message = ref('')
const messageInput = ref(null)
const fileInput = ref(null)

const canSend = computed(() => {
    return message.value.trim().length > 0 || props.uploadedFiles.length > 0
})

const sendMessage = () => {
    if (!canSend.value) return

    emit('send', message.value.trim())
    message.value = ''
    autoResize()
}

const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (canSend.value) {
            sendMessage()
        }
    }
}

const autoResize = () => {
    nextTick(() => {
        if (messageInput.value) {
            messageInput.value.style.height = 'auto'
            const newHeight = Math.min(messageInput.value.scrollHeight, 200)
            messageInput.value.style.height = newHeight + 'px'
        }
    })
}

const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    emit('file-upload', files)
    e.target.value = ''
}

const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'music'
    if (mimeType.includes('pdf')) return 'file-pdf'
    if (mimeType.includes('word') || mimeType.includes('msword')) return 'file-word'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-excel'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-powerpoint'
    if (mimeType.includes('text')) return 'file-alt'
    if (mimeType.includes('json')) return 'file-code'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'file-archive'
    return 'file'
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
.input-container {
    padding: $space-lg $space-2xl;
    border-top: 1px solid $border-light;
    background: $bg-input;
    flex-shrink: 0;

    @media (max-width: $breakpoint-mobile) {
        padding: $space-md;
        // Важно: добавляем отступ для мобильной панели навигации
        padding-bottom: calc($space-lg + env(safe-area-inset-bottom, 20px));
        // Убираем sticky позиционирование - оно создавало проблемы
        position: relative;
    }
}

.file-upload-area {
    margin-bottom: $space-md;
    max-height: 120px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.uploaded-files {
    display: flex;
    flex-wrap: wrap;
    gap: $space-sm;
}

.uploaded-file {
    display: flex;
    align-items: center;
    gap: $space-sm;
    background: $bg-code;
    padding: $space-sm $space-md;
    border-radius: $radius-md;
    font-size: 13px;
    border: 1px solid $border-light;
    color: $text-secondary;

    .file-name {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @media (max-width: $breakpoint-mobile) {
            max-width: 100px;
        }
    }

    .file-size {
        color: $text-muted;
    }
}

.remove-file {
    background: none;
    border: none;
    color: $text-tertiary;
    cursor: pointer;
    font-size: 12px;
    padding: 2px;
    border-radius: $radius-sm;
    transition: color $transition-fast;
    min-width: 20px;
    min-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: $color-error;
    }
}

.input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: $space-md;
    background: $bg-main;
    border: 1px solid $border-light;
    border-radius: $radius-xl;
    padding: $space-sm $space-md;
    transition: all $transition-fast;
    box-shadow: $shadow-sm;

    &:focus-within {
        border-color: $border-focus;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    @media (max-width: $breakpoint-mobile) {
        // Убираем принудительную высоту
        gap: $space-sm;
        padding: $space-sm;
    }
}

.input-actions {
    display: flex;
    align-items: center;
    gap: $space-sm;
    flex-shrink: 0;
}

.file-btn {
    background: none;
    border: none;
    color: $text-tertiary;
    cursor: pointer;
    font-size: 20px;
    padding: $space-sm;
    border-radius: $radius-full;
    transition: all $transition-fast;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    min-height: 40px;

    &:hover {
        background: $bg-code;
        color: $color-primary;
    }

    @media (max-width: $breakpoint-mobile) {
        min-width: 44px;
        min-height: 44px;
        font-size: 18px;
    }
}

textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-size: 16px;
    line-height: 1.5;
    padding: $space-sm 0;
    background: transparent;
    font-family: inherit;
    color: $text-primary;
    min-height: 44px;
    max-height: 200px;

    &::placeholder {
        color: $text-muted;
    }

    @media (max-width: $breakpoint-mobile) {
        // Предотвращаем zoom на iOS
        font-size: 16px !important;
        max-height: 150px;
    }
}

.send-btn {
    background: $color-primary;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
    padding: $space-md;
    border-radius: $radius-full;
    transition: all $transition-fast;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;

    &:hover:not(:disabled) {
        background: $color-primary-dark;
        transform: translateY(-1px);
    }

    &:disabled {
        background: $text-muted;
        cursor: not-allowed;
        transform: none;
    }

    @media (max-width: $breakpoint-mobile) {
        width: 48px;
        height: 48px;
        font-size: 14px;

        &:active {
            transform: scale(0.95);
        }
    }
}

// Ландшафтный режим на мобильных
@media (max-width: $breakpoint-mobile) and (orientation: landscape) {
    .input-container {
        padding: $space-sm $space-md;
        // Меньший отступ в ландшафтном режиме
        padding-bottom: calc($space-md + env(safe-area-inset-bottom, 10px));

        textarea {
            max-height: 100px;
        }
    }

    .file-upload-area {
        max-height: 80px;
    }
}
</style>
