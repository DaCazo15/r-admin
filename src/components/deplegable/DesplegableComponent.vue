<script setup>
import { useSesionStore } from '../../stores/useSesionStore'
import { storeToRefs } from 'pinia'

const sesionStore = useSesionStore()
const { usuario } = storeToRefs(sesionStore)

const emit = defineEmits(['cerrarSesion'])
</script>

<template>
  <div
    class="w-72 bg-linear-to-b from-primary-600 to-primary-800 text-white p-5 shadow-2xl flex flex-col gap-5 rounded-r-2xl rounded-b-2xl border-r border-b border-white/10 backdrop-blur-md"
  >
    <!-- Sección de Perfil (Avatar + Nombre + Rol/Email) -->
    <div class="flex items-center gap-3.5 pb-4 border-b border-white/15">
      <div class="relative">
        <img
          src="../../assets/img/img_user/user_img.webp"
          :alt="usuario?.nombre || 'Foto de perfil'"
          class="rounded-full w-14 h-14 object-cover shadow-lg border-2 border-white/30 p-0.5 ring-2 ring-primary-400/40"
        />
        <span
          class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-primary-700 rounded-full"
        ></span>
      </div>
      <div class="overflow-hidden">
        <h2 class="font-bold text-base tracking-wide truncate text-white leading-tight">
          {{ usuario?.nombre || 'Usuario' }}
        </h2>
        <p class="text-xs text-primary-200/90 truncate font-light mt-0.5">
          {{ usuario?.email || 'correo@domain.com' }}
        </p>
      </div>
    </div>

    <!-- Menú Principal -->
    <div class="flex flex-col gap-1">
      <span
        class="text-[10px] font-semibold tracking-wider text-primary-200/60 uppercase px-3 mb-1"
      >
        Menú Principal
      </span>
      <router-link
        :to="{ name: 'error' }"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all text-sm font-medium group"
      >
        <i
          class="bi bi-person text-lg text-primary-200 group-hover:text-white transition-colors"
        ></i>
        <span>Perfil</span>
      </router-link>
      <router-link
        :to="{ name: 'error' }"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all text-sm font-medium group"
      >
        <i
          class="bi bi-credit-card text-lg text-primary-200 group-hover:text-white transition-colors"
        ></i>
        <span>Pagar</span>
      </router-link>
      <router-link
        :to="{ name: 'error' }"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all text-sm font-medium group"
      >
        <i
          class="bi bi-calendar-event text-lg text-primary-200 group-hover:text-white transition-colors"
        ></i>
        <span>Calendario</span>
      </router-link>
    </div>

    <div class="h-px bg-white/15 my-0.5"></div>

    <!-- Enlaces & Redes -->
    <div class="flex flex-col gap-1">
      <span
        class="text-[10px] font-semibold tracking-wider text-primary-200/60 uppercase px-3 mb-1"
      >
        Comunidad
      </span>
      <a
        href="https://www.instagram.com/rotaractdistrito4370/"
        target="_blank"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all text-sm font-medium group"
      >
        <i
          class="bi bi-instagram text-lg text-primary-200 group-hover:text-white transition-colors"
        ></i>
        <span>Distrito 4370</span>
      </a>
      <a
        href="https://www.instagram.com/rotaractmargarita/"
        target="_blank"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all text-sm font-medium group"
      >
        <i
          class="bi bi-instagram text-lg text-primary-200 group-hover:text-white transition-colors"
        ></i>
        <span>Instagram del Club</span>
      </a>
      <a
        href="https://rotaract4370.org"
        target="_blank"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all text-sm font-medium group"
      >
        <i
          class="bi bi-globe text-lg text-primary-200 group-hover:text-white transition-colors"
        ></i>
        <span>Sitio Web</span>
      </a>
    </div>

    <div class="h-px bg-white/15 my-0.5"></div>

    <!-- Configuración y Sesión -->
    <div class="flex flex-col gap-1">
      <span
        class="text-[10px] font-semibold tracking-wider text-primary-200/60 uppercase px-3 mb-1"
      >
        Sistema
      </span>
      <router-link
        :to="{ name: 'error' }"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all text-sm font-medium group"
      >
        <i
          class="bi bi-people text-lg text-primary-200 group-hover:text-white transition-colors"
        ></i>
        <span>Alianzas</span>
      </router-link>
      <router-link
        :to="{ name: 'error' }"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all text-sm font-medium group"
      >
        <i
          class="bi bi-tools text-lg text-primary-200 group-hover:text-white transition-colors"
        ></i>
        <span>Herramientas</span>
      </router-link>
      <router-link
        :to="{ name: 'error' }"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/15 active:scale-[0.98] transition-all text-sm font-medium group"
      >
        <i class="bi bi-gear text-lg text-primary-200 group-hover:text-white transition-colors"></i>
        <span>Configuraciones</span>
      </router-link>

      <button
        @click="emit('cerrarSesion')"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white active:scale-[0.98] transition-all text-sm font-semibold mt-2 cursor-pointer border border-red-500/30 group"
      >
        <i
          class="bi bi-box-arrow-right text-lg text-red-300 group-hover:text-white transition-colors"
        ></i>
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </div>
</template>
