import { marked } from 'marked'

export function useArtifactDetection({ onArtifactAction }) {
  const artifactTypes = {
    CODE: 'code',
    HTML: 'html',
    IMAGE: 'image',
    VIDEO: 'video',
    AUDIO: 'audio',
    CANVAS: 'canvas'
  }

  const artifacts = new Map()

  const processMessageContent = (content) => {
    if (!content) return ''

    // Create custom renderer for marked
    const renderer = new marked.Renderer()

    // Override code rendering to detect artifacts
    renderer.code = (code, language) => {
      const cleanCode = code.trim()
      const finalLanguage = language || detectLanguageFromCode(cleanCode)
      
      const isWorthy = isArtifactWorthy(cleanCode, finalLanguage)

      if (isWorthy) {
        const artifact = {
          type: getArtifactType(finalLanguage, cleanCode),
          language: finalLanguage,
          code: cleanCode,
          title: generateArtifactTitle(finalLanguage, cleanCode)
        }

        const artifactId = `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        artifacts.set(artifactId, artifact)
        
        return createArtifactContainer(artifact, artifactId)
      }

      // Return standard code block if not artifact-worthy
      return `<pre><code class="language-${finalLanguage}">${escapeHtml(cleanCode)}</code></pre>`
    }

    // Process markdown with custom renderer
    return marked.parse(content, { renderer })
  }

  const detectLanguageFromCode = (code) => {
    // Simple language detection based on content patterns
    if (code.includes('<!DOCTYPE') || code.includes('<html>')) return 'html'
    if (code.includes('function') && code.includes('{')) return 'javascript'
    if (code.includes('const ') || code.includes('let ') || code.includes('var ')) return 'javascript'
    if (code.includes('def ') && code.includes(':')) return 'python'
    if (code.includes('public class') || code.includes('import java')) return 'java'
    if (code.includes('#include') || code.includes('int main')) return 'cpp'
    if (code.includes('<?php')) return 'php'
    if (code.includes('package main') || code.includes('func main')) return 'go'
    if (code.includes('fn main') || code.includes('use std::')) return 'rust'
    if (code.includes('{') && code.includes('}') && code.includes(';')) return 'javascript'

    return 'plaintext'
  }

  const isArtifactWorthy = (code, language) => {
    const minLength = 10

    if (!code || code.trim().length < minLength) return false

    // Always create artifacts for web technologies
    if (['html', 'css', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(language.toLowerCase())) {
      return true
    }

    // Always create artifacts for common programming languages
    if (['python', 'java', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'].includes(language.toLowerCase())) {
      return true
    }

    // Always create artifacts for markup and data formats
    if (['xml', 'json', 'yaml', 'yml', 'sql', 'markdown', 'md'].includes(language.toLowerCase())) {
      return true
    }

    // For plaintext, check if it looks like code
    if (language.toLowerCase() === 'plaintext') {
      const codeIndicators = [
        'function', 'const', 'let', 'var', 'def', 'class', 'import', 'export',
        'document.', 'console.', '<?php', '#!/', 'package', 'func', 'fn main',
        '#include', 'using namespace', 'public static', 'private', 'protected'
      ]

      const looksLikeCode = codeIndicators.some(indicator =>
        code.toLowerCase().includes(indicator.toLowerCase())
      )

      if (looksLikeCode) return true
    }

    // For unknown languages, check for meaningful content
    return code.includes('\n') && code.trim().length > minLength
  }

  const getArtifactType = (language, code) => {
    const lang = language.toLowerCase()

    if (lang === 'html' || code.includes('<html>') || code.includes('<!DOCTYPE')) {
      return artifactTypes.HTML
    }

    return artifactTypes.CODE
  }

  const generateArtifactTitle = (language, code) => {
    const lang = language.toLowerCase()

    const titles = {
      html: 'HTML Document',
      css: 'CSS Styles',
      javascript: 'JavaScript Code',
      js: 'JavaScript Code',
      typescript: 'TypeScript Code',
      ts: 'TypeScript Code',
      jsx: 'React Component',
      tsx: 'React TypeScript Component',
      python: 'Python Script',
      java: 'Java Code',
      cpp: 'C++ Code',
      'c++': 'C++ Code',
      c: 'C Code',
      php: 'PHP Script',
      ruby: 'Ruby Script',
      go: 'Go Code',
      rust: 'Rust Code',
      swift: 'Swift Code',
      kotlin: 'Kotlin Code',
      json: 'JSON Data',
      xml: 'XML Document',
      yaml: 'YAML Config',
      yml: 'YAML Config',
      sql: 'SQL Query',
      markdown: 'Markdown Document',
      md: 'Markdown Document',
      bash: 'Bash Script',
      sh: 'Shell Script',
      powershell: 'PowerShell Script',
      dockerfile: 'Dockerfile',
      makefile: 'Makefile'
    }

    return titles[lang] || `${language.toUpperCase()} Code`
  }

  const createArtifactContainer = (artifact, artifactId) => {
    const isWebCode = ['html', 'css', 'javascript', 'js', 'typescript', 'ts', 'jsx', 'tsx'].includes(artifact.language.toLowerCase())
    const isHtml = artifact.type === artifactTypes.HTML || artifact.language.toLowerCase() === 'html'
    const isMarkdown = ['markdown', 'md'].includes(artifact.language.toLowerCase())

    return `
      <div class="artifact-container" data-artifact-id="${artifactId}">
        <div class="artifact-header">
          <div class="artifact-info">
            <i class="fas fa-${getArtifactIcon(artifact.type)}"></i>
            <span class="artifact-title">${escapeHtml(artifact.title)}</span>
            <span class="artifact-language">${artifact.language}</span>
          </div>
          <div class="artifact-actions">
            <button class="artifact-btn copy-artifact-btn" onclick="handleArtifactAction('copy-artifact', '${artifactId}')" title="Копировать код">
              <i class="fas fa-copy"></i>
            </button>
            ${isWebCode ? `
            <button class="artifact-btn playground-artifact-btn" onclick="handleArtifactAction('playground-artifact', '${artifactId}')" title="Открыть в Playground">
              <i class="fas fa-play"></i>
            </button>
            ` : ''}
            ${(isHtml || isMarkdown) ? `
            <button class="artifact-btn preview-artifact-btn" onclick="handleArtifactAction('preview-artifact', '${artifactId}')" title="Предпросмотр">
              <i class="fas fa-eye"></i>
            </button>
            ` : ''}
            <button class="artifact-btn open-artifact-btn" onclick="handleArtifactAction('open-artifact', '${artifactId}')" title="Открыть в панели артефактов">
              <i class="fas fa-external-link-alt"></i>
            </button>
          </div>
        </div>
        <div class="artifact-preview">
          <pre><code class="language-${artifact.language}">${escapeHtml(artifact.code)}</code></pre>
        </div>
      </div>
    `
  }

  const getArtifactIcon = (type) => {
    const icons = {
      [artifactTypes.CODE]: 'code',
      [artifactTypes.HTML]: 'globe',
      [artifactTypes.IMAGE]: 'image',
      [artifactTypes.VIDEO]: 'video',
      [artifactTypes.AUDIO]: 'music'
    }
    return icons[type] || 'file'
  }

  const escapeHtml = (text) => {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Global function for handling artifact actions (called from HTML)
  window.handleArtifactAction = (action, artifactId) => {
    const artifact = artifacts.get(artifactId)
    if (artifact && onArtifactAction) {
      onArtifactAction(action, artifact)
    }
  }

  return {
    processMessageContent,
    artifacts
  }
}