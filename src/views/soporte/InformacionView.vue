<script setup>
import { useRouter } from 'vue-router'
import { tecnologias, enlaces } from '../../helpers/Informacio-app.js'
import { sanitizeUrl } from '@/helpers/security'

const router = useRouter()
const version = '1.1.0'

const enlacesExternos = enlaces.filter((e) => e.href)
const enlacesInternos = enlaces.filter((e) => !e.href)
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto max-w-3xl sm:pt-10 pt-14 pb-12">
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
          <i class="bi bi-info-circle text-xl text-primary-600"></i>
        </div>
        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Información</h1>
          <p class="text-xs text-gray-500 mt-0.5">Acerca de R-Admin</p>
        </div>
      </div>
    </div>

    <!-- Tarjeta de identidad -->
    <div
      class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-5 p-6 flex flex-col items-center text-center"
    >
      <img src="../../assets/img/logotipo-1.svg" alt="R-Admin" class="h-14 w-auto mb-4" />
      <h2 class="text-lg font-bold text-gray-900">R-Admin</h2>
      <p class="text-xs text-gray-400 mt-1">Versión {{ version }}</p>
      <p class="text-sm text-gray-600 leading-relaxed mt-4 max-w-md">
        Panel de administración y gestión desarrollado para los clubes del distrito 4370, orientado
        a simplificar la organización de miembros, actividades, finanzas y calendario del club.
      </p>
    </div>

    <!-- Seguridad y Cumplimiento -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-5">
      <div class="flex items-center gap-2.5 px-5 md:px-6 py-4 border-b border-gray-100">
        <i class="bi bi-shield-check text-primary-600 text-lg"></i>
        <h2 class="text-sm md:text-base font-bold text-gray-900">Seguridad & Cumplimiento</h2>
      </div>
      <div class="p-5 md:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
              <i class="bi bi-patch-check-fill text-xl"></i>
            </div>
            <div>
              <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Protección DOM-based XSS (CWE-79)</h4>
              <p class="text-xs text-emerald-600/90 mt-0.5 leading-relaxed">
                Todas las entradas dinámicas de URL se sanitizan rigurosamente para evitar la ejecución de payloads javascript y ataques de inyección.
              </p>
            </div>
          </div>
          <span class="px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 rounded-full self-start sm:self-center">
            Activo
          </span>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-blue-100 text-blue-700 rounded-xl shrink-0">
              <i class="bi bi-lock-fill text-xl"></i>
            </div>
            <div>
              <h4 class="text-xs font-bold text-blue-800 uppercase tracking-wider">Control de Acceso OWASP A01</h4>
              <p class="text-xs text-blue-600/90 mt-0.5 leading-relaxed">
                Se imponen guardas de navegación en rutas del cliente y restricciones de visibilidad basadas en roles administrativos.
              </p>
            </div>
          </div>
          <span class="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 rounded-full self-start sm:self-center">
            Verificado
          </span>
        </div>
      </div>
    </div>

    <!-- Tecnologías -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-5">
      <div class="flex items-center gap-2.5 px-5 md:px-6 py-4 border-b border-gray-100">
        <i class="bi bi-tools text-primary-600 text-lg"></i>
        <h2 class="text-sm md:text-base font-bold text-gray-900">Tecnologías utilizadas</h2>
      </div>
      <div class="p-5 md:p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div
          v-for="tech in tecnologias"
          :key="tech.nombre"
          class="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100"
        >
          <i :class="['bi', tech.icon, 'text-primary-600']"></i>
          <span class="text-xs font-medium text-gray-700">{{ tech.nombre }}</span>
        </div>
      </div>
    </div>

    <!-- Enlaces relacionados -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      <div class="flex items-center gap-2.5 px-5 md:px-6 py-4 border-b border-gray-100">
        <i class="bi bi-link-45deg text-primary-600 text-lg"></i>
        <h2 class="text-sm md:text-base font-bold text-gray-900">Enlaces relacionados</h2>
      </div>
      <div class="divide-y divide-gray-100">
        <a
          v-for="enlace in enlacesExternos"
          :key="enlace.titulo"
          :href="sanitizeUrl(enlace.href)"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full flex items-center gap-3 px-5 md:px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all group"
        >
          <i :class="['bi', enlace.icon, 'text-gray-400 group-hover:text-primary-600 text-lg']"></i>
          <span>{{ enlace.titulo }}</span>
          <i
            class="bi bi-box-arrow-up-right text-xs text-gray-300 ml-auto group-hover:text-primary-400"
          ></i>
        </a>
        <button
          v-for="enlace in enlacesInternos"
          :key="enlace.titulo"
          type="button"
          @click="router.push({ name: enlace.ruta })"
          class="w-full cursor-pointer flex items-center gap-3 px-5 md:px-6 py-3.5 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all group"
        >
          <i :class="['bi', enlace.icon, 'text-gray-400 group-hover:text-primary-600 text-lg']"></i>
          <span>{{ enlace.titulo }}</span>
          <i
            class="bi bi-chevron-right text-xs text-gray-300 ml-auto group-hover:text-primary-400"
          ></i>
        </button>
      </div>
    </div>
  </div>
</template>
