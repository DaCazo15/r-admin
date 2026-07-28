<script setup>
import { useRouter } from 'vue-router'
import { secciones_terminos } from '../../helpers/soporte.js'

const router = useRouter()

const fechaActualizacion = '27 de julio de 2026'
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
          <i class="bi bi-file-text text-xl text-primary-600"></i>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
            Condiciones del Servicio
          </h1>
          <p class="text-xs text-gray-500 mt-0.5">Última actualización: {{ fechaActualizacion }}</p>
        </div>
      </div>
    </div>

    <!-- Tarjeta contenedora -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      <div class="p-5 md:p-6 border-b border-gray-100 bg-gray-50/60">
        <p class="text-sm text-gray-600 leading-relaxed">
          Estas Condiciones del Servicio ("Condiciones") regulan el acceso y uso de R-Admin, el
          panel de administración y gestión del club Rotaract 4370. Te recomendamos leerlas
          detenidamente antes de utilizar el Panel.
        </p>
      </div>

      <div class="divide-y divide-gray-100">
        <section v-for="seccion in secciones_terminos" :key="seccion.titulo" class="p-5 md:p-6">
          <h2 class="flex items-center gap-2.5 text-sm md:text-base font-bold text-gray-900 mb-3">
            <i :class="['bi', seccion.icon, 'text-primary-600 text-lg']"></i>
            {{ seccion.titulo }}
          </h2>
          <div class="space-y-2.5 pl-[1.9rem]">
            <p
              v-for="(parrafo, idx) in seccion.contenido"
              :key="idx"
              class="text-sm text-gray-600 leading-relaxed"
            >
              {{ parrafo }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
