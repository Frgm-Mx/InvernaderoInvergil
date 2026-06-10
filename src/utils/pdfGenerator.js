import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Genera un ticket/factura PDF para una venta
 * @param {Object} params
 * @param {Object} params.venta - Datos de la venta
 * @param {Array} params.detalles - Líneas de detalle (con nombre_planta ya resuelto)
 * @param {Array} params.pagos - Historial de pagos/anticipos
 * @param {string} params.vendedor - Nombre del vendedor
 * @returns {jsPDF} instancia del PDF
 */

function calcAltura(detalles, pagos) {
  let h = 80 // base header + footer
  h += detalles.length * 6 // filas de productos
  h += pagos.length * 4 // filas de pagos
  if (pagos.length > 1) h += 20 // desglose anticipo
  return Math.max(120, h + 30)
}

export function generarTicketPDF({ venta, detalles, pagos = [], vendedor = '' }) {
  const doc = new jsPDF({ unit: 'mm', format: [80, calcAltura(detalles, pagos)] })

  const W = 80
  const margen = 4
  let y = 6

  // === ENCABEZADO ===
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('VIVERO INVERGIL', W / 2, y, { align: 'center' })
  y += 4.5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('Prop. Beatriz López Cárdenas', W / 2, y, { align: 'center' })
  y += 3
  doc.text('San Felipe del Progreso, Estado de México', W / 2, y, { align: 'center' })
  y += 4

  // Línea separadora
  doc.setDrawColor(0)
  doc.setLineWidth(0.3)
  doc.line(margen, y, W - margen, y)
  y += 4

  // === INFO VENTA ===
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(`TICKET #${String(venta.id).padStart(4, '0')}`, W / 2, y, { align: 'center' })
  y += 4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)

  const fecha = new Date(venta.fecha)
  const fechaStr = fecha.toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const info = [
    ['Fecha:', fechaStr],
    ['Vendedor:', vendedor || '—'],
    ['Forma de pago:', venta.forma_pago],
    ['Tipo:', venta.tipo_venta],
  ]
  if (venta.nota_remision) info.push(['Nota Rem.:', venta.nota_remision])
  if (venta.cliente_nombre) info.push(['Cliente:', venta.cliente_nombre])
  if (venta.cliente_telefono) info.push(['Tel:', venta.cliente_telefono])

  info.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, margen, y)
    doc.setFont('helvetica', 'normal')
    doc.text(val, margen + 22, y)
    y += 3.2
  })

  y += 2
  doc.line(margen, y, W - margen, y)
  y += 3

  // === TABLA DE PRODUCTOS ===
  doc.autoTable({
    startY: y,
    margin: { left: margen, right: margen },
    styles: { fontSize: 6.5, cellPadding: 1.0, lineColor: [200, 200, 200], lineWidth: 0.1, overflow: 'linebreak' },
    headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold', fontSize: 6.5 },
    columnStyles: {
      1: { halign: 'center', cellWidth: 10 }, // Cant
      2: { halign: 'right', cellWidth: 13 },  // P.Unit
      3: { halign: 'right', cellWidth: 15 },  // Subtotal
    },
    head: [['Producto', 'Cant', 'P.Unit', 'Subtotal']],
    body: detalles.map((d) => [
      d.nombre_planta || `Planta #${d.id_planta}`,
      d.cantidad.toLocaleString(),
      `$${Number(d.precio_unitario).toFixed(2)}`,
      `$${Number(d.subtotal).toFixed(2)}`,
    ]),
  })

  y = doc.lastAutoTable.finalY + 3

  // === TOTALES ===
  doc.line(margen, y, W - margen, y)
  y += 3.5

  doc.setFontSize(7)

  // Si tiene anticipo, mostrar desglose
  if (venta.anticipo > 0 || pagos.length > 1) {
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', margen, y)
    doc.text(`$${Number(venta.total).toFixed(2)}`, W - margen, y, { align: 'right' })
    y += 3.5

    doc.setFont('helvetica', 'normal')
    doc.text('Anticipo:', margen, y)
    doc.text(`$${Number(venta.anticipo || 0).toFixed(2)}`, W - margen, y, { align: 'right' })
    y += 3.2

    doc.text('Pagado:', margen, y)
    doc.text(`$${Number(venta.monto_pagado || 0).toFixed(2)}`, W - margen, y, { align: 'right' })
    y += 3.2

    const saldo = Number(venta.saldo_pendiente || 0)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(saldo > 0 ? 211 : 46, saldo > 0 ? 47 : 125, saldo > 0 ? 47 : 50)
    doc.text('SALDO PENDIENTE:', margen, y)
    doc.text(`$${saldo.toFixed(2)}`, W - margen, y, { align: 'right' })
    doc.setTextColor(0)
    y += 3.5

    if (venta.estado === 'con_anticipo') {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.text('** Venta con anticipo — saldo pendiente **', W / 2, y, { align: 'center' })
      y += 3
    }

    // Historial de pagos
    if (pagos.length > 0) {
      y += 1
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'bold')
      doc.text('HISTORIAL DE PAGOS:', margen, y)
      y += 3
      doc.setFont('helvetica', 'normal')
      pagos.forEach((p) => {
        const fPago = new Date(p.fecha).toLocaleDateString('es-MX', {
          day: '2-digit', month: 'short', year: 'numeric'
        })
        doc.text(`${fPago} - ${p.tipo === 'anticipo' ? 'Anticipo' : 'Pago'} (${p.forma_pago})`, margen, y)
        doc.text(`$${Number(p.monto).toFixed(2)}`, W - margen, y, { align: 'right' })
        y += 2.8
      })
    }
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('TOTAL:', margen, y)
    doc.text(`$${Number(venta.total).toFixed(2)}`, W - margen, y, { align: 'right' })
    y += 4
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Estado: PAGADA', W / 2, y, { align: 'center' })
    y += 3.5
  }

  // === PIE ===
  y += 2
  doc.setDrawColor(180)
  doc.setLineDashPattern([1, 1])
  doc.line(margen, y, W - margen, y)
  doc.setLineDashPattern([])
  y += 3

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6)
  doc.text('¡Gracias por su compra!', W / 2, y, { align: 'center' })
  y += 2.5
  doc.text('Vivero Invergil — Calidad en plantas de flor', W / 2, y, { align: 'center' })

  return doc
}

