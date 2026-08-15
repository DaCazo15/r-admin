<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { eventoForm } from '@/helpers/list.js'
import { useEdicion } from '@/composable/useEdicion.js'
import { useEventosStore } from '@/stores/useEventosStore'
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'

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
  <BaseModal
    :show="true"
    :title="modoEdicion ? 'Editar Evento' : 'Nuevo Evento'"
    @close="modal"
  >
    <!-- Balance disponible -->
    <div
      class="mb-4 p-3 bg-primary-600/10 border border-primary-600/20 rounded-xl flex items-center gap-3"
    >
      <i class="bi bi-wallet2 text-primary-600 text-lg"></i>
      <p class="text-sm text-primary-900">
        Balance disponible para presupuestar:
        <span class="font-bold">${{ topeDisponible.toFixed(2) }}</span>
      </p>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="guardar" id="eventoForm" class="space-y-4">
      <BaseInput
        id="nombre"
        label="Nombre del Evento"
        v-model="eventoForm.nombre"
        required
      />

      <div class="relative group">
        <textarea
          id="descripcion"
          v-model="eventoForm.descripcion"
          required
          rows="3"
          class="block w-full px-4 pt-5 pb-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all peer resize-none"
          placeholder=" "
        ></textarea>
        <label
          for="descripcion"
          class="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-left left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-primary-600 cursor-text"
        >
          Descripción
        </label>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <BaseInput
          id="fecha"
          type="date"
          label="Fecha"
          v-model="eventoForm.fecha"
          required
        />
        <BaseInput
          id="presupuesto"
          type="number"
          label="Presupuesto ($)"
          step="0.01"
          min="0.01"
          :max="topeDisponible"
          v-model="eventoForm.presupuesto"
          required
        />
      </div>

      <p v-if="error" class="text-sm font-medium text-rose-600 flex items-center gap-1.5 mt-2">
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ error }}
      </p>
    </form>

    <template #footer>
      <BaseButton
        variant="ghost"
        @click="modal"
        :disabled="isSaving"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        type="submit"
        form="eventoForm"
        variant="primary"
        :loading="isSaving"
      >
        {{
          modoEdicion
            ? 'Actualizar'
            : 'Reservar Presupuesto'
        }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
