import Ticket from 'App/Models/Ticket'
import Factory from '@ioc:Adonis/Lucid/Factory'
import State from 'App/Enums/State'

export default Factory.define(Ticket, ({ faker }) => {
  return {
    subject: faker.lorem.sentence(),
    description: faker.lorem.paragraphs(2),
    state: State.OPEN,
  }
}).build()
