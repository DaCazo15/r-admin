<script setup>
import { ref, onMounted, watch } from 'vue'
import { alianza } from '@/helpers/list.js'
import { guardarAlianza } from '@/services/firebaseService.js'
import { useEdicion } from '@/composable/useEdicion.js'
import { useAlianzasStore } from '@/stores/useAlianzasStore'

const emit = defineEmits(['close'])
const isSaving = ref(false)

const props = defineProps({
  registro: Object,
})

const { modoEdicion, cancelarEdicion } = useEdicion()
const alianzasStore = useAlianzasStore()

const tipos = ['Empresa', 'ONG / Fundación', 'Institución educativa', 'Club rotario', 'Otro']

const resetAlianzaForm = () => {
  Object.keys(alianza.value).forEach((key) => {
    alianza.value[key] = ''
  })
}

const cargarDatosSiEdicion = () => {
  if (props.registro && props.registro.id) {
    alianza.value.nombre = props.registro.nombre || ''
    alianza.value.tipo = props.registro.tipo || ''
    alianza.value.descripcion = props.registro.descripcion || ''
    alianza.value.contacto = props.registro.contacto || ''
    alianza.value.correo = props.registro.correo || ''
    alianza.value.telefono = props.registro.telefono || ''
    alianza.value.sitioWeb = props.registro.sitioWeb || ''
  } else {
    resetAlianzaForm()
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

const errorMsg = ref('')

const modal = () => {
  emit('close')
  cancelarEdicion()
  resetAlianzaForm()
  errorMsg.value = ''
}

const guardar = async () => {
  errorMsg.value = ''
  const id = props.registro?.id
  const datosAlianza = { ...alianza.value, club: 'Isla de Margarita' }

  let res = { ok: true }
  if (modoEdicion.value && id) {
    res = await alianzasStore.editarAlianza(id, datosAlianza, isSaving)
  } else {
    res = await guardarAlianza(datosAlianza, isSaving)
  }

  if (res && !res.ok) {
    errorMsg.value = res.mensaje || 'Error al guardar.'
  } else {
    modal()
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    @click.self="modal"
  >
    <!-- Contenedor del Modal -->
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
    >
      <!-- Cabecera del Modal -->
      <div
        class="bg-primary-600 px-6 py-4 flex justify-between items-center border-b border-gray-100 shrink-0"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <i class="bi bi-diagram-3 text-xl text-white"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-50">
            {{ modoEdicion ? 'Editar Alianza' : 'Registrar Nueva Alianza' }}
          </h3>
        </div>
        <button @click="modal" class="cursor-pointer text-gray-50 text-xl font-bold">
          &times;
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardar" class="p-6 space-y-4 overflow-y-auto">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Alianza</label>
          <input
            type="text"
            v-model="alianza.nombre"
            required
            placeholder="Nombre"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Alianza</label>
          <select
            v-model="alianza.tipo"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 cursor-pointer"
          >
            <option value="" disabled>-- Seleccionar Tipo --</option>
            <option v-for="tipo in tipos" :key="tipo" :value="tipo">{{ tipo }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            v-model="alianza.descripcion"
            required
            rows="3"
            placeholder="Descricción..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto</label>
          <input
            type="text"
            v-model="alianza.contacto"
            required
            placeholder="Nombre del contacto"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              v-model="alianza.telefono"
              required
              placeholder="Teléfono"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              v-model="alianza.correo"
              required
              placeholder="correo@correo.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sitio Web (opcional)</label>
          <input
            type="url"
            v-model="alianza.sitioWeb"
            placeholder="URL"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div v-if="errorMsg" class="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
          {{ errorMsg }}
        </div>

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
                  : 'Guardar'
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
