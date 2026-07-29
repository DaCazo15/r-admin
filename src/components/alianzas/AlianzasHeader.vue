<script setup>
defineProps({
  totalAlianzas: Number
})
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto flex items-center justify-between gap-3 mb-1">
    <div>
      <h2 class="text-lg font-bold text-gray-900">Alianzas Estratégicas</h2>
      <p class="text-xs text-gray-500 mt-0.5">{{ totalAlianzas }} alianza(s) registrada(s)</p>
    </div>
  </div>
</template>
