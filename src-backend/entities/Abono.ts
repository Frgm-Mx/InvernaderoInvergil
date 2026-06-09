import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('abonos')
export class Abono {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100 })
  nombre: string

  @Column({ type: 'varchar', length: 100 })
  uso: string

  @Column({ type: 'int' })
  cantidad: number
}
