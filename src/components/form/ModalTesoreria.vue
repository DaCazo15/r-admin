<script setup>
import { ref, computed } from 'vue'
import { useCollection } from 'vuefire'
import { query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { meses, form } from '@/helpers/list'
import { guardarMovimiento } from '@/services/firebaseService'

const emit = defineEmits(['close'])

const isSaving = ref(false)

const tipoMovimiento = ref('mensualidad')

const querySocios = computed(() => {
  if (!db) return null
  return query(collection(db, 'persona'), where('estatus', 'in', ['Socios']))
})
const socios = useCollection(querySocios)

const modal = () => {
  emit('close')
}

const resetForm = () => {
  form.value.nombre = ''
  form.value.descripcion = ''
  form.value.monto = ''
  form.value.referencia = ''
  form.value.fechaPago = new Date().toISOString().split('T')[0]
  form.value.tipoPago = ''
  form.value.tipoMovimiento = ''
  form.value.mes = ''
}

const guardarDatos = async () => {
  await guardarMovimiento(tipoMovimiento.value, form.value, isSaving)
  resetForm()
  modal()
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
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
        <h3 class="text-lg font-bold text-gray-50">Registrar Transacción</h3>
        <button @click="modal" class="cursor-pointer text-gray-50 text-xl font-bold">
          &times;
        </button>
      </div>

      <!-- Selector de Tipo de Movimiento (Tabs) -->
      <div class="flex border-b border-gray-200 bg-gray-50">
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
        <div v-if="tipoMovimiento === 'mensualidad'" class="space-y-4">
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
              tipoMovimiento === 'ingreso'
                ? 'Ej. Venta de rifas'
                : 'Ej. Reparación de aire acondicionado'
            "
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          />
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

              <option value="Pago Móvil">Pago Móvil</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Zelle">Zelle</option>
              <option value="USDT">Binance</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <!-- Tipo de Moviemiento -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
            <input
              type="text"
              disabled
              :value="tipoMovimiento.charAt(0).toUpperCase() + tipoMovimiento.slice(1)"
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

        <!-- Botones de Acción -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            @click="modal"
            :disabled="isSaving"
            class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="cursor-pointer px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSaving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
