import API from './api'

// Normalizar datos de planta (convertir strings a números)
const normalizePlanta = (planta) => ({
  ...planta,
  cantidad: Number(planta.cantidad),
  precio: Number(planta.precio),
  costo_produccion: Number(planta.costo_produccion),
  costo_compra: Number(planta.costo_compra),
  activo: planta.activo !== undefined ? planta.activo : true,
})

const PlantaService = {
  // Obtener solo plantas activas (para ventas)
  getAll: async () => {
    const { data } = await API.get('/api/plantas/activas')
    return Array.isArray(data) ? data.map(normalizePlanta) : data
  },

  // Obtener todas las plantas (incluyendo inactivas - para administración)
  getAllIncludingInactive: async () => {
    const { data } = await API.get('/api/plantas/todas')
    return Array.isArray(data) ? data.map(normalizePlanta) : data
  },

  getById: async (id) => {
    const { data } = await API.get(`/api/plantas/${id}`)
    return normalizePlanta(data)
  },

  create: async (planta) => {
    const { data } = await API.post('/api/plantas', planta)
    return normalizePlanta(data)
  },

  update: async (id, planta) => {
    const { data } = await API.put(`/api/plantas/${id}`, planta)
    return normalizePlanta(data)
  },

  // Eliminación lógica (deshabilitar)
  delete: async (id) => {
    const { data } = await API.delete(`/api/plantas/${id}`)
    return data
  },

  // Deshabilitar planta específicamente
  deshabilitar: async (id) => {
    const { data } = await API.patch(`/api/plantas/${id}/deshabilitar`)
    return data
  },

  // Reactivar planta
  reactivar: async (id) => {
    const { data } = await API.patch(`/api/plantas/${id}/reactivar`)
    return data
  },

  // Verificar si tiene ventas asociadas
  tieneVentas: async (id) => {
    const { data } = await API.get(`/api/plantas/${id}/tiene-ventas`)
    return data
  },

  // Actualizar stock (para ventas)
  updateStock: async (id, cantidad) => {
    const response = await API.patch(`/api/plantas/${id}/stock`, { cantidad })
    return response.data
  },
}

export default PlantaService