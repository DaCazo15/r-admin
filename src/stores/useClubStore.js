import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { actualizar } from '@/services/firebaseService'
import { useSesionStore } from './useSesionStore'

export const useClubStore = defineStore('club', () => {
  const clubData = useCollection(collection(db, 'club'))
  const sesionStore = useSesionStore()

  const clubActual = computed(() => {
    const lista = clubData.value || []
    const userClub = sesionStore.club || 'Isla de Margarita'
    return (
      lista.find((t) => t.club && t.club.toLowerCase() === userClub.toLowerCase()) || null
    )
  })

  const mensualidadMargarita = computed(() => {
    return clubActual.value ? Number(clubActual.value.mensualidad || 0) : 0
  })

  const actualizarMensualidad = async (nuevoMonto, isSavingRef) => {
    const userClub = sesionStore.club || 'Isla de Margarita'
    await actualizar(nuevoMonto, userClub, isSavingRef)
  }

  return {
    clubData,
    clubActual,
    mensualidadMargarita,
    actualizarMensualidad,
  }
})
