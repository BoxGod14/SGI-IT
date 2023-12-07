import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public userId: number

  @column()
  public name: string

  @column()
  public surname: string
  
  @column.date()
  public birthday: DateTime

  @column()
  public picture: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get fullName(){
    return this.name + " " + this.surname;
  }
  
  //Relaciones
  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
