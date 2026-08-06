<script setup>
import { ref, onMounted, computed } from 'vue'
import { query, where, collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useSesionStore } from '@/stores/useSesionStore'
import { storeToRefs } from 'pinia'
import { cambiarPassword } from '@/services/cuentaService.js'

// Componentes modulares de presentación
import PerfilBanner from '@/components/perfil/PerfilBanner.vue'
import PerfilInfoTab from '@/components/perfil/PerfilInfoTab.vue'
import PerfilFormTab from '@/components/perfil/PerfilFormTab.vue'
import PerfilLinktreeView from '@/components/perfil/PerfilLinktreeView.vue'

const sesionStore = useSesionStore()
const { usuario, rol } = storeToRefs(sesionStore)

const nombreUser = ref('')
const datosPersona = ref(null)
const docId = ref('')
const config = ref(false)
const linktree = ref(false)
const modoEdicion = ref(false)
const isSaving = ref(false)
const errorMsg = ref('')
const exitoMsg = ref('')

// Formulario de edición
const form = ref({
  nombre: '',
  telefono: '',
  ubicacion: '',
  fecha: '',
  edad: '',
  // Redes
  instagram: '',
  facebook: '',
  github: '',
  linkedin: '',
  cvUrl: '',
  // Laboral
  empleo: '',
  cargo: '',
  fechaInicio: '',
  instagramEmpresa: '',
  // Cambio de contraseña
  contraseñaActual: '',
  nuevaContraseña: '',
  confirmarNuevaContraseña: '',
})

const getUsuario = async () => {
  if (!usuario.value?.email) return
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'persona'),
        where('correo', '==', usuario.value.email),
        where('club', '==', sesionStore.club),
      ),
    )
    if (!snapshot.empty) {
      const docData = snapshot.docs[0]
      datosPersona.value = docData.data()
      docId.value = docData.id
      nombreUser.value = datosPersona.value.nombre

      // Llenar formulario
      form.value.nombre = datosPersona.value.nombre || ''
      form.value.telefono = datosPersona.value.telefono || ''
      form.value.ubicacion = datosPersona.value.ubicacion || ''
      form.value.fecha = datosPersona.value.fecha || ''
      form.value.edad = datosPersona.value.edad || ''
      // Redes
      form.value.instagram = datosPersona.value.instagram || ''
      form.value.facebook = datosPersona.value.facebook || ''
      form.value.github = datosPersona.value.github || ''
      form.value.linkedin = datosPersona.value.linkedin || ''
      form.value.cvUrl = datosPersona.value.cvUrl || ''
      // Laboral
      form.value.empleo = datosPersona.value.empleo || ''
      form.value.cargo = datosPersona.value.cargo || ''
      form.value.fechaInicio = datosPersona.value.fechaInicio || ''
      form.value.instagramEmpresa = datosPersona.value.instagramEmpresa || ''
    }
  } catch (error) {
    console.error('Error al obtener los datos del perfil:', error)
  }
}

onMounted(() => {
  getUsuario()
})

const whatsappLink = computed(() => {
  if (!datosPersona.value?.telefono) return '#'
  const tel = datosPersona.value.telefono.replace(/\D/g, '')
  return `https://wa.me/${tel.startsWith('58') ? tel : '58' + tel}`
})

const emailLink = computed(() => {
  if (!usuario.value?.email) return '#'
  return `mailto:${usuario.value.email}`
})

