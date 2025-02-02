'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class JoinRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      JoinRoom.belongsTo(models.User)
      JoinRoom.belongsTo(models.ChatRoom)
    }
  }
  JoinRoom.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'JoinRoom',
    tableName: 'JoinRooms',
    timestamps: true
  })
  return JoinRoom
}
