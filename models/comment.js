'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Comment.belongsTo(models.User)
      Comment.belongsTo(models.Post)
    }
  }
  Comment.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
    media: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Comment',
    tableName: 'Comments',
    timestamps: true
  })
  return Comment
}