/**
 * Genera una factura formal en formato carta
 */
export function generarFacturaPDF({ venta, detalles, pagos = [], vendedor = '' }) {
  const doc = new jsPDF('p', 'mm', 'letter')
  const W = 216
  const margen = 15
  let y = 20

  // === ENCABEZADO ===
  doc.setFillColor(46, 125, 50)
  doc.rect(0, 0, W, 35, 'F')

  doc.setTextColor(255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('VIVERO INVERGIL', margen, y)
  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Prop. Beatriz López Cárdenas · San Felipe del Progreso, Edo. de México', margen, y)
  y += 5

  // Número de factura en la esquina
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`FACTURA #${String(venta.id).padStart(4, '0')}`, W - margen, 20, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const fecha = new Date(venta.fecha)
  doc.text(fecha.toLocaleDateString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric'
  }), W - margen, 27, { align: 'right' })

  doc.setTextColor(0)
  y = 45

  // === DATOS DEL CLIENTE Y VENTA ===
  doc.setFontSize(9)
  const colIzq = margen
  const colDer = W / 2 + 10

  doc.setFont('helvetica', 'bold')
  doc.text('DATOS DEL CLIENTE', colIzq, y)
  doc.text('DATOS DE LA VENTA', colDer, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  const clienteInfo = [
    ['Nombre:', venta.cliente_nombre || 'Público general'],
    ['Teléfono:', venta.cliente_telefono || '—'],
    ['Email:', venta.cliente_email || '—'],
  ]
  const ventaInfo = [
    ['Vendedor:', vendedor || '—'],
    ['Forma de pago:', venta.forma_pago],
    ['Tipo:', venta.tipo_venta === 'mayoreo' ? 'Mayoreo (≥1000)' : 'Menudeo'],
    ['Nota Rem.:', venta.nota_remision || '—'],
  ]

  clienteInfo.forEach(([label, val], i) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, colIzq, y + i * 4.5)
    doc.setFont('helvetica', 'normal')
    doc.text(val, colIzq + 22, y + i * 4.5)
  })
  ventaInfo.forEach(([label, val], i) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, colDer, y + i * 4.5)
    doc.setFont('helvetica', 'normal')
    doc.text(val, colDer + 28, y + i * 4.5)
  })

  y += Math.max(clienteInfo.length, ventaInfo.length) * 4.5 + 6

  // === TABLA DE PRODUCTOS ===
  doc.autoTable({
    startY: y,
    margin: { left: margen, right: margen },
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [46, 125, 50], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 250, 245] },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 70 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 35 },
    },
    head: [['#', 'Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
    body: detalles.map((d, i) => [
      i + 1,
      d.nombre_planta || `Planta #${d.id_planta}`,
      d.cantidad.toLocaleString(),
      `$${Number(d.precio_unitario).toFixed(2)}`,
      `$${Number(d.subtotal).toFixed(2)}`,
    ]),
  })

  y = doc.lastAutoTable.finalY + 6

  // === TOTALES ===
  const totX = W - margen - 70
  doc.setFontSize(9)

  if (venta.anticipo > 0 || venta.saldo_pendiente > 0) {
    const filas = [
      ['Subtotal:', `$${Number(venta.total).toFixed(2)}`],
      ['Anticipo:', `$${Number(venta.anticipo || 0).toFixed(2)}`],
      ['Total pagado:', `$${Number(venta.monto_pagado || 0).toFixed(2)}`],
    ]
    filas.forEach(([label, val]) => {
      doc.setFont('helvetica', 'normal')
      doc.text(label, totX, y)
      doc.text(val, W - margen, y, { align: 'right' })
      y += 5
    })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    const saldo = Number(venta.saldo_pendiente || 0)
    if (saldo > 0) doc.setTextColor(211, 47, 47)
    else doc.setTextColor(46, 125, 50)
    doc.text('SALDO PENDIENTE:', totX, y)
    doc.text(`$${saldo.toFixed(2)}`, W - margen, y, { align: 'right' })
    doc.setTextColor(0)
    y += 5

    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text(`Estado: ${venta.estado === 'pagada' ? 'PAGADA' : 'CON ANTICIPO'}`, totX, y)
    y += 8
  } else {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TOTAL:', totX, y)
    doc.text(`$${Number(venta.total).toFixed(2)}`, W - margen, y, { align: 'right' })
    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(46, 125, 50)
    doc.text('Estado: PAGADA', totX, y)
    doc.setTextColor(0)
    y += 8
  }

  // Historial de pagos
  if (pagos.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Historial de Pagos', margen, y)
    y += 2

    doc.autoTable({
      startY: y,
      margin: { left: margen, right: margen },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [100, 100, 100], textColor: 255 },
      head: [['Fecha', 'Tipo', 'Forma de Pago', 'Monto', 'Nota']],
      body: pagos.map((p) => [
        new Date(p.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
        p.tipo === 'anticipo' ? 'Anticipo' : p.tipo === 'pago_final' ? 'Pago Final' : 'Pago',
        p.forma_pago,
        `$${Number(p.monto).toFixed(2)}`,
        p.nota || '—',
      ]),
    })
    y = doc.lastAutoTable.finalY + 5
  }

  // === OBSERVACIONES ===
  if (venta.observaciones) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.text('Observaciones:', margen, y)
    doc.setFont('helvetica', 'normal')
    const obsLines = doc.splitTextToSize(venta.observaciones, W - margen * 2 - 25)
    doc.text(obsLines, margen + 25, y)
    y += obsLines.length * 4 + 4
  }

  // === PIE ===
  const pieY = y > 260 ? y + 10 : 260
  doc.setDrawColor(46, 125, 50)
  doc.setLineWidth(0.5)
  doc.line(margen, pieY, W - margen, pieY)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(120)
  doc.text('Vivero Invergil — Calidad en plantas de flor · San Felipe del Progreso, Estado de México', W / 2, pieY + 5, { align: 'center' })
  doc.text('Este documento es un comprobante de venta generado por el sistema.', W / 2, pieY + 9, { align: 'center' })

  return doc
}

