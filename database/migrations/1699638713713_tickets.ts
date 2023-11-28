import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import State from "App/Enums/State";

export default class extends BaseSchema {
  protected tableName = "tickets";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();

      table.string("subject", 255).notNullable(); //Asunto del ticket, limitado a 255 caracteres (limitación general de correos electronicos)
      table.string("description").notNullable(); //Descripcion del ticket
      table
        .enum("state", Object.values(State))
        .defaultTo(State.OPEN)
        .notNullable(); //Roles del usuario, toman referencia al enumerado State.ts

      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
