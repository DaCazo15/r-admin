import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useDocument } from 'vuefire'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { CLUB_POR_DEFECTO, JUNTA_DOC_ID_POR_DEFECTO } from '@/config/constants'
import { useSesionStore } from './useSesionStore'

export const cargosDefinidos = [
  {
    key: 'presidente',
    label: 'Presidente',
    categoria: 'mesa',
    icono: 'bi-award-fill',
    color: 'bg-primary-600',
  },
  {
    key: 'vicepresidente',
    label: 'Vicepresidente',
    categoria: 'mesa',
    icono: 'bi-star-fill',
    color: 'bg-primary-600',
  },
  {
    key: 'secretario',
    label: 'Secretario',
    categoria: 'mesa',
    icono: 'bi-journal-bookmark-fill',
    color: 'bg-primary-600',
  },
  {
    key: 'tesorero',
    label: 'Tesorero',
    categoria: 'mesa',
    icono: 'bi-cash-coin',
    color: 'bg-primary-600',
  },
  {
    key: 'macero',
    label: 'Macero',
    categoria: 'mesa',
    icono: 'bi-shield-fill-check',
    color: 'bg-primary-600',
  },
  {
    key: 'membresia',
    label: 'Membresía',
    categoria: 'mesa',
    icono: 'bi-people-fill',
    color: 'bg-primary-600',
  },
  {
    key: 'imagenPublica',
    label: 'Imagen Pública',
    categoria: 'subcomite',
    icono: 'bi-megaphone-fill',
    color: 'bg-teal-600',
  },
  {
    key: 'fundacionRotaria',
    label: 'Fundación Rotaria',
    categoria: 'subcomite',
    icono: 'bi-globe-americas',
    color: 'bg-teal-600',
  },
  {
    key: 'servicioClub',
    label: 'Servicio al Club',
    categoria: 'subcomite',
    icono: 'bi-heart-fill',
    color: 'bg-teal-600',
  },
  {
    key: 'comiteRosa',
    label: 'Comité Rosa',
    categoria: 'subcomite',
    icono: 'bi-ribbon-fill',
    color: 'bg-teal-600',
  },
]

export const useJuntaStore = defineStore('junta', () => {
  const sesionStore = useSesionStore()

  const juntaActualRaw = useDocument(() => {
    const userClub = sesionStore.club || CLUB_POR_DEFECTO
    const juntaDocId = userClub === CLUB_POR_DEFECTO ? JUNTA_DOC_ID_POR_DEFECTO : userClub
    return doc(db, 'junta', juntaDocId)
  })
  const isSaving = ref(false)

  const juntaActual = computed(() => juntaActualRaw.value || null)

  const juntaConfirmada = computed(() => {
    if (!juntaActual.value) return false
    return juntaActual.value.confirmada === true
  })

  const guardarJunta = async (datosJunta) => {
    isSaving.value = true
    try {
      const userClub = sesionStore.club || CLUB_POR_DEFECTO
      const juntaDocId = userClub === CLUB_POR_DEFECTO ? JUNTA_DOC_ID_POR_DEFECTO : userClub
      const docRef = doc(db, 'junta', juntaDocId)
      await setDoc(docRef, {
        ...datosJunta,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error al guardar junta directiva:', error)
    } finally {
      isSaving.value = false
    }
  }

  return {
    juntaActual,
    juntaConfirmada,
    isSaving,
    guardarJunta,
  }
})
