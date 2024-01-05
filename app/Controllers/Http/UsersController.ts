import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Roles from "App/Enums/Roles";
import State from "App/Enums/State";
import User from "App/Models/User";

export default class UsersController {
  public async index({}: HttpContextContract) {
    const user = await User.all();
    return user;
  }

  public async show({ params, view, response, auth, request }: HttpContextContract) {
    let userShow: User;
    //Intentar obtener usuario y comprobar si podemos visualizarlo
    const user = await auth.use("web").authenticate();
    try {
      //Comprobar que existe el usuario
      userShow = await User.findOrFail(params.id);
      await userShow.load('profile');
      await userShow.load('tickets' ,(tickets) => {
        tickets.preload('User', (userQuery) => {
          userQuery.pivotColumns(["role"]).preload("profile");
        })
      })    

      if (user.id != userShow.id && user.roles == Roles.REQUESTER) {
        throw new Error();        
      }
    } catch (error) {
      //Si da error, sin importar cual sea, se redirigira a mostrar su propio usuario
      response.redirect().toRoute("UsersController.show", [user.id]);
      return;
    }
    view.share({
      user: userShow!,
      Roles: Roles,
      State: State,
      currentPath: request.url()
    });
    const html = view.render("user/show.edge");
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
      if (user.roles == Roles.ADMIN && request.input("roles") in Roles) {
        userEdit.roles = request.input("roles");
      }
      //*Aunque profile figure con error en rojo, es solo un aviso de que puede estar nulo, salvo casos muy raros jamas estara vacio
      profile!.name = request.input("name");
      profile!.surname = request.input("surname");
      profile!.birthday = request.input("birthday");
      profile!.phoneNumber = request.input("phoneNumber");
      profile!.jobPosition = request.input("jobPosition");
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
   
    //El generador de consultas por defecto fuerza el uso de outer join, por lo que si solo se quiere mostrar un dato que todo el where coincida con varias tablas, se necesita hacerla raw.
    const usersFind = await Database.rawQuery(
      'SELECT users.id, profiles.name FROM users INNER JOIN profiles on users.id = profiles.user_id where roles = :role AND profiles.name like :name',
      {
        role: searchRole,
        name: name
      }
    )
    //Se le devuelve la primera posicion ya que ahi es donde estan los datos
    return response.status(200).json(usersFind[0]);    
  }
}
