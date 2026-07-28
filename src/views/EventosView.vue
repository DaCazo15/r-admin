<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import Logo from '../components/ux/Logo.vue'
import ModalEvento from '../components/form/ModalEvento.vue'
import ModalGasto from '../components/form/ModalGasto.vue'
import EventoGastos from '../components/EventoGastos.vue'
import { useEdicion } from '../composable/useEdicion.js'
import { useEventosStore } from '@/stores/useEventosStore'

const { iniciarEdicion, cancelarEdicion } = useEdicion()
const eventosStore = useEventosStore()
const {
  eventosActivos,
  eventosFinalizados,
  totalEventos,
  presupuestoReservado,
  balanceDisponible,
} = storeToRefs(eventosStore)

const isOpenEvento = ref(false)
const isOpenGasto = ref(false)
const eventoActual = ref(null)
const pestania = ref('activos')
const buscador = ref('')
const terminoAplicado = ref('')
const expandido = ref(null)
const isSavingAccion = ref(false)

const modalEvento = (registro = null) => {
  if (registro && registro.id) {
    iniciarEdicion(registro)
  } else {
    cancelarEdicion()
  }
  eventoActual.value = registro
  isOpenEvento.value = !isOpenEvento.value
}

const modalGasto = (evento = null) => {
  eventoActual.value = evento
  isOpenGasto.value = !isOpenGasto.value
}

const aplicarBusqueda = () => {
  terminoAplicado.value = buscador.value.trim()
}

const listaBase = computed(() =>
  pestania.value === 'activos' ? eventosActivos.value : eventosFinalizados.value,
)

const eventosFiltrados = computed(() => {
  const termino = terminoAplicado.value.toLowerCase()
  if (!termino) return listaBase.value
  return listaBase.value.filter((e) => {
    const nombre = e.nombre?.toLowerCase() || ''
    const descripcion = e.descripcion?.toLowerCase() || ''
    return nombre.includes(termino) || descripcion.includes(termino)
  })
})

const toggleExpandido = (id) => {
  expandido.value = expandido.value === id ? null : id
}

const gastado = (evento) => eventosStore.gastosDeEvento(evento)
const restante = (evento) => eventosStore.restanteDeEvento(evento)
const porcentaje = (evento) => {
  const presupuesto = Number(evento.presupuesto || 0)
  if (presupuesto <= 0) return 0
  return Math.min(100, Math.round((gastado(evento) / presupuesto) * 100))
}

const eliminarGasto = async (evento, gastoId) => {
  await eventosStore.eliminarGasto(evento, gastoId, isSavingAccion)
}

const finalizar = async (evento) => {
  await eventosStore.finalizarEvento(evento, isSavingAccion)
}

const eliminarEvento = async (id) => {
  await eventosStore.eliminarEvento(id)
}

const formatoFecha = (fecha) => {
  if (!fecha) return ''
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}
</script>

