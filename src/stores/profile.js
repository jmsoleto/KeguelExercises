import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'keguel_profile'

export const useProfileStore = defineStore('profile', () => {
  const name = ref('Usuario')

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name: name.value,
    }))
  }

  function restore() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const data = JSON.parse(saved)
      name.value = data.name || 'Usuario'
    } catch {
      // localStorage corrupto
    }
  }

  function updateName(newName) {
    const trimmed = newName.trim()
    if (trimmed.length > 0 && trimmed.length <= 30) {
      name.value = trimmed
      save()
    }
  }

  restore()

  return { name, updateName }
})
