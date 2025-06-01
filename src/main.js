import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.scss'

// Import Prism.js for syntax highlighting
import 'prismjs'
import 'prismjs/plugins/autoloader/prism-autoloader'

// Import marked for markdown parsing
import { marked } from 'marked'

// Configure Prism autoloader
if (window.Prism) {
  window.Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/'
}

// Configure marked
marked.setOptions({
  highlight: function(code, lang) {
    if (window.Prism && window.Prism.languages[lang]) {
      return window.Prism.highlight(code, window.Prism.languages[lang], lang)
    }
    return code
  },
  langPrefix: 'language-',
  pedantic: false,
  gfm: true,
  breaks: true,
  sanitize: false,
  smartypants: false,
  xhtml: false
})

// Override Prism's default styles to remove text-shadow globally
const removePrismTextShadow = () => {
  const style = document.createElement('style')
  style.textContent = `
    .token {
      text-shadow: none !important;
    }
    pre[class*="language-"], code[class*="language-"] {
      text-shadow: none !important;
    }
  `
  document.head.appendChild(style)
}

const app = createApp(App)

// Remove Prism text shadows after app mounts
app.mount('#app')

// Apply the override after DOM is ready
setTimeout(removePrismTextShadow, 100)
