<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSociosStore } from '@/stores/useSociosStore'
import { useJuntaStore, cargosDefinidos } from '@/stores/useJuntaStore'

const emit = defineEmits(['close'])

const sociosStore = useSociosStore()
const juntaStore = useJuntaStore()

const { socios } = storeToRefs(sociosStore)
const { juntaActual, isSaving } = storeToRefs(juntaStore)

const form = ref({
  presidente: null,
  vicepresidente: null,
  secretario: null,
  tesorero: null,
  macero: null,
  membresia: null,
  imagenPublica: null,
  fundacionRotaria: null,
  servicioClub: null,
  comiteRosa: null,
})

onMounted(() => {
  if (juntaActual.value) {
    cargosDefinidos.forEach((c) => {
      if (juntaActual.value[c.key]) {
        form.value[c.key] = juntaActual.value[c.key]
      }
    })
  }
})

const submitForm = async () => {
  const junta = { ...form.value, confirmada: true }
  await juntaStore.guardarJunta(junta)
  emit('close')
}

const clearForm = async () => {
  Object.keys(form.value).forEach((key) => {
    form.value[key] = ''
  })
  const juntaLimpia = { ...form.value, confirmada: false }
  await juntaStore.guardarJunta(juntaLimpia)
  emit('close')
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-center z-50 p-4 overflow-y-auto"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-8 border border-gray-100"
    >
      <!-- Encabezado -->
      <div class="bg-primary-600 px-6 py-4 flex justify-between items-center text-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <i class="bi bi-award text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg leading-tight">Conformar Junta Directiva</h3>
            <p class="text-xs text-white/80">
              Asigna los socios para la junta directiva y subcomités
            </p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="text-white/80 hover:text-white transition-colors cursor-pointer text-xl"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="submitForm" class="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        <!-- Sección 1: Mesa Directiva -->
        <div>
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <i class="bi bi-star-fill text-primary-600"></i>
            <h4 class="font-bold text-gray-800 uppercase tracking-wider text-xs">
              Junta Directiva
            </h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="cargo in cargosDefinidos.filter((c) => c.categoria === 'mesa')"
              :key="cargo.key"
              class="flex flex-col gap-1.5"
            >
              <label
                :for="cargo.key"
                class="text-xs font-semibold text-gray-700 flex items-center gap-2"
              >
                <i class="bi" :class="cargo.icono"></i>
                {{ cargo.label }}
              </label>
              <select
                :id="cargo.key"
                v-model="form[cargo.key]"
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all cursor-pointer"
              >
                <option :value="null">-- Seleccionar Socio --</option>
                <option
                  v-for="socio in socios"
                  :key="socio.id"
                  :value="{
                    id: socio.id,
                    nombre: socio.nombre,
                    correo: socio.correo,
                    telefono: socio.telefono,
                  }"
                >
                  {{ socio.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Sección 2: Subcomités -->
        <div>
          <div class="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
            <i class="bi bi-diagram-3-fill text-primary-600"></i>
            <h4 class="font-bold text-gray-800 uppercase tracking-wider text-xs">Subcomités</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="cargo in cargosDefinidos.filter((c) => c.categoria === 'subcomite')"
              :key="cargo.key"
              class="flex flex-col gap-1.5"
            >
              <label
                :for="cargo.key"
                class="text-xs font-semibold text-gray-700 flex items-center gap-2"
              >
                <i class="bi" :class="cargo.icono"></i>
                {{ cargo.label }}
              </label>
              <select
                :id="cargo.key"
                v-model="form[cargo.key]"
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all cursor-pointer"
              >
                <option :value="null">-- Seleccionar Socio --</option>
                <option
                  v-for="socio in socios"
                  :key="socio.id"
                  :value="{
                    id: socio.id,
                    nombre: socio.nombre,
                    correo: socio.correo,
                    telefono: socio.telefono,
                  }"
                >
                  {{ socio.nombre }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="emit('close')"
            class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all cursor-pointer text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="clearForm()"
            class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all cursor-pointer text-sm"
          >
            Limpiar
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 text-sm flex items-center gap-2"
          >
            <i v-if="isSaving" class="bi bi-arrow-clockwise animate-spin"></i>
            <span>{{ isSaving ? 'Guardando...' : 'Guardar Junta Directiva' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
