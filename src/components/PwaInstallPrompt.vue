<template>
  <Teleport to="body">
    <div v-if="showPrompt" class="pwa-install-prompt">
      <div class="pwa-install-content">
        <div class="pwa-install-header">
          <div class="pwa-app-info">
            <img 
              src="/icons/icon-72x72.png" 
              alt="AI Chat Icon" 
              class="pwa-app-icon"
            >
            <div class="pwa-app-details">
              <h3>AI Chat Assistant</h3>
              <p>Установите приложение для быстрого доступа</p>
            </div>
          </div>
          <button class="pwa-close-btn" @click="closePrompt">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="pwa-features">
          <div class="pwa-feature">
            <i class="fas fa-bolt"></i>
            <span>Быстрый запуск</span>
          </div>
          <div class="pwa-feature">
            <i class="fas fa-wifi-slash"></i>
            <span>Работает офлайн</span>
          </div>
          <div class="pwa-feature">
            <i class="fas fa-mobile-alt"></i>
            <span>Как родное приложение</span>
          </div>
        </div>

        <div class="pwa-actions">
          <button class="pwa-btn pwa-btn-secondary" @click="dismissPrompt">
            Не сейчас
          </button>
          <button class="pwa-btn pwa-btn-primary" @click="installApp">
            <i class="fas fa-download"></i>
            Установить
          </button>
        </div>
      </div>
    </div>

    <!-- Update notification -->
    <div v-if="showUpdateNotification" class="pwa-update-notification">
      <div class="pwa-update-content">
        <div class="pwa-update-info">
          <i class="fas fa-sync-alt"></i>
          <div>
            <h4>Доступно обновление</h4>
            <p>Новая версия приложения готова к установке</p>
          </div>
        </div>
        <div class="pwa-update-actions">
          <button class="pwa-btn pwa-btn-secondary" @click="dismissUpdate">
            Позже
          </button>
          <button class="pwa-btn pwa-btn-primary" @click="updateApp">
            Обновить
          </button>
        </div>
      </div>
    </div>

    <!-- Offline notification -->
    <div v-if="showOfflineNotification" class="pwa-offline-notification">
      <div class="pwa-offline-content">
        <i class="fas fa-wifi-slash"></i>
        <span>Работаем в офлайн режиме</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { usePWA } from '../composables/usePWA'
import { useStorage } from '@vueuse/core'

const props = defineProps({
  autoShow: {
    type: Boolean,
    default: true
  },
  showAfter: {
    type: Number,
    default: 10000 // 10 секунд
  }
})

const emit = defineEmits(['install', 'update', 'dismiss'])

const {
  isOnline,
  isInstallable,
  isInstalled,
  updateAvailable,
  installApp: pwaInstallApp,
  updateServiceWorker
} = usePWA()

// Локальное состояние
const showPrompt = ref(false)
const showUpdateNotification = ref(false)
const showOfflineNotification = ref(false)

// Настройки из localStorage
const promptDismissed = useStorage('pwa-prompt-dismissed', false)
const lastPromptTime = useStorage('pwa-last-prompt', 0)
const updateDismissed = useStorage('pwa-update-dismissed', false)

// Вычисляемые свойства
const shouldShowPrompt = computed(() => {
  if (!props.autoShow) return false
  if (isInstalled.value) return false
  if (promptDismissed.value) return false
  if (!isInstallable.value) return false
  
  // Показываем промпт не чаще раза в день
  const dayInMs = 24 * 60 * 60 * 1000
  const timeSinceLastPrompt = Date.now() - lastPromptTime.value
  return timeSinceLastPrompt > dayInMs
})

// Методы
const installApp = async () => {
  try {
    const success = await pwaInstallApp()
    if (success) {
      emit('install')
      closePrompt()
    }
  } catch (error) {
    console.error('[PWA] Install failed:', error)
  }
}

const updateApp = () => {
  updateServiceWorker()
  emit('update')
  showUpdateNotification.value = false
  updateDismissed.value = false
}

const closePrompt = () => {
  showPrompt.value = false
}

const dismissPrompt = () => {
  showPrompt.value = false
  promptDismissed.value = true
  lastPromptTime.value = Date.now()
  emit('dismiss', 'install')
}

const dismissUpdate = () => {
  showUpdateNotification.value = false
  updateDismissed.value = true
  setTimeout(() => {
    updateDismissed.value = false
  }, 60000) // Показываем снова через минуту
}

// Watchers
watch(shouldShowPrompt, (show) => {
  if (show) {
    setTimeout(() => {
      showPrompt.value = true
      lastPromptTime.value = Date.now()
    }, props.showAfter)
  }
})

