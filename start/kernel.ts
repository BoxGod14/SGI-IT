/*
|--------------------------------------------------------------------------
| Application middleware
|--------------------------------------------------------------------------
|
| This file is used to define middleware for HTTP requests. You can register
| middleware as a `closure` or an IoC container binding. The bindings are
| preferred, since they keep this file clean.
|
*/

import Server from '@ioc:Adonis/Core/Server'

/*
|--------------------------------------------------------------------------
| Global middleware
|--------------------------------------------------------------------------
|
| An array of global middleware, that will be executed in the order they
| are defined for every HTTP requests.
|
*/
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  //Importar SilentAuth permite transportar la sesión en la request.
  () => import('App/Middleware/SilentAuth'),
  //Proteccion CSRF y otros
  () => import('@ioc:Adonis/Addons/Shield'),
  //Internacionalizacion
  () => import('App/Middleware/DetectUserLocale')
])

/*
|--------------------------------------------------------------------------
| Named middleware
|--------------------------------------------------------------------------
|
| Named middleware are defined as key-value pair. The value is the namespace
| or middleware function and key is the alias. Later you can use these
| alias on individual routes. For example:
|
| { auth: () => import('App/Middleware/Auth') }
|
| and then use it as follows
|
| Route.get('dashboard', 'UserController.dashboard').middleware('auth')
|
*/
Server.middleware.registerNamed({
  //Middleware para estar logueado
  auth: () => import('App/Middleware/Auth'),
  //Middleware para los no logueado
  noAuth: () => import('App/Middleware/NoAuth')
})
