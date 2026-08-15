<script setup>
import { computed } from 'vue'
import { useEventosStore } from '@/stores/useEventosStore'
import { useExportPdf } from '@/composable/useExportPdf'
import EventoGastos from '../EventoGastos.vue'

const props = defineProps({
  evento: Object,
  puedeModificarEventos: Boolean,
  expandido: Boolean,
  terminoBusqueda: { type: String, default: '' }
})

const emit = defineEmits(['toggleExpand', 'addGasto', 'editEvento', 'finalizar', 'deleteEvento', 'eliminarGasto'])

const eventosStore = useEventosStore()
const { exportarEventoPdf } = useExportPdf()

const gastado = computed(() => eventosStore.gastosDeEvento(props.evento))
const restante = computed(() => eventosStore.restanteDeEvento(props.evento))
const porcentaje = computed(() => {
  const presupuesto = Number(props.evento.presupuesto || 0)
  if (presupuesto <= 0) return 0
  return Math.min(100, Math.round((gastado.value / presupuesto) * 100))
})

const formatoFecha = (fecha) => {
  if (!fecha) return ''
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

const highlightText = (text) => {
  if (!text) return ''
  if (!props.terminoBusqueda) return text
  
  const searchRegex = new RegExp(`(${props.terminoBusqueda})`, 'gi')
  return text.replace(searchRegex, '<mark class="bg-yellow-200 text-gray-900 rounded px-0.5">$1</mark>')
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
    <div class="p-5 flex flex-col gap-3">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
            :class="
              evento.estatus === 'finalizado'
                ? 'bg-gray-100 border-gray-200'
                : 'bg-primary-50 border-primary-100'
            "
          >
            <i
              class="bi text-xl"
              :class="
                evento.estatus === 'finalizado'
                  ? 'bi-check2-circle text-gray-500'
                  : 'bi-calendar-event text-primary-600'
              "
            ></i>
          </div>
          <div class="min-w-0">
            <h3 class="font-bold text-gray-900 truncate" v-html="highlightText(evento.nombre)"></h3>
            <p class="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <i class="bi bi-calendar3"></i>
              {{ formatoFecha(evento.fecha) }}
            </p>
          </div>
        </div>

        <div v-if="puedeModificarEventos" class="flex items-center gap-1 shrink-0">
          <button
            @click="exportarEventoPdf(evento)"
            class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
            title="Descargar Reporte PDF"
          >
            <i class="bi bi-file-earmark-pdf"></i>
          </button>
          <template v-if="evento.estatus !== 'finalizado'">
            <button
              @click="emit('addGasto')"
              class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
              title="Agregar gasto"
            >
              <i class="bi bi-receipt"></i>
            </button>
            <button
              @click="emit('editEvento')"
              class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
              title="Editar presupuesto"
            >
              <i class="bi bi-pencil"></i>
            </button>
            <button
              @click="emit('finalizar')"
              class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
              title="Finalizar evento"
            >
              <i class="bi bi-check2-circle"></i>
            </button>
          </template>
          <button
            @click="emit('deleteEvento')"
            class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
            title="Eliminar"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <p class="text-sm text-gray-600 leading-relaxed" v-html="highlightText(evento.descripcion)"></p>

      <!-- Barra de progreso del presupuesto -->
      <div>
        <div class="flex justify-between text-xs font-medium text-gray-500 mb-1">
          <span>Gastado: ${{ gastado.toFixed(2) }}</span>
          <span>Presupuesto: ${{ Number(evento.presupuesto || 0).toFixed(2) }}</span>
        </div>
        <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="porcentaje >= 100 ? 'bg-red-500' : 'bg-primary-600'"
            :style="{ width: porcentaje + '%' }"
          ></div>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          Restante:
          <span class="font-semibold text-gray-700">${{ restante.toFixed(2) }}</span>
          <span v-if="evento.estatus === 'finalizado'">
            &middot; Liberado al finalizar: ${{ restante.toFixed(2) }}
          </span>
        </p>
      </div>

      <!-- Toggle gastos -->
      <button
        @click="emit('toggleExpand')"
        class="cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 self-start"
      >
        <i
          class="bi bi-chevron-down transition-transform duration-200"
          :class="{ 'rotate-180': expandido }"
        ></i>
        {{ expandido ? 'Ocultar' : 'Ver' }} detalle de gastos
      </button>
    </div>

    <!-- Detalle de gastos -->
    <div v-if="expandido" class="border-t border-gray-100 bg-gray-50/60">
      <EventoGastos
        :evento="evento"
        @eliminarGasto="(gastoId) => emit('eliminarGasto', gastoId)"
      />
    </div>
  </div>
</template>
