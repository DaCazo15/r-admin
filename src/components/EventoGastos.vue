<script setup>
import { computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection, query, orderBy } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useSesionStore } from '@/stores/useSesionStore'
import { storeToRefs } from 'pinia'

const sesionStore = useSesionStore()
const { rol } = storeToRefs(sesionStore)

const props = defineProps({
  evento: { type: Object, required: true },
})

const emit = defineEmits(['eliminarGasto'])

// Este componente solo se monta mientras la tarjeta del evento está
// expandida (ver EventosView.vue), así que la consulta a la subcolección
// solo vive mientras es visible.
const queryGastos = computed(() =>
  query(collection(db, 'eventos', props.evento.id, 'gastos'), orderBy('createdAt', 'desc')),
)
const gastosRaw = useCollection(queryGastos)
const gastos = computed(() => gastosRaw.value || [])

const formatoFecha = (fecha) => {
  if (!fecha) return ''
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}
</script>

<template>
  <div v-if="gastos.length === 0" class="px-5 py-4 text-xs text-gray-400">
    Aún no se han registrado gastos en este evento.
  </div>
  <div v-else class="divide-y divide-gray-100">
    <div
      v-for="gasto in gastos"
      :key="gasto.id"
      class="px-5 py-3 flex items-center justify-between gap-3"
    >
      <div class="min-w-0">
        <p class="text-sm font-medium text-gray-700 truncate">{{ gasto.descripcion }}</p>
        <p class="text-xs text-gray-400">{{ formatoFecha(gasto.fecha) }}</p>
      </div>
      <div class="flex items-center gap-3 shrink-0">
        <span class="text-sm font-bold text-gray-800">${{ Number(gasto.monto).toFixed(2) }}</span>
        <button
          v-if="evento.estatus !== 'finalizado' && !['socio', 'macero'].includes(rol)"
          @click="emit('eliminarGasto', gasto.id)"
          class="cursor-pointer text-gray-400 hover:text-red-600 transition-colors"
          title="Eliminar gasto"
        >
          <i class="bi bi-x-lg text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>
