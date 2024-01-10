import Application from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import Roles from "App/Enums/Roles";
import State from "App/Enums/State";
import User from "App/Models/User";
import EditUserValidator from 'App/Validators/EditUserValidator';
import { DateTime } from 'luxon';

export default class UsersController {
  public async index({ view, request, response, auth }: HttpContextContract) {
    const user = await auth.use("web").authenticate();
    //En caso de ser solicitante se redirige automaticamente a la pagina de su usuario.
    if (user.roles != Roles.ADMIN) {
      response.redirect().toRoute("UsersController.show", [user.id]);
      return;
    }
    const userQuery = User.query();
    const searchRole = request.input('role', '*')
    const page = request.input('page', 1)//Pagina de la paginacion
    const limit = 10; //Limite de usuarios por pagina

    if (Object.values(Roles).includes(searchRole)) {
      userQuery.where('roles', searchRole);
    }
    const users = await userQuery
        .preload('profile')
        .paginate(page, limit);
    users.baseUrl('/users');
    const html = await view.render("user/index", { users, Roles, currentPath: request.url(), searchRole });
    return html;
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
        }).orderBy('created_at', 'desc')
      })    
      //En caso ser un solicitante y no el mismo usuario se lanza error.
      if (user.id != userShow.id && user.roles != Roles.ADMIN) {
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

  public async update({ auth, request, response }: HttpContextContract) {    
    //Obtener usuario mediante token
    const user = await auth.use("web").authenticate();
    //Comprobar si eres admin o el mismo usuario a editar
    if (user.roles != Roles.ADMIN && user.id != request.input("userId")) {
      return response.status(403);
    }
    
    const trx = await Database.transaction();
    
    try {      
      await request.validate(EditUserValidator)
      const userEdit = await User.findOrFail(request.input("userId"));
      console.log('a')
      const profile = await userEdit.related("profile").query().first();
      //Comprobar si el nombre es el mismo que tiene ahora
      console.log('a')
      if (userEdit.username != request.input("username")) {
        //No coincide, buscar si pertenece a alguien
        console.log('a')
        const checkUser = await User.findBy('username', request.input("username"))
        if (checkUser) {
          return response.status(400)
        }
      }
      
      //Comprobar si el mail es el mismo que tiene ahora
      if (userEdit.email != request.input("email")) {
        //No coincide, buscar si pertenece a alguien
        const checkUser = await User.findBy('email', request.input("email"))
        if (checkUser) {
          return response.status(400)
        }
      }

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
      userEdit.save();
      const picture = request.file('picture');
      if (picture) {
        console.log('fotosubida')
        const currentDate = DateTime.local().toFormat('dd-MM-yyyy');
        const fileName = `${user.id}-${currentDate}.${picture.extname}`;
        await picture.move(Application.publicPath('profilePictures'), {
          name: fileName,
        })
        profile!.picture = `profilePictures/${fileName}`;  
      }
      profile!.save();
      trx.commit();
    } catch (error) {
      trx.rollback();
      return response.status(400).json({ message: error.messages[Object.keys(error.messages)[0]][0] });
    }

    return response.status(200);
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
      'SELECT users.id, profiles.name, profiles.surname FROM users INNER JOIN profiles on users.id = profiles.user_id where roles = :role AND profiles.name like :name',
      {
        role: searchRole,
        name: name
      }
    )
    //Se le devuelve la primera posicion ya que ahi es donde estan los datos
    return response.status(200).json(usersFind[0]);    
  }
}
