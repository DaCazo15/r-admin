import { describe, it, expect, vi } from 'vitest'

vi.mock('vuefire', () => ({
  useCollection: () => ({ value: [] })
}))

vi.mock('firebase/firestore', () => ({
  collection: () => ({}),
  deleteDoc: () => Promise.resolve(),
  doc: () => ({}),
  updateDoc: () => Promise.resolve(),
  query: () => ({}),
  where: () => ({}),
}))

vi.mock('@/config/firebase', () => ({
  db: {}
}))

vi.mock('@/services/firebaseService', () => ({
  actualizarEstadoClub: vi.fn(() => Promise.resolve({ ok: true }))
}))

const calculateBalance = ({ ingresos, egresos, mensualidades, pagoDistrital }) => {
  const totalIngresos = ingresos.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  const totalEgresos = egresos.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  const totalMensualidades = mensualidades.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  const cuotaDistritalTotal = pagoDistrital.reduce((sum, t) => sum + Number(t.monto || 0), 0)
  return totalIngresos + totalMensualidades + cuotaDistritalTotal - totalEgresos
}

const filtrarTransacciones = (list, filtros) => {
  return list.filter((item) => {
    if (item.tipoMovimiento === 'ingreso' && !filtros.ingreso) return false
    if (item.tipoMovimiento === 'egreso' && !filtros.egreso) return false
    if (item.tipoMovimiento === 'mensualidad' && !filtros.mensualidad) return false
    if (item.tipoMovimiento?.toLowerCase() === 'cuota distrital' && !filtros.pagoDistrital) return false

    if (['mensualidad', 'cuota distrital'].includes(item.tipoMovimiento?.toLowerCase())) {
      if (item.estatus === 'sin revisar' && !filtros.sinRevisar) return false
      if (item.estatus === 'revisado' && !filtros.revisado) return false
    }

    if (filtros.min !== null && filtros.min !== undefined && filtros.min !== '') {
      if (item.monto < filtros.min) return false
    }

    if (filtros.max !== null && filtros.max !== undefined && filtros.max !== '') {
      if (item.monto > filtros.max) return false
    }

    return true
  })
}

const calcularResumenMensual = (transacciones) => {
  const mapa = {}
  const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  transacciones.forEach((t) => {
    let fecha = null
    if (t.createdAt?.toDate) fecha = t.createdAt.toDate()
    else if (t.createdAt) fecha = new Date(t.createdAt)
    if (!fecha) return

    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
    const label = `${mesesNombres[fecha.getMonth()]} ${fecha.getFullYear()}`

    if (!mapa[clave]) mapa[clave] = { clave, label, ingresos: 0, egresos: 0, mensualidades: 0 }

    const monto = Number(t.monto || 0)
    if (t.tipoMovimiento === 'ingreso') mapa[clave].ingresos += monto
    else if (t.tipoMovimiento === 'egreso') mapa[clave].egresos += monto
    else if (['mensualidad', 'cuota distrital'].includes(t.tipoMovimiento?.toLowerCase()))
      mapa[clave].mensualidades += monto
  })

  return Object.values(mapa)
    .sort((a, b) => b.clave.localeCompare(a.clave))
    .slice(0, 6)
    .reverse()
}

const calcularMetodosPago = (transacciones) => {
  const mapa = {}
  transacciones.forEach((t) => {
    const metodo = t.metodoPago || 'Sin especificar'
    if (!mapa[metodo]) mapa[metodo] = { cantidad: 0, monto: 0 }
    mapa[metodo].cantidad++
    mapa[metodo].monto += Number(t.monto || 0)
  })
  return Object.entries(mapa)
    .map(([nombre, datos]) => ({ nombre, ...datos }))
    .sort((a, b) => b.monto - a.monto)
}

const calcularPorcentajeRevisadas = (mensualidades) => {
  const revisadas = mensualidades.filter((t) => t.estatus === 'revisado').length
  if (mensualidades.length === 0) return 0
  return Math.round((revisadas / mensualidades.length) * 100)
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

  it('maneja montos como strings numéricos', () => {
    const balance = calculateBalance({
      ingresos: [{ monto: '100' }, { monto: '50.5' }],
      egresos: [{ monto: '20' }],
      mensualidades: [],
      pagoDistrital: []
    })
    expect(balance).toBe(130.5)
  })

  it('maneja montos null o undefined como 0', () => {
    const balance = calculateBalance({
      ingresos: [{ monto: null }, { monto: undefined }, {}],
      egresos: [{ monto: 10 }],
      mensualidades: [],
      pagoDistrital: []
    })
    expect(balance).toBe(-10)
  })

  it('maneja montos NaN como 0', () => {
    const balance = calculateBalance({
      ingresos: [{ monto: 'abc' }],
      egresos: [],
      mensualidades: [],
      pagoDistrital: []
    })
    expect(balance).toBeNaN()
  })
})

