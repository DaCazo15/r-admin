import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { CLUB_POR_DEFECTO } from '@/config/constants'
import { actualizarPersona } from '@/services/firebaseService'
import { useSesionStore } from './useSesionStore'

export const useAspirantesStore = defineStore('aspirantes', () => {
  const sesionStore = useSesionStore()

  const aspirantesRaw = useCollection(() => {
    const userClub = sesionStore.club || CLUB_POR_DEFECTO
    return query(
      collection(db, 'persona'),
      where('estatus', '==', 'Aspirantes'),
      where('club', '==', userClub)
    )
  })

  const aspirantes = computed(() => {
    let list = [...(aspirantesRaw.value || [])]
    return list.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return dateB - dateA
    })
  })

  const totalAspirantes = computed(() => aspirantes.value.length)

  const eliminarAspirante = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar a este aspirante?')) {
      try {
        await deleteDoc(doc(db, 'persona', id))
      } catch (error) {
        console.error('Error al eliminar aspirante:', error)
      }
    }
  }

  const editarAspirante = async (id, datosActualizados, isSaving) => {
    return await actualizarPersona(id, datosActualizados, isSaving)
  }

  return {
    aspirantes,
    totalAspirantes,
    eliminarAspirante,
    editarAspirante,
  }
})
