<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useJuntaStore } from '@/stores/useJuntaStore'
import logoUrl from '@/assets/img/logotipo-1.svg'

const props = defineProps({
  reporte: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])

const cerrar = () => emit('close')

const juntaStore = useJuntaStore()
const { juntaActual } = storeToRefs(juntaStore)

// El reporte trae 'movimientos' (tesorería: ingreso/egreso/mensualidad/general)
// o 'personas' (socios/aspirantes) según el tipoReporte que se pidió.
const esTesoreria = computed(() => Array.isArray(props.reporte?.movimientos))
const esPersonas = computed(() => Array.isArray(props.reporte?.personas))

const etiquetaTipo = computed(() => {
  const mapa = {
    general: 'General',
    ingreso: 'Ingresos',
    egreso: 'Egresos',
    mensualidad: 'Mensualidades',
    socios: 'Socios',
    aspirantes: 'Aspirantes',
  }
  return mapa[props.reporte?.tipoReporte] || props.reporte?.tipoReporte
})

const formatoMonto = (valor) => `$${Number(valor || 0).toFixed(2)}`

const generadoEnTexto = computed(() => {
  if (!props.reporte?.generadoEn) return ''
  return new Date(props.reporte.generadoEn).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
})

// ===== Descarga en PDF =====
const generandoPDF = ref(false)
const errorPDF = ref('')

const nombreArchivo = computed(() => {
  const tipo = props.reporte?.tipoReporte || 'reporte'
  const desde = props.reporte?.fechaInicio || ''
  const hasta = props.reporte?.fechaFin || ''
  return `reporte-${tipo}-${desde}_a_${hasta}.pdf`
})

// jsPDF no puede dibujar SVG directamente, así que el logo se rasteriza a PNG
// en un canvas offscreen antes de insertarlo. Si falla (SVG bloqueado, etc.),
// el PDF se genera igual, solo que sin el logo.
const cargarLogoComoImagen = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const escala = 4 // más resolución para que no se vea pixelado en el PDF
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

