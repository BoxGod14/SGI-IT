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
    //La contraseña tendra una longitud minima de 4 caracteres y sera confirmada por el usuariximopedra@gmail.como
    password: schema.string([
      rules.confirmed(),
      rules.minLength(4)
    ]),
    name: schema.string(),
    surname: schema.string(),
    birthday: schema.date({
      format: 'yyyy-MM-dd',
    })
  })

  public messages: CustomMessages = {
    'username.required': 'El campo de usuario es obligatorio.',
    'username.unique': 'El usuario no esta disponible. Por favor, elige otro.',
    'email.required': 'El campo de correo electrónico es obligatorio.',
    'email.email': 'Por favor, introduce una dirección de correo electrónico válida.',
    'email.unique': 'Este correo electrónico no esta disponible. Utiliza otro.',
    'email.confirmed': 'La confirmación de correo electrónico no coincide.',
    'password.required': 'El campo de contraseña es obligatorio.',
    'password.minLength': 'La contraseña debe tener al menos 4 caracteres.',
    'password.confirmed': 'La confirmación de contraseña no coincide.',
    'name.required': 'El campo de nombre es obligatorio.',
    'surname.required': 'El campo de apellido es obligatorio.',
    'birthday.required': 'El campo de fecha de nacimiento es obligatorio.',
    'birthday.date': 'Por favor, introduce una fecha de nacimiento válida.',
  }
}
