<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollection } from 'vuefire'
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useSociosStore } from '@/stores/useSociosStore'
import { useAspirantesStore } from '@/stores/useAspirantesStore'
import { useEventosStore } from '@/stores/useEventosStore'

const sociosStore = useSociosStore()
const aspirantesStore = useAspirantesStore()
const eventosStore = useEventosStore()

const recordatoriosRaw = useCollection(collection(db, 'fechas_personalizadas'))

const filtroCumple = ref(true)
const filtroEventos = ref(true)
const filtroRecordatorios = ref(true)

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

const modalAbierto = ref(false)
const fechaSeleccionada = ref('')
const errorMsg = ref('')
const isSaving = ref(false)

const nuevoRecordatorio = ref({
  titulo: '',
  descripcion: '',
})

const nombreMeses = [
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

const diasDeLaSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const mesActualLabel = computed(() => `${nombreMeses[currentMonth.value]} de ${currentYear.value}`)

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const goToToday = () => {
  currentYear.value = new Date().getFullYear()
  currentMonth.value = new Date().getMonth()
}

function checkIsToday(y, m, d) {
  const today = new Date()
  return today.getFullYear() === y && today.getMonth() === m && today.getDate() === d
}

const daysGrid = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value

  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const totalDaysPrev = new Date(year, month, 0).getDate()

  const list = []

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = totalDaysPrev - i
    const prevMonthIdx = month === 0 ? 11 : month - 1
    const prevYearIdx = month === 0 ? year - 1 : year
    const dateString = `${prevYearIdx}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    list.push({
      dayNumber: day,
      dateString,
      isCurrentMonth: false,
      isToday: checkIsToday(prevYearIdx, prevMonthIdx, day),
    })
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    list.push({
      dayNumber: day,
      dateString,
      isCurrentMonth: true,
      isToday: checkIsToday(year, month, day),
    })
  }

  const totalCells = 42
  const remainingCells = totalCells - list.length
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1
    const nextYearIdx = month === 11 ? year + 1 : year
    const dateString = `${nextYearIdx}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    list.push({
      dayNumber: day,
      dateString,
      isCurrentMonth: false,
      isToday: checkIsToday(nextYearIdx, nextMonthIdx, day),
    })
  }

  return list
})

const computedEvents = computed(() => {
  const list = []

  if (filtroEventos.value) {
    ;(eventosStore.eventos || []).forEach((e) => {
      list.push({
        id: `evento-${e.id}`,
        title: `📅 ${e.nombre}`,
        start: e.fecha,
        colorClass: 'bg-blue-600 text-white',
        extendedProps: {
          tipo: 'evento',
          descripcion: e.descripcion || 'Sin descripción',
          presupuesto: e.presupuesto,
          totalGastado: e.totalGastado,
          estatus: e.estatus,
        },
      })
    })
  }

  if (filtroCumple.value) {
    const todos = [...(sociosStore.socios || []), ...(aspirantesStore.aspirantes || [])]
    const yearActual = currentYear.value

    todos.forEach((p) => {
      if (!p.fecha) return
      const partes = p.fecha.split('-')
      if (partes.length === 3) {
        const mes = partes[1]
        const dia = partes[2]
        list.push({
          id: `cumple-${p.id}`,
          title: `🍰 Cumple: ${p.nombre}`,
          start: `${yearActual}-${mes}-${dia}`,
          colorClass: 'bg-primary-600 text-white',
          extendedProps: {
            tipo: 'cumple',
            edad: p.edad,
            telefono: p.telefono,
            correo: p.correo,
          },
        })
      }
    })
  }

  if (filtroRecordatorios.value) {
    ;(recordatoriosRaw.value || []).forEach((r) => {
      list.push({
        id: `rec-${r.id}`,
        title: `📌 ${r.titulo}`,
        start: r.fecha,
        colorClass: 'bg-emerald-600 text-white',
        extendedProps: {
          tipo: 'recordatorio',
          descripcion: r.descripcion || 'Sin descripción',
        },
      })
    })
  }

  return list
})

const getEventsForDay = (dateString) => {
  return computedEvents.value.filter((e) => e.start === dateString)
}

function handleDateClick(dateString) {
  fechaSeleccionada.value = dateString
  modalAbierto.value = true
  errorMsg.value = ''
  nuevoRecordatorio.value.titulo = ''
  nuevoRecordatorio.value.descripcion = ''
}

const itemsDelDia = computed(() => {
  if (!fechaSeleccionada.value) return []
  return computedEvents.value.filter((e) => e.start === fechaSeleccionada.value)
})

const birthdaysDelDia = computed(() => {
  return itemsDelDia.value.filter((i) => i.extendedProps.tipo === 'cumple')
})

const eventsDelDia = computed(() => {
  return itemsDelDia.value.filter((i) => i.extendedProps.tipo === 'evento')
})

