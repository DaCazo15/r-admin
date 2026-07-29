<script setup>
import { ref } from 'vue'

const props = defineProps({
  metodoSeleccionado: Object
})

const copiadoMsg = ref('')

const copiarAlPortapapeles = (texto = null, campo = null) => {
  if (!texto) return
  navigator.clipboard.writeText(texto)
  if (!campo) {
    copiadoMsg.value = 'Copiado al portapapeles'
  } else {
    copiadoMsg.value = `${campo} copiado al portapapeles`
  }
  setTimeout(() => {
    copiadoMsg.value = ''
  }, 2000)
}

const copiarTodo = () => {
  const m = props.metodoSeleccionado
  if (!m) return

  let texto = ''
  if (m.tipo === 'pago_movil') {
    texto = `${m.banco}\n${m.telefono}\n${m.cedula}`
  } else if (m.tipo === 'transferencia') {
    texto = `${m.banco}\n${m.cuenta}\n${m.cedula}\n${m.titular}`
  } else if (m.tipo === 'binance') {
    texto = `${m.binanceId}\n${m.correo}`
  } else if (m.tipo === 'paypal') {
    texto = `Enlace de Pago PayPal: ${m.url}`
  }

  copiarAlPortapapeles(texto, 'Todos los datos')
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-base font-bold text-gray-400 uppercase tracking-wider">
      Paso 2: Copia los Datos de Pago
    </h3>

    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
      <div class="flex items-center gap-2 mb-1">
        <i class="bi bi-info-circle text-primary-600 text-base"></i>
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
          >Haz clic en cualquier valor para copiarlo</span
        >
      </div>

      <!-- Pago Móvil -->
      <div v-if="metodoSeleccionado.tipo === 'pago_movil'" class="space-y-3.5">
        <div
          @click="copiarAlPortapapeles(metodoSeleccionado.banco, 'Banco')"
          class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block">Banco</span>
            <span class="text-sm font-bold text-gray-700">{{ metodoSeleccionado.banco }}</span>
          </div>
          <i class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"></i>
        </div>

        <div
          @click="copiarAlPortapapeles(metodoSeleccionado.telefono, 'Teléfono')"
          class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block">Teléfono</span>
            <span class="text-sm font-bold text-gray-700">{{ metodoSeleccionado.telefono }}</span>
          </div>
          <i class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"></i>
        </div>

        <div
          @click="copiarAlPortapapeles(metodoSeleccionado.cedula, 'Cédula')"
          class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block">Cédula</span>
            <span class="text-sm font-bold text-gray-700">{{ metodoSeleccionado.cedula }}</span>
          </div>
          <i class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"></i>
        </div>
      </div>

      <!-- Transferencia -->
      <div v-if="metodoSeleccionado.tipo === 'transferencia'" class="space-y-3.5">
        <div
          @click="copiarAlPortapapeles(metodoSeleccionado.banco, 'Banco')"
          class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block">Banco</span>
            <span class="text-sm font-bold text-gray-700">{{ metodoSeleccionado.banco }}</span>
          </div>
          <i class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"></i>
        </div>

        <div
          @click="copiarAlPortapapeles(metodoSeleccionado.cuenta, 'Número de Cuenta')"
          class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block"
              >Número de Cuenta</span
            >
            <span class="text-sm font-bold text-gray-700 block truncate">{{
              metodoSeleccionado.cuenta
            }}</span>
          </div>
          <i class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"></i>
        </div>

        <div
          @click="copiarAlPortapapeles(metodoSeleccionado.cedula, 'Cédula/RIF')"
          class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block">Cédula o RIF</span>
            <span class="text-sm font-bold text-gray-700">{{ metodoSeleccionado.cedula }}</span>
          </div>
          <i class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"></i>
        </div>

        <div
          @click="copiarAlPortapapeles(metodoSeleccionado.titular, 'Titular')"
          class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block">Titular</span>
            <span class="text-sm font-bold text-gray-700">{{ metodoSeleccionado.titular }}</span>
          </div>
          <i class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"></i>
        </div>
      </div>

      <!-- Binance -->
      <div v-if="metodoSeleccionado.tipo === 'binance'" class="space-y-3.5">
        <div
          @click="copiarAlPortapapeles(metodoSeleccionado.correo, 'Correo')"
          class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block"
              >Correo Electrónico</span
            >
            <span class="text-sm font-bold text-gray-700">{{ metodoSeleccionado.correo }}</span>
          </div>
          <i class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"></i>
        </div>

        <div
          @click="copiarAlPortapapeles(metodoSeleccionado.binanceId, 'Binance Pay ID')"
          class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block">Binance Pay ID</span>
            <span class="text-sm font-bold text-gray-700">{{ metodoSeleccionado.binanceId }}</span>
          </div>
          <i class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"></i>
        </div>
      </div>

      <!-- PayPal -->
      <div v-if="metodoSeleccionado.tipo === 'paypal'" class="space-y-3.5">
        <div
          class="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl"
        >
          <div>
            <span class="text-[10px] font-bold text-gray-400 uppercase block">Enlace de Pago</span>
            <a
              :href="metodoSeleccionado.url"
              target="_blank"
              class="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
            >
              Ir a PayPal <i class="bi bi-box-arrow-up-right text-xs"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- Copiar Todo -->
      <button
        @click="copiarTodo"
        class="cursor-pointer w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-gray-200 shadow-2xs"
      >
        <i class="bi bi-files"></i>
        Copiar Todos los Datos
      </button>

      <!-- Mensaje Copiado -->
      <div
        v-if="copiadoMsg"
        class="text-center text-xs font-bold text-emerald-600 bg-emerald-50 py-1.5 rounded-lg border border-emerald-100 animate-fade-in"
      >
        {{ copiadoMsg }}
      </div>
    </div>
  </div>
</template>