/**
 * Descarga el ticket PDF directamente en el navegador
 */
export async function descargarTicket(venta, detalles, pagos, vendedor) {
  try {
    const idVenta = venta.id || venta.id_venta || venta.Id;
    if (!idVenta) {
      alert("Error: No se pudo identificar el ID de la venta.");
      return;
    }
    
    const ventaNormalizada = { ...venta, id: idVenta };
    const doc = generarTicketPDF({ venta: ventaNormalizada, detalles, pagos, vendedor });
    
    doc.save(`ticket_${idVenta}.pdf`);
    alert(`✓ Ticket descargado: ticket_${idVenta}.pdf`);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al generar el ticket');
  }
}

/**
 * Descarga la factura PDF directamente en el navegador
 */
export async function descargarFactura(venta, detalles, pagos, vendedor) {
  try {
    const idVenta = venta.id || venta.id_venta || venta.Id;
    if (!idVenta) {
      alert("Error: No se pudo identificar el ID de la venta.");
      return;
    }
    
    const ventaNormalizada = { ...venta, id: idVenta };
    const doc = generarFacturaPDF({ venta: ventaNormalizada, detalles, pagos, vendedor });
    
    doc.save(`factura_${idVenta}.pdf`);
    alert(`✓ Factura descargada: factura_${idVenta}.pdf`);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al generar la factura');
  }
}

