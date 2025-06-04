<!-- src/components/ChatContainer.vue -->
<template>
    <div
        class="chat-container"
        :class="{
      'with-artifacts': artifactsOpen && !artifactsFullscreen,
      'hidden-fullscreen': artifactsFullscreen
    }"
    >
        <!-- Chat Header -->
        <div class="chat-header">
            <button
                class="sidebar-toggle-mobile"
                @click="handleSidebarToggle"
                @touchstart="handleSidebarToggle"
            >
                <i class="fas fa-bars"></i>
            </button>
            <h3>{{ currentChat?.title || 'AI Assistant' }}</h3>
        </div>

        <!-- Messages container -->
        <div class="chat-messages" ref="messagesContainer">
            <WelcomeMessage v-if="!currentChat?.messages?.length" />
            <MessageBubble
                v-for="message in currentChat?.messages"
                :key="message.id"
                :message="message"
                @open-artifact="$emit('open-artifact', $event)"
                @copy-artifact="$emit('copy-artifact', $event)"
                @playground-artifact="$emit('playground-artifact', $event)"
                @preview-artifact="$emit('preview-artifact', $event)"
            />
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="typing-indicator">
            <div class="message assistant">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Input container -->
        <MessageInput
            :uploaded-files="uploadedFiles"
            @send="handleSend"
            @file-upload="$emit('file-upload', $event)"
            @remove-file="$emit('remove-file', $event)"
        />
    </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import WelcomeMessage from './WelcomeMessage.vue'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'

const props = defineProps({
    currentChat: Object,
    uploadedFiles: Array,
    isTyping: Boolean,
    artifactsOpen: Boolean,
    artifactsFullscreen: Boolean
})

const emit = defineEmits([
    'send-message',
    'clear-chat',
    'file-upload',
    'remove-file',
    'open-artifact',
    'copy-artifact',
    'playground-artifact',
    'preview-artifact',
    'toggle-sidebar'
])

const messagesContainer = ref(null)

const handleSend = (content) => {
    emit('send-message', content, props.uploadedFiles)
}

const handleSidebarToggle = (event) => {
    // Prevent event bubbling and default behavior
    event.preventDefault()
    event.stopPropagation()

    console.log('Sidebar toggle clicked')

    // Add haptic feedback on mobile devices
    if ('vibrate' in navigator) {
        navigator.vibrate(50)
    }

    // Emit the toggle event
    emit('toggle-sidebar')
}

const scrollToBottom = () => {
    if (messagesContainer.value) {
        nextTick(() => {
            messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        })
    }
}

// Watch for new messages and scroll to bottom
watch(
    () => props.currentChat?.messages?.length,
    () => {
        scrollToBottom()
    },
    { flush: 'post' }
)

// Watch for typing indicator
watch(
    () => props.isTyping,
    () => {
        if (props.isTyping) {
            scrollToBottom()
        }
    }
)
</script>

<style lang="scss" scoped>
.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: $bg-chat;
    min-width: 0;
    position: relative;
    transition: margin-right $transition-fast;

    &.hidden-fullscreen {
        display: none;
    }

    &.with-artifacts {
        @media (min-width: ($breakpoint-mobile + 1px)) {
            margin-right: 400px;
        }
    }
}

.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-lg $space-2xl;
    border-bottom: 1px solid $border-light;
    background: $bg-main;
    height: 64px;
    flex-shrink: 0;
    position: relative;

    h3 {
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
        flex: 1;
        text-align: center;
        margin: 0;

        @media (max-width: $breakpoint-mobile) {
            margin-left: 48px; // Account for sidebar toggle button
        }
    }
}

.sidebar-toggle-mobile {
    display: none;
    background: none;
    border: none;
    color: $text-tertiary;
    font-size: 20px;
    cursor: pointer;
    padding: $space-md;
    border-radius: $radius-md;
    transition: all $transition-fast;
    position: absolute;
    left: $space-lg;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    min-width: 44px; // Minimum touch target size
    min-height: 44px;
    align-items: center;
    justify-content: center;

    &:hover {
        background: $bg-code;
        color: $text-primary;
    }

    &:active {
        background: $color-primary;
        color: white;
        transform: translateY(-50%) scale(0.95);
    }

    @media (max-width: $breakpoint-mobile) {
        display: flex;
    }

    & { // Ensure touch events work properly
        touch-action: manipulation;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
    }
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: $space-2xl;
    scroll-behavior: smooth;

    // Improve scrolling on mobile
    -webkit-overflow-scrolling: touch;

    @media (max-width: $breakpoint-mobile) {
        // Добавляем отступ снизу чтобы контент не скрывался за полем ввода
        padding: $space-lg $space-lg calc($space-2xl + env(safe-area-inset-bottom, 80px));
    }
}

.typing-indicator {
    padding: 0 $space-2xl;
}

.message {
    display: flex;
    margin-bottom: $space-xl;
    gap: $space-md;
    max-width: 100%;

    &.assistant {
        justify-content: flex-start;
    }
}

.message-avatar {
    width: 40px;
    height: 40px;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    color: white;
    background: $color-primary;
}

.message-content {
    max-width: 75%;
    padding: $space-lg $space-xl;
    border-radius: $radius-xl;
    background: $bg-message-assistant;
    color: $text-assistant;
    border-bottom-left-radius: $radius-sm;
}

.typing-dots {
    display: flex;
    gap: 4px;
    padding: $space-md;

    span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $text-muted;
        animation: typing 1.4s infinite ease-in-out;

        &:nth-child(2) {
            animation-delay: 0.2s;
        }

        &:nth-child(3) {
            animation-delay: 0.4s;
        }
    }
}

@keyframes typing {
    0%, 60%, 100% {
        transform: scale(1);
        opacity: 0.5;
    }
    30% {
        transform: scale(1.2);
        opacity: 1;
    }
}

@media (max-width: $breakpoint-mobile) {
    .chat-container {
        &.with-artifacts {
            margin-right: 0;
        }

        &.hidden-fullscreen {
            display: none;
        }
    }

    .chat-header {
        padding: $space-lg;
    }

    .chat-messages {
        padding: $space-lg;
    }

    .typing-indicator {
        padding: 0 $space-lg;
    }
}
</style>
