import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProfileStore } from '../profile'
import { useRoutinesStore } from '../routines'

describe('useProfileStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('identity', () => {
    it('starts without identity', () => {
      const store = useProfileStore()
      expect(store.sex).toBe(null)
      expect(store.hasIdentity).toBe(false)
    })

    it('setIdentity persists name and sex', () => {
      const store = useProfileStore()
      const ok = store.setIdentity('Ana', 'female')

      expect(ok).toBe(true)
      expect(store.name).toBe('Ana')
      expect(store.sex).toBe('female')
      expect(store.hasIdentity).toBe(true)

      const saved = JSON.parse(localStorage.getItem('keguel_profile'))
      expect(saved).toEqual({ name: 'Ana', sex: 'female' })
    })

    it('rejects invalid identity (missing sex or empty name)', () => {
      const store = useProfileStore()
      expect(store.setIdentity('Bob', null)).toBe(false)
      expect(store.setIdentity('', 'male')).toBe(false)
      expect(store.hasIdentity).toBe(false)
    })

    it('loads a legacy profile (name only) without a sex', () => {
      localStorage.setItem('keguel_profile', JSON.stringify({ name: 'Legacy' }))
      const store = useProfileStore()
      expect(store.name).toBe('Legacy')
      expect(store.sex).toBe(null)
      expect(store.hasIdentity).toBe(false)
    })
  })

  describe('switching to female deactivates the active program', () => {
    it('resets the program but keeps history', () => {
      const routines = useRoutinesStore()
      routines.selectProgram('control')
      localStorage.setItem('keguel_history', JSON.stringify([{ id: 1 }]))

      const store = useProfileStore()
      store.setIdentity('Ana', 'female')

      expect(routines.selectedProgramId).toBe(null)
      // El historial se conserva
      expect(localStorage.getItem('keguel_history')).toBe(JSON.stringify([{ id: 1 }]))
    })

    it('keeps the program when switching to male', () => {
      const routines = useRoutinesStore()
      routines.selectProgram('control')

      const store = useProfileStore()
      store.setIdentity('Leo', 'male')

      expect(routines.selectedProgramId).toBe('control')
    })
  })
})
