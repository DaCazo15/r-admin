import { defineStore, storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useCollection } from 'vuefire'
import { collection, query, where } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useTesoreriaStore } from './useTesoreriaStore'
import { useSesionStore } from './useSesionStore'
import {
  crearEvento,
  actualizarEvento,
  registrarGastoEvento,
  eliminarGastoEvento,
  finalizarEvento as finalizarEventoService,
  eliminarEventoCompleto,
} from '@/services/firebaseService'

export const useEventosStore = defineStore('eventos', () => {
  const tesoreriaStore = useTesoreriaStore()
  const { balance } = storeToRefs(tesoreriaStore)
  const sesionStore = useSesionStore()

  const eventosRaw = useCollection(() => {
    const userClub = sesionStore.club || 'Isla de Margarita'
    return query(collection(db, 'eventos'), where('club', '==', userClub))
  })

  const eventos = computed(() => {
    let list = [...(eventosRaw.value || [])]
    return list.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
      return dateB - dateA
    })
  })

  const eventosActivos = computed(() => eventos.value.filter((e) => e.estatus !== 'finalizado'))
  const eventosFinalizados = computed(() => eventos.value.filter((e) => e.estatus === 'finalizado'))

  const totalEventos = computed(() => eventos.value.length)

  // Suma de los presupuestos reservados por eventos que aún no se han finalizado
  const presupuestoReservado = computed(() =>
    eventosActivos.value.reduce((sum, e) => sum + Number(e.presupuesto || 0), 0),
  )

  // Balance del club menos lo ya reservado en eventos activos
  const balanceDisponible = computed(() => balance.value - presupuestoReservado.value)

  // `totalGastado` es un acumulado que Firestore mantiene de forma atómica
  // (ver registrarGastoEvento/eliminarGastoEvento en firebaseService.js), ya
  // no se calcula sumando un array local — así evitamos "last write wins"
  // cuando dos personas registran gastos casi al mismo tiempo.
  const gastosDeEvento = (evento) => Number(evento?.totalGastado || 0)

  const restanteDeEvento = (evento) => Number(evento?.presupuesto || 0) - gastosDeEvento(evento)

  /**
   * Crea o actualiza un evento. En ambos casos el presupuesto solicitado
   * nunca puede superar el balance disponible para eventos.
   * Devuelve { ok, mensaje } para que el componente muestre el error si aplica.
   */
  const guardarEvento = async (datosForm, eventoExistente, isSaving) => {
    const presupuesto = Number(datosForm.presupuesto)

    if (presupuesto <= 0) {
      return { ok: false, mensaje: 'El presupuesto debe ser mayor a 0.' }
    }

    if (eventoExistente?.id) {
      // Al editar, "liberamos" primero el presupuesto actual del evento
      // para calcular correctamente cuánto hay disponible para el nuevo monto.
      const disponibleParaEsteEvento =
        balanceDisponible.value + Number(eventoExistente.presupuesto || 0)

      if (presupuesto > disponibleParaEsteEvento) {
        return {
          ok: false,
          mensaje: `El presupuesto no puede ser mayor al balance disponible ($${disponibleParaEsteEvento.toFixed(2)}).`,
        }
      }

      if (presupuesto < gastosDeEvento(eventoExistente)) {
        return {
          ok: false,
          mensaje: 'El presupuesto no puede ser menor a lo ya gastado en el evento.',
        }
      }

      await actualizarEvento(
        eventoExistente.id,
        {
          nombre: datosForm.nombre,
          descripcion: datosForm.descripcion,
          fecha: datosForm.fecha,
          presupuesto,
        },
        isSaving,
      )
      return { ok: true }
    }

    if (presupuesto > balanceDisponible.value) {
      return {
        ok: false,
        mensaje: `El presupuesto no puede ser mayor al balance disponible ($${balanceDisponible.value.toFixed(2)}).`,
      }
    }

    const userClub = sesionStore.club || 'Isla de Margarita'
    await crearEvento(
      {
        nombre: datosForm.nombre,
        descripcion: datosForm.descripcion,
        fecha: datosForm.fecha,
        presupuesto,
      },
      isSaving,
      userClub,
    )
    return { ok: true }
  }

  /**
   * Registra un gasto contra un evento. La validación real (que el monto no
   * exceda el restante) ocurre DENTRO de una transacción de Firestore en
   * registrarGastoEvento, que es la fuente de verdad. Aquí hacemos además un
   * chequeo rápido con los datos que ya tenemos localmente, solo para dar
   * feedback instantáneo sin esperar el viaje al servidor.
   */
  const registrarGasto = async (evento, gasto, isSaving) => {
    const monto = Number(gasto.monto)

    if (monto <= 0) {
      return { ok: false, mensaje: 'El monto debe ser mayor a 0.' }
    }

    if (monto > restanteDeEvento(evento)) {
      return {
        ok: false,
        mensaje: `El gasto excede el presupuesto restante del evento ($${restanteDeEvento(evento).toFixed(2)}).`,
      }
    }

    return await registrarGastoEvento(evento.id, gasto, isSaving)
  }

  const eliminarGasto = async (evento, gastoId, isSaving) => {
    await eliminarGastoEvento(evento.id, gastoId, isSaving)
  }

  const finalizarEvento = async (evento, isSaving) => {
    const sobrante = restanteDeEvento(evento)
    const confirmacion = confirm(
      `¿Finalizar "${evento.nombre}"?\n\nSe liberarán $${sobrante.toFixed(2)} de vuelta al balance disponible y se registrará $${gastosDeEvento(evento).toFixed(2)} como egreso en Tesorería.`,
    )
    if (!confirmacion) return
    await finalizarEventoService(evento, isSaving)
  }

  const eliminarEvento = async (id) => {
    if (
      confirm('¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.')
    ) {
      try {
        await eliminarEventoCompleto(id)
        console.log('Evento y sus gastos eliminados con éxito de Firestore')
      } catch (error) {
        console.error('Error al eliminar evento:', error)
      }
    }
  }

  return {
    eventos,
    eventosActivos,
    eventosFinalizados,
    totalEventos,
    presupuestoReservado,
    balanceDisponible,
    gastosDeEvento,
    restanteDeEvento,
    guardarEvento,
    registrarGasto,
    eliminarGasto,
    finalizarEvento,
    eliminarEvento,
  }
})
