const express = require('express')
const router = express.Router()
const users = require('./modules/users')
const posts = require('./modules/posts')
const admins = require('./modules/admin')

// 總體路由
router.use('/users', users)
router.use('/posts', posts)
router.use('/admin', admins)

module.exports = router
