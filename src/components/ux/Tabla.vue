<script setup>
import { ref, watchEffect } from 'vue'
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSociosStore } from '@/stores/useSociosStore'
import { useAspirantesStore } from '@/stores/useAspirantesStore'
import { useTesoreriaStore } from '@/stores/useTesoreriaStore'
import { useSesionStore } from '@/stores/useSesionStore'
import { db } from '@/config/firebase'
import { query, where, collection, getDocs } from 'firebase/firestore'
import EmptyState from '../ui/EmptyState.vue'

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

const sesionStore = useSesionStore()
const { rol, usuario } = storeToRefs(sesionStore)

const nombreUser = ref('')

watchEffect(async () => {
  if (usuario.value?.email) {
    const snapshot = await getDocs(
      query(
        collection(db, 'persona'),
        where('correo', '==', usuario.value.email),
        where('club', '==', sesionStore.club),
      ),
    )
    if (!snapshot.empty) {
      nombreUser.value = snapshot.docs[0].data().nombre
    }
  }
})

const puedeEditarOEliminar = computed(() => {
  if (props.estatus === 'Socios') {
    return ['vicepresidente', 'presidente'].includes(rol.value)
  }
  if (props.estatus === 'Aspirantes') {
    return ['secretario', 'vicepresidente', 'presidente'].includes(rol.value)
  }
  if (props.estatus === 'Tesoreria') {
    return ['tesorero', 'vicepresidente', 'presidente'].includes(rol.value)
  }
  return false
})

const headersFiltrados = computed(() => {
  if (!puedeEditarOEliminar.value) {
    return props.encabezados.filter((h) => h !== 'Acciones')
  }
  return props.encabezados
})

const registros = computed(() => {
  if (props.estatus === 'Socios') return socios.value
  if (props.estatus === 'Aspirantes') return aspirantes.value
  if (props.estatus === 'Tesoreria') return transacciones.value
  return []
})

const registrosFiltrados = computed(() => {
  const termino = props.terminoBusqueda?.toLowerCase() || ''
  let list = registros.value

  // Ocultar perfiles privados a usuarios sin privilegios administrativos (excepto al propio dueño)
  if (props.estatus === 'Socios' || props.estatus === 'Aspirantes') {
    list = list.filter((item) => {
      if (item.perfilPrivado && !['presidente', 'vicepresidente', 'secretario'].includes(rol.value) && item.correo?.toLowerCase() !== usuario.value?.email?.toLowerCase()) {
        return false
      }
      return true
    })
  }

  if (!termino) return list
  return list.filter((registro) => {
    const nombre = registro.nombre?.toLowerCase() || ''
    const descripcion = registro.descripcion?.toLowerCase() || ''
    return nombre.includes(termino) || descripcion.includes(termino)
  })
})

const formatYearMonth = (yyyymm) => {
  if (!yyyymm || yyyymm === 'Desconocido') return 'Sin Fecha'
  const [y, m] = yyyymm.split('-')
  const date = new Date(y, parseInt(m) - 1, 1)
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date)
}

