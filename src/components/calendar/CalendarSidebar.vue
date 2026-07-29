<script setup>
defineProps({
  filtroCumple: Boolean,
  filtroEventos: Boolean,
  filtroRecordatorios: Boolean,
  puedeModificarCalendario: Boolean
})

const emit = defineEmits([
  'update:filtroCumple',
  'update:filtroEventos',
  'update:filtroRecordatorios',
  'add'
])
</script>

<template>
  <div
    class="w-full lg:w-64 shrink-0 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col gap-5"
  >
    <button
      v-if="puedeModificarCalendario"
      @click="emit('add')"
      class="cursor-pointer py-3 px-4 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all uppercase tracking-wide text-xs sm:text-sm"
    >
      <i class="bi bi-plus-lg text-lg"></i>
      Agregar Fecha
    </button>

    <div class="h-px bg-gray-200"></div>

    <div>
      <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        Mis Calendarios
      </h4>
      <div class="flex flex-col gap-2.5">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            :checked="filtroCumple"
            @change="emit('update:filtroCumple', $event.target.checked)"
            class="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
          />
          <span class="w-3.5 h-3.5 rounded-full bg-primary-600 shrink-0"></span>
          <span
            class="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors"
            >Cumpleaños</span
          >
        </label>

        <label class="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            :checked="filtroEventos"
            @change="emit('update:filtroEventos', $event.target.checked)"
            class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span class="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0"></span>
          <span
            class="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors"
            >Eventos del Club</span
          >
        </label>

        <label class="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            :checked="filtroRecordatorios"
            @change="emit('update:filtroRecordatorios', $event.target.checked)"
            class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
          />
          <span class="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0"></span>
          <span
            class="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors"
            >Recordatorios</span
          >
        </label>
      </div>
    </div>
  </div>
</template>
