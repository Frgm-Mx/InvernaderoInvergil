// routes/plantas.routes.js
import { Router } from 'express'
import { AppDataSource } from '../database'
import { Planta } from '../entities/Planta'
import { DetalleVenta } from '../entities/DetalleVenta'

const router = Router()
const plantaRepo = AppDataSource.getRepository(Planta)
const detalleRepo = AppDataSource.getRepository(DetalleVenta)

// GET todas las plantas ACTIVAS (para ventas)
router.get('/activas', async (req, res) => {
  try {
    const plantas = await plantaRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' }
    })
    res.json(plantas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET todas las plantas (incluyendo inactivas - para administración)
router.get('/todas', async (req, res) => {
  try {
    const plantas = await plantaRepo.find({
      order: { nombre: 'ASC' }
    })
    res.json(plantas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET planta por ID
router.get('/:id', async (req, res) => {
  try {
    const planta = await plantaRepo.findOne({ 
      where: { id: parseInt(req.params.id) } 
    })
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' })
    res.json(planta)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST nueva planta
router.post('/', async (req, res) => {
  try {
    const planta = plantaRepo.create({
      ...req.body,
      activo: true  // Por defecto, nueva planta está activa
    })
    const resultado = await plantaRepo.save(planta)
    res.status(201).json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT actualizar planta
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const planta = await plantaRepo.findOne({ where: { id } })
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' })
    
    plantaRepo.merge(planta, req.body)
    const resultado = await plantaRepo.save(planta)
    res.json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE lógico (deshabilitar)
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const planta = await plantaRepo.findOne({ where: { id } })
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' })
    
    // Verificar si tiene ventas asociadas
    const tieneVentas = await detalleRepo
      .createQueryBuilder('detalle')
      .where('detalle.id_planta = :id', { id })
      .getExists()
    
    if (tieneVentas) {
      // Deshabilitar en lugar de eliminar
      planta.activo = false
      await plantaRepo.save(planta)
      res.json({ 
        message: 'Planta deshabilitada (tiene ventas asociadas)', 
        planta,
        deshabilitada: true 
      })
    } else {
      // Eliminar físicamente
      await plantaRepo.remove(planta)
      res.json({ 
        message: 'Planta eliminada permanentemente', 
        eliminada: true 
      })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH deshabilitar planta
router.patch('/:id/deshabilitar', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const planta = await plantaRepo.findOne({ where: { id } })
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' })
    
    planta.activo = false
    await plantaRepo.save(planta)
    res.json({ message: 'Planta deshabilitada', planta })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH reactivar planta
router.patch('/:id/reactivar', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const planta = await plantaRepo.findOne({ where: { id } })
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' })
    
    planta.activo = true
    await plantaRepo.save(planta)
    res.json({ message: 'Planta reactivada', planta })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET verificar si tiene ventas
router.get('/:id/tiene-ventas', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    
    const tieneVentas = await detalleRepo
      .createQueryBuilder('detalle')
      .where('detalle.id_planta = :id', { id })
      .getExists()
    
    res.json({ tieneVentas })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// PATCH actualizar stock (para ventas)
router.patch('/:id/stock', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { cantidad } = req.body
    
    const planta = await plantaRepo.findOne({ where: { id } })
    if (!planta) return res.status(404).json({ error: 'Planta no encontrada' })
    
    planta.cantidad = cantidad
    await plantaRepo.save(planta)
    res.json({ message: 'Stock actualizado', planta })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router