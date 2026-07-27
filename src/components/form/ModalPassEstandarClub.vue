<script setup>
import { ref, computed, onMounted } from 'vue'
import { guardarPassEstandar, extraerPassEstandarClub } from '@/services/firebaseService.js'

const emit = defineEmits(['close'])
const pass = ref('')
const isSaving = ref(false)
const passView = ref(false)

onMounted(async () => {
  pass.value = await extraerPassEstandarClub()
})

const cerrar = () => {
  emit('close')
}
const guardar = async () => {
  await guardarPassEstandar(pass.value, isSaving)
  cerrar()
}
const cambioEstado = computed(() => {
  return passView.value ? 'text' : 'password'
})
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    @click.self="cerrar"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all"
    >
      <!-- Cabecera del Modal-->
      <div
        class="bg-primary-600 px-6 py-4 flex justify-between items-center border-b border-gray-100"
      >
        <h3 class="text-lg font-bold text-gray-50">Password Estandar del club</h3>
        <button @click="cerrar" class="cursor-pointer text-gray-50 text-xl font-bold">
          &times;
        </button>
      </div>

      <!-- Contenido del modal -->
      <form @submit.prevent="guardar" class="p-6 space-y-4">
        <div class="border-l-2 border-gray-500 bg-gray-100 p-4 rounded-br-lg rounded-tr-lg">
          <h5 class="text-[16px] font-medium text-primary-600">Nota:</h5>
          <p class="text-[16px] font-light text-gray-500">
            Esta contraseña será asignada a los miembros del club, con ella podran iniciar sesión
            por primera vez.
            <span class="font-normal text-red-700"
              >Se recomienda que luego de iniciar sesión, el socio coloque una personal.</span
            >
          </p>
        </div>
        <div class="flex gap-4 items-center justify-center">
          <p class="text-primary-600 font-medium">Password Actual</p>
          <input
            :type="cambioEstado"
            v-model="pass"
            required
            placeholder="--"
            class="py-2 px-3 text-center border-2 rounded-lg border-primary-600 font-medium text-gray-500"
          />
          <i
            :class="{
              'bi bi-eye text-2xl text-primary-600': !passView,
              'bi bi-eye-slash text-2xl text-primary-600': passView,
            }"
            @click="passView = !passView"
          ></i>
        </div>
        <!-- Botones -->
        <div class="flex gap-4 items-center justify-end pt-4 border-t border-gray-100">
          <button
            class="cursor-pointer py-2.5 px-4 rounded-lg capitalize bg-gray-200 hover:bg-gray-300 active:bg-gray-300 text-gray-700 ease-in-out transition-all duration-300"
            @click="cerrar"
            :disabled="isSaving"
          >
            cancelar
          </button>
          <button
            :disabled="isSaving"
            class="cursor-pointer py-2.5 px-4 rounded-lg capitalize bg-primary-600 hover:bg-primary-700 active:bg-primary-700 text-white font-medium ease-in-out transition-all duration-300"
          >
            guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
