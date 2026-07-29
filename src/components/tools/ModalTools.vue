<script setup>
import { ref, watch } from 'vue'

const colaboradores = ref([])

const agregarColaborador = () => {
  colaboradores.value.push({
    nombre: '',
  })
}

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  errorMsg: {
    type: String,
    default: '',
  },
  defaultDev: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  nombre: '',
  repositorio: '',
  urlWeb: '',
  desarrolladorPrincipal: '',
  esEquipo: false,
  equipoNombres: '',
})

// Resetear y poblar campos por defecto cuando se abre el modal
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      form.value = {
        nombre: '',
        repositorio: '',
        urlWeb: '',
        desarrolladorPrincipal: props.defaultDev,
        esEquipo: false,
        equipoNombres: '',
      }
      colaboradores.value = []
    }
  },
)

// Añadir automáticamente el primer colaborador si marcan equipo y la lista está vacía
watch(
  () => form.value.esEquipo,
  (newVal) => {
    if (newVal && colaboradores.value.length === 0) {
      agregarColaborador()
    }
  },
)

const cerrar = () => {
  if (props.isSaving) return
  emit('close')
}

const enviar = () => {
  const payload = { ...form.value }
  if (form.value.esEquipo) {
    // Filtrar colaboradores vacíos, mapear y unir con comas
    payload.equipoNombres = colaboradores.value
      .map((c) => c.nombre.trim())
      .filter((name) => name !== '')
      .join(', ')
  } else {
    payload.equipoNombres = ''
  }
  emit('submit', payload)
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs px-4"
    @click.self="cerrar"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all"
    >
      <!-- Cabecera del modal -->
      <div class="bg-primary-600 px-6 py-4 flex justify-between items-center text-white">
        <div>
          <h3 class="text-lg font-bold">Publicar Herramienta</h3>
          <p class="text-[10px] text-primary-100">Comparte tu desarrollo con la comunidad</p>
        </div>
        <button
          @click="cerrar"
          class="cursor-pointer text-white text-2xl font-bold hover:text-gray-200"
        >
          &times;
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="enviar" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
        <!-- Campo: Nombre -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider"
            >Nombre de la Herramienta *</label
          >
          <input
            v-model="form.nombre"
            type="text"
            required
            placeholder="Herramienta"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all font-semibold text-gray-800"
          />
        </div>

        <!-- Campo: Desarrollador Principal -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider"
            >Nombre del Desarrollador *</label
          >
          <input
            v-model="form.desarrolladorPrincipal"
            type="text"
            required
            placeholder="Desarrollador"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all font-semibold text-gray-800"
          />
        </div>

        <!-- Equipo Checkbox -->
        <div class="flex items-center gap-2 py-1">
          <input
            id="esEquipo"
            v-model="form.esEquipo"
            type="checkbox"
            class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-primary-500 cursor-pointer"
          />
          <label
            for="esEquipo"
            class="text-xs font-semibold text-gray-600 select-none cursor-pointer"
          >
            ¿Se desarrolló en equipo de trabajo?
          </label>
        </div>

        <!-- Colaboradores Nombres (si es equipo) -->
        <div v-if="form.esEquipo" class="space-y-2">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider"
            >Nombres de los colaboradores</label
          >
          <div v-for="(colaborador, index) in colaboradores" :key="index" class="flex items-center gap-2">
            <input
              v-model="colaborador.nombre"
              type="text"
              placeholder="Desarrollador"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all font-semibold text-gray-800"
            />
            <button
              type="button"
              @click="colaboradores.splice(index, 1)"
              class="text-red-500 hover:text-red-700 p-1.5 cursor-pointer flex items-center justify-center shrink-0 w-9 h-9 rounded-lg hover:bg-red-50 transition-colors border border-transparent"
              title="Eliminar colaborador"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <button
            type="button"
            @click="agregarColaborador"
            class="cursor-pointer inline-flex items-center gap-1 mt-1 px-3 py-1.5 border border-dashed border-primary-300 hover:border-primary-500 text-primary-600 hover:text-primary-700 text-xs font-semibold rounded-lg transition-colors"
          >
            <i class="bi bi-plus-lg"></i>
            Añadir Colaborador
          </button>
        </div>

        <!-- Campo: URL Web -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider"
            >Enlace de la Web (Producción) *</label
          >
          <input
            v-model="form.urlWeb"
            type="url"
            required
            placeholder="https://miherramienta.com"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all font-mono text-gray-700"
          />
        </div>

        <!-- Campo: Repositorio -->
        <div class="space-y-1">
          <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider"
            >Repositorio (GitHub / GitLab)</label
          >
          <input
            v-model="form.repositorio"
            type="url"
            placeholder="https://github.com/usuario/repo"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all font-mono text-gray-700"
          />
        </div>

        <!-- Mensaje de Error en Modal -->
        <div
          v-if="errorMsg"
          class="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium text-center"
        >
          {{ errorMsg }}
        </div>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="cerrar"
            :disabled="isSaving"
            class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="cursor-pointer px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {{ isSaving ? 'Guardando...' : 'Publicar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
