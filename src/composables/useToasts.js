import { ref } from 'vue'

const toasts = ref([])

export function useToasts() {
  const generateId = () => {
    return Math.random().toString(36).substr(2, 9)
  }

  const showToast = (message, type = 'info') => {
    const toast = {
      id: generateId(),
      message,
      type,
      timestamp: Date.now()
    }

    toasts.value.push(toast)

    // Auto remove after delay
    const delay = type === 'error' ? 5000 : 3000
    setTimeout(() => {
      removeToast(toast.id)
    }, delay)

    return toast.id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearToasts = () => {
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts
  }
}