<template>
  <div class="playground-tab">
    <div class="playground-tabs">
      <button
        v-for="lang in languages"
        :key="lang.key"
        class="playground-tab-btn"
        :class="{ active: activeLanguage === lang.key }"
        @click="activeLanguage = lang.key"
      >
        {{ lang.name }}
      </button>
    </div>

    <div class="playground-editors">
      <div
        v-for="lang in languages"
        :key="lang.key"
        class="playground-editor"
        :class="{ active: activeLanguage === lang.key }"
      >
        <textarea
          v-model="editorContent[lang.key]"
          :placeholder="`${lang.name} код...`"
        ></textarea>
      </div>
    </div>

    <div class="playground-controls">
      <button class="run-btn" @click="runCode">
        <i class="fas fa-play"></i> Запустить
      </button>
      <button class="clear-btn" @click="clearPlayground">
        <i class="fas fa-trash"></i> Очистить
      </button>
    </div>

    <div class="playground-output">
      <iframe
        ref="outputFrame"
        class="playground-frame"
        sandbox="allow-scripts allow-same-origin"
        :src="outputUrl"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useToasts } from '../../composables/useToasts'

const props = defineProps({
  artifact: Object
})

const { showToast } = useToasts()

const languages = [
  { key: 'html', name: 'HTML' },
  { key: 'css', name: 'CSS' },
  { key: 'js', name: 'JS' },
  { key: 'ts', name: 'TS' }
]

const activeLanguage = ref('html')
const outputFrame = ref(null)
const outputUrl = ref('about:blank')

const editorContent = ref({
  html: '',
  css: '',
  js: '',
  ts: ''
})

// Load artifact content into appropriate editor
const loadArtifactContent = () => {
  if (!props.artifact) return

  const { language, code } = props.artifact
  const lang = language.toLowerCase()

  if (lang === 'html') {
    editorContent.value.html = code
    activeLanguage.value = 'html'
  } else if (lang === 'css') {
    editorContent.value.css = code
    activeLanguage.value = 'css'
  } else if (['javascript', 'js', 'jsx'].includes(lang)) {
    editorContent.value.js = code
    activeLanguage.value = 'js'
  } else if (['typescript', 'ts', 'tsx'].includes(lang)) {
    editorContent.value.ts = code
    activeLanguage.value = 'ts'
  }
}

const runCode = () => {
  const htmlContent = editorContent.value.html || ''
  const cssContent = editorContent.value.css || ''
  const jsContent = editorContent.value.js || ''
  const tsContent = editorContent.value.ts || ''

  let finalJsContent = jsContent

  // Compile TypeScript if present
  if (tsContent.trim()) {
    try {
      if (window.ts) {
        finalJsContent = window.ts.transpile(tsContent, {
          target: window.ts.ScriptTarget.ES2020,
          module: window.ts.ModuleKind.None
        })
      } else {
        // Fallback if TypeScript compiler is not available
        finalJsContent = tsContent
        showToast('TypeScript компилятор не загружен, используется как JavaScript', 'warning')
      }
    } catch (error) {
      showToast('Ошибка компиляции TypeScript: ' + error.message, 'error')
      return
    }
  }

  const htmlDoc = createHTMLDocument(htmlContent, cssContent, finalJsContent)
  const blob = new Blob([htmlDoc], { type: 'text/html' })

  // Clean up previous URL
  if (outputUrl.value && outputUrl.value !== 'about:blank') {
    URL.revokeObjectURL(outputUrl.value)
  }

  outputUrl.value = URL.createObjectURL(blob)
}

const createHTMLDocument = (html, css, js) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playground<\/title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    ${css}
  <\/style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch (error) {
      document.body.innerHTML += '<div style="color: red; padding: 10px; background: #fee; border: 1px solid #fcc; border-radius: 4px; margin: 10px 0;"><strong>JavaScript Error:</strong> ' + error.message + '</div>';
      console.error('Playground Error:', error);
    }
  <\/script>
<\/body>
<\/html>`
}

const clearPlayground = () => {
  editorContent.value = {
    html: '',
    css: '',
    js: '',
    ts: ''
  }

  // Clean up output
  if (outputUrl.value && outputUrl.value !== 'about:blank') {
    URL.revokeObjectURL(outputUrl.value)
  }
  outputUrl.value = 'about:blank'
}

// Watch for artifact changes
watch(() => props.artifact, () => {
  loadArtifactContent()
}, { immediate: true })

// Cleanup
onBeforeUnmount(() => {
  if (outputUrl.value && outputUrl.value !== 'about:blank') {
    URL.revokeObjectURL(outputUrl.value)
  }
})

// Load artifact content on mount
onMounted(() => {
  loadArtifactContent()
})
</script>

<style lang="scss" scoped>
.playground-tab {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.playground-tabs {
  display: flex;
  border-bottom: 1px solid $border-light;
  background: $bg-code;
}

.playground-tab-btn {
  background: none;
  border: none;
  color: $text-secondary;
  cursor: pointer;
  padding: $space-sm $space-lg;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all $transition-fast;

  &:hover {
    color: $text-primary;
    background: rgba(79, 70, 229, 0.1);
  }

  &.active {
    color: $color-primary;
    border-bottom-color: $color-primary;
    background: $bg-main;
  }
}

.playground-editors {
  height: 200px;
  position: relative;
  border-bottom: 1px solid $border-light;

  @media (max-width: $breakpoint-mobile) {
    height: 150px;
  }
}

.playground-editor {
  display: none;
  height: 100%;

  &.active {
    display: block;
  }

  textarea {
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    resize: none;
    font-family: $font-mono;
    font-size: 13px;
    line-height: 1.6;
    padding: $space-lg;
    background: $bg-code;
    color: $text-primary;

    &::placeholder {
      color: $text-muted;
    }
  }
}

.playground-controls {
  display: flex;
  gap: $space-sm;
  padding: $space-md $space-lg;
  border-bottom: 1px solid $border-light;
  background: $bg-main;
}

.run-btn {
  background: $color-success;
  border: none;
  color: white;
  cursor: pointer;
  padding: $space-sm $space-lg;
  border-radius: $radius-md;
  font-size: 13px;
  font-weight: 500;
  transition: all $transition-fast;
  display: flex;
  align-items: center;
  gap: $space-xs;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
}

.clear-btn {
  background: $bg-main;
  border: 1px solid $border-light;
  color: $text-secondary;
  cursor: pointer;
  padding: $space-sm $space-lg;
  border-radius: $radius-md;
  font-size: 13px;
  font-weight: 500;
  transition: all $transition-fast;
  display: flex;
  align-items: center;
  gap: $space-xs;

  &:hover {
    background: $color-error;
    color: white;
    border-color: $color-error;
  }
}

.playground-output {
  flex: 1;
  overflow: hidden;
}

.playground-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}
</style>
