<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import Logo from '../components/ux/Logo.vue'
import ModalEvento from '../components/form/ModalEvento.vue'
import ModalGasto from '../components/form/ModalGasto.vue'
import { useEdicion } from '../composable/useEdicion.js'
import { useEventosStore } from '@/stores/useEventosStore'
import { useSesionStore } from '@/stores/useSesionStore'

// Subcomponentes modulares de presentación
import EventosBalance from '@/components/eventos/EventosBalance.vue'
import EventosTabs from '@/components/eventos/EventosTabs.vue'
import EventosSearch from '@/components/eventos/EventosSearch.vue'
import EventoCard from '@/components/eventos/EventoCard.vue'

const { iniciarEdicion, cancelarEdicion } = useEdicion()
const eventosStore = useEventosStore()
const {
  eventosActivos,
  eventosFinalizados,
  presupuestoReservado,
  balanceDisponible,
} = storeToRefs(eventosStore)

const isOpenEvento = ref(false)
const isOpenGasto = ref(false)

const sesionStore = useSesionStore()
const { rol } = storeToRefs(sesionStore)

const puedeModificarEventos = computed(() => {
  return !['socio', 'macero'].includes(rol.value)
})
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

const eliminarGasto = async (evento, gastoId) => {
  await eventosStore.eliminarGasto(evento, gastoId, isSavingAccion)
}

const finalizar = async (evento) => {
  await eventosStore.finalizarEvento(evento, isSavingAccion)
}

const eliminarEvento = async (id) => {
  await eventosStore.eliminarEvento(id)
}
</script>

<template>
  <ModalEvento v-if="isOpenEvento" @close="modalEvento" :registro="eventoActual" />
  <ModalGasto v-if="isOpenGasto" @close="modalGasto" :evento="eventoActual" />

  <main>
    <!-- Logo -->
    <Logo />

    <!-- Resumen de balance -->
    <EventosBalance
      :balance-disponible="balanceDisponible"
      :presupuesto-reservado="presupuestoReservado"
    />

    <!-- Tabs -->
    <EventosTabs
      v-model:pestania="pestania"
      :total-activos="eventosActivos.length"
      :total-finalizados="eventosFinalizados.length"
    />

    <!-- Buscador + Agregar -->
    <EventosSearch
      v-model:buscador="buscador"
      :pestania="pestania"
      :puede-modificar-eventos="puedeModificarEventos"
      @search="aplicarBusqueda"
      @add="modalEvento(null)"
    />

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
          <i class="bi bi-calendar2-check text-2xl text-primary-600"></i>
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
        <EventoCard
          v-for="evento in eventosFiltrados"
          :key="evento.id"
          :evento="evento"
          :puede-modificar-eventos="puedeModificarEventos"
          :expandido="expandido === evento.id"
          @toggleExpand="toggleExpandido(evento.id)"
          @addGasto="modalGasto(evento)"
          @editEvento="modalEvento(evento)"
          @finalizar="finalizar(evento)"
          @deleteEvento="eliminarEvento(evento.id)"
          @eliminarGasto="(gastoId) => eliminarGasto(evento, gastoId)"
        />
      </div>
    </div>
  </main>
</template>
