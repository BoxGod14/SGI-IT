// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Api_Token from "App/Models/Api_Token";
import User from "App/Models/User";
import { DateTime } from "luxon";

export default class ApiTokensController {
    
    /**
     * @returns True ha caducado, False no ha caducado
     * @param user 
     */
    public static async checkExpiration(user: User) {
        const token = await Api_Token.findByOrFail('userId', user.id);
        if (token.expiresAt > DateTime.local()) {
            token.delete()
        }
    }
}
