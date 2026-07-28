import { ref } from 'vue'

export const persona = ref({
  nombre: '',
  edad: '',
  fecha: '',
  telefono: '',
  correo: '',
  ubicacion: '',
  estatus: '',
})

export const form = ref({
  nombre: '',
  descripcion: '',
  monto: '',
  referencia: '',
  fechaPago: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
  tipoPago: '',
  tipoMovimiento: '',
  mes: new Date().toLocaleString('es-ES', { month: 'long' }), // Mes actual capitalizado por defecto
})

export const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export const alianza = ref({
  nombre: '',
  tipo: '',
  descripcion: '',
  contacto: '',
  correo: '',
  telefono: '',
  sitioWeb: '',
})

export const eventoForm = ref({
  nombre: '',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  presupuesto: '',
})

export const gastoForm = ref({
  descripcion: '',
  monto: '',
  fecha: new Date().toISOString().split('T')[0],
})
