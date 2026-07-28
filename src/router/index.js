import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import HomeView from '@/views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ErrorView from '@/views/ErrorView.vue'
import AlianzaView from '@/views/AlianzasView.vue'
import EventosView from '@/views/EventosView.vue'
import TerminosCondiciones from '@/views/soporte/TerminosView.vue'
import Politicas from '@/views/soporte/PrivacidadView.vue'
import CentroAyuda from '@/views/soporte/AyudaView.vue'
import Informacion from '@/views/soporte/InformacionView.vue'
import CalendarView from '@/views/CalendarView.vue'
import PagarView from '@/views/PagarView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    {
      path: '/',
      name: 'auth',
      component: AuthView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/alianzas.4370',
      name: 'alianzas',
      component: AlianzaView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/eventos.club.4370',
      name: 'eventos',
      component: EventosView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/setting.4370',
      name: 'settings',
      component: SettingsView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/conditions.4370',
      name: 'conditions',
      component: TerminosCondiciones,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/policies.4370',
      name: 'policies',
      component: Politicas,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/help.4370',
      name: 'help',
      component: CentroAyuda,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/info.4370',
      name: 'info',
      component: Informacion,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/calendar.4370',
      name: 'calendar',
      component: CalendarView,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/pagar.4370',
      name: 'pagar',
      component: PagarView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

// Sin sesión activa -> auth
// Con sesión activa -> home
router.beforeEach(async (to) => {
  const usuario = await getCurrentUser()

  if (to.meta.requiresAuth && !usuario) {
    return { name: 'auth' }
  }

  if (to.name === 'auth' && usuario) {
    return { name: 'home' }
  }
})

export default router
