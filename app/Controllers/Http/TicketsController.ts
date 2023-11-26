import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Ticket from "App/Models/Ticket";
import CreateTicketValidator from "App/Validators/CreateTicketValidator";

export default class TicketsController {
  public async index({}: HttpContextContract) {
    const ticket = await Ticket.all();
    return ticket;
  }

  public async create({ view }: HttpContextContract) {
    //Devolver vista de crear tickets
    const html = await view.render("tickets/create");
    return html;
  }

  public async store({
    request,
    response,
    auth,
    session,
  }: HttpContextContract) {
    const ticket = new Ticket();
    const ticketData = request.only(["subject", "description"]);
    try {
      await request.validate(CreateTicketValidator);
      const user = await auth.use("web").authenticate();
      ticket.merge(ticketData);
      ticket.requestorId = user.id;
      ticket.save();
    } catch (error) {
      session.flash(error);
      session.flash(ticketData);
      response.redirect().back();
      return; //Si no se hace el return puede continuar el codigo
    }
    return "ok";
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
