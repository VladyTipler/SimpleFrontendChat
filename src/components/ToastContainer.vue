<!-- src/components/ToastContainer.vue -->
<template>
    <div class="toast-container">
        <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast"
            :class="`toast-${toast.type}`"
        >
            <i :class="getToastIcon(toast.type)"></i>
            <div class="toast-content">
                <span class="toast-message">{{ toast.message }}</span>

                <!-- Show diagnostics button for network errors on mobile -->
                <button
                    v-if="isNetworkError(toast) && isMobileDevice"
                    @click="$emit('open-diagnostics')"
                    class="diagnostics-btn"
                >
                    <i class="fas fa-tools"></i> Диагностика
                </button>
            </div>

            <button class="toast-close" @click="$emit('remove', toast.id)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
    toasts: Array
})

defineEmits(['remove', 'open-diagnostics'])

const isMobileDevice = computed(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

const getToastIcon = (type) => {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }
    return icons[type] || 'fas fa-info-circle'
}

const isNetworkError = (toast) => {
    const networkKeywords = [
        'Failed to fetch',
        'Network',
        'CORS',
        'сети',
        'подключения',
        'мобильном устройстве'
    ]

    return toast.type === 'error' &&
        networkKeywords.some(keyword =>
            toast.message.toLowerCase().includes(keyword.toLowerCase())
        )
}
</script>

<style lang="scss" scoped>
.toast-container {
    position: fixed;
    top: $space-xl;
    right: $space-xl;
    z-index: 3000;
    display: flex;
    flex-direction: column;
    gap: $space-sm;

    @media (max-width: $breakpoint-mobile) {
        top: $space-md;
        right: $space-md;
        left: $space-md;
    }
}

.toast {
    display: flex;
    align-items: flex-start;
    gap: $space-md;
    padding: $space-md $space-lg;
    border-radius: $radius-md;
    box-shadow: $shadow-lg;
    background: $bg-main;
    border: 1px solid $border-light;
    min-width: 300px;
    animation: toastSlideIn $transition-normal ease-out;

    @media (max-width: $breakpoint-mobile) {
        min-width: auto;
        padding: $space-md;
    }

    &-success {
        border-left: 4px solid $color-success;

        i {
            color: $color-success;
        }
    }

    &-error {
        border-left: 4px solid $color-error;

        i {
            color: $color-error;
        }
    }

    &-warning {
        border-left: 4px solid $color-warning;

        i {
            color: $color-warning;
        }
    }

    &-info {
        border-left: 4px solid $color-primary;

        i {
            color: $color-primary;
        }
    }
}

.toast-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $space-sm;
}

.toast-message {
    color: $text-primary;
    font-size: 14px;
    line-height: 1.4;
    white-space: pre-line;
}

.diagnostics-btn {
    background: $color-primary;
    border: none;
    color: white;
    padding: $space-xs $space-sm;
    border-radius: $radius-sm;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all $transition-fast;
    display: inline-flex;
    align-items: center;
    gap: $space-xs;
    align-self: flex-start;
    margin-top: $space-xs;

    &:hover {
        background: $color-primary-dark;
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
}

.toast-close {
    background: none;
    border: none;
    color: $text-tertiary;
    cursor: pointer;
    padding: $space-xs;
    border-radius: $radius-sm;
    transition: all $transition-fast;
    flex-shrink: 0;

    &:hover {
        background: $bg-code;
        color: $text-primary;
    }
}

@keyframes toastSlideIn {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
