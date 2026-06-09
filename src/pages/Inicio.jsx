import { useEffect, useState } from 'react'
import { 
  Box, Typography, Card, CardContent, Grid, CardActionArea,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, Divider, List, ListItem, ListItemText
} from '@mui/material'
import { Yard, ShoppingCart, History, AddCircleOutline, ArrowForwardIos, Science } from '@mui/icons-material'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom' // <-- Para la navegación
import PlantaService from '../services/PlantaService'
import VentaService from '../services/VentaService'
import AbonoService from '../services/AbonoService'

export default function Inicio() {
  const { user } = useAuth()
  const navigate = useNavigate() // <-- Hook de navegación

  const [stats, setStats] = useState({ plantas: 0, totalPlantas: 0, ventas: 0, totalVentas: 0, abonos: 0 })
  
  // Estados para los bloques de información detallada (Top 3)
  const [recientesPlantas, setRecientesPlantas] = useState([])
  const [recientesVentas, setRecientesVentas] = useState([])
  const [recientesAbonos, setRecientesAbonos] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [plantas, ventas, abonos] = await Promise.all([
          PlantaService.getAll().catch(() => []),
          VentaService.getAll().catch(() => []),
          AbonoService.getAll().catch(() => []),
        ])
        
        // 1. Estadísticas globales para las tarjetas
        setStats({
          plantas: plantas ? plantas.length : 0,
          totalPlantas: (plantas || []).reduce((s, p) => s + (Number(p.stock || p.cantidad) || 0), 0),
          ventas: ventas ? ventas.length : 0,
          totalVentas: (ventas || []).reduce((s, v) => s + (Number(v.total) || 0), 0),
          abonos: abonos ? abonos.length : 0,
        })

        // 2. Extraer los últimos 3 registros (.reverse() pone los más nuevos primero)
        setRecientesPlantas([...plantas].reverse().slice(0, 3))
        setRecientesVentas([...ventas].reverse().slice(0, 3))
        setRecientesAbonos([...abonos].reverse().slice(0, 3))

      } catch (err) {
        console.error('Error cargando estadísticas:', err)
      }
    }
    load()
  }, [])

  // Definición de tus tarjetas con la propiedad 'path' añadida para saber a dónde ir al dar click
  const cards = [
    { 
      label: 'Tipos de Plantas', 
      value: stats.plantas, 
      sub: `${stats.totalPlantas.toLocaleString()} unidades en stock`, 
      icon: <Yard />, 
      color: '#2E7D32',
      path: '/plantas' 
    },
    { 
      label: 'Ventas Registradas', 
      value: stats.ventas, 
      sub: `$${stats.totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2 })} total`, 
      icon: <ShoppingCart />, 
      color: '#0288D1',
      path: '/ventas' 
    },
    { 
      label: 'Abonos', 
      value: stats.abonos, 
      sub: 'Revisar saldos', 
      icon: <Science />, 
      color: '#8D6E63',
      path: '/ventas?filtro=con_anticipo' // Manda al historial con filtro de anticipos
    },
  ]

  const formatMoneda = (valor) => Number(valor).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

  const formatFecha = (f) => {
    if (!f) return '—'
    const d = new Date(f)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Bienvenido, {user?.nombre?.split(' ')[0]}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Panel de control del Vivero Invergil
      </Typography>

      {/* --- SECCIÓN 1: TARJETAS INTERACTIVAS --- */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.label}>
            <Card sx={{ position: 'relative', overflow: 'hidden', borderRadius: 3, boxShadow: 2 }}>
              {/* CardActionArea hace que toda la tarjeta sea cliqueable con un efecto visual limpio */}
              <CardActionArea onClick={() => navigate(c.path)}>
                <Box sx={{
                  position: 'absolute', top: -10, right: -10, width: 80, height: 80,
                  borderRadius: '50%', bgcolor: c.color, opacity: 0.1,
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: 3, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      bgcolor: `${c.color}15`, color: c.color,
                    }}>
                      {c.icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {c.label}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color={c.color}>
                    {c.label === 'Ventas Registradas' ? stats.ventas : c.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {c.sub} <ArrowForwardIos sx={{ fontSize: 10, color: 'text.disabled', ml: 'auto' }} />
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* --- SECCIÓN 2: DETALLES EXTRA (TABLAS Y LISTAS RECIENTES) --- */}
      <Grid container spacing={4}>
        
        {/* Columna Izquierda: Ventas y Abonos */}
        <Grid item xs={12} md={8}>
          
          {/* Tabla Resumen Ventas */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 4, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ShoppingCart color="primary" />
              <Typography variant="h6" fontWeight={600}>Últimas 3 Ventas</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recientesVentas.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell>#{v.id}</TableCell>
                      <TableCell>{v.cliente_nombre || 'Público general'}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{v.tipo_venta}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMoneda(v.total)}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={v.estado === 'pagada' ? 'Pagada' : 'Anticipo'} 
                          size="small" 
                          color={v.estado === 'pagada' ? 'success' : 'warning'} 
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {recientesVentas.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">No hay ventas registradas recientemente</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Tabla Resumen Abonos */}
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <History sx={{ color: '#8D6E63' }} />
              <Typography variant="h6" fontWeight={600}>Últimos 3 Abonos</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Venta</TableCell>
                    <TableCell>Forma</TableCell>
                    <TableCell>Nota</TableCell>
                    <TableCell align="right">Monto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recientesAbonos.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{formatFecha(p.fecha)}</TableCell>
                      <TableCell>#{p.id_venta}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{p.forma_pago}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{p.nota || 'Abono regular'}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>{formatMoneda(p.monto)}</TableCell>
                    </TableRow>
                  ))}
                  {recientesAbonos.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center">No se han registrado abonos aún</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

        </Grid>

        {/* Columna Derecha: Plantas Recién Adquiridas */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AddCircleOutline color="success" />
              <Typography variant="h6" fontWeight={600}>Recién Adquiridas</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Últimos ingresos de plantas al sistema:
            </Typography>
            <Divider />
            
            <List>
              {recientesPlantas.map((planta, index) => (
                <Box key={planta.id || index}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <Yard sx={{ color: '#2E7D32', mr: 2, fontSize: 24 }} />
                    <ListItemText
                      primary={planta.nombre}
                      secondary={`Stock: ${planta.stock || planta.cantidad || 0} pzas`}
                      primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={700}>
                        {formatMoneda(planta.precio_menudeo || planta.precio || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: #{planta.id}
                      </Typography>
                    </Box>
                  </ListItem>
                  {index < recientesPlantas.length - 1 && <Divider component="li" />}
                </Box>
              ))}
              {recientesPlantas.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  No hay plantas añadidas recientemente.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  )
}