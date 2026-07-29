<script setup>
defineProps({
  mesActualLabel: String
})
const emit = defineEmits(['prev', 'next', 'today'])
</script>

<template>
  <div class="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
    <div class="flex items-center gap-3">
      <div class="p-2.5 bg-primary-50 text-primary-600 rounded-xl">
        <i class="bi bi-calendar3 text-xl"></i>
      </div>
      <div>
        <h2 class="text-lg font-bold text-gray-900 capitalize">{{ mesActualLabel }}</h2>
        <p class="text-xs text-gray-500 font-medium">Calendario de Actividades del Club</p>
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <button
        @click="emit('prev')"
        class="cursor-pointer p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all border border-gray-200"
        title="Mes anterior"
      >
        <i class="bi bi-chevron-left text-sm"></i>
      </button>
      <button
        @click="emit('today')"
        class="cursor-pointer px-4 py-2 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 transition-all border border-gray-200"
      >
        Hoy
      </button>
      <button
        @click="emit('next')"
        class="cursor-pointer p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-all border border-gray-200"
        title="Mes siguiente"
      >
        <i class="bi bi-chevron-right text-sm"></i>
      </button>
    </div>
  </div>
</template>
