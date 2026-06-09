import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Venta } from './Venta'

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100 })
  nombre: string

  @Column({ type: 'varchar', length: 50, unique: true })
  usuario: string

  @Column({ type: 'varchar', length: 100 })
  password: string

  @Column({ type: 'varchar', length: 50 })
  rol: string

  @OneToMany(() => Venta, (venta) => venta.id_usuario)
  ventas: Venta[]
}
