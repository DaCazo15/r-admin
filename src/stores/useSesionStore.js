import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth, db } from '@/config/firebase'
import { CLUB_POR_DEFECTO, JUNTA_DOC_ID_POR_DEFECTO, ROL_POR_DEFECTO, NOMBRE_POR_DEFECTO } from '@/config/constants'
import { doc, getDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

export const useSesionStore = defineStore('sesion', () => {
  const usuario = ref(null)
  const cargando = ref(true)
  const rol = ref(null)
  const club = ref(null)

  // Observador para mantener la sesión activa al recargar la página
  onAuthStateChanged(auth, async (user) => {
    usuario.value = user
    if (user) {
      try {
        let userRol = null
        let userClub = CLUB_POR_DEFECTO
        let userNombre = NOMBRE_POR_DEFECTO

        const emailKey = user.email.toLowerCase().trim()
        const userDocRef = doc(db, 'usuarios', emailKey)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data()
          userClub = userData.club || CLUB_POR_DEFECTO
          userRol = userData.rol?.toLowerCase() || ROL_POR_DEFECTO
          userNombre = userData.nombre || NOMBRE_POR_DEFECTO
        } else {
          const functions = getFunctions()
          const migrateUser = httpsCallable(functions, 'migrateUser')
          try {
            const result = await migrateUser()
            if (result.data.migrated) {
              userRol = result.data.rol || ROL_POR_DEFECTO
              userClub = result.data.club || CLUB_POR_DEFECTO
              userNombre = result.data.nombre || NOMBRE_POR_DEFECTO
            } else {
              userRol = ROL_POR_DEFECTO
              userClub = CLUB_POR_DEFECTO
            }
          } catch (migrationError) {
            console.error('Error en migración de usuario:', migrationError)
            userRol = ROL_POR_DEFECTO
            userClub = CLUB_POR_DEFECTO
          }
        }

        // 2. Intentar buscar si está asignado a un cargo en la Junta Directiva de SU club
        const juntaDocId = userClub === CLUB_POR_DEFECTO ? JUNTA_DOC_ID_POR_DEFECTO : userClub
        const juntaRef = doc(db, 'junta', juntaDocId)
        const juntaSnap = await getDoc(juntaRef)
        if (juntaSnap.exists()) {
          const juntaData = juntaSnap.data()
          const cargos = [
            'presidente',
            'vicepresidente',
            'secretario',
            'tesorero',
            'macero',
            'membresia',
          ]
          for (const cargo of cargos) {
            if (juntaData[cargo] && juntaData[cargo].correo?.toLowerCase().trim() === emailKey) {
              userRol = cargo
              break
            }
          }
        }

        rol.value = userRol
        club.value = userClub
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error)
        rol.value = ROL_POR_DEFECTO
        club.value = CLUB_POR_DEFECTO
      }
    } else {
      rol.value = null
      club.value = null
    }
    cargando.value = false
  })

  // Iniciar Sesión
  const iniciarSesion = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password)
      usuario.value = response.user
      return { success: true }
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message)
      return { success: false, error: error.message }
    }
  }

  // Registrar Usuario
  const registrarUsuario = async (email, password, displayName) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) {
        await updateProfile(response.user, { displayName })
      }
      usuario.value = response.user
      return { success: true }
    } catch (error) {
      console.error('Error al registrarse:', error.message)
      return { success: false, error: error.message }
    }
  }

  // Cerrar Sesión
  const cerrarSesion = async () => {
    try {
      await signOut(auth)
      usuario.value = null
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message)
    }
  }

  const setClubYRol = (newClub, newRol) => {
    club.value = newClub
    rol.value = newRol
  }

  return {
    usuario,
    cargando,
    rol,
    club,
    iniciarSesion,
    registrarUsuario,
    cerrarSesion,
    setClubYRol,
  }
})
