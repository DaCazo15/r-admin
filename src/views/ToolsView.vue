<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCollection } from 'vuefire'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { CLUB_POR_DEFECTO } from '@/config/constants'
import { useSesionStore } from '@/stores/useSesionStore'
import { storeToRefs } from 'pinia'

// Componentes segmentados
import ToolCard from '@/components/tools/ToolCard.vue'
import ModalTools from '@/components/tools/ModalTools.vue'

const router = useRouter()
const sesionStore = useSesionStore()
const { usuario } = storeToRefs(sesionStore)

// Cargar herramientas desde Firestore
const herramientas = useCollection(collection(db, 'herramientas'))

// Estados del Modal
const isOpenModal = ref(false)
const isSaving = ref(false)
const errorMsg = ref('')

const abrirModal = () => {
  errorMsg.value = ''
  isOpenModal.value = true
}

const cerrarModal = () => {
  isOpenModal.value = false
}

const registrarHerramienta = async (formData) => {
  if (
    !formData.nombre.trim() ||
    !formData.urlWeb.trim() ||
    !formData.desarrolladorPrincipal.trim()
  ) {
    errorMsg.value = 'Por favor, completa los campos requeridos.'
    return
  }

  isSaving.value = true
  errorMsg.value = ''

  try {
    const nuevaHerramienta = {
      nombre: formData.nombre.trim(),
      repositorio: formData.repositorio.trim(),
      urlWeb: formData.urlWeb.trim(),
      desarrolladorPrincipal: formData.desarrolladorPrincipal.trim(),
      esEquipo: formData.esEquipo,
      equipoNombres: formData.esEquipo ? formData.equipoNombres.trim() : '',
      club: sesionStore.club || CLUB_POR_DEFECTO,
      creadorUid: usuario.value?.uid || '',
      createdAt: serverTimestamp(),
    }

    await addDoc(collection(db, 'herramientas'), nuevaHerramienta)
    cerrarModal()
  } catch (error) {
    console.error('Error al registrar herramienta:', error)
    errorMsg.value = 'No se pudo guardar la herramienta en la base de datos.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto max-w-4xl sm:pt-10 pt-14 pb-12">
    <!-- Encabezado de la página -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <button
          type="button"
          @click="router.back()"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors cursor-pointer mb-4"
        >
          <i class="bi bi-arrow-left text-xl sm:text-lg"></i>
          Volver
        </button>

        <div class="flex items-center gap-3">
          <div
            class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100"
          >
            <i class="bi bi-tools text-xl text-primary-600"></i>
          </div>
          <div>
            <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              Herramientas del Club
            </h1>
            <p class="text-xs text-gray-500 mt-0.5">
              Explora y publica utilidades web desarrolladas por socios
            </p>
          </div>
        </div>
      </div>

      <!-- Botón para registrar nueva herramienta -->
      <button
        @click="abrirModal"
        class="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all duration-200 active:scale-95 shadow-md self-start sm:self-center"
      >
        <i class="bi bi-plus-lg"></i>
        Subir Herramienta
      </button>
    </div>

    <!-- Grid de Herramientas publicadas -->
    <div
      v-if="herramientas && herramientas.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
    >
      <ToolCard v-for="tool in herramientas" :key="tool.id" :tool="tool" />
    </div>

    <!-- Vista de Lista Vacía -->
    <div
      v-else
      class="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-xs mt-8"
    >
      <i class="bi bi-tools text-5xl text-gray-300 block mb-3"></i>
      <h3 class="text-base font-bold text-gray-700">No hay herramientas registradas</h3>
      <p class="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
        ¿Eres programador y has creado una herramienta útil para el club? ¡Súbela para que otros
        miembros puedan usarla!
      </p>
      <button
        @click="abrirModal"
        class="cursor-pointer mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs transition-colors"
      >
        <i class="bi bi-plus-lg"></i> Publicar Herramienta
      </button>
    </div>

    <!-- MODAL DE REGISTRO (Componente Segmentado) -->
    <ModalTools
      :is-open="isOpenModal"
      :is-saving="isSaving"
      :error-msg="errorMsg"
      :default-dev="usuario?.displayName || ''"
      @close="cerrarModal"
      @submit="registrarHerramienta"
    />
  </div>
</template>
