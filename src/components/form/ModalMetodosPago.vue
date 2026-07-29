<script setup>
import { ref, computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection, addDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { CLUB_POR_DEFECTO } from '@/config/constants'
import { useSesionStore } from '@/stores/useSesionStore'

const emit = defineEmits(['close'])

const sesionStore = useSesionStore()

const metodos = useCollection(() => {
  const userClub = sesionStore.club || CLUB_POR_DEFECTO
  return query(collection(db, 'metodos_pago'), where('club', '==', userClub))
})

const tipoSeleccionado = ref('pago_movil')
const isSaving = ref(false)
const errorMsg = ref('')

const formulario = ref({
  telefono: '',
  cedula: '',
  banco: '',
  cuenta: '',
  titular: '',
  correo: '',
  binanceId: '',
  url: '',
})

const resetFormulario = () => {
  Object.keys(formulario.value).forEach((key) => {
    formulario.value[key] = ''
  })
  errorMsg.value = ''
}

const guardarMetodo = async () => {
  isSaving.value = true
  errorMsg.value = ''

  try {
    const data = {
      tipo: tipoSeleccionado.value,
      createdAt: serverTimestamp(),
    }

    if (tipoSeleccionado.value === 'pago_movil') {
      if (!formulario.value.telefono || !formulario.value.cedula || !formulario.value.banco) {
        throw new Error('Todos los campos de Pago Móvil son obligatorios.')
      }
      data.telefono = formulario.value.telefono.trim()
      data.cedula = formulario.value.cedula.trim()
      data.banco = formulario.value.banco.trim()
    } else if (tipoSeleccionado.value === 'transferencia') {
      if (
        !formulario.value.cuenta ||
        !formulario.value.cedula ||
        !formulario.value.banco ||
        !formulario.value.titular
      ) {
        throw new Error('Todos los campos de Transferencia Bancaria son obligatorios.')
      }
      data.cuenta = formulario.value.cuenta.trim()
      data.cedula = formulario.value.cedula.trim()
      data.banco = formulario.value.banco.trim()
      data.titular = formulario.value.titular.trim()
    } else if (tipoSeleccionado.value === 'binance') {
      if (!formulario.value.correo || !formulario.value.binanceId) {
        throw new Error('Todos los campos de Binance son obligatorios.')
      }
      data.correo = formulario.value.correo.trim()
      data.binanceId = formulario.value.binanceId.trim()
    } else if (tipoSeleccionado.value === 'paypal') {
      if (!formulario.value.url) {
        throw new Error('La URL de pago de PayPal es obligatoria.')
      }
      data.url = formulario.value.url.trim()
    }
    const newData = { ...data, club: sesionStore.club || CLUB_POR_DEFECTO }
    await addDoc(collection(db, 'metodos_pago'), newData)
    resetFormulario()
  } catch (error) {
    console.error(error)
    errorMsg.value = error.message || 'No se pudo guardar el método de pago.'
  } finally {
    isSaving.value = false
  }
}

const eliminarMetodo = async (id) => {
  if (confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
    try {
      await deleteDoc(doc(db, 'metodos_pago', id))
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/50 backdrop-blur-xs p-4"
    @click.self="emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
    >
      <div class="bg-primary-600 px-6 py-4 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-2.5">
          <i class="bi bi-credit-card-2-front text-xl text-white"></i>
          <h3 class="text-lg font-bold text-white">Ajustar Métodos de Pago</h3>
        </div>
        <button
          @click="emit('close')"
          class="cursor-pointer text-white hover:text-gray-200 text-2xl font-bold font-sans"
        >
          &times;
        </button>
      </div>

      <div class="p-6 overflow-y-auto space-y-6 flex-1">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form @submit.prevent="guardarMetodo" class="space-y-4">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">Agregar Método</h4>

            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                >Método de Pago</label
              >
              <select
                v-model="tipoSeleccionado"
                @change="resetFormulario"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="pago_movil">Pago Móvil</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="binance">Binance Pay</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            <div v-if="tipoSeleccionado === 'pago_movil'" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Número de Teléfono</label
                >
                <input
                  type="text"
                  v-model="formulario.telefono"
                  placeholder="Ej. +58 412 1234567"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Cédula</label
                >
                <input
                  type="text"
                  v-model="formulario.cedula"
                  placeholder="Ej. V-12345678"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Nombre del Banco</label
                >
                <input
                  type="text"
                  v-model="formulario.banco"
                  placeholder="Ej. Banesco"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div v-if="tipoSeleccionado === 'transferencia'" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Número de Cuenta</label
                >
                <input
                  type="text"
                  v-model="formulario.cuenta"
                  placeholder="20 dígitos"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Cédula / RIF</label
                >
                <input
                  type="text"
                  v-model="formulario.cedula"
                  placeholder="Ej. J-12345678"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Nombre del Banco</label
                >
                <input
                  type="text"
                  v-model="formulario.banco"
                  placeholder="Ej. Banco de Venezuela"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Nombre del Titular</label
                >
                <input
                  type="text"
                  v-model="formulario.titular"
                  placeholder="Nombre completo"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div v-if="tipoSeleccionado === 'binance'" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Correo de la Cuenta</label
                >
                <input
                  type="text"
                  v-model="formulario.correo"
                  placeholder="correo@ejemplo.com"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Binance Pay ID</label
                >
                <input
                  type="text"
                  v-model="formulario.binanceId"
                  placeholder="ID de Binance de 9 dígitos"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div v-if="tipoSeleccionado === 'paypal'" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >URL de Pago</label
                >
                <input
                  type="url"
                  v-model="formulario.url"
                  placeholder="https://paypal.me/usuario"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>

            <div
              v-if="errorMsg"
              class="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium"
            >
              {{ errorMsg }}
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                :disabled="isSaving"
                class="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 text-sm flex items-center gap-1.5"
              >
                <i v-if="isSaving" class="bi bi-arrow-clockwise animate-spin"></i>
                Agregar
              </button>
            </div>
          </form>

          <div class="space-y-4">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Métodos Registrados
            </h4>

            <div v-if="metodos.length === 0" class="text-center py-8 text-gray-400 text-sm">
              <i class="bi bi-credit-card text-3xl block mb-2 opacity-50"></i>
              No hay métodos registrados.
            </div>

            <div v-else class="space-y-3 max-h-87.5 overflow-y-auto pr-1">
              <div
                v-for="m in metodos"
                :key="m.id"
                class="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                      :class="{
                        'bg-pink-100 text-pink-700': m.tipo === 'pago_movil',
                        'bg-blue-100 text-blue-700': m.tipo === 'transferencia',
                        'bg-amber-100 text-amber-700': m.tipo === 'binance',
                        'bg-indigo-100 text-indigo-700': m.tipo === 'paypal',
                      }"
                    >
                      {{ m.tipo.replace('_', ' ') }}
                    </span>
                  </div>

                  <div class="mt-2 text-xs text-gray-600 space-y-0.5">
                    <div v-if="m.tipo === 'pago_movil'">
                      <p><span class="font-semibold text-gray-500">Banco:</span> {{ m.banco }}</p>
                      <p><span class="font-semibold text-gray-500">Tel:</span> {{ m.telefono }}</p>
                      <p><span class="font-semibold text-gray-500">CI:</span> {{ m.cedula }}</p>
                    </div>

                    <div v-if="m.tipo === 'transferencia'">
                      <p><span class="font-semibold text-gray-500">Banco:</span> {{ m.banco }}</p>
                      <p class="truncate">
                        <span class="font-semibold text-gray-500">Cuenta:</span> {{ m.cuenta }}
                      </p>
                      <p><span class="font-semibold text-gray-500">CI/RIF:</span> {{ m.cedula }}</p>
                      <p class="truncate">
                        <span class="font-semibold text-gray-500">Titular:</span> {{ m.titular }}
                      </p>
                    </div>

                    <div v-if="m.tipo === 'binance'">
                      <p class="truncate">
                        <span class="font-semibold text-gray-500">Correo:</span> {{ m.correo }}
                      </p>
                      <p>
                        <span class="font-semibold text-gray-500">Pay ID:</span> {{ m.binanceId }}
                      </p>
                    </div>

                    <div v-if="m.tipo === 'paypal'">
                      <p class="truncate">
                        <span class="font-semibold text-gray-500">URL:</span> {{ m.url }}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  @click="eliminarMetodo(m.id)"
                  class="cursor-pointer text-rose-600 hover:text-rose-800 p-2 shrink-0 ml-2"
                >
                  <i class="bi bi-trash-fill text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3 shrink-0 border-t border-gray-100">
        <button
          @click="emit('close')"
          class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
