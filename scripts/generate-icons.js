#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 *
 * Генерирует все необходимые иконки для PWA из исходного изображения
 * Требует установки sharp: npm install sharp
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Размеры иконок для генерации
const iconSizes = [
    { size: 16, name: 'icon-16x16.png' },
    { size: 32, name: 'icon-32x32.png' },
    { size: 72, name: 'icon-72x72.png' },
    { size: 96, name: 'icon-96x96.png' },
    { size: 128, name: 'icon-128x128.png' },
    { size: 144, name: 'icon-144x144.png' },
    { size: 152, name: 'icon-152x152.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 384, name: 'icon-384x384.png' },
    { size: 512, name: 'icon-512x512.png' }
]

// Размеры splash экранов для iOS
const splashSizes = [
    // iPhone
    { width: 750, height: 1334, name: 'iphone-8-portrait.png' },
    { width: 1334, height: 750, name: 'iphone-8-landscape.png' },
    { width: 828, height: 1792, name: 'iphone-11-portrait.png' },
    { width: 1792, height: 828, name: 'iphone-11-landscape.png' },
    { width: 1125, height: 2436, name: 'iphone-11-pro-portrait.png' },
    { width: 2436, height: 1125, name: 'iphone-11-pro-landscape.png' },
    { width: 1242, height: 2688, name: 'iphone-11-pro-max-portrait.png' },
    { width: 2688, height: 1242, name: 'iphone-11-pro-max-landscape.png' },
    { width: 1080, height: 2340, name: 'iphone-14-portrait.png' },
    { width: 2340, height: 1080, name: 'iphone-14-landscape.png' },
    { width: 1179, height: 2556, name: 'iphone-14-pro-portrait.png' },
    { width: 2556, height: 1179, name: 'iphone-14-pro-landscape.png' },
    { width: 1284, height: 2778, name: 'iphone-14-plus-portrait.png' },
    { width: 2778, height: 1284, name: 'iphone-14-plus-landscape.png' },
    { width: 1290, height: 2796, name: 'iphone-14-pro-max-portrait.png' },
    { width: 2796, height: 1290, name: 'iphone-14-pro-max-landscape.png' },
    { width: 1125, height: 2436, name: 'iphone-13-mini-portrait.png' },
    { width: 2436, height: 1125, name: 'iphone-13-mini-landscape.png' },

    // iPad
    { width: 1536, height: 2048, name: 'ipad-portrait.png' },
    { width: 2048, height: 1536, name: 'ipad-landscape.png' },
    { width: 1640, height: 2360, name: 'ipad-air-portrait.png' },
    { width: 2360, height: 1640, name: 'ipad-air-landscape.png' },
    { width: 1668, height: 2388, name: 'ipad-pro-11-portrait.png' },
    { width: 2388, height: 1668, name: 'ipad-pro-11-landscape.png' },
    { width: 2048, height: 2732, name: 'ipad-pro-12-portrait.png' },
    { width: 2732, height: 2048, name: 'ipad-pro-12-landscape.png' }
]

const sourceImagePath = path.resolve(__dirname, '../src/assets/icon-source.png')
const publicDir = path.resolve(__dirname, '../public')
const iconsDir = path.join(publicDir, 'icons')
const splashDir = path.join(publicDir, 'splash')

async function generateIcons() {
    try {
        // Проверяем существование исходного изображения
        if (!fs.existsSync(sourceImagePath)) {
            console.error('❌ Исходное изображение не найдено:', sourceImagePath)
            console.log('📝 Создайте файл icon-source.png размером минимум 512x512px в папке src/assets/')
            return
        }

        // Создаем папки если их нет
        if (!fs.existsSync(iconsDir)) {
            fs.mkdirSync(iconsDir, { recursive: true })
        }
        if (!fs.existsSync(splashDir)) {
            fs.mkdirSync(splashDir, { recursive: true })
        }

        console.log('🎨 Генерация иконок PWA...')

        // Генерируем иконки
        for (const { size, name } of iconSizes) {
            const outputPath = path.join(iconsDir, name)

            await sharp(sourceImagePath)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center'
                })
                .png()
                .toFile(outputPath)

            console.log(`✅ Создана иконка: ${name} (${size}x${size})`)
        }

        // Генерируем favicon.ico
        await sharp(sourceImagePath)
            .resize(32, 32)
            .png()
            .toFile(path.join(publicDir, 'favicon.ico'))

        console.log('✅ Создан favicon.ico')

        console.log('\n🖼️  Генерация splash экранов...')

        // Генерируем splash экраны
        for (const { width, height, name } of splashSizes) {
            const outputPath = path.join(splashDir, name)

            // Создаем splash экран с фоном и центрированной иконкой
            const iconSize = Math.min(width, height) * 0.15 // 15% от меньшей стороны
            const backgroundColor = '#4f46e5' // Цвет темы

            // Создаем красивый градиентный фон для splash
            const splashSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
            </linearGradient>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
              <stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" />
            </radialGradient>
          </defs>
          
          <!-- Градиентный фон -->
          <rect width="${width}" height="${height}" fill="url(#splashGrad)"/>
          
          <!-- Центральное свечение -->
          <ellipse cx="${width/2}" cy="${height/2}" rx="${width/3}" ry="${height/3}" fill="url(#centerGlow)"/>
          
          <!-- Декоративные элементы -->
          <circle cx="${width * 0.2}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.02}" fill="rgba(255,255,255,0.1)"/>
          <circle cx="${width * 0.8}" cy="${height * 0.7}" r="${Math.min(width, height) * 0.015}" fill="rgba(255,255,255,0.08)"/>
          <circle cx="${width * 0.85}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.01}" fill="rgba(255,255,255,0.12)"/>
          
          <!-- Центральная иконка -->
          <g transform="translate(${width/2}, ${height/2 - iconSize/4})">
            <!-- Фон иконки -->
            <circle cx="0" cy="0" r="${iconSize/2 + 10}" fill="rgba(255,255,255,0.15)" />
            <circle cx="0" cy="0" r="${iconSize/2}" fill="white" />
            
            <!-- Робот внутри -->
            <g transform="scale(${iconSize/100})">
              <!-- Голова -->
              <rect x="-12" y="-8" width="24" height="20" rx="6" fill="#4f46e5"/>
              <!-- Глаза -->
              <circle cx="-5" cy="-2" r="2" fill="white"/>
              <circle cx="5" cy="-2" r="2" fill="white"/>
              <!-- Рот -->
              <rect x="-4" y="4" width="8" height="2" rx="1" fill="white"/>
              <!-- Антенна -->
              <circle cx="0" cy="-13" r="1.5" fill="#7c3aed"/>
              <rect x="-0.5" y="-12" width="1" height="4" fill="#4f46e5"/>
            </g>
          </g>
          
          <!-- Текст под иконкой -->
          <text x="${width/2}" y="${height/2 + iconSize/2 + 40}" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="${Math.min(width, height) * 0.04}" font-weight="600" text-anchor="middle" fill="white" opacity="0.9">AI Chat Assistant</text>
        </svg>
      `

            await sharp(Buffer.from(splashSvg))
                .png()
                .toFile(outputPath)

            console.log(`✅ Создан splash: ${name} (${width}x${height})`)
        }

        // Создаем дополнительные иконки для shortcuts
        const shortcutIcons = [
            {
                name: 'shortcut-new-chat.png',
                svg: `
          <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.25)"/>
              </filter>
            </defs>
            <rect width="96" height="96" fill="url(#chatGrad)" rx="20"/>
            
            <!-- Простая иконка: блокнот с плюсом -->
            <g transform="translate(48, 48)" filter="url(#shadow)">
              <!-- Блокнот/документ -->
              <rect x="-12" y="-16" width="24" height="28" rx="3" fill="white"/>
              <!-- Линии текста -->
              <rect x="-8" y="-10" width="16" height="2" rx="1" fill="#e5e7eb"/>
              <rect x="-8" y="-6" width="12" height="2" rx="1" fill="#e5e7eb"/>
              <rect x="-8" y="-2" width="14" height="2" rx="1" fill="#e5e7eb"/>
              
              <!-- Большой плюс сверху -->
              <circle cx="8" cy="-12" r="8" fill="#10b981"/>
              <rect x="4" y="-14" width="8" height="4" rx="2" fill="white"/>
              <rect x="6" y="-16" width="4" height="8" rx="2" fill="white"/>
            </g>
          </svg>
        `
            },
            {
                name: 'shortcut-settings.png',
                svg: `
          <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="settingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
              </linearGradient>
              <filter id="shadowSettings" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(0,0,0,0.25)"/>
              </filter>
            </defs>
            <rect width="96" height="96" fill="url(#settingsGrad)" rx="20"/>
            
            <!-- Простые ползунки настроек -->
            <g transform="translate(48, 48)" filter="url(#shadowSettings)">
              <!-- Первый ползунок -->
              <rect x="-20" y="-12" width="40" height="4" rx="2" fill="white" opacity="0.3"/>
              <rect x="-20" y="-12" width="18" height="4" rx="2" fill="white"/>
              <circle cx="-2" cy="-10" r="6" fill="white"/>
              
              <!-- Второй ползунок -->
              <rect x="-20" y="-2" width="40" height="4" rx="2" fill="white" opacity="0.3"/>
              <rect x="-20" y="-2" width="28" height="4" rx="2" fill="white"/>
              <circle cx="8" cy="0" r="6" fill="white"/>
              
              <!-- Третий ползунок -->
              <rect x="-20" y="8" width="40" height="4" rx="2" fill="white" opacity="0.3"/>
              <rect x="-20" y="8" width="12" height="4" rx="2" fill="white"/>
              <circle cx="-8" cy="10" r="6" fill="white"/>
            </g>
          </svg>
        `
            }
        ]

        console.log('\n🔗 Создание иконок для shortcuts...')

        for (const { name, svg } of shortcutIcons) {
            const outputPath = path.join(iconsDir, name)

            await sharp(Buffer.from(svg))
                .png()
                .toFile(outputPath)

            console.log(`✅ Создана иконка shortcut: ${name}`)
        }

        console.log('\n🎉 Генерация завершена!')
        console.log('📁 Иконки сохранены в:', iconsDir)
        console.log('📁 Splash экраны сохранены в:', splashDir)

        // Показываем инструкции
        console.log('\n📋 Следующие шаги:')
        console.log('1. Проверьте сгенерированные файлы')
        console.log('2. При необходимости отредактируйте manifest.json')
        console.log('3. Протестируйте PWA в Chrome DevTools > Application > Manifest')

    } catch (error) {
        console.error('❌ Ошибка при генерации иконок:', error.message)

        if (error.message.includes('sharp')) {
            console.log('\n💡 Установите sharp для обработки изображений:')
            console.log('npm install sharp --save-dev')
        }
    }
}

// Функция для создания простой иконки из текста (если нет исходного изображения)
async function createDefaultIcon() {
    const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.6" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- Основной фон с градиентом -->
      <rect width="512" height="512" fill="url(#grad1)" rx="96"/>
      
      <!-- Декоративные элементы -->
      <circle cx="128" cy="128" r="24" fill="rgba(255,255,255,0.1)"/>
      <circle cx="384" cy="384" r="32" fill="rgba(255,255,255,0.08)"/>
      <circle cx="400" cy="120" r="16" fill="rgba(255,255,255,0.12)"/>
      
      <!-- Иконка робота/AI -->
      <g transform="translate(256, 200)">
        <!-- Голова робота -->
        <rect x="-48" y="-32" width="96" height="80" rx="24" fill="white" filter="url(#shadow)"/>
        
        <!-- Глаза -->
        <circle cx="-20" cy="-8" r="8" fill="#4f46e5"/>
        <circle cx="20" cy="-8" r="8" fill="#4f46e5"/>
        <circle cx="-20" cy="-8" r="3" fill="white"/>
        <circle cx="20" cy="-8" r="3" fill="white"/>
        
        <!-- Рот -->
        <rect x="-16" y="16" width="32" height="8" rx="4" fill="#4f46e5"/>
        
        <!-- Антенна -->
        <circle cx="0" cy="-52" r="6" fill="#7c3aed"/>
        <rect x="-1" y="-48" width="2" height="16" fill="white"/>
      </g>
      
      <!-- Текст AI -->
      <text x="256" y="360" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white" opacity="0.9">AI Chat</text>
      
      <!-- Блики для объема -->
      <ellipse cx="180" cy="120" rx="40" ry="20" fill="url(#grad2)" opacity="0.3"/>
    </svg>
  `

    try {
        await sharp(Buffer.from(svg))
            .png()
            .toFile(path.resolve(__dirname, '../src/assets/icon-source.png'))

        console.log('✅ Создана стандартная иконка: ./src/assets/icon-source.png')
        return true
    } catch (error) {
        console.error('❌ Ошибка при создании стандартной иконки:', error.message)
        return false
    }
}

// Основная функция
async function main() {
    console.log('🚀 PWA Icon Generator')
    console.log('=====================\n')

    // Проверяем существование исходного файла
    if (!fs.existsSync(sourceImagePath)) {
        console.log('📝 Исходное изображение не найдено. Создаю стандартную иконку...')

        // Создаем папку если её нет
        const assetsDir = path.dirname(sourceImagePath)
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true })
        }

        const created = await createDefaultIcon()
        if (!created) {
            return
        }
    }

    await generateIcons()
}

// Запускаем если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
    main()
}

export { generateIcons, createDefaultIcon }
