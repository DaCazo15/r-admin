import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSociosStore } from '@/stores/useSociosStore'
import { useClubStore } from '@/stores/useClubStore'

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
export const socioSeleccionadoId = ref('')
const socioSeleccionado = computed(
  () => socios.value?.find((s) => s.id === socioSeleccionadoId.value) || null,
)
const telefonoLimpio = computed(() => (socioSeleccionado.value?.telefono || '').replace(/\D/g, ''))

export const generarPlantilla = (tipoMensaje) => {
  const nombre = socioSeleccionado.value?.nombre?.split(' ')[0] || ''
  const saludo = nombre ? `Hola ${nombre},` : 'Hola,'

  switch (tipoMensaje) {
    case 'aviso':
      return `${saludo} 📢\n\nTe escribimos desde *Rotaract Isla de Margarita* para informarte:\n\n[Escribe aquí el aviso]\n\n¡Gracias!`
    case 'recordatorio':
      return `${saludo} 👋\n\nTe recordamos que tu *mensualidad* del club está pendiente de pago. Si ya la realizaste, ¡ignora este mensaje y gracias!\n\nCualquier duda, quedamos atentos. 🙌`
    case 'cobro':
      return `${saludo}\n\nTe contactamos desde *Tesorería* de Rotaract Isla de Margarita. Tienes un monto pendiente de *$${Number(montoCobro.value || 0).toFixed(2)}* correspondiente a la mensualidad del club.\n\nPor favor realiza el pago a la brevedad y envíanos el comprobante. ¡Gracias por tu apoyo! 🙏`
    case 'personalizado':
      return `${saludo}\n\n`
    default:
      return ''
  }
}

export const limpiar = (mensaje, error, tipoMensaje) => {
  socioSeleccionadoId.value = ''
  tipoMensaje = 'aviso'
  montoCobro.value = mensualidadMargarita.value
  mensaje = ''
  error = ''
  return {
    mensaje,
    error,
    tipoMensaje,
  }
}

export const enviar = (m) => {
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

  const texto = encodeURIComponent(m.trim())
  window.open(`https://wa.me/${telefonoLimpio.value}?text=${texto}`, '_blank')
}
