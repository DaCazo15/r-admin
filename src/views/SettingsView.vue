<script setup>
import { ref, computed } from 'vue'
import { useSesionStore } from '../stores/useSesionStore'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { crearCuentaAuthSocioSiNoExiste } from '@/services/firebaseService'

const sesionStore = useSesionStore()
const { usuario, rol, club } = storeToRefs(sesionStore)
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
    ],
  },
  {
    titulo: 'Cuenta y datos',
    opciones: [{ label: 'Cuenta y datos', icon: 'bi-person-vcard' }],
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

const gruposFiltrados = computed(() => {
  const list = [...grupos]
  if (['presidente', 'vicepresidente'].includes(rol.value)) {
    list.push({
      titulo: 'Herramientas administrativas',
      opciones: [
        { label: 'Sincronizar Socios en Auth', icon: 'bi-arrow-repeat' }
      ]
    })
  }
  return list
})

const isSincronizando = ref(false)
const mensajeSincronizacion = ref('')

const sincronizarSocios = async () => {
  if (isSincronizando.value) return
  isSincronizando.value = true
  mensajeSincronizacion.value = 'Sincronizando socios con Firebase Auth...'
  
  try {
    const { db } = await import('@/config/firebase')
    const { collection, getDocs, query, where } = await import('firebase/firestore')
    
    const q = query(collection(db, 'persona'), where('estatus', '==', 'Socios'))
    const snapshot = await getDocs(q)
    let creados = 0
    let omitidos = 0
    
    for (const doc of snapshot.docs) {
      const socio = doc.data()
      if (socio.correo && socio.correo.trim() && socio.correo !== 'correo@correo.com') {
        await crearCuentaAuthSocioSiNoExiste(socio.nombre, socio.correo, socio.club || club.value || 'Isla de Margarita')
        creados++
      } else {
        omitidos++
      }
    }
    
    mensajeSincronizacion.value = `Sincronización completada. Se procesaron ${creados} socios con correo único (los correos duplicados o vacíos fueron omitidos).`
  } catch (error) {
    console.error('Error al sincronizar:', error)
    mensajeSincronizacion.value = 'Ocurrió un error al sincronizar las cuentas.'
  } finally {
    isSincronizando.value = false
  }
}

const clickCheck = (name, check) => {
  if (name === 'Cerrar sesión') {
    cerrarSesion()
  } else {
    if (name === 'Cuenta y datos') router.push({ name: 'cuenta-datos' })
    if (name === 'Centro de ayuda') router.push({ name: 'help' })
    if (name === 'Condiciones del servicio') router.push({ name: 'conditions' })
    if (name === 'Política de privacidad') router.push({ name: 'policies' })
    if (name === 'Información') router.push({ name: 'info' })
    if (name === 'Sincronizar Socios en Auth') sincronizarSocios()
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
      <div v-for="(grupo, i) in gruposFiltrados" :key="grupo.titulo" class="px-2 py-3">
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

        <div v-if="i < gruposFiltrados.length - 1" class="h-px bg-gray-100 mx-3.5 mt-2"></div>
      </div>
    </div>

    <!-- Mensaje de sincronización -->
    <div
      v-if="mensajeSincronizacion"
      class="mt-4 p-4 rounded-xl text-center text-sm font-medium border"
      :class="
        isSincronizando
          ? 'bg-blue-50 border-blue-100 text-blue-700'
          : 'bg-emerald-50 border-emerald-100 text-emerald-700'
      "
    >
      <i v-if="isSincronizando" class="bi bi-arrow-clockwise animate-spin mr-2"></i>
      {{ mensajeSincronizacion }}
    </div>
  </div>
</template>
