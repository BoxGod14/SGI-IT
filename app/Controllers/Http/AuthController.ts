import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";
import ChangePasswordValidator from "App/Validators/ChangePasswordValidator";
import CreateUserValidator from "App/Validators/CreateUserValidator";

export default class AuthController {
  public async registerForm({ response, auth, view }: HttpContextContract) {
    this.comprobarYRedirigirSiAutenticado(auth, response);
    //Comprobar si ya se habia iniciado sesión
    await auth.use("web").authenticate();
    if (auth.use("web").isLoggedIn) {
      //Si ya tenias sesión te vas a la pagina de inicio
      response.redirect("/");
    }
    //Devolver vista de login
    const html = await view.render("auth/register");
    return html;
  }

  public async register({
    request,
    response,
    auth,
    session,
  }: HttpContextContract) {
    this.comprobarYRedirigirSiAutenticado(auth, response);
    const user = new User();
    //Selecionar solo registros que necesito y guardar
    const userData = request.only(["username", "email", "password"]);
    const profileData = request.only(["name", "surname", "birthday"]);
    // Inicia una transacción de la base de datos
    const trx = await Database.transaction();
    try {
      //Validación de datos
      await request.validate(CreateUserValidator);

      //creacion de usuario
      user.merge(userData);
      await user.save();
      //Creación del perfil del usuario
      await user.related("profile").create(profileData);
      //Cerrar transacción exitosa
      trx.commit;
    } catch (error) {
      //Cancelar transacción
      await trx.rollback();
      //Enviar comentarios sobre error y datos del formulario
      session.flash(error);
      session.flash(userData);
      session.flash(profileData);
      response.redirect().back();
      return; //Si no se hace el return puede continuar el codigo
    }
    session.flash(
      "success",
      "Usuario " + user.username + " creado exitosamente"
    );
    response.redirect().toRoute("AuthController.loginForm");
    return user;
  }

  public async login({
    auth,
    request,
    response,
    session,
  }: HttpContextContract) {
    this.comprobarYRedirigirSiAutenticado(auth, response);
    const uuid = request.input("uuid");
    const password = request.input("password");
    const rememberMe = request.input("remember");
    try {
      //Intentar login
      await auth.use("web").attempt(uuid, password, rememberMe);

      response.redirect().toRoute("dashboard");
    } catch (error) {
      session.flash("errors", "Error");
      return response.redirect().back();
    }
  }

  public async loginForm({ auth, view, response }: HttpContextContract) {
    this.comprobarYRedirigirSiAutenticado(auth, response);
    //Devolver vista de login
    const html = await view.render("auth/login");
    return html;
  }

  public async logout({ auth, response }: HttpContextContract) {
    //Comprobar inicio de sesion
    await auth.use("web").authenticate();
    if (auth.use("web").isGuest) {
      //Si no tenias sesión te vas a la pagina de login
      response.redirect().toRoute("AuthController.loginForm");
    }
    //Cierre de sesión y redirección a pagina de login
    await auth.logout();
    response.redirect().toRoute("AuthController.loginForm");
  }

  private async comprobarYRedirigirSiAutenticado(auth, response) {
    //Comprobar si ya se habia iniciado sesión
    await auth.use("web").authenticate();
    if (auth.use("web").isLoggedIn) {
      //Si ya tenias sesión te vas a la pagina de inicio
      response.redirect("/");
    }
  }

  public async changepassword({ auth, response, request }: HttpContextContract) {
    //Por seguridad solo podras editar tu propio usuario
    const user = await auth.use("web").authenticate();
    const trx = await Database.transaction();    
    try {
      await request.validate(ChangePasswordValidator);
      user.password = request.input('password');
      await user.save();
      await trx.commit();
      response.status(200)
      return
    } catch (error) {
      await trx.rollback();
      //Se devuelve el primer valor de los errores en formato string
      response.status(400).json({ message: error.messages[Object.keys(error.messages)[0]][0] })
    }
    return;
  }
}
