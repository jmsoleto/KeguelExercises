<template>
  <div class="min-h-dvh bg-background pb-28">
    <header class="flex items-center px-6 py-4 pt-safe sticky top-0 z-40 bg-background bg-glass">
      <h1 class="font-headline font-bold text-xl text-primary">{{ $t('insights.title') }}</h1>
    </header>

    <main class="max-w-2xl mx-auto px-6 pt-2 space-y-8">

      <!-- Resumen global -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
          <p class="text-[10px] font-label uppercase tracking-widest text-outline mb-2">{{ $t('insights.totalSessions') }}</p>
          <p class="text-3xl font-headline font-bold text-primary">{{ history.length }}</p>
        </div>
        <div class="bg-surface-container-low rounded-xl p-4">
          <p class="text-[10px] font-label uppercase tracking-widest text-outline mb-2">{{ $t('insights.thisWeek') }}</p>
          <p class="text-3xl font-headline font-bold text-primary">{{ weekCount }}</p>
        </div>
        <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
          <p class="text-[10px] font-label uppercase tracking-widest text-outline mb-2">{{ $t('insights.currentStreak') }}</p>
          <p class="text-3xl font-headline font-bold text-primary">{{ streak }}<span class="text-base text-outline">d</span></p>
        </div>
      </div>

      <!-- Actividad semanal -->
      <section class="space-y-4">
        <h3 class="font-headline font-bold text-xl text-primary">{{ $t('insights.weekTitle') }}</h3>
        <div class="bg-surface-container-low rounded-xl p-5 flex items-end justify-between h-32 gap-2">
          <div
            v-for="(active, i) in weekActivity"
            :key="i"
            class="flex-1 rounded-t-lg transition-all duration-700"
            :class="active ? 'bg-primary' : 'bg-surface-container-highest'"
            :style="{ height: active ? '80%' : '8%' }"
          />
        </div>
        <div class="flex justify-between text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-widest px-1">
          <span v-for="(d, i) in dayLabels" :key="i" :class="i === todayIndex ? 'text-primary' : ''">{{ d }}</span>
        </div>
      </section>

      <!-- Historial -->
      <section class="space-y-4">
        <h3 class="font-headline font-bold text-xl text-primary">{{ $t('insights.history') }}</h3>

        <div v-if="!history.length" class="text-center py-12 text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl mb-3 block text-outline-variant">history</span>
          <p class="font-body">{{ $t('insights.noSessions') }}</p>
          <p class="text-sm mt-1">{{ $t('insights.noSessionsTip') }}</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="s in history"
            :key="s.id"
            class="bg-surface-container-lowest rounded-xl p-5 flex items-center gap-4 shadow-sm"
          >
            <div class="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-on-tertiary-fixed text-sm" style="font-variation-settings: 'FILL' 1">check</span>
            </div>
            <div class="flex-grow">
              <p class="font-headline font-bold text-on-surface text-sm">{{ s.routine }}</p>
              <p class="text-xs text-on-surface-variant mt-0.5">{{ formatDate(s.date) }}</p>
            </div>
            <div class="text-right">
              <p class="font-headline font-bold text-primary text-sm">{{ s.reps }}/{{ s.totalReps }}</p>
              <p class="text-xs text-outline">{{ Math.ceil(s.duration / 60) }} {{ $t('summary.min') }}</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '@/stores/session'

const { t, locale } = useI18n()
const session     = useSessionStore()
const history     = computed(() => session.history)
const weekActivity = computed(() => session.weekActivity)

const dayKeys = ['days.mon', 'days.tue', 'days.wed', 'days.thu', 'days.fri', 'days.sat', 'days.sun']
const dayLabels = computed(() => dayKeys.map(k => t(k)))

const todayIndex  = computed(() => (new Date().getDay() + 6) % 7)
const weekCount   = computed(() => weekActivity.value.filter(Boolean).length)

const streak = computed(() => {
  let count = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const hasSession = history.value.some(s => {
      const sd = new Date(s.date)
      sd.setHours(0, 0, 0, 0)
      return sd.getTime() === d.getTime()
    })
    if (hasSession) count++
    else if (i > 0) break
  }
  return count
})

function formatDate(iso) {
  const loc = locale.value === 'en' ? 'en-US' : 'es-ES'
  return new Date(iso).toLocaleDateString(loc, {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}
</script>
