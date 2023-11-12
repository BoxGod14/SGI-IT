import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class UsersController {
  public async index({ }: HttpContextContract) {
    const user = await User.all()
    return user
  }

  public async show({ params }: HttpContextContract) {
    return "mostrar info del usuario" + params.id
  }

  public async edit({ }: HttpContextContract) {
    return "mostrar form para editar el usuario"
  }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }
}
