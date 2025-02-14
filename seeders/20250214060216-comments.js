'use strict'

const db = require('../models')
const User = db.User
const Post = db.Post
const { faker } = require('@faker-js/faker')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = await User.findAll({ where: { role: 'user' } })
    const posts = await Post.findAll()

    // Ensure there are users and posts before inserting comments
    if (!users.length || !posts.length) {
      console.error('No users or posts found, skipping comment seeding...')
      return
    }

    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 150 }).map((_, i) => {
        const userIndex = i % users.length
        const postIndex = i % posts.length

        return {
          userId: users[userIndex].id,
          postId: posts[postIndex].id,
          content: faker.lorem.text().substring(0, 50),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Comments', null, {
      where: {},
      truncate: true
    })
  }
}
