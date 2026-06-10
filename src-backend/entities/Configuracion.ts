// src-backend/entities/Configuracion.ts (nuevo archivo)
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('configuracion')
export class Configuracion {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100, unique: true })
  clave: string

  @Column({ type: 'text' })
  valor: string
}