import { ref } from 'vue'

const toasts = ref([])

let nextId = 0

export function useToast() {
  const addToast = (mensaje, tipo = 'info', duracion = 3000) => {
    const id = nextId++
    const toast = { id, mensaje, tipo }
    toasts.value.push(toast)
    setTimeout(() => {
      removeToast(id)
    }, duracion)
    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const exito = (mensaje, duracion) => addToast(mensaje, 'success', duracion)
  const error = (mensaje, duracion) => addToast(mensaje, 'error', duracion)
  const advertencia = (mensaje, duracion) => addToast(mensaje, 'warning', duracion)
  const info = (mensaje, duracion) => addToast(mensaje, 'info', duracion)

  return {
    toasts,
    addToast,
    removeToast,
    exito,
    error,
    advertencia,
    info
  }
}
