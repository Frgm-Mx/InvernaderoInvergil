import { DataSource } from 'typeorm'
import { Usuario } from './entities/Usuario'
import { Planta } from './entities/Planta'
import { Venta } from './entities/Venta'
import { DetalleVenta } from './entities/DetalleVenta'
import { Abono } from './entities/Abono'
import { PagoVenta } from './entities/PagoVenta'
import dotenv from 'dotenv'
import { Configuracion } from './entities/Configuracion' 


dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(isProduction 
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'vivero_invergil',
      }
  ),
  synchronize: true,
  logging: !isProduction,
  entities: [Usuario, Planta, Venta, DetalleVenta, Abono, PagoVenta, Configuracion],
  migrations: ['src-backend/migrations/**/*.ts'],
  ssl: isProduction ? { rejectUnauthorized: false } : false
})