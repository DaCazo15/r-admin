<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSesionStore } from '@/stores/useSesionStore'
import { storeToRefs } from 'pinia'
import { query, where, collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'

const router = useRouter()
const sesionStore = useSesionStore()
const { usuario } = storeToRefs(sesionStore)

const docId = ref('')
const perfilPrivado = ref(false)
const mostrarLaburo = ref(true)
const mostrarContacto = ref(true)
const isSaving = ref(false)
const errorMsg = ref('')
const exitoMsg = ref('')

const cargarPreferencias = async () => {
  if (!usuario.value?.email) return
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'persona'),
        where('correo', '==', usuario.value.email),
        where('club', '==', sesionStore.club),
      ),
    )
    if (!snapshot.empty) {
      const docData = snapshot.docs[0]
      docId.value = docData.id
      const data = docData.data()
      perfilPrivado.value = data.perfilPrivado !== undefined ? data.perfilPrivado : false
      mostrarLaburo.value = data.mostrarLaburo !== undefined ? data.mostrarLaburo : true
      mostrarContacto.value = data.mostrarContacto !== undefined ? data.mostrarContacto : true
    }
  } catch (error) {
    console.error('Error al cargar preferencias:', error)
    errorMsg.value = 'No se pudieron cargar las preferencias de visibilidad.'
  }
}

onMounted(() => {
  cargarPreferencias()
})

const guardar = async () => {
  if (isSaving.value || !docId.value) return
  isSaving.value = true
  errorMsg.value = ''
  exitoMsg.value = ''
  try {
    const docRef = doc(db, 'persona', docId.value)
    await updateDoc(docRef, {
      perfilPrivado: perfilPrivado.value,
      mostrarLaburo: mostrarLaburo.value,
      mostrarContacto: mostrarContacto.value,
    })
    exitoMsg.value = 'Preferencias de visibilidad actualizadas con éxito.'
    setTimeout(() => {
      exitoMsg.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error al guardar preferencias:', error)
    errorMsg.value = 'Ocurrió un error al guardar los cambios.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto max-w-3xl sm:pt-10 pt-14 pb-12">
    <!-- Encabezado -->
    <div class="mb-6">
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
          <i class="bi bi-eye text-xl text-primary-600"></i>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Visibilidad del perfil</h1>
          <p class="text-xs text-gray-500 mt-0.5">Controla qué información deseas compartir públicamente</p>
        </div>
      </div>
    </div>

    <!-- Contenido -->
    <div class="space-y-5">
      <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-6 space-y-6">
        
        <!-- Toggle 1: Perfil Privado -->
        <div class="flex items-start justify-between gap-4 pb-6 border-b border-gray-100">
          <div class="space-y-1 max-w-[80%]">
            <h3 class="text-sm md:text-base font-bold text-gray-900">Perfil Privado</h3>
            <p class="text-xs md:text-sm text-gray-500 leading-relaxed">
              Oculta tu perfil de las búsquedas y listas generales de miembros. Solo los administradores directos de tu club podrán ver tu ficha de socio.
            </p>
          </div>
          <button
            type="button"
            @click="perfilPrivado = !perfilPrivado"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mt-1"
            :class="perfilPrivado ? 'bg-primary-600' : 'bg-gray-200'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out"
              :class="perfilPrivado ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Toggle 2: Sección de Trabajo -->
        <div class="flex items-start justify-between gap-4 pb-6 border-b border-gray-100">
          <div class="space-y-1 max-w-[80%]">
            <h3 class="text-sm md:text-base font-bold text-gray-900">Mostrar Información Laboral y CV</h3>
            <p class="text-xs md:text-sm text-gray-500 leading-relaxed">
              Permite que otros miembros vean tu cargo, empresa y enlace al Curriculum Vitae (CV) en la sección de Networking y perfil.
            </p>
          </div>
          <button
            type="button"
            @click="mostrarLaburo = !mostrarLaburo"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mt-1"
            :class="mostrarLaburo ? 'bg-primary-600' : 'bg-gray-200'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out"
              :class="mostrarLaburo ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <!-- Toggle 3: Contacto -->
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1 max-w-[80%]">
            <h3 class="text-sm md:text-base font-bold text-gray-900">Mostrar Datos de Contacto</h3>
            <p class="text-xs md:text-sm text-gray-500 leading-relaxed">
              Establece si tu número de teléfono, dirección de correo y enlace directo a chat de WhatsApp estarán visibles al público y en tu Linktree.
            </p>
          </div>
          <button
            type="button"
            @click="mostrarContacto = !mostrarContacto"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mt-1"
            :class="mostrarContacto ? 'bg-primary-600' : 'bg-gray-200'"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out"
              :class="mostrarContacto ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

      </div>

      <!-- Mensajes de Estado -->
      <div v-if="errorMsg" class="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium text-center">
        {{ errorMsg }}
      </div>
      
      <div v-if="exitoMsg" class="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium text-center">
        <i class="bi bi-check-circle-fill mr-1.5"></i>
        {{ exitoMsg }}
      </div>

      <!-- Botón de Acción -->
      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="guardar"
          :disabled="isSaving"
          class="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm uppercase tracking-wider"
        >
          <i v-if="isSaving" class="bi bi-arrow-clockwise animate-spin text-base"></i>
          {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>

    </div>
  </div>
</template>
