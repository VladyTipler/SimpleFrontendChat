<template>
  <div 
    class="message"
    :class="message.type"
  >
    <div class="message-avatar">
      <i :class="message.type === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
    </div>
    <div class="message-content">
      <!-- Files -->
      <div v-if="message.files?.length" class="message-files">
        <div 
          v-for="file in message.files"
          :key="file.id"
          class="file-preview"
        >
          <i :class="`fas fa-${getFileIcon(file.type)} file-icon`"></i>
          <span>{{ file.name }}</span>
        </div>
      </div>

      <!-- Text content -->
      <div v-if="message.content" class="message-text" v-html="processedContent"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import { useArtifactDetection } from '../composables/useArtifactDetection'

const props = defineProps({
  message: Object
})

const emit = defineEmits([
  'open-artifact',
  'copy-artifact', 
  'playground-artifact',
  'preview-artifact'
])

const { processMessageContent } = useArtifactDetection({
  onArtifactAction: (action, artifact) => {
    emit(action, artifact)
  }
})

const processedContent = computed(() => {
  return processMessageContent(props.message.content)
})

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
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  margin-bottom: $space-xl;
  gap: $space-md;
  max-width: 100%;
  animation: messageSlideIn $transition-normal ease-out;

  &.user {
    justify-content: flex-end;

    .message-content {
      order: -1;
      background: $bg-message-user;
      color: $text-user;
      border-bottom-right-radius: $radius-sm;
      border-bottom-left-radius: $radius-xl;
    }

    .message-avatar {
      background: $text-user;
    }

    .file-preview {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }
  }

  &.assistant {
    .message-content {
      background: $bg-message-assistant;
      color: $text-assistant;
      border-bottom-left-radius: $radius-sm;
    }

    .message-avatar {
      background: $color-primary;
    }
  }
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
}

.message-content {
  max-width: 75%;
  padding: $space-lg $space-xl;
  border-radius: $radius-xl;
  word-wrap: break-word;
  line-height: 1.6;
  position: relative;

  @media (max-width: $breakpoint-mobile) {
    max-width: 85%;
    padding: $space-md;
  }

  @media (max-width: 480px) {
    max-width: 90%;
  }
}

.message-files {
  display: flex;
  flex-wrap: wrap;
  gap: $space-sm;
  margin-bottom: $space-md;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: $space-xs;
  background: rgba(0, 0, 0, 0.05);
  padding: $space-xs $space-sm;
  border-radius: $radius-md;
  font-size: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.message-text {
  :deep(p) {
    margin-bottom: $space-md;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(ul), :deep(ol) {
    margin-bottom: $space-md;
    padding-left: $space-xl;
  }

  :deep(li) {
    margin-bottom: $space-xs;
  }

  :deep(blockquote) {
    margin: $space-md 0;
    padding-left: $space-lg;
    border-left: 4px solid $border-medium;
    color: $text-secondary;
    font-style: italic;
  }

  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin-top: $space-lg;
    margin-bottom: $space-sm;
    font-weight: 600;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(code) {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.2em 0.4em;
    border-radius: $radius-sm;
    font-family: $font-mono;
    font-size: 0.875em;
  }

  :deep(pre) {
    background: $bg-code;
    padding: $space-lg;
    border-radius: $radius-md;
    overflow-x: auto;
    margin: $space-md 0;

    code {
      background: none;
      padding: 0;
    }
  }
}
</style>