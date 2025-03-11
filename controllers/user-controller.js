const bcrypt = require('bcryptjs')
const db = require('../models')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const sequelize = require('sequelize')

const DEFAULT_PROFILE_PIC = '/image/profilePic.png'
const DEFAULT_COVER = '/image/cover.png'

const { User, Post, Comment, Like } = db
const { checkUserInfo, getUserInfoId, getFollowShipInfo, getResourceInfo } = require('../utils/userValidation')

const userController = {
  registerUser: async (req, res, next) => {
    try {
      const validator = await checkUserInfo(req)

      if (!validator) {
        await User.create({
          account: req.body.account,
          name: req.body.name,
          email: req.body.email,
          password: bcrypt.hashSync(
            req.body.password,
            bcrypt.genSaltSync(10),
            null
          ),
          role: 'user',
          profilePic: DEFAULT_PROFILE_PIC,
          cover: DEFAULT_COVER
        })

        return res.status(200).json({
          status: 'success',
          message: `${req.body.account} register successfully! Please login.`
        })
      }
      // All the required fields should be filled out correctly
      if (validator.errors) {
        return res.status(400).json({
          status: 'error',
          errors: validator.errors,
          userInput: req.body
        })
      }

      return res.status(400).json({
        status: 'error',
        message: 'A user already exists. Choose a different account or email.'
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
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          account: user.account,
          profilePic: user.profilePic,
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
        postCount: user.Posts.length,
        followerCount: user.Followers.length,
        followingCount: user.Followings.length,
        isFollowed: followings.includes(user.id)
      }

      res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  },
  getTopUsers: async (req, res, next) => {
    try {
      let users = await User.findAll({
        where: { role: 'user' },
        attributes: [
          'id',
          'name',
          'account',
          'profilePic',
          [
            sequelize.literal('(SELECT COUNT(*) FROM FollowShips WHERE FollowShips.followingId = User.id)'),
            'followersCount'
          ]
        ],
        include: [
          {
            model: User,
            as: 'Followers',
            attributes: [],
            through: { attributes: [] }
          }
        ],
        group: ['User.id'],
        order: [[sequelize.literal('followersCount'), 'DESC']],
        limit: 10
      })

      const followings = getUserInfoId(req, 'Followings') || []

      users = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        account: user.account,
        profilePic: user.profilePic,
        followerCount: user.dataValues.followersCount || 0,
        isFollowed: followings.includes(user.id)
      }))

      res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  },
  editUser: async (req, res, next) => {
    const userId = req.user.id
    const id = req.params.id
    const { name, introduction, page, gender, birthdate } = req.body

    // Users can only edit their own profile
    if (userId !== Number(id)) {
      return res
        .status(403)
        .json({ status: 'error', message: "You can not edit other's profile" })
    }

    // Find user
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }
    try {
      // Update settings
      if (page === 'settings') {
        const validationResult = await checkUserInfo(req)

        if (!validationResult) {
          await user.update({
            account: req.body.account,
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(
              req.body.password,
              bcrypt.genSaltSync(10),
              null
            )
          })

          return res.status(200).json({
            status: 'success',
            message: 'settings have been successfully updated.'
          })
        }
        // All the required fields should be filled out correctly
        if (validationResult.errors) {
          return res.status(422).json({
            status: 'error',
            errors: validationResult.errors,
            userInput: req.body
          })
        }
        return res.status(400).json({
          status: 'error',
          message: 'A user already exists. Choose a different account or email.'
        })
      }

      // Update profile
      const errors = []
      const { files } = req
      const acceptedType = ['.png', '.jpg', '.jpeg']

      if (name && !validator.isByteLength(name, { min: 1, max: 50 })) {
        errors.push({ message: 'Name can not be longer than 50 characters.' })
      }

      if (introduction && !validator.isByteLength(introduction, { min: 0, max: 160 })) {
        errors.push({ message: 'Introduction can not be longer than 160 characters.' })
      }

      if (files) {
        if (files.profilePic) {
          const fileType = files.profilePic[0].originalname.substring(files.profilePic[0].originalname.lastIndexOf('.')).toLowerCase()
          if (!acceptedType.includes(fileType)) {
            errors.push({
              message: 'Profile picture type is not accepted. Please upload an image ending with png, jpg, or jpeg.'
            })
          }
        }
        if (files.cover) {
          const fileType = files.cover[0].originalname.substring(files.cover[0].originalname.lastIndexOf('.')).toLowerCase()
          if (!acceptedType.includes(fileType)) {
            errors.push({
              message: 'Cover type is not accepted. Please upload an image ending with png, jpg, or jpeg.'
            })
          }
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          status: 'error',
          errors,
          userInput: req.body
        })
      }

      await user.update({
        name,
        introduction,
        gender,
        birthdate: birthdate || user.birthdate,
        profilePic: files && files.profilePic ? `/uploads/${files.profilePic[0].filename}` : user.profilePic,
        cover: files ? `/uploads/${files.cover[0].filename}` : user.cover
      })

      await user.reload()
      return res.status(200).json({
        status: 'success',
        message: 'User profile has been successfully updated.'
      })
    } catch (error) {
      next(error)
    }
  },
  getPosts: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [{
          model: Post,
          include: [Comment, Like]
        }],
        order: [[sequelize.literal('`Posts`.`createdAt`'), 'DESC']]
      })

      if (!user || user.role === 'admin') {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        })
      }

      // Clean up Post data
      const likes = getUserInfoId(req, 'LikedPosts')
      const posts = user.dataValues.Posts.map(post => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        likesCount: post.Likes.length,
        commentsCount: post.Comments.length,
        isLiked: likes.includes(post.id)
      }))
      res.status(200).json(posts)
    } catch (error) {
      next(error)
    }
  },
  getCommentsAndPosts: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [
          {
            model: Comment,
            include: [{ model: Post, include: [Like, Comment, User] }]
          }],
        order: [[sequelize.literal('`Comments`.`createdAt`'), 'DESC']]
      })

      if (!user || user.role === 'admin') {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        })
      }

      // Clean up data
      const likes = getUserInfoId(req, 'LikedPosts')
      const comments = getResourceInfo(user, 'Comments', likes)

      return res.status(200).json(comments)
    } catch (error) {
      next(error)
    }
  },
  getLikes: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [{
          model: Like,
          include: [{ model: Post, include: [User, Like, Comment] }]
        }],
        order: [[sequelize.literal('`Likes`.`createdAt`'), 'DESC']]
      })

      if (!user || user.role === 'admin') {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        })
      }
      // Clean up data
      const currentUserLikes = getUserInfoId(req, 'LikedPosts')
      const likes = getResourceInfo(user, 'Likes', currentUserLikes)

      return res.status(200).json(likes)
    } catch (error) {
      next(error)
    }
  },
  getFollowers: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [{ model: User, as: 'Followers' }],
        order: [[sequelize.literal('`Followers->FollowShip`.`createdAt`'), 'DESC']]
      })

      if (!user || user.role === 'admin') {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        })
      }

      // Clean up followers data
      const currentUserFollowings = getUserInfoId(req, 'Followers')
      const followers = getFollowShipInfo(user, 'Followers', currentUserFollowings)

      return res.status(200).json(followers)
    } catch (error) {
      next(error)
    }
  },
  getFollowings: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [{ model: User, as: 'Followings' }],
        order: [[sequelize.literal('`Followings->FollowShip`. `createdAt`'), 'DESC']]
      })

      if (!user || user.role === 'admin') {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        })
      }

      // Clean up followings data
      const currentUserFollowings = getUserInfoId(req, 'Followings')
      const followings = getFollowShipInfo(user, 'Followings', currentUserFollowings)

      return res.status(200).json(followings)
    } catch (error) {
      next(error)
    }
  },
  getCurrentUser: async (req, res) => {
    return res.status(200).json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      account: req.user.account,
      profilePic: req.user.profilePic,
      introduction: req.user.introduction,
      cover: req.user.cover,
      role: req.user.role
    })
  }
}

module.exports = userController
