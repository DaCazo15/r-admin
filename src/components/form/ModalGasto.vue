<script setup>
import { ref, computed } from 'vue'
import { gastoForm } from '@/helpers/list.js'
import { useEventosStore } from '@/stores/useEventosStore'

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
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    @click.self="modal"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
      <!-- Cabecera -->
      <div class="bg-primary-600 px-6 py-4 flex justify-between items-center border-b border-gray-100">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <i class="bi bi-receipt text-xl text-white"></i>
          </div>
          <div class="min-w-0">
            <h3 class="text-base font-bold text-gray-50 truncate">Registrar Gasto</h3>
            <p class="text-xs text-white/80 truncate">{{ evento.nombre }}</p>
          </div>
        </div>
        <button @click="modal" class="cursor-pointer text-gray-50 text-xl font-bold shrink-0">
          &times;
        </button>
      </div>

      <!-- Resumen del presupuesto -->
      <div class="px-6 py-3 bg-primary-50 border-b border-primary-100 flex justify-between text-xs font-medium text-primary-700">
        <span>Gastado: ${{ gastado.toFixed(2) }}</span>
        <span>Restante: ${{ restante.toFixed(2) }}</span>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardar" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción del Gasto</label>
          <input
            type="text"
            v-model="gastoForm.descripcion"
            required
            placeholder="Ej. Alquiler de sonido"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              :max="restante"
              v-model="gastoForm.monto"
              required
              placeholder="0.00"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              v-model="gastoForm.fecha"
              required
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
            {{ isSaving ? 'Guardando...' : 'Registrar Gasto' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
