import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Roles from "App/Enums/Roles";
import Ticket from "App/Models/Ticket";
import User from "App/Models/User";

export default class MessagesController {
  public async store({ auth, request, response }: HttpContextContract) {
    //Comprobar que el mensaje no esta vacio
    if (!request.input('message').trim()) {
      return response.status(400).json({ message: "Error" });
    }
    //Obtener usuario
    const user = await auth.use("web").authenticate();
    let requester: User;    
    
    //Comprobacion de existencia del ticket
    try {
      await Ticket.findOrFail(request.input("ticketId"));
    } catch (error) {
      return response.status(403).json({ message: "Error" });
    }
    //Obtener ticket
    let ticket = await Ticket.query()
      .where("tickets.id", request.input("ticketId"))
      .preload("User", (query) => {
        query.pivotColumns(["role"])
        .wherePivot('role', Roles.REQUESTER)
      })  
      .first();
    //Obtener requester    
    ticket!.User.forEach(requesterTicket => {
      requester = requesterTicket;
    });
    
    //Comprobar que el usuario que escribe en caso de ser requester, sea el propietario del ticket
    if (user.roles == Roles.REQUESTER && user.id != requester!.id) {
      return response.status(403).json({ message: "Error" });
    }
    //Abrir transacción
    const trx = await Database.transaction();
    try {
      //Crear mensaje realacionado al ticket
      await ticket!.related("message").create({
        message: request.input('message'),
        ticketId: ticket!.id,
        userId: user.id
      })
      trx.commit()
    } catch (error) {
      trx.rollback()
      return response
      .status(500)
      .json({ message: "Error" });
    }
    return response
      .status(200)
      .json({ message: "Ok",
              newMessage: request.input('message')
            });
  }  
}
