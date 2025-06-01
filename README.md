# AI Chat Assistant - Vue.js

Современное веб-приложение для общения с AI ассистентом, построенное на Vue.js 3 с использованием Composition API, Vite и SCSS.

## 🚀 Особенности

- **Vue.js 3** с Composition API
- **Vite** для быстрой разработки и сборки
- **SCSS** для стилизации с переменными и миксинами
- **Адаптивный дизайн** для всех устройств
- **Темная тема** (автоматически по системным настройкам)
- **Управление файлами** - загрузка и отправка файлов
- **Артефакты кода** с подсветкой синтаксиса
- **Playground** для запуска HTML/CSS/JS кода
- **Предпросмотр** HTML и Markdown
- **Уведомления** (Toast)
- **Локальное хранение** чатов и настроек

## 📦 Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd ai-chat-vue
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите сервер разработки:
```bash
npm run dev
```

4. Откройте браузер по адресу `http://localhost:3000`

## 🏗 Сборка для продакшена

```bash
npm run build
```

Собранные файлы будут в папке `dist/`.

Для предпросмотра сборки:
```bash
npm run preview
```

## 📁 Структура проекта

```
src/
├── components/           # Vue компоненты
│   ├── artifacts/       # Компоненты артефактов
│   │   ├── PreviewTab.vue
│   │   ├── CodeTab.vue
│   │   └── PlaygroundTab.vue
│   ├── ArtifactsPanel.vue
│   ├── ChatContainer.vue
│   ├── MessageBubble.vue
│   ├── MessageInput.vue
│   ├── SettingsModal.vue
│   ├── Sidebar.vue
│   ├── ToastContainer.vue
│   └── WelcomeMessage.vue
├── composables/         # Композиционные функции
│   ├── useApi.js
│   ├── useArtifactDetection.js
│   ├── useArtifacts.js
│   ├── useChatStore.js
│   └── useToasts.js
├── styles/              # SCSS стили
│   ├── variables.scss   # Переменные
│   ├── base.scss       # Базовые стили
│   ├── components.scss # Компоненты
│   ├── animations.scss # Анимации
│   ├── responsive.scss # Адаптивность
│   ├── dark-mode.scss  # Темная тема
│   └── main.scss       # Главный файл
├── App.vue             # Главный компонент
└── main.js            # Точка входа
```

## 🔧 Настройка

1. Откройте настройки в приложении
2. Укажите **Webhook URL** - адрес вашего API
3. При необходимости добавьте **API Key**
4. Выберите модель и настройте параметры

### Формат API

Приложение отправляет POST запросы в следующем формате:

**Для текстовых сообщений:**
```json
{
    "model": "gpt-4",
    "messages": [
        {
            "role": "user",
            "content": "Привет!"
        }
    ],
    "max_tokens": 2048,
    "temperature": 0.7,
    "stream": false,
    "chatId": "chat_1701234567890"
}
```

**Для сообщений с файлами (FormData):**
- `model`, `max_tokens`, `temperature`, `stream` - параметры
- `chatId` - уникальный идентификатор чата
- `messages` - JSON строка с сообщениями
- `file_0`, `file_1`, ... - файлы
- `file_0_metadata`, `file_1_metadata`, ... - метаданные файлов

**Ожидаемый ответ:**
```json
{
    "choices": [
        {
            "message": {
                "content": "Привет! Как дела?"
            }
        }
    ]
}
```

Или упрощенный формат:
```json
{
    "content": "Привет! Как дела?"
}
```

## 🎨 Кастомизация

### Цвета и переменные

Измените переменные в `src/styles/variables.scss`:

```scss
$color-primary: #4f46e5;
$color-success: #10b981;
$color-warning: #f59e0b;
$color-error: #ef4444;
```

### Темы

Приложение автоматически поддерживает темную тему через `prefers-color-scheme`. Для принудительного переключения можно добавить класс `.dark-mode` к body.

### Компоненты

Все компоненты используют scoped стили и композиционные функции для повторного использования логики.

## 🔌 API интеграция

### Composables

- **useChatStore** - управление чатами и сообщениями
- **useApi** - отправка запросов к API
- **useArtifacts** - работа с артефактами кода
- **useToasts** - уведомления
- **useArtifactDetection** - обнаружение кода в сообщениях

### Локальное хранение

- Чаты сохраняются в `localStorage` как `aiChatData`
- Настройки сохраняются как `aiChatSettings`
- Ширина панели артефактов как `artifactsPanelWidth`

## 📱 Адаптивность

- **Мобильные устройства** (< 768px) - полноэкранная боковая панель
- **Планшеты** (768px - 1024px) - уменьшенная боковая панель
- **Десктоп** (> 1024px) - полная функциональность с изменяемой панелью артефактов

## 🎯 Возможности артефактов

- **Подсветка синтаксиса** с Prism.js
- **Предпросмотр HTML** в iframe
- **Рендеринг Markdown** в HTML
- **Playground** для HTML/CSS/JS с TypeScript поддержкой
- **Копирование** кода в буфер обмена
- **Скачивание** файлов с правильными расширениями

## 🚧 Разработка

### Добавление нового компонента

1. Создайте компонент в `src/components/`
2. Добавьте стили (scoped или в отдельный SCSS файл)
3. Импортируйте и используйте в родительском компоненте

### Добавление новой композиционной функции

1. Создайте файл в `src/composables/`
2. Экспортируйте функцию с префиксом `use`
3. Импортируйте в компонентах

### Стили

- Используйте переменные из `variables.scss`
- Следуйте BEM методологии для классов
- Добавляйте адаптивные стили в `responsive.scss`

## 📄 Лицензия

MIT License

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📞 Поддержка

Если у вас возникли вопросы или проблемы, создайте issue в репозитории.
