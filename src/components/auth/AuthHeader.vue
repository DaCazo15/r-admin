<script setup>
defineProps({
  tipoAuth: String
})
const emit = defineEmits(['update:tipoAuth'])
</script>

<template>
  <div>
    <!-- Logo -->
    <div class="mb-6 flex justify-center">
      <img src="../../assets/img/logotipo-1.svg" alt="Inicio" class="h-16 w-auto" />
    </div>

    <!-- Pestañas de Navegación -->
    <div class="grid grid-cols-2 bg-gray-50 border-b border-gray-200 rounded-t-2xl overflow-hidden">
      <button
        type="button"
        @click="emit('update:tipoAuth', 'login')"
        :class="
          tipoAuth === 'login'
            ? 'bg-white text-primary-600 font-bold border-b-2 border-primary-600'
            : 'text-gray-500 hover:text-gray-700'
        "
        class="py-4 text-sm font-semibold transition-all cursor-pointer"
      >
        Iniciar Sesión
      </button>
      <button
        type="button"
        @click="emit('update:tipoAuth', 'signup')"
        :class="
          tipoAuth === 'signup'
            ? 'bg-white text-primary-600 font-bold border-b-2 border-primary-600'
            : 'text-gray-500 hover:text-gray-700'
        "
        class="py-4 text-sm font-semibold transition-all cursor-pointer"
      >
        Registrar Club
      </button>
    </div>
  </div>
</template>
