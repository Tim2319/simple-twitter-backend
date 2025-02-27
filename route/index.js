const express = require('express')
const router = express.Router()
const users = require('./modules/users')
const posts = require('./modules/posts')
const admins = require('./modules/admin')
const rooms = require('./modules/rooms')

const { authenticated, authenticatedAdmin } = require('../middleware/auth')

// 總體路由
router.use('/users', users)
router.use('/posts', authenticated, posts)
router.use('/admin', authenticated, authenticatedAdmin, admins)
router.use('/rooms', authenticated, rooms)

module.exports = router
