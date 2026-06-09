import { createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',      // Verde vivero
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#8D6E63',      // Tierra/madera
      light: '#A1887F',
      dark: '#5D4037',
      contrastText: '#fff',
    },
    background: {
      default: '#F1F8E9',   // Verde muy claro
      paper: '#FFFFFF',
    },
    success: { main: '#43A047' },
    warning: { main: '#F9A825' },
    error: { main: '#D32F2F' },
    info: { main: '#0288D1' },
    text: {
      primary: '#263238',
      secondary: '#546E7A',
    },
  },
  typography: {
    fontFamily: "'Source Sans 3', 'Segoe UI', sans-serif",
    h4: { fontFamily: "'Playfair Display', serif", fontWeight: 700 },
    h5: { fontFamily: "'Playfair Display', serif", fontWeight: 600 },
    h6: { fontFamily: "'Playfair Display', serif", fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '8px 20px' },
        contained: { boxShadow: '0 2px 8px rgba(46,125,50,0.3)' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small', fullWidth: true },
    },
  },
})

export default theme
