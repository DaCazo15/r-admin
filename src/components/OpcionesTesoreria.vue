<script setup>
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useObtenerTasas } from '@/composable/useObtenerTasas'
import { useClubStore } from '@/stores/useClubStore'
import { generarReporte } from '@/services/reporteService'
import { useRouter } from 'vue-router'

import ModalTesoreria from './form/ModalTesoreria.vue'
import ModalWhatsapp from './form/ModalWhatsapp.vue'
import ModalReporte from './form/ModalReporte.vue'
import ModalResultadoReporte from './form/ModalResultadoReporte.vue'

const { bcv, usdt, eur, cargandoTasas, obtenerTasas } = useObtenerTasas()
const clubStore = useClubStore()
const { mensualidadMargarita } = storeToRefs(clubStore)
const router = useRouter()

const isOpenModal = ref(false)
const isOpenWhatsapp = ref(false)
const isSaving = ref(false)
const mensajeExito = ref(false)
const montoMensualidad = ref(0)
const isOpenReporte = ref(false)
const cargandoReporte = ref(false)
const reporteActual = ref(null)
const errorReporte = ref('')

const props = defineProps({
  metricasOn: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['metricas'])

watch(
  mensualidadMargarita,
  (nuevoValor) => {
    montoMensualidad.value = nuevoValor
  },
  { immediate: true },
)

const manejarReporte = async (filtros) => {
  cargandoReporte.value = true
  errorReporte.value = ''
  try {
    reporteActual.value = await generarReporte(filtros)
  } catch (error) {
    console.error('Error al generar el reporte:', error)
    errorReporte.value = 'No se pudo generar el reporte. Intenta de nuevo.'
  } finally {
    cargandoReporte.value = false
  }
}

onMounted(() => {
  obtenerTasas()
})

const emitirMetricas = () => {
  emit('metricas')
}

const actualizarMensualidad = async () => {
  if (isSaving.value) return
  mensajeExito.value = false
  await clubStore.actualizarMensualidad(montoMensualidad.value, isSaving)
  mensajeExito.value = true
  setTimeout(() => {
    mensajeExito.value = false
  }, 3000)
}
</script>

<template>
  <ModalWhatsapp v-if="isOpenWhatsapp" @cerrar="isOpenWhatsapp = false" />
  <ModalReporte v-if="isOpenReporte" @close="isOpenReporte = false" @generar="manejarReporte" />
  <ModalResultadoReporte
    v-if="reporteActual"
    :reporte="reporteActual"
    @close="reporteActual = null"
  />
  <ModalTesoreria v-if="isOpenModal" @close="isOpenModal = false" />

  <div
    class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4"
  >
    <!-- Indicadores de Tasas -->
    <div class="flex flex-wrap items-center justify-between sm:justify-start gap-2">
      <div
        class="flex items-center font-medium bg-primary-600 text-white py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg shadow-2xs text-xs sm:text-sm flex-1 sm:flex-initial justify-between sm:justify-start"
      >
        <span>USDT</span>
        <span
          class="text-primary-600 font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-md bg-white ml-2 text-xs sm:text-sm"
        >
          {{ cargandoTasas ? '...' : usdt }}
        </span>
      </div>
      <div
        class="flex items-center font-medium bg-primary-600 text-white py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg shadow-2xs text-xs sm:text-sm flex-1 sm:flex-initial justify-between sm:justify-start"
      >
        <span>EUR</span>
        <span
          class="text-primary-600 font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-md bg-white ml-2 text-xs sm:text-sm"
        >
          {{ cargandoTasas ? '...' : eur }}
        </span>
      </div>
      <div
        class="flex items-center font-medium bg-primary-600 text-white py-2.5 px-3 sm:py-3 sm:px-4 rounded-lg shadow-2xs text-xs sm:text-sm flex-1 sm:flex-initial justify-between sm:justify-start"
      >
        <span>BCV</span>
        <span
          class="text-primary-600 font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-md bg-white ml-2 text-xs sm:text-sm"
        >
          {{ cargandoTasas ? '...' : bcv }}
        </span>
      </div>
      <!-- Botón para refrescar tasas manualmente -->
      <button
        @click="obtenerTasas"
        :disabled="cargandoTasas"
        class="cursor-pointer px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg active:scale-95 transition-all border border-gray-200"
        title="Actualizar tasas"
      >
        <i
          class="bi bi-arrow-clockwise text-base sm:text-lg"
          :class="{ 'animate-spin': cargandoTasas }"
        ></i>
      </button>
    </div>

    <!-- Accesos rápidos / Reportes -->
    <div class="flex gap-2">
      <button
        @click="isOpenWhatsapp = true"
        class="cursor-pointer flex-1 sm:flex-initial bg-emerald-600/40 hover:bg-emerald-600 text-emerald-700 hover:text-white border-2 border-emerald-600 py-2 sm:py-2.5 px-3 rounded-lg ease-in-out duration-200 active:scale-95 transition-all text-center flex justify-center items-center"
        title="Enviar mensaje de cobro a WhatsApp"
      >
        <i class="bi bi-whatsapp text-lg sm:text-xl" />
      </button>
      <button
        @click="isOpenReporte = true"
        :disabled="cargandoReporte"
        class="cursor-pointer flex-1 sm:flex-initial bg-blue-600/40 hover:bg-blue-600 text-blue-700 hover:text-white border-2 border-blue-600 py-2 sm:py-2.5 px-3 rounded-lg ease-in-out duration-200 active:scale-95 transition-all text-center flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
        title="Generar reporte general"
      >
        <i
          class="bi text-lg sm:text-xl"
          :class="cargandoReporte ? 'bi-arrow-clockwise animate-spin' : 'bi-file-earmark-bar-graph'"
        />
      </button>
      <button
        @click="emitirMetricas"
        class="cursor-pointer flex-1 sm:flex-initial hover:bg-blue-600 active:bg-blue-600 active:text-white hover:text-white border-2 border-blue-600 py-2 sm:py-2.5 px-3 rounded-lg ease-in-out duration-200 active:scale-95 transition-all text-center flex justify-center items-center"
        :class="{
          'bg-blue-600 text-white': metricasOn,
          'bg-blue-600/40 text-blue-700': !metricasOn,
        }"
        title="Ver estadísticas de tesorería"
      >
        <i class="bi bi-graph-up-arrow text-lg sm:text-xl" />
      </button>
    </div>
  </div>

  <p
    v-if="errorReporte"
    class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-2 text-sm text-rose-600 text-right"
  >
    {{ errorReporte }}
  </p>

  <!-- Sección de Mensualidad y Registro de Monto -->
  <div
    class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
  >
    <!-- Ajustar mensualidad -->
    <div class="flex gap-2 items-center justify-between sm:justify-start">
      <label for="monto" class="font-bold text-primary-600 text-lg whitespace-nowrap"
        >Mensualidad</label
      >
      <div class="flex gap-1.5 items-center">
        <input
          v-model="montoMensualidad"
          id="monto"
          type="number"
          placeholder="0.00"
          class="py-2.5 px-3 w-24 bg-gray-100 border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent rounded-lg transition-all"
        />
        <button
          @click="actualizarMensualidad"
          :disabled="isSaving"
          class="cursor-pointer py-2 px-3 rounded-lg border-2 ease-in-out duration-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          :class="[
            mensajeExito
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white border-primary-600',
          ]"
          title="Guardar mensualidad"
        >
          <i
            class="bi text-lg"
            :class="[
              isSaving
                ? 'bi-arrow-clockwise animate-spin'
                : mensajeExito
                  ? 'bi-check-lg text-white font-bold'
                  : 'bi-floppy-fill',
            ]"
          ></i>
        </button>
      </div>
    </div>

    <!-- Botón grande para ingresar monto -->
    <div class="flex gap-2 items-center justify-between w-full">
      <button
        @click="isOpenModal = true"
        class="cursor-pointer py-3 px-2 text-[13px] sm:px-4 w-full flex flex-row justify-center items-center uppercase text-primary-600 active:text-white hover:text-white font-semibold border-2 border-primary-600 active:bg-primary-600 hover:bg-primary-600 rounded-lg ease-in-out duration-300 active:scale-98 transition-all shadow-sm"
      >
        Ingresar Monto
      </button>
      <router-link
        :to="{ name: 'eventos' }"
        class="cursor-pointer py-3 px-2 text-[13px] sm:px-4 w-full flex flex-row justify-center items-center uppercase text-primary-600 active:text-white hover:text-white font-semibold border-2 border-primary-600 active:bg-primary-600 hover:bg-primary-600 rounded-lg ease-in-out duration-300 active:scale-98 transition-all shadow-sm"
      >
        Eventos
      </router-link>
    </div>
  </div>
</template>
