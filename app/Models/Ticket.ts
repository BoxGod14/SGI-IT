import { DateTime } from 'luxon'
import { BaseModel, HasMany, ManyToMany, column, hasMany, manyToMany, computed } from '@ioc:Adonis/Lucid/Orm'
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
  
  @computed()
  public get timeCreated(){
    let duration = DateTime.now().diff(this.createdAt, ['years', 'months', 'days'])
    if (duration.years >= 1) {
      return Math.round(duration.years) + ' año' + (Math.round(duration.years) === 1 ? '' : 's')
    }
    else if (duration.months >= 1) {
      return Math.round(duration.months) + ' mes' + (Math.round(duration.months) === 1 ? '' : 'es')
    }
    return Math.round(duration.days) + ' día' + (Math.round(duration.days) === 1 ? '' : 's')
  }
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
