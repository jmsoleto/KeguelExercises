import { defineStore } from 'pinia'
import { ref } from 'vue'

// Detectar si estamos en Capacitor o en el navegador
const isCapacitor = () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()

export const useNotificationsStore = defineStore('notifications', () => {
  const enabled      = ref(false)
  const reminderHour = ref(9)  // 09:00 por defecto
  const reminderMin  = ref(0)
  const permissionDenied = ref(false)

  async function requestPermission() {
    if (!isCapacitor()) {
      console.warn('[Notifications] No es plataforma nativa')
      return false
    }
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const { display } = await LocalNotifications.requestPermissions()
      const granted = display === 'granted'
      permissionDenied.value = !granted
      return granted
    } catch (e) {
      console.error('[Notifications] Error solicitando permisos:', e)
      permissionDenied.value = true
      return false
    }
  }

  async function scheduleDaily(hour = reminderHour.value, min = reminderMin.value) {
    if (!isCapacitor()) {
      // En web, solo guardar la preferencia
      enabled.value      = true
      reminderHour.value = hour
      reminderMin.value  = min
      save()
      return true
    }

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')

      // Cancelar anteriores para evitar duplicados
      await cancelAll()

      await LocalNotifications.schedule({
        notifications: [
          {
            id:       1,
            title:    '💪 Es hora de tu sesión de Kegel',
            body:     '5 minutos al día marcan la diferencia. ¡Vamos!',
            schedule: {
              on: { hour, minute: min },
              repeats: true,
              allowWhileIdle: true,
            },
            sound:    undefined,
            smallIcon: 'ic_stat_icon_config_sample',
          },
        ],
      })

      enabled.value      = true
      reminderHour.value = hour
      reminderMin.value  = min
      save()
      return true
    } catch (e) {
      console.error('[Notifications] Error programando notificación:', e)
      return false
    }
  }

  async function cancelAll() {
    if (!isCapacitor()) {
      enabled.value = false
      save()
      return
    }

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const pending = await LocalNotifications.getPending()
      if (pending.notifications.length) {
        await LocalNotifications.cancel({ notifications: pending.notifications })
      }
    } catch (e) {
      console.error('[Notifications] Error cancelando notificaciones:', e)
    }

    enabled.value = false
    save()
  }

  /**
   * Toggle principal: pide permisos si es la primera vez,
   * programa o cancela según el estado deseado.
   * @returns {boolean} true si la operación fue exitosa
   */
  async function toggle(wantEnabled) {
    if (wantEnabled) {
      const granted = await requestPermission()
      if (!granted && isCapacitor()) {
        return false
      }
      return await scheduleDaily()
    } else {
      await cancelAll()
      return true
    }
  }

  /**
   * Re-programa la notificación si estaba habilitada.
   * Llamar al iniciar la app para restaurar el estado.
   */
  async function restoreAndReschedule() {
    restore()
    if (enabled.value && isCapacitor()) {
      await scheduleDaily(reminderHour.value, reminderMin.value)
    }
  }

  function save() {
    localStorage.setItem('keguel_notif', JSON.stringify({
      enabled: enabled.value,
      hour: reminderHour.value,
      min: reminderMin.value,
    }))
  }

  function restore() {
    const saved = localStorage.getItem('keguel_notif')
    if (!saved) return
    try {
      const { enabled: e, hour, min } = JSON.parse(saved)
      enabled.value      = e ?? false
      reminderHour.value = hour ?? 9
      reminderMin.value  = min ?? 0
    } catch {
      // localStorage corrupto, ignorar
    }
  }

  restore()

  return {
    enabled, reminderHour, reminderMin, permissionDenied,
    requestPermission, scheduleDaily, cancelAll,
    toggle, restoreAndReschedule,
  }
})
