import BaseSchema from "@ioc:Adonis/Lucid/Schema";
import Roles from "App/Enums/Roles";

export default class extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id").primary();
      table.string("username", 50).unique().notNullable();
      table.string("email", 255).notNullable().unique();
      table.string("password", 180).notNullable();
      table.string("remember_me_token").nullable();
      table
        .enum("roles", Object.values(Roles))
        .defaultTo(Roles.REQUESTER)
        .notNullable(); //Roles del usuario, toman referencia al enumerado Roles.ts
      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true }).notNullable();
      table.timestamp("updated_at", { useTz: true }).notNullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
