const express = require('express')
const router = express.Router()
const users = require('./modules/users')
const posts = require('./modules/posts')
const admins = require('./modules/admin')

const { authenticated, authenticatedAdmin } = require('../middleware/auth')

// 總體路由
router.use('/users', authenticated, users)
router.use('/posts', authenticated, posts)
router.use('/admin', authenticated, authenticatedAdmin, admins)

module.exports = router
