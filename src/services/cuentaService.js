import { auth, db } from '@/config/firebase'
import { deleteUser } from 'firebase/auth'
import { doc, deleteDoc, query, collection, where, getDocs } from 'firebase/firestore'
import logoUrl from '@/assets/img/logotipo-1.svg'

// jsPDF no puede dibujar SVG directamente, así que el logo se rasteriza a PNG
// en un canvas offscreen antes de insertarlo (mismo patrón que
// ModalResultadoReporte.vue). Si falla, el PDF se genera igual sin logo.
const cargarLogoComoImagen = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const escala = 4
      canvas.width = img.naturalWidth * escala
      canvas.height = img.naturalHeight * escala
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        ratio: img.naturalWidth / img.naturalHeight || 1,
      })
    }
    img.onerror = reject
    img.src = url
  })
}

const formatoFecha = (fechaStr) => {
  if (!fechaStr) return 'No disponible'
  return new Date(fechaStr).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * Genera y descarga un archivo ZIP con la información de la cuenta del usuario
 * conteniendo un PDF de presentación y un CSV con los datos crudos.
 *
 * OJO: por ahora solo incluye los campos disponibles en el objeto de Firebase
 * Auth (nombre, correo, uid, fechas de creación/último acceso). Si en el
 * futuro guardan datos adicionales del usuario en Firestore (por ejemplo una
 * colección 'usuarios' vinculada por uid), hay que sumarlos acá para que el
 * reporte sea realmente "toda la información de la cuenta".
 */
export async function descargarDatosUsuarioZip(usuario) {
  if (!usuario) {
    return { ok: false, mensaje: 'No hay una sesión activa.' }
  }

  try {
    const { default: jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    const { default: JSZip } = await import('jszip')

    // 1. ---- Generar el PDF ----
    const doc = new jsPDF()
    const margenX = 14
    let cursorY = 16

    // ---- Logo ----
    const alturaLogo = 18
    let anchoLogo = 0
    try {
      const { dataUrl, ratio } = await cargarLogoComoImagen(logoUrl)
      anchoLogo = alturaLogo * ratio
      doc.addImage(dataUrl, 'PNG', margenX, cursorY - 4, anchoLogo, alturaLogo)
    } catch (e) {
      console.warn('No se pudo cargar el logo para el PDF:', e)
    }

    // ---- Título ----
    const xTexto = margenX + (anchoLogo ? anchoLogo + 6 : 0)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(224, 27, 109) // primary-600
    doc.text('Datos de tu cuenta', xTexto, cursorY)

    cursorY += 7
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100)
    doc.text('R-Admin — Información asociada a tu perfil', xTexto, cursorY)

    cursorY = Math.max(cursorY, 16 - 4 + alturaLogo) + 8
    doc.setDrawColor(224, 27, 109)
    doc.setLineWidth(0.3)
    doc.line(margenX, cursorY - 4, doc.internal.pageSize.getWidth() - margenX, cursorY - 4)
    doc.setTextColor(0)

    // ---- Tabla de datos ----
    autoTable(doc, {
      startY: cursorY,
      head: [['Campo', 'Valor']],
      body: [
        ['Nombre', usuario.displayName || 'No especificado'],
        ['Correo electrónico', usuario.email || 'No disponible'],
        ['Correo verificado', usuario.emailVerified ? 'Sí' : 'No'],
        ['ID de usuario (UID)', usuario.uid || 'No disponible'],
        ['Cuenta creada el', formatoFecha(usuario.metadata?.creationTime)],
        ['Último inicio de sesión', formatoFecha(usuario.metadata?.lastSignInTime)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [224, 27, 109] },
      styles: { fontSize: 10 },
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Generado el ${formatoFecha(new Date().toISOString())} — página ${i} de ${paginas}`,
        margenX,
        doc.internal.pageSize.getHeight() - 8,
      )
    }

    const pdfBlob = doc.output('blob')

    // 2. ---- Generar el CSV ----
    const filas = [
      ['Campo', 'Valor'],
      ['Nombre', usuario.displayName || 'No especificado'],
      ['Correo electrónico', usuario.email || 'No disponible'],
      ['Correo verificado', usuario.emailVerified ? 'Sí' : 'No'],
      ['ID de usuario (UID)', usuario.uid || 'No disponible'],
      ['Cuenta creada el', formatoFecha(usuario.metadata?.creationTime)],
      ['Último inicio de sesión', formatoFecha(usuario.metadata?.lastSignInTime)],
    ]
    const csvContent =
      '\uFEFF' +
      filas.map((fila) => fila.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n')

    // 3. ---- Empaquetar en ZIP ----
    const zip = new JSZip()
    zip.file('mis-datos-r-admin.pdf', pdfBlob)
    zip.file('mis-datos-r-admin.csv', csvContent)

    const zipBlob = await zip.generateAsync({ type: 'blob' })

    // 4. ---- Descargar ZIP ----
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mis-datos-r-admin.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { ok: true }
  } catch (error) {
    console.error('Error al generar el archivo ZIP de datos de usuario:', error)
    return { ok: false, mensaje: 'No se pudo generar el archivo ZIP. Intenta de nuevo.' }
  }
}

/**
 * Limpia la Cache Storage del navegador (assets/respuestas cacheadas) y
 * sessionStorage. A propósito NO borra todo localStorage: Firebase Auth
 * persiste la sesión ahí bajo claves 'firebase:authUser:...', y borrarlas
 * cerraría la sesión del usuario sin que lo pida explícitamente. Solo se
 * eliminan las claves de localStorage que NO pertenecen a Firebase.
 */
export async function limpiarCache() {
  try {
    if ('caches' in window) {
      const nombres = await caches.keys()
      await Promise.all(nombres.map((nombre) => caches.delete(nombre)))
    }

    sessionStorage.clear()

    Object.keys(localStorage)
      .filter((clave) => !clave.startsWith('firebase:'))
      .forEach((clave) => localStorage.removeItem(clave))

    return { ok: true }
  } catch (error) {
    console.error('Error al limpiar la caché:', error)
    return { ok: false, mensaje: 'No se pudo limpiar la caché por completo.' }
  }
}

/**
 * Elimina la cuenta del usuario autenticado (Firebase Auth).
 *
 * Por seguridad, Firebase exige un login "reciente" para esta operación:
 * si el usuario inició sesión hace tiempo, lanza 'auth/requires-recent-login'
 * y hay que pedirle que vuelva a iniciar sesión antes de reintentar.
 */
export async function eliminarCuenta() {
  try {
    if (!auth.currentUser) {
      return { ok: false, mensaje: 'No hay una sesión activa.' }
    }

    const user = auth.currentUser
    const emailKey = user.email.toLowerCase().trim()

    // 1. Eliminar de la colección 'usuarios'
    try {
      const userDocRef = doc(db, 'usuarios', emailKey)
      await deleteDoc(userDocRef)
    } catch (e) {
      console.error('Error al eliminar de la colección usuarios:', e)
    }

    // 2. Buscar y eliminar de la colección 'persona'
    try {
      const q = query(collection(db, 'persona'), where('correo', '==', user.email))
      const snapshot = await getDocs(q)
      const promesas = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref))
      await Promise.all(promesas)
    } catch (e) {
      console.error('Error al eliminar de la colección persona:', e)
    }

    // 3. Eliminar el usuario de Firebase Auth
    await deleteUser(user)
    return { ok: true }
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error)
    if (error.code === 'auth/requires-recent-login') {
      return {
        ok: false,
        mensaje:
          'Por seguridad, tenés que volver a iniciar sesión antes de eliminar tu cuenta. Cerrá sesión, iniciá de nuevo e intentá otra vez.',
      }
    }
    return { ok: false, mensaje: error.message || 'No se pudo eliminar la cuenta.' }
  }
}
