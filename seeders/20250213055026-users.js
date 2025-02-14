'use strict'

const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')
const DEFAULT_PROFILE_PIC = '/image/profilePic.png'
const DEFAULT_COVER = '/image/cover.png'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users',
      [
        {
          name: 'root',
          email: 'root@example.com',
          password: bcrypt.hashSync('123456789', bcrypt.genSaltSync(10), null),
          gender: 'male',
          birthdate: '1992-02-13',
          role: 'admin',
          account: 'admin',
          profilePic: DEFAULT_PROFILE_PIC,
          cover: DEFAULT_COVER,
          introduction: faker.lorem.text().substring(0, 50),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'user1',
          email: 'user1@example.com',
          password: bcrypt.hashSync('123456789', bcrypt.genSaltSync(10), null),
          gender: 'female',
          birthdate: '2000-08-31',
          role: 'user',
          account: 'user1',
          profilePic: DEFAULT_PROFILE_PIC,
          cover: DEFAULT_COVER,
          introduction: faker.lorem.text().substring(0, 50),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'user2',
          email: 'user2@example.com',
          password: bcrypt.hashSync('123456789', bcrypt.genSaltSync(10), null),
          gender: 'male',
          birthdate: '1990-05-05',
          role: 'user',
          account: 'user2',
          profilePic: DEFAULT_PROFILE_PIC,
          cover: DEFAULT_COVER,
          introduction: faker.lorem.text().substring(0, 50),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'user3',
          email: 'user3@example.com',
          password: bcrypt.hashSync('123456789', bcrypt.genSaltSync(10), null),
          gender: 'female',
          birthdate: '1996-04-15',
          role: 'user',
          account: 'user3',
          profilePic: DEFAULT_PROFILE_PIC,
          cover: DEFAULT_COVER,
          introduction: faker.lorem.text().substring(0, 50),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'user4',
          email: 'user4@example.com',
          password: bcrypt.hashSync('123456789', bcrypt.genSaltSync(10), null),
          gender: 'female',
          birthdate: '1999-12-05',
          role: 'user',
          account: 'user4',
          profilePic: DEFAULT_PROFILE_PIC,
          cover: DEFAULT_COVER,
          introduction: faker.lorem.text().substring(0, 50),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'user5',
          email: 'user5@example.com',
          password: bcrypt.hashSync('123456789', bcrypt.genSaltSync(10), null),
          gender: 'male',
          birthdate: '1995-06-03',
          role: 'user',
          account: 'user5',
          profilePic: DEFAULT_PROFILE_PIC,
          cover: DEFAULT_COVER,
          introduction: faker.lorem.text().substring(0, 50),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {
      where: {},
      truncate: true
    })
  }
}
