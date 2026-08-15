import { ref } from 'vue'

const isVisible = ref(false)
const dialogConfig = ref({
  title: 'Confirmar acción',
  message: '¿Estás seguro?',
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  confirmStyle: 'primary' // 'primary', 'danger'
})

let resolvePromise = null

export function useConfirm() {
  const confirm = (options) => {
    dialogConfig.value = { ...dialogConfig.value, ...options }
    isVisible.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    isVisible.value = false
    if (resolvePromise) resolvePromise(true)
  }

  const handleCancel = () => {
    isVisible.value = false
    if (resolvePromise) resolvePromise(false)
  }

  return {
    isVisible,
    dialogConfig,
    confirm,
    handleConfirm,
    handleCancel
  }
}
