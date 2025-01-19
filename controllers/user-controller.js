const bcrypt = require('bcryptjs')
const db = require('../models')
const jwt = require('jsonwebtoken')

const { User, Post } = db
const { getUserInfoId } = require('../utils/userValidation')

const userController = {
  registerUser: async (req, res, next) => {
    try {
      const { email, password } = req.body

      // Validate input fields
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        })
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User already exists'
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      await User.create({ email, password: hashedPassword })
      return res.status(201).json({
        status: 'success',
        message: 'User created successfully'
      })
    } catch (error) {
      // Pass to error handler middleware
      next(error)
    }
  },
  loginUser: async (req, res, next) => {
    try {
      const { account, password } = req.body

      // Validate input fields
      if (!account || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'account and password are required'
        })
      }

      // Find user
      const user = await User.findOne({ where: { account } })
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        })
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        })
      }

      // Sign token
      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      return res.status(200).json({
        status: 'success',
        message: 'User logged in successfully',
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          account: user.account,
          avatar: user.avatar,
          introduction: user.introduction,
          cover: user.cover,
          role: user.role
        }
      })
    } catch (error) {
      // Pass to error handler middleware
      next(error)
    }
  },
  getUser: async (req, res, next) => {
    try {
      let user = await User.findByPk(req.params.id, {
        include: [
          Post,
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })

      // User can not see profile of admin or user that doesn't exist
      if (!user || user.role === 'admin') {
        return res.status(404).json({
          status: 'error',
          message: 'user does not exist'
        })
      }

      // Clean up user data
      const followings = getUserInfoId(req, 'Followings')

      user = {
        id: user.id,
        name: user.name,
        email: user.email,
        account: user.account,
        profilePic: user.profilePic,
        introduction: user.introduction,
        cover: user.cover,
        role: user.role,
        postCount: user.Post.length,
        followerCount: user.Followers.length,
        followingCount: user.Followings.length,
        isFollowed: followings.includes(user.id)
      }

      res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  }
}
module.exports = userController
