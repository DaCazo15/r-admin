<script setup>
import { ref, computed, watch } from 'vue'
import { meses } from '@/helpers/list'

const emit = defineEmits(['close', 'generar'])

// Ajusta esta lista a los tipos de reporte reales que manejes.
// La dejé alineada a las categorías que ya existen en Tesorería.
const tiposReporte = [
  { value: 'general', label: 'General (todo)' },
  { value: 'ingreso', label: 'Ingresos' },
  { value: 'egreso', label: 'Egresos' },
  { value: 'mensualidad', label: 'Mensualidades' },
  { value: 'socios', label: 'Socios' },
  { value: 'aspirantes', label: 'Aspirantes' },
]

const tipoReporte = ref('general')
const tipoPeriodo = ref('mes') // 'rango' | 'mes' | 'anual'

const anioActual = new Date().getFullYear()
// Rango de años disponible para los selectores (ajustable)
const anios = Array.from({ length: 6 }, (_, i) => anioActual - i)

// ---- Por mes ----
const mesSeleccionado = ref(meses[new Date().getMonth()])
const anioMes = ref(anioActual)

// ---- Por rango ----
const mesDesde = ref(meses[0])
const anioDesde = ref(anioActual)
const mesHasta = ref(meses[new Date().getMonth()])
const anioHasta = ref(anioActual)

// ---- Anual (año rotario: 1 de julio -> 30 de junio) ----
// Se listan como "2025-2026", donde 2025 es el año en que inicia (julio 2025 a junio 2026)
const aniosRotarios = Array.from({ length: 6 }, (_, i) => anioActual - i)
const anioRotarioInicio = ref(
  // Si ya pasamos julio, el año rotario en curso empieza este año; si no, empezó el año pasado
  new Date().getMonth() >= 6 ? anioActual : anioActual - 1,
)

const error = ref('')

const indiceMes = (nombreMes) => meses.indexOf(nombreMes) // 0 = Enero ... 11 = Diciembre

// Calcula el rango de fechas (inicio/fin, ambos inclusive) según el modo elegido
const rangoFechas = computed(() => {
  if (tipoPeriodo.value === 'mes') {
    const mIdx = indiceMes(mesSeleccionado.value)
    const inicio = new Date(anioMes.value, mIdx, 1)
    const fin = new Date(anioMes.value, mIdx + 1, 0) // último día de ese mes
    return { inicio, fin }
  }

  if (tipoPeriodo.value === 'rango') {
    const mIdxDesde = indiceMes(mesDesde.value)
    const mIdxHasta = indiceMes(mesHasta.value)
    const inicio = new Date(anioDesde.value, mIdxDesde, 1)
    const fin = new Date(anioHasta.value, mIdxHasta + 1, 0)
    return { inicio, fin }
  }

  // Anual rotario: 1 de julio del año seleccionado -> 30 de junio del año siguiente
  const inicio = new Date(anioRotarioInicio.value, 6, 1) // julio = índice 6
  const fin = new Date(anioRotarioInicio.value + 1, 5, 30) // junio = índice 5
  return { inicio, fin }
})

const formatoFecha = (date) => date.toISOString().split('T')[0]

const rangoInvalido = computed(() => {
  if (tipoPeriodo.value !== 'rango') return false
  return rangoFechas.value.inicio > rangoFechas.value.fin
})

watch([tipoPeriodo, mesDesde, anioDesde, mesHasta, anioHasta], () => {
  error.value = rangoInvalido.value
    ? 'El periodo "desde" no puede ser posterior al periodo "hasta".'
    : ''
})

const etiquetaPeriodo = computed(() => {
  const { inicio, fin } = rangoFechas.value
  const opciones = { month: 'long', year: 'numeric' }
  if (tipoPeriodo.value === 'mes') {
    return inicio.toLocaleDateString('es-ES', opciones)
  }
  if (tipoPeriodo.value === 'anual') {
    return `Año rotario ${anioRotarioInicio.value}-${anioRotarioInicio.value + 1} (jul. ${anioRotarioInicio.value} - jun. ${anioRotarioInicio.value + 1})`
  }
  return `${inicio.toLocaleDateString('es-ES', opciones)} — ${fin.toLocaleDateString('es-ES', opciones)}`
})

