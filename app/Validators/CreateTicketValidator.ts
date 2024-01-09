import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateTicketValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    subject: schema.string({}, [
      rules.maxLength(255),
      rules.minLength(4),
    ]),
    description: schema.string({}, [
      rules.minLength(4),
    ]),
  })

  public messages = this.ctx.i18n.validatorMessages('validator.createTicket')
  
}