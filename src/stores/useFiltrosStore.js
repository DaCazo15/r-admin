import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useFiltrosStore = defineStore('filtros', () => {
  const defaultFiltros = {
    todos: true,
    ingreso: true,
    egreso: true,
    mensualidad: true,
    pagoDistrital: true,
    sinRevisar: true,
    revisado: true,
    min: null,
    max: null,
  }

  const loadFiltros = () => {
    try {
      const stored = sessionStorage.getItem('filtrosTesoreria')
      if (stored) return JSON.parse(stored)
    } catch (e) {
      console.error('Error parsing stored filters', e)
    }
    return { ...defaultFiltros }
  }

  const filtros = ref(loadFiltros())

  watch(
    filtros,
    (nuevoFiltros) => {
      sessionStorage.setItem('filtrosTesoreria', JSON.stringify(nuevoFiltros))
    },
    { deep: true }
  )

  watch(
    () => filtros.value.todos,
    (nuevoValor) => {
      filtros.value.ingreso = nuevoValor
      filtros.value.egreso = nuevoValor
      filtros.value.mensualidad = nuevoValor
      filtros.value.pagoDistrital = nuevoValor
    },
  )

  watch(
    () => [
      filtros.value.ingreso,
      filtros.value.egreso,
      filtros.value.mensualidad,
      filtros.value.pagoDistrital,
    ],
    ([ingreso, egreso, mensualidad, pagoDistrital]) => {
      if (!ingreso || !egreso || !mensualidad || !pagoDistrital) {
        filtros.value.todos = false
      } else if (ingreso && egreso && mensualidad && pagoDistrital) {
        filtros.value.todos = true
      }
    },
  )

  return { filtros }
})
