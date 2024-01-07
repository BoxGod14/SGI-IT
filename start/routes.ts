import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'
import Roles from 'App/Enums/Roles'
import State from 'App/Enums/State'
import Ticket from 'App/Models/Ticket'
import UserFactory from 'Database/factories/UserFactory'

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
  Route.get('/', async ({ view }) => {
  return view.render('welcome')
}) 
}).middleware('noAuth')
//Rutas y recursos que requieren estar logueados, en caso de no estarlos te llevan a login
Route.group(() => {
  Route.resource('tickets', 'TicketsController').except(['edit','create'])
  Route.resource('users', 'UsersController').except(['create', 'store', 'edit'])
  Route.get('/logout', 'AuthController.logout').as('auth.logout')
  Route.resource('messages', 'MessagesController').only(['store'])
  Route.post('/users/getUsers', 'UsersController.getUsers').as('users.getUsers')
  Route.put('/auth/changepassword', 'AuthController.changepassword').as('auth.changepassword')
  
  Route.get('/dashboard', async ({ view, request }) => {
    const OpenTickets = await Database.from('tickets').where('state', State.OPEN).count('* as total')
    const InProgressTickets = await Database.from('tickets').where('state', State.INPROGRESS).count('* as total')
    const SolvedTickets = await Database.from('tickets').where('state', State.SOLVED).count('* as total')

    //Obtener tickets asignados a algun tecnico
    const AssignedTickets = await Ticket
      .query()
      .whereNot('state', State.SOLVED)
      .whereHas('User', (userQuery) => {
        userQuery.where('role', Roles.REQUESTER)
      })
      .andWhereHas('User', (userQuery) => {
        userQuery.where('role', Roles.TECHNICIAN)
      })
      .count('* as total')
      .pojo()

    //Obtener tickets no asignados a ningun tecnico
    const NoAssignedTickets = await Ticket
      .query()
      .whereNot('state', State.SOLVED)
      .whereHas('User', (userQuery) => {
        userQuery.where('role', Roles.REQUESTER)
      })
      .whereDoesntHave('User', (userQuery) => {
        userQuery.where('role', Roles.TECHNICIAN)
      })
      .count('* as total')
      .pojo()

    const html = await view.render("dashboard", {Roles, State,currentPath: request.url(), OpenTickets, InProgressTickets, SolvedTickets, AssignedTickets: AssignedTickets[0].total, NoAssignedTickets: NoAssignedTickets[0].total });
    return html;
  }).as('dashboard')
}).middleware('auth')