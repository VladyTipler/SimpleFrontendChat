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

    const headers = {}

    if (hasFiles) {
      // Use FormData for file uploads
      const formData = new FormData()

      // Add basic parameters
      formData.append('model', settings.modelName)
      formData.append('max_tokens', settings.maxTokens.toString())
      formData.append('temperature', settings.temperature.toString())
      formData.append('stream', settings.enableStreaming.toString())
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
          // Add file metadata
          formData.append(`file_${index}_metadata`, JSON.stringify({
            name: fileData.name,
            type: fileData.type,
            size: fileData.size
          }))
        }
      })

      // Don't set Content-Type for FormData - browser will set it automatically with boundary
      if (settings.apiKey) {
        headers['Authorization'] = `Bearer ${settings.apiKey}`
      }

      const response = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: headers,
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return parseAPIResponse(data)

    } else {
      // Use regular JSON for text-only messages
      const payload = {
        model: settings.modelName,
        messages: messagesForApi.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        stream: settings.enableStreaming,
        chatId: chatId
      }

      headers['Content-Type'] = 'application/json'
      if (settings.apiKey) {
        headers['Authorization'] = `Bearer ${settings.apiKey}`
      }

      const response = await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return parseAPIResponse(data)
    }
  }

  const parseAPIResponse = (data) => {
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
      throw new Error('Invalid response format from API')
    }
  }

  return {
    sendToAPI
  }
}