const descargarPDF = async () => {
  generandoPDF.value = true
  errorPDF.value = ''
  try {
    // Import dinámico: jsPDF/autotable solo se cargan cuando el usuario
    // realmente pide el PDF, no en el bundle inicial de la app.
    const { default: jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()
    const margenX = 14
    const margenDerecho = doc.internal.pageSize.getWidth() - margenX
    let cursorY = 16

    // ---- Logo (si se puede cargar) ----
    const alturaLogo = 18
    let anchoLogo = 0
    try {
      const { dataUrl, ratio } = await cargarLogoComoImagen(logoUrl)
      anchoLogo = alturaLogo * ratio
      doc.addImage(dataUrl, 'PNG', margenX, cursorY - 4, anchoLogo, alturaLogo)
    } catch (e) {
      console.warn('No se pudo cargar el logo para el PDF:', e)
    }

    // ---- Título y periodo (a la derecha del logo, o desde el margen si no hay logo) ----
    const xTexto = margenX + (anchoLogo ? anchoLogo + 6 : 0)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(224, 27, 109)
    doc.text(`Reporte de ${etiquetaTipo.value}`, xTexto, cursorY)

    cursorY += 7
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100)
    doc.text(props.reporte.etiquetaPeriodo || '', xTexto, cursorY)

    // ---- Presidente / Tesorero, debajo a la izquierda, respetando el margen ----
    cursorY = Math.max(cursorY, 16 - 4 + alturaLogo) + 8
    doc.setDrawColor(224, 27, 109)
    doc.setLineWidth(0.3)
    doc.line(margenX, cursorY - 4, margenDerecho, cursorY - 4)

    const presidente = juntaActual.value?.presidente?.nombre || 'Sin asignar'
    const tesorero = juntaActual.value?.tesorero?.nombre || 'Sin asignar'

    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(0)
    doc.text('Presidente:', margenX, cursorY)
    doc.setFont(undefined, 'normal')
    doc.text(presidente, margenX + 20, cursorY)

    cursorY += 5
    doc.setFont(undefined, 'bold')
    doc.text('Tesorero:', margenX, cursorY)
    doc.setFont(undefined, 'normal')
    doc.text(tesorero, margenX + 20, cursorY)

    cursorY += 8
    doc.setTextColor(0)

    if (esTesoreria.value) {
      const t = props.reporte.totales

      autoTable(doc, {
        startY: cursorY,
        head: [['Ingresos', 'Egresos', 'Mensualidades', 'Balance']],
        body: [
          [
            formatoMonto(t.ingresos),
            formatoMonto(t.egresos),
            formatoMonto(t.mensualidades),
            formatoMonto(t.balance),
          ],
        ],
        theme: 'grid',
        headStyles: { fillColor: [224, 27, 109] }, // primary-600 (#e01b6d)
        styles: { halign: 'center' },
      })
      cursorY = doc.lastAutoTable.finalY + 4

      doc.setFontSize(9)
      doc.setTextColor(100)
      doc.text(`${t.cantidadMovimientos} movimiento(s) en el periodo`, margenX, cursorY)
      cursorY += 6
      doc.setTextColor(0)

      if (props.reporte.metodosPago?.length) {
        autoTable(doc, {
          startY: cursorY,
          head: [['Método de pago', 'Cantidad', 'Monto']],
          body: props.reporte.metodosPago.map((m) => [
            m.nombre,
            String(m.cantidad),
            formatoMonto(m.monto),
          ]),
          theme: 'striped',
          headStyles: { fillColor: [224, 27, 109] },
        })
        cursorY = doc.lastAutoTable.finalY + 6
      }

      autoTable(doc, {
        startY: cursorY,
        head: [['Fecha', 'Concepto', 'Tipo', 'Monto']],
        body: props.reporte.movimientos.map((mov) => [
          mov.fechaPago || '',
          (['mensualidad', 'cuota distrital'].includes(mov.tipoMovimiento?.toLowerCase()) ? (mov.nombre || mov.descripcion) : mov.descripcion) || '',
          mov.tipoMovimiento,
          `${mov.tipoMovimiento?.toLowerCase() === 'egreso' ? '-' : '+'}${formatoMonto(mov.monto)}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [224, 27, 109] },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3) {
            const esEgreso = data.row.raw[3].startsWith('-')
            data.cell.styles.textColor = esEgreso ? [190, 18, 60] : [4, 120, 87]
            data.cell.styles.fontStyle = 'bold'
          }
        },
      })
    } else if (esPersonas.value) {
      doc.setFontSize(11)
      doc.text(
        `${etiquetaTipo.value} en el periodo: ${props.reporte.totales.cantidad}`,
        margenX,
        cursorY,
      )
      cursorY += 6

      autoTable(doc, {
        startY: cursorY,
        head: [['Nombre', 'Teléfono', 'Correo', 'Ubicación']],
        body: props.reporte.personas.map((p) => [
          p.nombre || '',
          p.telefono || '',
          p.correo || '',
          p.ubicacion || '',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [224, 27, 109] },
      })
    }

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(
        `Generado el ${generadoEnTexto.value} — página ${i} de ${paginas}`,
        margenX,
        doc.internal.pageSize.getHeight() - 8,
      )
    }

    doc.save(nombreArchivo.value)
  } catch (error) {
    console.error('Error al generar el PDF:', error)
    errorPDF.value = 'No se pudo generar el PDF. Intenta de nuevo.'
  } finally {
    generandoPDF.value = false
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center h-screen w-screen bg-black/50 backdrop-blur-sm"
    @click.self="cerrar"
  >
    <div
      class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all mx-4"
    >
      <!-- Cabecera -->
      <div
        class="bg-primary-600 px-6 py-4 flex justify-between items-center border-b border-gray-100 sticky top-0 z-10"
      >
        <div>
          <h3 class="text-lg font-bold text-gray-50">Reporte de {{ etiquetaTipo }}</h3>
          <p class="text-xs text-primary-100 capitalize">{{ reporte.etiquetaPeriodo }}</p>
        </div>
        <button @click="cerrar" class="cursor-pointer text-gray-50 text-xl font-bold">
          &times;
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- ===== Vista Tesorería (general / ingreso / egreso / mensualidad) ===== -->
        <template v-if="esTesoreria">
          <!-- Tarjetas de totales -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
              <p class="text-xs text-emerald-700 font-semibold uppercase">Ingresos</p>
              <p class="text-lg font-bold text-emerald-700">
                {{ formatoMonto(reporte.totales.ingresos) }}
              </p>
            </div>
            <div class="bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
              <p class="text-xs text-rose-700 font-semibold uppercase">Egresos</p>
              <p class="text-lg font-bold text-rose-700">
                {{ formatoMonto(reporte.totales.egresos) }}
              </p>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <p class="text-xs text-blue-700 font-semibold uppercase">Mensualidades</p>
              <p class="text-lg font-bold text-blue-700">
                {{ formatoMonto(reporte.totales.mensualidades) }}
              </p>
            </div>
            <div class="bg-primary-50 border border-primary-200 rounded-lg p-3 text-center">
              <p class="text-xs text-primary-700 font-semibold uppercase">Balance</p>
              <p
                class="text-lg font-bold"
                :class="reporte.totales.balance >= 0 ? 'text-primary-700' : 'text-rose-700'"
              >
                {{ formatoMonto(reporte.totales.balance) }}
              </p>
            </div>
          </div>

          <p class="text-xs text-gray-500 text-center">
            {{ reporte.totales.cantidadMovimientos }} movimiento(s) en el periodo
          </p>

          <!-- Desglose por método de pago -->
          <div v-if="reporte.metodosPago?.length">
            <h4 class="text-sm font-bold text-gray-700 mb-2">Por método de pago</h4>
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-gray-600 text-left">
                    <th class="px-3 py-2 font-semibold">Método</th>
                    <th class="px-3 py-2 font-semibold text-center">Cantidad</th>
                    <th class="px-3 py-2 font-semibold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="m in reporte.metodosPago" :key="m.nombre">
                    <td class="px-3 py-2 text-gray-700">{{ m.nombre }}</td>
                    <td class="px-3 py-2 text-center text-gray-700">{{ m.cantidad }}</td>
                    <td class="px-3 py-2 text-right font-medium text-gray-900">
                      {{ formatoMonto(m.monto) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Listado de movimientos -->
          <div>
            <h4 class="text-sm font-bold text-gray-700 mb-2">Movimientos</h4>
            <div class="bg-white border border-gray-200 rounded-lg overflow-x-auto">
              <table class="w-full min-w-140 text-sm">
                <thead>
                  <tr class="bg-gray-50 text-gray-600 text-left">
                    <th class="px-3 py-2 font-semibold">Fecha</th>
                    <th class="px-3 py-2 font-semibold">Concepto</th>
                    <th class="px-3 py-2 font-semibold">Tipo</th>
                    <th class="px-3 py-2 font-semibold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-if="reporte.movimientos.length === 0">
                    <td colspan="4" class="px-3 py-6 text-center text-gray-400">
                      No hay movimientos en este periodo.
                    </td>
                  </tr>
                  <tr v-for="mov in reporte.movimientos" :key="mov.id" class="hover:bg-gray-50">
                    <td class="px-3 py-2 text-gray-700">{{ mov.fechaPago }}</td>
                    <td class="px-3 py-2 text-gray-900 font-medium">
                      {{ ['mensualidad', 'cuota distrital'].includes(mov.tipoMovimiento?.toLowerCase()) ? (mov.nombre || mov.descripcion) : mov.descripcion }}
                    </td>
                    <td class="px-3 py-2">
                      <span
                        class="px-2 py-0.5 text-xs font-semibold uppercase rounded"
                        :class="{
                          'bg-emerald-50 text-emerald-700': mov.tipoMovimiento?.toLowerCase() === 'ingreso',
                          'bg-rose-50 text-rose-700': mov.tipoMovimiento?.toLowerCase() === 'egreso',
                          'bg-blue-50 text-blue-700': ['mensualidad', 'cuota distrital'].includes(mov.tipoMovimiento?.toLowerCase()),
                        }"
                      >
                        {{ mov.tipoMovimiento }}
                      </span>
                    </td>
                    <td
                      class="px-3 py-2 text-right font-bold"
                      :class="
                        mov.tipoMovimiento?.toLowerCase() === 'egreso' ? 'text-rose-600' : 'text-emerald-600'
                      "
                    >
                      {{ mov.tipoMovimiento?.toLowerCase() === 'egreso' ? '-' : '+' }}{{ formatoMonto(mov.monto) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <!-- ===== Vista Personas (socios / aspirantes) ===== -->
        <template v-else-if="esPersonas">
          <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
            <p class="text-xs text-primary-700 font-semibold uppercase">
              {{ etiquetaTipo }} en el periodo
            </p>
            <p class="text-2xl font-bold text-primary-700">{{ reporte.totales.cantidad }}</p>
          </div>

          <div class="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table class="w-full min-w-120 text-sm">
              <thead>
                <tr class="bg-gray-50 text-gray-600 text-left">
                  <th class="px-3 py-2 font-semibold">Nombre</th>
                  <th class="px-3 py-2 font-semibold">Teléfono</th>
                  <th class="px-3 py-2 font-semibold">Correo</th>
                  <th class="px-3 py-2 font-semibold">Ubicación</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="reporte.personas.length === 0">
                  <td colspan="4" class="px-3 py-6 text-center text-gray-400">
                    No hay {{ etiquetaTipo.toLowerCase() }} registrados en este periodo.
                  </td>
                </tr>
                <tr v-for="p in reporte.personas" :key="p.id" class="hover:bg-gray-50">
                  <td class="px-3 py-2 text-gray-900 font-medium">{{ p.nombre }}</td>
                  <td class="px-3 py-2 text-gray-700">{{ p.telefono }}</td>
                  <td class="px-3 py-2 text-gray-700 truncate max-w-40" :title="p.correo">
                    {{ p.correo }}
                  </td>
                  <td class="px-3 py-2 text-gray-700">{{ p.ubicacion }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <p v-if="generadoEnTexto" class="text-xs text-gray-400 text-right">
          Generado el {{ generadoEnTexto }}
        </p>
      </div>

      <p v-if="errorPDF" class="px-6 text-sm text-rose-600 text-right -mt-2">{{ errorPDF }}</p>

      <div class="flex justify-end gap-3 px-6 pb-6">
        <button
          @click="cerrar"
          class="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cerrar
        </button>
        <button
          @click="descargarPDF"
          :disabled="generandoPDF"
          class="cursor-pointer px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <i
            class="bi"
            :class="generandoPDF ? 'bi-arrow-clockwise animate-spin' : 'bi-file-earmark-pdf'"
          ></i>
          {{ generandoPDF ? 'Generando...' : 'Descargar PDF' }}
        </button>
      </div>
    </div>
  </div>
</template>
