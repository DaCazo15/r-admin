<script setup>
const props = defineProps({
  form: Object,
  clubName: String,
  clubExiste: [Boolean, Object], // Can be null, true, false
  errorMsg: String,
  isSubmitting: Boolean
})

const emit = defineEmits(['update:clubName', 'verifyClub', 'changeClub', 'submit'])
</script>

<template>
  <form @submit.prevent="emit('submit')" class="p-8 space-y-5">
    <!-- Título -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Crea tu cuenta</h2>
      <p class="text-xs text-gray-500 mt-1">
        {{
          clubExiste === false
            ? 'Completa los campos para registrarte'
            : 'Ingresa el nombre del club para iniciar el registro'
        }}
      </p>
    </div>

    <!-- SIGNUP STEP 1: Verificar Club -->
    <template v-if="clubExiste !== false">
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >Nombre del club</label
        >
        <input
          type="text"
          :value="clubName"
          @input="emit('update:clubName', $event.target.value)"
          required
          placeholder="Nombre del club"
          class="w-full px-4 py-2.5 bg-gray-100 border border-transparent rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
        />
      </div>

      <p v-if="errorMsg" class="text-sm text-rose-600 text-center font-medium">{{ errorMsg }}</p>

      <button
        type="button"
        @click="emit('verifyClub')"
        :disabled="isSubmitting"
        class="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50"
      >
        {{ isSubmitting ? 'Verificando...' : 'Verificar Club' }}
      </button>
    </template>

    <!-- SIGNUP STEP 2: Completar Registro -->
    <template v-else>
      <!-- Club Seleccionado (Solo lectura) -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >Club</label
        >
        <div class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
          <span class="text-sm font-semibold text-gray-700">{{ clubName }}</span>
          <button
            type="button"
            @click="emit('changeClub')"
            class="text-xs text-primary-600 hover:text-primary-700 hover:underline font-bold cursor-pointer"
          >
            Cambiar
          </button>
        </div>
      </div>

      <!-- Campo Nombre Completo -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >Nombre completo</label
        >
        <input
          type="text"
          v-model="form.nombre"
          required
          placeholder="Nombre y Apellidos"
          class="w-full px-4 py-2.5 bg-gray-100 border border-transparent rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
        />
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

      <!-- Campo Confirmar Contraseña -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
          >Confirmar contraseña</label
        >
        <input
          type="password"
          v-model="form.confirmPassword"
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
        class="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? 'Procesando...' : 'Crear Cuenta y Registrar Club' }}
      </button>
    </template>
  </form>
</template>
