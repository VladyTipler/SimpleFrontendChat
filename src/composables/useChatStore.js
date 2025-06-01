import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'

// Global state
const chats = ref(new Map())
const currentChatId = ref(null)

export function useChatStore() {
  const currentChat = computed(() => {
    return currentChatId.value ? chats.value.get(currentChatId.value) : null
  })

  const generateId = () => {
    return Math.random().toString(36).substr(2, 9)
  }

  const generateChatTitle = (content) => {
    const words = content.trim().split(/\s+/).slice(0, 6)
    let title = words.join(' ')

    if (title.length > 50) {
      title = title.substring(0, 47) + '...'
    }

    return title || 'Новый чат'
  }

  const createNewChat = () => {
    const chatId = 'chat_' + Date.now()
    const chat = {
      id: chatId,
      title: 'Новый чат',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    chats.value.set(chatId, chat)
    currentChatId.value = chatId
    saveChats()
    return chatId
  }

  const switchChat = (chatId) => {
    if (chats.value.has(chatId)) {
      currentChatId.value = chatId
    }
  }

  const deleteChat = (chatId) => {
    if (chats.value.size <= 1) {
      return false // Can't delete last chat
    }

    chats.value.delete(chatId)

    if (chatId === currentChatId.value) {
      // Switch to the most recent chat
      const remainingChats = Array.from(chats.value.values())
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

      if (remainingChats.length > 0) {
        currentChatId.value = remainingChats[0].id
      } else {
        createNewChat()
        return true
      }
    }

    saveChats()
    return true
  }

  const clearCurrentChat = () => {
    if (!currentChatId.value) return

    const chat = chats.value.get(currentChatId.value)
    if (chat) {
      chat.messages = []
      chat.title = 'Новый чат'
      chat.updatedAt = new Date()
      saveChats()
    }
  }

  const addMessageToChat = (message) => {
    const chat = chats.value.get(currentChatId.value)
    if (chat) {
      chat.messages.push(message)
      chat.updatedAt = new Date()

      // Update chat title based on first user message
      if (message.type === 'user' && message.content && chat.messages.length === 1) {
        chat.title = generateChatTitle(message.content)
      }

      saveChats()
    }
  }

  const saveChats = () => {
    try {
      const chatsData = Array.from(chats.value.entries())
      localStorage.setItem('aiChatData', JSON.stringify({
        chats: chatsData,
        currentChatId: currentChatId.value
      }))
    } catch (error) {
      console.warn('Failed to save chats:', error)
    }
  }

  const loadChats = () => {
    try {
      const saved = localStorage.getItem('aiChatData')
      if (saved) {
        const data = JSON.parse(saved)

        if (data.chats && Array.isArray(data.chats)) {
          chats.value = new Map(data.chats.map(([id, chat]) => {
            // Convert date strings back to Date objects
            return [id, {
              ...chat,
              createdAt: new Date(chat.createdAt),
              updatedAt: new Date(chat.updatedAt),
              messages: chat.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }]
          }))
        }

        if (data.currentChatId && chats.value.has(data.currentChatId)) {
          currentChatId.value = data.currentChatId
        }
      }
    } catch (error) {
      console.warn('Failed to load chats:', error)
    }

    // Ensure we have at least one chat
    if (chats.value.size === 0) {
      createNewChat()
    }
  }

  return {
    chats,
    currentChatId,
    currentChat,
    createNewChat,
    switchChat,
    deleteChat,
    clearCurrentChat,
    addMessageToChat,
    saveChats,
    loadChats
  }
}