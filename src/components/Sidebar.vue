<template>
    <div
        class="sidebar"
        :class="{
      collapsed: isCollapsed,
      open: isOpen
    }"
    >
        <div class="sidebar-header">
            <h2>
                <i class="fas fa-robot"></i>
                AI Assistant
            </h2>
            <div class="header-controls">
                <ThemeSwitcher />
                <button class="toggle-sidebar" @click="$emit('close')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <div class="sidebar-content">
            <button class="new-chat-btn" @click="$emit('new-chat')">
                <i class="fas fa-plus"></i>
                Новый чат
            </button>

            <div class="chat-history">
                <div
                    v-for="chat in sortedChats"
                    :key="chat.id"
                    class="chat-history-item"
                    :class="{ active: chat.id === currentChatId }"
                >
                    <div
                        class="chat-item-content"
                        @click="$emit('switch-chat', chat.id)"
                    >
                        <span class="chat-title">{{ chat.title }}</span>
                        <small class="chat-date">{{ formatDate(chat.updatedAt) }}</small>
                    </div>
                    <button
                        class="delete-chat-btn"
                        @click="$emit('delete-chat', chat.id)"
                        title="Удалить чат"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>

        <div class="sidebar-footer">
            <button class="settings-btn" @click="$emit('open-settings')">
                <i class="fas fa-cog"></i>
                Настройки
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import ThemeSwitcher from './ThemeSwitcher.vue'

const props = defineProps({
    isOpen: Boolean,
    isCollapsed: Boolean,
    chats: Map,
    currentChatId: String
})

defineEmits([
    'close',
    'toggle-mobile',
    'new-chat',
    'switch-chat',
    'delete-chat',
    'open-settings'
])

const sortedChats = computed(() => {
    return Array.from(props.chats.values())
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
})

const formatDate = (date) => {
    const now = new Date()
    const diff = now - new Date(date)

    if (diff < 60000) return 'только что'
    if (diff < 3600000) return Math.floor(diff / 60000) + ' мин назад'
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч назад'

    return new Date(date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
    })
}
</script>

<style lang="scss" scoped>
.sidebar {
    width: $sidebar-width;
    background: $bg-sidebar;
    display: flex;
    flex-direction: column;
    transition: width $transition-normal, margin-left $transition-normal;
    z-index: 1000;
    border-right: 1px solid $border-light;
    box-shadow: $shadow-sm;
    overflow: hidden;

    &.collapsed {
        width: 0;
        margin-left: 0;
        border-right: none;
    }

    @media (max-width: $breakpoint-mobile) {
        position: fixed;
        height: 100vh;
        z-index: 1001;
        transform: translateX(-100%);
        width: $sidebar-width;
        margin-left: 0;

        &.collapsed {
            transform: translateX(-100%);
            width: $sidebar-width;
        }

        &.open {
            transform: translateX(0);
        }
    }
}

.sidebar-header {
    padding: $space-lg $space-xl;
    border-bottom: 1px solid $border-light;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    flex-shrink: 0;

    h2 {
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
        display: flex;
        align-items: center;
        gap: $space-sm;
        white-space: nowrap;
        flex: 1;
        min-width: 0;

        i {
            color: $color-primary;
            flex-shrink: 0;
        }
    }
}

.header-controls {
    display: flex;
    align-items: center;
    gap: $space-xs;
    flex-shrink: 0;
}

.toggle-sidebar {
    background: none;
    border: none;
    color: $text-tertiary;
    font-size: 18px;
    cursor: pointer;
    padding: $space-sm;
    border-radius: $radius-md;
    transition: all $transition-fast;
    flex-shrink: 0;

    &:hover {
        background: $bg-code;
        color: $text-primary;
    }
}

.sidebar-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: $space-lg;
    gap: $space-lg;
    overflow: hidden;
    min-width: 0;
}

.new-chat-btn {
    background: $color-primary;
    border: none;
    color: white;
    padding: $space-md $space-lg;
    border-radius: $radius-md;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color $transition-fast;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $space-sm;
    width: 100%;
    white-space: nowrap;

    &:hover {
        background: $color-primary-dark;
    }
}

.chat-history {
    flex: 1;
    overflow-y: auto;
    margin: 0 -4px;
}

.chat-history-item {
    margin-bottom: $space-xs;
    border-radius: $radius-md;
    cursor: pointer;
    transition: background-color $transition-fast;
    position: relative;
    display: flex;
    align-items: center;

    &:hover {
        background: $bg-code;

        .chat-title {
            color: $text-primary;
        }

        .delete-chat-btn {
            opacity: 1;
        }
    }

    &.active {
        background: #e0e7ff;

        .chat-title {
            color: $color-primary;
            font-weight: 500;
        }
    }
}

.chat-item-content {
    flex: 1;
    padding: $space-md;
    cursor: pointer;
    min-width: 0;
}

.chat-title {
    display: block;
    font-size: 14px;
    color: $text-secondary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
}

.chat-date {
    font-size: 12px;
    color: $text-muted;
}

.delete-chat-btn {
    background: none;
    border: none;
    color: $text-muted;
    cursor: pointer;
    padding: $space-sm;
    border-radius: $radius-sm;
    opacity: 0;
    transition: all $transition-fast;
    margin-right: $space-sm;
    flex-shrink: 0;

    &:hover {
        color: $color-error;
        background: #fef2f2;
    }
}

.sidebar-footer {
    padding-top: $space-lg;
    border-top: 1px solid $border-light;
    flex-shrink: 0;
}

.settings-btn {
    background: none;
    border: none;
    color: $text-secondary;
    padding: $space-md;
    border-radius: $radius-md;
    cursor: pointer;
    font-size: 14px;
    width: 100%;
    text-align: left;
    transition: all $transition-fast;
    display: flex;
    align-items: center;
    gap: $space-md;
    white-space: nowrap;

    &:hover {
        background: $bg-code;
        color: $text-primary;
    }
}
</style>