const recordatoriosDelDia = computed(() => {
  return itemsDelDia.value.filter((i) => i.extendedProps.tipo === 'recordatorio')
})

const formatFechaDetalle = computed(() => {
  if (!fechaSeleccionada.value) return ''
  const partes = fechaSeleccionada.value.split('-')
  if (partes.length !== 3) return fechaSeleccionada.value
  const dateObj = new Date(partes[0], partes[1] - 1, partes[2])
  return dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const guardarRecordatorio = async () => {
  if (!nuevoRecordatorio.value.titulo.trim()) {
    errorMsg.value = 'El título es obligatorio.'
    return
  }
  isSaving.value = true
  errorMsg.value = ''
  try {
    await addDoc(collection(db, 'fechas_personalizadas'), {
      titulo: nuevoRecordatorio.value.titulo.trim(),
      descripcion: nuevoRecordatorio.value.descripcion.trim(),
      fecha: fechaSeleccionada.value,
      createdAt: new Date(),
    })
    nuevoRecordatorio.value.titulo = ''
    nuevoRecordatorio.value.descripcion = ''
  } catch (error) {
    console.error(error)
    errorMsg.value = 'No se pudo guardar el recordatorio.'
  } finally {
    isSaving.value = false
  }
}

const eliminarRecordatorio = async (idCompleto) => {
  const id = idCompleto.replace('rec-', '')
  if (confirm('¿Estás seguro de que deseas eliminar este recordatorio?')) {
    try {
      await deleteDoc(doc(db, 'fechas_personalizadas', id))
    } catch (error) {
      console.error(error)
    }
  }
}

const abrirCrearDirecto = () => {
  fechaSeleccionada.value = new Date().toISOString().split('T')[0]
  modalAbierto.value = true
  errorMsg.value = ''
  nuevoRecordatorio.value.titulo = ''
  nuevoRecordatorio.value.descripcion = ''
}
</script>

<template>
  <main class="w-[92%] sm:w-11/12 md:w-[94%] mx-auto mt-4">
    <div class="flex flex-col lg:flex-row gap-6 items-stretch">
      <div
        class="w-full lg:w-64 shrink-0 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col gap-5"
      >
        <button
          @click="abrirCrearDirecto"
          class="cursor-pointer py-3 px-4 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all uppercase tracking-wide text-xs sm:text-sm"
        >
          <i class="bi bi-plus-lg text-lg"></i>
          Agregar Fecha
        </button>

        <div class="h-px bg-gray-200"></div>

        <div>
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Mis Calendarios
          </h4>
          <div class="flex flex-col gap-2.5">
            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                v-model="filtroCumple"
                class="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
              />
              <span class="w-3.5 h-3.5 rounded-full bg-primary-600 shrink-0"></span>
              <span
                class="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors"
                >Cumpleaños</span
              >
            </label>

            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                v-model="filtroEventos"
                class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span class="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0"></span>
              <span
                class="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors"
                >Eventos del Club</span
              >
            </label>

            <label class="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                v-model="filtroRecordatorios"
                class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
              />
              <span class="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0"></span>
              <span
                class="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors"
                >Recordatorios</span
              >
            </label>
          </div>
        </div>
      </div>

      <div
        class="flex-1 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col min-w-0"
      >
        <div class="flex justify-between items-center mb-5 shrink-0">
          <h2 class="text-xl font-bold text-gray-800 capitalize">{{ mesActualLabel }}</h2>
          <div class="flex gap-1.5 items-center">
            <button
              @click="goToToday"
              class="cursor-pointer px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-all"
            >
              Hoy
            </button>
            <button
              @click="prevMonth"
              class="cursor-pointer p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-lg transition-all"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <button
              @click="nextMonth"
              class="cursor-pointer p-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-lg transition-all"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <div
          class="grid grid-cols-7 border-t border-l border-gray-200 rounded-tl-lg rounded-tr-lg shrink-0"
        >
          <div
            v-for="d in diasDeLaSemana"
            :key="d"
            class="text-center py-2 bg-gray-50 border-r border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider"
          >
            {{ d }}
          </div>
        </div>

        <div class="grid grid-cols-7 grid-rows-6 border-l border-gray-200 flex-1 min-h-125">
          <div
            v-for="day in daysGrid"
            :key="day.dateString"
            @click="handleDateClick(day.dateString)"
            class="min-h-21.25 p-1.5 border-r border-b border-gray-200 transition-colors hover:bg-gray-50/50 cursor-pointer flex flex-col gap-1 overflow-hidden"
            :class="{
              'bg-gray-50/30 text-gray-400': !day.isCurrentMonth,
              'bg-white text-gray-800': day.isCurrentMonth,
            }"
          >
            <div class="flex justify-between items-center">
              <span
                class="text-xs font-bold flex items-center justify-center w-6 h-6 rounded-full"
                :class="{
                  'bg-primary-600 text-white': day.isToday,
                  'text-gray-500': !day.isToday && day.isCurrentMonth,
                  'text-gray-400': !day.isToday && !day.isCurrentMonth,
                }"
              >
                {{ day.dayNumber }}
              </span>
            </div>

            <div class="flex flex-col gap-0.5 overflow-y-auto scrollbar-none flex-1">
              <div
                v-for="e in getEventsForDay(day.dateString).slice(0, 3)"
                :key="e.id"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-sm truncate"
                :class="e.colorClass"
              >
                {{ e.title }}
              </div>
              <div
                v-if="getEventsForDay(day.dateString).length > 3"
                class="text-[9px] font-bold text-gray-400 pl-1"
              >
                +{{ getEventsForDay(day.dateString).length - 3 }} más
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="modalAbierto"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      @click.self="modalAbierto = false"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
      >
        <div class="bg-primary-600 px-6 py-4 flex justify-between items-center shrink-0">
          <div class="flex items-center gap-2.5">
            <i class="bi bi-calendar3 text-xl text-white"></i>
            <h3 class="text-lg font-bold text-white capitalize">{{ formatFechaDetalle }}</h3>
          </div>
          <button
            @click="modalAbierto = false"
            class="cursor-pointer text-white hover:text-gray-200 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-6 flex-1">
          <div class="space-y-4">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Actividades Programadas
            </h4>

            <div
              v-if="itemsDelDia.length === 0"
              class="text-center py-6 text-gray-400 font-medium text-sm"
            >
              <i class="bi bi-calendar-x text-3xl block mb-2 opacity-50"></i>
              No hay actividades para este día.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="c in birthdaysDelDia"
                :key="c.id"
                class="p-3 bg-pink-50 border border-pink-100 rounded-xl flex items-center justify-between"
              >
                <div class="flex items-start gap-3">
                  <span class="text-xl">🍰</span>
                  <div>
                    <h5 class="font-bold text-pink-700 text-sm">{{ c.title }}</h5>
                    <p class="text-xs text-pink-600/90 font-medium">
                      Edad: {{ c.extendedProps.edad }} años &middot; Tel:
                      {{ c.extendedProps.telefono }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                v-for="e in eventsDelDia"
                :key="e.id"
                class="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between"
              >
                <div class="flex items-start gap-3">
                  <span class="text-xl">📅</span>
                  <div>
                    <h5 class="font-bold text-blue-700 text-sm">{{ e.title }}</h5>
                    <p class="text-xs text-blue-600/95 mt-0.5">{{ e.extendedProps.descripcion }}</p>
                    <p class="text-xs text-blue-600/90 font-semibold mt-1">
                      Presupuesto: ${{ e.extendedProps.presupuesto }} &middot; Gastado: ${{
                        e.extendedProps.totalGastado
                      }}
                    </p>
                  </div>
                </div>
                <span
                  class="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase"
                  :class="
                    e.extendedProps.estatus === 'activo'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  "
                >
                  {{ e.extendedProps.estatus }}
                </span>
              </div>

              <div
                v-for="r in recordatoriosDelDia"
                :key="r.id"
                class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between"
              >
                <div class="flex items-start gap-3 min-w-0">
                  <span class="text-xl shrink-0">📌</span>
                  <div class="min-w-0">
                    <h5 class="font-bold text-emerald-700 text-sm truncate">
                      {{ r.title.replace('📌 ', '') }}
                    </h5>
                    <p class="text-xs text-emerald-600/95 mt-0.5 wrap-break-word">
                      {{ r.extendedProps.descripcion }}
                    </p>
                  </div>
                </div>
                <button
                  @click="eliminarRecordatorio(r.id)"
                  class="cursor-pointer text-rose-600 hover:text-rose-800 p-1 shrink-0 ml-2"
                  title="Eliminar recordatorio"
                >
                  <i class="bi bi-trash-fill text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="h-px bg-gray-200"></div>

          <form @submit.prevent="guardarRecordatorio" class="space-y-4">
            <h4 class="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Agregar Recordatorio
            </h4>

            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Título</label
                >
                <input
                  type="text"
                  v-model="nuevoRecordatorio.titulo"
                  required
                  placeholder="Ej. Reunión extraordinaria"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase mb-1"
                  >Descripción</label
                >
                <textarea
                  v-model="nuevoRecordatorio.descripcion"
                  rows="2"
                  placeholder="Detalles del recordatorio..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 resize-none"
                ></textarea>
              </div>
            </div>

            <div
              v-if="errorMsg"
              class="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium"
            >
              {{ errorMsg }}
            </div>

            <div class="flex justify-end gap-3 shrink-0 pt-2">
              <button
                type="button"
                @click="modalAbierto = false"
                class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Cerrar
              </button>
              <button
                type="submit"
                :disabled="isSaving"
                class="cursor-pointer px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm flex items-center gap-1.5"
              >
                <i v-if="isSaving" class="bi bi-arrow-clockwise animate-spin"></i>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>
