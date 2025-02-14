'use strict'

const db = require('../models')
const User = db.User

const { faker } = require('@faker-js/faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await User.findAll({ where: { role: 'user' } })

    await queryInterface.bulkInsert('Posts',
      Array.from({ length: 50 }).map((_, i) => ({
        userId: users[i % users.length].id,
        content: faker.lorem.text(),
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Posts', null, {
      where: {},
      truncate: true
    })
  }
}
