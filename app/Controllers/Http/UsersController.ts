import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Roles from "App/Enums/Roles";
import User from "App/Models/User";

export default class UsersController {
  public async index({}: HttpContextContract) {
    const user = await User.all();
    return user;
  }

  public async show({ params }: HttpContextContract) {
    const user = await User.findByOrFail("id", params.id);
    return "mostrar info del usuario " + user.username;
  }

  public async edit({ view, params, auth, response }: HttpContextContract) {
    const user = await auth.use("web").authenticate();
    //Si no eres admin o el usuario en cuestion, seras redirigido a tu edit.
    if (user.roles != Roles.ADMIN && user.id != params.id) {
      response.redirect().toRoute("UsersController.edit", [user.id]);
    }
    //Obtener datos del usuario que se va a editar y obtencion/generacion del token necesario para la API
    const userEdit = await User.findByOrFail("id", params.id);
    const profile = await userEdit.related("profile").query().first();
    view.share({
      user: userEdit,
      profile: profile,
      roles: Roles,
    });
    const html = view.render("user/edit.edge");
    return html;
  }

  public async update({ auth, request, response }: HttpContextContract) {
    //Obtener usuario mediante token
    const user = await auth.use("web").authenticate();
    //Comprobar si eres admin o el mismo usuario a editar
    if (user.roles != Roles.ADMIN && user.id != request.input("userId")) {
      return response.status(403).json({ message: "Error al editar usuario" });
    }
    const trx = await Database.transaction();
    try {
      const userEdit = await User.findByOrFail("id", request.input("userId"));
      const profile = await userEdit.related("profile").query().first();
      userEdit.username = request.input("username");
      userEdit.email = request.input("email");
      //Solo puede cambiar roles un admin
      if (user.roles == Roles.ADMIN) {
        userEdit.roles = request.input("roles");
      }
      //*Aunque profile figure con error en rojo, es solo un aviso de que puede estar nulo, salvo casos muy raros jamas estara vacio
      profile.name = request.input("name");
      profile.surname = request.input("surname");
      profile.birthday = request.input("birthday");
      profile.save();
      userEdit.save();
      trx.commit();
    } catch (error) {
      trx.rollback();
      return response.status(404).json({ message: "Usuario no encontrado" });
    }

    return response
      .status(200)
      .json({ message: "Usuario editado exitosamente" });
  }

  public async destroy({}: HttpContextContract) {}
}
