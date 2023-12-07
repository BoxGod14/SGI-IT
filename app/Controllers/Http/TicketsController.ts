import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Roles from "App/Enums/Roles";
import State from "App/Enums/State";
import Ticket from "App/Models/Ticket";
import User from "App/Models/User";
import CreateTicketValidator from "App/Validators/CreateTicketValidator";


export default class TicketsController {
  public async index({ view }: HttpContextContract) {
    const ticket = await Ticket
      .query()
      .preload('User', (query) => {
        query.pivotColumns(['role'])
        .preload('profile')
      })
    view.share({
      tickets: ticket,
      Roles: Roles
    });
    const html = await view.render("tickets/index");
    return html;
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
      const ticket = await user.related("tickets").create(
        {
          subject: ticketData.subject,
          description: ticketData.description,
        },
        {
          role: Roles.REQUESTER,
        }
      );
      trx.commit;
      response.redirect().toRoute("TicketsController.show", [ticket.id]);
      return;
    } catch (error) {
      await trx.rollback();
      session.flash(error);
      session.flash(ticketData);
      response.redirect().back();
      return; //Si no se hace el return puede continuar el codigo
    }
  }

  public async show({ view, params, auth, response }: HttpContextContract) {
    let ticket: Ticket;
    //Obtener usuario
    const user = await auth.use("web").authenticate();
    //Obtener ticket
    try {
      ticket = await Ticket.findOrFail(params.id);
    } catch (error) {
      //Si entra aqui es que no existe el ticket
      response.redirect().toRoute("TicketsController.index");
      return;
    }
    //Obtener solicitante del ticket
    const requester = await ticket
      .related("User") //Buscar en la relacion del usuario
      .query() //Ejecutar consulta
      .preload("profile") //Precargar de forma anticipada las relaciones para el modelo, en este caso el perfil a traves del usuario
      .wherePivot("role", Roles.REQUESTER) //Condición en la tabla intermedia, en este caso el rol tiene que ser solicitante
      .first(); //Obtener solo el primer valor, aunque solo habra 1 de forma nativa, la query devuelve un array, por lo que el primer elemento arregla esto
    //Comprobar que en caso de ser solitante, seas el usuario propietario
    if (user.roles == Roles.REQUESTER && user.id != requester!.id) {
      response.redirect().toRoute("TicketsController.index");
      return;
    }
    const technician = await ticket
      .related("User") //Buscar en la relacion del usuario
      .query() //Ejecutar consulta
      .wherePivot("role", Roles.TECHNICIAN) //Condición en la tabla intermedia, en este caso el rol tiene que ser solicitante
      .first(); //Obtener solo el primer valor, aunque solo habra 1 de forma nativa, la query devuelve un array, por lo que el primer elemento arregla esto

    const technicians = await User
      .query()
      .where('roles', Roles.TECHNICIAN)
      .preload('profile')

    view.share({
      ticket: ticket,
      requester: requester,
      technician: technician,
      technicians: technicians,
      states: State,
      roles: Roles,
    });
    const html = await view.render("tickets/show");
    return html;
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
