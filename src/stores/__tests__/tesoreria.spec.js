import { describe, it, expect, vi } from 'vitest'

vi.mock('vuefire', () => ({
  useCollection: () => ({ value: [] })
}))

vi.mock('firebase/firestore', () => ({
  collection: () => ({}),
  deleteDoc: () => Promise.resolve(),
  doc: () => ({}),
  updateDoc: () => Promise.resolve(),
}))

vi.mock('@/config/firebase', () => ({
  db: {}
}))

const calculateBalance = ({ ingresos, egresos, mensualidades, pagoDistrital }) => {
  const totalIngresos = ingresos.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  const totalEgresos = egresos.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  const totalMensualidades = mensualidades.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  const cuotaDistritalTotal = pagoDistrital.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  return totalIngresos + totalMensualidades + cuotaDistritalTotal - totalEgresos
}

describe('Cálculos de Tesorería', () => {
  it('calcula el balance correctamente basándose en los tipos de movimiento', () => {
    const mockData = {
      ingresos: [{ monto: 100 }, { monto: 50 }],
      egresos: [{ monto: 30 }],
      mensualidades: [{ monto: 20 }],
      pagoDistrital: [{ monto: 10 }]
    }

    const balance = calculateBalance(mockData)
    expect(balance).toBe(150)
  })

  it('maneja datos vacíos sin fallar', () => {
    const balance = calculateBalance({
      ingresos: [],
      egresos: [],
      mensualidades: [],
      pagoDistrital: []
    })
    expect(balance).toBe(0)
  })
})
