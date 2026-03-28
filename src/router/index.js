import { createRouter, createWebHashHistory } from 'vue-router'

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
      path: '/summary',
      name: 'summary',
      component: () => import('@/views/SummaryView.vue'),
    },
    {
      path: '/insights',
      name: 'insights',
      component: () => import('@/views/InsightsView.vue'),
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

// Guard: redirigir a onboarding en primer uso
router.beforeEach((to) => {
  const onboarded = localStorage.getItem('keguel_onboarded')
  if (!onboarded && to.name !== 'onboarding') {
    return { name: 'onboarding' }
  }
})

export default router
