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
    
    if (requester != '*' && requester != "" && requester != "null") {
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

  public async show({ view, params, auth, response, request }: HttpContextContract) {
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
      .preload("User", (userQuery) => {
        userQuery.pivotColumns(["role"]).preload("profile");
      })
      .preload('message', (messageQuery) => {
        messageQuery.preload('user', (userQuery) => {
          userQuery.preload('profile');
        })
        .orderBy('created_at', 'desc')//Tiene sentido ver primero los ultimos mensajes creados
      })      
      .first();//Aunque solo hay 1 ticket por id, hay que indicar que solo obtenga el primero
    //Comprobar en caso de que sea un solicitante, que sea el mismo que el del ticket
    if (user.roles == Roles.REQUESTER) {
      ticket!.User.forEach(userSearch => {
        if (userSearch.$extras.pivot_role == Roles.REQUESTER && userSearch.$extras.pivot_user_id != user.id) {
          response.redirect().toRoute("TicketsController.index");
          return;
        }
      });
    }
    
    //Obtener perfil del usuario actual
    await user.load('profile')
    view.share({
      ticket: ticket,
      user: user,
      State: State,
      Roles: Roles,
      currentPath: request.url()
    });
    const html = await view.render("tickets/show");
    return html;
  }

  public async edit({}: HttpContextContract) {}

  public async update({request, auth, response}: HttpContextContract) {
    //Obtener usuario y comprobar su rol
    const user = await auth.use("web").authenticate();
    if (user.roles == Roles.REQUESTER) {
      return response.status(403).json({ message: "Error editar ticket" });
    }
    const trx = await Database.transaction()
    try {
      //Obtener ticket
      const ticket = await Ticket.findOrFail(request.input('ticketId'))

      //Cambiar estado del ticket
      ticket.state = request.input('state');
      ticket.save();
      //Obtener nuevo tecnico y solicitante, de lo contrario se perdera el solicitante.
      const technician = await User.findOrFail(request.input('technician'));
      const requester = await ticket.related('User').query().wherePivot('role', Roles.REQUESTER).firstOrFail()
      //Se quita la relacion antigua
      await ticket.related('User').detach();
      //Se añade la nueva relacion
      await ticket.related('User').sync({
        [technician.id]:{
          role: Roles.TECHNICIAN
        },
        [requester.id]:{
          role: Roles.REQUESTER,          
        },
      })      
      //TODO AÑADIR POSIBILIDAD DE SER REQUESTER Y TECHINICIAN EL MISMO(Poner despues de terminar proyecto).
      await trx.commit;
      return response.status(200).json({ message: "Ticket editado correctamente", status: "ok" });
    } catch (error) {
      await trx.rollback();
      return response.status(400).json({ message: "Error editando el ticket", status: "error" });
    }
  }

  public async destroy({request, response, auth}: HttpContextContract) {
    const user = await auth.use("web").authenticate();
    if (user.roles == Roles.REQUESTER) {
      return response.status(400);
    }
    const trx = await Database.transaction()
    try {
      const ticket = await Ticket.findOrFail(request.input('ticketId'));
      await ticket.delete();
      await trx.commit;
      return response.status(200);
    } catch (error) {
      await trx.rollback();
      return response.status(400);
    }    
  }
}
