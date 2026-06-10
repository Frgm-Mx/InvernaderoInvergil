import { Router } from 'express'
import { AppDataSource } from '../database'
import { Venta } from '../entities/Venta'
import { Configuracion } from '../entities/Configuracion'  // ← Esta línea es la que falta


const router = Router()
const ventaRepo = AppDataSource.getRepository(Venta)
const configRepo = AppDataSource.getRepository(Configuracion)

// Función para generar el siguiente número de Nota de Remisión
async function generarNotaRemision(): Promise<string> {
  // Buscar o crear el contador
  let config = await configRepo.findOne({ where: { clave: 'ultimo_nr' } })
  
  if (!config) {
    config = configRepo.create({ clave: 'ultimo_nr', valor: '0' })
    await configRepo.save(config)
  }
  
  const ultimoNumero = parseInt(config.valor)
  const nuevoNumero = ultimoNumero + 1
  config.valor = nuevoNumero.toString()
  await configRepo.save(config)
  
  return `NR-${nuevoNumero}`
}

// GET todas las ventas (ordenadas por fecha DESC)
router.get('/', async (req, res) => {
  try {
    const ventas = await ventaRepo.find({
      relations: {
        id_usuario: true,
        detalles: true,
        pagos: true
      },
      order: { fecha: 'DESC' }
    })
    res.json(ventas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET venta por ID
router.get('/:id', async (req, res) => {
  try {
    const venta = await ventaRepo.findOne({
      where: { id: parseInt(req.params.id) },
      relations: {
        id_usuario: true,
        detalles: true,
        pagos: true
      }
    })
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' })
    res.json(venta)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST nueva venta
router.post('/', async (req, res) => {
  try {
    // Generar nota de remisión automática
    const notaRemision = await generarNotaRemision()
    
    const ventaData = {
      ...req.body,
      nota_remision: notaRemision  // Sobrescribir lo que venga del frontend
    }
    
    const venta = ventaRepo.create(ventaData)
    const resultado = await ventaRepo.save(venta)
    res.status(201).json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT actualizar venta
router.put('/:id', async (req, res) => {
  try {
    const venta = await ventaRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' })
    
    ventaRepo.merge(venta, req.body)
    const resultado = await ventaRepo.save(venta)
    res.json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE venta
router.delete('/:id', async (req, res) => {
  try {
    const venta = await ventaRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' })
    
    await ventaRepo.remove(venta)
    res.json({ message: 'Venta eliminada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
