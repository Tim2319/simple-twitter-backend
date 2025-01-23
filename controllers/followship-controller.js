const db = require('../models')
const { User, Followship } = db

const followerController = {
  followUser: async (req, res, next) => {
    try {
      const followingId = req.params.id
      const followerId = req.user.id

      const followingUser = await User.findByPk(followingId)
      if (!followingUser || followingUser.role === 'admin') {
        return res.status(404).json({
          status: 'error',
          message: 'User not found or cannot follow admin'
        })
      }

      const existingFollowship = await Followship.findOne({
        where: {
          followingId,
          followerId
        }
      })

      if (existingFollowship) {
        return res.status(400).json({
          status: 'error',
          message: `already followed @${followingUser.account}`
        })
      }

      await Followship.create({
        followerId,
        followingId
      })

      return res.status(200).json({
        status: 'success',
        message: `followed @${followingUser.account}`,
        followingUser
      })
    } catch (err) {
      next(err)
    }
  },
  unfollowUser: async (req, res, next) => {
    try {
      const followingId = req.params.id
      const followerId = req.user.id

      const followingUser = await User.findByPk(followingId)
      if (!followingUser || followingUser.role === 'admin') {
        return res.status(404).json({
          status: 'error',
          message: 'User not found or cannot unfollow admin'
        })
      }

      const existingFollowship = await Followship.findOne({
        where: {
          followingId,
          followerId
        }
      })

      if (!existingFollowship) {
        return res.status(400).json({
          status: 'error',
          message: 'You are not following this user'
        })
      }

      await existingFollowship.destroy()

      return res.status(200).json({
        status: 'success',
        message: `Successfully unfollowed ${followingUser.account}`
      })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = followerController
