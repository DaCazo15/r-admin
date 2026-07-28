import { db } from '@/config/firebase'
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  doc,
  writeBatch,
  runTransaction,
} from 'firebase/firestore'

export const firebaseService = {
  async crearPersona(datosSocio) {
    const datosParaSubir = {
      ...datosSocio,
      createdAt: new Date(),
    }
    return await addDoc(collection(db, 'persona'), datosParaSubir)
  },
}

export const actualizar = async (mensualidad, club, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const snapshot = await getDocs(collection(db, 'club'))
    const docEncontrado = snapshot.docs.find(
      (doc) => doc.data().club?.toLowerCase() === club.toLowerCase(),
    )
    if (docEncontrado) {
      await updateDoc(docEncontrado.ref, {
        mensualidad: mensualidad,
      })
    }
  } catch (error) {
    console.error('Hubo un error: ', error)
  } finally {
    isSaving.value = false
  }
}

export const guardarMovimiento = async (movimiento, datos, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const datosPago = {
      tipoMovimiento: movimiento,
      monto: Number(datos.monto),
      referencia: datos.referencia || 'N/A',
      fechaPago: datos.fechaPago,
      metodoPago: datos.tipoPago,
      createdAt: new Date(),
    }

    if (['mensualidad', 'cuota distrital'].includes(movimiento?.toLowerCase())) {
      datosPago.nombre = datos.nombre
      datosPago.mes = datos.mes
      datosPago.estatus = 'sin revisar'
    } else {
      datosPago.descripcion = datos.descripcion
      datosPago.estatus = 'n/a'
    }

    await addDoc(collection(db, 'tesoreria'), datosPago)
  } catch (error) {
    console.error('Error al registrar transacción:', error)
  } finally {
    isSaving.value = false
  }
}

export const guardarPersona = async (persona, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    await firebaseService.crearPersona(persona)
  } catch (error) {
    console.error('Error al guardar socio:', error)
  } finally {
    isSaving.value = false
  }
}

export const guardarPassEstandar = async (pass, isSaving, nombreClub = 'Isla de Margarita') => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const clubSnap = await getDocs(collection(db, 'club'))
    const docEncontrado = clubSnap.docs.find(
      (doc) => doc.data().club?.toLowerCase() === nombreClub.toLowerCase(),
    )

    if (docEncontrado) {
      await updateDoc(docEncontrado.ref, {
        passEstandar: pass,
      })
    }
  } catch (error) {
    console.error('Error al guardar socio:', error)
  } finally {
    isSaving.value = false
  }
}

export const actualizarEstadoClub = async (nombreClub = 'Isla de Margarita') => {
  try {
    const [sociosSnap, aspirantesSnap, tesoreriaSnap, clubSnap] = await Promise.all([
      getDocs(query(collection(db, 'persona'), where('estatus', '==', 'Socios'))),
      getDocs(query(collection(db, 'persona'), where('estatus', '==', 'Aspirantes'))),
      getDocs(collection(db, 'tesoreria')),
      getDocs(collection(db, 'club')),
    ])

    const st = sociosSnap.size
    const at = aspirantesSnap.size

    let saldo = 0
    tesoreriaSnap.docs.forEach((doc) => {
      const data = doc.data()
      const tipo = data.tipoMovimiento?.toLowerCase()
      if (tipo === 'ingreso' || tipo === 'mensualidad' || tipo === 'cuota distrital') {
        saldo += monto
      } else if (tipo === 'egreso') {
        saldo -= monto
      }
    })

    const docEncontrado = clubSnap.docs.find(
      (doc) => doc.data().club?.toLowerCase() === nombreClub.toLowerCase(),
    )

    if (docEncontrado) {
      await updateDoc(docEncontrado.ref, {
        st,
        at,
        saldo: Number(saldo.toFixed(2)),
      })
      console.log('Estado del club actualizado exitosamente')
    }
  } catch (error) {
    console.error('Error al actualizar el estado del club:', error)
  }
}

export const actualizarPersona = async (id, datosPersona, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const docRef = doc(db, 'persona', id)
    await updateDoc(docRef, datosPersona)
    console.log('Persona actualizada con éxito')
  } catch (error) {
    console.error('Error al actualizar persona:', error)
  } finally {
    isSaving.value = false
  }
}

export const extraerPassEstandarClub = async (nombreClub = 'Isla de Margarita') => {
  try {
    const clubSnap = await getDocs(collection(db, 'club'))

    // Buscamos el documento que coincida con el club
    const docEncontrado = clubSnap.docs.find(
      (doc) => doc.data().club?.toLowerCase() === nombreClub.toLowerCase(),
    )

    return docEncontrado ? docEncontrado.data().passEstandar : ''
  } catch (error) {
    console.error('Error al extraer la contraseña:', error)
    return ''
  }
}

export const guardarAlianza = async (alianza, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const datosParaSubir = {
      ...alianza,
      createdAt: new Date(),
    }
    await addDoc(collection(db, 'alianzas'), datosParaSubir)
    console.log('Alianza guardada con éxito')
  } catch (error) {
    console.error('Error al guardar alianza:', error)
  } finally {
    isSaving.value = false
  }
}

export const actualizarAlianza = async (id, datosAlianza, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const docRef = doc(db, 'alianzas', id)
    await updateDoc(docRef, datosAlianza)
    console.log('Alianza actualizada con éxito')
  } catch (error) {
    console.error('Error al actualizar alianza:', error)
  } finally {
    isSaving.value = false
  }
}

