import { useState, useEffect } from 'react'
import { 
  Box, Card, CardContent, Typography, TextField, Button, Alert, 
  IconButton, InputAdornment 
} from '@mui/material'
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material' // <-- Nuevos iconos
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ usuario: '', password: '' })
  const [errores, setErrores] = useState({})
  const [errorGlobal, setErrorGlobal] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 1. Estado para controlar si el texto de la contraseña es visible o no
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/nueva-venta')
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrores((prev) => ({ ...prev, [e.target.name]: '' }))
    setErrorGlobal('')
  }

  // Alternar el estado de visibilidad
  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const validar = () => {
    const err = {}
    if (!form.usuario.trim()) err.usuario = 'El usuario es obligatorio'
    if (!form.password) err.password = 'La contraseña es obligatoria'
    
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    setLoading(true)
    setErrorGlobal('')
    try {
      await login(form.usuario.trim(), form.password)
      navigate('/nueva-venta')
    } catch (err) {
      console.error(err)
      setErrorGlobal('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '80vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: '50%',
                p: 1.5,
                mb: 1,
                display: 'flex'
              }}
            >
              <LockOutlined fontSize="medium" />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Iniciar Sesión
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Ventas - Vivero
            </Typography>
          </Box>

          {errorGlobal && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {errorGlobal}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nombre de Usuario"
              name="usuario"
              autoComplete="username"
              autoFocus
              value={form.usuario}
              onChange={handleChange}
              error={!!errores.usuario}
              helperText={errores.usuario}
            />
            
            {/* 2. Campo de contraseña modificado */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              // Si 'showPassword' es true, el tipo cambia a 'text' para revelar los caracteres
              type={showPassword ? 'text' : 'password'} 
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              error={!!errores.password}
              helperText={errores.password}
              // Agregamos el icono interactivo al final del input
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="cambiar visibilidad de contraseña"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 1, py: 1.2, fontWeight: 600 }}
            >
              {loading ? 'Accediendo...' : 'Ingresar'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}