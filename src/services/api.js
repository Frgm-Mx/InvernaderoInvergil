import axios from 'axios'

// URL del backend (se configura en Netlify)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const API = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`
  }
  return config
})

export default API