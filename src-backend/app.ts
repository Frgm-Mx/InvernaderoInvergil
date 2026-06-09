import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { AppDataSource } from './database'
import * as routes from './routes'

dotenv.config()

const app = express()
const PORT = Number(process.env.API_PORT) || 3001

app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))

app.use('/api/usuarios', routes.usuariosRouter)
app.use('/api/plantas', routes.plantasRouter)
app.use('/api/ventas', routes.ventasRouter)
app.use('/api/detalles-venta', routes.detallesVentaRouter)
app.use('/api/abonos', routes.abonasRouter)
app.use('/api/pagos-venta', routes.pagosVentaRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' })
})

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Error interno' })
})

AppDataSource.initialize()
  .then(() => {
    console.log('✓ Conexión a PostgreSQL establecida')
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Servidor corriendo en puerto ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('✗ Error al conectar:', error)
    process.exit(1)
  })