<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSociosStore } from '@/stores/useSociosStore'
import { useAspirantesStore } from '@/stores/useAspirantesStore'
import { useTesoreriaStore } from '@/stores/useTesoreriaStore'

const props = defineProps({
  encabezados: { type: Array, required: true },
  estatus: { type: String, required: true },
  terminoBusqueda: { type: String, required: false },
})

const emit = defineEmits(['modalPersona', 'modalTesoreria'])

const sociosStore = useSociosStore()
const aspirantesStore = useAspirantesStore()
const tesoreriaStore = useTesoreriaStore()

const { socios } = storeToRefs(sociosStore)
const { aspirantes } = storeToRefs(aspirantesStore)
const { transacciones } = storeToRefs(tesoreriaStore)

const registros = computed(() => {
  if (props.estatus === 'Socios') return socios.value
  if (props.estatus === 'Aspirantes') return aspirantes.value
  if (props.estatus === 'Tesoreria') return transacciones.value
  return []
})

const registrosFiltrados = computed(() => {
  const termino = props.terminoBusqueda?.toLowerCase() || ''
  if (!termino) return registros.value
  return registros.value.filter((registro) => {
    const nombre = registro.nombre?.toLowerCase() || ''
    const descripcion = registro.descripcion?.toLowerCase() || ''
    return nombre.includes(termino) || descripcion.includes(termino)
  })
})

const eliminarRegistro = async (id) => {
  if (props.estatus === 'Socios') {
    await sociosStore.eliminarSocio(id)
  } else if (props.estatus === 'Aspirantes') {
    await aspirantesStore.eliminarAspirante(id)
  } else if (props.estatus === 'Tesoreria') {
    await tesoreriaStore.eliminarTransaccion(id)
  }
}

const editarPersona = async (id) => {
  const registroEncontrado = registros.value.find((registro) => registro.id === id)
  if (props.estatus === 'Tesoreria') {
    emit('modalTesoreria', registroEncontrado)
  } else {
    emit('modalPersona', registroEncontrado)
  }
}
</script>

<template>
  <div
    class="mt-3 w-[92%] sm:w-11/12 md:w-3/4 mx-auto bg-white shadow-md rounded-lg overflow-x-auto"
  >
    <table class="w-full min-w-160 border-collapse">
      <thead>
        <tr class="bg-primary-600 text-white font-bold text-left">
          <th
            v-for="encabezado in encabezados"
            :key="encabezado"
            class="px-4 py-3"
            :class="{ 'text-center': encabezado === 'Acciones' }"
          >
            {{ encabezado }}
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200">
        <!-- Mostrar si no hay registros -->
        <tr v-if="registros.length === 0">
          <td :colspan="encabezados.length" class="px-4 py-8 text-center text-gray-400 font-medium">
            No hay registros para mostrar en {{ props.estatus }}
          </td>
        </tr>

        <!-- Renderizar dinámicamente si hay registros -->
        <tr
          v-else
          v-for="item in registrosFiltrados"
          :key="item.id"
          class="hover:bg-gray-50 transition-colors"
        >
          <!-- Si la vista es Socios o Aspirantes -->
          <template v-if="props.estatus === 'Socios' || props.estatus === 'Aspirantes'">
            <td class="px-4 py-3 font-medium text-gray-900">{{ item.nombre }}</td>
            <td class="px-4 py-3 text-gray-700">{{ item.edad }}</td>
            <td class="px-4 py-3 text-gray-700">{{ item.fecha }}</td>
            <td class="px-4 py-3 text-gray-700">{{ item.telefono }}</td>
            <td class="px-4 py-3 text-gray-700 truncate max-w-50" :title="item.correo">
              {{ item.correo }}
            </td>
            <td class="px-4 py-3 text-gray-700">{{ item.ubicacion }}</td>
            <td class="px-4 py-3 flex items-center justify-center gap-8">
              <button
                @click="editarPersona(item.id)"
                class="text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                title="Editar"
              >
                <i class="bi bi-pencil-square text-lg"></i>
              </button>
              <button
                @click="eliminarRegistro(item.id)"
                class="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                title="Eliminar"
              >
                <i class="bi bi-trash text-lg"></i>
              </button>
            </td>
          </template>

          <!-- Si la vista es Tesorería -->
          <template v-else-if="props.estatus === 'Tesoreria'">
            <!-- Columna Nombre / Concepto -->
            <td class="px-4 py-3 font-medium text-gray-900">
              <span
                v-if="
                  ['mensualidad', 'cuota distrital'].includes(item.tipoMovimiento?.toLowerCase())
                "
              >
                {{ item.nombre || item.descripcion }}

                <span
                  class="font-bold capitalize block text-xs mt-1"
                  :class="item.estatus === 'revisado' ? 'text-green-600' : 'text-red-600'"
                  >{{ item.estatus }}</span
                >
              </span>
              <span v-else>
                {{ item.descripcion }}
              </span>
            </td>
            <!-- Columna Monto (con clase de color verde/rojo según el tipo) -->
            <td
              class="px-4 py-3 font-bold"
              :class="
                item.tipoMovimiento?.toLowerCase() === 'egreso' ? 'text-red-600' : 'text-green-600'
              "
            >
              {{ item.tipoMovimiento?.toLowerCase() === 'egreso' ? '-' : '+' }}${{
                Number(item.monto).toFixed(2)
              }}
            </td>
            <!-- Columna Referencia -->
            <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ item.referencia }}</td>
            <!-- Columna Fecha de Pago -->
            <td class="px-4 py-3 text-gray-700">{{ item.fechaPago }}</td>
            <!-- Columna Tipo de Pago (Badge estilizado) -->
            <td class="px-4 py-3">
              <span
                class="px-2.5 py-1 text-xs font-semibold uppercase"
                :class="{
                  'bg-emerald-50 text-emerald-700':
                    item.tipoMovimiento?.toLowerCase() === 'ingreso',
                  'bg-rose-50 text-rose-700': item.tipoMovimiento?.toLowerCase() === 'egreso',
                  'bg-blue-50 text-blue-700': ['mensualidad', 'cuota distrital'].includes(
                    item.tipoMovimiento?.toLowerCase(),
                  ),
                }"
              >
                {{ item.metodoPago }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2.5 py-1 text-xs font-semibold uppercase"
                :class="{
                  'bg-emerald-50 text-emerald-700':
                    item.tipoMovimiento?.toLowerCase() === 'ingreso',
                  'bg-rose-50 text-rose-700': item.tipoMovimiento?.toLowerCase() === 'egreso',
                  'bg-blue-50 text-blue-700': ['mensualidad', 'cuota distrital'].includes(
                    item.tipoMovimiento?.toLowerCase(),
                  ),
                }"
              >
                {{ item.tipoMovimiento }}
              </span>
            </td>
            <!-- Acciones -->
            <td class="px-4 py-3 flex items-center justify-center gap-8">
              <button
                @click="editarPersona(item.id)"
                class="text-green-600 hover:text-green-800 transition-colors cursor-pointer"
                title="Editar"
              >
                <i class="bi bi-pencil-square text-lg"></i>
              </button>
              <button
                @click="eliminarRegistro(item.id)"
                class="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                title="Eliminar"
              >
                <i class="bi bi-trash text-lg"></i>
              </button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
