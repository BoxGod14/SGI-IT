/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

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
})
//Rutas y recursos que requieren estar logueados, en caso de no estarlos te llevan a login
Route.group(() => {
  Route.resource('tickets', 'TicketsController')
  Route.resource('users', 'UsersController')
  Route.get('/logout', 'AuthController.logout').as('auth.logout')
  Route.resource('messages', 'MessagesController')
}).middleware('auth')