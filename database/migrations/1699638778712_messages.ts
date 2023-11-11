import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table//Referencia al Id del usuario que ha escrito el mensaje
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .notNullable()
      table//Referencia al Id del ticket
      .integer('ticket_id')
      .unsigned()
      .references('ticket.id')
      .notNullable()
      table.string('message').notNullable()//El mensaje

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
