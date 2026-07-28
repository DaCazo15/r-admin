<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { categorias_ayuda, canales } from '../../helpers/soporte.js'

const router = useRouter()

// Guardamos la pregunta abierta como "categoriaIndex-preguntaIndex"
// para que solo un ítem se expanda a la vez dentro de cada categoría.
const abierta = ref(null)

const toggle = (id) => {
  abierta.value = abierta.value === id ? null : id
}
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto max-w-3xl sm:pt-10 pt-14">
    <!-- Encabezado -->
    <div class="mb-6">
      <button
        type="button"
        @click="router.back()"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors cursor-pointer mb-4"
      >
        <i class="bi bi-arrow-left text-xl sm:text-lg"></i>
        Volver
      </button>

      <div class="flex items-center gap-3">
        <div
          class="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100"
        >
          <i class="bi bi-question-circle text-xl text-primary-600"></i>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Centro de Ayuda</h1>
          <p class="text-xs text-gray-500 mt-0.5">Resuelve tus dudas sobre el uso del Panel</p>
        </div>
      </div>
    </div>

    <!-- Intro -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-6">
      <div class="p-5 md:p-6 bg-gray-50/60">
        <p class="text-sm text-gray-600 leading-relaxed">
          Encuentra respuestas rápidas a las preguntas más frecuentes sobre R-Admin, el panel de
          administración y gestión del club Rotaract 4370. Si no encuentras lo que buscas, puedes
          contactarnos directamente más abajo.
        </p>
      </div>
    </div>

    <!-- FAQ por categorías -->
    <div class="space-y-5">
      <div
        v-for="(categoria, ci) in categorias_ayuda"
        :key="categoria.titulo"
        class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden"
      >
        <div class="flex items-center gap-2.5 px-5 md:px-6 py-4 border-b border-gray-100">
          <i :class="['bi', categoria.icon, 'text-primary-600 text-lg']"></i>
          <h2 class="text-sm md:text-base font-bold text-gray-900">{{ categoria.titulo }}</h2>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-for="(item, pi) in categoria.preguntas" :key="item.pregunta">
            <button
              type="button"
              @click="toggle(`${ci}-${pi}`)"
              class="w-full flex items-center justify-between gap-3 px-5 md:px-6 py-4 text-left cursor-pointer hover:bg-gray-50/80 transition-colors"
            >
              <span class="text-sm font-semibold text-gray-800">{{ item.pregunta }}</span>
              <i
                class="bi bi-chevron-down text-gray-400 text-sm shrink-0 transition-transform duration-200"
                :class="{ 'rotate-180 text-primary-600': abierta === `${ci}-${pi}` }"
              ></i>
            </button>

            <div v-show="abierta === `${ci}-${pi}`" class="px-5 md:px-6 pb-4 -mt-1">
              <p class="text-sm text-gray-600 leading-relaxed pr-6">{{ item.respuesta }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Canales de contacto -->
    <div class="mt-8">
      <h3 class="text-sm font-bold text-gray-900 mb-3 px-1">¿Necesitas más ayuda?</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          v-for="canal in canales"
          :key="canal.titulo"
          :href="canal.href"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col gap-2 hover:border-primary-200 hover:shadow-sm transition-all"
        >
          <div
            class="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center border border-primary-100"
          >
            <i :class="['bi', canal.icon, 'text-primary-600']"></i>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-800">{{ canal.titulo }}</p>
            <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ canal.descripcion }}</p>
          </div>
          <span class="text-xs font-semibold text-primary-600 mt-1">
            {{ canal.accion }}
            <i class="bi bi-arrow-right ml-0.5"></i>
          </span>
        </a>
      </div>
    </div>
  </div>
</template>
