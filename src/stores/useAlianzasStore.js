import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { actualizarAlianza } from '@/services/firebaseService'
import { useSesionStore } from './useSesionStore'

export const useAlianzasStore = defineStore('alianzas', () => {
  const sesionStore = useSesionStore()

  const alianzasRaw = useCollection(() => {
    const userClub = sesionStore.club || 'Isla de Margarita'
    return query(collection(db, 'alianzas'), where('club', '==', userClub))
  })

  const alianzas = computed(() => {
    let list = [...(alianzasRaw.value || [])]
    return list.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return dateB - dateA
    })
  })

  const totalAlianzas = computed(() => alianzas.value.length)

  const eliminarAlianza = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta alianza?')) {
      try {
        await deleteDoc(doc(db, 'alianzas', id))
      } catch (error) {
        console.error('Error al eliminar alianza:', error)
      }
    }
  }

  const editarAlianza = async (id, datosActualizados, isSaving) => {
    return await actualizarAlianza(id, datosActualizados, isSaving)
  }

  return {
    alianzas,
    totalAlianzas,
    eliminarAlianza,
    editarAlianza,
  }
})
