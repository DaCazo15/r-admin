import { ref, computed } from 'vue'

export const useEdicion = () => {
  const registroAEditar = ref(null)
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
