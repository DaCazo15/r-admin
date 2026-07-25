import { ref, computed } from 'vue'

export const useEncabezado = () => {
  const estatus = ref('Socios')

  const encabezados = computed(() => {
    if (estatus.value === 'Socios') {
      return ['Socio', 'Edad', 'Fecha', 'Teléfono', 'Correo', 'Ubicación', 'Acciones']
    }
    if (estatus.value === 'Aspirantes') {
      return ['Aspirante', 'Edad', 'Fecha', 'Teléfono', 'Correo', 'Ubicación', 'Acciones']
    }
    if (estatus.value === 'Tesoreria') {
      return [
        'Nombre',
        'Monto',
        'Referencia',
        'Fecha de Pago',
        'Metodo de Pago',
        'Tipo de Movimiento',
        'Acciones',
      ]
    }
    return []
  })

  return { encabezados, estatus }
}
