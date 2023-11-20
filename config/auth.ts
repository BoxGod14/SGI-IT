/**
 * Config source: https://git.io/JY0mp
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import type { AuthConfig } from '@ioc:Adonis/Addons/Auth'

/*
|--------------------------------------------------------------------------
| Authentication Mapping
|--------------------------------------------------------------------------
|
| List of available authentication mapping. You must first define them
| inside the `contracts/auth.ts` file before mentioning them here.
|
*/
const authConfig: AuthConfig = {
  guard: 'web',
  guards: {
    web: {
      driver: 'session',
      provider: {
        driver: 'lucid',
        identifierKey: 'id',

       //Los uids son las columnas que junto al password permitiran iniciar sesión
       //En este caso se puede iniciar con usuario + psw o email + psw
        uids: ['username','email'],
        model: () => import('App/Models/User'),
      },
    },
    api: {
      driver: 'oat',
      provider: {
        driver: 'lucid',
        identifierKey: 'id',

       //Los uids son las columnas que junto al password permitiran iniciar sesión
       //En este caso se puede iniciar con usuario + psw o email + psw
        uids: ['username','email'],
        model: () => import('App/Models/User'),
      },
      tokenProvider: {
        type: 'api',
        driver: 'database',
        table: 'api_tokens',
        foreignKey: 'user_id',
      },
    },
  },
}

export default authConfig
