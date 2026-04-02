<template>
  <div class="bg-background text-on-background font-body min-h-dvh">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
    <!-- BottomNav oculta en resumen y perfil (flujo transaccional / header nav) -->
    <BottomNav v-if="showNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
const showNav = computed(() => !['training', 'summary', 'profile', 'onboarding', 'program-detail'].includes(route.name))
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
