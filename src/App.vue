<script setup>
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSesionStore } from './stores/useSesionStore'
import NavBar from './components/NavComponent.vue'
import Footer from './components/footer/FooterComponent.vue'

const route = useRoute()
const sesionStore = useSesionStore()
const { usuario, cargando } = storeToRefs(sesionStore)
</script>

<template>
  <div v-if="cargando" class="flex justify-center items-center h-screen text-gray-500 font-medium">
    Cargando...
  </div>
  <template v-else>
    <NavBar v-if="usuario && route.name !== 'auth'" />
    <div class="pb-4 pt-20 py-4">
      <RouterView />
    </div>
    <Footer />
  </template>
</template>
