import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.scss'

// Import Prism.js for syntax highlighting
import 'prismjs'
import 'prismjs/plugins/autoloader/prism-autoloader'

// Import marked for markdown parsing
import { marked } from 'marked'

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

const app = createApp(App)
app.mount('#app')