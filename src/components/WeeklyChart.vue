<template>
  <div class="space-y-3">

    <!-- Navegación de semana -->
    <div class="flex items-center justify-between px-1">
      <button
        @click="weekOffset--"
        class="w-8 h-8 flex items-center justify-center rounded-full
               text-on-surface-variant hover:bg-surface-container-high
               active:scale-90 transition-all"
        aria-label="Semana anterior"
      >
        <span class="material-symbols-outlined text-lg">chevron_left</span>
      </button>

      <span class="text-xs font-label font-semibold text-on-surface-variant tracking-wide">
        {{ weekLabel }}
      </span>

      <button
        @click="weekOffset++"
        :disabled="weekOffset >= 0"
        class="w-8 h-8 flex items-center justify-center rounded-full transition-all"
        :class="weekOffset >= 0
          ? 'text-outline-variant/30 pointer-events-none'
          : 'text-on-surface-variant hover:bg-surface-container-high active:scale-90'"
        aria-label="Semana siguiente"
      >
        <span class="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>

    <!-- Barras -->
    <div class="bg-surface-container-low rounded-3xl p-6">
      <div class="flex gap-2.5 items-end h-16 w-full">
        <div
          v-for="(day, i) in weekDays"
          :key="i"
          class="flex-1 rounded-t-lg transition-all duration-700"
          :class="day.count > 0 ? 'bg-primary' : 'bg-outline-variant/20'"
          :style="{ height: barHeight(day.count) }"
        />
      </div>
      <div class="flex gap-2.5 mt-3 text-[10px] font-label font-bold uppercase tracking-widest">
        <span
          v-for="(day, i) in weekDays"
          :key="i"
          class="flex-1 text-center"
          :class="day.isToday ? 'text-primary' : 'text-on-surface-variant'"
        >{{ day.label }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '@/stores/session'

const { t, locale } = useI18n()
const session = useSessionStore()

const weekOffset = ref(0) // 0 = semana actual, -1 = semana anterior…

const displayedMonday = computed(() => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset.value * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
})

const DAY_KEYS = ['days.mon', 'days.tue', 'days.wed', 'days.thu', 'days.fri', 'days.sat', 'days.sun']

// Fecha en formato YYYY-MM-DD según la zona horaria local (evita el
// desfase de un día que provoca toISOString() al convertir a UTC).
function toLocalDateStr(d) {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const weekDays = computed(() => {
  const monday = displayedMonday.value
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    const dateStr = toLocalDateStr(date)
    const count = session.history.filter(s => toLocalDateStr(new Date(s.date)) === dateStr).length
    return {
      label:   t(DAY_KEYS[i]),
      count,
      isToday: date.getTime() === today.getTime(),
    }
  })
})

const weekLabel = computed(() => {
  const monday = displayedMonday.value
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const lang    = locale.value === 'es' ? 'es-ES' : 'en-GB'
  const startFmt = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' })
  const endFmt   = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric' })
  return `${startFmt.format(monday)} – ${endFmt.format(sunday)}`
})

function barHeight(count) {
  if (count === 0) return '12%'
  if (count === 1) return '60%'
  if (count === 2) return '82%'
  return '100%'
}
</script>
