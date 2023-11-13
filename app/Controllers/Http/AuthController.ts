import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class AuthController {

    public async registerForm({ response, auth, view }: HttpContextContract) {
        this.comprobarYRedirigirSiAutenticado(auth , response)
        //Comprobar si ya se habia iniciado sesión
        await auth.use('web').authenticate()
        if (auth.use('web').isLoggedIn) {
            //Si ya tenias sesión te vas a la pagina de inicio
            response.redirect('/')
        }
        //Devolver vista de login
        const html = await view.render('auth/register')
        return html
    }

    public async register({ request, response, auth, session }: HttpContextContract) {
        this.comprobarYRedirigirSiAutenticado(auth , response)
        const user = new User
        try {
            //Validación de datos
            let data = await request.validate(CreateUserValidator)
            //Selecionar solo registros que necesito y guardar
            data = request.only(['username', 'email', 'password'])
            user.merge(data)
            
            user.save()
        } catch (error) {
            session.flash(error)
            response.redirect().back()
        }
        return user
    }

    public async login({ auth, request, response, session }: HttpContextContract) {
        this.comprobarYRedirigirSiAutenticado(auth , response)
        const uuid = request.input('uuid')
        const password = request.input('password')
        try {
            await auth.use('web').attempt(uuid, password)
            console.log('User: ' + auth.user?.id + ' login')
            response.redirect().toRoute('UsersController.show', { id: auth.user?.id })

        } catch (error) {            
            session.flash('errors', 'Tu usuario o contraseñas son incorrectos')
            return response.redirect().back()
        }
    }

    public async loginForm({ auth, view, response }: HttpContextContract) {
        this.comprobarYRedirigirSiAutenticado(auth , response)
        //Devolver vista de login
        const html = await view.render('auth/login')
        return html
    }

    public async logout({ auth, response }: HttpContextContract) {
        await auth.use('web').authenticate()
        if (auth.use('web').isGuest) {
            //Si no tenias sesión te vas a la pagina de login
            response.redirect().toRoute('AuthController.loginForm')
        }
        //Cierre de sesión y redirección a pagina de login
        await auth.logout()
        response.redirect().toRoute('AuthController.loginForm')
    }

    private async comprobarYRedirigirSiAutenticado(auth , response) {
        //Comprobar si ya se habia iniciado sesión
        await auth.use('web').authenticate()
        if (auth.use('web').isLoggedIn) {
            //Si ya tenias sesión te vas a la pagina de inicio
            response.redirect('/')
        }
    }
}
