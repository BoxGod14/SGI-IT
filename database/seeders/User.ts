import BaseSeeder from "@ioc:Adonis/Lucid/Seeder";
import Database from "@ioc:Adonis/Lucid/Database";
import User from "App/Models/User";
import Roles from "App/Enums/Roles";
import { DateTime } from "luxon";

export default class extends BaseSeeder {
  public async run() {
    const trx = await Database.transaction();
    try {
      const user = await User.create({
        username: "admin",
        email: "admin@email.local",
        password: "admin",
        roles: Roles.ADMIN,
      });
      user.related("profile").create({
        name: "Administrador",
        surname: "Super administrador",
        birthday: DateTime.fromObject({
          year: 2000,
          month: 12,
          day: 22})
      });
      trx.commit;
    } catch (error) {
      await trx.rollback();
    }
  }
}