'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'birthdate', {
      type: Sequelize.DATEONLY,
      allowNull: false
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'birthdate', {
      type: Sequelize.DATE,
      allowNull: false
    })
  }
}
