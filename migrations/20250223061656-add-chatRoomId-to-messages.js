'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'ChatRoomId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'ChatRooms',
        key: 'id'
      },
      onDelete: 'CASCADE'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'ChatRoomId')
  }
}
