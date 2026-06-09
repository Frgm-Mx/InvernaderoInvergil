import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Venta } from './Venta'
import { Planta } from './Planta'

@Entity('detalles_venta')
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Venta, (venta) => venta.detalles)
  @JoinColumn({ name: 'id_venta' })
  id_venta: Venta

  @ManyToOne(() => Planta, (planta) => planta.detalles)
  @JoinColumn({ name: 'id_planta' })
  id_planta: Planta

  @Column({ type: 'int' })
  cantidad: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario: number

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number
}
