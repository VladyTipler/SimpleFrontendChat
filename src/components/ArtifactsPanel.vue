<template>
    <div
        class="artifacts-panel"
        :class="{
      open: true,
      fullscreen: isFullscreen
    }"
    >
        <div class="artifacts-resize-handle" v-if="!isFullscreen"></div>

        <div class="artifacts-header">
            <h3>{{ artifact?.title || 'Артефакт' }}</h3>
            <div class="artifacts-controls">
                <button
                    class="control-btn"
                    @click="$emit('toggle-fullscreen')"
                    :title="isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'"
                >
                    <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
                </button>
                <button class="control-btn" @click="$emit('close')" title="Закрыть">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>

        <div class="artifacts-tabs">
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'preview' }"
                @click="activeTab = 'preview'"
            >
                <i class="fas fa-eye"></i> Предпросмотр
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'code' }"
                @click="activeTab = 'code'"
            >
                <i class="fas fa-code"></i> Код
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'playground' }"
                @click="activeTab = 'playground'"
            >
                <i class="fas fa-play"></i> Playground
            </button>
        </div>

        <div class="artifacts-content">
            <!-- Preview Tab -->
            <PreviewTab
                v-if="activeTab === 'preview'"
                :artifact="artifact"
            />

            <!-- Code Tab -->
            <CodeTab
                v-if="activeTab === 'code'"
                :artifact="artifact"
            />

            <!-- Playground Tab -->
            <PlaygroundTab
                v-if="activeTab === 'playground'"
                :artifact="artifact"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import PreviewTab from './artifacts/PreviewTab.vue'
import CodeTab from './artifacts/CodeTab.vue'
import PlaygroundTab from './artifacts/PlaygroundTab.vue'

const props = defineProps({
    artifact: Object,
    isFullscreen: Boolean
})

defineEmits(['close', 'toggle-fullscreen'])

const activeTab = ref('preview')

// Switch to appropriate tab based on artifact type
watch(() => props.artifact, (newArtifact) => {
    if (!newArtifact) return

    const language = newArtifact.language?.toLowerCase()

    if (newArtifact.type === 'html' || language === 'html') {
        activeTab.value = 'preview'
    } else if (['markdown', 'md'].includes(language)) {
        activeTab.value = 'preview'
    } else {
        activeTab.value = 'code'
    }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.artifacts-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background: $bg-main;
    border-left: 1px solid $border-light;
    box-shadow: $shadow-lg;
    display: flex;
    flex-direction: column;
    z-index: 1001;
    min-width: 300px;
    max-width: 80vw;

    &.fullscreen {
        width: 100vw !important;
        height: 100vh !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 1002;
        border: none;
        max-width: none;
    }

    @media (max-width: $breakpoint-mobile) {
        width: 100vw;

        .artifacts-resize-handle {
            display: none;
        }
    }
}

.artifacts-resize-handle {
    position: absolute;
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 60px;
    background: $color-primary;
    border-radius: 5px 0 0 5px;
    cursor: ew-resize;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: all $transition-fast;
    z-index: 10;

    &:hover {
        opacity: 1;
        background: $color-primary-dark;
        height: 80px;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        transform: translateY(-50%) translateX(-2px);
    }

    &::before {
        content: '';
        width: 3px;
        height: 20px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 1px;
        box-shadow: 2px 0 0 rgba(255, 255, 255, 0.6);
    }

    .fullscreen & {
        display: none;
    }
}

.artifacts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $space-lg $space-xl;
    border-bottom: 1px solid $border-light;
    background: $bg-main;
    height: 64px;
    flex-shrink: 0;

    h3 {
        font-size: 18px;
        font-weight: 600;
        color: $text-primary;
    }
}

.artifacts-controls {
    display: flex;
    gap: $space-sm;
}

.control-btn {
    background: none;
    border: none;
    color: $text-tertiary;
    cursor: pointer;
    padding: $space-sm;
    border-radius: $radius-md;
    transition: all $transition-fast;

    &:hover {
        background: $bg-code;
        color: $text-primary;
    }
}

.artifacts-tabs {
    display: flex;
    border-bottom: 1px solid $border-light;
    background: $bg-main;
    flex-shrink: 0;
}

.tab-btn {
    background: none;
    border: none;
    color: $text-secondary;
    cursor: pointer;
    padding: $space-md $space-lg;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all $transition-fast;
    display: flex;
    align-items: center;
    gap: $space-sm;

    &:hover {
        color: $text-primary;
        background: $bg-code;
    }

    &.active {
        color: $color-primary;
        border-bottom-color: $color-primary;
        background: $bg-main;
    }
}

.artifacts-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
}
</style>
