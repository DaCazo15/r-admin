<script setup>
defineProps({
  nombreUser: String,
  rol: String,
  club: String,
  redesRegistradas: Array,
  emailLink: String
})

const emit = defineEmits(['volver'])
</script>

<template>
  <div
    class="max-w-md mx-auto py-8 px-4 bg-linear-to-b from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/60 shadow-inner flex flex-col items-center"
  >
    <!-- Logo Watermark Linktree -->
    <div class="opacity-10 w-28 mb-4">
      <img src="@/assets/img/logotipo-1.svg" class="grayscale brightness-0" alt="Watermark" />
    </div>

    <!-- Avatar -->
    <img
      src="@/assets/img/img_user/user_img.webp"
      alt="Foto de perfil Linktree"
      class="rounded-full w-24 h-24 object-cover border-4 border-white shadow-md ring-1 ring-black/5 mb-4"
    />

    <!-- Nombre y Rol -->
    <h3 class="capitalize text-xl font-bold text-gray-800 text-center leading-tight">
      {{ nombreUser || 'Usuario' }}
    </h3>
    <p
      class="capitalize text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100 mt-2 mb-1"
    >
      {{ rol }}
    </p>
    <p class="text-xs text-gray-500 font-medium mb-6">
      {{ club }}
    </p>

    <!-- Listado de Enlaces grandes e interactivos -->
    <div class="w-full flex flex-col gap-3">
      <a
        v-for="red in redesRegistradas"
        :key="red.tipo"
        :href="red.url"
        target="_blank"
        class="cursor-pointer w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm text-center shadow-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10"
        :class="red.color"
      >
        <i class="bi text-lg" :class="red.icono"></i>
        {{ red.label }}
      </a>

      <!-- Enlace alternativo del correo -->
      <a
        :href="emailLink"
        class="cursor-pointer w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-sm text-center shadow-xs transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        <i class="bi bi-envelope text-lg text-gray-400"></i>
        Enviar Correo
      </a>
    </div>

    <!-- Botón Volver -->
    <button
      @click="emit('volver')"
      class="cursor-pointer mt-8 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 active:scale-95 transition-all text-gray-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
    >
      <i class="bi bi-arrow-left"></i>
      Volver al Perfil
    </button>
  </div>
</template>
