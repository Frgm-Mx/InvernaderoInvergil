import { Router } from 'express'
import { AppDataSource } from '../database.js'
import { PagoVenta } from '../entities/PagoVenta.js'

const router = Router()
const pagoRepo = AppDataSource.getRepository(PagoVenta)

// GET todos los pagos
router.get('/', async (req, res) => {
  try {
    const pagos = await pagoRepo.find({
      relations: {
        id_venta: true
      },
      order: { fecha: 'DESC' }
    })
    res.json(pagos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ✅ ENDPOINT FALTANTE: GET pagos por id_venta
router.get('/venta/:id_venta', async (req, res) => {
  try {
    const idVenta = parseInt(req.params.id_venta)
    
    // Usando QueryBuilder para filtrar correctamente
    const pagos = await pagoRepo
      .createQueryBuilder('pago')
      .leftJoinAndSelect('pago.id_venta', 'venta')
      .where('venta.id = :idVenta', { idVenta })
      .orderBy('pago.fecha', 'DESC')
      .getMany()
    
    res.json(pagos)
  } catch (error) {
    console.error('Error al obtener pagos por venta:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET pago por ID
router.get('/:id', async (req, res) => {
  try {
    const pago = await pagoRepo.findOne({
      where: { id: parseInt(req.params.id) },
      relations: {
        id_venta: true
      }
    })
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' })
    res.json(pago)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST nuevo pago
router.post('/', async (req, res) => {
  try {
    const pago = pagoRepo.create(req.body)
    const resultado = await pagoRepo.save(pago)
    res.status(201).json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT actualizar pago
router.put('/:id', async (req, res) => {
  try {
    const pago = await pagoRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' })
    
    pagoRepo.merge(pago, req.body)
    const resultado = await pagoRepo.save(pago)
    res.json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE pago
router.delete('/:id', async (req, res) => {
  try {
    const pago = await pagoRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!pago) return res.status(404).json({ error: 'Pago no encontrado' })
    
    await pagoRepo.remove(pago)
    res.json({ message: 'Pago eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router