<template>
  <ModalEvento v-if="isOpenEvento" @close="modalEvento" :registro="eventoActual" />
  <ModalGasto v-if="isOpenGasto" @close="modalGasto" :evento="eventoActual" />

  <main>
    <!-- Logo -->
    <Logo />

    <!-- Resumen de balance -->
    <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto grid grid-cols-3 gap-2 mb-1">
      <div class="bg-white rounded-xl border border-gray-200 shadow-xs p-3 text-center">
        <p class="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
          Balance del Club
        </p>
        <p class="text-sm sm:text-lg font-bold text-gray-900 mt-0.5">
          ${{ (balanceDisponible + presupuestoReservado).toFixed(2) }}
        </p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 shadow-xs p-3 text-center">
        <p class="text-[10px] uppercase tracking-wide font-semibold text-gray-400">Reservado</p>
        <p class="text-sm sm:text-lg font-bold text-amber-600 mt-0.5">
          ${{ presupuestoReservado.toFixed(2) }}
        </p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 shadow-xs p-3 text-center">
        <p class="text-[10px] uppercase tracking-wide font-semibold text-gray-400">Disponible</p>
        <p class="text-sm sm:text-lg font-bold text-emerald-600 mt-0.5">
          ${{ balanceDisponible.toFixed(2) }}
        </p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto grid grid-cols-2 gap-2 mt-3">
      <button
        @click="pestania = 'activos'"
        :class="{ 'bg-primary-600 text-white': pestania === 'activos' }"
        class="cursor-pointer px-2 py-2 w-full hover:bg-primary-600 ease-in-out duration-300 active:scale-95 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
      >
        Activos ({{ eventosActivos.length }})
      </button>
      <button
        @click="pestania = 'finalizados'"
        :class="{ 'bg-primary-600 text-white': pestania === 'finalizados' }"
        class="cursor-pointer px-2 py-2 w-full hover:bg-primary-600 ease-in-out duration-300 active:scale-95 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
      >
        Finalizados ({{ eventosFinalizados.length }})
      </button>
    </div>

    <!-- Buscador + Agregar -->
    <div
      class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-3 flex flex-col sm:flex-row justify-center items-center gap-2"
    >
      <button
        v-if="pestania === 'activos'"
        @click="modalEvento"
        class="cursor-pointer px-3 py-2 w-full sm:w-auto shrink-0 gap-2 flex flex-row justify-center items-center text-primary-600 hover:text-white font-medium border-2 border-primary-600 hover:bg-primary-600 rounded-lg ease-in-out duration-300 active:scale-95 transition-all"
      >
        <i class="bi bi-plus-lg"></i>
        Nuevo Evento
      </button>

      <div class="flex justify-center items-center gap-2 w-full">
        <input
          v-model="buscador"
          @keyup.enter="aplicarBusqueda"
          type="text"
          placeholder="Buscar evento"
          class="w-full px-5 py-2 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
        <button
          @click="aplicarBusqueda"
          class="cursor-pointer px-2.5 py-1.5 text-white font-bold border-primary-600 border-2 bg-primary-600 rounded-lg ease-in-out duration-200 active:scale-90 transition-all"
        >
          <i class="bi bi-search"></i>
        </button>
      </div>
    </div>

    <!-- Listado -->
    <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-5">
      <!-- Estado vacío -->
      <div
        v-if="eventosFiltrados.length === 0"
        class="bg-white rounded-2xl border border-gray-200 shadow-xs p-10 flex flex-col items-center text-center"
      >
        <div
          class="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-3 border border-primary-100"
        >
          <i class="bi bi bi-calendar2-check text-2xl text-primary-600"></i>
        </div>
        <p class="text-sm font-semibold text-gray-700">
          {{
            terminoAplicado
              ? 'No se encontraron eventos'
              : pestania === 'activos'
                ? 'Aún no hay eventos activos'
                : 'Aún no hay eventos finalizados'
          }}
        </p>
        <p class="text-xs text-gray-500 mt-1 max-w-xs">
          {{
            terminoAplicado
              ? 'Intenta con otro término de búsqueda.'
              : pestania === 'activos'
                ? 'Presiona "Nuevo Evento" para reservar un presupuesto.'
                : 'Los eventos finalizados aparecerán aquí.'
          }}
        </p>
      </div>

      <!-- Cards -->
      <div v-else class="flex flex-col gap-4 pb-6">
        <div
          v-for="evento in eventosFiltrados"
          :key="evento.id"
          class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden"
        >
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
                  <h3 class="font-bold text-gray-900 truncate">{{ evento.nombre }}</h3>
                  <p class="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <i class="bi bi-calendar3"></i>
                    {{ formatoFecha(evento.fecha) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <template v-if="evento.estatus !== 'finalizado'">
                  <button
                    @click="modalGasto(evento)"
                    class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                    title="Agregar gasto"
                  >
                    <i class="bi bi-receipt"></i>
                  </button>
                  <button
                    @click="modalEvento(evento)"
                    class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                    title="Editar presupuesto"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    @click="finalizar(evento)"
                    class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                    title="Finalizar evento"
                  >
                    <i class="bi bi-check2-circle"></i>
                  </button>
                </template>
                <button
                  @click="eliminarEvento(evento.id)"
                  class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Eliminar"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <p class="text-sm text-gray-600 leading-relaxed">{{ evento.descripcion }}</p>

            <!-- Barra de progreso del presupuesto -->
            <div>
              <div class="flex justify-between text-xs font-medium text-gray-500 mb-1">
                <span>Gastado: ${{ gastado(evento).toFixed(2) }}</span>
                <span>Presupuesto: ${{ Number(evento.presupuesto || 0).toFixed(2) }}</span>
              </div>
              <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :class="porcentaje(evento) >= 100 ? 'bg-red-500' : 'bg-primary-600'"
                  :style="{ width: porcentaje(evento) + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Restante:
                <span class="font-semibold text-gray-700">${{ restante(evento).toFixed(2) }}</span>
                <span v-if="evento.estatus === 'finalizado'">
                  &middot; Liberado al finalizar: ${{ restante(evento).toFixed(2) }}
                </span>
              </p>
            </div>

            <!-- Toggle gastos -->
            <button
              @click="toggleExpandido(evento.id)"
              class="cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 self-start"
            >
              <i
                class="bi bi-chevron-down transition-transform duration-200"
                :class="{ 'rotate-180': expandido === evento.id }"
              ></i>
              {{ expandido === evento.id ? 'Ocultar' : 'Ver' }} detalle de gastos
            </button>
          </div>

          <!-- Detalle de gastos (solo se consulta la subcolección mientras está expandido) -->
          <div v-if="expandido === evento.id" class="border-t border-gray-100 bg-gray-50/60">
            <EventoGastos
              :evento="evento"
              @eliminarGasto="(gastoId) => eliminarGasto(evento, gastoId)"
            />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
