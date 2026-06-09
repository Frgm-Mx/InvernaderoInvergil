import { createContext, useContext, useState } from 'react'
import AuthService from '../services/AuthService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(AuthService.getUser())

  const login = async (usuario, password) => {
    const u = await AuthService.login(usuario, password)
    setUser(u)
    return u
  }

  const logout = () => {
    AuthService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
