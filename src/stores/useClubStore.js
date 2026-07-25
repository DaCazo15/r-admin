import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { actualizar } from '@/services/firebaseService'

export const useClubStore = defineStore('club', () => {
  const clubData = useCollection(collection(db, 'club'))

  const clubActual = computed(() => {
    const lista = clubData.value || []
    return (
      lista.find((t) => t.club && t.club.toLowerCase().includes('isla de margarita')) || null
    )
  })

  const mensualidadMargarita = computed(() => {
    return clubActual.value ? Number(clubActual.value.mensualidad || 0) : 0
  })

  const actualizarMensualidad = async (nuevoMonto, isSavingRef) => {
    await actualizar(nuevoMonto, 'isla de margarita', isSavingRef)
  }

  return {
    clubData,
    clubActual,
    mensualidadMargarita,
    actualizarMensualidad,
  }
})
