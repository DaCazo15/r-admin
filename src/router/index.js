import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
const HomeView = () => import('@/views/HomeView.vue')
const AuthView = () => import('@/views/AuthView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')
const ErrorView = () => import('@/views/ErrorView.vue')
const AlianzaView = () => import('@/views/AlianzasView.vue')
const EventosView = () => import('@/views/EventosView.vue')
const TerminosCondiciones = () => import('@/views/soporte/TerminosView.vue')
const Politicas = () => import('@/views/soporte/PrivacidadView.vue')
const CentroAyuda = () => import('@/views/soporte/AyudaView.vue')
const Informacion = () => import('@/views/soporte/InformacionView.vue')
const CuentaDatos = () => import('@/views/soporte/CuentaDatosView.vue')
const CalendarView = () => import('@/views/CalendarView.vue')
const PagarView = () => import('@/views/PagarView.vue')
const PerfilUser = () => import('@/views/PerfilView.vue')
const VisibilidadPerfil = () => import('@/views/perfil-settings/VisibilidadPerfilView.vue')
const Networking = () => import('@/views/perfil-settings/NetworkingView.vue')
const ToolsView = () => import('@/views/ToolsView.vue')

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
      path: '/cuenta-datos.4370',
      name: 'cuenta-datos',
      component: CuentaDatos,
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
    {
      path: '/perfil.4370',
      name: 'perfil',
      component: PerfilUser,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/visibilidad.4370',
      name: 'visibilidad',
      component: VisibilidadPerfil,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/networking.4370',
      name: 'networking',
      component: Networking,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/tools.4370',
      name: 'tools',
      component: ToolsView,
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
