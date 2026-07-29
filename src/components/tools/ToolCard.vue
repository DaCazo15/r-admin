<script setup>
import { computed } from 'vue'
import { sanitizeUrl, sanitizeWebUrl } from '@/helpers/security'
import { db } from '@/config/firebase'
import { collection, query, where } from 'firebase/firestore'
import { useCollection } from 'vuefire'

const props = defineProps({
  tool: {
    type: Object,
    required: true,
  },
})

const personaResultados = useCollection(() => {
  if (!props.tool.desarrolladorPrincipal) return null
  return query(collection(db, 'persona'), where('nombre', '==', props.tool.desarrolladorPrincipal))
})

const clubDesarrollador = computed(() => {
  if (personaResultados.value && personaResultados.value.length > 0) {
    return personaResultados.value[0].club
  }
  return 'Sin Club'
})

const nombreClub = computed(() => {
  if (clubDesarrollador.value && clubDesarrollador.value.toLowerCase().includes('rotaract')) {
    return clubDesarrollador.value.split(' ').slice(1).join(' ')
  } else {
    return clubDesarrollador.value
  }
})
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
  <div
    class="relative group bg-white border border-gray-200 rounded-2xl p-5 shadow-xs transition-all duration-300 hover:shadow-md flex flex-col justify-between gap-4 hover:border-primary-200"
  >
    <!-- Cuerpo de la tarjeta -->
    <div class="space-y-2.5">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-base font-bold text-gray-900 truncate pr-4 capitalize" :title="tool.nombre">
          {{ tool.nombre }}
        </h3>
        <span
          class="text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100 uppercase tracking-wider"
        >
          {{ clubDesarrollador }}
        </span>
      </div>

      <!-- Desarrolladores -->
      <div class="space-y-1">
        <span class="text-[10px] text-gray-400 font-bold uppercase tracking-wider block"
          >Desarrollado por</span
        >
        <p class="text-xs font-semibold text-gray-700 capitalize">
          <i class="bi bi-person-fill text-gray-400 mr-1"></i>
          {{ tool.desarrolladorPrincipal }}
        </p>
        <p
          v-if="tool.esEquipo && tool.equipoNombres"
          class="text-[11px] font-medium text-gray-500 pl-4 border-l-2 border-gray-100 italic capitalize"
        >
          Colaboradores: {{ tool.equipoNombres }}
        </p>
      </div>
    </div>

    <!-- Botones de Acción de la Tarjeta -->
    <div class="flex items-center gap-2 pt-3 border-t border-gray-100">
      <a
        :href="sanitizeUrl(tool.urlWeb)"
        target="_blank"
        class="flex-1 cursor-pointer inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs transition-all active:scale-[0.97]"
      >
        <i class="bi bi-box-arrow-up-right"></i>
        Visitar Web
      </a>
      <a
        v-if="tool.repositorio"
        :href="sanitizeUrl(tool.repositorio)"
        target="_blank"
        class="cursor-pointer inline-flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs transition-all active:scale-90 border border-gray-200"
        title="Ver Repositorio"
      >
        <i class="bi bi-github text-base"></i>
      </a>
    </div>

    <!-- VISTA PREVIA FLOTANTE EN HOVER -->
    <div
      class="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-84 h-57.5 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-2 z-50 flex flex-col pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100"
    >
      <!-- Barra superior de navegador mockup -->
      <div class="flex items-center justify-between gap-2 px-1 pb-2 border-b border-gray-800">
        <!-- Botones tipo mac -->
        <div class="flex gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
        </div>
        <!-- Dirección web reducida -->
        <div
          class="flex-1 max-w-50 text-[9px] text-gray-400 bg-gray-800 rounded py-0.5 px-2 text-center truncate font-mono"
        >
          {{ tool.urlWeb }}
        </div>
      </div>

      <!-- Contenedor del Iframe con escala reducida -->
      <div class="relative w-full h-45 mt-1.5 overflow-hidden rounded-md bg-gray-950">
        <iframe
          v-if="sanitizeWebUrl(tool.urlWeb) !== '#'"
          :src="sanitizeWebUrl(tool.urlWeb)"
          class="absolute top-0 left-0 w-105 h-57.5 border-0 select-none pointer-events-none scale-75 origin-top-left"
        ></iframe>
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-[10px] text-gray-500 font-semibold font-mono"
        >
          Vista previa no disponible
        </div>
      </div>
    </div>
  </div>
</template>
