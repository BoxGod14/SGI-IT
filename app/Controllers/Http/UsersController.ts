import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import View from '@ioc:Adonis/Core/View'
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

  public async show({ params }: HttpContextContract) {
    return "mostrar info del usuario" +params.id
  }

  public async edit({}: HttpContextContract) {
    return "mostrar form para editar el usuario"
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}

  public async login({ auth, request, response }: HttpContextContract) {
    const usernameOrEmail = request.input('usernameOrEmail')
    const password = request.input('password')

    try {
      await auth.use('web').attempt(usernameOrEmail, password)
      console.log('User: ' + auth.user?.id +' login')
      response.redirect().toRoute('UsersController.show', { id: auth.user?.id })

    } catch (error) {
      return response.badRequest('Invalid credentials')
    }
  }
  public async loginForm({ auth }: HttpContextContract) {
    //Comprobar si ya se habia iniciado sesión
    await auth.use('web').authenticate()
    if (auth.use('web').isLoggedIn) {
      return "Sesion iniciada"
    }
    //Devolver vista de login
    const html = await View.render('auth/login',{})
    return html
  }
  
  public async logout({ auth, response }: HttpContextContract){
    await auth.use('web').logout()
    response.redirect('/')
  }
}
