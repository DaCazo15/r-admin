<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useJuntaStore, cargosDefinidos } from '@/stores/useJuntaStore'
import ModalJunta from './form/ModalJunta.vue'

const juntaStore = useJuntaStore()
const { juntaActual, juntaConfirmada } = storeToRefs(juntaStore)

const showModal = ref(false)

const getCargoInfo = (key) => {
  return cargosDefinidos.find((c) => c.key === key) || {}
}

const getMiembroCargo = (key) => {
  if (!juntaActual.value) return null
  return juntaActual.value[key] || null
}
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto my-6 space-y-8 pb-12">
    <!-- Modal para configurar/editar Junta -->
    <ModalJunta v-if="showModal" @close="showModal = false" />

    <!-- ESTADO VACÍO (Cuando la Junta no ha sido confirmada) -->
    <div
      v-if="!juntaConfirmada"
      class="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center shadow-xs flex flex-col items-center justify-center gap-4"
    >
      <div
        class="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 text-3xl mb-2"
      >
        <i class="bi bi-award-fill"></i>
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-800">Junta Directiva no configurada</h3>
        <p class="text-sm text-gray-500 max-w-md mx-auto mt-1">
          Asigna los socios para la Junta Directiva (Presidente, Vicepresidente, Secretario,
          Tesorero, Macero, Membresía) y los Subcomités.
        </p>
      </div>
      <button
        @click="showModal = true"
        class="mt-2 cursor-pointer px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md ease-in-out duration-300 transition-all flex items-center gap-2 uppercase tracking-wide text-sm"
      >
        <i class="bi bi-plus-circle-fill text-lg"></i>
        <span>Conformar Junta Directiva</span>
      </button>
    </div>

    <!-- ESTADO CONFIRMADO (Organigrama y Tarjetas) -->
    <div v-else class="space-y-8">
      <!-- Barra Superior de Acciones -->
      <div
        class="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl"
          >
            <i class="bi bi-patch-check-fill"></i>
          </div>
          <div>
            <h2 class="font-bold text-gray-800 text-base">Junta Directiva Oficial</h2>
            <p class="text-xs text-gray-500">
              Estructura organizacional activa para el periodo en curso
            </p>
          </div>
        </div>
        <button
          @click="showModal = true"
          class="cursor-pointer px-4 py-2 bg-primary-50 hover:bg-primary-600 text-primary-600 hover:text-white border-2 border-primary-600 font-semibold rounded-lg ease-in-out duration-200 transition-all text-xs flex items-center gap-2"
        >
          <i class="bi bi-pencil-square text-base"></i>
          <span>Editar Junta Directiva</span>
        </button>
      </div>

      <!-- SECCIÓN 1: MESA DIRECTIVA -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-2.5 h-6 bg-primary-600 rounded-full"></div>
          <h3 class="font-bold text-gray-800 uppercase tracking-wider text-sm">Junta Directiva</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="cargo in cargosDefinidos.filter((c) => c.categoria === 'mesa')"
            :key="cargo.key"
            class="bg-white rounded-xl border border-gray-100 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5"
                  :class="cargo.color"
                >
                  <i class="bi" :class="cargo.icono"></i>
                  {{ cargo.label }}
                </span>
                <span class="text-xs text-gray-400 font-medium">Junta Directiva</span>
              </div>

              <!-- Info del Miembro -->
              <div v-if="getMiembroCargo(cargo.key)" class="space-y-1 my-3">
                <h4 class="text-base font-bold text-gray-900">
                  {{ getMiembroCargo(cargo.key).nombre }}
                </h4>
                <p
                  v-if="getMiembroCargo(cargo.key).correo"
                  class="text-xs text-gray-500 flex items-center gap-1.5 truncate"
                >
                  <i class="bi bi-envelope text-gray-400"></i>
                  {{ getMiembroCargo(cargo.key).correo }}
                </p>
                <p
                  v-if="getMiembroCargo(cargo.key).telefono"
                  class="text-xs text-gray-500 flex items-center gap-1.5"
                >
                  <i class="bi bi-telephone text-gray-400"></i>
                  {{ getMiembroCargo(cargo.key).telefono }}
                </p>
              </div>

              <!-- Sin asignar -->
              <div v-else class="py-4 text-center">
                <span class="text-xs text-gray-400 italic">Sin asignar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: SUBCOMITÉS -->
      <div>
        <div class="flex items-center gap-2 mb-4">
          <div class="w-2.5 h-6 bg-teal-600 rounded-full"></div>
          <h3 class="font-bold text-gray-800 uppercase tracking-wider text-sm">Subcomités</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="cargo in cargosDefinidos.filter((c) => c.categoria === 'subcomite')"
            :key="cargo.key"
            class="bg-white rounded-xl border border-gray-100 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1.5"
                  :class="cargo.color"
                >
                  <i class="bi" :class="cargo.icono"></i>
                  {{ cargo.label }}
                </span>
              </div>

              <!-- Info del Miembro -->
              <div v-if="getMiembroCargo(cargo.key)" class="space-y-1 my-3">
                <h4 class="text-sm font-bold text-gray-900">
                  {{ getMiembroCargo(cargo.key).nombre }}
                </h4>
                <p
                  v-if="getMiembroCargo(cargo.key).correo"
                  class="text-xs text-gray-500 flex items-center gap-1.5 truncate"
                >
                  <i class="bi bi-envelope text-gray-400"></i>
                  {{ getMiembroCargo(cargo.key).correo }}
                </p>
              </div>

              <!-- Sin asignar -->
              <div v-else class="py-4 text-center">
                <span class="text-xs text-gray-400 italic">Sin asignar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
