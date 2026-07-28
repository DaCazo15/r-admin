<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import Logo from '../components/ux/Logo.vue'
import ModalAlianza from '../components/form/ModalAlianza.vue'
import { useEdicion } from '../composable/useEdicion.js'
import { useAlianzasStore } from '@/stores/useAlianzasStore'

const { iniciarEdicion, cancelarEdicion } = useEdicion()
const alianzasStore = useAlianzasStore()
const { alianzas, totalAlianzas } = storeToRefs(alianzasStore)

const isOpen = ref(false)
const alianzaActual = ref(null)
const buscador = ref('')
const terminoAplicado = ref('')

const modal = (registro = null) => {
  if (registro && registro.id) {
    iniciarEdicion(registro)
  } else {
    cancelarEdicion()
  }
  alianzaActual.value = registro
  isOpen.value = !isOpen.value
}

const aplicarBusqueda = () => {
  terminoAplicado.value = buscador.value.trim()
}

const alianzasFiltradas = computed(() => {
  const termino = terminoAplicado.value.toLowerCase()
  if (!termino) return alianzas.value
  return alianzas.value.filter((a) => {
    const nombre = a.nombre?.toLowerCase() || ''
    const tipo = a.tipo?.toLowerCase() || ''
    const contacto = a.contacto?.toLowerCase() || ''
    return nombre.includes(termino) || tipo.includes(termino) || contacto.includes(termino)
  })
})

const eliminar = async (id) => {
  await alianzasStore.eliminarAlianza(id)
}
</script>

<template>
  <ModalAlianza v-if="isOpen" @close="modal" :registro="alianzaActual" />

  <main>
    <!-- Logo -->
    <Logo />

    <!-- Encabezado -->
    <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto flex items-center justify-between gap-3 mb-1">
      <div>
        <h2 class="text-lg font-bold text-gray-900">Alianzas Estratégicas</h2>
        <p class="text-xs text-gray-500 mt-0.5">{{ totalAlianzas }} alianza(s) registrada(s)</p>
      </div>
    </div>

    <!-- Buscador + Agregar -->
    <div
      class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-3 flex flex-col sm:flex-row justify-center items-center gap-2"
    >
      <button
        @click="modal"
        class="cursor-pointer px-3 py-2 w-full sm:w-auto shrink-0 gap-2 flex flex-row justify-center items-center text-primary-600 hover:text-white font-medium border-2 border-primary-600 hover:bg-primary-600 rounded-lg ease-in-out duration-300 active:scale-95 transition-all"
      >
        <i class="bi bi-plus-lg"></i>
        Agregar Alianza
      </button>

      <div class="flex justify-center items-center gap-2 w-full">
        <input
          v-model="buscador"
          @keyup.enter="aplicarBusqueda"
          type="text"
          placeholder="Buscar por nombre, tipo o contacto"
          class="w-full px-5 py-2 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
        <button
          @click="aplicarBusqueda"
          class="cursor-pointer px-2.5 py-1.5 text-white font-bold border-primary-600 border-2 bg-primary-600 rounded-lg ease-in-out duration-200 active:scale-90 transition-all"
        >
          <i class="bi bi-search"></i>
        </button>
      </div>
    </div>

    <!-- Listado de Alianzas -->
    <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-5">
      <!-- Estado vacío -->
      <div
        v-if="alianzasFiltradas.length === 0"
        class="bg-white rounded-2xl border border-gray-200 shadow-xs p-10 flex flex-col items-center text-center"
      >
        <div
          class="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-3 border border-primary-100"
        >
          <i class="bi bi-diagram-3 text-2xl text-primary-600"></i>
        </div>
        <p class="text-sm font-semibold text-gray-700">
          {{ terminoAplicado ? 'No se encontraron alianzas' : 'Aún no hay alianzas registradas' }}
        </p>
        <p class="text-xs text-gray-500 mt-1 max-w-xs">
          {{
            terminoAplicado
              ? 'Intenta con otro término de búsqueda.'
              : 'Presiona "Agregar Alianza" para registrar la primera.'
          }}
        </p>
      </div>

      <!-- Grid de tarjetas -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
        <div
          v-for="item in alianzasFiltradas"
          :key="item.id"
          class="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100"
              >
                <i class="bi bi-diagram-3 text-xl text-primary-600"></i>
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-gray-900 truncate">{{ item.nombre }}</h3>
                <span
                  class="inline-block text-[10px] font-semibold uppercase tracking-wide text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full mt-1"
                >
                  {{ item.tipo }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button
                @click="modal(item)"
                class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
                title="Editar"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                @click="eliminar(item.id)"
                class="cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Eliminar"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <p class="text-sm text-gray-600 leading-relaxed line-clamp-3">{{ item.descripcion }}</p>

          <div class="border-t border-gray-100 pt-3 space-y-1.5">
            <p class="text-xs text-gray-500 flex items-center gap-2">
              <i class="bi bi-person text-gray-400"></i>
              {{ item.contacto }}
            </p>
            <p class="text-xs text-gray-500 flex items-center gap-2">
              <i class="bi bi-envelope text-gray-400"></i>
              {{ item.correo }}
            </p>
            <p class="text-xs text-gray-500 flex items-center gap-2">
              <i class="bi bi-telephone text-gray-400"></i>
              {{ item.telefono }}
            </p>
            <a
              v-if="item.sitioWeb"
              :href="item.sitioWeb"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
            >
              <i class="bi bi-globe"></i>
              {{ item.sitioWeb }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
