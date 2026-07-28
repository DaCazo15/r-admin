<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="text-xs text-gray-400 font-medium text-center mt-6">
    Rotaract 4370 &middot; R-Admin &middot; Todos los derechos reservados
    <div class="flex sm:gap-3 gap-1 w-full justify-center mt-3 mb-10">
      <router-link
        :to="{ name: 'conditions' }"
        class="text-gray-400 cursor-pointer text-[10px] sm:text-xs py-1 px-2 hover:text-primary-600 font-medium"
      >
        Condiciones del servicio
      </router-link>
      <span class="text-gray-400 font-semibold">|</span>
      <router-link
        :to="{ name: 'policies' }"
        class="text-gray-400 cursor-pointer text-[10px] sm:text-xs py-1 px-2 hover:text-primary-600 font-medium"
      >
        Política de privacidad
      </router-link>
      <span class="text-gray-400 font-semibold">|</span>
      <router-link
        :to="{ name: 'info' }"
        class="text-gray-400 cursor-pointer text-[10px] sm:text-xs py-1 px-2 hover:text-primary-600 font-medium"
      >
        Información
      </router-link>
    </div>
  </footer>
</template>
