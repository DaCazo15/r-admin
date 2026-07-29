<script setup>
defineProps({
  daysGrid: Array,
  diasDeLaSemana: Array,
  getEventsForDay: Function
})

const emit = defineEmits(['dayClick'])
</script>

<template>
  <div class="flex-1 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col min-w-0">
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
        @click="emit('dayClick', day.dateString)"
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
</template>
