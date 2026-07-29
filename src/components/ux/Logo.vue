<script setup>
import { ref } from 'vue'
const props = defineProps({
  club: {
    type: String,
    default: '',
  },
})
const iniciales = ref([])

const nombreClub = ref('')

if (props.club && props.club.toLowerCase().includes('rotaract')) {
  nombreClub.value = props.club.split(' ').slice(1).join(' ')
} else {
  nombreClub.value = props.club || ''
}
if (nombreClub.value.length > 25) {
  nombreClub.value = nombreClub.value.split(' ')
  for (const part of nombreClub.value) {
    if (part.length > 3) {
      iniciales.value.push(part[0])
    }
  }
  nombreClub.value = iniciales.value.join('')
}
</script>

<template>
  <div class="w-3/4 mx-auto flex justify-center items-center py-6">
    <div class="flex flex-col justify-end items-end">
      <h1 class="text-2xl font-bold capitalize text-primary-600">Rotaract</h1>
      <h4
        class="text-lg font-normal text-shadow-black/50 text-shadow-2xs text-primary-600"
        :class="{ uppercase: iniciales.length > 1, capitalize: iniciales.length === 0 }"
      >
        {{ nombreClub }}
      </h4>
    </div>
    <div class="image-container">
      <img src="../../assets/img/logotipo-1.svg" alt="Ejemplo" />
    </div>
  </div>
</template>
