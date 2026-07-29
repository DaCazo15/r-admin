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
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'

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
        let userClub = 'Isla de Margarita'
        let userNombre = 'Usuario'

        const emailKey = user.email.toLowerCase().trim()
        const userDocRef = doc(db, 'usuarios', emailKey)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data()
          userClub = userData.club || 'Isla de Margarita'
          userRol = userData.rol?.toLowerCase() || 'socio'
          userNombre = userData.nombre || 'Usuario'
        } else {
          // Fallback retroactivo: Buscar en la colección de persona por correo
          const q = query(collection(db, 'persona'), where('correo', '==', user.email))
          const snapshot = await getDocs(q)
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data()
            userClub = docData.club || 'Isla de Margarita'
            userRol = docData.rol?.toLowerCase() || 'socio'
            userNombre = docData.nombre || 'Usuario'

            // Migración automática a la colección 'usuarios'
            await setDoc(userDocRef, {
              nombre: userNombre,
              correo: emailKey,
              rol: userRol,
              club: userClub,
              createdAt: new Date(),
            })
          } else {
            // Fallback de último recurso
            userRol = 'presidente'
            userClub = 'Isla de Margarita'
          }
        }

        // 2. Intentar buscar si está asignado a un cargo en la Junta Directiva de SU club
        const juntaDocId = userClub === 'Isla de Margarita' ? 'junta_directiva' : userClub
        const juntaRef = doc(db, 'junta', juntaDocId)
        const juntaSnap = await getDoc(juntaRef)
        if (juntaSnap.exists()) {
          const juntaData = juntaSnap.data()
          const cargos = ['presidente', 'vicepresidente', 'secretario', 'tesorero', 'macero', 'membresia']
          for (const cargo of cargos) {
            if (juntaData[cargo] && juntaData[cargo].correo?.toLowerCase().trim() === emailKey) {
              userRol = cargo
              break
            }
          }
        }

        rol.value = userRol
        club.value = userClub
        console.log(`Rol cargado para el usuario ${user.email}: ${rol.value} (Club: ${club.value})`)
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error)
        rol.value = 'socio'
        club.value = 'Isla de Margarita'
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
