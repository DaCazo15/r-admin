<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  },
  size: {
    type: String,
    default: 'md', // 'sm', 'md', 'lg'
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs'

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-md hover:-translate-y-0.5 focus:ring-primary-600/50',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-600/50',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md hover:-translate-y-0.5 focus:ring-rose-500',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 shadow-none border-transparent',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const computedClasses = computed(() => {
  return [
    baseClasses,
    variants[props.variant],
    sizes[props.size],
    props.block ? 'w-full' : '',
  ].join(' ')
})

const onClick = (event) => {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="computedClasses"
    @click="onClick"
  >
    <div v-if="loading" class="mr-2 animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
    <slot />
  </button>
</template>
