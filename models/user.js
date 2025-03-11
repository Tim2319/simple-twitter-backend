'use strict'
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate (models) {
      // define association here
      User.hasMany(models.Post, { foreignKey: 'userId' })
      User.hasMany(models.Like, { foreignKey: 'userId' })
      User.hasMany(models.Comment, { foreignKey: 'userId' })
      User.hasMany(models.Notification, { foreignKey: 'userId' })
      User.hasMany(models.JoinRoom, { foreignKey: 'userId' })
      User.hasMany(models.Message, { foreignKey: 'userId' })
      User.belongsToMany(models.Post, {
        through: models.Like,
        foreignKey: 'UserId',
        as: 'LikedPosts'
      })
      User.belongsToMany(models.Post, {
        through: models.Comment,
        foreignKey: 'UserId',
        as: 'CommentedPosts'
      })
      User.belongsToMany(models.User, {
        through: models.FollowShip,
        foreignKey: 'followingId',
        as: 'Followers'
      })
      User.belongsToMany(models.User, {
        through: models.FollowShip,
        foreignKey: 'followerId',
        as: 'Followings'
      })
      User.belongsToMany(models.ChatRoom, {
        through: models.JoinRoom,
        foreignKey: 'userId',
        as: 'JoinedRooms'
      })
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'not_set'
      },
      birthdate: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: new Date('1970-01-01')
      },
      account: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'user'
      },
      profilePic: {
        type: DataTypes.STRING,
        allowNull: true
      },
      cover: {
        type: DataTypes.STRING,
        allowNull: true
      },
      introduction: {
        type: DataTypes.STRING,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true
    }
  )

  return User
}
