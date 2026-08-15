<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'text'
  },
  id: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  min: {
    type: [Number, String],
    default: null
  },
  step: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const onInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="relative group">
    <input
      :type="type"
      :id="id"
      :value="modelValue"
      @input="onInput"
      class="block w-full px-4 pt-5 pb-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-primary-600/50 focus:border-transparent transition-all peer"
      placeholder=" "
      :required="required"
      :min="min"
      :step="step"
    />
    <label
      :for="id"
      class="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-left left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-primary-600 cursor-text"
    >
      {{ label }}
    </label>
  </div>
</template>
