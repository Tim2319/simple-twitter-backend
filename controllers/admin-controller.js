const db = require('../models')
const { User, Post, Like } = db
const Sequelize = require('sequelize')

const adminController = {
  getUsers: async (req, res, next) => {
    try {
      let users = await User.findAll({
        where: {
          role: 'user'
        },
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          { model: Post, include: [Like] }
        ],
        attributes: [
          'id',
          'name',
          'account',
          'profilePic',
          'cover',
          [
            Sequelize.fn('COUNT', Sequelize.col('Posts.id')),
            'postCount'
          ],
          [
            Sequelize.fn('COUNT', Sequelize.col('Posts->Likes.id')),
            'likeCount'
          ]
        ],
        order: [[Sequelize.literal('postCount'), 'DESC']]
      })

      // Clean up data
      users = users.map(user => {
        return {
          id: user.id,
          name: user.name,
          account: user.account,
          profilePic: user.profilePic,
          cover: user.cover,
          postCount: user.postCount,
          likeCount: user.likeCount,
          followersCount: user.Followers.length,
          followingsCount: user.Followings.length
        }
      })
      res.status(200).json(users)
    } catch (err) {
      next(err)
    }
  },
  deleteUsers: async (req, res, next) => {
    try {
      const post = await Post.findByPk(req.params.id)

      if (!post) {
        return res.status(404).json({ status: 'error', message: 'Post not found' })
      }

      await post.destroy()
      res.status(200).json({ status: 'success', message: 'Post deleted successfully' })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = adminController
