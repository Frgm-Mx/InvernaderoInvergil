import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert
} from '@mui/material'
import { Add, Edit, Delete, Science } from '@mui/icons-material'
import AbonoService from '../services/AbonoService'

const EMPTY = { nombre: '', uso: '', cantidad: '' }

export default function Abonos() {
  const [abonos, setAbonos] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [errores, setErrores] = useState({})
  const [msg, setMsg] = useState('')
  const [errorGlobal, setErrorGlobal] = useState('')

  const load = async () => {
    try { setAbonos(await AbonoService.getAll()) }
    catch { setErrorGlobal('Error al cargar abonos') }
  }

  useEffect(() => {
    const load = async () => {
      try { setAbonos(await AbonoService.getAll()) }
      catch { setErrorGlobal('Error al cargar abonos') }
    }
    load()
  }, []) // De esta forma eliminas la dependencia de 'load'

const handleOpen = (a = null) => {
    if (a) { 
      setForm({ nombre: a.nombre, uso: a.uso, cantidad: a.cantidad })
      setEditId(a.id) 
    } else { 
      setForm(EMPTY)
      setEditId(null) 
    }
    setOpen(true)
    setErrores({})
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrores((p) => ({ ...p, [e.target.name]: '' }))
  }

const validar = () => {
    const err = {}
    if (!String(form.nombre).trim()) err.nombre = 'El nombre es obligatorio'
    if (!String(form.uso).trim()) err.uso = 'El uso es obligatorio'
    
    const cant = Number(form.cantidad)
    if (form.cantidad === '' || form.cantidad === null || form.cantidad === undefined) {
      err.cantidad = 'La cantidad es obligatoria'
    } else if (cant < 0) {
      err.cantidad = 'No puede ser negativa'
    } else if (!Number.isInteger(cant)) {
      err.cantidad = 'Debe ser un número entero'
    }
    
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const handleSave = async () => {
    if (!validar()) return
    const payload = { nombre: form.nombre.trim(), uso: form.uso.trim(), cantidad: Number(form.cantidad) }
    try {
      if (editId) { await AbonoService.update(editId, payload); setMsg('Abono actualizado') }
      else { await AbonoService.create(payload); setMsg('Abono registrado') }
      setOpen(false); load()
    } catch { setErrores({ global: 'Error al guardar' }) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este abono?')) return
    try { await AbonoService.delete(id); setMsg('Abono eliminado'); load() }
    catch { setErrorGlobal('Error al eliminar') }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Fertilizantes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Nuevo Fertilizante</Button>
      </Box>

      {msg && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setMsg('')}>{msg}</Alert>}
      {errorGlobal && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorGlobal('')}>{errorGlobal}</Alert>}

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                <TableCell>Fertilizante</TableCell>
                <TableCell>Uso</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {abonos.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Science sx={{ color: 'secondary.main', fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>{a.nombre}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{a.uso}</TableCell>
                  <TableCell align="right">{a.cantidad}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpen(a)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {abonos.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No hay Fertilizantes</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editId ? 'Editar Fertilizante' : 'Nuevo Fertilizante'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          {errores.global && <Alert severity="error" sx={{ mb: 2 }}>{errores.global}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} error={!!errores.nombre} helperText={errores.nombre} />
            <TextField label="Uso *" name="uso" value={form.uso} onChange={handleChange} placeholder="Ej: Floración" error={!!errores.uso} helperText={errores.uso} />
            <TextField label="Cantidad *" name="cantidad" type="number" value={form.cantidad} onChange={handleChange} error={!!errores.cantidad} helperText={errores.cantidad} inputProps={{ min: 0, step: 1 }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
