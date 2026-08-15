<script setup>
import { ref, computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { CLUB_POR_DEFECTO } from '@/config/constants'
import { guardarMovimiento } from '@/services/firebaseService'
import { useSesionStore } from '@/stores/useSesionStore'

// Subcomponentes modulares de presentación
import PagarMethodsList from '@/components/pagar/PagarMethodsList.vue'
import PagarMethodDetails from '@/components/pagar/PagarMethodDetails.vue'
import PagarReportForm from '@/components/pagar/PagarReportForm.vue'

const sesionStore = useSesionStore()

const metodos = useCollection(() => {
  const userClub = sesionStore.club || CLUB_POR_DEFECTO
  return query(collection(db, 'metodos_pago'), where('club', '==', userClub))
})

const socios = useCollection(() => {
  const userClub = sesionStore.club || CLUB_POR_DEFECTO
  return query(
    collection(db, 'persona'),
    where('estatus', 'in', ['Socios', 'Aspirantes']),
    where('club', '==', userClub),
  )
})

const metodoSeleccionado = ref(null)
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
    club: sesionStore.club || CLUB_POR_DEFECTO,
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
  <main class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-6">
    <!-- Encabezado -->
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
            class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 shrink-0"
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

      <!-- Paso 1: Selección de método de pago -->
      <PagarMethodsList
        :metodos="metodos"
        :metodo-seleccionado="metodoSeleccionado"
        @select="seleccionarMetodo"
      />

      <!-- Paso 2 y 3: Detalle de pago y Reporte (Si hay seleccionado) -->
      <div
        v-if="metodoSeleccionado"
        class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-fade-in"
      >
        <!-- Detalles -->
        <PagarMethodDetails :metodo-seleccionado="metodoSeleccionado" />

        <!-- Reportar Pago -->
        <PagarReportForm
          :form-reporte="formReporte"
          :socios="socios"
          :meses="meses"
          :is-saving="isSaving"
          :exito-reporte="exitoReporte"
          :error-reporte-msg="errorReporteMsg"
          @submit="enviarReporte"
        />
      </div>
    </div>
  </main>
</template>
