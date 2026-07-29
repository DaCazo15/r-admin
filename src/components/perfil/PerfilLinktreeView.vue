<script setup>
import { computed } from 'vue'
import { sanitizeUrl } from '@/helpers/security'

const props = defineProps({
  nombreUser: String,
  rol: String,
  club: String,
  redesRegistradas: Array,
  emailLink: String,
  linktreeStyle: {
    type: String,
    default: 'classic',
  },
  mostrarContacto: {
    type: Boolean,
    default: true,
  },
  mostrarLaburo: {
    type: Boolean,
    default: true,
  }
})

const emit = defineEmits(['volver'])

const redesFiltradas = computed(() => {
  let list = [...(props.redesRegistradas || [])]
  if (!props.mostrarContacto) {
    list = list.filter((r) => r.tipo !== 'whatsapp')
  }
  if (!props.mostrarLaburo) {
    list = list.filter((r) => r.tipo !== 'cv')
  }
  return list.map((r) => ({
    ...r,
    url: sanitizeUrl(r.url),
  }))
})
</script>

<template>
  <div
    class="max-w-md mx-auto py-8 px-4 rounded-2xl border shadow-inner flex flex-col items-center transition-all duration-500 w-full"
    :class="{
      'bg-linear-to-b from-gray-50 to-gray-100/50 border-gray-200/60 text-gray-800': linktreeStyle === 'classic',
      'bg-linear-to-br from-primary-700 via-primary-600 to-indigo-800 border-white/10 text-white shadow-2xl': linktreeStyle === 'glass',
      'bg-gray-950 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.25)]': linktreeStyle === 'neon'
    }"
  >
    <!-- Logo Watermark Linktree -->
    <div
      class="w-28 mb-4 transition-all duration-500"
      :class="{
        'opacity-10 grayscale brightness-0': linktreeStyle === 'classic',
        'opacity-20 brightness-0 invert': linktreeStyle === 'glass',
        'opacity-10 hue-rotate-90': linktreeStyle === 'neon'
      }"
    >
      <img src="@/assets/img/logotipo-1.svg" class="w-full" alt="Watermark" />
    </div>

    <!-- Avatar -->
    <img
      src="@/assets/img/img_user/user_img.webp"
      alt="Foto de perfil Linktree"
      class="rounded-full w-24 h-24 object-cover border-4 shadow-md ring-1 mb-4 transition-all duration-500"
      :class="{
        'border-white ring-black/5': linktreeStyle === 'classic',
        'border-white/30 ring-white/10': linktreeStyle === 'glass',
        'border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.3)] ring-emerald-500/20': linktreeStyle === 'neon'
      }"
    />

    <!-- Nombre y Rol -->
    <h3
      class="capitalize text-xl font-bold text-center leading-tight"
      :class="{
        'text-gray-800': linktreeStyle === 'classic',
        'text-white': linktreeStyle === 'glass',
        'text-emerald-300 font-mono uppercase tracking-wider': linktreeStyle === 'neon'
      }"
    >
      {{ nombreUser || 'Usuario' }}
    </h3>
    <p
      class="capitalize text-xs font-semibold px-2.5 py-1 rounded-full border mt-2 mb-1"
      :class="{
        'text-primary-600 bg-primary-50 border-primary-100': linktreeStyle === 'classic',
        'text-white bg-white/10 border-white/15': linktreeStyle === 'glass',
        'text-emerald-400 bg-emerald-950/45 border-emerald-500/30 font-mono': linktreeStyle === 'neon'
      }"
    >
      {{ rol }}
    </p>
    <p
      class="text-xs font-medium mb-6"
      :class="{
        'text-gray-500': linktreeStyle === 'classic',
        'text-white/70': linktreeStyle === 'glass',
        'text-emerald-500/70 font-mono': linktreeStyle === 'neon'
      }"
    >
      {{ club }}
    </p>

    <!-- Listado de Enlaces grandes e interactivos -->
    <div class="w-full flex flex-col gap-3">
      <a
        v-for="red in redesFiltradas"
        :key="red.tipo"
        :href="red.url"
        target="_blank"
        class="cursor-pointer w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm text-center shadow-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border"
        :class="[
          linktreeStyle === 'classic' ? `${red.color} border-white/10` : '',
          linktreeStyle === 'glass' ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-lg backdrop-blur-md' : '',
          linktreeStyle === 'neon' ? 'bg-black border-2 border-emerald-400 hover:border-emerald-300 text-emerald-400 hover:text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.15)] font-mono' : ''
        ]"
      >
        <i class="bi text-lg" :class="red.icono"></i>
        {{ red.label }}
      </a>

      <!-- Enlace alternativo del correo -->
      <a
        v-if="mostrarContacto"
        :href="emailLink"
        class="cursor-pointer w-full flex items-center justify-center gap-2.5 py-3.5 px-4 border rounded-xl font-bold text-sm text-center shadow-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        :class="{
          'bg-white border-gray-200 text-gray-700 hover:bg-gray-50': linktreeStyle === 'classic',
          'bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-lg backdrop-blur-md': linktreeStyle === 'glass',
          'bg-black border-2 border-emerald-400 hover:border-emerald-300 text-emerald-400 hover:text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.15)] font-mono': linktreeStyle === 'neon'
        }"
      >
        <i class="bi text-lg" :class="[linktreeStyle === 'classic' ? 'bi-envelope text-gray-400' : 'bi-envelope']"></i>
        Enviar Correo
      </a>
    </div>

    <!-- Botón Volver -->
    <button
      @click="emit('volver')"
      class="cursor-pointer mt-8 px-5 py-2.5 border rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
      :class="{
        'bg-gray-200 hover:bg-gray-300 text-gray-700 border-transparent': linktreeStyle === 'classic',
        'bg-white/15 hover:bg-white/25 text-white border-white/10 backdrop-blur-md': linktreeStyle === 'glass',
        'bg-gray-900 border border-emerald-500/50 hover:bg-gray-800 text-emerald-400 font-mono shadow-[0_0_8px_rgba(52,211,153,0.1)]': linktreeStyle === 'neon'
      }"
    >
      <i class="bi bi-arrow-left"></i>
      Volver al Perfil
    </button>
  </div>
</template>
