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
const nombreSocio = ref('Nombre Socio')
const clubSocio = ref('Isla de Margarita')
const estiloSeleccionado = ref('classic') // 'classic' | 'glass' | 'neon'
const isSaving = ref(false)
const errorMsg = ref('')
const exitoMsg = ref('')

const cargarEstilo = async () => {
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
      estiloSeleccionado.value = data.linktreeStyle || 'classic'
      nombreSocio.value = data.nombre || usuario.value.displayName || 'Miembro'
      clubSocio.value = data.club || sesionStore.club || 'Isla de Margarita'
    }
  } catch (error) {
    console.error('Error al cargar estilo:', error)
    errorMsg.value = 'No se pudo cargar tu estilo actual.'
  }
}

onMounted(() => {
  cargarEstilo()
})

const guardar = async () => {
  if (isSaving.value || !docId.value) return
  isSaving.value = true
  errorMsg.value = ''
  exitoMsg.value = ''
  try {
    const docRef = doc(db, 'persona', docId.value)
    await updateDoc(docRef, {
      linktreeStyle: estiloSeleccionado.value,
    })
    exitoMsg.value = 'Estilo de Linktree actualizado con éxito.'
    setTimeout(() => {
      exitoMsg.value = ''
    }, 3000)
  } catch (error) {
    console.error('Error al guardar estilo:', error)
    errorMsg.value = 'Ocurrió un error al guardar los cambios.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto max-w-4xl sm:pt-10 pt-14 pb-12">
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
          <i class="bi bi-people text-xl text-primary-600"></i>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            Estilo de Linktree (Networking)
          </h1>
          <p class="text-xs text-gray-500 mt-0.5">
            Elige el tema visual para compartir tus enlaces profesionales
          </p>
        </div>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Columna Izquierda: Tarjetas de Selección -->
      <div class="lg:col-span-7 space-y-6">
        <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-4">
          <h3 class="text-base font-bold text-gray-900 mb-2">Selecciona un estilo</h3>

          <!-- Card Option 1: Classic -->
          <div
            @click="estiloSeleccionado = 'classic'"
            class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary-300"
            :class="
              estiloSeleccionado === 'classic'
                ? 'border-primary-600 bg-primary-50/20'
                : 'border-gray-200 bg-white'
            "
          >
            <div
              class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200"
            >
              <i class="bi bi-layout-text-window-reverse text-lg text-gray-600"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-gray-900">Clásico Rotaract</h4>
              <p class="text-xs text-gray-500">
                Limpio, con fondo suave y botones corporativos en rosa.
              </p>
            </div>
            <div class="shrink-0 flex items-center justify-center">
              <i
                class="bi text-xl"
                :class="
                  estiloSeleccionado === 'classic'
                    ? 'bi-record-circle-fill text-primary-600'
                    : 'bi-circle text-gray-300'
                "
              ></i>
            </div>
          </div>

          <!-- Card Option 2: Glassmorphism -->
          <div
            @click="estiloSeleccionado = 'glass'"
            class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary-300"
            :class="
              estiloSeleccionado === 'glass'
                ? 'border-primary-600 bg-primary-50/20'
                : 'border-gray-200 bg-white'
            "
          >
            <div
              class="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-500 to-primary-500 flex items-center justify-center shrink-0 border border-transparent shadow-xs"
            >
              <i class="bi bi-palette text-lg text-white"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-gray-900">Modern Glassmorphism</h4>
              <p class="text-xs text-gray-500">
                Degradado vibrante y botones translúcidos tipo vidrio.
              </p>
            </div>
            <div class="shrink-0 flex items-center justify-center">
              <i
                class="bi text-xl"
                :class="
                  estiloSeleccionado === 'glass'
                    ? 'bi-record-circle-fill text-primary-600'
                    : 'bi-circle text-gray-300'
                "
              ></i>
            </div>
          </div>

          <!-- Card Option 3: Cyber Neon -->
          <div
            @click="estiloSeleccionado = 'neon'"
            class="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary-300"
            :class="
              estiloSeleccionado === 'neon'
                ? 'border-primary-600 bg-primary-50/20'
                : 'border-gray-200 bg-white'
            "
          >
            <div
              class="w-10 h-10 rounded-lg bg-gray-950 flex items-center justify-center shrink-0 border border-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
            >
              <i class="bi bi-terminal text-lg text-emerald-400"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-bold text-gray-900">Cyber Dark Neon</h4>
              <p class="text-xs text-gray-500">
                Fondo oscuro, tipografía de código y resplandor verde neón.
              </p>
            </div>
            <div class="shrink-0 flex items-center justify-center">
              <i
                class="bi text-xl"
                :class="
                  estiloSeleccionado === 'neon'
                    ? 'bi-record-circle-fill text-primary-600'
                    : 'bi-circle text-gray-300'
                "
              ></i>
            </div>
          </div>
        </div>

        <!-- Mensajes de Estado -->
        <div
          v-if="errorMsg"
          class="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium text-center"
        >
          {{ errorMsg }}
        </div>

        <div
          v-if="exitoMsg"
          class="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium text-center"
        >
          <i class="bi bi-check-circle-fill mr-1.5"></i>
          {{ exitoMsg }}
        </div>

        <!-- Botón Guardar -->
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="guardar"
            :disabled="isSaving"
            class="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm uppercase tracking-wider w-full sm:w-auto justify-center"
          >
            <i v-if="isSaving" class="bi bi-arrow-clockwise animate-spin text-base"></i>
            {{ isSaving ? 'Guardando...' : 'Aplicar Estilo' }}
          </button>
        </div>
      </div>

      <!-- Columna Derecha: Vista Previa de Smartphone Mockup -->
      <div class="lg:col-span-5 flex flex-col items-center">
        <span class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2"
          >Vista Previa Interactiva</span
        >

        <!-- Mockup Celular -->
        <div
          class="relative w-70 h-135 rounded-[36px] border-8 border-gray-900 bg-gray-900 shadow-2xl overflow-hidden ring-4 ring-gray-700/50 flex flex-col justify-between p-3 select-none"
        >
          <!-- Altavoz y cámara frontal mockups -->
          <div
            class="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-gray-900 rounded-full z-20 flex items-center justify-center"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-gray-800"></span>
          </div>

          <!-- Pantalla Interna -->
          <div
            class="w-full h-full rounded-3xl overflow-hidden flex flex-col items-center pt-8 px-3.5 pb-4 transition-all duration-500"
            :class="{
              'bg-linear-to-b from-gray-50 to-gray-100/50 text-gray-800':
                estiloSeleccionado === 'classic',
              'bg-linear-to-br from-primary-700 via-primary-600 to-indigo-800 text-white':
                estiloSeleccionado === 'glass',
              'bg-gray-950 text-emerald-300': estiloSeleccionado === 'neon',
            }"
          >
            <!-- Watermark Logo -->
            <div
              class="w-16 mb-2 transition-all duration-500"
              :class="{
                'opacity-10 grayscale brightness-0': estiloSeleccionado === 'classic',
                'opacity-20 brightness-0 invert': estiloSeleccionado === 'glass',
                'opacity-10 hue-rotate-90': estiloSeleccionado === 'neon',
              }"
            >
              <img src="@/assets/img/logotipo-1.svg" alt="Rotaract Logo" />
            </div>

            <!-- Avatar -->
            <img
              src="@/assets/img/img_user/user_img.webp"
              alt="Avatar Vista Previa"
              class="rounded-full w-16 h-16 object-cover border-2 shadow-xs mb-2.5 transition-all duration-500"
              :class="{
                'border-white ring-1 ring-black/5': estiloSeleccionado === 'classic',
                'border-white/30 shadow-lg ring-2 ring-white/10': estiloSeleccionado === 'glass',
                'border-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.3)]':
                  estiloSeleccionado === 'neon',
              }"
            />

            <!-- Nombre -->
            <h3
              class="text-sm font-bold text-center leading-tight truncate max-w-full"
              :class="{
                'text-gray-800': estiloSeleccionado === 'classic',
                'text-white': estiloSeleccionado === 'glass',
                'text-emerald-300 font-mono uppercase tracking-wider':
                  estiloSeleccionado === 'neon',
              }"
            >
              {{ nombreSocio }}
            </h3>

            <!-- Club -->
            <p
              class="text-[10px] text-center font-medium mt-1 mb-5"
              :class="{
                'text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100':
                  estiloSeleccionado === 'classic',
                'text-white/80 bg-white/10 px-2 py-0.5 rounded-full border border-white/10':
                  estiloSeleccionado === 'glass',
                'text-emerald-500/80 font-mono': estiloSeleccionado === 'neon',
              }"
            >
              {{ clubSocio }}
            </p>

            <!-- Botones Dummy Linktree -->
            <div class="w-full space-y-2 flex-1 overflow-y-auto max-h-55 scrollbar-none">
              <!-- Botón 1 -->
              <div
                class="w-full py-2 px-3 rounded-lg text-center text-xs font-bold transition-all shadow-2xs border"
                :class="{
                  'bg-[#25D366] text-white border-transparent': estiloSeleccionado === 'classic',
                  'bg-white/10 border-white/20 text-white backdrop-blur-md':
                    estiloSeleccionado === 'glass',
                  'bg-black border-emerald-400 text-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.2)] font-mono':
                    estiloSeleccionado === 'neon',
                }"
              >
                <i class="bi bi-whatsapp mr-1"></i> WhatsApp
              </div>

              <!-- Botón 2 -->
              <div
                class="w-full py-2 px-3 rounded-lg text-center text-xs font-bold transition-all shadow-2xs border"
                :class="{
                  'bg-linear-to-r from-pink-600 to-rose-500 text-white border-transparent':
                    estiloSeleccionado === 'classic',
                  'bg-white/10 border-white/20 text-white backdrop-blur-md':
                    estiloSeleccionado === 'glass',
                  'bg-black border-emerald-400 text-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.2)] font-mono':
                    estiloSeleccionado === 'neon',
                }"
              >
                <i class="bi bi-instagram mr-1"></i> Instagram
              </div>

              <!-- Botón 3 -->
              <div
                class="w-full py-2 px-3 rounded-lg text-center text-xs font-bold transition-all shadow-2xs border"
                :class="{
                  'bg-white border-gray-200 text-gray-700': estiloSeleccionado === 'classic',
                  'bg-white/10 border-white/20 text-white backdrop-blur-md':
                    estiloSeleccionado === 'glass',
                  'bg-black border-emerald-400 text-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.2)] font-mono':
                    estiloSeleccionado === 'neon',
                }"
              >
                <i class="bi bi-envelope mr-1"></i> Enviar Correo
              </div>
            </div>

            <!-- Footer Logo -->
            <p
              class="text-[8px] text-center font-bold tracking-widest mt-2 uppercase"
              :class="{
                'text-gray-400': estiloSeleccionado === 'classic',
                'text-white/40': estiloSeleccionado === 'glass',
                'text-emerald-500/50 font-mono': estiloSeleccionado === 'neon',
              }"
            >
              r-admin panel
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
