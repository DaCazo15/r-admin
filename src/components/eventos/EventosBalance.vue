<script setup>
defineProps({
  balanceDisponible: Number,
  presupuestoReservado: Number
})
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto grid grid-cols-3 gap-2 mb-1">
    <div class="bg-white rounded-xl border border-gray-200 shadow-xs p-3 text-center">
      <p class="text-[10px] uppercase tracking-wide font-semibold text-gray-400">
        Balance del Club
      </p>
      <p class="text-sm sm:text-lg font-bold text-gray-900 mt-0.5">
        ${{ (balanceDisponible + presupuestoReservado).toFixed(2) }}
      </p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 shadow-xs p-3 text-center">
      <p class="text-[10px] uppercase tracking-wide font-semibold text-gray-400">Reservado</p>
      <p class="text-sm sm:text-lg font-bold text-amber-600 mt-0.5">
        ${{ presupuestoReservado.toFixed(2) }}
      </p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 shadow-xs p-3 text-center">
      <p class="text-[10px] uppercase tracking-wide font-semibold text-gray-400">Disponible</p>
      <p class="text-sm sm:text-lg font-bold text-emerald-600 mt-0.5">
        ${{ balanceDisponible.toFixed(2) }}
      </p>
    </div>
  </div>
</template>
