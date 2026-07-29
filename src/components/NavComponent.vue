<script setup>
import { ref } from 'vue'
import { useSesionStore } from '../stores/useSesionStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import DesplegableComponent from './deplegable/DesplegableComponent.vue'

const sesionStore = useSesionStore()
const desplegable = ref(false)
const { usuario } = storeToRefs(sesionStore)
const router = useRouter()

const cerrarSesion = async () => {
  await sesionStore.cerrarSesion()
  router.push({ name: 'auth' })
}

const toggleDesplegable = () => {
  desplegable.value = !desplegable.value
}
</script>

<template>
  <div class="flex flex-col fixed w-full z-40">
    <div
      class="py-2 px-4 flex justify-between items-center bg-white border-b border-gray-200 w-full"
    >
      <img src="../assets/img/logotipo-1.svg" alt="Inicio" class="h-8 w-20 py-0 logo-blanco" />
      <button
        class="cursor-pointer px-2 py-1 rounded border-2 border-primary-600 text-white hover:text-primary-800 hover:bg-primary-600/85 bg-primary-600 ease-in-out duration-300 transition-all"
        @click="cerrarSesion"
      >
        <i class="bi bi-door-closed-fill"></i>
      </button>
    </div>

    <!-- Contenedor limpio sin eventos ni anchos globales que interfieran -->
    <div class="relative flex items-start">
      <DesplegableComponent
        class="absolute top-0 left-0 z-40 shadow-2xl transition-all duration-300 ease-in-out transform origin-left"
        :class="[
          desplegable
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-full opacity-0 pointer-events-none',
        ]"
        @cerrar="toggleDesplegable"
        @cerrarSesion="cerrarSesion"
      />

      <!-- Botón de apertura/cierre flotante estilizado -->
      <button
        @click="toggleDesplegable"
        aria-label="Abrir menú"
        class="cursor-pointer h-12 w-10 flex items-center justify-center mt-3 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white rounded-r-xl shadow-lg border-y border-r border-white/20 relative z-50 transition-all duration-300 ease-in-out active:scale-95 group"
        :class="[desplegable ? 'translate-x-72 shadow-primary-900/30' : 'translate-x-0']"
      >
        <i
          class="bi bi-chevron-right text-lg transition-transform duration-300 group-hover:scale-110"
          :class="{ 'rotate-180': desplegable }"
        ></i>
      </button>
    </div>
  </div>
</template>
