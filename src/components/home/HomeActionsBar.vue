<script setup>
defineProps({
  estatus: String,
  puedeAgregarPersona: Boolean,
  puedeModificarPassEstandar: Boolean,
  buscador: String,
  filtro: Boolean,
  metricasOn: Boolean,
  isUpdating: Boolean,
  mensajeExito: Boolean
})

const emit = defineEmits([
  'addPersona',
  'openModalPass',
  'update:buscador',
  'search',
  'toggleFiltro',
  'actualizarClub'
])
</script>

<template>
  <div
    class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-3 flex flex-col sm:flex-row justify-center items-center gap-2"
  >
    <!-- Agregar Persona -->
    <button
      @click="emit('addPersona')"
      v-if="estatus !== 'Tesoreria' && puedeAgregarPersona"
      class="cursor-pointer px-3 py-2 w-full gap-2 flex flex-row justify-center items-center text-primary-600 hover:text-white font-medium border-2 border-primary-600 hover:bg-primary-600 rounded-lg ease-in-out duration-300 active:scale-95 transition-all"
    >
      <i class="bi bi-plus-lg"></i>
      Agregar Persona
    </button>

    <!-- Password Estandar -->
    <button
      @click="emit('openModalPass')"
      v-if="estatus === 'Socios' && puedeModificarPassEstandar"
      class="cursor-pointer px-3 py-2 w-full gap-2 flex flex-row justify-center items-center text-primary-600 hover:text-white font-medium border-2 border-primary-600 hover:bg-primary-600 rounded-lg ease-in-out duration-300 active:scale-95 transition-all"
    >
      <i class="bi bi-shield-lock-fill"></i>
      Password Estandar
    </button>

    <!-- Buscador -->
    <div v-if="!metricasOn" class="flex justify-center items-center gap-2 w-full">
      <input
        :value="buscador"
        @input="emit('update:buscador', $event.target.value)"
        @keyup.enter="emit('search')"
        type="text"
        placeholder="Buscar"
        class="w-full px-5 py-2 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
      />
      <button
        @click="emit('search')"
        class="cursor-pointer px-2.5 py-1.5 text-white font-bold border-primary-600 border-2 bg-primary-600 rounded-lg ease-in-out duration-200 active:scale-90 transition-all"
      >
        <i class="bi bi-search"></i>
      </button>
      <button
        v-if="estatus === 'Tesoreria'"
        @click="emit('toggleFiltro')"
        :class="{
          'bg-primary-600/80 text-white': filtro,
          'text-white': !filtro,
        }"
        class="cursor-pointer px-2.5 py-1.5 border-primary-600 border-2 font-bold bg-primary-600 rounded-lg ease-in-out duration-200 active:scale-90 transition-all"
      >
        <i class="bi bi-funnel-fill"></i>
      </button>
    </div>

    <!-- Sincronización del Club -->
    <div v-if="metricasOn" class="flex flex-col items-center gap-2 w-full">
      <button
        @click="emit('actualizarClub')"
        :disabled="isUpdating"
        class="cursor-pointer px-3 py-3 w-full flex flex-row justify-center items-center font-medium border-2 rounded-lg ease-in-out duration-300 active:scale-98 transition-all shadow-xs"
        :class="[
          mensajeExito
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'text-primary-600 border-primary-600 hover:text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed',
        ]"
      >
        <i
          class="bi"
          :class="[
            isUpdating
              ? 'bi-arrow-clockwise animate-spin text-lg mr-2'
              : mensajeExito
                ? 'bi-check-circle-fill text-lg mr-2'
                : 'bi-arrow-clockwise text-lg mr-2',
          ]"
        ></i>
        <span>
          {{
            isUpdating
              ? 'Actualizando estado del club...'
              : mensajeExito
                ? '¡Estado actualizado correctamente!'
                : 'Actualizar Estado del Club'
          }}
        </span>
      </button>
    </div>
  </div>
</template>
