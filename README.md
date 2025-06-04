# AI Chat Assistant PWA 🚀

Современное Progressive Web App для общения с AI ассистентом, построенное на Vue.js 3 с полной поддержкой PWA функций.

## ✨ PWA Особенности

- 📱 **Устанавливается как нативное приложение** на любом устройстве
- 🔄 **Работает офлайн** с кэшированием контента
- 🔔 **Push уведомления** о новых сообщениях
- ⚡ **Быстрая загрузка** благодаря Service Worker
- 🎯 **App Shortcuts** для быстрого доступа к функциям
- 🌙 **Адаптивная тема** (светлая/темная)
- 📊 **Оптимизировано для производительности**

## 🛠 Установка и запуск

### Предварительные требования

- Node.js >= 18.0.0
- npm >= 9.0.0

### Установка зависимостей

```bash
npm install
```

### Генерация иконок PWA

```bash
# Автоматическая генерация всех необходимых иконок
npm run generate-icons

# Или вручную поместите icon-source.png (512x512) в src/assets/
```

### Разработка

```bash
# Запуск dev сервера
npm run dev

# Запуск с PWA (для тестирования)
npm run dev:pwa
```

### Сборка для продакшена

```bash
# Полная сборка PWA (с генерацией иконок)
npm run build-pwa

# Обычная сборка
npm run build

# Предпросмотр сборки
npm run preview
```

## 📱 Тестирование PWA

### Локальное тестирование

```bash
# Сборка и запуск preview сервера
npm run test-pwa
```

Затем откройте Chrome DevTools → Application → Service Workers/Manifest для проверки PWA функций.

### Lighthouse анализ

```bash
# Автоматический анализ PWA с Lighthouse
npm run lighthouse
```

### Тестирование на мобильных устройствах

1. Убедитесь что сервер доступен в локальной сети:
```bash
npm run serve
```

2. Откройте приложение на мобильном устройстве по IP адресу
3. В браузере появится предложение "Добавить на главный экран"

## 🚀 Развертывание

### Netlify (рекомендуется)

1. Подключите Git репозиторий к Netlify
2. Настройте build command: `npm run build-pwa`
3. Настройте publish directory: `dist`
4. Добавьте переменные окружения если нужно
5. Deploy!

### Vercel

```bash
# Установите Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### GitHub Pages

1. Настройте GitHub Actions workflow:

```yaml
name: Deploy PWA
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build-pwa
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Apache/Nginx

Важные настройки для PWA:

#### Apache (.htaccess)

```apache
# Кэширование
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType application/manifest+json "access plus 1 week"
</IfModule>

# HTTPS редирект (обязательно для PWA)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA routing
RewriteEngine On
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options SAMEORIGIN
Header always set X-XSS-Protection "1; mode=block"
```

#### Nginx

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    # SSL настройки...
    
    location / {
        try_files $uri $uri/ /index.html;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Кэширование manifest
        location = /manifest.json {
            expires 1w;
            add_header Cache-Control "public";
        }
        
        # Service Worker не кэшируем
        location = /sw.js {
            expires 0;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }
}
```

## 🔧 Настройка PWA

### Обновление manifest.json

Отредактируйте `public/manifest.json`:

```json
{
  "name": "Ваше AI Chat приложение",
  "short_name": "AI Chat",
  "start_url": "/",
  "scope": "/",
  "theme_color": "#your-color",
  "background_color": "#your-bg-color"
}
```

### Настройка Service Worker

Кастомизируйте кэширование в `public/sw.js`:

```javascript
// Добавьте свои URL для кэширования
const STATIC_ASSETS = [
  '/',
  '/your-custom-page',
  // ...
]
```

### Настройка уведомлений

1. Получите VAPID ключи для push уведомлений
2. Настройте backend для отправки push уведомлений
3. Обновите настройки в приложении

## 📊 Оптимизация производительности

### Анализ бандла

```bash
npm run analyze
```

### Оптимизация изображений

- Используйте WebP формат
