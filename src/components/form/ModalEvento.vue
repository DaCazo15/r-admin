<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { eventoForm } from '@/helpers/list.js'
import { useEdicion } from '@/composable/useEdicion.js'
import { useEventosStore } from '@/stores/useEventosStore'

const emit = defineEmits(['close'])
const isSaving = ref(false)
const error = ref('')

const props = defineProps({
  registro: Object,
})

const { modoEdicion, cancelarEdicion } = useEdicion()
const eventosStore = useEventosStore()
const { balanceDisponible } = storeToRefs(eventosStore)

// Al editar, el tope disponible incluye lo que este evento ya tiene reservado
const topeDisponible = computed(() => {
  if (props.registro?.id) {
    return balanceDisponible.value + Number(props.registro.presupuesto || 0)
  }
  return balanceDisponible.value
})

const resetForm = () => {
  eventoForm.value.nombre = ''
  eventoForm.value.descripcion = ''
  eventoForm.value.fecha = new Date().toISOString().split('T')[0]
  eventoForm.value.presupuesto = ''
}

const cargarDatosSiEdicion = () => {
  if (props.registro && props.registro.id) {
    eventoForm.value.nombre = props.registro.nombre || ''
    eventoForm.value.descripcion = props.registro.descripcion || ''
    eventoForm.value.fecha = props.registro.fecha || new Date().toISOString().split('T')[0]
    eventoForm.value.presupuesto = props.registro.presupuesto ?? ''
  } else {
    resetForm()
  }
}

onMounted(() => {
  cargarDatosSiEdicion()
})

watch(
  () => props.registro,
  () => {
    cargarDatosSiEdicion()
  },
)

const modal = () => {
  emit('close')
  cancelarEdicion()
  resetForm()
  error.value = ''
}

const guardar = async () => {
  error.value = ''
  const resultado = await eventosStore.guardarEvento(eventoForm.value, props.registro, isSaving)

  if (!resultado.ok) {
    error.value = resultado.mensaje
    return
  }

  modal()
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/50 backdrop-blur-sm p-4"
    @click.self="modal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
    >
      <!-- Cabecera -->
      <div
        class="bg-primary-600 px-6 py-4 flex justify-between items-center border-b border-gray-100 shrink-0"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <i class="bi bi-calendar-event text-xl text-white"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-50">
            {{ modoEdicion ? 'Editar Evento' : 'Nuevo Evento' }}
          </h3>
        </div>
        <button @click="modal" class="cursor-pointer text-gray-50 text-xl font-bold">
          &times;
        </button>
      </div>

      <!-- Balance disponible -->
      <div
        class="px-6 py-3 bg-primary-50 border-b border-primary-600/30 flex items-center gap-2 shrink-0"
      >
        <i class="bi bi-wallet2 text-primary-600"></i>
        <p class="text-xs text-primary-700 font-medium">
          Balance disponible para presupuestar:
          <span class="font-bold">${{ topeDisponible.toFixed(2) }}</span>
        </p>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardar" class="p-6 space-y-4 overflow-y-auto">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Evento</label>
          <input
            type="text"
            v-model="eventoForm.nombre"
            required
            placeholder="Ej. Jornada de reforestación"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            v-model="eventoForm.descripcion"
            required
            rows="3"
            placeholder="Describe brevemente el evento"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              v-model="eventoForm.fecha"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Presupuesto ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              :max="topeDisponible"
              v-model="eventoForm.presupuesto"
              required
              placeholder="0.00"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        <p v-if="error" class="text-xs font-medium text-red-600 flex items-center gap-1.5">
          <i class="bi bi-exclamation-circle"></i>
          {{ error }}
        </p>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="modal"
            :disabled="isSaving"
            class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="cursor-pointer px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              isSaving
                ? modoEdicion
                  ? 'Actualizando...'
                  : 'Guardando...'
                : modoEdicion
                  ? 'Actualizar'
                  : 'Reservar Presupuesto'
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
