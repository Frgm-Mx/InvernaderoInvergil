import API from './api'

// Normalizar datos de detalle (convertir strings a números)
const normalizeDetalle = (detalle) => ({
  ...detalle,
  cantidad: Number(detalle.cantidad),
  precio_unitario: Number(detalle.precio_unitario),
  subtotal: Number(detalle.subtotal),
})

const DetalleVentaService = {
  getByVenta: async (idVenta) => {
    const { data } = await API.get(`/api/detalles-venta/venta/${idVenta}`)
    return Array.isArray(data) ? data.map(normalizeDetalle) : data
  },

  create: async (detalle) => {
    const { data } = await API.post('/api/detalles-venta', detalle)
    return normalizeDetalle(data)
  },

  createMultiple: async (detalles) => {
    const results = []
    for (const d of detalles) {
      const { data } = await API.post('/api/detalles-venta', d)
      results.push(normalizeDetalle(data))
    }
    return results
  },
}

export default DetalleVentaService
