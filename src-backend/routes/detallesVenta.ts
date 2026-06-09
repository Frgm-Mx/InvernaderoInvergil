import { Router } from 'express'
import { AppDataSource } from '../database.js'
import { DetalleVenta } from '../entities/DetalleVenta.js'

const router = Router()
const detalleRepo = AppDataSource.getRepository(DetalleVenta)

// GET todos los detalles
router.get('/', async (req, res) => {
  try {
    const detalles = await detalleRepo.find({
      relations: { id_venta: true, id_planta: true }
    })
    res.json(detalles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ✅ ENDPOINT CORREGIDO: GET detalles por id_venta
router.get('/venta/:id_venta', async (req, res) => {
  try {
    const idVenta = parseInt(req.params.id_venta)
    
    // Usando QueryBuilder para filtrar correctamente
    const detalles = await detalleRepo
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.id_venta', 'venta')
      .leftJoinAndSelect('detalle.id_planta', 'planta')
      .where('venta.id = :idVenta', { idVenta })
      .getMany()
    
    res.json(detalles)
  } catch (error) {
    console.error('Error al obtener detalles por venta:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET detalle por ID
router.get('/:id', async (req, res) => {
  try {
    const detalle = await detalleRepo.findOne({
      where: { id: parseInt(req.params.id) },
      relations: { id_venta: true, id_planta: true }
    })
    if (!detalle) return res.status(404).json({ error: 'Detalle no encontrado' })
    res.json(detalle)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST crear múltiples detalles
router.post('/bulk', async (req, res) => {
  try {
    const detalles = req.body
    const resultado = await detalleRepo.save(detalles)
    res.status(201).json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// POST crear detalle
router.post('/', async (req, res) => {
  try {
    const detalle = detalleRepo.create(req.body)
    const resultado = await detalleRepo.save(detalle)
    res.status(201).json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT actualizar detalle
router.put('/:id', async (req, res) => {
  try {
    const detalle = await detalleRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!detalle) return res.status(404).json({ error: 'Detalle no encontrado' })
    
    detalleRepo.merge(detalle, req.body)
    const resultado = await detalleRepo.save(detalle)
    res.json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE detalle
router.delete('/:id', async (req, res) => {
  try {
    const detalle = await detalleRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!detalle) return res.status(404).json({ error: 'Detalle no encontrado' })
    
    await detalleRepo.remove(detalle)
    res.json({ message: 'Detalle eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router