// Lista de redes sociales registradas para el Linktree
const redesRegistradas = computed(() => {
  const list = []
  if (datosPersona.value?.telefono) {
    const tel = datosPersona.value.telefono.replace(/\D/g, '')
    const url = `https://wa.me/${tel.startsWith('58') ? tel : '58' + tel}`
    list.push({
      tipo: 'whatsapp',
      url,
      label: 'WhatsApp',
      icono: 'bi-whatsapp',
      color: 'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xs',
    })
  }
  if (datosPersona.value?.instagram) {
    const user = datosPersona.value.instagram.replace('@', '').trim()
    list.push({
      tipo: 'instagram',
      url: `https://instagram.com/${user}`,
      label: `Instagram (@${user})`,
      icono: 'bi-instagram',
      color:
        'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] hover:opacity-90 text-white shadow-xs',
    })
  }
  if (datosPersona.value?.facebook) {
    const fb = datosPersona.value.facebook.trim()
    const url = fb.startsWith('http') ? fb : `https://facebook.com/${fb}`
    list.push({
      tipo: 'facebook',
      url,
      label: 'Facebook',
      icono: 'bi-facebook',
      color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-xs',
    })
  }
  if (datosPersona.value?.github) {
    const gh = datosPersona.value.github.trim()
    const url = gh.startsWith('http') ? gh : `https://github.com/${gh}`
    list.push({
      tipo: 'github',
      url,
      label: 'GitHub',
      icono: 'bi-github',
      color: 'bg-[#24292e] hover:bg-[#2f363d] text-white shadow-xs',
    })
  }
  if (datosPersona.value?.linkedin) {
    const li = datosPersona.value.linkedin.trim()
    const url = li.startsWith('http') ? li : `https://linkedin.com/in/${li}`
    list.push({
      tipo: 'linkedin',
      url,
      label: 'LinkedIn',
      icono: 'bi-linkedin',
      color: 'bg-[#0077B5] hover:bg-[#006396] text-white shadow-xs',
    })
  }
  if (datosPersona.value?.cvUrl) {
    list.push({
      tipo: 'cv',
      url: datosPersona.value.cvUrl,
      label: 'Descargar Curriculum Vitae (CV)',
      icono: 'bi-file-earmark-pdf-fill',
      color: 'bg-[#E22B26] hover:bg-[#c92420] text-white shadow-xs',
    })
  }
  return list
})

const tieneMasDe4Redes = computed(() => {
  return redesRegistradas.value.length > 4
})

const habilitarEdicion = (tab = 'personal') => {
  modoEdicion.value = true
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  config.value = false
  // Resetear al original
  if (datosPersona.value) {
    form.value.nombre = datosPersona.value.nombre || ''
    form.value.telefono = datosPersona.value.telefono || ''
    form.value.ubicacion = datosPersona.value.ubicacion || ''
    form.value.fecha = datosPersona.value.fecha || ''
    form.value.edad = datosPersona.value.edad || ''
    form.value.instagram = datosPersona.value.instagram || ''
    form.value.facebook = datosPersona.value.facebook || ''
    form.value.github = datosPersona.value.github || ''
    form.value.linkedin = datosPersona.value.linkedin || ''
    form.value.cvUrl = datosPersona.value.cvUrl || ''
    form.value.empleo = datosPersona.value.empleo || ''
    form.value.cargo = datosPersona.value.cargo || ''
    form.value.fechaInicio = datosPersona.value.fechaInicio || ''
    form.value.instagramEmpresa = datosPersona.value.instagramEmpresa || ''
  }
  // Los campos de contraseña nunca se precargan; siempre se limpian al cancelar
  form.value.contraseñaActual = ''
  form.value.nuevaContraseña = ''
  form.value.confirmarNuevaContraseña = ''
  errorMsg.value = ''
  exitoMsg.value = ''
}

// --- Cambio de contraseña (tab "pass" de PerfilFormTab) ---
const guardarCambioPassword = async () => {
  errorMsg.value = ''
  exitoMsg.value = ''

  if (
    !form.value.contraseñaActual ||
    !form.value.nuevaContraseña ||
    !form.value.confirmarNuevaContraseña
  ) {
    errorMsg.value = 'Completá los tres campos para cambiar tu contraseña.'
    return
  }

  if (form.value.nuevaContraseña !== form.value.confirmarNuevaContraseña) {
    errorMsg.value = 'La nueva contraseña y su confirmación no coinciden.'
    return
  }

  isSaving.value = true
  const resultado = await cambiarPassword(form.value.contraseñaActual, form.value.nuevaContraseña)
  isSaving.value = false

  if (resultado.ok) {
    form.value.contraseñaActual = ''
    form.value.nuevaContraseña = ''
    form.value.confirmarNuevaContraseña = ''
    exitoMsg.value = 'Contraseña actualizada con éxito.'
    setTimeout(() => {
      modoEdicion.value = false
      config.value = false
      exitoMsg.value = ''
    }, 1500)
  } else {
    errorMsg.value = resultado.mensaje || 'No se pudo cambiar la contraseña.'
  }
}

