import API from './api'

const AuthService = {
  login: async (usuario, password) => {
    // Enviar credenciales al endpoint POST de login
    const { data } = await API.post('/api/usuarios/login', { usuario, password })
    // No enviar password al frontend (ya viene sin password del backend)
    localStorage.setItem('user', JSON.stringify(data))
    return data
  },

  logout: () => {
    localStorage.removeItem('user')
  },

  getUser: () => {
    return JSON.parse(localStorage.getItem('user') || 'null')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('user')
  },
}

export default AuthService