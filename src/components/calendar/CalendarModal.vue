<script setup>
defineProps({
  fechaSeleccionada: String,
  formatFechaDetalle: String,
  itemsDelDia: Array,
  birthdaysDelDia: Array,
  eventsDelDia: Array,
  recordatoriosDelDia: Array,
  puedeModificarCalendario: Boolean,
  nuevoRecordatorio: Object,
  errorMsg: String,
  isSaving: Boolean
})

const emit = defineEmits(['close', 'deleteRecordatorio', 'addRecordatorio'])
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/50 backdrop-blur-xs p-4"
    @click.self="emit('close')"
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
          @click="emit('close')"
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
                v-if="puedeModificarCalendario"
                @click="emit('deleteRecordatorio', r.id)"
                class="cursor-pointer text-rose-600 hover:text-rose-800 p-1 shrink-0 ml-2"
                title="Eliminar recordatorio"
              >
                <i class="bi bi-trash-fill text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="h-px bg-gray-200"></div>

        <form v-if="puedeModificarCalendario" @submit.prevent="emit('addRecordatorio')" class="space-y-4">
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
              @click="emit('close')"
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
</template>
