<script setup>
defineProps({
  formReporte: Object,
  socios: Array,
  meses: Array,
  isSaving: Boolean,
  exitoReporte: Boolean,
  errorReporteMsg: String
})

const emit = defineEmits(['submit'])
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-base font-bold text-gray-400 uppercase tracking-wider">
      Paso 3: Reporta tu Pago
    </h3>

    <form
      @submit.prevent="emit('submit')"
      class="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-2xs"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Miembro -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >¿Quién realiza el pago?</label
          >
          <select
            v-model="formReporte.nombre"
            required
            class="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all font-medium text-gray-700 cursor-pointer"
          >
            <option value="" disabled>Selecciona tu nombre</option>
            <option v-for="s in socios" :key="s.id" :value="s.nombre">
              {{ s.nombre }}
            </option>
          </select>
        </div>

        <!-- Mes -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >Mes a abonar</label
          >
          <select
            v-model="formReporte.mes"
            required
            class="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all font-medium text-gray-700 cursor-pointer"
          >
            <option value="" disabled>Selecciona el mes</option>
            <option v-for="m in meses" :key="m" :value="m">
              {{ m }}
            </option>
          </select>
        </div>

        <!-- Monto -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >Monto ($)</label
          >
          <input
            type="number"
            v-model="formReporte.monto"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            class="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
          />
        </div>

        <!-- Referencia -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >Número de Referencia</label
          >
          <input
            type="text"
            v-model="formReporte.referencia"
            required
            placeholder="Últimos 4 dígitos o ID de pago"
            class="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all"
          />
        </div>

        <!-- Fecha Pago -->
        <div class="flex flex-col gap-1.5 sm:col-span-2">
          <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
            >Fecha en la que realizaste el pago</label
          >
          <input
            type="date"
            v-model="formReporte.fechaPago"
            required
            class="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-600 transition-all text-gray-700 font-medium cursor-pointer"
          />
        </div>
      </div>

      <!-- Mensaje de Estado -->
      <div
        v-if="exitoReporte"
        class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl flex items-center gap-2 animate-fade-in"
      >
        <i class="bi bi-check-circle-fill text-lg shrink-0"></i>
        <span>¡Reporte de pago enviado con éxito! El tesorero lo validará pronto.</span>
      </div>

      <div
        v-if="errorReporteMsg"
        class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-center gap-2 animate-fade-in"
      >
        <i class="bi bi-exclamation-triangle-fill text-lg shrink-0"></i>
        <span>{{ errorReporteMsg }}</span>
      </div>

      <!-- Botón reportar -->
      <button
        type="submit"
        :disabled="isSaving"
        class="cursor-pointer w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
      >
        <span
          v-if="isSaving"
          class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
        ></span>
        {{ isSaving ? 'Guardando reporte...' : 'Reportar Pago' }}
      </button>
    </form>
  </div>
</template>
