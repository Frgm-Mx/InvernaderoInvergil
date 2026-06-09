import API from './api'

// Normalizar datos de venta (convertir strings a números)
const normalizeVenta = (venta) => ({
  ...venta,
  total: Number(venta.total),
  anticipo: Number(venta.anticipo),
  monto_pagado: Number(venta.monto_pagado),
  saldo_pendiente: Number(venta.saldo_pendiente),
})

const VentaService = {
  getAll: async () => {
    const { data } = await API.get('/api/ventas')
    return Array.isArray(data) ? data.map(normalizeVenta) : data
  },

  getById: async (id) => {
    const { data } = await API.get(`/api/ventas/${id}`)
    return normalizeVenta(data)
  },

  create: async (venta) => {
    const { data } = await API.post('/api/ventas', venta)
    return normalizeVenta(data)
  },

  // Filtros
  getByFecha: async (desde, hasta) => {
    const { data } = await API.get('/api/ventas', {
      params: { fecha_gte: desde, fecha_lte: hasta }
    })
    return Array.isArray(data) ? data.map(normalizeVenta) : data
  },

  getByFormaPago: async (forma) => {
    const { data } = await API.get('/api/ventas', { params: { forma_pago: forma } })
    return Array.isArray(data) ? data.map(normalizeVenta) : data
  },

  getByTipo: async (tipo) => {
    const { data } = await API.get('/api/ventas', { params: { tipo_venta: tipo } })
    return Array.isArray(data) ? data.map(normalizeVenta) : data
  },

  update: async (id, venta) => {
    const { data } = await API.put(`/api/ventas/${id}`, venta)
    return normalizeVenta(data)
  },
}

export default VentaService
