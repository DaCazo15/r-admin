<script setup>
defineProps({
  datosPersona: Object,
  redesRegistradas: Array,
  tieneMasDe4Redes: Boolean
})

const emit = defineEmits(['agregarEmpleo'])
</script>

<template>
  <div class="space-y-8">
    <!-- Sección de Datos Personales -->
    <div class="space-y-4">
      <h3
        class="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100 flex items-center gap-2"
      >
        <i class="bi bi-person-badge text-primary-600"></i>
        Información del Miembro
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-1">
          <span class="text-xs text-gray-400 font-medium uppercase tracking-wider"
            >Nombre Completo</span
          >
          <p class="text-sm font-semibold text-gray-800 capitalize">
            {{ datosPersona?.nombre || '--' }}
          </p>
        </div>

        <div class="space-y-1">
          <span class="text-xs text-gray-400 font-medium uppercase tracking-wider"
            >Correo Electrónico</span
          >
          <p class="text-sm font-semibold text-gray-800">{{ datosPersona?.correo || '--' }}</p>
        </div>

        <div class="space-y-1">
          <span class="text-xs text-gray-400 font-medium uppercase tracking-wider"
            >Número de Teléfono</span
          >
          <p class="text-sm font-semibold text-gray-800">
            {{ datosPersona?.telefono || 'No registrado' }}
          </p>
        </div>

        <div class="space-y-1">
          <span class="text-xs text-gray-400 font-medium uppercase tracking-wider"
            >Ubicación / Residencia</span
          >
          <p class="text-sm font-semibold text-gray-800 capitalize">
            {{ datosPersona?.ubicacion || 'No registrada' }}
          </p>
        </div>

        <div class="space-y-1">
          <span class="text-xs text-gray-400 font-medium uppercase tracking-wider"
            >Fecha de Nacimiento</span
          >
          <p class="text-sm font-semibold text-gray-800">
            {{ datosPersona?.fecha || 'No registrada' }}
          </p>
        </div>

        <div class="space-y-1">
          <span class="text-xs text-gray-400 font-medium uppercase tracking-wider">Edad</span>
          <p class="text-sm font-semibold text-gray-800">
            {{ datosPersona?.edad ? `${datosPersona.edad} años` : 'No registrada' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Sección de Redes Sociales Individuales (si <= 4 redes) -->
    <div v-if="!tieneMasDe4Redes && redesRegistradas.length > 0" class="space-y-4">
      <h3
        class="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100 flex items-center gap-2"
      >
        <i class="bi bi-link-45deg text-primary-600"></i>
        Redes Sociales & Enlaces
      </h3>
      <div class="flex flex-wrap gap-3">
        <a
          v-for="red in redesRegistradas"
          :key="red.tipo"
          :href="red.url"
          target="_blank"
          class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all transform active:scale-95"
          :class="red.color"
        >
          <i class="bi text-base" :class="red.icono"></i>
          {{ red.label }}
        </a>
      </div>
    </div>

    <!-- Sección de Currículum Vitae (CV) -->
    <div v-if="datosPersona?.cvUrl" class="space-y-3">
      <h3
        class="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100 flex items-center gap-2"
      >
        <i class="bi bi-file-earmark-pdf text-primary-600"></i>
        Currículum Vitae
      </h3>
      <div
        class="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl"
      >
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-red-100 text-red-600 rounded-xl">
            <i class="bi bi-file-earmark-pdf-fill text-2xl"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-gray-800">Curriculum_Vitae.pdf</h4>
            <p class="text-xs text-gray-500">Documento profesional adjunto.</p>
          </div>
        </div>
        <a
          :href="datosPersona.cvUrl"
          target="_blank"
          class="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition-all duration-200 active:scale-95"
        >
          <i class="bi bi-download"></i>
          Ver / Descargar CV
        </a>
      </div>
    </div>

    <!-- Sección de Información Laboral -->
    <div class="space-y-4">
      <h3
        class="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100 flex items-center justify-between gap-2"
      >
        <span class="flex items-center gap-2">
          <i class="bi bi-briefcase text-primary-600"></i>
          Experiencia Laboral Actual
        </span>
        <button
          v-if="!datosPersona?.empleo"
          @click="emit('agregarEmpleo')"
          class="cursor-pointer text-xs text-primary-600 hover:text-primary-800 font-bold flex items-center gap-1"
        >
          <i class="bi bi-plus-lg"></i> Agregar Empleo
        </button>
      </h3>

      <div
        v-if="datosPersona?.empleo"
        class="bg-gray-50/60 border border-gray-100 p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div class="flex items-start gap-4">
          <div class="p-3 bg-primary-50 text-primary-600 rounded-xl">
            <i class="bi bi-briefcase-fill text-2xl"></i>
          </div>
          <div class="space-y-1">
            <h4 class="text-base font-bold text-gray-900 capitalize">
              {{ datosPersona.cargo }}
            </h4>
            <p class="text-sm font-semibold text-gray-600 capitalize">
              Empresa: {{ datosPersona.empleo }}
            </p>
            <p class="text-xs text-gray-400 font-medium">
              Desde: {{ datosPersona.fechaInicio || 'No especificada' }}
            </p>
          </div>
        </div>

        <!-- Redes del Empleo -->
        <div v-if="datosPersona?.instagramEmpresa" class="flex items-center gap-2">
          <a
            :href="`https://instagram.com/${datosPersona.instagramEmpresa.replace('@', '')}`"
            target="_blank"
            class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-xs font-semibold text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
          >
            <i class="bi bi-instagram"></i>
            @{{ datosPersona.instagramEmpresa.replace('@', '') }}
          </a>
        </div>
      </div>

      <div v-else class="text-center py-6 text-gray-400 text-sm font-medium">
        <i class="bi bi-building text-3xl block mb-2 text-gray-300"></i>
        No has ingresado información sobre tu empleo actual.
      </div>
    </div>
  </div>
</template>
