<template>
    <button
        class="theme-switcher"
        @click="toggleTheme"
        :title="isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'"
    >
        <i :class="isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const isDark = ref(false)

const toggleTheme = () => {
    isDark.value = !isDark.value
}

const applyTheme = (dark) => {
    if (dark) {
        document.documentElement.classList.add('dark-theme')
        document.documentElement.setAttribute('data-theme', 'dark')
    } else {
        document.documentElement.classList.remove('dark-theme')
        document.documentElement.setAttribute('data-theme', 'light')
    }
}

const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || savedTheme === 'light') {
        isDark.value = savedTheme === 'dark'
    } else {
        // Use system preference if no saved theme
        isDark.value = getSystemTheme()
    }
    applyTheme(isDark.value)
}

const saveTheme = (dark) => {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
}

// Watch theme changes
watch(isDark, (newValue) => {
    applyTheme(newValue)
    saveTheme(newValue)
})

// Listen for system theme changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', (e) => {
    const savedTheme = localStorage.getItem('theme')
    if (!savedTheme) {
        isDark.value = e.matches
    }
})

onMounted(() => {
    loadTheme()
})
</script>

<style lang="scss" scoped>
.theme-switcher {
    background: none;
    border: none;
    color: $text-tertiary;
    cursor: pointer;
    padding: $space-sm;
    border-radius: $radius-md;
    transition: all $transition-fast;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;

    &:hover {
        background: $bg-code;
        color: $text-primary;
        transform: scale(1.1);
    }

    &:active {
        transform: scale(0.95);
    }

    i {
        transition: transform $transition-fast;
    }

    &:hover i {
        transform: rotate(15deg);
    }
}
</style>
