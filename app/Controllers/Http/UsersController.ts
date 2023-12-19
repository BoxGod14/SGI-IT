import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Roles from "App/Enums/Roles";
import Profile from "App/Models/Profile";
import User from "App/Models/User";

export default class UsersController {
  public async index({}: HttpContextContract) {
    const user = await User.all();
    return user;
  }

  public async show({ params, view, response, auth }: HttpContextContract) {
    let userShow: User;
    //Intentar obtener usuario y comprobar si podemos visualizarlo
    const user = await auth.use("web").authenticate();
    try {
      userShow = await User.findByOrFail("id", params.id);
      await userShow.load('profile');
      await userShow.load('tickets' ,(tickets) => {
        tickets.where('role', Roles.REQUESTER)
      })
      if (user != userShow && user.roles == Roles.REQUESTER) {
        throw new Error();        
      }
    } catch (error) {
      //Si da error, sin importar cual sea, se redirigira a mostrar su propio usuario
      response.status(403).redirect().toRoute("UsersController.show", [user.id]);
    }
    view.share({
      user: userShow!,
    });
    const html = view.render("user/show.edge", userShow!);
    return html;
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
      profile!.name = request.input("name");
      profile!.surname = request.input("surname");
      profile!.birthday = request.input("birthday");
      profile!.save();
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
  
  /**
   * Funcion AJAX para obtener los usuarios segun su rol
   */
  public async getUsers({ auth, request, response }) {
    //Obtener usuario y comprobar su rol
    const user = await auth.use("web").authenticate();
    if (user.roles == Roles.REQUESTER) {
      return response.status(403).json({ message: "Error al obtener usuario" });
    }
    //Comprobar si ha llegado el tipo de rol a buscar y sea Requester o Technician
    const searchRole = request.input('role');
    if (searchRole != Roles.REQUESTER && searchRole != Roles.TECHNICIAN) {
      return response.status(404).json({ message: "Error al obtener usuario" });
    }
    //Si ha superado ambos filtros significa que se puede realizar la busqueda.
    const name = '%'+request.input('name')+'%';
    const usersFind = await Profile
      .query()
      .whereRaw("name like ?",[name])//Se emplea whereRaw en vez de whereLike para evitar el fallo de COLLATE incorrecto.
      .preload('user', (userquery) => {
        userquery.where('roles',searchRole)
      })
    return response.status(200).json(usersFind);    
  }
}
