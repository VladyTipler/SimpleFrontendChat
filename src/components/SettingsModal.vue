<template>
  <div class="modal" @click="handleBackdropClick">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Настройки</h3>
        <button class="close-modal" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label for="webhookUrl">Webhook URL</label>
          <input 
            type="url" 
            id="webhookUrl"
            v-model="localSettings.webhookUrl"
            placeholder="https://your-api-endpoint.com/chat" 
            required
          >
          <small class="form-help">URL вашего API endpoint для отправки сообщений</small>
        </div>

        <div class="form-group">
          <label for="apiKey">API Key (опционально)</label>
          <input 
            type="password" 
            id="apiKey"
            v-model="localSettings.apiKey"
            placeholder="Введите API ключ"
          >
          <small class="form-help">API ключ для авторизации запросов</small>
        </div>

        <div class="form-group">
          <label for="modelName">Модель</label>
          <select id="modelName" v-model="localSettings.modelName">
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
            <option value="gemini-pro">Gemini Pro</option>
          </select>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="localSettings.enableStreaming"
            >
            <span class="checkmark"></span>
            Включить потоковую передачу
          </label>
          <small class="form-help">Получать ответы в реальном времени</small>
        </div>

        <div class="form-group">
          <label for="maxTokens">Максимум токенов</label>
          <input 
            type="number" 
            id="maxTokens"
            v-model.number="localSettings.maxTokens"
            min="1" 
            max="8192"
          >
          <small class="form-help">Максимальное количество токенов в ответе</small>
        </div>

        <div class="form-group">
          <label for="temperature">Температура</label>
          <input 
            type="range" 
            id="temperature"
            v-model.number="localSettings.temperature"
            min="0" 
            max="2" 
            step="0.1"
          >
          <span class="temperature-value">{{ localSettings.temperature }}</span>
          <small class="form-help">Контролирует креативность ответов (0 - точность, 2 - креативность)</small>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">Отмена</button>
        <button class="btn-primary" @click="handleSave">Сохранить</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  settings: Object
})

const emit = defineEmits(['close', 'save'])

const localSettings = ref({
  webhookUrl: '',
  apiKey: '',
  modelName: 'gpt-4',
  enableStreaming: false,
  maxTokens: 2048,
  temperature: 0.7
})

// Initialize local settings when props change
watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    localSettings.value = { ...newSettings }
  }
}, { immediate: true })

const handleSave = () => {
  emit('save', localSettings.value)
}

const handleBackdropClick = (e) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}
</script>

<style lang="scss" scoped>
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: $bg-main;
  border-radius: $radius-lg;
  box-shadow: $shadow-xl;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn $transition-normal ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-xl;
  border-bottom: 1px solid $border-light;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: $text-primary;
  }
}

.close-modal {
  background: none;
  border: none;
  color: $text-tertiary;
  cursor: pointer;
  font-size: 20px;
  padding: $space-sm;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:hover {
    background: $bg-code;
    color: $text-primary;
  }
}

.modal-body {
  padding: $space-xl;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: $space-xl;

  label {
    display: block;
    margin-bottom: $space-sm;
    font-weight: 500;
    color: $text-primary;
    font-size: 14px;
  }

  input[type="text"],
  input[type="url"],
  input[type="password"],
  input[type="number"],
  select {
    width: 100%;
    padding: $space-md;
    border: 1px solid $border-light;
    border-radius: $radius-md;
    font-size: 14px;
    transition: border-color $transition-fast;
    background: $bg-main;
    color: $text-primary;

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
  }

  input[type="range"] {
    width: 100%;
    margin: $space-sm 0;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: $space-sm;
  cursor: pointer;
  font-weight: normal;

  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }
}

.form-help {
  display: block;
  margin-top: $space-xs;
  font-size: 12px;
  color: $text-tertiary;
  line-height: 1.4;
}

.temperature-value {
  display: inline-block;
  margin-left: $space-sm;
  font-weight: 500;
  color: $color-primary;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: $space-md;
  padding: $space-xl;
  border-top: 1px solid $border-light;
  background: $bg-code;
}

.btn-primary {
  background: $color-primary;
  border: none;
  color: white;
  cursor: pointer;
  padding: $space-md $space-xl;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: 500;
  transition: all $transition-fast;

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-1px);
  }
}

.btn-secondary {
  background: $bg-main;
  border: 1px solid $border-light;
  color: $text-secondary;
  cursor: pointer;
  padding: $space-md $space-xl;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: 500;
  transition: all $transition-fast;

  &:hover {
    background: $bg-code;
    color: $text-primary;
  }
}
</style>