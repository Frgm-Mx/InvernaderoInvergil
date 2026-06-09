import { DataSource } from 'typeorm'
import { Usuario } from './entities/Usuario.js'
import { Planta } from './entities/Planta.js'
import { Venta } from './entities/Venta.js'
import { DetalleVenta } from './entities/DetalleVenta.js'
import { Abono } from './entities/Abono.js'
import { PagoVenta } from './entities/PagoVenta.js'
import dotenv from 'dotenv'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,  // ← Usar URL completa de Neon.tech
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [Usuario, Planta, Venta, DetalleVenta, Abono, PagoVenta],
  migrations: ['src-backend/migrations/**/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})