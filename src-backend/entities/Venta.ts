import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { Usuario } from './Usuario'
import { DetalleVenta } from './DetalleVenta'
import { PagoVenta } from './PagoVenta'

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'timestamp' })
  fecha: Date

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number

  @Column({ type: 'varchar', length: 50 })
  forma_pago: string

  @Column({ type: 'varchar', length: 50 })
  tipo_venta: string

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'id_usuario' })
  id_usuario: Usuario

  @Column({ type: 'varchar', length: 100, nullable: true })
  nota_remision: string

  @Column({ type: 'text', nullable: true })
  observaciones: string

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  anticipo: number

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto_pagado: number

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  saldo_pendiente: number

  @Column({ type: 'varchar', length: 50 })
  estado: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  cliente_nombre: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  cliente_telefono: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  cliente_email: string

  @OneToMany(() => DetalleVenta, (detalle) => detalle.id_venta, { cascade: true })
  detalles: DetalleVenta[]

  @OneToMany(() => PagoVenta, (pago) => pago.id_venta, { cascade: true })
  pagos: PagoVenta[]
}
