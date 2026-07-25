<script setup>
defineProps({
  club: {
    type: String,
    default: 'Isla de Margarita',
  },
})
</script>

<template>
  <div class="w-3/4 mx-auto flex justify-center items-center py-6">
    <div class="flex flex-col justify-end items-end">
      <h1 class="text-2xl font-bold capitalize text-primary-600">Rotaract</h1>
      <h4
        class="text-lg font-normal capitalize text-shadow-black/50 text-shadow-2xs text-primary-600"
      >
        {{ club }}
      </h4>
    </div>
    <div class="image-container">
      <img src="../../assets/img/logotipo-1.svg" alt="Ejemplo" />
    </div>
  </div>
</template>
