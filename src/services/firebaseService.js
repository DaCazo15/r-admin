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
// Los gastos se llevan de forma independiente dentro del evento y solo al
// finalizarlo se refleja lo realmente gastado como un egreso en Tesorería,
// liberando automáticamente el sobrante del presupuesto reservado.
// ---------------------------------------------------------------------------

export const crearEvento = async (evento, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    await addDoc(collection(db, 'eventos'), {
      ...evento,
      gastos: [],
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

export const actualizarGastosEvento = async (id, gastosActualizados, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    await updateDoc(doc(db, 'eventos', id), { gastos: gastosActualizados })
    console.log('Gastos del evento actualizados con éxito')
  } catch (error) {
    console.error('Error al actualizar los gastos del evento:', error)
  } finally {
    isSaving.value = false
  }
}

export const finalizarEvento = async (evento, isSaving) => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const totalGastado = (evento.gastos || []).reduce((sum, g) => sum + Number(g.monto || 0), 0)

    const batch = writeBatch(db)

    const eventoRef = doc(db, 'eventos', evento.id)
    batch.update(eventoRef, {
      estatus: 'finalizado',
      totalGastado,
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
