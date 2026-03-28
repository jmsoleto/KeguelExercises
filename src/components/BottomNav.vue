<template>
  <nav
    role="tablist"
    aria-label="Navegación principal"
    class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-safe
           bg-[#f4faff]/80 dark:bg-[#111d23]/80 bg-glass-light bg-glass border-t border-outline-variant/15
           rounded-t-xl shadow-[0_-4px_32px_-4px_rgba(17,29,35,0.06)]"
  >
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      role="tab"
      :aria-selected="isActive(tab.to)"
      :aria-label="tab.label"
      class="flex flex-col items-center justify-center px-5 py-1.5 rounded-xl
             transition-all duration-300 ease-out active:scale-90"
      :class="isActive(tab.to)
        ? 'bg-primary text-white'
        : 'text-primary-container hover:text-primary'"
    >
      <span
        class="material-symbols-outlined mb-1"
        aria-hidden="true"
        :style="isActive(tab.to) ? `font-variation-settings: 'FILL' 1` : ''"
      >{{ tab.icon }}</span>
      <span class="font-label text-[11px] font-medium tracking-wide uppercase">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const route = useRoute()
const { t } = useI18n()

const tabs = computed(() => [
  { to: '/training', icon: 'calendar_today', label: t('nav.today')    },
  { to: '/insights', icon: 'insights',       label: t('nav.progress') },
  { to: '/program',  icon: 'layers',         label: t('nav.plans')    },
])

function isActive(path) {
  // summary se considera parte del flujo de training
  if (path === '/training') return route.path === '/training' || route.path === '/summary'
  return route.path === path
}
</script>
