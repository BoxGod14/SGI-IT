import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, HasMany, belongsTo, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
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
  @belongsTo(() => User, {
    foreignKey: 'requestor_id',
    relatedKey: 'id',
  })
  public requestor: BelongsTo<typeof User>

  //Relacion con usuario tecnico
  @belongsTo(() => User, {
    foreignKey: 'technician_id',
    relatedKey: 'id',
  })
  public technician: BelongsTo<typeof User>
}
