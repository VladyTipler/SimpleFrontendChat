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
            <span class="toast-message">{{ toast.message }}</span>
            <button class="toast-close" @click="$emit('remove', toast.id)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    toasts: Array
})

defineEmits(['remove'])

const getToastIcon = (type) => {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }
    return icons[type] || 'fas fa-info-circle'
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
    align-items: center;
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

.toast-message {
    flex: 1;
    color: $text-primary;
    font-size: 14px;
    line-height: 1.4;
    white-space: pre-line;
}

.toast-close {
    background: none;
    border: none;
    color: $text-tertiary;
    cursor: pointer;
    padding: $space-xs;
    border-radius: $radius-sm;
    transition: all $transition-fast;
    min-width: 24px;
    min-height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

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
