<script setup>
defineProps({
  pestania: String,
  totalActivos: Number,
  totalFinalizados: Number
})
const emit = defineEmits(['update:pestania'])
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto grid grid-cols-2 gap-2 mt-3">
    <button
      @click="emit('update:pestania', 'activos')"
      :class="{ 'bg-primary-600 text-white': pestania === 'activos' }"
      class="cursor-pointer px-2 py-2 w-full hover:bg-primary-600 ease-in-out duration-300 active:scale-95 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
    >
      Activos ({{ totalActivos }})
    </button>
    <button
      @click="emit('update:pestania', 'finalizados')"
      :class="{ 'bg-primary-600 text-white': pestania === 'finalizados' }"
      class="cursor-pointer px-2 py-2 w-full hover:bg-primary-600 ease-in-out duration-300 active:scale-95 transition-all font-medium text-xs sm:text-sm text-primary-600 hover:text-white border-2 rounded-lg border-primary-600 uppercase tracking-wider shadow-2xs text-center"
    >
      Finalizados ({{ totalFinalizados }})
    </button>
  </div>
</template>
