import API from './api'

const AbonoService = {
  getAll: async () => {
    const { data } = await API.get('/api/abonos')
    return data
  },

  create: async (abono) => {
    const { data } = await API.post('/api/abonos', abono)
    return data
  },

  update: async (id, abono) => {
    const { data } = await API.put(`/api/abonos/${id}`, abono)
    return data
  },

  delete: async (id) => {
    await API.delete(`/api/abonos/${id}`)
  },
}

export default AbonoService
