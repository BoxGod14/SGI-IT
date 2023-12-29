import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Roles from "App/Enums/Roles";
import State from "App/Enums/State";
import Ticket from "App/Models/Ticket";
import User from "App/Models/User";
import CreateTicketValidator from "App/Validators/CreateTicketValidator";

export default class TicketsController {
  public async index({ view, request }: HttpContextContract) {
    const page = request.input('page', 1)//Paginas de la paginacion
    const limit = 10; //Limite de tickets por pagina
    //Sección de filtros
    const technician = request.input('technician', '')
    const requester = request.input('requester', '')
    let state = request.input('state', '*')
    const ticketsQuery = Ticket.query();

    if (technician != '*' && technician != "" && technician != "null") {
        ticketsQuery.whereHas('User', (query) => {
            query.where('id', technician);
            query.wherePivot('role', Roles.TECHNICIAN);
        });
    }
    
    if (requester != '*' && requester != "") {
      ticketsQuery.whereHas('User', (query) => {
          query.where('id', requester);
          query.wherePivot('role', Roles.REQUESTER);
      });
    }

    if (Object.values(State).includes(state)) {
      ticketsQuery.where('state', state);
    }
    else {
      state = '*';
    }
    const tickets = await ticketsQuery
        .preload("User", (query) => {
            query.pivotColumns(["role"]).preload("profile");
        })
        .paginate(page, limit);
    tickets.baseUrl('/tickets')
    const html = await view.render("tickets/index", { tickets, Roles, State, currentPath: request.url() });
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
    //Obtener usuario
    const user = await auth.use("web").authenticate();
    //Comprobar que existe el ticket
    try {
      await Ticket.findByOrFail('id',params.id)
    } catch (error) {
      //Si entra aqui es que no existe el ticket
      response.redirect().toRoute("TicketsController.index");
      return;
    }
    //Obtener el ticket
    const ticket = await Ticket.query()
      .where("tickets.id", params.id)
      .preload("User", (query) => {
        query.pivotColumns(["role"]).preload("profile");
      })
      .preload('message')      
      .first();//Aunque solo hay 1 ticket por id, hay que indicar que solo obtenga el primero
    //TODO: Comprobar en caso de que sea un solicitante, que sea el mismo que el del ticket
    
    //Obtener perfil del usuario actual
    await user.load('profile')
    const technicians = await User
      .query()
      .where('roles', Roles.TECHNICIAN)
      .preload('profile')

    view.share({
      ticket: ticket,
      technicians: technicians,
      user: user,
      states: State,
      Roles: Roles,
    });
    const html = await view.render("tickets/show");
    return html;
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
