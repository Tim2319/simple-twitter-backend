'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      Message.belongsTo(models.User)
      Message.belongsTo(models.ChatRoom)
    }
  }
  Message.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ChatRoomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ChatRooms',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Message',
    tableName: 'Messages',
    timestamps: true
  })
  return Message
}
