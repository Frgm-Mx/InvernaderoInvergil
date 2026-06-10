import { useState, useEffect } from 'react'
import { 
  Box, Card, CardContent, Typography, TextField, Button, Alert, 
  IconButton, InputAdornment, CircularProgress
} from '@mui/material'
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ usuario: '', password: '' })
  const [errores, setErrores] = useState({})
  const [errorGlobal, setErrorGlobal] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Estados para intentos fallidos
  const [intentos, setIntentos] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState(0)
  const MAX_INTENTOS = 5
  const TIEMPO_BLOQUEO = 30 // segundos

  // Cargar intentos guardados desde localStorage
  useEffect(() => {
    const savedIntentos = localStorage.getItem('login_intentos')
    const savedBloqueado = localStorage.getItem('login_bloqueado')
    const savedTiempo = localStorage.getItem('login_tiempo_bloqueo')
    
    if (savedIntentos) setIntentos(parseInt(savedIntentos))
    
    if (savedBloqueado === 'true' && savedTiempo) {
      const tiempoRestanteCalc = Math.max(0, parseInt(savedTiempo) - Date.now())
      if (tiempoRestanteCalc > 0) {
        setBloqueado(true)
        setTiempoRestante(Math.ceil(tiempoRestanteCalc / 1000))
      } else {
        // Limpiar bloqueo expirado
        localStorage.removeItem('login_bloqueado')
        localStorage.removeItem('login_tiempo_bloqueo')
        setIntentos(0)
      }
    }
  }, [])

  // Timer para cuenta regresiva
  useEffect(() => {
    let interval
    if (bloqueado && tiempoRestante > 0) {
      interval = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            // Desbloquear cuando llegue a 0
            setBloqueado(false)
            setIntentos(0)
            localStorage.removeItem('login_bloqueado')
            localStorage.removeItem('login_tiempo_bloqueo')
            localStorage.setItem('login_intentos', '0')
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [bloqueado, tiempoRestante])

  useEffect(() => {
    if (user) {
      // Resetear intentos al iniciar sesión exitosamente
      setIntentos(0)
      localStorage.setItem('login_intentos', '0')
      navigate('/')
    }
  }, [user, navigate])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrores((prev) => ({ ...prev, [e.target.name]: '' }))
    setErrorGlobal('')
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show)

  const validar = () => {
    const err = {}
    if (!form.usuario.trim()) err.usuario = 'El usuario es obligatorio'
    if (!form.password) err.password = 'La contraseña es obligatoria'
    
    setErrores(err)
    return Object.keys(err).length === 0
  }

  const resetIntentos = () => {
    setIntentos(0)
    localStorage.setItem('login_intentos', '0')
  }

  const registrarIntentoFallido = () => {
    const nuevosIntentos = intentos + 1
    setIntentos(nuevosIntentos)
    localStorage.setItem('login_intentos', nuevosIntentos.toString())
    
    if (nuevosIntentos >= MAX_INTENTOS) {
      const tiempoBloqueoMs = TIEMPO_BLOQUEO * 1000
      const finBloqueo = Date.now() + tiempoBloqueoMs
      setBloqueado(true)
      setTiempoRestante(TIEMPO_BLOQUEO)
      localStorage.setItem('login_bloqueado', 'true')
      localStorage.setItem('login_tiempo_bloqueo', finBloqueo.toString())
      setErrorGlobal(`Demasiados intentos fallidos. Intente nuevamente en ${TIEMPO_BLOQUEO} segundos.`)
    } else {
      const intentosRestantes = MAX_INTENTOS - nuevosIntentos
      setErrorGlobal(`Usuario o contraseña incorrectos. Le quedan ${intentosRestantes} intento${intentosRestantes !== 1 ? 's' : ''}.`)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return
    if (bloqueado) {
      setErrorGlobal(`Cuenta bloqueada. Espere ${tiempoRestante} segundos para intentar nuevamente.`)
      return
    }

    setLoading(true)
    setErrorGlobal('')
    try {
      await login(form.usuario.trim(), form.password)
      resetIntentos()
      navigate('/')
    } catch (err) {
      console.error(err)
      registrarIntentoFallido()
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

          {bloqueado && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              ⏳ Cuenta temporalmente bloqueada. Espere {tiempoRestante} segundos.
            </Alert>
          )}

          {intentos > 0 && intentos < MAX_INTENTOS && !bloqueado && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              🔐 Intentos restantes: {MAX_INTENTOS - intentos}
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
              disabled={bloqueado}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              error={!!errores.password}
              helperText={errores.password}
              disabled={bloqueado}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="cambiar visibilidad de contraseña"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={bloqueado}
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
              disabled={loading || bloqueado}
              sx={{ mt: 3, mb: 1, py: 1.2, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Ingresar'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}