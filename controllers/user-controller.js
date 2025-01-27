const bcrypt = require('bcryptjs')
const db = require('../models')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const DEFAULT_PROFILE_PIC = require('../image/profilePic.png')
const DEFAULT_COVER = require('../image/cover.png')

const { User, Post } = db
const { checkUserInfo, getUserInfoId } = require('../utils/userValidation')

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
        postCount: user.Post.length,
        followerCount: user.Followers.length,
        followingCount: user.Followings.length,
        isFollowed: followings.includes(user.id)
      }

      res.status(200).json(user)
    } catch (error) {
      next(error)
    }
  },
  editUser: async (req, res, next) => {
    const userId = req.user.id
    const id = req.params.id
    const { name, introduction, page } = req.body

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
      const { file } = req
      const acceptedType = ['.png', '.jpg', '.jpeg']

      if (name && !validator.isByteLength(name, { min: 1, max: 50 })) {
        errors.push({ message: 'Name can not be longer than 50 characters.' })
      }

      if (introduction && !validator.isByteLength(introduction, { min: 0, max: 160 })) {
        errors.push({ message: 'Introduction can not be longer than 160 characters.' })
      }

      if (file) {
        if (file.profilePic) {
          const fileType = file.profilePic[0].originalname.substring(file.profilePic[0].originalname.lastIndexOf('.')).toLowerCase()
          if (!acceptedType.includes(fileType)) {
            errors.push({
              message: 'Profile picture type is not accepted. Please upload an image ending with png, jpg, or jpeg.'
            })
          }
        }
        if (file.cover) {
          const fileType = file.cover[0].originalname.substring(file.cover[0].originalname.lastIndexOf('.')).toLowerCase()
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
        profilePic: file && file.profilePic ? `/uploads/${file.profilePic[0].filename}` : user.profilePic,
        cover: file ? `/uploads/${file.cover[0].filename}` : user.cover
      })
      return res.status(200).json({
        status: 'success',
        message: 'User profile has been successfully updated.'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = userController
