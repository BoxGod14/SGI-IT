import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel, hasOne, HasOne, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Profile from './Profile'
import Ticket from './Ticket'
import Message from './Message'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public username: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken: string | null

  @column()
  public roles: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  //Relaciones

  //Relacion con el perfil
  @hasOne(() => Profile)
  public profile: HasOne<typeof Profile>

  //Relacion con tickets
  @manyToMany(() => Ticket, {
    pivotColumns: ['role'],
  })
  public tickets: ManyToMany<typeof Ticket>

  //Relacion con mensajes
  @hasMany(() => Message)
  public message: HasMany<typeof Message>
}
