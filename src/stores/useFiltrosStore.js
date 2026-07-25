import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useFiltrosStore = defineStore('filtros', () => {
  const filtros = ref({
    todos: true,
    ingreso: true,
    egreso: true,
    mensualidad: true,
    sinRevisar: true,
    revisado: true,
    min: null,
    max: null,
  })

  watch(
    () => filtros.value.todos,
    (nuevoValor) => {
      filtros.value.ingreso = nuevoValor
      filtros.value.egreso = nuevoValor
      filtros.value.mensualidad = nuevoValor
    },
  )

  watch(
    () => [filtros.value.ingreso, filtros.value.egreso, filtros.value.mensualidad],
    ([ingreso, egreso, mensualidad]) => {
      if (!ingreso || !egreso || !mensualidad) {
        filtros.value.todos = false
      } else if (ingreso && egreso && mensualidad) {
        filtros.value.todos = true
      }
    },
  )

  return { filtros }
})
