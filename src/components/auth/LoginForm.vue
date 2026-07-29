<script setup>
defineProps({
  form: Object,
  errorMsg: String,
  isSubmitting: Boolean
})
const emit = defineEmits(['submit'])
</script>

<template>
  <form @submit.prevent="emit('submit')" class="p-8 space-y-5">
    <!-- Título -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">¡Bienvenido de nuevo!</h2>
      <p class="text-xs text-gray-500 mt-1">Ingresa tus datos para acceder al sistema</p>
    </div>

    <!-- Campo Email -->
    <div class="space-y-1.5">
      <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
        >Correo electrónico</label
      >
      <input
        type="email"
        v-model="form.email"
        required
        placeholder="correo@correo.com"
        class="w-full px-4 py-2.5 bg-gray-100 border border-transparent rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
      />
    </div>

    <!-- Campo Contraseña -->
    <div class="space-y-1.5">
      <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
        >Contraseña</label
      >
      <input
        type="password"
        v-model="form.password"
        required
        placeholder="••••••••"
        class="w-full px-4 py-2.5 bg-gray-100 border border-transparent rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
      />
    </div>

    <p v-if="errorMsg" class="text-sm text-rose-600 text-center font-medium">{{ errorMsg }}</p>

    <!-- Botón de Envío -->
    <button
      type="submit"
      :disabled="isSubmitting"
      class="w-full mt-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
    </button>
  </form>
</template>
