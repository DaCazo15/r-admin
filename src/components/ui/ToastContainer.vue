<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (tipo) => {
  switch (tipo) {
    case 'success':
      return 'bi-check-circle-fill text-emerald-500'
    case 'error':
      return 'bi-x-circle-fill text-rose-500'
    case 'warning':
      return 'bi-exclamation-triangle-fill text-amber-500'
    default:
      return 'bi-info-circle-fill text-blue-500'
  }
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in absolute"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-2 opacity-0"
      move-class="transition duration-300"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-100 flex items-center gap-3 min-w-62.5 max-w-sm pointer-events-auto"
      >
        <i class="bi text-lg" :class="getIcon(toast.tipo)"></i>
        <p class="text-sm font-medium text-gray-800 flex-1">{{ toast.mensaje }}</p>
        <button
          @click="removeToast(toast.id)"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i class="bi bi-x-lg text-xs"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
