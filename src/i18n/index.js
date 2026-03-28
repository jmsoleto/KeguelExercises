import { createI18n } from 'vue-i18n'
import es from './es.json'
import en from './en.json'

const STORAGE_KEY = 'keguel_locale'
const savedLocale = localStorage.getItem(STORAGE_KEY) || 'es'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'es',
  messages: { es, en },
})

export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

export function getLocale() {
  return i18n.global.locale.value
}

export default i18n
