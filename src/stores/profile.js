import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRoutinesStore } from '@/stores/routines'

const STORAGE_KEY = 'keguel_profile'

export const useProfileStore = defineStore('profile', () => {
  const name = ref('Usuario')
  // Sexo del usuario: 'male' | 'female' | null (null = identidad aún no creada)
  const sex = ref(null)

  // La identidad está creada cuando hay un sexo válido definido
  const hasIdentity = computed(() => sex.value === 'male' || sex.value === 'female')

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name: name.value,
      sex:  sex.value,
    }))
  }

  function restore() {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const data = JSON.parse(saved)
      name.value = data.name || 'Usuario'
      // Un perfil antiguo (solo nombre) se carga sin sexo → obliga a crear identidad una vez
      sex.value = data.sex === 'male' || data.sex === 'female' ? data.sex : null
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

  // Crea o redefine la identidad (nombre + sexo). Devuelve true si es válida.
  // Si el usuario pasa a 'female' y tenía un programa activo, se desactiva el
  // programa (el path femenino aún no tiene contenido); el historial se conserva.
  function setIdentity(newName, newSex) {
    const trimmed = (newName || '').trim()
    const validSex = newSex === 'male' || newSex === 'female'
    if (trimmed.length === 0 || trimmed.length > 30 || !validSex) return false

    name.value = trimmed
    sex.value  = newSex
    save()

    if (newSex === 'female') {
      const routines = useRoutinesStore()
      if (routines.selectedProgramId) routines.resetProgram()
    }
    return true
  }

  restore()

  return { name, sex, hasIdentity, updateName, setIdentity }
})
