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
import BaseModal from '../ui/BaseModal.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'

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
  <BaseModal
    :show="true"
    :title="modoEdicion ? 'Editar Transacción' : 'Registrar Transacción'"
    @close="modal"
  >
    <!-- Selector de Tipo de Movimiento (Tabs - sólo en creación) -->
    <div v-if="!modoEdicion" class="flex border-b border-gray-200 bg-gray-50 mb-4 rounded-lg overflow-hidden">
      <button
        type="button"
        @click="tipoMovimiento = 'mensualidad'"
        :class="
          tipoMovimiento === 'mensualidad'
            ? 'border-primary-600 text-primary-600 border-b-2 font-bold bg-white'
            : 'text-gray-500'
        "
        class="flex-1 py-2.5 text-sm font-semibold transition-colors hover:text-primary-600 cursor-pointer"
      >
        Mensualidad
      </button>
      <button
        type="button"
        @click="tipoMovimiento = 'ingreso'"
        :class="
          tipoMovimiento === 'ingreso'
            ? 'border-primary-600 text-primary-600 border-b-2 font-bold bg-white'
            : 'text-gray-500'
        "
        class="flex-1 py-2.5 text-sm font-semibold transition-colors hover:text-primary-600 cursor-pointer"
      >
        Otros Ingresos
      </button>
      <button
        type="button"
        @click="tipoMovimiento = 'egreso'"
        :class="
          tipoMovimiento === 'egreso'
            ? 'border-primary-600 text-primary-600 border-b-2 font-bold bg-white'
            : 'text-gray-500'
        "
        class="flex-1 py-2.5 text-sm font-semibold transition-colors hover:text-primary-600 cursor-pointer"
      >
        Egresos
      </button>
    </div>

    <!-- Formulario -->
    <form @submit.prevent="guardarDatos" id="tesoreriaForm" class="space-y-4">
      <!-- Vista Mensualidad: Miembro y Mes -->
      <div v-if="['mensualidad', 'cuota distrital'].includes(tipoMovimiento)" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Socio / Aspirante</label>
          <select
            v-model="form.nombre"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600/50 bg-white"
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
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600/50 bg-white capitalize"
          >
            <option value="" disabled selected>Selecciona un mes...</option>
            <option v-for="m in meses" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
      </div>

      <!-- Vista Ingresos/Egresos alternativos: Descripción -->
      <div v-else>
        <BaseInput
          id="descripcion"
          :label="tipoMovimiento === 'ingreso' ? 'Concepto de Ingreso' : 'Concepto de Egreso'"
          v-model="form.descripcion"
          required
        />
      </div>

      <!-- Cuota distrital checkbox -->
      <div
        class="flex gap-2 justify-start items-center w-full"
        v-if="tipoMovimiento === 'mensualidad'"
      >
        <input type="checkbox" v-model="pagoDistrital" id="pagoDistrital" class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600/50" />
        <label class="block text-sm font-medium text-gray-700 select-none" for="pagoDistrital">Cuota distrital</label>
      </div>

      <!-- Campos Comunes -->
      <div class="grid grid-cols-3 gap-4">
        <!-- Monto -->
        <BaseInput
          id="monto"
          type="number"
          label="Monto ($)"
          step="0.01"
          v-model="form.monto"
          required
        />
        
        <!-- Tipo de Pago -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
          <select
            v-model="form.tipoPago"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-600/50 bg-white"
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
        
        <!-- Tipo de Moviemiento (disabled) -->
        <BaseInput
          id="tipoMovimientoDisplay"
          label="Tipo Mov."
          :model-value="tipoPago"
          disabled
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- Referencia -->
        <BaseInput
          id="referencia"
          label="Referencia"
          v-model="form.referencia"
          :required="form.tipoPago !== 'Efectivo'"
        />
        <!-- Fecha de Pago -->
        <BaseInput
          id="fechaPago"
          type="date"
          label="Fecha"
          v-model="form.fechaPago"
          required
        />
      </div>

      <p v-if="errorMsg" class="text-sm font-medium text-rose-600 flex items-center gap-1.5 mt-2">
        <i class="bi bi-exclamation-circle-fill"></i>
        {{ errorMsg }}
      </p>

      <div
        v-if="!puedeGuardarTesoreria"
        class="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium text-center animate-pulse mt-2"
      >
        No tienes permisos para registrar o modificar transacciones de Tesorería.
      </div>
    </form>

    <template #footer>
      <BaseButton
        variant="ghost"
        @click="modal"
        :disabled="isSaving"
      >
        Cancelar
      </BaseButton>
      <BaseButton
        type="submit"
        form="tesoreriaForm"
        variant="primary"
        :loading="isSaving"
        :disabled="!puedeGuardarTesoreria"
      >
        {{
          modoEdicion
            ? 'Actualizar'
            : 'Guardar'
        }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
