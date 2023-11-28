import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Roles from "App/Enums/Roles";
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
    const ticketData = request.only(["subject", "description"]);
    const trx = await Database.transaction();
    try {
      await request.validate(CreateTicketValidator);
      const user = await auth.use("web").authenticate();
      const ticket = await user
      .related('tickets')
      .create({
        subject: ticketData.subject,
        description: ticketData.description
      }, {
        role: Roles.REQUESTER
      })
      
      trx.commit;
      response.redirect().toRoute('TicketsController.show', [ticket.id]);
      return;
    } catch (error) {
      await trx.rollback();
      session.flash(error);
      session.flash(ticketData);
      response.redirect().back();
      return; //Si no se hace el return puede continuar el codigo
    }
  }

  public async show({view, params, auth}: HttpContextContract) {
    const user = await auth.use("web").authenticate();
    const ticket = await Ticket.findOrFail(params.id);
    //Comprobar que eres admin/tecnico o el usuario propietario
    if (user.roles == Roles.REQUESTER && user.id != ticket.requestorId) {
      //TODO: Si entra aqui es que no tiene permisos sobre este ticket, hay que redirigirlo.
    }
    //const requestor = await ticket.related('User').query()
    /*view.share({
      user: userEdit,
      profile: profile,
      roles: Roles,
    });*/
    //const html = await view.render("tickets/show");
    return "requestor";
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