describe('Filtros de Transacciones', () => {
  const transaccionesMock = [
    { tipoMovimiento: 'ingreso', monto: 100, estatus: 'n/a' },
    { tipoMovimiento: 'egreso', monto: 50, estatus: 'n/a' },
    { tipoMovimiento: 'mensualidad', monto: 20, estatus: 'sin revisar' },
    { tipoMovimiento: 'mensualidad', monto: 25, estatus: 'revisado' },
    { tipoMovimiento: 'cuota distrital', monto: 15, estatus: 'sin revisar' },
  ]

  it('filtra por tipo de movimiento — solo ingresos', () => {
    const filtros = { ingreso: true, egreso: false, mensualidad: false, pagoDistrital: false, sinRevisar: true, revisado: true, min: '', max: '' }
    const result = filtrarTransacciones(transaccionesMock, filtros)
    expect(result).toHaveLength(1)
    expect(result[0].tipoMovimiento).toBe('ingreso')
  })

  it('filtra por tipo de movimiento — egresos + mensualidades', () => {
    const filtros = { ingreso: false, egreso: true, mensualidad: true, pagoDistrital: false, sinRevisar: true, revisado: true, min: '', max: '' }
    const result = filtrarTransacciones(transaccionesMock, filtros)
    expect(result).toHaveLength(3)
  })

  it('filtra mensualidades por estatus — solo sin revisar', () => {
    const filtros = { ingreso: false, egreso: false, mensualidad: true, pagoDistrital: true, sinRevisar: true, revisado: false, min: '', max: '' }
    const result = filtrarTransacciones(transaccionesMock, filtros)
    expect(result).toHaveLength(2)
    result.forEach(r => expect(r.estatus).toBe('sin revisar'))
  })

  it('filtra por rango de montos — min', () => {
    const filtros = { ingreso: true, egreso: true, mensualidad: true, pagoDistrital: true, sinRevisar: true, revisado: true, min: 25, max: '' }
    const result = filtrarTransacciones(transaccionesMock, filtros)
    expect(result).toHaveLength(3)
    result.forEach(r => expect(r.monto).toBeGreaterThanOrEqual(25))
  })

  it('filtra por rango de montos — min y max', () => {
    const filtros = { ingreso: true, egreso: true, mensualidad: true, pagoDistrital: true, sinRevisar: true, revisado: true, min: 20, max: 50 }
    const result = filtrarTransacciones(transaccionesMock, filtros)
    expect(result).toHaveLength(3)
    result.forEach(r => {
      expect(r.monto).toBeGreaterThanOrEqual(20)
      expect(r.monto).toBeLessThanOrEqual(50)
    })
  })

  it('muestra todo cuando todos los filtros están activos', () => {
    const filtros = { ingreso: true, egreso: true, mensualidad: true, pagoDistrital: true, sinRevisar: true, revisado: true, min: '', max: '' }
    const result = filtrarTransacciones(transaccionesMock, filtros)
    expect(result).toHaveLength(5)
  })

  it('no muestra nada cuando todos los filtros están desactivados', () => {
    const filtros = { ingreso: false, egreso: false, mensualidad: false, pagoDistrital: false, sinRevisar: true, revisado: true, min: '', max: '' }
    const result = filtrarTransacciones(transaccionesMock, filtros)
    expect(result).toHaveLength(0)
  })
})

describe('Egresos con Eventos Activos', () => {
  it('inyecta gastos de eventos activos como egresos virtuales', () => {
    const egresos = [
      { tipoMovimiento: 'egreso', monto: 30 },
    ]
    const eventosActivos = [
      { id: 'ev1', estatus: 'activo', totalGastado: 50, nombre: 'Evento A' },
      { id: 'ev2', estatus: 'activo', totalGastado: 0, nombre: 'Evento B' },
      { id: 'ev3', estatus: 'finalizado', totalGastado: 100, nombre: 'Evento C' },
    ]

    const activosConGastos = eventosActivos.filter(
      (e) => e.estatus === 'activo' && Number(e.totalGastado || 0) > 0
    )
    const egresosConEventos = [...egresos]
    activosConGastos.forEach((e) => {
      egresosConEventos.push({
        id: `evento-gasto-${e.id}`,
        tipoMovimiento: 'egreso',
        monto: Number(e.totalGastado || 0),
        descripcion: `Gasto Evento: ${e.nombre} (Activo)`,
        estatus: 'evento_activo',
      })
    })

    expect(egresosConEventos).toHaveLength(2)
    expect(egresosConEventos[1].monto).toBe(50)
    expect(egresosConEventos[1].id).toBe('evento-gasto-ev1')
  })

  it('no inyecta eventos sin gastos ni finalizados', () => {
    const eventosActivos = [
      { id: 'ev1', estatus: 'activo', totalGastado: 0 },
      { id: 'ev2', estatus: 'finalizado', totalGastado: 100 },
    ]

    const activosConGastos = eventosActivos.filter(
      (e) => e.estatus === 'activo' && Number(e.totalGastado || 0) > 0
    )

    expect(activosConGastos).toHaveLength(0)
  })
})

