// src/composables/useApi.js
export function useApi() {
  const sendToAPI = async (messages, settings, chatId) => {
    const messagesForApi = messages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content,
      files: msg.files || []
    }))

    // Check if last message has files
    const lastMessage = messagesForApi[messagesForApi.length - 1]
    const hasFiles = lastMessage && lastMessage.files && lastMessage.files.length > 0

    // Validate webhook URL
    if (!settings.webhookUrl || !isValidUrl(settings.webhookUrl)) {
      throw new Error('Некорректный Webhook URL. Проверьте настройки.')
    }

    try {
      let response

      if (hasFiles) {
        response = await sendWithFiles(settings, messagesForApi, lastMessage, chatId)
      } else {
        response = await sendTextOnly(settings, messagesForApi, chatId)
      }

      if (!response.ok) {
        const errorText = await safeGetText(response)
        throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? '\n' + errorText : ''}`)
      }

      const data = await safeGetJson(response)
      return parseAPIResponse(data)

    } catch (error) {
      console.error('API Error:', error)
      throw enhanceError(error, settings.webhookUrl)
    }
  }

  const sendWithFiles = async (settings, messagesForApi, lastMessage, chatId) => {
    const formData = new FormData()

    // Add basic parameters
    formData.append('model', settings.modelName)
    formData.append('max_tokens', settings.maxTokens.toString())
    formData.append('temperature', settings.temperature.toString())
    formData.append('stream', 'false') // Force disable streaming for mobile
    formData.append('chatId', chatId)

    // Add messages (without files for JSON part)
    const messagesForJson = messagesForApi.map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    formData.append('messages', JSON.stringify(messagesForJson))

    // Add files
    lastMessage.files.forEach((fileData, index) => {
      if (fileData.file) {
        formData.append(`file_${index}`, fileData.file, fileData.name)
        formData.append(`file_${index}_metadata`, JSON.stringify({
          name: fileData.name,
          type: fileData.type,
          size: fileData.size
        }))
      }
    })

    const headers = {}
    if (settings.apiKey) {
      headers['Authorization'] = `Bearer ${settings.apiKey}`
    }

    return await fetchWithMobileSupport(settings.webhookUrl, {
      method: 'POST',
      headers: headers,
      body: formData
    })
  }

  const sendTextOnly = async (settings, messagesForApi, chatId) => {
    const payload = {
      model: settings.modelName,
      messages: messagesForApi.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      stream: false, // Force disable streaming for mobile
      chatId: chatId
    }

    const headers = {
      'Content-Type': 'application/json'
    }

    if (settings.apiKey) {
      headers['Authorization'] = `Bearer ${settings.apiKey}`
    }

    return await fetchWithMobileSupport(settings.webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    })
  }

  const fetchWithMobileSupport = async (url, options, maxRetries = 3) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // Mobile-specific timeout (longer for mobile networks)
    const timeout = isMobile ? 60000 : 30000

    let lastError

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        // Mobile-specific fetch options
        const fetchOptions = {
          ...options,
          signal: controller.signal,
          // Mobile browsers sometimes need these
          cache: 'no-cache',
          credentials: 'omit', // Avoid CORS credential issues
          mode: 'cors'
        }

        // Add mobile-specific headers
        if (isMobile) {
          fetchOptions.headers = {
            ...fetchOptions.headers,
            'User-Agent': navigator.userAgent,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8'
          }
        }

        console.log(`Attempt ${attempt + 1}/${maxRetries}:`, {
          url,
          method: fetchOptions.method,
          headers: fetchOptions.headers,
          isMobile,
          timeout
        })

        const response = await fetch(url, fetchOptions)
        clearTimeout(timeoutId)

        console.log('Response received:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        })

        return response

      } catch (error) {
        lastError = error
        console.error(`Attempt ${attempt + 1} failed:`, error)

        // Don't retry on certain errors
        if (error.name === 'AbortError') {
          throw new Error(`Запрос превысил время ожидания (${timeout/1000} секунд)`)
        }

        // On mobile, retry with increasing delays
        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
          console.log(`Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
    }

    throw lastError
  }

  const safeGetJson = async (response) => {
    try {
      const text = await response.text()
      console.log('Raw response text:', text)
      console.log('Response text length:', text.length)
      console.log('Response text type:', typeof text)

      if (!text || text.trim() === '') {
        throw new Error('Пустой ответ от сервера')
      }

      const parsed = JSON.parse(text)
      console.log('Parsed JSON:', parsed)
      return parsed
    } catch (error) {
      console.error('JSON parsing error:', error)
      if (error instanceof SyntaxError) {
        throw new Error(`Сервер вернул некорректный JSON: ${error.message}`)
      }
      throw error
    }
  }

  const safeGetText = async (response) => {
    try {
      return await response.text()
    } catch (error) {
      console.warn('Failed to get error text:', error)
      return ''
    }
  }

  const isValidUrl = (string) => {
    try {
      const url = new URL(string)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (_) {
      return false
    }
  }

  const enhanceError = (error, webhookUrl) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isHttps = window.location.protocol === 'https:'
    const webhookIsHttps = webhookUrl.startsWith('https://')

    let message = error.message

    // Network-related errors
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      if (isMobile) {
        message = '📱 Ошибка сети на мобильном устройстве\n'

        if (isHttps && !webhookIsHttps) {
          message += '🔒 HTTPS сайт не может обращаться к HTTP серверу'
        } else {
          message += '🌐 Проверьте подключение к интернету и настройки сервера'
        }
      } else {
        message = 'Ошибка сети. Проверьте подключение и доступность сервера.'
      }
    }

    // CORS-related errors
    if (error.message.includes('CORS') ||
        (error.message.includes('Failed to fetch') && !webhookUrl.includes('localhost'))) {
      message += '\n\n❌ Проблема с CORS на сервере'
    }

    // HTTPS/HTTP mixed content
    if (isHttps && !webhookIsHttps) {
      message += '\n\n⚠️ Используйте HTTPS для webhook URL'
    }

    // Mobile-specific advice
    if (isMobile) {
      message += '\n\n📱 Советы для мобильных:\n' +
          '• Проверьте WiFi/мобильный интернет\n' +
          '• Убедитесь что сервер доступен с мобильных сетей\n' +
          '• Попробуйте обновить страницу'
    }

    return new Error(message)
  }

  const parseAPIResponse = (data) => {
    console.log('Parsing API response:', data)

    // Handle different response formats
    if (data.choices && data.choices[0]?.message?.content) {
      return { content: data.choices[0].message.content }
    } else if (data.content) {
      return { content: data.content }
    } else if (data.message) {
      return { content: data.message }
    } else if (data.response) {
      return { content: data.response }
    } else {
      console.error('Unknown response format:', data)
      throw new Error('Неверный формат ответа от API')
    }
  }

  return {
    sendToAPI
  }
}
