<script setup>
import { useConfirm } from '@/composables/useConfirm'

const { isVisible, dialogConfig, handleConfirm, handleCancel } = useConfirm()

const getConfirmButtonClass = () => {
  if (dialogConfig.value.confirmStyle === 'danger') {
    return 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
  }
  return 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-600/50'
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 sm:p-0"
      @click.self="handleCancel"
    >
      <Transition
        enter-active-class="transition duration-300 ease-out transform"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition duration-200 ease-in transform"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div
          v-if="isVisible"
          class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        >
          <div class="px-6 py-5">
            <h3 class="text-lg font-bold text-gray-900 mb-2">
              {{ dialogConfig.title }}
            </h3>
            <p class="text-sm text-gray-600 whitespace-pre-line">
              {{ dialogConfig.message }}
            </p>
          </div>
          <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
            <button
              @click="handleCancel"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600/50 transition-colors"
            >
              {{ dialogConfig.cancelText }}
            </button>
            <button
              @click="handleConfirm"
              class="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              :class="getConfirmButtonClass()"
            >
              {{ dialogConfig.confirmText }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
