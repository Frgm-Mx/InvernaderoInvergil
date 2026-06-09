import 'reflect-metadata'
import { AppDataSource } from './database.js'
import { Usuario } from './entities/Usuario.js'
import { Planta } from './entities/Planta.js'
import { Venta } from './entities/Venta.js'
import { DetalleVenta } from './entities/DetalleVenta.js'
import { Abono } from './entities/Abono.js'
import { PagoVenta } from './entities/PagoVenta.js'
import fs from 'fs'

interface DBJson {
  usuarios?: any[]
  plantas?: any[]
  ventas?: any[]
  detalles_venta?: any[]
  abonos?: any[]
  pagos_venta?: any[]
}

async function migrate() {
  try {
    console.log('🔄 Inicializando conexión a PostgreSQL...')
    await AppDataSource.initialize()
    console.log('✓ Conexión establecida')

    // Leer db.json
    console.log('📂 Leyendo db.json...')
    const dbJson: DBJson = JSON.parse(fs.readFileSync('db.json', 'utf-8'))

    const usuarioRepo = AppDataSource.getRepository(Usuario)
    const plantaRepo = AppDataSource.getRepository(Planta)
    const ventaRepo = AppDataSource.getRepository(Venta)
    const detalleRepo = AppDataSource.getRepository(DetalleVenta)
    const abonoRepo = AppDataSource.getRepository(Abono)
    const pagoRepo = AppDataSource.getRepository(PagoVenta)

    // Migrar usuarios
    if (dbJson.usuarios && dbJson.usuarios.length > 0) {
      console.log(`📝 Migrando ${dbJson.usuarios.length} usuarios...`)
      await usuarioRepo.save(dbJson.usuarios)
      console.log('✓ Usuarios migrados')
    }

    // Migrar plantas
    if (dbJson.plantas && dbJson.plantas.length > 0) {
      console.log(`🌱 Migrando ${dbJson.plantas.length} plantas...`)
      await plantaRepo.save(dbJson.plantas)
      console.log('✓ Plantas migradas')
    }

    // Migrar ventas
    if (dbJson.ventas && dbJson.ventas.length > 0) {
      console.log(`🛒 Migrando ${dbJson.ventas.length} ventas...`)
      for (const venta of dbJson.ventas) {
        const usuario = await usuarioRepo.findOne({ where: { id: venta.id_usuario } })
        await ventaRepo.save({ ...venta, id_usuario: usuario })
      }
      console.log('✓ Ventas migradas')
    }

    // Migrar detalles de venta
    if (dbJson.detalles_venta && dbJson.detalles_venta.length > 0) {
      console.log(`📋 Migrando ${dbJson.detalles_venta.length} detalles de venta...`)
      for (const detalle of dbJson.detalles_venta) {
        const venta = await ventaRepo.findOne({ where: { id: detalle.id_venta } })
        const planta = await plantaRepo.findOne({ where: { id: detalle.id_planta } })
        await detalleRepo.save({ ...detalle, id_venta: venta, id_planta: planta })
      }
      console.log('✓ Detalles migrados')
    }

    // Migrar abonos
    if (dbJson.abonos && dbJson.abonos.length > 0) {
      console.log(`🧪 Migrando ${dbJson.abonos.length} abonos...`)
      await abonoRepo.save(dbJson.abonos)
      console.log('✓ Abonos migrados')
    }

    // Migrar pagos
    if (dbJson.pagos_venta && dbJson.pagos_venta.length > 0) {
      console.log(`💰 Migrando ${dbJson.pagos_venta.length} pagos...`)
      for (const pago of dbJson.pagos_venta) {
        const venta = await ventaRepo.findOne({ where: { id: pago.id_venta } })
        await pagoRepo.save({ ...pago, id_venta: venta })
      }
      console.log('✓ Pagos migrados')
    }

    console.log('\n✅ ¡Migración completada exitosamente!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    process.exit(1)
  }
}

migrate()
