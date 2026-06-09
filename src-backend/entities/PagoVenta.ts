import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Venta } from './Venta'

@Entity('pagos_venta')
export class PagoVenta {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Venta, (venta) => venta.pagos)
  @JoinColumn({ name: 'id_venta' })
  id_venta: Venta

  @Column({ type: 'timestamp' })
  fecha: Date

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number

  @Column({ type: 'varchar', length: 50 })
  tipo: string

  @Column({ type: 'varchar', length: 50 })
  forma_pago: string

  @Column({ type: 'text', nullable: true })
  nota: string

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, nullable: true })
  cambio: number
}
