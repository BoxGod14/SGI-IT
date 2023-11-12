import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class UsersController {
  public async index({}: HttpContextContract) {
    const user = await User.all()
    return user
  }

  public async create({}: HttpContextContract) {
    return "Aqui va la pagina para crear el usuario"
  }

  public async store({ request, response }: HttpContextContract) {
    const user = new User
    try {
      //Validación de datos
      let data = await request.validate(CreateUserValidator)
      //Selecionar solo registros que necesito y guardar
      data = await request.only(['username', 'email', 'password'])      
      user.merge(data)
      user.save()

    } catch (error) {
      response.badRequest(error.messages)
    }    
    return user
  }

  public async show({}: HttpContextContract) {
    return "mostrar info del usuario"
  }

  public async edit({}: HttpContextContract) {
    return "mostrar form para editar el usuario"
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}

  public async login({}: HttpContextContract) {

  }
  public async loginForm({}: HttpContextContract) {
    return "El formulario de login :D"
  }
}
