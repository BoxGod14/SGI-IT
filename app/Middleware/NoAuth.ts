import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
/**
 * Middleware para segurar que no este logueado
 */
export default class NoAuth {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    // comprueba si el usuario está logueado usando el guardia por defecto
    if (await auth.check()) {
      // si está logueado, redirige a otra página (por ejemplo, el dashboard)
      return response.redirect('/')
    }
    await next()
  }
}
