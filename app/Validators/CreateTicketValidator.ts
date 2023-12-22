import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
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

  public messages: CustomMessages = {
    'subject.maxLength': 'El asunto no puede tener más de 255 caracteres.',
    'subject.minLength': 'El asunto debe tener al menos 4 caracteres.',
    'description.minLength': 'La descripción debe tener al menos 4 caracteres.',
  }
}