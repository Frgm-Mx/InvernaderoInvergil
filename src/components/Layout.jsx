import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Box, Avatar, Divider, useMediaQuery, useTheme
} from '@mui/material'
import {
  Menu as MenuIcon, Yard, ShoppingCart, Assessment, Receipt,
  Science, People, Logout, Home, LocalFlorist
} from '@mui/icons-material'
import { useAuth } from '../auth/AuthContext'

const DRAWER_WIDTH = 260

const menuItems = [
  { text: 'Inicio', icon: <Home />, path: '/' },
  { text: 'Inventario', icon: <Yard />, path: '/inventario' },
  { text: 'Nueva Venta', icon: <ShoppingCart />, path: '/nueva-venta' },
  { text: 'Ventas', icon: <Receipt />, path: '/ventas' },
  { text: 'Ganancias', icon: <Assessment />, path: '/ganancias', adminOnly: true }, 
  { text: 'Fertilizantes', icon: <Science />, path: '/abonos' },
  { text: 'Usuarios', icon: <People />, path: '/usuarios', adminOnly: true },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleNav = (path) => {
    navigate(path)
    if (isMobile) setMobileOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

const filteredMenu = menuItems.filter(
  (item) => !item.adminOnly || (user?.rol === 'administradora' || user?.rol === 'admin')
)

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del drawer */}
      <Box sx={{
        p: 3, textAlign: 'center',
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #43A047 100%)',
        color: '#fff',
      }}>
        <LocalFlorist sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
          Vivero Invergil
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          Control de Inventario y Ventas
        </Typography>
      </Box>

      {/* Info usuario */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: 14 }}>
          {user?.nombre?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>{user?.nombre}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {user?.rol}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Menú */}
      <List sx={{ flex: 1, px: 1, py: 0.5 }}>
        {filteredMenu.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => handleNav(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2, mb: 0.5, mx: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main', color: '#fff',
                '& .MuiListItemIcon-root': { color: '#fff' },
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
          </ListItemButton>
        ))}
      </List>

      <Divider />
      <List sx={{ px: 1 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, mx: 0.5, color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}><Logout /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
        </ListItemButton>
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar solo en móvil */}
      {isMobile && (
        <AppBar position="fixed" elevation={1} sx={{ bgcolor: 'primary.main' }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <LocalFlorist sx={{ mx: 1 }} />
            <Typography variant="h6" sx={{ fontFamily: "'Playfair Display', serif" }}>
              Vivero Invergil
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH, borderRight: '1px solid',
                borderColor: 'divider', bgcolor: 'background.paper',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Contenido */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, p: 3, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 }, bgcolor: 'background.default', minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
