<script setup>
defineProps({
  buscador: String,
  puedeModificarAlianzas: Boolean
})

const emit = defineEmits(['update:buscador', 'search', 'add'])
</script>

<template>
  <div
    class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-3 flex flex-col sm:flex-row justify-center items-center gap-2"
  >
    <button
      v-if="puedeModificarAlianzas"
      @click="emit('add')"
      class="cursor-pointer px-3 py-2 w-full sm:w-auto shrink-0 gap-2 flex flex-row justify-center items-center text-primary-600 hover:text-white font-medium border-2 border-primary-600 hover:bg-primary-600 rounded-lg ease-in-out duration-300 active:scale-95 transition-all"
    >
      <i class="bi bi-plus-lg"></i>
      Agregar Alianza
    </button>

    <div class="flex justify-center items-center gap-2 w-full">
      <input
        :value="buscador"
        @input="emit('update:buscador', $event.target.value)"
        @keyup.enter="emit('search')"
        type="text"
        placeholder="Buscar por nombre, tipo o contacto"
        class="w-full px-5 py-2 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
      />
      <button
        @click="emit('search')"
        class="cursor-pointer px-2.5 py-1.5 text-white font-bold border-primary-600 border-2 bg-primary-600 rounded-lg ease-in-out duration-200 active:scale-90 transition-all"
      >
        <i class="bi bi-search"></i>
      </button>
    </div>
  </div>
</template>
