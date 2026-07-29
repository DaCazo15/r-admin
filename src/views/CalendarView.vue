<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCollection } from 'vuefire'
import { collection, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useSociosStore } from '@/stores/useSociosStore'
import { useAspirantesStore } from '@/stores/useAspirantesStore'
import { useEventosStore } from '@/stores/useEventosStore'
import { useSesionStore } from '@/stores/useSesionStore'

// Subcomponentes modulares de presentación
import CalendarHeader from '@/components/calendar/CalendarHeader.vue'
import CalendarSidebar from '@/components/calendar/CalendarSidebar.vue'
import CalendarGrid from '@/components/calendar/CalendarGrid.vue'
import CalendarModal from '@/components/calendar/CalendarModal.vue'

const sociosStore = useSociosStore()
const aspirantesStore = useAspirantesStore()
const eventosStore = useEventosStore()

const sesionStore = useSesionStore()
const { rol } = storeToRefs(sesionStore)

const recordatoriosRaw = useCollection(() => {
  const userClub = sesionStore.club || 'Isla de Margarita'
  return query(collection(db, 'fechas_personalizadas'), where('club', '==', userClub))
})

const filtroCumple = ref(true)
const filtroEventos = ref(true)
const filtroRecordatorios = ref(true)

const puedeModificarCalendario = computed(() => {
  return !['socio', 'macero'].includes(rol.value)
})

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
      club: sesionStore.club || 'Isla de Margarita',
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
    <!-- Header de navegación de mes -->
    <CalendarHeader
      :mes-actual-label="mesActualLabel"
      @prev="prevMonth"
      @next="nextMonth"
      @today="goToToday"
    />

    <div class="flex flex-col lg:flex-row gap-6 items-stretch">
      <!-- Filtros Laterales -->
      <CalendarSidebar
        v-model:filtro-cumple="filtroCumple"
        v-model:filtro-eventos="filtroEventos"
        v-model:filtro-recordatorios="filtroRecordatorios"
        :puede-modificar-calendario="puedeModificarCalendario"
        @add="abrirCrearDirecto"
      />

      <!-- Grilla de Calendario -->
      <CalendarGrid
        :days-grid="daysGrid"
        :dias-de-la-semana="diasDeLaSemana"
        :get-events-for-day="getEventsForDay"
        @dayClick="handleDateClick"
      />
    </div>

    <!-- Modal de Recordatorios -->
    <CalendarModal
      v-if="modalAbierto"
      :fecha-seleccionada="fechaSeleccionada"
      :format-fecha-detalle="formatFechaDetalle"
      :items-del-dia="itemsDelDia"
      :birthdays-del-dia="birthdaysDelDia"
      :events-del-dia="eventsDelDia"
      :recordatorios-del-dia="recordatoriosDelDia"
      :puede-modificar-calendario="puedeModificarCalendario"
      :nuevo-recordatorio="nuevoRecordatorio"
      :error-msg="errorMsg"
      :is-saving="isSaving"
      @close="modalAbierto = false"
      @deleteRecordatorio="eliminarRecordatorio"
      @addRecordatorio="guardarRecordatorio"
    />
  </main>
</template>
