<script setup>
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSesionStore } from './stores/useSesionStore'
import { useShortcuts } from './composable/useShortcuts'
import NavBar from './components/NavComponent.vue'
import Footer from './components/footer/FooterComponent.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import ConfirmDialog from './components/ui/ConfirmDialog.vue'

// Inicializar atajos globales
useShortcuts()

const route = useRoute()
const sesionStore = useSesionStore()
const { usuario, cargando } = storeToRefs(sesionStore)
</script>

<template>
  <SpeedInsights />
  <ToastContainer />
  <ConfirmDialog />
  <div v-if="cargando" class="flex justify-center items-center h-screen text-gray-500 font-medium">
    <div class="animate-pulse flex flex-col items-center gap-3">
      <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p class="text-sm">Cargando aplicación...</p>
    </div>
  </div>
  <template v-else>
    <NavBar v-if="usuario && route.name !== 'auth'" />
    <div class="pb-4 pt-20 py-4">
      <RouterView />
    </div>
    <Footer />
  </template>
</template>
