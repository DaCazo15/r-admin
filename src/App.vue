<script setup>
import { RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import NavBar from './components/NavComponent.vue'
import { useSesionStore } from './stores/useSesionStore'

const sesionStore = useSesionStore()
const { usuario } = storeToRefs(sesionStore)
</script>

<template>
  <NavBar v-if="usuario" />
  <div class="px-5 py-4">
    <RouterView />
  </div>
</template>