const cerrar = () => emit('close')

const generarReporte = () => {
  if (rangoInvalido.value) {
    error.value = 'El periodo "desde" no puede ser posterior al periodo "hasta".'
    return
  }

  emit('generar', {
    tipoReporte: tipoReporte.value,
    tipoPeriodo: tipoPeriodo.value,
    fechaInicio: formatoFecha(rangoFechas.value.inicio),
    fechaFin: formatoFecha(rangoFechas.value.fin),
    etiquetaPeriodo: etiquetaPeriodo.value,
  })

  cerrar()
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="cerrar"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all mx-4"
    >
      <!-- Cabecera -->
      <div
        class="bg-primary-600 px-6 py-4 flex justify-between items-center border-b border-gray-100"
      >
        <h3 class="text-lg font-bold text-gray-50">Generar Reporte</h3>
        <button @click="cerrar" class="cursor-pointer text-gray-50 text-xl font-bold">
          &times;
        </button>
      </div>

      <form @submit.prevent="generarReporte" class="p-6 space-y-5">
        <!-- Tipo de reporte -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de reporte</label>
          <select
            v-model="tipoReporte"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
          >
            <option v-for="t in tiposReporte" :key="t.value" :value="t.value">
              {{ t.label }}
            </option>
          </select>
        </div>

        <!-- Selector de periodo (tabs) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
          <div class="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              @click="tipoPeriodo = 'mes'"
              :class="
                tipoPeriodo === 'mes'
                  ? 'bg-primary-600 text-white font-bold'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              "
              class="flex-1 py-2 text-sm transition-colors cursor-pointer"
            >
              Por Mes
            </button>
            <button
              type="button"
              @click="tipoPeriodo = 'rango'"
              :class="
                tipoPeriodo === 'rango'
                  ? 'bg-primary-600 text-white font-bold'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              "
              class="flex-1 py-2 text-sm transition-colors cursor-pointer border-x border-gray-200"
            >
              Por Rango
            </button>
            <button
              type="button"
              @click="tipoPeriodo = 'anual'"
              :class="
                tipoPeriodo === 'anual'
                  ? 'bg-primary-600 text-white font-bold'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              "
              class="flex-1 py-2 text-sm transition-colors cursor-pointer"
            >
              Anual (Rotario)
            </button>
          </div>
        </div>

        <!-- Por mes -->
        <div v-if="tipoPeriodo === 'mes'" class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              v-model="mesSeleccionado"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white capitalize"
            >
              <option v-for="m in meses" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <select
              v-model="anioMes"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
            >
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
        </div>

        <!-- Por rango -->
        <div v-else-if="tipoPeriodo === 'rango'" class="space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Desde (mes)</label>
              <select
                v-model="mesDesde"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white capitalize"
              >
                <option v-for="m in meses" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Desde (año)</label>
              <select
                v-model="anioDesde"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
              >
                <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hasta (mes)</label>
              <select
                v-model="mesHasta"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white capitalize"
              >
                <option v-for="m in meses" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hasta (año)</label>
              <select
                v-model="anioHasta"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
              >
                <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Anual (rotario) -->
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 mb-1">Año rotario</label>
          <select
            v-model="anioRotarioInicio"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
          >
            <option v-for="a in aniosRotarios" :key="a" :value="a">{{ a }} - {{ a + 1 }}</option>
          </select>
          <p class="text-xs text-gray-50 mt-1">
            Va del 1 de julio de {{ anioRotarioInicio }} al 30 de junio de
            {{ anioRotarioInicio + 1 }}.
          </p>
        </div>

        <!-- Resumen del periodo calculado -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
            Periodo seleccionado
          </p>
          <p class="text-sm text-gray-700 capitalize">{{ etiquetaPeriodo }}</p>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <!-- Botones -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="cerrar"
            class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="!!error"
            class="cursor-pointer px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generar Reporte
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
