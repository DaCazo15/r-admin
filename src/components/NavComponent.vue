<script setup>
import { useSesionStore } from '../stores/useSesionStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const sesionStore = useSesionStore()
const { usuario } = storeToRefs(sesionStore)
const router = useRouter()

const cerrarSesion = async () => {
  await sesionStore.cerrarSesion()
  router.push({ name: 'auth' })
}
</script>

<template>
  <div class="py-2 px-4 flex justify-between items-center bg-white border-b border-gray-200">
    <img src="../assets/img/logotipo-1.svg" alt="Inicio" class="h-8 w-20 py-0" />
    <button
      class="cursor-pointer px-2 py-1 rounded border-2 border-primary-600 text-white hover:text-primary-800 hover:bg-primary-600/85 bg-primary-600 ease-in-out duration-300 transition-all"
      @click="cerrarSesion"
    >
      <i class="bi bi-door-closed-fill"></i>
    </button>
  </div>
  <button
    class="cursor-pointer w-auto px-4 py-3 mt-3 bg-primary-600 font-bold text-white rounded-br-lg rounded-tr-lg"
  >
    >
  </button>
</template>
