<script setup>
import Logo from '../components/ux/Logo.vue'
import Tabla from '../components/ux/Tabla.vue'
import Modal from '../components/form/Modal.vue'
import Filtros from '../components/ux/Filtros.vue'
import OpcionesTesoreria from '@/components/OpcionesTesoreria.vue'
import MetricasComponent from '@/components/MetricasComponent.vue'
import JuntaComponent from '@/components/JuntaComponent.vue'
import { ref, computed } from 'vue'
import { useEncabezado } from '../composable/useEncabezado.js'

const isOpen = ref(false)
const filtro = ref(false)
const metricasOn = ref(false)
const { estatus, encabezados } = useEncabezado()

const modal = () => (isOpen.value = !isOpen.value)
const cambioEstatus = (nuevoEstatus) => (estatus.value = nuevoEstatus)
const aplicarFiltro = () => (filtro.value = !filtro.value)

const addOn = computed(() => {
  return estatus.value && estatus.value !== 'Junta'
})
const filtrosOn = computed(() => {
  return estatus.value === 'Tesoreria' && filtro.value
})
import { useTesoreriaStore } from '@/stores/useTesoreriaStore'

const tesoreriaStore = useTesoreriaStore()
const isUpdating = ref(false)
const mensajeExito = ref(false)

const verMetricas = () => {
  metricasOn.value = !metricasOn.value
}

const actualizarClub = async () => {
  if (isUpdating.value) return
  isUpdating.value = true
  mensajeExito.value = false

  try {
    await tesoreriaStore.syncEstadoClub('Isla de Margarita')
    mensajeExito.value = true
    setTimeout(() => {
      mensajeExito.value = false
    }, 3000)
  } catch (error) {
    console.error(error)
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <Modal v-if="isOpen" @close="modal" :estatus="estatus" />
  <main>
    <!-- Logo -->
    <Logo v-if="estatus !== 'Tesoreria'" />

    <!-- Botones de Navegación -->
    <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2">
      <button
        @click="(cambioEstatus('Socios'), (metricasOn = false))"
        :class="{ 'bg-primary-600 text-white': estatus === 'Socios' }"
        class="cursor-pointer px-2 py-2.5 w-full hover:bg-primary-600 ease-in-out duration-300 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
      >
        Socios
      </button>
      <button
        @click="(cambioEstatus('Aspirantes'), (metricasOn = false))"
        :class="{ 'bg-primary-600 text-white': estatus === 'Aspirantes' }"
        class="cursor-pointer px-2 py-2.5 w-full hover:bg-primary-600 ease-in-out duration-300 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
      >
        Aspirantes
      </button>
      <button
        @click="cambioEstatus('Tesoreria')"
        :class="{ 'bg-primary-600 text-white': estatus === 'Tesoreria' }"
        class="cursor-pointer px-2 py-2.5 w-full hover:bg-primary-600 ease-in-out duration-300 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
      >
        Tesorería
      </button>
      <button
        @click="(cambioEstatus('Junta'), (metricasOn = false))"
        :class="{ 'bg-primary-600 text-white': estatus === 'Junta' }"
        class="cursor-pointer px-2 py-2.5 w-full hover:bg-primary-600 ease-in-out duration-300 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
      >
        Junta Directiva
      </button>
    </div>
    <OpcionesTesoreria v-if="estatus === 'Tesoreria'" @metricas="verMetricas" />

    <!-- Buscador -->
    <div v-if="addOn" class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-3 flex flex-col sm:flex-row justify-center items-center gap-2">
      <button
        @click="modal"
        v-if="addOn && estatus !== 'Tesoreria'"
        class="cursor-pointer px-3 py-2 w-full gap-2 flex flex-row justify-center items-center text-primary-600 hover:text-white font-medium border-2 border-primary-600 hover:bg-primary-600 rounded-lg ease-in-out duration-300 transition-all"
      >
        <i class="bi bi-plus-lg"></i>
        Agregar Persona
      </button>
      <div v-if="!metricasOn" class="flex justify-center items-center gap-2 w-full">
        <input
          type="text"
          placeholder="Buscar"
          class="w-full px-5 py-2 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
        <button
          class="cursor-pointer px-2.5 py-1.5 text-white font-bold border-primary-600 border-2 bg-primary-600 rounded-lg ease-in-out duration-200 transition-all"
        >
          <i class="bi bi-search"></i>
        </button>
        <button
          v-if="estatus === 'Tesoreria'"
          @click="aplicarFiltro"
          :class="{
            'bg-primary-600/80 text-white': filtro,
            'text-white': !filtro,
          }"
          class="cursor-pointer px-2.5 py-1.5 border-primary-600 border-2 font-bold bg-primary-600 rounded-lg ease-in-out duration-200 transition-all"
        >
          <i class="bi bi-funnel-fill"></i>
        </button>
      </div>

      <div v-if="metricasOn" class="flex flex-col items-center gap-2 w-full">
        <button
          @click="actualizarClub"
          :disabled="isUpdating"
          class="cursor-pointer px-3 py-3 w-full flex flex-row justify-center items-center font-medium border-2 rounded-lg ease-in-out duration-300 transition-all shadow-xs"
          :class="[
            mensajeExito
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'text-primary-600 border-primary-600 hover:text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed',
          ]"
        >
          <i
            class="bi"
            :class="[
              isUpdating
                ? 'bi-arrow-clockwise animate-spin text-lg mr-2'
                : mensajeExito
                  ? 'bi-check-circle-fill text-lg mr-2'
                  : 'bi-arrow-clockwise text-lg mr-2',
            ]"
          ></i>
          <span>
            {{
              isUpdating
                ? 'Actualizando estado del club...'
                : mensajeExito
                  ? '¡Estado actualizado correctamente!'
                  : 'Actualizar Estado del Club'
            }}
          </span>
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <Filtros v-if="filtrosOn" />

    <!-- Tabla -->
    <Tabla v-if="addOn && !metricasOn" :encabezados="encabezados" :estatus="estatus" />

    <!-- Metricas -->
    <MetricasComponent v-if="metricasOn && estatus === 'Tesoreria'" />

    <!-- Junta Directiva -->
    <JuntaComponent v-if="estatus === 'Junta'" />
  </main>
</template>
