import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSociosStore } from '@/stores/useSociosStore'
import { useClubStore } from '@/stores/useClubStore'
import { plantillasMensaje } from '@/helpers/plantillas'

export const useModalWhatsapp = (cerrarCallback) => {
  const sociosStore = useSociosStore()
  const { socios } = storeToRefs(sociosStore)

  const clubStore = useClubStore()
  const { mensualidadMargarita } = storeToRefs(clubStore)

  const tiposMensaje = [
    { value: 'aviso', label: 'Aviso', icono: 'bi-megaphone-fill' },
    { value: 'recordatorio', label: 'Recordatorio', icono: 'bi-bell-fill' },
    { value: 'cobro', label: 'Cobro', icono: 'bi-cash-coin' },
    { value: 'personalizado', label: 'Personalizado', icono: 'bi-pencil-fill' },
  ]

  const socioSeleccionadoId = ref('')
  const tipoMensaje = ref('aviso')
  const montoCobro = ref(0)
  const mensaje = ref('')
  const error = ref('')

  const socioSeleccionado = computed(
    () => socios.value?.find((s) => s.id === socioSeleccionadoId.value) || null,
  )

  const telefonoLimpio = computed(() => {
    let t = (socioSeleccionado.value?.telefono || '').replace(/\D/g, '')
    if (!t) return ''
    if (t.startsWith('0')) {
      t = t.substring(1)
    }
    if (!t.startsWith('58')) {
      t = '58' + t
    }
    return t
  })

  watch(
    mensualidadMargarita,
    (nuevoValor) => {
      montoCobro.value = nuevoValor
    },
    { immediate: true },
  )

  // Genera el texto de la plantilla según el tipo elegido y el socio actual.
  const generarPlantilla = () => {
    const nombre = socioSeleccionado.value?.nombre?.split(' ')[0] || ''
    const saludo = nombre ? `Hola ${nombre},` : 'Hola,'
    const tipo = tipoMensaje.value

    if (tipo === 'cobro') {
      return plantillasMensaje.cobro(saludo, montoCobro.value)
    }
    if (plantillasMensaje[tipo]) {
      return plantillasMensaje[tipo](saludo)
    }
    return ''
  }

  // Regenera el mensaje cuando cambia el tipo o el socio
  watch([tipoMensaje, socioSeleccionadoId], () => {
    mensaje.value = generarPlantilla()
    error.value = ''
  })

  const limpiar = () => {
    socioSeleccionadoId.value = ''
    tipoMensaje.value = ''
    montoCobro.value = mensualidadMargarita.value
    mensaje.value = ''
    error.value = ''
  }

  const enviar = () => {
    if (!socioSeleccionado.value) {
      error.value = 'Selecciona un socio para enviarle el mensaje.'
      return
    }
    if (!telefonoLimpio.value) {
      error.value = 'Este socio no tiene un teléfono registrado.'
      return
    }
    if (!mensaje.value.trim()) {
      error.value = 'El mensaje no puede estar vacío.'
      return
    }

    const texto = encodeURIComponent(mensaje.value.trim())
    window.open(`https://wa.me/${telefonoLimpio.value}?text=${texto}`, '_blank')
    if (cerrarCallback) cerrarCallback()
  }

  return {
    socios,
    tiposMensaje,
    socioSeleccionadoId,
    tipoMensaje,
    montoCobro,
    mensaje,
    error,
    socioSeleccionado,
    telefonoLimpio,
    generarPlantilla,
    limpiar,
    enviar,
  }
}
