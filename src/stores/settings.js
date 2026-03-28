import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'keguel_settings'

const DEFAULTS = {
  vibration:     true,
  sound:         false,
  darkMode:      'auto',  // 'auto' | 'light' | 'dark'
  notifications: true,
}

export const useSettingsStore = defineStore('settings', () => {
  // Cargar settings persistidos
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') ?? {}

  const vibration     = ref(saved.vibration     ?? DEFAULTS.vibration)
  const sound         = ref(saved.sound         ?? DEFAULTS.sound)
  const darkMode      = ref(saved.darkMode      ?? DEFAULTS.darkMode)
  const notifications = ref(saved.notifications ?? DEFAULTS.notifications)

  // Persistir cada cambio
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      vibration: vibration.value,
      sound: sound.value,
      darkMode: darkMode.value,
      notifications: notifications.value,
    }))
  }

  watch([vibration, sound, darkMode, notifications], persist)

  // ─── Dark mode ────────────────────────────
  // Aplica/quita la clase 'dark' en <html> según el modo
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  function applyDarkMode() {
    const html = document.documentElement
    if (darkMode.value === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
    } else if (darkMode.value === 'light') {
      html.classList.remove('dark')
      html.classList.add('light')
    } else {
      // auto — sigue la preferencia del sistema
      if (mediaQuery.matches) {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.remove('dark')
        html.classList.add('light')
      }
    }
  }

  // Reaccionar a cambios
  watch(darkMode, applyDarkMode, { immediate: true })
  mediaQuery.addEventListener('change', () => {
    if (darkMode.value === 'auto') applyDarkMode()
  })

  function cycleDarkMode() {
    const cycle = { auto: 'light', light: 'dark', dark: 'auto' }
    darkMode.value = cycle[darkMode.value] ?? 'auto'
  }

  const darkModeLabel = {
    auto:  'Automático',
    light: 'Claro',
    dark:  'Oscuro',
  }

  return {
    vibration, sound, darkMode, notifications,
    cycleDarkMode, darkModeLabel, applyDarkMode,
  }
})
