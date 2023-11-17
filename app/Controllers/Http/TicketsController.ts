import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Ticket from 'App/Models/Ticket'
import User from 'App/Models/User'

export default class TicketsController {
  public async index({}: HttpContextContract) {
    const ticket = await Ticket.all()
    return ticket
  }

  public async create({ view }: HttpContextContract) {    
    //Devolver vista de crear tickets
    const html = await view.render('tickets/create')
    return html
  }

  public async store({ auth }: HttpContextContract) {
    const ticket = new Ticket
    try {
      const user = await auth.use('web').authenticate()  
      ticket.requestorId = user.id
      ticket.subject = "test"
      ticket.description = "testagain"
      ticket.save()
    } catch (error) {
      return 'error'
    }
    
    
    return "ok"
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
