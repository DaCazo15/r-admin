<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCollection } from 'vuefire'
import { query, where, collection } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { meses, form } from '@/helpers/list'
import { guardarMovimiento } from '@/services/firebaseService'
import { useEdicion } from '@/composable/useEdicion'
import { useTesoreriaStore } from '@/stores/useTesoreriaStore'
import { useSesionStore } from '@/stores/useSesionStore'
import { CLUB_POR_DEFECTO } from '@/config/constants'
import { storeToRefs } from 'pinia'

const props = defineProps({
  transaccion: Object,
})

const emit = defineEmits(['close'])

const isSaving = ref(false)
const pagoDistrital = ref(false)
const tipoMovimiento = ref('mensualidad')
const { modoEdicion, cancelarEdicion } = useEdicion()
const tesoreriaStore = useTesoreriaStore()

const sesionStore = useSesionStore()
const { rol } = storeToRefs(sesionStore)

const puedeGuardarTesoreria = computed(() => {
  return ['tesorero', 'vicepresidente', 'presidente'].includes(rol.value)
})

const socios = useCollection(() => {
  if (!db) return null
  const userClub = sesionStore.club || CLUB_POR_DEFECTO
  return query(collection(db, 'persona'), where('estatus', '==', 'Socios'), where('club', '==', userClub))
})

const metodosPagoRaw = useCollection(() => {
  const userClub = sesionStore.club || CLUB_POR_DEFECTO
  return query(collection(db, 'metodos_pago'), where('club', '==', userClub))
})

const metodosDisponibles = computed(() => {
  const list = []
  const tiposRegistrados = new Set((metodosPagoRaw.value || []).map((m) => m.tipo))

  if (tiposRegistrados.has('pago_movil')) {
    list.push({ value: 'Pago Móvil', label: 'Pago Móvil' })
  }
  if (tiposRegistrados.has('transferencia')) {
    list.push({ value: 'Transferencia', label: 'Transferencia' })
  }
  if (tiposRegistrados.has('binance')) {
    list.push({ value: 'USDT', label: 'Binance' })
  }
  if (tiposRegistrados.has('paypal')) {
    list.push({ value: 'PayPal', label: 'PayPal' })
  }
  return list
})

const resetForm = () => {
  form.value.nombre = ''
  form.value.descripcion = ''
  form.value.monto = ''
  form.value.referencia = ''
  form.value.fechaPago = new Date().toISOString().split('T')[0]
  form.value.tipoPago = ''
  form.value.tipoMovimiento = ''
  form.value.mes = ''
  pagoDistrital.value = false
}

const cargarDatosSiEdicion = () => {
  if (props.transaccion && props.transaccion.id) {
    const item = props.transaccion
    const tipoOriginal = item.tipoMovimiento?.toLowerCase() || 'mensualidad'
    tipoMovimiento.value = tipoOriginal === 'cuota distrital' ? 'mensualidad' : tipoOriginal
    pagoDistrital.value = tipoOriginal === 'cuota distrital'
    form.value.nombre = item.nombre || ''
    form.value.descripcion = item.descripcion || ''
    form.value.monto = item.monto || ''
    form.value.referencia = item.referencia || ''
    form.value.fechaPago = item.fechaPago || new Date().toISOString().split('T')[0]
    form.value.tipoPago = item.metodoPago || item.tipoPago || ''
    form.value.tipoMovimiento = item.tipoMovimiento || ''
    form.value.mes = item.mes || ''
  } else {
    resetForm()
  }
}

onMounted(() => {
  cargarDatosSiEdicion()
})

watch(
  () => props.transaccion,
  () => {
    cargarDatosSiEdicion()
  },
)

const errorMsg = ref('')

const modal = () => {
  emit('close')
  cancelarEdicion()
  resetForm()
  errorMsg.value = ''
}

