import { db } from '@/config/firebase'
import { CLUB_POR_DEFECTO } from '@/config/constants'
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
  serverTimestamp,
} from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

export const firebaseService = {
  async crearPersona(datosSocio) {
    const datosParaSubir = {
      ...datosSocio,
      createdAt: serverTimestamp(),
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
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al actualizar mensualidad.' }
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
      club: datos.club || CLUB_POR_DEFECTO,
      createdAt: serverTimestamp(),
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
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al registrar transacción.' }
  } finally {
    isSaving.value = false
  }
}

export const guardarPersona = async (persona, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    if (persona.estatus === 'Socios') {
      persona.rol = 'socio'
    } else {
      persona.rol = 'aspirante'
    }

    await firebaseService.crearPersona(persona)

    if (persona.estatus === 'Socios') {
      await crearCuentaAuthSocioSiNoExiste(
        persona.nombre,
        persona.correo,
        persona.club || CLUB_POR_DEFECTO,
      )
    }

    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al guardar persona.' }
  } finally {
    isSaving.value = false
  }
}

export const guardarPassEstandar = async (pass, isSaving, nombreClub = CLUB_POR_DEFECTO) => {
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
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al guardar contraseña estándar.' }
  } finally {
    isSaving.value = false
  }
}

export const actualizarEstadoClub = async (nombreClub = CLUB_POR_DEFECTO) => {
  try {
    const [sociosSnap, aspirantesSnap, tesoreriaSnap, clubSnap, eventosSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, 'persona'),
          where('estatus', '==', 'Socios'),
          where('club', '==', nombreClub),
        ),
      ),
      getDocs(
        query(
          collection(db, 'persona'),
          where('estatus', '==', 'Aspirantes'),
          where('club', '==', nombreClub),
        ),
      ),
      getDocs(query(collection(db, 'tesoreria'), where('club', '==', nombreClub))),
      getDocs(collection(db, 'club')),
      getDocs(
        query(
          collection(db, 'eventos'),
          where('estatus', '==', 'activo'),
          where('club', '==', nombreClub),
        ),
      ),
    ])

    const st = sociosSnap.size
    const at = aspirantesSnap.size

    let saldo = 0
    tesoreriaSnap.docs.forEach((doc) => {
      const data = doc.data()
      const tipo = data.tipoMovimiento?.toLowerCase()
      const monto = Number(data.monto || 0)
      if (tipo === 'ingreso' || tipo === 'mensualidad' || tipo === 'cuota distrital') {
        saldo += monto
      } else if (tipo === 'egreso') {
        saldo -= monto
      }
    })

    eventosSnap.docs.forEach((doc) => {
      const data = doc.data()
      saldo -= Number(data.totalGastado || 0)
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
    }
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al actualizar el estado del club.' }
  }
}

export const actualizarPersona = async (id, datosPersona, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    if (datosPersona.estatus === 'Socios') {
      datosPersona.rol = 'socio'
    } else if (datosPersona.estatus === 'Aspirantes') {
      datosPersona.rol = 'aspirante'
    }

    const docRef = doc(db, 'persona', id)
    await updateDoc(docRef, datosPersona)

    if (datosPersona.estatus === 'Socios') {
      await crearCuentaAuthSocioSiNoExiste(
        datosPersona.nombre,
        datosPersona.correo,
        datosPersona.club || CLUB_POR_DEFECTO,
      )
    }

    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al actualizar persona.' }
  } finally {
    isSaving.value = false
  }
}

export const extraerPassEstandarClub = async (nombreClub = CLUB_POR_DEFECTO) => {
  try {
    const clubSnap = await getDocs(collection(db, 'club'))
    const docEncontrado = clubSnap.docs.find(
      (doc) => doc.data().club?.toLowerCase() === nombreClub.toLowerCase(),
    )
    return docEncontrado ? docEncontrado.data().passEstandar : ''
  } catch (error) {
    console.error(error)
    return ''
  }
}

export async function crearCuentaAuthSocioSiNoExiste(nombre, correo, club = CLUB_POR_DEFECTO) {
  if (!correo) return

  try {
    const functions = getFunctions()
    const createSocioAccount = httpsCallable(functions, 'createSocioAccount')
    await createSocioAccount({ nombre, correo, club })
  } catch (error) {
    if (error?.code !== 'functions/already-exists') {
      console.error('Error al crear cuenta de socio:', error)
    }
  }
}

export const guardarAlianza = async (alianza, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const datosParaSubir = {
      ...alianza,
      createdAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'alianzas'), datosParaSubir)
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al guardar alianza.' }
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
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al actualizar alianza.' }
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

export const crearEvento = async (evento, isSaving, c = CLUB_POR_DEFECTO) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    await addDoc(collection(db, 'eventos'), {
      ...evento,
      totalGastado: 0,
      estatus: 'activo',
      createdAt: serverTimestamp(),
      club: c,
    })
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al crear evento.' }
  } finally {
    isSaving.value = false
  }
}

export const actualizarEvento = async (id, datosEvento, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    await updateDoc(doc(db, 'eventos', id), datosEvento)
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al actualizar evento.' }
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
        createdAt: serverTimestamp(),
      })

      transaction.update(eventoRef, {
        totalGastado: totalGastado + monto,
      })
    })

    return { ok: true }
  } catch (error) {
    console.error(error)
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
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al eliminar gasto.' }
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
      finalizadoAt: serverTimestamp(),
    })

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
        createdAt: serverTimestamp(),
      })
    }

    await batch.commit()
    return { ok: true }
  } catch (error) {
    console.error(error)
    return { ok: false, mensaje: error.message || 'Error al finalizar evento.' }
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
