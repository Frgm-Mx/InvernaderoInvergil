import { useEffect, useState } from 'react'
import {
  Box, Typography, Card, CardContent, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material'
import { TrendingUp, TrendingDown, AttachMoney } from '@mui/icons-material'
import VentaService from '../services/VentaService'
import DetalleVentaService from '../services/DetalleVentaService' // Reincorporado
import PlantaService from '../services/PlantaService'

export default function Ganancias() {
  const [data, setData] = useState({ ventas: 0, costos: 0, ganancia: 0, detallePlantas: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Obtener las ventas y las plantas iniciales
        const [ventas, plantas] = await Promise.all([
          VentaService.getAll(),
          PlantaService.getAll()
        ])

        // 2. Indexar plantas en un Mapa O(1)
        const plantasIndexadas = plantas.reduce((acc, p) => {
          acc[String(p.id)] = p
          return acc
        }, {})

        // 3. ¡SOLUCIÓN CLAVE!: Tu API requiere pedir los detalles por cada ID de venta.
        // Hacemos las peticiones en paralelo usando las respuestas de ventas válidas.
        const promesasDetalles = ventas.map(v => 
          DetalleVentaService.getByVenta(v.id).catch(err => {
            console.error(`Error al traer detalles de venta ${v.id}:`, err)
            return [] // Retorna vacío si falla una venta individual para no romper todo
          })
        )
        
        const listaDeGruposDeDetalles = await Promise.all(promesasDetalles)
        
        // Aplanar los arreglos de detalles conseguidos individuales en una sola lista única
        const allDetalles = listaDeGruposDeDetalles.flat()

        const plantaMap = {}

        // 4. Procesar los detalles mapeados
        for (const d of allDetalles) {
          // Validar el formato del id_planta (por si viene como Objeto o como ID plano primitivo)
          const idPlantaBuscado = d.id_planta && typeof d.id_planta === 'object' 
            ? String(d.id_planta.id) 
            : String(d.id_planta);

          const planta = plantasIndexadas[idPlantaBuscado]
          if (!planta) continue

          const costo = planta.cultivada_vivero ? planta.costo_produccion : planta.costo_compra
          // Asegurar conversión numérica explícita por seguridad con la normalización
          const cantidad = Number(d.cantidad || 0)
          const costoTotal = (Number(costo) || 0) * cantidad

          if (!plantaMap[idPlantaBuscado]) {
            plantaMap[idPlantaBuscado] = {
              nombre: planta.nombre,
              cultivada: planta.cultivada_vivero,
              cantidadVendida: 0,
              ingresos: 0,
              costos: 0,
            }
          }
          plantaMap[idPlantaBuscado].cantidadVendida += cantidad
          plantaMap[idPlantaBuscado].ingresos += Number(d.subtotal || 0)
          plantaMap[idPlantaBuscado].costos += costoTotal
        }

        const detallePlantas = Object.values(plantaMap).map((p) => ({
          ...p,
          ganancia: p.ingresos - p.costos,
          margin: p.ingresos > 0 ? ((p.ingresos - p.costos) / p.ingresos) * 100 : 0,
        }))

        const totalVentas = detallePlantas.reduce((s, p) => s + p.ingresos, 0)
        const totalCostos = detallePlantas.reduce((s, p) => s + p.costos, 0)

        setData({
          ventas: totalVentas,
          costos: totalCostos,
          ganancia: totalVentas - totalCostos,
          detallePlantas: detallePlantas.sort((a, b) => (b.ganancia || 0) - (a.ganancia || 0)),
        })
      } catch (err) {
        console.error("Error al procesar ganancias:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Ingresos por Ventas', value: data.ventas, icon: <AttachMoney />, color: '#0288D1' },
    { label: 'Costos Totales', value: data.costos, icon: <TrendingDown />, color: '#D32F2F' },
    { label: 'Ganancia Neta', value: data.ganancia, icon: <TrendingUp />, color: data.ganancia >= 0 ? '#2E7D32' : '#D32F2F' },
  ]

  if (loading) return <Typography sx={{ p: 3 }}>Calculando ganancias...</Typography>

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Ganancias</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cálculo basado en ventas registradas vs. costos de producción/compra
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((c) => (
          <Grid item xs={12} sm={4} key={c.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Box sx={{ color: c.color, mb: 1 }}>{c.icon}</Box>
                <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                <Typography variant="h4" fontWeight={700} color={c.color}>
                  ${(c.value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Detalle por Planta</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'grey.50' } }}>
                  <TableCell>Planta</TableCell>
                  <TableCell>Origen</TableCell>
                  <TableCell align="right">Vendidas</TableCell>
                  <TableCell align="right">Ingresos</TableCell>
                  <TableCell align="right">Costos</TableCell>
                  <TableCell align="right">Ganancia</TableCell>
                  <TableCell align="right">Margen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.detallePlantas.map((p, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{p.nombre}</TableCell>
                    <TableCell>
                      <Chip label={p.cultivada ? 'Cultivada' : 'Comprada'} size="small" color={p.cultivada ? 'success' : 'info'} />
                    </TableCell>
                    <TableCell align="right">{(p.cantidadVendida || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">${(p.ingresos || 0).toFixed(2)}</TableCell>
                    <TableCell align="right">${(p.costos || 0).toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: (p.ganancia || 0) >= 0 ? 'success.main' : 'error.main' }}>
                      ${(p.ganancia || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${(p.margin || 0).toFixed(1)}%`}
                        size="small"
                        color={(p.margin || 0) >= 50 ? 'success' : (p.margin || 0) >= 20 ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {data.detallePlantas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No hay datos de ganancias aún
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}