const bcrypt = require('bcryptjs')
const db = require('../models')
const { User } = db

const userController = {
  registerUser: async (req, res, next) => {
    try {
      const { email, password } = req.body

      // Validate input fields
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
      }

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      await User.create({ email, password: hashedPassword })
      return res.status(201).json({ message: 'User created successfully' })
    } catch (error) {
      // Pass to error handler middleware
      next(error)
    }
  },
  loginUser: async (req, res, next) => {
    try {
      const { email, password } = req.body

      // Validate input fields
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
      }

      // Find user
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      // Simulate session or token
      return res.status(200).json({ message: 'User logged in successfully' })
    } catch (error) {
      // Pass to error handler middleware
      next(error)
    }
  }
}

module.exports = userController
