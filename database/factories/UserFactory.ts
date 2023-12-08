import User from 'App/Models/User'
import Factory from '@ioc:Adonis/Lucid/Factory'
import Roles from 'App/Enums/Roles'
import TicketFactory from './TicketFactory'
import ProfileFactory from './ProfileFactory'

export default Factory.define(User, ({ faker }) => {
  return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      roles: Roles.REQUESTER,
  }
})
.relation('tickets', () => TicketFactory)
.relation('profile', () => ProfileFactory)
.build()
