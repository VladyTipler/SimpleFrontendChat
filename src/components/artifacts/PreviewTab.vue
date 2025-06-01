<template>
  <div class="preview-container">
    <!-- HTML/Web preview -->
    <iframe 
      v-if="showHtmlPreview"
      ref="previewFrame"
      class="preview-frame"
      sandbox="allow-scripts allow-same-origin"
      :src="htmlPreviewUrl"
    ></iframe>

    <!-- Markdown preview -->
    <div 
      v-if="showMarkdownPreview"
      class="markdown-preview"
      v-html="markdownHtml"
    ></div>

    <!-- Default code preview -->
    <div v-if="!showHtmlPreview && !showMarkdownPreview" class="code-preview">
      <p>Предпросмотр недоступен для этого типа кода</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  artifact: Object
})

const previewFrame = ref(null)
const htmlPreviewUrl = ref('')

const showHtmlPreview = computed(() => {
  if (!props.artifact) return false
  const language = props.artifact.language?.toLowerCase()
  return props.artifact.type === 'html' || language === 'html'
})

const showMarkdownPreview = computed(() => {
  if (!props.artifact) return false
  const language = props.artifact.language?.toLowerCase()
  return ['markdown', 'md'].includes(language)
})

const markdownHtml = computed(() => {
  if (!showMarkdownPreview.value || !props.artifact?.code) return ''
  
  try {
    return marked.parse(props.artifact.code)
  } catch (error) {
    return `
      <div style="color: #e53e3e; padding: 20px; background: #fed7d7; border-radius: 6px; margin: 20px;">
        <strong>Ошибка при обработке Markdown:</strong><br>
        ${error.message}
      </div>
    `
  }
})

const createHtmlPreview = () => {
  if (!showHtmlPreview.value || !props.artifact?.code) return

  let content = props.artifact.code

  // If it's not a complete HTML document, wrap it
  if (!content.includes('<!DOCTYPE') && !content.includes('<html>')) {
    content = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: white;
            color: #333;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `
  }

  const blob = new Blob([content], { type: 'text/html' })
  
  // Clean up previous URL
  if (htmlPreviewUrl.value) {
    URL.revokeObjectURL(htmlPreviewUrl.value)
  }
  
  htmlPreviewUrl.value = URL.createObjectURL(blob)
}

// Watch for artifact changes
watch(() => props.artifact, () => {
  if (showHtmlPreview.value) {
    createHtmlPreview()
  }
}, { immediate: true })

// Cleanup
onBeforeUnmount(() => {
  if (htmlPreviewUrl.value) {
    URL.revokeObjectURL(htmlPreviewUrl.value)
  }
})
</script>

<style lang="scss" scoped>
.preview-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  border-radius: $radius-sm;
}

.markdown-preview {
  flex: 1;
  padding: $space-lg $space-xl;
  background: white;
  overflow-y: auto;
  font-family: $font-sans;
  line-height: 1.6;
  color: #333;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.25;
    color: #1a202c;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(p) {
    margin-bottom: 1em;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(h1) {
    font-size: 2em;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.3em;
  }

  :deep(h2) {
    font-size: 1.5em;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.3em;
  }

  :deep(h3) { font-size: 1.25em; }
  :deep(h4) { font-size: 1em; }
  :deep(h5) { font-size: 0.875em; }
  :deep(h6) { font-size: 0.85em; }

  :deep(ul),
  :deep(ol) {
    margin-bottom: 1em;
    padding-left: 2em;
  }

  :deep(li) {
    margin-bottom: 0.25em;
  }

  :deep(blockquote) {
    margin: 1em 0;
    padding-left: 1em;
    border-left: 4px solid #e2e8f0;
    color: #718096;
    font-style: italic;
  }

  :deep(code) {
    background: #f7fafc;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: $font-mono;
    font-size: 0.875em;
    color: #e53e3e;
  }

  :deep(pre) {
    background: #f7fafc;
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1em 0;

    code {
      background: none;
      padding: 0;
      color: #333;
    }
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
  }

  :deep(th),
  :deep(td) {
    border: 1px solid #e2e8f0;
    padding: 0.5em;
    text-align: left;
  }

  :deep(th) {
    background: #f7fafc;
    font-weight: 600;
  }

  :deep(a) {
    color: #3182ce;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 1em 0;
  }

  :deep(hr) {
    border: none;
    height: 1px;
    background: #e2e8f0;
    margin: 2em 0;
  }
}

.code-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  font-style: italic;
  background: $bg-code;
}
</style>