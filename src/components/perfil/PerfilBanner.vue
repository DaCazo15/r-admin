<script setup>
defineProps({
  nombreUser: String,
  rol: String,
  club: String,
  emailLink: String,
  whatsappLink: String,
  tieneMasDe4Redes: Boolean,
  modoEdicion: Boolean,
  config: Boolean,
  linktree: Boolean,
})

const emit = defineEmits(['edit', 'toggleConfig', 'openLinktree', 'volverPerfil'])
</script>

<template>
  
  <div>
    <!-- Banner Cabecera con degradado Rotaract -->
    <div
      class="relative w-full h-44 bg-linear-to-r from-primary-600 via-primary-500 to-primary-700"
    >
      <!-- Logo Rotaract decorativo en esquina -->
      <div class="absolute right-6 top-6 opacity-100 w-40">
        <img src="@/assets/img/logotipo-1.svg" class="logo-blanco" alt="Rotaract Logo" />
      </div>
    </div>

    <!-- Sección de Perfil Info -->
    <div
      class="relative px-6 pb-6 border-b border-gray-100 bg-linear-to-b from-gray-50/50 to-white"
    >
      <!-- Avatar superpuesto -->
      <div class="absolute -top-14 left-6">
        <img
          src="@/assets/img/img_user/user_img.webp"
          alt="Foto de perfil"
          class="rounded-full w-28 h-28 object-cover border-4 border-white shadow-md ring-1 ring-black/5"
        />
      </div>

      <!-- Nombre, Rol y Botones de cabecera -->
      <div class="pt-16 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2
            class="capitalize text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2"
          >
            {{ nombreUser || 'Usuario' }}
          </h2>
          <div class="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              class="capitalize text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 border border-primary-100"
            >
              {{ rol }}
            </span>
            <span class="text-xs text-gray-500 font-medium">
              Club: {{ club || 'Cargando...' }}
            </span>
          </div>
        </div>

        <!-- Botones de Acción de Cabecera -->
        <div class="flex gap-2.5">
          <button
            v-if="!modoEdicion && !config && !linktree"
            @click="emit('edit')"
            class="cursor-pointer px-4 py-2 border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium rounded-xl transition-all duration-200 active:scale-95 text-sm flex items-center gap-1.5"
          >
            <i class="bi bi-pencil-square"></i>
            Editar Perfil
          </button>
          
          <button
            v-if="linktree"
            @click="emit('volverPerfil')"
            class="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5"
          >
            <i class="bi bi-arrow-left"></i>
            Volver al Perfil
          </button>
        </div>
      </div>
    </div>

    <!-- Barra de Contactos Rápida o Botón Linktree -->
    <div
      v-if="!modoEdicion && !config && !linktree"
      class="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3"
    >
      <div class="flex flex-wrap items-center gap-3">
        <a
          :href="emailLink"
          class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
        >
          <i class="bi bi-envelope-fill text-gray-400"></i>
          {{ emailLink.replace('mailto:', '') }}
        </a>

        <template v-if="!tieneMasDe4Redes">
          <span v-if="whatsappLink !== '#'" class="text-gray-300 hidden sm:inline">|</span>
          <a
            v-if="whatsappLink !== '#'"
            :href="whatsappLink"
            target="_blank"
            class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <i class="bi bi-whatsapp text-emerald-500"></i>
            WhatsApp
          </a>
        </template>
      </div>

      <!-- Botón Ver Linktree si tiene más de 4 redes registradas -->
      <button
        v-if="tieneMasDe4Redes"
        @click="emit('openLinktree')"
        class="cursor-pointer px-3.5 py-1.5 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl text-xs shadow-xs transition-all duration-200 active:scale-95 flex items-center gap-1.5"
      >
        <i class="bi bi-tree-fill"></i>
        Ver Linktree
      </button>
    </div>
  </div>
</template>