// ---------------------------------------------------------------------------
// Eventos: cada evento reserva un presupuesto tomado del balance disponible.
// Los gastos viven en la subcolección `eventos/{id}/gastos` (un documento por
// gasto, no un array embebido) para que dos personas puedan registrar gastos
// al mismo tiempo sin pisarse. El campo `totalGastado` del evento se mantiene
// como un acumulado, pero SIEMPRE se lee y escribe dentro de una transacción
// de Firestore, así que la validación de presupuesto y la actualización del
// total son atómicas: no hay ventana en la que dos escrituras concurrentes
// puedan hacer que el gasto total supere el presupuesto ni que se pierda una
// de las dos escrituras.
// ---------------------------------------------------------------------------

export const crearEvento = async (evento, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    await addDoc(collection(db, 'eventos'), {
      ...evento,
      totalGastado: 0,
      estatus: 'activo',
      createdAt: new Date(),
    })
    console.log('Evento creado con éxito')
  } catch (error) {
    console.error('Error al crear evento:', error)
  } finally {
    isSaving.value = false
  }
}

export const actualizarEvento = async (id, datosEvento, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    await updateDoc(doc(db, 'eventos', id), datosEvento)
    console.log('Evento actualizado con éxito')
  } catch (error) {
    console.error('Error al actualizar evento:', error)
  } finally {
    isSaving.value = false
  }
}

export const registrarGastoEvento = async (eventoId, gasto, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const eventoRef = doc(db, 'eventos', eventoId)
    const gastoRef = doc(collection(db, 'eventos', eventoId, 'gastos'))
    const monto = Number(gasto.monto)

    await runTransaction(db, async (transaction) => {
      const eventoSnap = await transaction.get(eventoRef)

      if (!eventoSnap.exists()) {
        throw new Error('El evento ya no existe.')
      }

      const datos = eventoSnap.data()

      if (datos.estatus === 'finalizado') {
        throw new Error('El evento ya fue finalizado, no se pueden agregar más gastos.')
      }

      const presupuesto = Number(datos.presupuesto || 0)
      const totalGastado = Number(datos.totalGastado || 0)
      const restante = presupuesto - totalGastado

      if (monto > restante) {
        throw new Error(
          `El gasto excede el presupuesto restante del evento ($${restante.toFixed(2)}).`,
        )
      }

      transaction.set(gastoRef, {
        descripcion: gasto.descripcion,
        monto,
        fecha: gasto.fecha || new Date().toISOString().split('T')[0],
        createdAt: new Date(),
      })

      transaction.update(eventoRef, {
        totalGastado: totalGastado + monto,
      })
    })

    console.log('Gasto registrado con éxito')
    return { ok: true }
  } catch (error) {
    console.error('Error al registrar gasto:', error)
    return { ok: false, mensaje: error.message || 'No se pudo registrar el gasto.' }
  } finally {
    isSaving.value = false
  }
}

export const eliminarGastoEvento = async (eventoId, gastoId, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const eventoRef = doc(db, 'eventos', eventoId)
    const gastoRef = doc(db, 'eventos', eventoId, 'gastos', gastoId)

    await runTransaction(db, async (transaction) => {
      const [eventoSnap, gastoSnap] = await Promise.all([
        transaction.get(eventoRef),
        transaction.get(gastoRef),
      ])

      if (!eventoSnap.exists() || !gastoSnap.exists()) return

      const totalGastado = Number(eventoSnap.data().totalGastado || 0)
      const monto = Number(gastoSnap.data().monto || 0)

      transaction.delete(gastoRef)
      transaction.update(eventoRef, {
        totalGastado: Math.max(0, totalGastado - monto),
      })
    })

    console.log('Gasto eliminado con éxito')
  } catch (error) {
    console.error('Error al eliminar gasto:', error)
  } finally {
    isSaving.value = false
  }
}

export const finalizarEvento = async (evento, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const totalGastado = Number(evento.totalGastado || 0)

    const batch = writeBatch(db)

    const eventoRef = doc(db, 'eventos', evento.id)
    batch.update(eventoRef, {
      estatus: 'finalizado',
      finalizadoAt: new Date(),
    })

    // Solo se registra egreso en Tesorería si efectivamente hubo gasto
    if (totalGastado > 0) {
      const tesoreriaRef = doc(collection(db, 'tesoreria'))
      batch.set(tesoreriaRef, {
        tipoMovimiento: 'egreso',
        monto: totalGastado,
        referencia: 'N/A',
        fechaPago: new Date().toISOString().split('T')[0],
        metodoPago: 'N/A',
        descripcion: `Evento: ${evento.nombre}`,
        estatus: 'n/a',
        createdAt: new Date(),
      })
    }

    await batch.commit()
    console.log('Evento finalizado y egreso registrado en Tesorería')
  } catch (error) {
    console.error('Error al finalizar evento:', error)
  } finally {
    isSaving.value = false
  }
}

export const eliminarEventoCompleto = async (id) => {
  const gastosSnap = await getDocs(collection(db, 'eventos', id, 'gastos'))
  const batch = writeBatch(db)

  gastosSnap.docs.forEach((gastoDoc) => batch.delete(gastoDoc.ref))
  batch.delete(doc(db, 'eventos', id))

  await batch.commit()
}
