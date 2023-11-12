import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Ticket from './Ticket'
import User from './User'

export default class Message extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  //Relaciones

  //Relacion con tickets
  @belongsTo(() => Ticket)
  public ticket: BelongsTo<typeof Ticket>

  //Relacion con usuarios
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
