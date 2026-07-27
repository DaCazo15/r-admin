import { ref, computed } from 'vue'

const registroAEditar = ref(null)

export const useEdicion = () => {
  const modoEdicion = computed(() => registroAEditar.value !== null)

  const iniciarEdicion = (registro) => {
    registroAEditar.value = { ...registro }
  }

  const cancelarEdicion = () => {
    registroAEditar.value = null
  }

  return {
    registroAEditar,
    modoEdicion,
    iniciarEdicion,
    cancelarEdicion,
  }
}

