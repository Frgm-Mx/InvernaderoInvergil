import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3002

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Rutas base para guardar archivos
const BASE_DIR = 'C:/Users/pakog'
const CARPETAS = {
  tickets: path.join(BASE_DIR, 'Tickets'),
  facturas: path.join(BASE_DIR, 'Facturas'),
  correos: path.join(BASE_DIR, 'Correos'),
}

// Crear carpetas si no existen
Object.values(CARPETAS).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✓ Carpeta creada: ${dir}`)
  }
})

/**
 * POST /api/descargar/ticket
 * Guarda un ticket PDF en C:\Users\pakog\Tickets\
 * Body: { pdf: base64String, id: ventaId }
 */
app.post('/api/descargar/ticket', (req, res) => {
  try {
    const { pdf, id } = req.body
    if (!pdf || !id) {
      return res.status(400).json({ error: 'Faltan parámetros (pdf, id)' })
    }

    const nombreArchivo = `ticket-${String(id).padStart(4, '0')}.pdf`
    const rutaCompleta = path.join(CARPETAS.tickets, nombreArchivo)

    // Convertir base64 a buffer
    const buffer = Buffer.from(pdf, 'base64')
    fs.writeFileSync(rutaCompleta, buffer)

    res.json({
      success: true,
      mensaje: `Ticket guardado en: ${rutaCompleta}`,
      ruta: rutaCompleta
    })
  } catch (error) {
    console.error('Error al guardar ticket:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/descargar/factura
 * Guarda una factura PDF en C:\Users\pakog\Facturas\
 * Body: { pdf: base64String, id: ventaId }
 */
app.post('/api/descargar/factura', (req, res) => {
  try {
    const { pdf, id } = req.body
    if (!pdf || !id) {
      return res.status(400).json({ error: 'Faltan parámetros (pdf, id)' })
    }

    const nombreArchivo = `factura-${String(id).padStart(4, '0')}.pdf`
    const rutaCompleta = path.join(CARPETAS.facturas, nombreArchivo)

    const buffer = Buffer.from(pdf, 'base64')
    fs.writeFileSync(rutaCompleta, buffer)

    res.json({
      success: true,
      mensaje: `Factura guardada en: ${rutaCompleta}`,
      ruta: rutaCompleta
    })
  } catch (error) {
    console.error('Error al guardar factura:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/descargar/correo
 * Guarda una copia de correo en C:\Users\pakog\Correos\
 * Body: { pdf: base64String, id: ventaId, email: correo }
 */
app.post('/api/descargar/correo', (req, res) => {
  try {
    const { pdf, id, email } = req.body
    if (!pdf || !id) {
      return res.status(400).json({ error: 'Faltan parámetros (pdf, id)' })
    }

    const nombreArchivo = `correo-${String(id).padStart(4, '0')}-${new Date().getTime()}.pdf`
    const rutaCompleta = path.join(CARPETAS.correos, nombreArchivo)

    const buffer = Buffer.from(pdf, 'base64')
    fs.writeFileSync(rutaCompleta, buffer)

    res.json({
      success: true,
      mensaje: `Copia de correo guardada en: ${rutaCompleta}`,
      ruta: rutaCompleta,
      email: email || 'No especificado'
    })
  } catch (error) {
    console.error('Error al guardar correo:', error)
    res.status(500).json({ error: error.message })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', carpetas: CARPETAS })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de descargas ejecutándose en puerto ${PORT}`)
  console.log(`📁 Carpetas configuradas:`)
  console.log(`   - Tickets: ${CARPETAS.tickets}`)
  console.log(`   - Facturas: ${CARPETAS.facturas}`)
  console.log(`   - Correos: ${CARPETAS.correos}`)
})