describe('Resumen Mensual', () => {
  it('agrupa transacciones por mes correctamente', () => {
    const transacciones = [
      { tipoMovimiento: 'ingreso', monto: 100, createdAt: new Date('2025-03-15') },
      { tipoMovimiento: 'egreso', monto: 30, createdAt: new Date('2025-03-20') },
      { tipoMovimiento: 'mensualidad', monto: 50, createdAt: new Date('2025-04-10') },
      { tipoMovimiento: 'ingreso', monto: 200, createdAt: new Date('2025-04-15') },
    ]

    const resumen = calcularResumenMensual(transacciones)
    expect(resumen).toHaveLength(2)

    const marzo = resumen.find(r => r.clave === '2025-03')
    expect(marzo.ingresos).toBe(100)
    expect(marzo.egresos).toBe(30)

    const abril = resumen.find(r => r.clave === '2025-04')
    expect(abril.ingresos).toBe(200)
    expect(abril.mensualidades).toBe(50)
  })

  it('devuelve máximo 6 meses ordenados cronológicamente', () => {
    const transacciones = []
    for (let i = 1; i <= 10; i++) {
      transacciones.push({
        tipoMovimiento: 'ingreso',
        monto: i * 10,
        createdAt: new Date(`2025-${String(i).padStart(2, '0')}-15`),
      })
    }

    const resumen = calcularResumenMensual(transacciones)
    expect(resumen).toHaveLength(6)
    expect(resumen[0].clave).toBe('2025-05')
    expect(resumen[5].clave).toBe('2025-10')
  })

  it('maneja transacciones sin fecha sin fallar', () => {
    const transacciones = [
      { tipoMovimiento: 'ingreso', monto: 100, createdAt: null },
      { tipoMovimiento: 'ingreso', monto: 50, createdAt: new Date('2025-01-15') },
    ]

    const resumen = calcularResumenMensual(transacciones)
    expect(resumen).toHaveLength(1)
    expect(resumen[0].ingresos).toBe(50)
  })

  it('maneja Firestore Timestamp con toDate()', () => {
    const mockTimestamp = { toDate: () => new Date('2025-06-10') }
    const transacciones = [
      { tipoMovimiento: 'egreso', monto: 75, createdAt: mockTimestamp },
    ]

    const resumen = calcularResumenMensual(transacciones)
    expect(resumen).toHaveLength(1)
    expect(resumen[0].egresos).toBe(75)
    expect(resumen[0].label).toBe('Jun 2025')
  })
})

describe('Métodos de Pago', () => {
  it('agrupa transacciones por método de pago', () => {
    const transacciones = [
      { metodoPago: 'Pago Móvil', monto: 100 },
      { metodoPago: 'Pago Móvil', monto: 50 },
      { metodoPago: 'Transferencia', monto: 200 },
    ]

    const result = calcularMetodosPago(transacciones)
    expect(result).toHaveLength(2)
    expect(result[0].nombre).toBe('Transferencia')
    expect(result[0].monto).toBe(200)
    expect(result[0].cantidad).toBe(1)
    expect(result[1].nombre).toBe('Pago Móvil')
    expect(result[1].monto).toBe(150)
    expect(result[1].cantidad).toBe(2)
  })

  it('asigna "Sin especificar" cuando no hay método', () => {
    const transacciones = [{ monto: 50 }]
    const result = calcularMetodosPago(transacciones)
    expect(result[0].nombre).toBe('Sin especificar')
  })

  it('ordena por monto descendente', () => {
    const transacciones = [
      { metodoPago: 'A', monto: 10 },
      { metodoPago: 'B', monto: 100 },
      { metodoPago: 'C', monto: 50 },
    ]
    const result = calcularMetodosPago(transacciones)
    expect(result[0].nombre).toBe('B')
    expect(result[1].nombre).toBe('C')
    expect(result[2].nombre).toBe('A')
  })
})

describe('Porcentaje de Revisadas', () => {
  it('calcula 100% cuando todas están revisadas', () => {
    const mensualidades = [
      { estatus: 'revisado' },
      { estatus: 'revisado' },
    ]
    expect(calcularPorcentajeRevisadas(mensualidades)).toBe(100)
  })

  it('calcula 0% cuando ninguna está revisada', () => {
    const mensualidades = [
      { estatus: 'sin revisar' },
      { estatus: 'sin revisar' },
    ]
    expect(calcularPorcentajeRevisadas(mensualidades)).toBe(0)
  })

  it('calcula porcentaje parcial correctamente', () => {
    const mensualidades = [
      { estatus: 'revisado' },
      { estatus: 'sin revisar' },
      { estatus: 'revisado' },
    ]
    expect(calcularPorcentajeRevisadas(mensualidades)).toBe(67)
  })

  it('devuelve 0 cuando no hay mensualidades', () => {
    expect(calcularPorcentajeRevisadas([])).toBe(0)
  })

  it('redondea al entero más cercano', () => {
    const mensualidades = [
      { estatus: 'revisado' },
      { estatus: 'sin revisar' },
      { estatus: 'sin revisar' },
    ]
    expect(calcularPorcentajeRevisadas(mensualidades)).toBe(33)
  })
})
