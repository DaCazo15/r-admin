<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSesionStore } from '../../stores/useSesionStore'
import {
  descargarDatosUsuarioZip,
  limpiarCache,
  eliminarCuenta,
} from '../../services/cuentaService.js'

const router = useRouter()
const sesionStore = useSesionStore()
const { usuario } = storeToRefs(sesionStore)

// --- Solicitar tus datos (ZIP que contiene PDF + CSV) ---
const generandoZip = ref(false)
const errorZip = ref('')

const solicitarDatos = async () => {
  generandoZip.value = true
  errorZip.value = ''
  const resultado = await descargarDatosUsuarioZip(usuario.value)
  if (!resultado.ok) errorZip.value = resultado.mensaje
  generandoZip.value = false
}

// --- Borrar la caché ---
const limpiandoCache = ref(false)
const mensajeCache = ref('')
const errorCache = ref('')

const borrarCacheClick = async () => {
  limpiandoCache.value = true
  mensajeCache.value = ''
  errorCache.value = ''
  const resultado = await limpiarCache()
  if (resultado.ok) {
    mensajeCache.value = 'Caché eliminada correctamente.'
  } else {
    errorCache.value = resultado.mensaje
  }
  limpiandoCache.value = false
}

// --- Eliminar cuenta (con confirmación por texto, es una acción irreversible) ---
const mostrarConfirmacion = ref(false)
const textoConfirmacion = ref('')
const eliminando = ref(false)
const errorEliminar = ref('')

const PALABRA_CONFIRMACION = 'ELIMINAR'

const abrirConfirmacion = () => {
  textoConfirmacion.value = ''
  errorEliminar.value = ''
  mostrarConfirmacion.value = true
}

const cerrarConfirmacion = () => {
  if (eliminando.value) return
  mostrarConfirmacion.value = false
}

const confirmarEliminacion = async () => {
  if (textoConfirmacion.value !== PALABRA_CONFIRMACION) return

  eliminando.value = true
  errorEliminar.value = ''
  const resultado = await eliminarCuenta()
  eliminando.value = false

  if (resultado.ok) {
    router.push({ name: 'auth' })
  } else {
    errorEliminar.value = resultado.mensaje
  }
}
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto max-w-3xl sm:pt-10 pt-14">
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
          <i class="bi bi-person-vcard text-xl text-primary-600"></i>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Cuenta y datos</h1>
          <p class="text-xs text-gray-500 mt-0.5">Gestioná la información asociada a tu cuenta</p>
        </div>
      </div>
    </div>

    <div class="space-y-5">
      <!-- Solicitar tus datos -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div class="p-5 md:p-6 flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100"
          >
            <i class="bi bi-file-earmark-zip text-lg text-primary-600"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-sm md:text-base font-bold text-gray-900">Solicitar tus datos</h2>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">
              Descargá un archivo ZIP con toda la información asociada a tu cuenta: incluye un PDF formal y un archivo CSV con los datos crudos (nombre, correo, fecha de creación y último acceso).
            </p>
            <p v-if="errorZip" class="text-sm text-rose-600 mt-2">{{ errorZip }}</p>
            <button
              type="button"
              @click="solicitarDatos"
              :disabled="generandoZip"
              class="mt-3 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i
                class="bi"
                :class="generandoZip ? 'bi-arrow-clockwise animate-spin' : 'bi-download'"
              ></i>
              {{ generandoZip ? 'Generando...' : 'Descargar ZIP' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Borrar la memoria caché -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div class="p-5 md:p-6 flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100"
          >
            <i class="bi bi-arrow-repeat text-lg text-primary-600"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-sm md:text-base font-bold text-gray-900">Borrar la memoria caché</h2>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">
              Elimina los datos temporales guardados de tu cuenta en este dispositivo. Tu sesión
              iniciada no se ve afectada.
            </p>
            <p v-if="mensajeCache" class="text-sm text-emerald-600 mt-2 flex items-center gap-1.5">
              <i class="bi bi-check-circle"></i>{{ mensajeCache }}
            </p>
            <p v-if="errorCache" class="text-sm text-rose-600 mt-2">{{ errorCache }}</p>
            <button
              type="button"
              @click="borrarCacheClick"
              :disabled="limpiandoCache"
              class="mt-3 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i
                class="bi"
                :class="limpiandoCache ? 'bi-arrow-clockwise animate-spin' : 'bi-trash3'"
              ></i>
              {{ limpiandoCache ? 'Borrando...' : 'Borrar caché' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Eliminar cuenta (zona de peligro) -->
      <div class="bg-white rounded-2xl border border-rose-200 shadow-xs overflow-hidden">
        <div class="p-5 md:p-6 flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100"
          >
            <i class="bi bi-trash3 text-lg text-rose-600"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="text-sm md:text-base font-bold text-rose-700">
              Eliminar tus datos y tu cuenta
            </h2>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">
              Esta acción es <strong>permanente</strong> y no se puede deshacer. Se eliminará tu
              acceso al Panel y todos los datos asociados a tu cuenta.
            </p>
            <button
              type="button"
              @click="abrirConfirmacion"
              class="mt-3 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-bold rounded-lg hover:bg-rose-700 transition-colors"
            >
              <i class="bi bi-exclamation-triangle"></i>
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div
      v-if="mostrarConfirmacion"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      @click.self="cerrarConfirmacion"
    >
      <div
        class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all"
      >
        <div class="bg-rose-600 px-6 py-4 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-50">Eliminar cuenta</h3>
          <button
            @click="cerrarConfirmacion"
            :disabled="eliminando"
            class="cursor-pointer text-gray-50 text-xl font-bold disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        <div class="p-6 space-y-4">
          <p class="text-sm text-gray-600 leading-relaxed">
            Esta acción eliminará tu cuenta de forma <strong>permanente</strong>. No se puede
            deshacer. Para confirmar, escribí <strong>{{ PALABRA_CONFIRMACION }}</strong> abajo.
          </p>

          <input
            v-model="textoConfirmacion"
            type="text"
            :placeholder="PALABRA_CONFIRMACION"
            :disabled="eliminando"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
          />

          <p v-if="errorEliminar" class="text-sm text-rose-600">{{ errorEliminar }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="cerrarConfirmacion"
              :disabled="eliminando"
              class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="confirmarEliminacion"
              :disabled="textoConfirmacion !== PALABRA_CONFIRMACION || eliminando"
              class="cursor-pointer px-4 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i
                class="bi"
                :class="eliminando ? 'bi-arrow-clockwise animate-spin' : 'bi-trash3'"
              ></i>
              {{ eliminando ? 'Eliminando...' : 'Sí, eliminar mi cuenta' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