const registrosAgrupados = computed(() => {
  if (props.estatus !== 'Tesoreria') {
    return [{ label: '', items: registrosFiltrados.value }]
  }

  const grupos = {}
  registrosFiltrados.value.forEach(item => {
    const yearMonth = item.fechaPago ? item.fechaPago.substring(0, 7) : 'Desconocido'
    if (!grupos[yearMonth]) grupos[yearMonth] = []
    grupos[yearMonth].push(item)
  })

  const sortedKeys = Object.keys(grupos).sort().reverse()
  return sortedKeys.map(key => ({
    label: formatYearMonth(key),
    items: grupos[key].sort((a,b) => new Date(b.fechaPago || 0) - new Date(a.fechaPago || 0))
  }))
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
  <div v-if="registros.length === 0 || registrosFiltrados.length === 0" class="mt-8 w-full">
    <EmptyState
      :icon="props.estatus === 'Tesoreria' ? 'bi-cash-coin' : 'bi-people'"
      :title="terminoBusqueda ? 'No se encontraron resultados' : `No hay registros en ${props.estatus}`"
      :description="terminoBusqueda ? 'Intenta ajustando los términos de búsqueda.' : 'Parece que no hay datos ingresados en esta sección todavía.'"
    />
  </div>

  <div
    v-else
    class="mt-3 w-[92%] sm:w-11/12 md:w-3/4 mx-auto bg-white shadow-md rounded-lg overflow-x-auto"
  >
    <table class="w-full min-w-160 border-collapse">
      <thead>
        <tr class="bg-primary-600 text-white font-bold text-left">
          <th
            v-for="encabezado in headersFiltrados"
            :key="encabezado"
            class="px-4 py-3"
            :class="{ 'text-center': encabezado === 'Acciones' }"
          >
            {{ encabezado }}
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-200">
        <template v-for="(grupo, index) in registrosAgrupados" :key="index">
          <tr v-if="grupo.label" class="bg-gray-50/50">
            <td :colspan="headersFiltrados.length" class="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100/50 border-y border-gray-200">
              <i class="bi bi-calendar-event mr-1.5"></i>
              {{ grupo.label }}
            </td>
          </tr>

          <tr
            v-for="item in grupo.items"
            :key="item.id"
            class="hover:bg-primary-600/5 transition-colors"
          >
          <!-- Si la vista es Socios o Aspirantes -->
          <template v-if="props.estatus === 'Socios' || props.estatus === 'Aspirantes'">
            <td class="px-4 py-3 font-medium text-gray-900">{{ item.nombre }}</td>
            <td class="px-4 py-3 text-gray-700">{{ item.edad }}</td>
            <td class="px-4 py-3 text-gray-700">{{ item.fecha }}</td>
            <td class="px-4 py-3 text-gray-700">
              {{ (item.mostrarContacto !== false || ['presidente', 'vicepresidente', 'secretario'].includes(rol) || item.correo?.toLowerCase() === usuario?.email?.toLowerCase()) ? (item.telefono || 'No registrado') : 'Oculto' }}
            </td>
            <td class="px-4 py-3 text-gray-700 truncate max-w-50" :title="(item.mostrarContacto !== false || ['presidente', 'vicepresidente', 'secretario'].includes(rol) || item.correo?.toLowerCase() === usuario?.email?.toLowerCase()) ? item.correo : 'Oculto'">
              {{ (item.mostrarContacto !== false || ['presidente', 'vicepresidente', 'secretario'].includes(rol) || item.correo?.toLowerCase() === usuario?.email?.toLowerCase()) ? item.correo : 'Oculto' }}
            </td>
            <td class="px-4 py-3 text-gray-700">{{ item.ubicacion }}</td>
            <td
              v-if="puedeEditarOEliminar"
              class="px-4 py-3 flex items-center justify-center gap-8"
            >
              <button
                @click="editarPersona(item.id)"
                class="text-green-600 hover:text-green-800 transition-all cursor-pointer active:scale-75"
                title="Editar"
              >
                <i class="bi bi-pencil-square text-lg"></i>
              </button>
              <button
                v-if="item.nombre.toLowerCase() !== nombreUser.toLowerCase()"
                @click="eliminarRegistro(item.id)"
                class="text-red-600 hover:text-red-800 transition-all cursor-pointer active:scale-75"
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
            <td
              v-if="puedeEditarOEliminar"
              class="px-4 py-3 flex items-center justify-center gap-8"
            >
              <button
                @click="editarPersona(item.id)"
                class="text-green-600 hover:text-green-800 transition-all cursor-pointer active:scale-75"
                title="Editar"
              >
                <i class="bi bi-pencil-square text-lg"></i>
              </button>
              <button
                @click="eliminarRegistro(item.id)"
                class="text-red-600 hover:text-red-800 transition-all cursor-pointer active:scale-75"
                title="Eliminar"
              >
                <i class="bi bi-trash text-lg"></i>
              </button>
            </td>
          </template>
        </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