/**
 * Abre el cliente de correo con la factura adjunta (descarga previa)
 */
export async function enviarPorCorreo(venta, detalles, pagos, vendedor, email = '') {
  try {
    const idVenta = venta.id || venta.id_venta || venta.Id;
    if (!idVenta) {
      alert("Error: No se pudo identificar el ID de la venta.");
      return;
    }
    
    if (!email) {
      alert("Error: No hay correo electrónico registrado para este cliente.");
      return;
    }
    
    const ventaNormalizada = { ...venta, id: idVenta };
    const doc = generarFacturaPDF({ venta: ventaNormalizada, detalles, pagos, vendedor });
    
    // Descargar una copia local que el usuario podrá adjuntar
    doc.save(`factura_${idVenta}_para_envio.pdf`);
    
    // Abrir cliente de correo
    const numTicket = String(idVenta).padStart(4, '0');
    const asunto = encodeURIComponent(`Factura #${numTicket} - Vivero Invergil`);
    const cuerpo = encodeURIComponent(
      `Estimado cliente,\n\nAdjunto encontrará la factura #${numTicket} ` +
      `por un total de $${Number(venta.total).toFixed(2)}.\n\n` +
      `Nota de remisión: ${venta.nota_remision || 'N/A'}\n\n` +
      `Gracias por su preferencia.\n\n` +
      `Atentamente,\nVivero Invergil`
    );
    
    const mailto = `mailto:${email}?subject=${asunto}&body=${cuerpo}`;
    window.open(mailto, '_blank');
    
    alert(`✓ Se ha abierto su cliente de correo.\n\nPor favor adjunte el archivo "factura_${idVenta}_para_envio.pdf" que se acaba de descargar.`);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al generar el PDF para correo');
  }
}

/**
 * Genera el ticket y lo devuelve como data URL (para vista previa)
 */
export function generarTicketDataURL(venta, detalles, pagos, vendedor) {
  try {
    const doc = generarTicketPDF({ venta, detalles, pagos, vendedor });
    return doc.output("datauristring");
  } catch (error) {
    console.error('Error generando ticket:', error);
    return "";
  }
}

/**
 * Genera la factura y la devuelve como data URL (para vista previa)
 */
export function generarFacturaDataURL(venta, detalles, pagos, vendedor) {
  try {
    const doc = generarFacturaPDF({ venta, detalles, pagos, vendedor });
    return doc.output("datauristring");
  } catch (error) {
    console.error('Error generando factura:', error);
    return "";
  }
}