import { db } from '@/config/firebase'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'

const inicioDelDia = (fechaStr) => new Date(`${fechaStr}T00:00:00`)
const finDelDia = (fechaStr) => new Date(`${fechaStr}T23:59:59.999`)

const sumar = (lista) => lista.reduce((acc, m) => acc + Number(m.monto || 0), 0)

/**
 * Reporte de Tesorería (ingresos, egresos, mensualidades).
 *
 * La consulta a Firestore filtra por rango de fechas directamente en `fechaPago`
 * (que se guarda como string 'YYYY-MM-DD', por eso el orden lexicográfico = orden
 * cronológico y el rango funciona sin índice compuesto). El filtro por tipo de
 * movimiento ('ingreso' | 'egreso' | 'mensualidad') se aplica en memoria sobre ese
 * subconjunto ya acotado, para no necesitar un índice compuesto en Firestore.
 */
async function reporteTesoreria({ fechaInicio, fechaFin, filtroTipo = null }) {
  const q = query(
    collection(db, 'tesoreria'),
    where('fechaPago', '>=', fechaInicio),
    where('fechaPago', '<=', fechaFin),
    orderBy('fechaPago', 'asc'),
  )

  const snapshot = await getDocs(q)
  let movimientos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  if (filtroTipo) {
    movimientos = movimientos.filter((m) => m.tipoMovimiento === filtroTipo)
  }

  const porTipo = (tipo) => movimientos.filter((m) => m.tipoMovimiento === tipo)
  const ingresos = porTipo('ingreso')
  const egresos = porTipo('egreso')
  const mensualidades = porTipo('mensualidad')

  const totalIngresos = sumar(ingresos)
  const totalEgresos = sumar(egresos)
  const totalMensualidades = sumar(mensualidades)

  const metodosPago = {}
  movimientos.forEach((m) => {
    const metodo = m.metodoPago || 'Sin especificar'
    if (!metodosPago[metodo]) metodosPago[metodo] = { cantidad: 0, monto: 0 }
    metodosPago[metodo].cantidad++
    metodosPago[metodo].monto += Number(m.monto || 0)
  })

  return {
    movimientos,
    totales: {
      ingresos: totalIngresos,
      egresos: totalEgresos,
      mensualidades: totalMensualidades,
      balance: totalIngresos + totalMensualidades - totalEgresos,
      cantidadMovimientos: movimientos.length,
    },
    metodosPago: Object.entries(metodosPago)
      .map(([nombre, datos]) => ({ nombre, ...datos }))
      .sort((a, b) => b.monto - a.monto),
  }
}

/**
 * Reporte de personas (Socios o Aspirantes).
 *
 * Aquí sí filtro en memoria por fecha: la consulta solo trae por `estatus`
 * (igualdad, ya indexado por Firestore de forma automática) y el rango de
 * `createdAt` se aplica en JS. Evita forzar un índice compuesto para una
 * colección que normalmente es chica (decenas/cientos de personas, no miles).
 * Si el club crece mucho, esto se puede migrar a un `where` con rango sobre
 * `createdAt` + índice compuesto, igual que se hizo arriba con `fechaPago`.
 */
async function reportePersonas({ fechaInicio, fechaFin, estatus }) {
  const q = query(collection(db, 'persona'), where('estatus', '==', estatus))
  const snapshot = await getDocs(q)

  const desde = inicioDelDia(fechaInicio)
  const hasta = finDelDia(fechaFin)

  const aFecha = (data) => (data.createdAt?.toDate ? data.createdAt.toDate() : null)

  const personas = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((p) => {
      const fecha = aFecha(p)
      return fecha && fecha >= desde && fecha <= hasta
    })
    .sort((a, b) => aFecha(a) - aFecha(b))

  return {
    personas,
    totales: {
      cantidad: personas.length,
    },
  }
}

/**
 * Punto de entrada único. Recibe el payload que emite ModalReporte.vue
 * ({ tipoReporte, fechaInicio, fechaFin, etiquetaPeriodo }) y devuelve
 * los datos ya filtrados y agregados, listos para pintar o exportar.
 */
export async function generarReporte({ tipoReporte, fechaInicio, fechaFin, etiquetaPeriodo }) {
  let datos

  switch (tipoReporte) {
    case 'ingreso':
    case 'egreso':
    case 'mensualidad':
      datos = await reporteTesoreria({ fechaInicio, fechaFin, filtroTipo: tipoReporte })
      break
    case 'socios':
      datos = await reportePersonas({ fechaInicio, fechaFin, estatus: 'Socios' })
      break
    case 'aspirantes':
      datos = await reportePersonas({ fechaInicio, fechaFin, estatus: 'Aspirantes' })
      break
    case 'general':
    default:
      datos = await reporteTesoreria({ fechaInicio, fechaFin })
      break
  }

  return {
    tipoReporte,
    fechaInicio,
    fechaFin,
    etiquetaPeriodo,
    generadoEn: new Date().toISOString(),
    ...datos,
  }
}
