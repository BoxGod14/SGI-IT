import Route from '@ioc:Adonis/Core/Route'
import Roles from 'App/Enums/Roles'
import UserFactory from 'Database/factories/UserFactory'

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})
Route.get('/factories', async () => {
  await UserFactory
  .with('tickets', 3, (tickets) =>{
    tickets.pivotAttributes({ role: Roles.REQUESTER })
  })
  .with('profile')
  .createMany(20)
  return 'ok'
})
//Rutas a los controladores y extra
Route.group(() => {
  Route.post('/register', 'AuthController.register').as('auth.register')
  Route.get('/register', 'AuthController.registerForm').as('auth.register.show')
  Route.post('/login', 'AuthController.login').as('auth.login')
  Route.get('/login', 'AuthController.loginForm').as('auth.login.show')  
}).middleware('noAuth')
//Rutas y recursos que requieren estar logueados, en caso de no estarlos te llevan a login
Route.group(() => {
  Route.resource('tickets', 'TicketsController')
  Route.resource('users', 'UsersController')
  Route.get('/logout', 'AuthController.logout').as('auth.logout')
  Route.resource('messages', 'MessagesController')
  Route.post('/users/getUsers', 'UsersController.getUsers').as('users.getUsers')
  Route.put('/auth/changepassword', 'AuthController.changepassword').as('auth.changepassword')
}).middleware('auth')