import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { DetalleVenta } from './DetalleVenta'

@Entity('plantas')
export class Planta {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100 })
  nombre: string

  @Column({ type: 'varchar', length: 50 })
  tipo: string

  @Column({ type: 'int' })
  cantidad: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo_produccion: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo_compra: number

  @Column({ type: 'boolean' })
  cultivada_vivero: boolean

  @Column({ type: 'text', nullable: true })
  descripcion: string

   @Column({ type: 'boolean', default: true })
  activo: boolean

  @OneToMany(() => DetalleVenta, (detalle) => detalle.id_planta)
  detalles: DetalleVenta[]
}
