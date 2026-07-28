<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { persona } from '@/helpers/list.js'
import { guardarPersona } from '@/services/firebaseService.js'
import { useEdicion } from '@/composable/useEdicion.js'
import { useSociosStore } from '@/stores/useSociosStore'
import { useAspirantesStore } from '@/stores/useAspirantesStore'

const emit = defineEmits(['close'])
const isSaving = ref(false)
const cambioEstatus = ref(false)

const props = defineProps({
  estatus: String,
  persona: Object,
})

const { modoEdicion, cancelarEdicion } = useEdicion()
const sociosStore = useSociosStore()
const aspirantesStore = useAspirantesStore()

const resetPersonaForm = () => {
  Object.keys(persona.value).forEach((key) => {
    persona.value[key] = ''
  })
}

const cargarDatosSiEdicion = () => {
  if (props.persona && props.persona.id) {
    persona.value.nombre = props.persona.nombre || ''
    persona.value.edad = props.persona.edad || ''
    persona.value.fecha = props.persona.fecha || ''
    persona.value.telefono = props.persona.telefono || ''
    persona.value.correo = props.persona.correo || ''
    persona.value.ubicacion = props.persona.ubicacion || ''
  } else {
    resetPersonaForm()
  }
}

onMounted(() => {
  cargarDatosSiEdicion()
})

watch(
  () => props.persona,
  () => {
    cargarDatosSiEdicion()
  },
)

const errorMsg = ref('')

const modal = () => {
  emit('close')
  cancelarEdicion()
  resetPersonaForm()
  errorMsg.value = ''
}

const guardar = async () => {
  errorMsg.value = ''
  const id = props.persona?.id
  let datosSocio
  if (cambioEstatus.value) {
    datosSocio = { ...persona.value, estatus: 'Socios' }
  } else {
    datosSocio = { ...persona.value, estatus: props.estatus }
  }

  let res = { ok: true }
  if (modoEdicion.value && id) {
    if (props.estatus === 'Socios') {
      if (cambioEstatus.value) await aspirantesStore.eliminarAspirante(id)
      res = await sociosStore.editarSocio(props.persona.id, datosSocio, isSaving)
    } else if (props.estatus === 'Aspirantes') {
      res = await aspirantesStore.editarAspirante(props.persona.id, datosSocio, isSaving)
    }
  } else {
    res = await guardarPersona(datosSocio, isSaving)
  }

  if (res && !res.ok) {
    errorMsg.value = res.mensaje || 'Error al guardar.'
  } else {
    modal()
  }
}

const estadoEstatus = computed(() => {
  return cambioEstatus.value ? 'Socios' : props.estatus
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="modal"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all"
    >
      <div
        class="bg-primary-600 px-6 py-4 flex justify-between items-center border-b border-gray-100"
      >
        <h3 class="text-lg font-bold text-gray-50">
          {{
            modoEdicion
              ? 'Editar Persona'
              : estatus === 'Socios'
                ? 'Registrar Nuevo Socio'
                : 'Registrar Nuevo Aspirante'
          }}
        </h3>
        <button @click="modal" class="cursor-pointer text-gray-50 text-xl font-bold">
          &times;
        </button>
      </div>

      <form @submit.prevent="guardar" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Persona</label>
          <input
            type="text"
            v-model="persona.nombre"
            required
            placeholder="Nombre"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <div class="flex gap-2 justify-start items-center w-full" v-if="modoEdicion">
          <label for="estatusCambio" class="block text-sm font-medium text-gray-700 mb-1"
            >Combertir en Socio</label
          >
          <input type="checkbox" @change="cambioEstatus = !pagoDistrital" id="estatusCambio" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Edad</label>
            <input
              type="number"
              v-model="persona.edad"
              required
              placeholder="Edad"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              v-model="persona.fecha"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              v-model="persona.telefono"
              required
              placeholder="Teléfono"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input
              type="email"
              v-model="persona.correo"
              required
              placeholder="correo@correo.com"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
          <input
            type="text"
            v-model="persona.ubicacion"
            required
            placeholder="La Asunción"
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
