const db = require('../models')
const { User, FollowShip } = db

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

      if (Number(followingId) === followerId) {
        return res.status(403).json({
          status: 'error',
          message: 'You cannot follow yourself.'
        })
      }

      const existingFollowShip = await FollowShip.findOne({
        where: {
          followingId,
          followerId
        }
      })

      if (existingFollowShip) {
        return res.status(400).json({
          status: 'error',
          message: `already followed @${followingUser.account}`
        })
      }

      await FollowShip.create({
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

      if (Number(followingId) === followerId) {
        return res.status(403).json({
          status: 'error',
          message: 'You cannot unfollow yourself.'
        })
      }

      const existingFollowShip = await FollowShip.findOne({
        where: {
          followingId,
          followerId
        }
      })

      if (!existingFollowShip) {
        return res.status(400).json({
          status: 'error',
          message: 'You are not following this user'
        })
      }

      await existingFollowShip.destroy()

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
