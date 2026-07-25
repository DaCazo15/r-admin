<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSesionStore } from '../stores/useSesionStore' // Ajusta tu ruta si es necesario

// Instancias de router y store
const router = useRouter()
const sesionStore = useSesionStore()

// Estado para alternar entre 'login' y 'signup'
const tipoAuth = ref('login') // 'login' | 'signup'

// Formulario reactivo único para ambos estados
const form = ref({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isSubmitting = ref(false)

// Función handleSubmit única y unificada
const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    if (tipoAuth.value === 'login') {
      const resultado = await sesionStore.iniciarSesion(form.value.email, form.value.password)
      if (resultado.success) {
        router.push({ name: 'home' })
      } else {
        alert('Credenciales incorrectas: ' + resultado.error)
      }
    } else {
      if (form.value.password !== form.value.confirmPassword) {
        alert('Las contraseñas no coinciden')
        return
      }
      const resultado = await sesionStore.registrarUsuario(form.value.email, form.value.password)
      if (resultado.success) {
        router.push('/')
      } else {
        alert('Error al registrar: ' + resultado.error)
      }
    }
  } catch (error) {
    console.error('Error en autenticación:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center">
    <img src="../assets/img/logotipo-1.svg" alt="Inicio" class="h-20 w-60 my-10" />
  </div>

  <div class="max-h-screen flex items-center justify-center px-4">
    <!-- Contenedor principal de la tarjeta -->

    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100"
    >
      <!-- Cabecera / Pestañas de Navegación -->
      <div class="grid grid-cols-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          @click="tipoAuth = 'login'"
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
          @click="tipoAuth = 'signup'"
          :class="
            tipoAuth === 'signup'
              ? 'bg-white text-primary-600 font-bold border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700'
          "
          class="py-4 text-sm font-semibold transition-all cursor-pointer"
        >
          Registrarse
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="p-8 space-y-5">
        <!-- Título dinámico -->
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ tipoAuth === 'login' ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta' }}
          </h2>
          <p class="text-xs text-gray-500 mt-1">
            {{
              tipoAuth === 'login'
                ? 'Ingresa tus datos para acceder al sistema'
                : 'Completa los campos para registrarte'
            }}
          </p>
        </div>

        <!-- Campo Nombre (Solo visible en Registro) -->
        <div v-if="tipoAuth === 'signup'" class="space-y-1.5">
          <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider"
            >Nombre completo</label
          >
          <input
            type="text"
            v-model="form.nombre"
            required
            placeholder="Ej. Juan Pérez"
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
            placeholder="correo@ejemplo.com"
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

        <!-- Campo Confirmar Contraseña (Solo visible en Registro) -->
        <div v-if="tipoAuth === 'signup'" class="space-y-1.5">
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

        <!-- Botón de Envío -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full mt-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Procesando...' : tipoAuth === 'login' ? 'Entrar' : 'Registrarse' }}
        </button>
      </form>
    </div>
  </div>
</template>