const guardarPerfil = async (tab) => {
  if (isSaving.value) return

  // El formulario de "Cambiar Contraseña" comparte el mismo botón Guardar,
  // pero su lógica y validaciones son independientes de los datos de perfil.
  if (tab === 'pass') {
    await guardarCambioPassword()
    return
  }

  if (!docId.value) return
  isSaving.value = true
  errorMsg.value = ''
  exitoMsg.value = ''

  try {
    const docRef = doc(db, 'persona', docId.value)

    // Calcular edad si cambió la fecha de nacimiento y está vacía
    if (form.value.fecha && !form.value.edad) {
      const birth = new Date(form.value.fecha)
      const now = new Date()
      let age = now.getFullYear() - birth.getFullYear()
      const m = now.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--
      }
      form.value.edad = age
    }

    const nuevosDatos = {
      nombre: form.value.nombre.trim(),
      telefono: form.value.telefono.trim(),
      ubicacion: form.value.ubicacion.trim(),
      fecha: form.value.fecha,
      edad: Number(form.value.edad) || '',
      instagram: form.value.instagram.trim(),
      facebook: form.value.facebook.trim(),
      github: form.value.github.trim(),
      linkedin: form.value.linkedin.trim(),
      cvUrl: form.value.cvUrl.trim(),
      empleo: form.value.empleo.trim(),
      cargo: form.value.cargo.trim(),
      fechaInicio: form.value.fechaInicio,
      instagramEmpresa: form.value.instagramEmpresa.trim(),
    }

    await updateDoc(docRef, nuevosDatos)

    // Actualizar también en la colección 'usuarios'
    const emailKey = usuario.value.email.toLowerCase().trim()
    const userDocRef = doc(db, 'usuarios', emailKey)
    await updateDoc(userDocRef, {
      nombre: nuevosDatos.nombre,
    })

    // Actualizar estado local
    nombreUser.value = nuevosDatos.nombre
    datosPersona.value = {
      ...datosPersona.value,
      ...nuevosDatos,
    }

    exitoMsg.value = 'Perfil actualizado con éxito.'
    setTimeout(() => {
      modoEdicion.value = false
      config.value = false
      exitoMsg.value = ''
    }, 1500)
  } catch (error) {
    console.error('Error al actualizar perfil:', error)
    errorMsg.value = 'Ocurrió un error al actualizar los datos.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto mt-10 px-4">
    <!-- Card Principal -->
    <div class="bg-white shadow-md rounded-2xl border border-gray-100 overflow-hidden">
      <!-- Banner Cabecera & Info del Socio (Presentación) -->
      <PerfilBanner
        :nombre-user="nombreUser"
        :rol="rol"
        :club="sesionStore.club"
        :email-link="emailLink"
        :whatsapp-link="whatsappLink"
        :tiene-mas-de-4-redes="tieneMasDe4Redes"
        :modo-edicion="modoEdicion"
        :config="config"
        :linktree="linktree"
        @edit="habilitarEdicion('personal')"
        @toggle-config="config = !config"
        @open-linktree="linktree = true"
        @volver-perfil="linktree = false"
      />

      <!-- Cuerpo del Perfil -->
      <div class="p-6">
        <!-- VISTA 1: INFORMACIÓN DEL PERFIL -->
        <PerfilInfoTab
          v-if="!config && !modoEdicion && !linktree"
          :datos-persona="datosPersona"
          :redes-registradas="redesRegistradas"
          :tiene-mas-de-4-redes="tieneMasDe4Redes"
          @agregar-empleo="habilitarEdicion('laboral')"
        />

        <!-- VISTA 2: COMPONENTE LINKTREE PROFESIONAL -->
        <PerfilLinktreeView
          v-if="linktree && !config && !modoEdicion"
          :nombre-user="nombreUser"
          :rol="rol"
          :club="sesionStore.club"
          :redes-registradas="redesRegistradas"
          :email-link="emailLink"
          :linktree-style="datosPersona?.linktreeStyle || 'classic'"
          :mostrar-contacto="datosPersona?.mostrarContacto !== false"
          :mostrar-laburo="datosPersona?.mostrarLaburo !== false"
          @volver="linktree = false"
        />

        <!-- VISTA 3: AJUSTES / FORMULARIO DE EDICIÓN UNIFICADO CON PESTAÑAS -->
        <PerfilFormTab
          v-if="modoEdicion || config"
          :form="form"
          :is-saving="isSaving"
          :error-msg="errorMsg"
          :exito-msg="exitoMsg"
          :config="config"
          :usuario-email="usuario?.email"
          @save="guardarPerfil"
          @cancel="cancelarEdicion"
          @cerrar-sesion="sesionStore.cerrarSesion"
        />
      </div>
    </div>
  </div>
</template>
