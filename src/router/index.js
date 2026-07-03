import { createRouter, createWebHashHistory } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

// Hash history es necesario para Capacitor (no hay servidor que sirva rutas)
const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior() { return { top: 0 } },
  routes: [
    {
      path: '/',
      redirect: '/training',
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('@/views/WelcomeView.vue'),
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
    },
    {
      path: '/training',
      name: 'training',
      component: () => import('@/views/TrainingView.vue'),
    },
    {
      path: '/free',
      name: 'free',
      component: () => import('@/views/FreeModeView.vue'),
    },
    {
      path: '/summary',
      name: 'summary',
      component: () => import('@/views/SummaryView.vue'),
    },
    {
      path: '/program',
      name: 'program',
      component: () => import('@/views/ProgramView.vue'),
    },
    {
      path: '/program/:id',
      name: 'program-detail',
      component: () => import('@/views/ProgramDetailView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
    },
  ],
})

// Guard de arranque: identidad (sexo) → onboarding → app
router.beforeEach((to) => {
  const profile = useProfileStore()

  // 1) Sin identidad definida → pantalla de creación de usuario
  if (!profile.hasIdentity && to.name !== 'welcome') {
    return { name: 'welcome' }
  }

  // 2) Con identidad pero sin onboarding → carrusel (intacto)
  const onboarded = localStorage.getItem('keguel_onboarded')
  if (profile.hasIdentity && !onboarded && to.name !== 'onboarding' && to.name !== 'welcome') {
    return { name: 'onboarding' }
  }
})

export default router
