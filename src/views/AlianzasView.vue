<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import Logo from '../components/ux/Logo.vue'
import ModalAlianza from '../components/form/ModalAlianza.vue'
import { useEdicion } from '../composable/useEdicion.js'
import { useAlianzasStore } from '@/stores/useAlianzasStore'
import { useSesionStore } from '@/stores/useSesionStore'

// Subcomponentes modulares de presentación
import AlianzasHeader from '@/components/alianzas/AlianzasHeader.vue'
import AlianzasSearch from '@/components/alianzas/AlianzasSearch.vue'
import AlianzaCard from '@/components/alianzas/AlianzaCard.vue'

const { iniciarEdicion, cancelarEdicion } = useEdicion()
const alianzasStore = useAlianzasStore()
const { alianzas, totalAlianzas } = storeToRefs(alianzasStore)

const isOpen = ref(false)
const alianzaActual = ref(null)
const buscador = ref('')
const terminoAplicado = ref('')

const sesionStore = useSesionStore()
const { rol } = storeToRefs(sesionStore)

const puedeModificarAlianzas = computed(() => {
  return !['socio', 'macero'].includes(rol.value)
})

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
    <AlianzasHeader :total-alianzas="totalAlianzas" />

    <!-- Buscador + Agregar -->
    <AlianzasSearch
      v-model:buscador="buscador"
      :puede-modificar-alianzas="puedeModificarAlianzas"
      @search="aplicarBusqueda"
      @add="modal(null)"
    />

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
        <AlianzaCard
          v-for="item in alianzasFiltradas"
          :key="item.id"
          :item="item"
          :puede-modificar-alianzas="puedeModificarAlianzas"
          @edit="modal(item)"
          @delete="eliminar(item.id)"
        />
      </div>
    </div>
  </main>
</template>
