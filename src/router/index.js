import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import ErrorView from '../views/ErrorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
      path: '/error',
      name: 'error',
      component: ErrorView,
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
