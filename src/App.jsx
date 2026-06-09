import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme/theme'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Inventario from './pages/Inventario'
import NuevaVenta from './pages/NuevaVenta'
import Ventas from './pages/Ventas'
import Ganancias from './pages/Ganancias'
import Abonos from './pages/Abonos'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Inicio />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/nueva-venta" element={<NuevaVenta />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/ganancias" element={<Ganancias />} />
              <Route path="/abonos" element={<Abonos />} />
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