watch(updateAvailable, (available) => {
  if (available && !updateDismissed.value) {
    showUpdateNotification.value = true
  }
})

watch(isOnline, (online) => {
  if (!online) {
    showOfflineNotification.value = true
    setTimeout(() => {
      showOfflineNotification.value = false
    }, 5000)
  } else {
    showOfflineNotification.value = false
  }
})

// Методы для внешнего использования
const showInstallPrompt = () => {
  if (isInstallable.value && !isInstalled.value) {
    showPrompt.value = true
  }
}

const hideInstallPrompt = () => {
  showPrompt.value = false
}

// Экспортируем методы
defineExpose({
  showInstallPrompt,
  hideInstallPrompt
})

onMounted(() => {
  // Сбрасываем флаг при переустановке приложения
  if (isInstalled.value) {
    promptDismissed.value = false
  }
})
</script>

<style lang="scss" scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: $space-xl;
  left: $space-xl;
  right: $space-xl;
  z-index: 3000;
  animation: slideInUp 0.3s ease-out;

  @media (max-width: $breakpoint-mobile) {
    bottom: $space-md;
    left: $space-md;
    right: $space-md;
  }

  @media (min-width: $breakpoint-tablet) {
    left: auto;
    right: $space-xl;
    width: 400px;
  }
}

.pwa-install-content {
  background: $bg-main;
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  border: 1px solid $border-light;
  overflow: hidden;
}

.pwa-install-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-lg;
  border-bottom: 1px solid $border-light;
}

.pwa-app-info {
  display: flex;
  align-items: center;
  gap: $space-md;
}

.pwa-app-icon {
  width: 48px;
  height: 48px;
  border-radius: $radius-md;
}

.pwa-app-details {
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 2px;
  }

  p {
    font-size: 13px;
    color: $text-secondary;
    margin: 0;
  }
}

.pwa-close-btn {
  background: none;
  border: none;
  color: $text-tertiary;
  cursor: pointer;
  padding: $space-sm;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:hover {
    background: $bg-code;
    color: $text-primary;
  }
}

.pwa-features {
  display: flex;
  justify-content: space-around;
  padding: $space-lg;
  background: $bg-code;
}

.pwa-feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-xs;
  text-align: center;

  i {
    font-size: 20px;
    color: $color-primary;
  }

  span {
    font-size: 12px;
    color: $text-secondary;
    font-weight: 500;
  }
}

.pwa-actions {
  display: flex;
  gap: $space-md;
  padding: $space-lg;
}

.pwa-btn {
  flex: 1;
  padding: $space-md $space-lg;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all $transition-fast;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-sm;

  &-primary {
    background: $color-primary;
    border: none;
    color: white;

    &:hover {
      background: $color-primary-dark;
      transform: translateY(-1px);
    }
  }

  &-secondary {
    background: $bg-main;
    border: 1px solid $border-light;
    color: $text-secondary;

    &:hover {
      background: $bg-code;
      color: $text-primary;
    }
  }
}

.pwa-update-notification {
  position: fixed;
  top: $space-xl;
  right: $space-xl;
  z-index: 3000;
  width: 350px;
  animation: slideInRight 0.3s ease-out;

  @media (max-width: $breakpoint-mobile) {
    top: $space-md;
    right: $space-md;
    left: $space-md;
    width: auto;
  }
}

.pwa-update-content {
  background: $bg-main;
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  border: 1px solid $border-light;
  padding: $space-lg;
}

.pwa-update-info {
  display: flex;
  align-items: flex-start;
  gap: $space-md;
  margin-bottom: $space-lg;

  i {
    font-size: 20px;
    color: $color-primary;
    margin-top: 2px;
  }

  h4 {
    font-size: 15px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 2px;
  }

  p {
    font-size: 13px;
    color: $text-secondary;
    margin: 0;
  }
}

.pwa-update-actions {
  display: flex;
  gap: $space-sm;
}

.pwa-offline-notification {
  position: fixed;
  top: $space-xl;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  animation: slideInDown 0.3s ease-out;

  @media (max-width: $breakpoint-mobile) {
    top: $space-md;
    left: $space-md;
    right: $space-md;
    transform: none;
  }
}

.pwa-offline-content {
  background: $color-warning;
  color: white;
  padding: $space-md $space-lg;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  gap: $space-sm;
  font-size: 14px;
  font-weight: 500;
  box-shadow: $shadow-lg;

  i {
    font-size: 16px;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>