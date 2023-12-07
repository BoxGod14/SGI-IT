import { DateTime } from 'luxon'
import { BaseModel, HasMany, ManyToMany, column, hasMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Message from './Message'
import User from './User'

export default class Ticket extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public requestorId: number

  @column()
  public technicianId: number

  @column()
  public subject: string

  @column()
  public description: string

  @column()
  public state: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  //Relaciones

  //Relacion con mensajes
  @hasMany(() => Message)
  public message: HasMany<typeof Message>

  //Relacion con usuario solicitante
  @manyToMany(() => User, {
    pivotColumns: ['role'],
  })
  public User: ManyToMany<typeof User>
}
