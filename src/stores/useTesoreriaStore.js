import { defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useFiltrosStore } from './useFiltrosStore'
import { actualizarEstadoClub } from '@/services/firebaseService'

export const useTesoreriaStore = defineStore('tesoreria', () => {
  const filtrosStore = useFiltrosStore()
  const { filtros } = storeToRefs(filtrosStore)

  const tesoreriaRaw = useCollection(collection(db, 'tesoreria'))
  const eventosRaw = useCollection(collection(db, 'eventos'))

  const tesoreriaRawList = computed(() => tesoreriaRaw.value || [])

  const transacciones = computed(() => {
    let list = [...tesoreriaRawList.value]

    const activosConGastos = (eventosRaw.value || []).filter(
      (e) => e.estatus === 'activo' && Number(e.totalGastado || 0) > 0
    )

    activosConGastos.forEach((e) => {
      list.push({
        id: `evento-gasto-${e.id}`,
        tipoMovimiento: 'egreso',
        monto: Number(e.totalGastado || 0),
        referencia: 'En tránsito',
        fechaPago: e.fecha || (e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt || 0)).toISOString().split('T')[0],
        metodoPago: 'N/A',
        descripcion: `Gasto Evento: ${e.nombre} (Activo)`,
        estatus: 'evento_activo',
        createdAt: e.createdAt,
      })
    })

    if (filtros.value) {
      list = list.filter((item) => {
        if (item.tipoMovimiento === 'ingreso' && !filtros.value.ingreso) return false
        if (item.tipoMovimiento === 'egreso' && !filtros.value.egreso) return false
        if (item.tipoMovimiento === 'mensualidad' && !filtros.value.mensualidad) return false
        if (
          item.tipoMovimiento?.toLowerCase() === 'cuota distrital' &&
          !filtros.value.pagoDistrital
        )
          return false

        if (['mensualidad', 'cuota distrital'].includes(item.tipoMovimiento?.toLowerCase())) {
          if (item.estatus === 'sin revisar' && !filtros.value.sinRevisar) return false
          if (item.estatus === 'revisado' && !filtros.value.revisado) return false
        }

        if (
          filtros.value.min !== null &&
          filtros.value.min !== undefined &&
          filtros.value.min !== ''
        ) {
          if (item.monto < filtros.value.min) return false
        }

        if (
          filtros.value.max !== null &&
          filtros.value.max !== undefined &&
          filtros.value.max !== ''
        ) {
          if (item.monto > filtros.value.max) return false
        }

        return true
      })
    }

    return list.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return dateB - dateA
    })
  })

  const ingresos = computed(() =>
    tesoreriaRawList.value.filter((t) => t.tipoMovimiento === 'ingreso'),
  )
  const egresos = computed(() => {
    const list = tesoreriaRawList.value.filter((t) => t.tipoMovimiento === 'egreso')
    const activosConGastos = (eventosRaw.value || []).filter(
      (e) => e.estatus === 'activo' && Number(e.totalGastado || 0) > 0
    )
    activosConGastos.forEach((e) => {
      list.push({
        id: `evento-gasto-${e.id}`,
        tipoMovimiento: 'egreso',
        monto: Number(e.totalGastado || 0),
        referencia: 'En tránsito',
        fechaPago: e.fecha || (e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt || 0)).toISOString().split('T')[0],
        metodoPago: 'N/A',
        descripcion: `Gasto Evento: ${e.nombre} (Activo)`,
        estatus: 'evento_activo',
        createdAt: e.createdAt,
      })
    })
    return list
  })
  const mensualidades = computed(() =>
    tesoreriaRawList.value.filter((t) => t.tipoMovimiento === 'mensualidad'),
  )
  const pagoDistrital = computed(() =>
    tesoreriaRawList.value.filter((t) => t.tipoMovimiento?.toLowerCase() === 'cuota distrital'),
  )

  const totalIngresos = computed(() =>
    ingresos.value.reduce((sum, t) => sum + Number(t.monto || 0), 0),
  )
  const totalEgresos = computed(() =>
    egresos.value.reduce((sum, t) => sum + Number(t.monto || 0), 0),
  )
  const totalMensualidades = computed(() =>
    mensualidades.value.reduce((sum, t) => sum + Number(t.monto || 0), 0),
  )
  const cuotaDistritalTotal = computed(() =>
    pagoDistrital.value.reduce((sum, t) => sum + Number(t.monto || 0), 0),
  )
  const balance = computed(
    () =>
      totalIngresos.value +
      totalMensualidades.value +
      cuotaDistritalTotal.value -
      totalEgresos.value,
  )

  const sinRevisar = computed(
    () => mensualidades.value.filter((t) => t.estatus === 'sin revisar').length,
  )
  const revisadas = computed(
    () => mensualidades.value.filter((t) => t.estatus === 'revisado').length,
  )
  const porcentajeRevisadas = computed(() => {
    if (mensualidades.value.length === 0) return 0
    return Math.round((revisadas.value / mensualidades.value.length) * 100)
  })

  const metodosPago = computed(() => {
    const mapa = {}
    tesoreriaRawList.value.forEach((t) => {
      const metodo = t.metodoPago || 'Sin especificar'
      if (!mapa[metodo]) mapa[metodo] = { cantidad: 0, monto: 0 }
      mapa[metodo].cantidad++
      mapa[metodo].monto += Number(t.monto || 0)
    })
    return Object.entries(mapa)
      .map(([nombre, datos]) => ({ nombre, ...datos }))
      .sort((a, b) => b.monto - a.monto)
  })

  const totalTransacciones = computed(() => tesoreriaRawList.value.length)

  const resumenMensual = computed(() => {
    const mapa = {}
    const mesesNombres = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ]

    tesoreriaRawList.value.forEach((t) => {
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
  })

  const eliminarTransaccion = async (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
      try {
        await deleteDoc(doc(db, 'tesoreria', id))
      } catch (error) {
        console.error('Error al eliminar transacción:', error)
      }
    }
  }

  const editarTransaccion = async (id, datosActualizados) => {
    try {
      await updateDoc(doc(db, 'tesoreria', id), datosActualizados)
      return { ok: true }
    } catch (error) {
      console.error(error)
      return { ok: false, mensaje: error.message || 'Error al editar transacción.' }
    }
  }

  const syncEstadoClub = async (nombreClub = 'Isla de Margarita') => {
    await actualizarEstadoClub(nombreClub)
  }

  return {
    transacciones,
    ingresos,
    egresos,
    mensualidades,
    pagoDistrital,
    totalIngresos,
    totalEgresos,
    totalMensualidades,
    cuotaDistritalTotal,
    balance,
    sinRevisar,
    revisadas,
    porcentajeRevisadas,
    metodosPago,
    totalTransacciones,
    resumenMensual,
    eliminarTransaccion,
    editarTransaccion,
    syncEstadoClub,
  }
})
