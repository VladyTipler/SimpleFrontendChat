<template>
  <div class="code-tab">
    <div class="code-header">
      <select v-model="selectedLanguage" class="language-select">
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="html">HTML</option>
        <option value="css">CSS</option>
        <option value="python">Python</option>
        <option value="json">JSON</option>
        <option value="markdown">Markdown</option>
        <option value="plaintext">Plain Text</option>
      </select>
      <div class="code-actions">
        <button class="action-btn" @click="copyCode">
          <i class="fas fa-copy"></i> Копировать
        </button>
        <button class="action-btn" @click="downloadCode">
          <i class="fas fa-download"></i> Скачать
        </button>
      </div>
    </div>
    <div class="code-editor-container">
      <pre class="code-editor"><code :class="`language-${displayLanguage}`" v-html="highlightedCode"></code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useToasts } from '../../composables/useToasts'

const props = defineProps({
  artifact: Object
})

const { showToast } = useToasts()

const selectedLanguage = ref('javascript')

const displayLanguage = computed(() => {
  return selectedLanguage.value || props.artifact?.language || 'plaintext'
})

const highlightedCode = computed(() => {
  if (!props.artifact?.code) return ''
  
  // Apply syntax highlighting using Prism.js
  const language = displayLanguage.value
  if (window.Prism && window.Prism.languages[language]) {
    return window.Prism.highlight(
      props.artifact.code,
      window.Prism.languages[language],
      language
    )
  }
  
  return escapeHtml(props.artifact.code)
})

const escapeHtml = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const copyCode = async () => {
  if (!props.artifact?.code) return
  
  try {
    await navigator.clipboard.writeText(props.artifact.code)
    showToast('Код скопирован в буфер обмена', 'success')
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = props.artifact.code
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      showToast('Код скопирован в буфер обмена', 'success')
    } catch (fallbackError) {
      showToast('Не удалось скопировать код', 'error')
    } finally {
      textArea.remove()
    }
  }
}

const downloadCode = () => {
  if (!props.artifact) return

  const { code, language, title } = props.artifact
  
  const extensions = {
    javascript: 'js',
    js: 'js',
    typescript: 'ts',
    ts: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    html: 'html',
    css: 'css',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    'c++': 'cpp',
    c: 'c',
    php: 'php',
    ruby: 'rb',
    go: 'go',
    rust: 'rs',
    swift: 'swift',
    kotlin: 'kt',
    json: 'json',
    xml: 'xml',
    yaml: 'yml',
    yml: 'yml',
    sql: 'sql',
    markdown: 'md',
    md: 'md',
    bash: 'sh',
    sh: 'sh',
    powershell: 'ps1',
    dockerfile: 'dockerfile',
    makefile: 'makefile'
  }

  const extension = extensions[language.toLowerCase()] || 'txt'
  const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`

  const blob = new Blob([code], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  showToast('Файл скачан', 'success')
}

// Update selected language when artifact changes
watch(() => props.artifact?.language, (newLanguage) => {
  if (newLanguage) {
    selectedLanguage.value = newLanguage
  }
}, { immediate: true })

// Re-highlight code when language changes
watch(displayLanguage, () => {
  nextTick(() => {
    if (window.Prism) {
      window.Prism.highlightAll()
    }
  })
})
</script>

<style lang="scss" scoped>
.code-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-md $space-lg;
  border-bottom: 1px solid $border-light;
  background: $bg-code;
}

.language-select {
  background: $bg-main;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  padding: $space-xs $space-sm;
  font-size: 13px;
  color: $text-primary;
  cursor: pointer;
}

.code-actions {
  display: flex;
  gap: $space-sm;
}

.action-btn {
  background: $bg-main;
  border: 1px solid $border-light;
  color: $text-secondary;
  cursor: pointer;
  padding: $space-xs $space-md;
  border-radius: $radius-md;
  font-size: 13px;
  font-weight: 500;
  transition: all $transition-fast;
  display: flex;
  align-items: center;
  gap: $space-xs;

  &:hover {
    background: $color-primary;
    color: white;
    border-color: $color-primary;
  }
}

.code-editor-container {
  flex: 1;
  overflow: auto;
  background: $bg-code;
}

.code-editor {
  margin: 0;
  background: $bg-code;
  border: none;
  font-family: $font-mono;
  font-size: 13px;
  line-height: 1.6;
  padding: $space-lg;
  white-space: pre-wrap;
  word-wrap: break-word;

  code {
    background: transparent;
    color: $text-primary;
    font-family: $font-mono;
    text-shadow: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

// Override Prism.js styles to prevent 3D effects
.code-editor {
  :deep(.token.comment),
  :deep(.token.prolog),
  :deep(.token.doctype),
  :deep(.token.cdata) {
    color: #708090;
    font-style: italic;
    text-shadow: none;
  }

  :deep(.token.punctuation) {
    color: #999999;
    text-shadow: none;
  }

  :deep(.token.property),
  :deep(.token.tag),
  :deep(.token.boolean),
  :deep(.token.number),
  :deep(.token.constant),
  :deep(.token.symbol),
  :deep(.token.deleted) {
    color: #905;
    text-shadow: none;
  }

  :deep(.token.selector),
  :deep(.token.attr-name),
  :deep(.token.string),
  :deep(.token.char),
  :deep(.token.builtin),
  :deep(.token.inserted) {
    color: #690;
    text-shadow: none;
  }

  :deep(.token.operator),
  :deep(.token.entity),
  :deep(.token.url),
  :deep(.language-css .token.string),
  :deep(.style .token.string) {
    color: #9a6e3a;
    text-shadow: none;
  }

  :deep(.token.atrule),
  :deep(.token.attr-value),
  :deep(.token.keyword) {
    color: #07a;
    text-shadow: none;
  }

  :deep(.token.function),
  :deep(.token.class-name) {
    color: #dd4a68;
    text-shadow: none;
  }

  :deep(.token.regex),
  :deep(.token.important),
  :deep(.token.variable) {
    color: #e90;
    text-shadow: none;
  }
}
</style>