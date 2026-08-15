<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTesoreriaStore } from '@/stores/useTesoreriaStore'
import { useSociosStore } from '@/stores/useSociosStore'
import { useAspirantesStore } from '@/stores/useAspirantesStore'
import { useEventosStore } from '@/stores/useEventosStore'

const tesoreriaStore = useTesoreriaStore()
const sociosStore = useSociosStore()
const aspirantesStore = useAspirantesStore()
const eventosStore = useEventosStore()

const { totalSocios } = storeToRefs(sociosStore)
const { totalAspirantes } = storeToRefs(aspirantesStore)
const { presupuestoReservado, balanceDisponible } = storeToRefs(eventosStore)

const {
  ingresos,
  egresos,
  mensualidades,
  totalIngresos,
  totalEgresos,
  totalMensualidades,
  balance,
  sinRevisar,
  revisadas,
  porcentajeRevisadas,
  metodosPago,
  totalTransacciones,
  resumenMensual,
} = storeToRefs(tesoreriaStore)

const maxMetodo = computed(() => {
  if (metodosPago.value.length === 0) return 1
  return Math.max(...metodosPago.value.map((m) => m.monto))
})

const maxMensual = computed(() => {
  if (resumenMensual.value.length === 0) return 1
  return Math.max(
    ...resumenMensual.value.map((m) => Math.max(m.ingresos, m.egresos, m.mensualidades)),
  )
})

