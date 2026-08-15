import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { useEventosStore } from '@/stores/useEventosStore'

export function useExportPdf() {
  const eventosStore = useEventosStore()

  const exportarEventoPdf = (evento) => {
    const doc = new jsPDF()
    
    // Obtener gastos del evento
    const gastos = eventosStore.gastos.filter(g => g.eventoId === evento.id)
    const gastado = eventosStore.gastosDeEvento(evento)
    const presupuesto = Number(evento.presupuesto || 0)
    const restante = presupuesto - gastado

    // Título
    doc.setFontSize(18)
    doc.setTextColor(40)
    doc.text(`Reporte de Evento: ${evento.nombre}`, 14, 22)
    
    // Detalles del Evento
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Fecha: ${evento.fecha}`, 14, 32)
    doc.text(`Estatus: ${evento.estatus === 'finalizado' ? 'Finalizado' : 'Activo'}`, 14, 38)
    doc.text(`Presupuesto Asignado: $${presupuesto.toFixed(2)}`, 14, 44)
    doc.text(`Total Gastado: $${gastado.toFixed(2)}`, 14, 50)
    doc.text(`Presupuesto Restante: $${restante.toFixed(2)}`, 14, 56)
    
    // Descripción
    doc.setFontSize(10)
    const splitDesc = doc.splitTextToSize(`Descripción: ${evento.descripcion}`, 180)
    doc.text(splitDesc, 14, 66)

    // Tabla de Gastos
    let startY = 70 + (splitDesc.length * 5)
    
    doc.setFontSize(14)
    doc.setTextColor(40)
    doc.text('Detalle de Gastos', 14, startY)
    
    if (gastos.length === 0) {
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text('No hay gastos registrados para este evento.', 14, startY + 10)
    } else {
      const tableData = gastos.map(g => [
        g.fecha,
        g.descripcion,
        g.metodoPago || 'N/A',
        g.responsable || 'N/A',
        `$${Number(g.monto).toFixed(2)}`
      ])
      
      doc.autoTable({
        startY: startY + 5,
        head: [['Fecha', 'Descripción', 'Método', 'Responsable', 'Monto']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // indigo-600 approx o primary
        margin: { top: 10 }
      })
    }

    // Guardar
    doc.save(`Reporte_${evento.nombre.replace(/\s+/g, '_')}_${evento.fecha}.pdf`)
  }

  return {
    exportarEventoPdf
  }
}
