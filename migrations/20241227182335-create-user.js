'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: false
      },
      birthdate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      account: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user'
      },
      profilePic: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cover: {
        type: Sequelize.STRING,
        allowNull: true
      },
      introduction: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users')
  }
}