const guardarDatos = async () => {
  errorMsg.value = ''
  let res = { ok: true }
  if (modoEdicion.value && props.transaccion?.id) {
    const datosActualizados = {
      tipoMovimiento: pagoDistrital.value ? 'cuota distrital' : tipoMovimiento.value,
      monto: Number(form.value.monto),
      referencia: form.value.referencia || 'N/A',
      fechaPago: form.value.fechaPago,
      metodoPago: form.value.tipoPago,
      estatus: 'revisado',
      club: sesionStore.club || CLUB_POR_DEFECTO,
    }
    if (tipoMovimiento.value === 'mensualidad') {
      datosActualizados.nombre = form.value.nombre
      datosActualizados.mes = form.value.mes
    } else {
      datosActualizados.descripcion = form.value.descripcion
    }
    res = await tesoreriaStore.editarTransaccion(props.transaccion.id, datosActualizados)
  } else {
    const datos = { ...form.value, club: sesionStore.club || CLUB_POR_DEFECTO }
    res = await guardarMovimiento(
      pagoDistrital.value ? 'cuota distrital' : tipoMovimiento.value,
      datos,
      isSaving,
    )
  }

  if (res && !res.ok) {
    errorMsg.value = res.mensaje || 'Error al guardar.'
  } else {
    resetForm()
    modal()
  }
}
const tipoPago = computed(() => {
  if (!pagoDistrital.value) {
    return tipoMovimiento.value.charAt(0).toUpperCase() + tipoMovimiento.value.slice(1)
  }
  return 'cuota distrital'
})
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/50 backdrop-blur-sm"
    @click.self="modal"
  >
    <!-- Contenedor del Modal -->
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all mx-4"
    >
      <!-- Cabecera del Modal -->
      <div
        class="bg-primary-600 px-6 py-4 flex justify-between items-center border-b border-gray-100"
      >
        <h3 class="text-lg font-bold text-gray-50">
          {{ modoEdicion ? 'Editar Transacción' : 'Registrar Transacción' }}
        </h3>
        <button @click="modal" class="cursor-pointer text-gray-50 text-xl font-bold">
          &times;
        </button>
      </div>

      <!-- Selector de Tipo de Movimiento (Tabs - sólo en creación) -->
      <div v-if="!modoEdicion" class="flex border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          @click="tipoMovimiento = 'mensualidad'"
          :class="
            tipoMovimiento === 'mensualidad'
              ? 'border-primary-600 text-primary-600 border-b-2 font-bold'
              : 'text-gray-500'
          "
          class="flex-1 py-3 text-sm font-semibold transition-colors hover:text-primary-600 cursor-pointer"
        >
          Mensualidad
        </button>
        <button
          type="button"
          @click="tipoMovimiento = 'ingreso'"
          :class="
            tipoMovimiento === 'ingreso'
              ? 'border-primary-600 text-primary-600 border-b-2 font-bold'
              : 'text-gray-500'
          "
          class="flex-1 py-3 text-sm font-semibold transition-colors hover:text-primary-600 cursor-pointer"
        >
          Otros Ingresos
        </button>
        <button
          type="button"
          @click="tipoMovimiento = 'egreso'"
          :class="
            tipoMovimiento === 'egreso'
              ? 'border-primary-600 text-primary-600 border-b-2 font-bold'
              : 'text-gray-500'
          "
          class="flex-1 py-3 text-sm font-semibold transition-colors hover:text-primary-600 cursor-pointer"
        >
          Egresos
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="guardarDatos" class="p-6 space-y-4">
        <!-- Vista Mensualidad: Miembro y Mes -->
        <div v-if="['mensualidad', 'cuota distrital'].includes(tipoMovimiento)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Socio / Aspirante</label>
            <select
              v-model="form.nombre"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
            >
              <option value="" disabled selected>Selecciona un miembro...</option>
              <option v-for="socio in socios" :key="socio.id" :value="socio.nombre">
                {{ socio.nombre }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mes correspondiente</label>
            <select
              v-model="form.mes"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white capitalize"
            >
              <option value="" disabled selected>Selecciona un mes...</option>
              <option v-for="m in meses" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>

        <!-- Vista Ingresos/Egresos alternativos: Descripción -->
        <div v-else>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ tipoMovimiento === 'ingreso' ? 'Concepto de Ingreso' : 'Concepto de Egreso' }}
          </label>
          <input
            type="text"
            v-model="form.descripcion"
            required
            :placeholder="
              tipoMovimiento === 'ingreso' ? 'Venta de rifas' : 'Reparación de aire acondicionado'
            "
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
        </div>

        <!-- cuota distrital -->
        <div
          class="flex gap-2 justify-start items-center w-full"
          v-if="tipoMovimiento === 'mensualidad'"
        >
          <label class="block text-sm font-medium text-gray-700 mb-1" for="pagoDistrital"
            >cuota distrital</label
          >
          <input type="checkbox" v-model="pagoDistrital" id="pagoDistrital" />
        </div>
        <!-- Campos Comunes -->
        <div class="grid grid-cols-3 gap-4">
          <!-- Monto -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
            <input
              type="number"
              step="0.01"
              v-model="form.monto"
              required
              placeholder="0.00"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <!-- Tipo de Pago -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
            <select
              v-model="form.tipoPago"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
            >
              <option value="" disabled selected>Método de...</option>
              <option v-for="op in metodosDisponibles" :key="op.value" :value="op.value">
                {{ op.label }}
              </option>
              <option v-if="metodosDisponibles.length === 0" disabled>
                Registra métodos de pago
              </option>
            </select>
          </div>
          <!-- Tipo de Moviemiento -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
            <input
              type="text"
              disabled
              :value="tipoPago"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 bg-white"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- Referencia -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
            <input
              type="text"
              v-model="form.referencia"
              :required="form.tipoPago !== 'Efectivo'"
              placeholder="Nro. de Referencia"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
          <!-- Fecha de Pago -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              v-model="form.fechaPago"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        <div
          v-if="errorMsg"
          class="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium"
        >
          {{ errorMsg }}
        </div>

        <div
          v-if="!puedeGuardarTesoreria"
          class="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium text-center animate-pulse"
        >
          No tienes permisos para registrar o modificar transacciones de Tesorería.
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="modal"
            :disabled="isSaving"
            class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:scale-95 transition-all disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSaving || !puedeGuardarTesoreria"
            class="cursor-pointer px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{
              isSaving
                ? modoEdicion
                  ? 'Actualizando...'
                  : 'Guardando...'
                : modoEdicion
                  ? 'Actualizar'
                  : 'Guardar'
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
