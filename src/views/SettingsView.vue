<script setup>
import { useSesionStore } from '../stores/useSesionStore'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const sesionStore = useSesionStore()
const { usuario } = storeToRefs(sesionStore)
const router = useRouter()

// Agrupamos las opciones en datos en vez de repetir el mismo bloque de
// markup 12 veces — más fácil de mantener y de conectar a rutas/acciones
// reales cuando estén listas.
const grupos = [
  {
    titulo: 'Perfil',
    opciones: [
      { label: 'Visibilidad del perfil', icon: 'bi-eye' },
      { label: 'Networking', icon: 'bi-people' },
      { label: 'Tema', icon: 'bi-palette' },
    ],
  },
  {
    titulo: 'Cuenta y datos',
    opciones: [
      { label: 'Cuenta y datos', icon: 'bi-person-vcard' },
      { label: 'Seguridad', icon: 'bi-shield-lock' },
    ],
  },
  {
    titulo: 'Iniciar sesión',
    opciones: [
      { label: 'Agregar cuenta', icon: 'bi-person-plus' },
      { label: 'Cerrar sesión', icon: 'bi-box-arrow-right', destructivo: true },
    ],
  },
  {
    titulo: 'Soporte',
    opciones: [
      { label: 'Centro de ayuda', icon: 'bi-question-circle' },
      { label: 'Condiciones del servicio', icon: 'bi-file-text' },
      { label: 'Política de privacidad', icon: 'bi-file-lock' },
      { label: 'Información', icon: 'bi-info-circle' },
    ],
  },
]

const cerrarSesion = async () => {
  await sesionStore.cerrarSesion()
  router.push({ name: 'auth' })
}

const clickCheck = (name, check) => {
  if (name === 'Cerrar sesión') {
    cerrarSesion()
  } else {
    if (name === 'Condiciones del servicio') router.push({ name: 'conditions' })
    if (name === 'Política de privacidad') router.push({ name: 'policies' })
  }
}
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto max-w-2xl">
    <h4 class="text-lg font-bold text-gray-900 mb-4 w-full text-center">
      Configuraciones de la cuenta
    </h4>

    <!-- Tarjeta contenedora -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      <!-- Perfil -->
      <div class="flex items-center gap-3.5 p-5 border-b border-gray-100">
        <div class="relative">
          <img
            src="../assets/img/img_user/user_img.webp"
            :alt="usuario?.nombre || 'Foto de perfil'"
            class="rounded-full w-14 h-14 object-cover shadow-sm border-2 border-primary-100 p-0.5 ring-2 ring-primary-400/30"
          />
          <span
            class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"
          ></span>
        </div>
        <div class="overflow-hidden">
          <h2 class="font-bold text-base tracking-wide truncate text-gray-900 leading-tight">
            {{ usuario?.nombre || 'Usuario' }}
          </h2>
          <p class="text-xs text-gray-500 truncate font-light mt-0.5">
            {{ usuario?.email || 'correo@domain.com' }}
          </p>
        </div>
      </div>

      <!-- Grupos de opciones -->
      <div v-for="(grupo, i) in grupos" :key="grupo.titulo" class="px-2 py-3">
        <span
          class="text-[10px] font-semibold tracking-wider text-gray-400 uppercase px-3.5 mb-1 block"
        >
          {{ grupo.titulo }}
        </span>

        <button
          v-for="opcion in grupo.opciones"
          @click="clickCheck(opcion.label, opcion.destructivo)"
          :key="opcion.label"
          class="w-full cursor-pointer flex items-center gap-3 px-3.5 py-2.5 rounded-xl active:scale-[0.98] transition-all text-sm font-medium group"
          :class="
            opcion.destructivo
              ? 'text-red-600 hover:bg-red-50'
              : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
          "
        >
          <i
            class="bi text-lg transition-colors"
            :class="[
              opcion.icon,
              opcion.destructivo
                ? 'text-red-400 group-hover:text-red-600'
                : 'text-gray-400 group-hover:text-primary-600',
            ]"
          ></i>
          <span>{{ opcion.label }}</span>
          <i
            v-if="!opcion.destructivo"
            class="bi bi-chevron-right text-xs text-gray-300 ml-auto group-hover:text-primary-400 transition-colors"
          ></i>
        </button>

        <div v-if="i < grupos.length - 1" class="h-px bg-gray-100 mx-3.5 mt-2"></div>
      </div>
    </div>
  </div>
</template>
