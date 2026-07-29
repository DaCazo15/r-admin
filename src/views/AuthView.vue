<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSesionStore } from '../stores/useSesionStore'
import { db } from '@/config/firebase'
import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore'

// Subcomponentes modulares de presentación
import AuthHeader from '@/components/auth/AuthHeader.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const router = useRouter()
const sesionStore = useSesionStore()

const tipoAuth = ref('login') // 'login' | 'signup'
const form = ref({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const clubName = ref('')
const clubExiste = ref(null) // null, true, false
const errorMsg = ref('')
const isSubmitting = ref(false)

watch(tipoAuth, () => {
  clubExiste.value = null
  clubName.value = ''
  errorMsg.value = ''
  form.value = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  }
})

const verificarClub = async () => {
  if (!clubName.value.trim()) {
    errorMsg.value = 'Por favor ingresa el nombre del club.'
    return
  }
  errorMsg.value = ''
  isSubmitting.value = true
  try {
    const allClubsSnap = await getDocs(collection(db, 'club'))
    const exists = allClubsSnap.docs.some(
      (doc) => doc.data().club?.toLowerCase().trim() === clubName.value.trim().toLowerCase()
    )

    if (exists) {
      clubExiste.value = true
      errorMsg.value = `El club "${clubName.value}" ya está registrado. Por favor, elige otro nombre o inicia sesión.`
    } else {
      clubExiste.value = false
    }
  } catch (error) {
    console.error('Error al verificar club:', error)
    errorMsg.value = 'Error al verificar el club. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorMsg.value = ''

  try {
    if (tipoAuth.value === 'login') {
      const resultado = await sesionStore.iniciarSesion(form.value.email, form.value.password)
      if (resultado.success) {
        router.push({ name: 'home' })
      } else {
        errorMsg.value = 'Credenciales incorrectas: ' + (resultado.error || 'Verifica tus datos')
      }
    } else {
      if (!form.value.nombre.trim()) {
        errorMsg.value = 'Por favor ingresa tu nombre completo.'
        isSubmitting.value = false
        return
      }
      if (form.value.password !== form.value.confirmPassword) {
        errorMsg.value = 'Las contraseñas no coinciden.'
        isSubmitting.value = false
        return
      }

      const resultado = await sesionStore.registrarUsuario(
        form.value.email,
        form.value.password,
        form.value.nombre.trim()
      )
      if (resultado.success) {
        const normalizedClub = clubName.value.trim()
        const userEmail = form.value.email.toLowerCase().trim()

        await addDoc(collection(db, 'club'), {
          club: normalizedClub,
          mensualidad: 0,
          passEstandar: '',
        })

        // Guardar la persona en la lista de miembros
        await addDoc(collection(db, 'persona'), {
          nombre: form.value.nombre.trim(),
          correo: userEmail,
          rol: 'presidente',
          club: normalizedClub,
          estatus: 'Socios',
          fecha: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          edad: '',
          telefono: '',
          ubicacion: '',
        })

        // Guardar la cuenta en la colección de usuarios
        await setDoc(doc(db, 'usuarios', userEmail), {
          nombre: form.value.nombre.trim(),
          correo: userEmail,
          rol: 'presidente',
          club: normalizedClub,
          createdAt: new Date(),
        })

        // Actualizar sesión
        if (sesionStore.setClubYRol && typeof sesionStore.setClubYRol === 'function') {
          sesionStore.setClubYRol(normalizedClub, 'presidente')
        } else {
          sesionStore.club = normalizedClub
          sesionStore.rol = 'presidente'
        }

        router.push({ name: 'home' })
      } else {
        errorMsg.value = 'Error al registrar: ' + (resultado.error || 'Intenta de nuevo')
      }
    }
  } catch (error) {
    console.error('Error en autenticación:', error)
    errorMsg.value = 'Ocurrió un error inesperado.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-2rem)] w-full flex flex-col justify-center items-center py-6 px-4">
    <!-- Contenedor principal de la tarjeta -->
    <div class="w-full max-w-md">
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100"
      >
        <!-- Cabecera / Pestañas de Navegación -->
        <AuthHeader v-model:tipoAuth="tipoAuth" />

        <!-- Formulario de Entrada (Login) -->
        <LoginForm
          v-if="tipoAuth === 'login'"
          :form="form"
          :error-msg="errorMsg"
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
        />

        <!-- Formulario de Registro (Signup) -->
        <RegisterForm
          v-else
          v-model:clubName="clubName"
          :form="form"
          :club-existe="clubExiste"
          :error-msg="errorMsg"
          :is-submitting="isSubmitting"
          @verifyClub="verificarClub"
          @changeClub="clubExiste = null; errorMsg = ''"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>
