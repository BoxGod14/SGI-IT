import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import View from '@ioc:Adonis/Core/View'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'
import session from 'Config/session'

export default class AuthController {

    public async registerForm({ }: HttpContextContract) {
        return "Aqui va la pagina para crear el usuario"
    }

    public async register({ request, response }: HttpContextContract) {
        const user = new User
        try {
            //Validación de datos
            let data = await request.validate(CreateUserValidator)
            //Selecionar solo registros que necesito y guardar
            data = request.only(['username', 'email', 'password'])
            user.merge(data)
            user.save()

        } catch (error) {
            response.badRequest(error.messages)
        }
        return user
    }

    public async login({ auth, request, response }: HttpContextContract) {
        const usernameOrEmail = request.input('usernameOrEmail')
        const password = request.input('password')
        session.flash('message', 'Hello world')
        try {
            await auth.use('web').attempt(usernameOrEmail, password)
            console.log('User: ' + auth.user?.id + ' login')
            response.redirect().toRoute('UsersController.show', { id: auth.user?.id })

        } catch (error) {            
            session.flash('form', 'Tu usuario o contraseñas son incorrectos')
            return response.redirect().back()
        }
    }
    public async loginForm({ auth }: HttpContextContract) {
        //Comprobar si ya se habia iniciado sesión
        await auth.use('web').authenticate()
        if (auth.use('web').isLoggedIn) {
            return "Sesion iniciada"
        }
        //Devolver vista de login
        const html = await View.render('auth/login', {})
        return html
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.logout()
        response.redirect().toRoute('AuthController.loginForm')
    }

}
