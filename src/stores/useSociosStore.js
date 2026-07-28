import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection, query, where, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { actualizarPersona } from '@/services/firebaseService'

export const useSociosStore = defineStore('socios', () => {
  const sociosRaw = useCollection(query(collection(db, 'persona'), where('estatus', '==', 'Socios')))

  const socios = computed(() => {
    let list = [...(sociosRaw.value || [])]
    return list.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return dateB - dateA
    })
  })

  const totalSocios = computed(() => socios.value.length)

  const eliminarSocio = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar a esta persona?')) {
      try {
        await deleteDoc(doc(db, 'persona', id))
      } catch (error) {
        console.error('Error al eliminar socio:', error)
      }
    }
  }

  const editarSocio = async (id, datosActualizados, isSaving) => {
    return await actualizarPersona(id, datosActualizados, isSaving)
  }

  return {
    socios,
    totalSocios,
    eliminarSocio,
    editarSocio,
  }
})
