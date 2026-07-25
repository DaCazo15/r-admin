import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '@/config/firebase' // Asegúrate de que la ruta a tu archivo de configuración de firebase sea correcta

export const useSesionStore = defineStore('sesion', () => {
  const usuario = ref(null)
  const cargando = ref(true)

  // Observador para mantener la sesión activa al recargar la página
  onAuthStateChanged(auth, (user) => {
    usuario.value = user
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
  const registrarUsuario = async (email, password) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password)
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

  return {
    usuario,
    cargando,
    iniciarSesion,
    registrarUsuario,
    cerrarSesion,
  }
})
