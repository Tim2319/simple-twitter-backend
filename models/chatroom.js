'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      ChatRoom.hasMany(models.JoinRoom)
      ChatRoom.hasMany(models.Message)
    }
  }
  ChatRoom.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isGroup: {
      type: DataTypes.BOOLEAN
    }
  }, {
    sequelize,
    modelName: 'ChatRoom',
    tableName: 'ChatRooms',
    timestamps: true
  })
  return ChatRoom
}
