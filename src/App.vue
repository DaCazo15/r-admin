<script setup>
import { RouterView, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import NavBar from './components/NavComponent.vue'
import { useSesionStore } from './stores/useSesionStore'

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
    <p class="text-xs text-gray-400 font-medium text-center mt-6">
      Rotaract 4370 &middot; R-Admin &middot; Todos los derechos reservados
      <div class="flex gap-3 w-full justify-center mt-3 mb-10">
        <router-link :to="{name:'conditions'}" class="text-gray-400 cursor-pointer text-xs py-1 px-2 hover:text-primary-600 font-medium ">
          Condiciones del servicio
        </router-link>
        <p class="text-gray-400 font-semibold">|</p>
        <router-link :to="{ name: 'policies' }" class="text-gray-400 cursor-pointer text-xs py-1 px-2 hover:text-primary-600 font-medium ">
          Política de privacidad
        </router-link>
        <p class="text-gray-400 font-semibold">|</p>
        <router-link :to="{ name: 'error' }" class="text-gray-400 cursor-pointer text-xs py-1 px-2 hover:text-primary-600 font-medium ">
          Información
        </router-link>
      </div>
    </p>
  </template>
</template>
