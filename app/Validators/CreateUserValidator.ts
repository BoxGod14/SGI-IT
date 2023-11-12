import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Validador de creación de usuario
 */
export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    //El usuario tiene que ser un texto y unico en la bbdd
    username: schema.string({},[
      rules.unique({ table: 'users', column: 'username'}),
    ]),
    //El email tiene que ser un texto, unico en la bbdd, recibirse una confirmación del usuario y tener formato de correo
    email: schema.string({},[
      rules.email(),
      rules.confirmed(),
      rules.unique({ table: 'users', column: 'email'}),
    ]),
    //La contraseña tendra una longitud minima de 4 caracteres y sera confirmada por el usuario
    password: schema.string([
      rules.confirmed(),
      rules.minLength(4)
    ])
  })

  public messages: CustomMessages = {}
}
