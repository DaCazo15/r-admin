<script setup>
import { useFiltrosStore } from '@/stores/useFiltrosStore'
import { storeToRefs } from 'pinia'

const { filtros } = storeToRefs(useFiltrosStore())
</script>

<template>
  <div
    class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto my-6 flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-2xs"
  >
    <!-- Filtros de Categoría (Checkboxes) -->
    <div class="flex flex-wrap items-center gap-4 sm:gap-6">
      <label
        for="todos"
        class="flex items-center gap-2 text-sm font-semibold text-black/70 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          id="todos"
          v-model="filtros.todos"
          class="w-4 h-4 accent-primary-600 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        />
        Todos
      </label>

      <label
        for="ingreso"
        class="flex items-center gap-2 text-sm font-semibold text-black/70 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          id="ingreso"
          v-model="filtros.ingreso"
          class="w-4 h-4 accent-primary-600 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        />
        Ingresos
      </label>

      <label
        for="egresos"
        class="flex items-center gap-2 text-sm font-semibold text-black/70 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          id="egresos"
          v-model="filtros.egreso"
          class="w-4 h-4 accent-primary-600 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        />
        Egresos
      </label>

      <label
        for="mensualidad"
        class="flex items-center gap-2 text-sm font-semibold text-black/70 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          id="mensualidad"
          v-model="filtros.mensualidad"
          class="w-4 h-4 accent-primary-600 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        />
        Mensualidad
      </label>

      <label
        for="pagoDistrital"
        class="flex items-center gap-2 text-sm font-semibold text-black/70 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          id="pagoDistrital"
          v-model="filtros.pagoDistrital"
          class="w-4 h-4 accent-primary-600 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        />
        cuota distrital
      </label>
    </div>

    <!-- Separador -->
    <div class="border-t border-gray-100 w-full"></div>

    <!-- Filtros de Categoría (Checkboxes) -->
    <div class="flex items-center gap-6">
      <label
        for="sinRevisar"
        class="flex items-center gap-2 text-sm font-semibold text-black/70 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          id="sinRevisar"
          v-model="filtros.sinRevisar"
          class="w-4 h-4 accent-primary-600 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        />
        Sin Revisar
      </label>

      <label
        for="revisado"
        class="flex items-center gap-2 text-sm font-semibold text-black/70 cursor-pointer select-none"
      >
        <input
          type="checkbox"
          id="revisado"
          v-model="filtros.revisado"
          class="w-4 h-4 accent-primary-600 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
        />
        Revisado
      </label>
    </div>

    <!-- Separador -->
    <div class="border-t border-gray-100 w-full"></div>

    <!-- Filtros de Monto (Inputs Numéricos) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="flex flex-col gap-1.5">
        <label for="min" class="text-xs font-semibold text-black/50 uppercase tracking-wider"
          >Monto mínimo</label
        >
        <input
          type="number"
          id="min"
          v-model.number="filtros.min"
          placeholder="0.00"
          class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-primary-600 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="max" class="text-xs font-semibold text-black/50 uppercase tracking-wider"
          >Monto máximo</label
        >
        <input
          type="number"
          id="max"
          v-model.number="filtros.max"
          placeholder="0.00"
          class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-primary-600 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600/20 transition-all"
        />
      </div>
    </div>
  </div>
</template>
