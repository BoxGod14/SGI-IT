import Profile from 'App/Models/Profile'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { DateTime } from 'luxon'

export default Factory.define(Profile, ({ faker }) => {
  return {
    name: faker.person.firstName(undefined),
    surname: faker.person.lastName(undefined),
    birthday: DateTime.fromObject({
      year: 1889,
      month: 4,
      day: 20
    }).toISODate(), // Formatea la fecha como cadena en formato ISO
    picture: 'profilePictures/default.jpg',
    jobPosition: faker.person.jobTitle(),
    phoneNumber: faker.phone.number()
  }
}).build()