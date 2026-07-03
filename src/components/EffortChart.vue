<template>
  <div class="space-y-3">

    <!-- Sin datos suficientes -->
    <div
      v-if="!points.length"
      class="bg-surface-container-low rounded-3xl p-6 text-center"
    >
      <span class="material-symbols-outlined text-3xl text-on-surface-variant/40 block mb-2">monitoring</span>
      <p class="text-xs text-on-surface-variant leading-relaxed">{{ t('effortChart.empty') }}</p>
    </div>

    <template v-else>
      <!-- Barras -->
      <div class="bg-surface-container-low rounded-3xl p-6">
        <div class="flex gap-2.5 items-end h-20 w-full">
          <div
            v-for="(p, i) in points"
            :key="i"
            class="flex-1 rounded-t-lg transition-all duration-700"
            :class="barColor(p.effort)"
            :style="{ height: barHeight(p.effort) }"
            :title="`${p.effort}/5`"
          />
        </div>
        <div class="flex gap-2.5 mt-3 text-[10px] font-label font-bold uppercase tracking-widest">
          <span
            v-for="(p, i) in points"
            :key="i"
            class="flex-1 text-center text-on-surface-variant"
          >{{ p.label }}</span>
        </div>
      </div>

      <!-- Mensaje motivacional -->
      <div
        class="flex gap-3 items-start rounded-2xl px-4 py-3"
        :class="coach.tone === 'low'
          ? 'bg-tertiary/5 border-l-4 border-tertiary'
          : 'bg-primary/5 border-l-4 border-primary'"
      >
        <span
          class="material-symbols-outlined text-base"
          :class="coach.tone === 'low' ? 'text-tertiary' : 'text-primary'"
        >{{ coach.icon }}</span>
        <p class="text-xs leading-relaxed text-on-surface-variant">{{ coach.text }}</p>
      </div>
    </template>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSessionStore } from '@/stores/session'

const { t, locale } = useI18n()
const session = useSessionStore()

const MAX_POINTS = 10

// Sesiones con esfuerzo registrado, en orden cronológico (antiguas → recientes).
const points = computed(() => {
  const lang = locale.value === 'es' ? 'es-ES' : 'en-GB'
  const fmt  = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'numeric' })

  return session.history
    .filter(s => typeof s.effort === 'number' && s.effort > 0)
    .slice(0, MAX_POINTS)        // history está ordenado de reciente a antiguo
    .reverse()                   // lo pasamos a cronológico
    .map(s => ({
      effort: s.effort,
      label:  fmt.format(new Date(s.date)),
    }))
})

// Promedio de las últimas 3 sesiones valoradas.
const recentAvg = computed(() => {
  const recent = points.value.slice(-3)
  if (!recent.length) return null
  return recent.reduce((a, p) => a + p.effort, 0) / recent.length
})

const coach = computed(() => {
  const avg = recentAvg.value
  if (avg === null)  return { tone: 'ok', icon: 'monitoring', text: t('effortChart.neutral') }
  if (avg <= 2.5)    return { tone: 'low', icon: 'trending_up', text: t('effortChart.low') }
  if (avg >= 4)      return { tone: 'ok', icon: 'local_fire_department', text: t('effortChart.high') }
  return { tone: 'ok', icon: 'check_circle', text: t('effortChart.good') }
})

function barHeight(effort) {
  // 1 → 20%, 5 → 100%
  return `${20 + (effort - 1) * 20}%`
}

function barColor(effort) {
  if (effort <= 2) return 'bg-tertiary/60'
  if (effort === 3) return 'bg-primary/60'
  return 'bg-primary'
}
</script>
