import { db } from '@/config/firebase'
import { collection, addDoc, getDocs, updateDoc, query, where, doc } from 'firebase/firestore'

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

    if (['mensualidad', 'cuota distrital'].includes(movimiento)) {
      datosPago.nombre = datos.nombre
      datosPago.mes = datos.mes
      datosPago.estatus = 'sin revisar'
    } else {
      datosPago.descripcion = datos.descripcion
      datosPago.estatus = 'n/a'
    }

    await addDoc(collection(db, 'tesoreria'), datosPago)
    console.log('Transacción registrada exitosamente')
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
      const monto = Number(data.monto || 0)
      if (data.tipoMovimiento === 'ingreso' || data.tipoMovimiento === 'mensualidad') {
        saldo += monto
      } else if (data.tipoMovimiento === 'egreso') {
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
