<script setup>
import { ref, computed } from 'vue'
import { gastoForm } from '@/helpers/list.js'
import { useEventosStore } from '@/stores/useEventosStore'
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'

const emit = defineEmits(['close'])
const isSaving = ref(false)
const error = ref('')

const props = defineProps({
  evento: { type: Object, required: true },
})

const eventosStore = useEventosStore()

const restante = computed(() => eventosStore.restanteDeEvento(props.evento))
const gastado = computed(() => eventosStore.gastosDeEvento(props.evento))

const resetForm = () => {
  gastoForm.value.descripcion = ''
  gastoForm.value.monto = ''
  gastoForm.value.fecha = new Date().toISOString().split('T')[0]
}

const modal = () => {
  emit('close')
  resetForm()
  error.value = ''
}

const guardar = async () => {
  error.value = ''
  const resultado = await eventosStore.registrarGasto(props.evento, gastoForm.value, isSaving)

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
    title="Registrar Gasto"
    @close="modal"
  >
    <div class="mb-4 flex items-center justify-between text-sm bg-gray-50 border border-gray-100 rounded-lg p-3">
      <div class="text-gray-500">
        Evento: <span class="font-semibold text-gray-800">{{ evento.nombre }}</span>
      </div>
    </div>

    <!-- Resumen del presupuesto -->
    <div
      class="mb-4 px-4 py-3 bg-primary-600/10 border border-primary-600/20 rounded-xl flex justify-between text-sm font-medium text-primary-800"
    >
      <span>Gastado: ${{ gastado.toFixed(2) }}</span>
      <span>Restante: ${{ restante.toFixed(2) }}</span>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="guardar" id="gastoForm" class="space-y-4">
      <BaseInput
        id="descripcion"
        label="Descripción del Gasto"
        v-model="gastoForm.descripcion"
        required
      />

      <div class="grid grid-cols-2 gap-4">
        <BaseInput
          id="monto"
          type="number"
          label="Monto ($)"
          step="0.01"
          min="0.01"
          :max="restante"
          v-model="gastoForm.monto"
          required
        />
        <BaseInput
          id="fecha"
          type="date"
          label="Fecha"
          v-model="gastoForm.fecha"
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
        form="gastoForm"
        variant="primary"
        :loading="isSaving"
      >
        Registrar Gasto
      </BaseButton>
    </template>
  </BaseModal>
</template>
