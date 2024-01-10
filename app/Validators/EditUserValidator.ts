import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class EditUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({    
    //El email tiene que ser un texto, unico en la bbdd, recibirse una confirmación del usuario y tener formato de correo
    email: schema.string({},[
      rules.email(),
    ]),
    //La contraseña tendra una longitud minima de 4 caracteres y sera confirmada por el usuario
    name: schema.string(),
    surname: schema.string(),
    birthday: schema.date({
      format: 'yyyy-MM-dd',
    })
  })

  
  public messages = this.ctx.i18n.validatorMessages('validator.editUser')
}
