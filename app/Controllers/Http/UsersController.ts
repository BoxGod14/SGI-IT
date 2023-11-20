import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Roles from 'App/Enums/Roles'
import User from 'App/Models/User'

export default class UsersController {
  public async index({ }: HttpContextContract) {
    const user = await User.all()
    return user
  }

  public async show({ params }: HttpContextContract) {
    const user = (await User.findByOrFail('id', params.id))
    return "mostrar info del usuario " + user.username
  }

  public async edit({ view, params, auth, response }: HttpContextContract) {
    const user = await auth.use('web').authenticate()
    //Si no eres admin o el usuario en cuestion, seras redirigido a tu edit.
    if (user.roles != Roles.ADMIN && user.id != params.id) {
      response.redirect().toRoute('UsersController.edit', [user.id])
    }
    //Obtener datos del usuario que se va a editar y obtencion/generacion del token necesario para la API
    const userEdit = (await User.findByOrFail('id', params.id))
    const token = await auth.use('api').generate(user, {
      expiresIn: '30 mins'
    })
    view.share({
      user: userEdit,
      token: token
    })
    const html = view.render('user/edit.edge')
    return html
  }

  public async update({ auth, request, response }: HttpContextContract) {
    //Obtener usuario mediante token
    const user = await auth.use('api').authenticate()
    //Comprobar si eres admin o el mismo usuario a editar
    if (user.roles != Roles.ADMIN && user.id != request.input('userId')) {
      return response.status(403).json({ message: 'Error al editar usuario' })
    }
    const userEdit = await User.findByOrFail('id', request.input('userId'))
    userEdit.username = request.input('username')
    userEdit.save()
    return response.status(200).json({ message: 'Usuario editado exitosamente' })

  }

  public async destroy({ }: HttpContextContract) { }
}
