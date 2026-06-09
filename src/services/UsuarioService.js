import API from './api'

const UsuarioService = {
  getAll: async () => {
    const { data } = await API.get('/api/usuarios')
    // No exponer passwords
    return data.map(({ password, ...u }) => u)
  },

  create: async (usuario) => {
    const { data } = await API.post('/api/usuarios', usuario)
    return data
  },

  update: async (id, usuario) => {
    const { data } = await API.put(`/api/usuarios/${id}`, usuario)
    return data
  },

  delete: async (id) => {
    await API.delete(`/api/usuarios/${id}`)
  },
}

export default UsuarioService
