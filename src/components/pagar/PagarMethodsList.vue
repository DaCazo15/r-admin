<script setup>
defineProps({
  metodos: Array,
  metodoSeleccionado: Object
})

const emit = defineEmits(['select'])
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-base font-bold text-gray-400 uppercase tracking-wider">
      Paso 1: Selecciona el Método de Pago
    </h3>

    <div
      v-if="metodos.length === 0"
      class="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300"
    >
      <i class="bi bi-credit-card text-5xl text-gray-300 block mb-3"></i>
      <p class="text-gray-500 font-semibold text-sm">
        No se han registrado métodos de pago todavía.
      </p>
      <p class="text-gray-400 text-xs mt-1">
        Comunícate con el administrador para que configure las opciones de pago.
      </p>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <button
        v-for="m in metodos"
        :key="m.id"
        @click="emit('select', m)"
        class="cursor-pointer text-left p-5 rounded-2xl border-2 transition-all flex flex-col justify-between h-36 relative overflow-hidden"
        :class="[
          metodoSeleccionado?.id === m.id
            ? 'border-primary-600 bg-primary-50/20 ring-1 ring-primary-600'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md',
        ]"
      >
        <div class="flex justify-between items-start w-full">
          <span
            class="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full"
            :class="{
              'bg-pink-100 text-pink-700': m.tipo === 'pago_movil',
              'bg-blue-100 text-blue-700': m.tipo === 'transferencia',
              'bg-amber-100 text-amber-700': m.tipo === 'binance',
              'bg-indigo-100 text-indigo-700': m.tipo === 'paypal',
            }"
          >
            {{ m.tipo.replace('_', ' ') }}
          </span>

          <i
            class="bi text-xl"
            :class="{
              'bi-phone-fill text-pink-600': m.tipo === 'pago_movil',
              'bi-bank2 text-blue-600': m.tipo === 'transferencia',
              'bi-currency-exchange text-amber-600': m.tipo === 'binance',
              'bi-paypal text-indigo-600': m.tipo === 'paypal',
            }"
          ></i>
        </div>

        <div class="mt-4">
          <h4 class="font-bold text-gray-800 text-sm truncate">
            <span v-if="m.tipo === 'pago_movil'">{{ m.banco }}</span>
            <span v-else-if="m.tipo === 'transferencia'">{{ m.banco }}</span>
            <span v-else-if="m.tipo === 'binance'">Binance Pay</span>
            <span v-else-if="m.tipo === 'paypal'">PayPal</span>
          </h4>
          <p class="text-xs text-gray-500 truncate mt-0.5">
            <span v-if="m.tipo === 'pago_movil'">{{ m.telefono }}</span>
            <span v-else-if="m.tipo === 'transferencia'">{{ m.titular }}</span>
            <span v-else-if="m.tipo === 'binance'">{{ m.correo }}</span>
            <span v-else-if="m.tipo === 'paypal'">Enlace directo</span>
          </p>
        </div>

        <div
          v-if="metodoSeleccionado?.id === m.id"
          class="absolute top-0 right-0 w-8 h-8 bg-primary-600 text-white flex items-center justify-center rounded-bl-xl shadow-sm"
        >
          <i class="bi bi-check-lg text-sm font-extrabold"></i>
        </div>
      </button>
    </div>
  </div>
</template>
