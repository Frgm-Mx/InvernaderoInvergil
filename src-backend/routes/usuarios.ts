import { Router } from 'express'
import { AppDataSource } from '../database.js'
import { Usuario } from '../entities/Usuario.js'

const router = Router()
const usuarioRepo = AppDataSource.getRepository(Usuario)

// POST login - validar credenciales
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body
    if (!usuario || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
    }
    
    const user = await usuarioRepo.findOne({ where: { usuario } })
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }
    
    // No enviar contraseña al frontend
    const { password: _, ...safeUser } = user
    res.json(safeUser)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await usuarioRepo.find()
    res.json(usuarios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await usuarioRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(usuario)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST nuevo usuario
router.post('/', async (req, res) => {
  try {
    const usuario = usuarioRepo.create(req.body)
    const resultado = await usuarioRepo.save(usuario)
    res.status(201).json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// PUT actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const usuario = await usuarioRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    
    usuarioRepo.merge(usuario, req.body)
    const resultado = await usuarioRepo.save(usuario)
    res.json(resultado)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// DELETE usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await usuarioRepo.findOne({ where: { id: parseInt(req.params.id) } })
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' })
    
    await usuarioRepo.remove(usuario)
    res.json({ message: 'Usuario eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
