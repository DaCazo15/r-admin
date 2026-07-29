import { describe, it, expect } from 'vitest'

// Función helper para calcular edad
function calcularEdad(fechaNacimiento, fechaActual = new Date()) {
  if (!fechaNacimiento) return ''
  const birth = new Date(fechaNacimiento)
  let age = fechaActual.getFullYear() - birth.getFullYear()
  const m = fechaActual.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && fechaActual.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Función helper para formatear WhatsApp
function formatWhatsapp(telefono) {
  if (!telefono) return '#'
  const tel = telefono.replace(/\D/g, '')
  return `https://wa.me/${tel.startsWith('58') ? tel : '58' + tel}`
}

describe('Lógica de Perfil', () => {
  describe('calcularEdad', () => {
    it('calcula la edad correcta cuando ya pasó el cumpleaños en el año actual', () => {
      const fechaNacimiento = '1995-04-15'
      const fechaActualMock = new Date('2026-07-29')
      expect(calcularEdad(fechaNacimiento, fechaActualMock)).toBe(31)
    })

    it('calcula la edad correcta cuando no ha pasado el cumpleaños en el año actual', () => {
      const fechaNacimiento = '1995-10-20'
      const fechaActualMock = new Date('2026-07-29')
      expect(calcularEdad(fechaNacimiento, fechaActualMock)).toBe(30)
    })

    it('retorna vacío si no se provee fecha', () => {
      expect(calcularEdad(null)).toBe('')
    })
  });

  describe('formatWhatsapp', () => {
    it('genera el link correcto para un número que ya inicia con código de país 58', () => {
      const tel = '+58 414-819-7912'
      expect(formatWhatsapp(tel)).toBe('https://wa.me/584148197912')
    })

    it('agrega el código de país 58 si el número no lo contiene', () => {
      const tel = '4148197912'
      expect(formatWhatsapp(tel)).toBe('https://wa.me/584148197912')
    })

    it('retorna # si no hay teléfono', () => {
      expect(formatWhatsapp(null)).toBe('#')
    })
  })
})
