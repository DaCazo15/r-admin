<script setup>
defineProps({
  estatus: String,
  puedeAccederTesoreria: Boolean
})

const emit = defineEmits(['cambioEstatus'])
</script>

<template>
  <div
    class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2"
    :class="{ 'mt-15 sm:mt-20': estatus === 'Tesoreria' }"
  >
    <button
      @click="emit('cambioEstatus', 'Socios')"
      :class="{ 'bg-primary-600 text-white': estatus === 'Socios' }"
      class="cursor-pointer px-2 py-2.5 w-full hover:bg-primary-600 ease-in-out duration-300 active:scale-95 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
    >
      Socios
    </button>
    <button
      @click="emit('cambioEstatus', 'Aspirantes')"
      :class="{ 'bg-primary-600 text-white': estatus === 'Aspirantes' }"
      class="cursor-pointer px-2 py-2.5 w-full hover:bg-primary-600 ease-in-out duration-300 active:scale-95 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
    >
      Aspirantes
    </button>
    <button
      v-if="puedeAccederTesoreria"
      @click="emit('cambioEstatus', 'Tesoreria')"
      :class="{ 'bg-primary-600 text-white': estatus === 'Tesoreria' }"
      class="cursor-pointer px-2 py-2.5 w-full hover:bg-primary-600 ease-in-out duration-300 active:scale-95 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
    >
      Tesorería
    </button>
    <button
      @click="emit('cambioEstatus', 'Junta')"
      :class="{ 'bg-primary-600 text-white': estatus === 'Junta' }"
      class="cursor-pointer px-2 py-2.5 w-full hover:bg-primary-600 ease-in-out duration-300 active:scale-95 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
    >
      Junta Directiva
    </button>
  </div>
</template>
