import { Router } from 'express'
import { AppDataSource } from '../database'
import { Abono } from '../entities/Abono'

const router = Router()
const abonoRepo = AppDataSource.getRepository(Abono)

// GET todos los abonos
router.get('/', async (req, res) => {
  try {
    const abonos = await abonoRepo.find()
    res.json(abonos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET abono por ID
router.get('/:id', async (req, res) => {
  try {
    const abono = await abonoRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!abono) return res.status(404).json({ error: 'Abono no encontrado' })
    res.json(abono)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST nuevo abono
router.post('/', async (req, res) => {
  try {
    const abono = abonoRepo.create(req.body)
    const resultado = await abonoRepo.save(abono)
    res.status(201).json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT actualizar abono
router.put('/:id', async (req, res) => {
  try {
    const abono = await abonoRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!abono) return res.status(404).json({ error: 'Abono no encontrado' })
    
    abonoRepo.merge(abono, req.body)
    const resultado = await abonoRepo.save(abono)
    res.json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE abono
router.delete('/:id', async (req, res) => {
  try {
    const abono = await abonoRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!abono) return res.status(404).json({ error: 'Abono no encontrado' })
    
    await abonoRepo.remove(abono)
    res.json({ message: 'Abono eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
