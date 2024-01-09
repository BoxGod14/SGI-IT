import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class ChangePasswordValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    
    //La contraseña tendra una longitud minima de 4 caracteres y sera confirmada por el usuario
    password: schema.string([
      rules.confirmed(),
      rules.minLength(4)
    ])
  })

  public messages = this.ctx.i18n.validatorMessages('validator.changePassword')

}
