import { Router } from 'express'
import { AppDataSource } from '../database.js'
import { Venta } from '../entities/Venta.js'

const router = Router()
const ventaRepo = AppDataSource.getRepository(Venta)

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
    const venta = ventaRepo.create(req.body)
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
