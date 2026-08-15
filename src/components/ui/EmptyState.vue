<script setup>
defineProps({
  icon: {
    type: String,
    default: 'bi-inbox'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>

<template>
  <div class="w-3/4 flex bg-white mx-auto rounded-2xl border border-gray-200 shadow-xs p-10 flex-col items-center text-center">
    <div
      class="w-14 h-14 rounded-full bg-primary-600/10 flex items-center justify-center mb-3 border border-primary-600/20"
    >
      <i class="bi text-2xl text-primary-600" :class="icon"></i>
    </div>
    
    <p class="text-sm font-semibold text-gray-700">{{ title }}</p>
    
    <p v-if="description" class="text-xs text-gray-500 mt-1 max-w-xs">
      {{ description }}
    </p>
    
    <button
      v-if="actionText"
      @click="$emit('action')"
      class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600/10 text-primary-700 hover:bg-primary-600/20 font-semibold text-sm rounded-lg transition-all duration-200 active:scale-95"
    >
      <i class="bi bi-plus-lg"></i>
      {{ actionText }}
    </button>
  </div>
</template>