const formatMonto = (valor) => {
  return Number(valor).toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const coloresMetodo = [
  'bg-primary-600',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
]
</script>

<template>
  <div class="w-[92%] sm:w-11/12 md:w-3/4 mx-auto mt-5 space-y-5">
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <i class="bi bi-arrow-down-circle-fill text-emerald-600"></i>
          </div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ingresos</span>
        </div>
        <span class="text-xl font-bold text-emerald-600">${{ formatMonto(totalIngresos) }}</span>
        <span class="text-xs text-gray-400">{{ ingresos.length }} transacciones</span>
      </div>

      <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <i class="bi bi-arrow-up-circle-fill text-rose-600"></i>
          </div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Egresos</span>
        </div>
        <span class="text-xl font-bold text-rose-600">-${{ formatMonto(totalEgresos) }}</span>
        <span class="text-xs text-gray-400">{{ egresos.length }} transacciones</span>
      </div>

      <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-600/10 flex items-center justify-center">
            <i class="bi bi-calendar-check-fill text-primary-600"></i>
          </div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >Mensualidades</span
          >
        </div>
        <span class="text-xl font-bold text-primary-600"
          >${{ formatMonto(totalMensualidades) }}</span
        >
        <span class="text-xs text-gray-400">{{ mensualidades.length }} pagos</span>
      </div>

      <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow"
        :class="balance >= 0 ? 'ring-1 ring-emerald-200' : 'ring-1 ring-rose-200'"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="balance >= 0 ? 'bg-emerald-50' : 'bg-rose-50'"
          >
            <i
              class="bi bi-wallet2"
              :class="balance >= 0 ? 'text-emerald-600' : 'text-rose-600'"
            ></i>
          </div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Balance Caja</span>
        </div>
        <span
          class="text-xl font-bold"
          :class="balance >= 0 ? 'text-emerald-600' : 'text-rose-600'"
        >
          {{ balance >= 0 ? '+' : '' }}${{ formatMonto(balance) }}
        </span>
        <span class="text-xs text-gray-400">{{ totalTransacciones }} total</span>
      </div>

      <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <i class="bi bi-bookmark-dash-fill text-amber-600"></i>
          </div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reservado</span>
        </div>
        <span class="text-xl font-bold text-amber-600">${{ formatMonto(presupuestoReservado) }}</span>
        <span class="text-xs text-gray-400">Eventos activos</span>
      </div>

      <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow ring-1 ring-blue-200"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <i class="bi bi-wallet2 text-blue-600"></i>
          </div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Disponible</span>
        </div>
        <span class="text-xl font-bold text-blue-600">${{ formatMonto(balanceDisponible) }}</span>
        <span class="text-xs text-gray-400">Saldo disponible real</span>
      </div>

    </div>
    <div class="grid grid-cols-2 gap-3">
      <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-600/10 flex items-center justify-center">
            <i class="bi bi-people-fill text-primary-600"></i>
          </div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Socios</span>
        </div>
        <span class="text-xl font-bold text-primary-600">{{ totalSocios }}</span>
        <span class="text-xs text-gray-400">miembros activos</span>
      </div>
  
      <div
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-600/10 flex items-center justify-center">
            <i class="bi bi-person-plus-fill text-primary-600"></i>
          </div>
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wide"
            >Aspirantes</span
          >
        </div>
        <span class="text-xl font-bold text-primary-600">{{ totalAspirantes }}</span>
        <span class="text-xs text-gray-400">en espera</span>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wide">
            Estado de Mensualidades
          </h3>
          <span
            class="text-xs font-semibold px-2.5 py-1 rounded-full"
            :class="
              porcentajeRevisadas >= 80
                ? 'bg-emerald-50 text-emerald-700'
                : porcentajeRevisadas >= 50
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
            "
          >
            {{ porcentajeRevisadas }}% revisado
          </span>
        </div>

        <div class="flex items-center gap-6 mb-5">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
              <i class="bi bi-clock-history text-rose-600 text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-rose-600">{{ sinRevisar }}</p>
              <p class="text-xs text-gray-400 font-medium">Sin revisar</p>
            </div>
          </div>
          <div class="h-10 w-px bg-gray-200"></div>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <i class="bi bi-check-circle-fill text-emerald-600 text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-emerald-600">{{ revisadas }}</p>
              <p class="text-xs text-gray-400 font-medium">Revisadas</p>
            </div>
          </div>
        </div>

        <div class="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-700 ease-out"
            :class="
              porcentajeRevisadas >= 80
                ? 'bg-emerald-500'
                : porcentajeRevisadas >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
            "
            :style="{ width: porcentajeRevisadas + '%' }"
          ></div>
        </div>
        <div class="flex justify-between mt-2">
          <span class="text-xs text-gray-400">0%</span>
          <span class="text-xs text-gray-400">100%</span>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wide mb-4">
          Métodos de Pago
        </h3>

        <div v-if="metodosPago.length === 0" class="flex items-center justify-center py-8">
          <p class="text-gray-400 text-sm">Sin datos disponibles</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="(metodo, index) in metodosPago" :key="metodo.nombre" class="group">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <div
                  class="w-2.5 h-2.5 rounded-full"
                  :class="coloresMetodo[index % coloresMetodo.length]"
                ></div>
                <span class="text-sm font-semibold text-gray-700 capitalize">{{
                  metodo.nombre
                }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs text-gray-400">{{ metodo.cantidad }} ops</span>
                <span class="text-sm font-bold text-gray-800"
                  >${{ formatMonto(metodo.monto) }}</span
                >
              </div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500 ease-out"
                :class="coloresMetodo[index % coloresMetodo.length]"
                :style="{ width: (metodo.monto / maxMetodo) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 class="font-bold text-gray-800 text-sm uppercase tracking-wide mb-5">Resumen Mensual</h3>

      <div v-if="resumenMensual.length === 0" class="flex items-center justify-center py-10">
        <p class="text-gray-400 text-sm">Sin datos disponibles</p>
      </div>

      <div v-else>
        <div class="flex items-center gap-5 mb-4">
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-sm bg-emerald-500"></div>
            <span class="text-xs text-gray-500 font-medium">Ingresos</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-sm bg-rose-500"></div>
            <span class="text-xs text-gray-500 font-medium">Egresos</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="w-3 h-3 rounded-sm bg-blue-500"></div>
            <span class="text-xs text-gray-500 font-medium">Mensualidades</span>
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="mes in resumenMensual" :key="mes.clave">
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm font-semibold text-gray-700 w-20">{{ mes.label }}</span>
              <div class="flex items-center gap-4 text-xs">
                <span class="text-emerald-600 font-semibold"
                  >+${{ formatMonto(mes.ingresos) }}</span
                >
                <span class="text-rose-600 font-semibold">-${{ formatMonto(mes.egresos) }}</span>
                <span class="text-blue-600 font-semibold"
                  >${{ formatMonto(mes.mensualidades) }}</span
                >
              </div>
            </div>
            <div class="flex gap-1 h-5">
              <div
                class="bg-emerald-500 rounded-sm transition-all duration-500 ease-out min-w-0.5"
                :style="{ width: (mes.ingresos / maxMensual) * 100 + '%' }"
                v-if="mes.ingresos > 0"
              ></div>
              <div
                class="bg-rose-500 rounded-sm transition-all duration-500 ease-out min-w-0.5"
                :style="{ width: (mes.egresos / maxMensual) * 100 + '%' }"
                v-if="mes.egresos > 0"
              ></div>
              <div
                class="bg-blue-500 rounded-sm transition-all duration-500 ease-out min-w-0.5"
                :style="{ width: (mes.mensualidades / maxMensual) * 100 + '%' }"
                v-if="mes.mensualidades > 0"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
