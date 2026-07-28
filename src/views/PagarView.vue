<script setup>
import { ref, computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { guardarMovimiento } from '@/services/firebaseService'

const metodos = useCollection(collection(db, 'metodos_pago'))
const socios = useCollection(
  query(collection(db, 'persona'), where('estatus', 'in', ['Socios', 'Aspirantes'])),
)

const metodoSeleccionado = ref(null)
const copiadoMsg = ref('')
const isSaving = ref(false)
const exitoReporte = ref(false)
const errorReporteMsg = ref('')

const formReporte = ref({
  nombre: '',
  mes: '',
  monto: '',
  referencia: '',
  fechaPago: new Date().toISOString().split('T')[0],
})

const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const seleccionarMetodo = (m) => {
  metodoSeleccionado.value = m
  exitoReporte.value = false
  errorReporteMsg.value = ''
}

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
  const m = metodoSeleccionado.value
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

const mapearMetodoPago = (tipo) => {
  if (tipo === 'pago_movil') return 'Pago Móvil'
  if (tipo === 'transferencia') return 'Transferencia'
  if (tipo === 'binance') return 'USDT'
  if (tipo === 'paypal') return 'PayPal'
  return 'Otro'
}

const enviarReporte = async () => {
  if (
    !formReporte.value.nombre ||
    !formReporte.value.mes ||
    !formReporte.value.monto ||
    !formReporte.value.referencia
  ) {
    errorReporteMsg.value = 'Todos los campos son obligatorios para reportar el pago.'
    return
  }

  errorReporteMsg.value = ''
  exitoReporte.value = false

  const datos = {
    nombre: formReporte.value.nombre,
    mes: formReporte.value.mes,
    monto: Number(formReporte.value.monto),
    referencia: formReporte.value.referencia.trim(),
    fechaPago: formReporte.value.fechaPago,
    tipoPago: mapearMetodoPago(metodoSeleccionado.value.tipo),
  }

  const res = await guardarMovimiento('mensualidad', datos, isSaving)

  if (res.ok) {
    exitoReporte.value = true
    formReporte.value.nombre = ''
    formReporte.value.mes = ''
    formReporte.value.monto = ''
    formReporte.value.referencia = ''
    formReporte.value.fechaPago = new Date().toISOString().split('T')[0]
  } else {
    errorReporteMsg.value = res.mensaje || 'Error al guardar el reporte.'
  }
}
</script>

<template>
  <main class="w-[92%] sm:w-11/12 md:w-[94%] mx-auto mt-6">
    <div class="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-8">
      <div class="text-center space-y-2">
        <h2 class="text-2xl md:text-3xl font-extrabold text-gray-800">Centro de Pagos</h2>
        <p class="text-sm md:text-base text-gray-500 max-w-xl mx-auto">
          Sigue las instrucciones guiadas para realizar tu pago de forma rápida, segura y sin
          confusiones.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="flex gap-4">
          <div
            class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 shrink-0 animate-pulse"
          >
            1
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-gray-800 text-sm md:text-base">Selecciona un método</h4>
            <p class="text-xs text-gray-500">
              Elige la opción que mejor se adapte a tus necesidades de pago.
            </p>
          </div>
        </div>
        <div class="flex gap-4">
          <div
            class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 shrink-0"
          >
            2
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-gray-800 text-sm md:text-base">Copia los datos</h4>
            <p class="text-xs text-gray-500">
              Toca cualquier dato de la cuenta o usa "Copiar todo" para guardarlo en tu
              portapapeles.
            </p>
          </div>
        </div>
        <div class="flex gap-4">
          <div
            class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 shrink-0"
          >
            3
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-gray-800 text-sm md:text-base">Reporta tu pago</h4>
            <p class="text-xs text-gray-500">
              Registra el número de referencia aquí mismo para notificar al administrador.
            </p>
          </div>
        </div>
      </div>

      <div class="h-px bg-gray-200"></div>

      <div>
        <h3 class="text-base font-bold text-gray-400 uppercase tracking-wider mb-4">
          Paso 1: Elige el Método de Pago
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
            @click="seleccionarMetodo(m)"
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

      <div
        v-if="metodoSeleccionado"
        class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fade-in"
      >
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

            <div v-if="metodoSeleccionado.tipo === 'pago_movil'" class="space-y-3.5">
              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.banco, 'Banco')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block">Banco</span>
                  <span class="text-sm font-bold text-gray-700">{{
                    metodoSeleccionado.banco
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>

              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.telefono, 'Teléfono')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block">Teléfono</span>
                  <span class="text-sm font-bold text-gray-700">{{
                    metodoSeleccionado.telefono
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>

              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.cedula, 'Cédula')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block">Cédula</span>
                  <span class="text-sm font-bold text-gray-700">{{
                    metodoSeleccionado.cedula
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>
            </div>

            <div v-if="metodoSeleccionado.tipo === 'transferencia'" class="space-y-3.5">
              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.banco, 'Banco')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block">Banco</span>
                  <span class="text-sm font-bold text-gray-700">{{
                    metodoSeleccionado.banco
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>

              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.cuenta, 'Número de Cuenta')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block"
                    >Número de Cuenta</span
                  >
                  <span class="text-sm font-bold text-gray-700 block select-all break-all">{{
                    metodoSeleccionado.cuenta
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>

              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.cedula, 'RIF / Cédula')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block"
                    >Cédula / RIF</span
                  >
                  <span class="text-sm font-bold text-gray-700">{{
                    metodoSeleccionado.cedula
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>

              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.titular, 'Nombre del Titular')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block">Titular</span>
                  <span class="text-sm font-bold text-gray-700">{{
                    metodoSeleccionado.titular
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>
            </div>

            <div v-if="metodoSeleccionado.tipo === 'binance'" class="space-y-3.5">
              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.correo, 'Correo')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block"
                    >Correo Electrónico</span
                  >
                  <span class="text-sm font-bold text-gray-700">{{
                    metodoSeleccionado.correo
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>

              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.binanceId, 'Binance Pay ID')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block"
                    >Binance Pay ID</span
                  >
                  <span class="text-sm font-bold text-gray-700">{{
                    metodoSeleccionado.binanceId
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>
            </div>

            <div v-if="metodoSeleccionado.tipo === 'paypal'" class="space-y-3.5">
              <div
                class="flex justify-between items-center bg-white border border-gray-200 p-3 rounded-xl"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block"
                    >Enlace de Pago</span
                  >
                  <a
                    :href="metodoSeleccionado.url"
                    target="_blank"
                    class="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    Ir a PayPal
                    <i class="bi bi-box-arrow-up-right text-xs"></i>
                  </a>
                </div>
              </div>

              <div
                @click="copiarAlPortapapeles(metodoSeleccionado.url, 'Enlace')"
                class="flex justify-between items-center bg-white border border-gray-200 hover:border-primary-500 p-3 rounded-xl cursor-pointer group transition-all"
              >
                <div>
                  <span class="text-[10px] font-bold text-gray-400 uppercase block"
                    >Copiar Enlace</span
                  >
                  <span class="text-xs font-semibold text-gray-500 truncate block max-w-sm">{{
                    metodoSeleccionado.url
                  }}</span>
                </div>
                <i
                  class="bi bi-copy text-gray-400 group-hover:text-primary-600 transition-colors"
                ></i>
              </div>
            </div>

            <button
              @click="copiarTodo"
              class="cursor-pointer w-full flex justify-center items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold p-3 rounded-xl transition-all shadow-md active:scale-95 text-sm uppercase tracking-wider"
            >
              <i class="bi bi-clipboard-check text-base"></i>
              Copiar todo
            </button>
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-base font-bold text-gray-400 uppercase tracking-wider">
            Paso 3: Registra tu Reporte
          </h3>

          <div
            v-if="exitoReporte"
            class="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center space-y-3 shadow-xs"
          >
            <i class="bi bi-check-circle-fill text-4xl text-emerald-600 block"></i>
            <h4 class="font-bold text-sm md:text-base">¡Reporte Enviado con Éxito!</h4>
            <p class="text-xs text-emerald-600">
              El administrador de tesorería se encargará de verificar el pago a la brevedad. Puedes
              realizar otra transacción seleccionando de nuevo un método.
            </p>
          </div>

          <form
            v-else
            @submit.prevent="enviarReporte"
            class="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4"
          >
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Tu Nombre / Miembro</label
                >
                <select
                  v-model="formReporte.nombre"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
                >
                  <option value="" disabled selected>Selecciona tu nombre...</option>
                  <option v-for="socio in socios" :key="socio.id" :value="socio.nombre">
                    {{ socio.nombre }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Mes correspondiente</label
                >
                <select
                  v-model="formReporte.mes"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white capitalize"
                >
                  <option value="" disabled selected>Selecciona el mes...</option>
                  <option v-for="m in meses" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                    >Monto Pagado ($)</label
                  >
                  <input
                    type="number"
                    step="0.01"
                    v-model="formReporte.monto"
                    required
                    placeholder="0.00"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                    >Fecha de Pago</label
                  >
                  <input
                    type="date"
                    v-model="formReporte.fechaPago"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Número de Referencia</label
                >
                <input
                  type="text"
                  v-model="formReporte.referencia"
                  required
                  placeholder="Ej. 123456"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white text-sm"
                />
              </div>
            </div>

            <div
              v-if="errorReporteMsg"
              class="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium"
            >
              {{ errorReporteMsg }}
            </div>

            <button
              type="submit"
              :disabled="isSaving"
              class="cursor-pointer w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl transition-all shadow-md active:scale-95 text-sm uppercase tracking-wider"
            >
              <i v-if="isSaving" class="bi bi-arrow-clockwise animate-spin text-base"></i>
              <i v-else class="bi bi-send text-base"></i>
              Enviar Reporte
            </button>
          </form>
        </div>
      </div>
    </div>

    <div
      v-if="copiadoMsg"
      class="fixed bottom-6 right-6 z-50 bg-gray-800 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce"
    >
      <i class="bi bi-check-circle-fill text-emerald-500 text-base"></i>
      {{ copiadoMsg }}
    </div>
  </main>
</template>
