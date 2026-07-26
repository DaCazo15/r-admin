<script setup>
import { watch } from 'vue'
import {
  generarPlantilla,
  limpiar,
  enviar,
  socioSeleccionadoId,
} from '../../services/serviceWhatsapp.js'

const = defineEmits(['cerrar'])

const tipoMensaje = ref('aviso')
const montoCobro = ref(0)
const mensaje = ref('')
const error = ref('')

watch(
  mensualidadMargarita,
  (nuevoValor) => {
    montoCobro.value = nuevoValor
  },
  { immediate: true },
)

// Regenera el mensaje cuando cambia el tipo o el socio (para no pisar lo que
// el usuario ya haya escrito a mano en otros casos, se resetea con 'Limpiar').
watch([tipoMensaje, socioSeleccionadoId], () => {
  mensaje.value = generarPlantilla()
  error.value = ''
})

const enviarMensaje = () =>{
  enviar(mensaje.value)
  emit('cerrar')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="cerrar"
  >
    <div
      class="rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all mx-4 flex flex-col max-h-[90vh]"
      style="background-color: #ece5dd"
    >
      <!-- Cabecera estilo WhatsApp -->
      <div class="px-6 py-4 flex justify-between items-center" style="background-color: #075e54">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-lg text-white"
            style="background-color: #25d366"
          >
            <i class="bi bi-whatsapp"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-white leading-tight">Enviar mensaje</h3>
            <p class="text-xs leading-tight" style="color: #b7e6da">vía WhatsApp</p>
          </div>
        </div>
        <button @click="cerrar" class="cursor-pointer text-white text-xl font-bold">&times;</button>
      </div>

      <div class="p-6 space-y-4 overflow-y-auto">
        <!-- Seleccionar socio -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Socio</label>
          <select
            v-model="socioSeleccionadoId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none bg-white"
            style="--tw-ring-color: #25d366"
            required
          >
            <option value="" disabled>Selecciona un socio...</option>
            <option v-for="s in socios" :key="s.id" :value="s.id">
              {{ s.nombre }}{{ s.telefono ? ` — ${s.telefono}` : ' (sin teléfono)' }}
            </option>
          </select>
        </div>

        <!-- Tipo de mensaje -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de mensaje</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="t in tiposMensaje"
              :key="t.value"
              type="button"
              @click="tipoMensaje = t.value"
              class="cursor-pointer flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border-2 text-xs font-semibold transition-all"
              :style="
                tipoMensaje === t.value
                  ? 'background-color:#25d366; border-color:#25d366; color:white;'
                  : 'background-color:white; border-color:#d1d5db; color:#4b5563;'
              "
            >
              <i class="bi text-base" :class="t.icono"></i>
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Monto (solo visible para 'cobro') -->
        <div v-if="tipoMensaje === 'cobro'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Monto a cobrar ($)</label>
          <input
            v-model="montoCobro"
            type="number"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
            @change="mensaje = generarPlantilla(tipoMensaje)"
          />
        </div>

        <!-- Mensaje (editable siempre, tipo "burbuja" de chat) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
          <div class="rounded-lg p-1" style="background-color: #d9d3c7">
            <textarea
              v-model="mensaje"
              rows="7"
              placeholder="Escribe tu mensaje..."
              class="w-full px-3 py-2.5 rounded-lg border-0 focus:outline-none focus:ring-2 resize-none text-sm"
              style="background-color: #dcf8c6; --tw-ring-color: #25d366"
            ></textarea>
          </div>
          <p class="text-xs text-gray-400 mt-1">Puedes editar el texto antes de enviarlo.</p>
        </div>

        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
      </div>

      <!-- Botones -->
      <div class="flex justify-end gap-3 px-6 py-4 bg-white border-t border-gray-200">
        <button
          type="button"
          @click="cerrar"
          class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="limpiar(mensaje, error, tipoMensaje)"
          class="cursor-pointer px-4 py-2 bg-gray-100 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Limpiar
        </button>
        <button
          type="button"
          @click="enviarMensaje"
          class="cursor-pointer px-4 py-2 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
          style="background-color: #25d366"
        >
          <i class="bi bi-send-fill"></i>
          Enviar
        </button>
      </div>
    </div>
  </div>
</template>
